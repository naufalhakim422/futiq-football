"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MatchCardData } from "./MatchCard";
import { Activity, Clock } from "lucide-react";

interface LiveTickerProps {
  matches?: MatchCardData[];
  className?: string;
}

export function LiveTicker({
  matches = [],
  className,
}: LiveTickerProps) {
  const isLiveState = (status?: string | number) => {
    if (!status) return false;
    const s = String(status);
    return s.includes("LIVE") || s === "HT" || s === "ET" || s === "PENALTY" || s === "1H" || s === "2H";
  };

  const activeLiveMatches = matches.filter((m) => isLiveState(m.status));
  const displayMatches = activeLiveMatches.length > 0 ? activeLiveMatches : matches;

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
            <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", activeLiveMatches.length > 0 ? "bg-brand-red" : "bg-brand-green")} />
            <span className={cn("relative inline-flex rounded-full h-2 w-2", activeLiveMatches.length > 0 ? "bg-brand-red" : "bg-brand-green")} />
          </span>
          <span>{activeLiveMatches.length > 0 ? `LIVE (${activeLiveMatches.length})` : "MATCHDAY LIVE"}</span>
        </div>

        {/* Scrolling or Static Match Strip */}
        <div className="flex items-center overflow-x-auto no-scrollbar whitespace-nowrap py-1 px-2 divide-x divide-pitch-800">
          {displayMatches.length === 0 ? (
            <div className="px-4 py-1 text-slate-400 font-sans text-xs flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>No live matches in play right now • Fixture schedules and standings up to date</span>
            </div>
          ) : (
            displayMatches.map((m) => {
              const isLive = isLiveState(m.status);
              const statusDisplay =
                m.status === "HT"
                  ? "HT"
                  : m.status === "FINISHED"
                  ? "FT"
                  : isLive
                  ? `${m.minute || 1}'`
                  : "Scheduled";

              return (
                <Link
                  key={m.id}
                  href={`/matches/${m.id}`}
                  className="px-3.5 py-1 flex items-center gap-2.5 hover:bg-pitch-900 transition-colors group cursor-pointer"
                >
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                    {m.competition.code || m.competition.name?.substring(0, 4)}
                  </span>

                  <div className="flex items-center gap-1.5 font-bold font-mono">
                    <span className="group-hover:text-[#c3ff00] transition-colors">
                      {m.homeTeam.tla || m.homeTeam.name?.substring(0, 3).toUpperCase()}
                    </span>
                    <span className={cn("px-1.5 py-0.2 rounded text-[11px]", isLive ? "bg-brand-red/20 text-brand-red font-black" : "bg-pitch-900 text-slate-300")}>
                      {m.homeScore ?? 0} - {m.awayScore ?? 0}
                    </span>
                    <span className="group-hover:text-[#c3ff00] transition-colors">
                      {m.awayTeam.tla || m.awayTeam.name?.substring(0, 3).toUpperCase()}
                    </span>
                  </div>

                  <span
                    className={cn(
                      "text-[10px] font-mono px-1 py-0.2 rounded font-bold",
                      isLive
                        ? "text-brand-red animate-pulse"
                        : "text-slate-500"
                    )}
                  >
                    {statusDisplay}
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
