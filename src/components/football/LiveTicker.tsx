"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MatchCardData } from "./MatchCard";

// Sample ticker matches for immediate hydration / fallback
const DEFAULT_TICKER_MATCHES: MatchCardData[] = [
  {
    id: "match_ars_che",
    competition: { name: "Premier League", code: "PL" },
    homeTeam: { name: "Arsenal FC", tla: "ARS" },
    awayTeam: { name: "Chelsea FC", tla: "CHE" },
    homeScore: 2,
    awayScore: 1,
    status: "LIVE_2H",
    minute: 76,
    matchDate: "Today",
  },
  {
    id: "match_mci_liv",
    competition: { name: "Premier League", code: "PL" },
    homeTeam: { name: "Manchester City", tla: "MCI" },
    awayTeam: { name: "Liverpool FC", tla: "LIV" },
    homeScore: 1,
    awayScore: 1,
    status: "HT",
    minute: 45,
    matchDate: "Today",
  },
  {
    id: "match_rma_bar",
    competition: { name: "La Liga", code: "LL" },
    homeTeam: { name: "Real Madrid", tla: "RMA" },
    awayTeam: { name: "Barcelona", tla: "BAR" },
    homeScore: 3,
    awayScore: 2,
    status: "FINISHED",
    matchDate: "FT",
  },
  {
    id: "match_ucl_bay_psg",
    competition: { name: "Champions League", code: "UCL" },
    homeTeam: { name: "Bayern Munich", tla: "BAY" },
    awayTeam: { name: "Paris SG", tla: "PSG" },
    homeScore: 0,
    awayScore: 0,
    status: "SCHEDULED",
    matchDate: "20:00",
  },
];

interface LiveTickerProps {
  matches?: MatchCardData[];
  className?: string;
}

export function LiveTicker({
  matches = DEFAULT_TICKER_MATCHES,
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
        <div className="flex items-center gap-2 px-3 py-2 bg-pitch-900 border-r border-pitch-800 shrink-0 font-bold uppercase tracking-wider text-[11px] text-slate-300 font-mono">
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

            const homeScore = m.homeScore ?? m.score?.home ?? 0;
            const awayScore = m.awayScore ?? m.score?.away ?? 0;

            return (
              <Link
                key={m.id}
                href={`/matches/${m.id}`}
                className="flex items-center gap-3 px-3 py-1 hover:bg-pitch-900 transition-colors shrink-0"
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                  {m.competition.code || m.competition.name}
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
                      : `${homeScore}-${awayScore}`}
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
