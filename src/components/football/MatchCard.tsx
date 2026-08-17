import React from "react";
import { MatchSummary } from "@/types/football";
import { TeamBadge } from "./TeamBadge";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface MatchCardProps {
  match: MatchSummary;
  className?: string;
}

export function MatchCard({ match, className }: MatchCardProps) {
  const isLive =
    match.status === "LIVE_1H" ||
    match.status === "LIVE_2H" ||
    match.status === "HT";
  const isFinished = match.status === "FINISHED";

  return (
    <Link
      href={`/matches/${match.id}`}
      className={cn(
        "group block bg-pitch-900 hover:bg-pitch-850 border border-pitch-800 hover:border-pitch-600 transition-all p-3.5",
        className
      )}
    >
      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2.5 pb-2 border-b border-pitch-800">
        <span className="uppercase tracking-wider">
          {match.competition.code || match.competition.name}
        </span>
        <div className="flex items-center gap-1.5">
          {isLive && (
            <span className="flex items-center gap-1 text-brand-green font-mono font-bold text-[10px] uppercase bg-brand-green/10 px-1.5 py-0.5 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-ping" />
              <span>{match.minute ? `${match.minute}'` : "LIVE"}</span>
            </span>
          )}
          {isFinished && (
            <span className="text-slate-400 font-mono text-[10px] uppercase">
              FT
            </span>
          )}
          {match.status === "SCHEDULED" && (
            <span className="text-slate-400 font-mono text-[10px]">
              {match.matchDate}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <TeamBadge
            name={match.homeTeam.name}
            tla={match.homeTeam.tla}
            size="sm"
          />
          <span
            className={cn(
              "font-mono font-bold text-sm",
              isLive ? "text-brand-green" : "text-slate-200"
            )}
          >
            {match.status === "SCHEDULED" ? "-" : match.score.home}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <TeamBadge
            name={match.awayTeam.name}
            tla={match.awayTeam.tla}
            size="sm"
          />
          <span
            className={cn(
              "font-mono font-bold text-sm",
              isLive ? "text-brand-green" : "text-slate-200"
            )}
          >
            {match.status === "SCHEDULED" ? "-" : match.score.away}
          </span>
        </div>
      </div>
    </Link>
  );
}
