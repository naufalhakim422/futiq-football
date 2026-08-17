"use client";

import React from "react";
import { MatchSummary } from "@/types/football";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Baseline sample data for Sprint 1 layout display
const SAMPLE_TICKER_MATCHES: MatchSummary[] = [
  {
    id: "m-1",
    competition: { id: "c-1", name: "Premier League", code: "PL", country: "ENG" },
    homeTeam: { id: "t-1", name: "Arsenal", shortName: "Arsenal", tla: "ARS" },
    awayTeam: { id: "t-2", name: "Chelsea", shortName: "Chelsea", tla: "CHE" },
    score: { home: 2, away: 1 },
    status: "LIVE_2H",
    minute: 74,
    matchDate: "Today",
  },
  {
    id: "m-2",
    competition: { id: "c-1", name: "Premier League", code: "PL", country: "ENG" },
    homeTeam: { id: "t-3", name: "Man City", shortName: "Man City", tla: "MCI" },
    awayTeam: { id: "t-4", name: "Liverpool", shortName: "Liverpool", tla: "LIV" },
    score: { home: 1, away: 1 },
    status: "HT",
    minute: 45,
    matchDate: "Today",
  },
  {
    id: "m-3",
    competition: { id: "c-2", name: "La Liga", code: "LL", country: "ESP" },
    homeTeam: { id: "t-5", name: "Real Madrid", shortName: "Real Madrid", tla: "RMA" },
    awayTeam: { id: "t-6", name: "Barcelona", shortName: "Barcelona", tla: "BAR" },
    score: { home: 3, away: 2 },
    status: "FINISHED",
    matchDate: "FT",
  },
  {
    id: "m-4",
    competition: { id: "c-3", name: "UEFA Champions League", code: "UCL", country: "EUR" },
    homeTeam: { id: "t-7", name: "Bayern Munich", shortName: "Bayern", tla: "BAY" },
    awayTeam: { id: "t-8", name: "Paris SG", shortName: "PSG", tla: "PSG" },
    score: { home: 0, away: 0 },
    status: "SCHEDULED",
    matchDate: "20:00",
  },
  {
    id: "m-5",
    competition: { id: "c-4", name: "Serie A", code: "SA", country: "ITA" },
    homeTeam: { id: "t-9", name: "Inter Milan", shortName: "Inter", tla: "INT" },
    awayTeam: { id: "t-10", name: "Juventus", shortName: "Juventus", tla: "JUV" },
    score: { home: 1, away: 0 },
    status: "LIVE_1H",
    minute: 31,
    matchDate: "Today",
  },
];

interface LiveTickerProps {
  matches?: MatchSummary[];
  className?: string;
}

export function LiveTicker({
  matches = SAMPLE_TICKER_MATCHES,
  className,
}: LiveTickerProps) {
  return (
    <div
      className={cn(
        "bg-pitch-950 border-b border-pitch-800 text-slate-200 text-xs overflow-hidden select-none",
        className
      )}
    >
      <div className="flex items-stretch">
        {/* Ticker Lead Badge */}
        <div className="flex items-center gap-2 px-3 py-2 bg-pitch-900 border-r border-pitch-800 shrink-0 font-bold uppercase tracking-wider text-[11px] text-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green" />
          </span>
          <span>MATCHDAY LIVE</span>
        </div>

        {/* Scrolling match items */}
        <div className="flex items-center overflow-x-auto no-scrollbar divide-x divide-pitch-850 py-1">
          {matches.map((m) => {
            const isLive =
              m.status === "LIVE_1H" ||
              m.status === "LIVE_2H" ||
              m.status === "HT";

            return (
              <Link
                key={m.id}
                href={`/matches/${m.id}`}
                className="flex items-center gap-3 px-3 py-1 hover:bg-pitch-900 transition-colors shrink-0"
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {m.competition.code}
                </span>

                <div className="flex items-center gap-2 font-medium">
                  <span className="font-semibold text-slate-200">
                    {m.homeTeam.tla}
                  </span>
                  <span
                    className={cn(
                      "font-mono font-bold px-1 py-0.5 rounded text-[11px]",
                      isLive
                        ? "bg-brand-green/15 text-brand-green"
                        : "text-slate-300"
                    )}
                  >
                    {m.status === "SCHEDULED"
                      ? "v"
                      : `${m.score.home}-${m.score.away}`}
                  </span>
                  <span className="font-semibold text-slate-200">
                    {m.awayTeam.tla}
                  </span>
                </div>

                <span
                  className={cn(
                    "text-[10px] font-mono",
                    isLive
                      ? "text-brand-green font-bold"
                      : "text-slate-400"
                  )}
                >
                  {isLive
                    ? m.status === "HT"
                      ? "HT"
                      : `${m.minute}'`
                    : m.matchDate}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
