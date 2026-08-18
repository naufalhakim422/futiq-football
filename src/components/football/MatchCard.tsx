import React from "react";
import { TeamBadge } from "./TeamBadge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { MatchStatus } from "@/lib/football/types";

export interface MatchCardData {
  id: string;
  competition: {
    name: string;
    code?: string;
  };
  homeTeam: {
    name: string;
    tla: string;
    logoUrl?: string;
  };
  awayTeam: {
    name: string;
    tla: string;
    logoUrl?: string;
  };
  status: MatchStatus | string;
  minute?: number;
  homeScore?: number;
  awayScore?: number;
  score?: { home: number; away: number };
  matchDate: string;
}

interface MatchCardProps {
  match: MatchCardData;
  className?: string;
}

export function MatchCard({ match, className }: MatchCardProps) {
  const isLive =
    match.status === "LIVE_1H" ||
    match.status === "LIVE_2H" ||
    match.status === "HT";
  const isFinished = match.status === "FINISHED";

  const homeScore = match.homeScore ?? match.score?.home ?? 0;
  const awayScore = match.awayScore ?? match.score?.away ?? 0;

  const formattedDate = match.matchDate.includes("T")
    ? new Date(match.matchDate).toLocaleDateString([], { month: "short", day: "numeric" })
    : match.matchDate;

  return (
    <Link
      href={`/matches/${match.id}`}
      className={cn(
        "group block bg-pitch-900 hover:bg-pitch-850 border border-pitch-800 hover:border-pitch-600 transition-all p-3.5",
        className
      )}
    >
      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2.5 pb-2 border-b border-pitch-800">
        <span className="uppercase tracking-wider font-mono font-bold text-slate-300 truncate max-w-[200px]" title={match.competition.name}>
          {match.competition.name || match.competition.code}
        </span>
        <div className="flex items-center gap-1.5">
          {isLive && (
            <span className="flex items-center gap-1 text-brand-green font-mono font-bold text-[10px] uppercase bg-brand-green/10 px-1.5 py-0.5 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-ping" />
              <span>{match.status === "HT" ? "HT" : match.minute ? `${match.minute}'` : "LIVE"}</span>
            </span>
          )}
          {isFinished && (
            <span className="text-slate-400 font-mono text-[10px] uppercase">
              FT
            </span>
          )}
          {match.status === "SCHEDULED" && (
            <span className="text-slate-400 font-mono text-[10px]">
              {formattedDate}
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
            {match.status === "SCHEDULED" ? "-" : homeScore}
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
            {match.status === "SCHEDULED" ? "-" : awayScore}
          </span>
        </div>
      </div>
    </Link>
  );
}
