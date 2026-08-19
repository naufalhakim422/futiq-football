"use client";

import { useState, useEffect, useRef } from "react";
import { ProviderMatchDetail } from "@/lib/football/types";
import { LiveMatch, DataFreshness } from "./types";

export function useLiveMatch(initialMatch: ProviderMatchDetail) {
  const [match, setMatch] = useState<ProviderMatchDetail>(initialMatch);
  const [freshness, setFreshness] = useState<DataFreshness>("FRESH");
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());
  const [secondsAgo, setSecondsAgo] = useState<number>(0);
  const [connectionState, setConnectionState] = useState<"CONNECTED" | "CONNECTING" | "FALLBACK" | "IDLE">("IDLE");

  const isLive =
    match.status === "LIVE_1H" ||
    match.status === "LIVE_2H" ||
    match.status === "HT" ||
    match.status === "ET" ||
    match.status === "PENALTY";

  const eventSourceRef = useRef<EventSource | null>(null);

  // 1. Seconds ago ticker for freshness indicator
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Math.floor((Date.now() - lastSyncTime) / 1000);
      setSecondsAgo(diff);

      if (diff > 90) {
        setFreshness("STALE");
      } else if (diff > 45) {
        setFreshness("DELAYED");
      } else {
        setFreshness("FRESH");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lastSyncTime]);

  // 2. Real-time Live Connection (SSE + Fallback Polling)
  useEffect(() => {
    if (!isLive) {
      setConnectionState("IDLE");
      return;
    }

    setConnectionState("CONNECTING");

    const setupSSE = () => {
      try {
        if (typeof window === "undefined" || !window.EventSource) {
          startFallbackPolling();
          return;
        }

        const url = `/api/football/live/stream?fixtureId=${encodeURIComponent(match.id)}`;
        const es = new EventSource(url);
        eventSourceRef.current = es;

        es.onopen = () => {
          setConnectionState("CONNECTED");
        };

        es.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload?.type === "MATCH_UPDATE" && payload.data) {
              const live: LiveMatch = payload.data;
              setLastSyncTime(Date.now());
              setFreshness(live.dataFreshness || "FRESH");

              setMatch((prev) => ({
                ...prev,
                status: live.status,
                minute: live.minute,
                homeScore: live.score.home.current,
                awayScore: live.score.away.current,
                htHomeScore: live.score.home.halftime,
                htAwayScore: live.score.away.halftime,
                etHomeScore: live.score.home.extraTime,
                etAwayScore: live.score.away.extraTime,
                penaltyHomeScore: live.score.home.penalty,
                penaltyAwayScore: live.score.away.penalty,
                events: live.events || prev.events,
                lineups: live.lineups || prev.lineups,
                stats: live.statistics || prev.stats,
              }));
            }
          } catch {
            // Ignored json parse error
          }
        };

        es.onerror = () => {
          es.close();
          eventSourceRef.current = null;
          startFallbackPolling();
        };
      } catch {
        startFallbackPolling();
      }
    };

    let pollingIntervalId: NodeJS.Timeout | null = null;

    const startFallbackPolling = () => {
      setConnectionState("FALLBACK");
      if (pollingIntervalId) return;

      pollingIntervalId = setInterval(async () => {
        try {
          const res = await fetch(`/api/football/fixtures/${encodeURIComponent(match.id)}`, {
            cache: "no-store",
          });
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              setMatch(json.data);
              setLastSyncTime(Date.now());
            }
          }
        } catch {
          // Ignored
        }
      }, 15000);
    };

    setupSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
      }
    };
  }, [isLive, match.id]);

  return {
    match,
    isLive,
    freshness,
    secondsAgo,
    connectionState,
  };
}
