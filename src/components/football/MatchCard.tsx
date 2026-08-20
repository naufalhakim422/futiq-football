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
  venue?: {
    name?: string;
    city?: string;
  };
}

interface MatchCardProps {
  match: MatchCardData;
  className?: string;
}

function formatCompetitionName(name: string, code?: string) {
  const n = (name || "").trim();
  const lower = n.toLowerCase();
  if (lower.includes("world cup")) return "🌍 World Cup Qualifiers";
  if (lower.includes("nations league")) return "🇪🇺 UEFA Nations League";
  if (lower.includes("asean")) return "🌏 AFF ASEAN Cup";
  if (lower.includes("champions league")) return "🇪🇺 Champions League";
  if (lower.includes("premier league")) return "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League";
  if (lower.includes("la liga")) return "🇪🇸 La Liga";
  if (lower.includes("serie a")) return "🇮🇹 Serie A";
  if (lower.includes("iii liga")) return "🇵🇱 III Liga";
  if (lower.includes("ligi kuu bara")) return "🇹🇿 Tanzania League";
  if (lower.includes("super league") && !lower.includes("premier")) return "🇺🇿 Uzbekistan Super League";
  if (lower.includes("premier soccer league")) return "🇿🇼 Zimbabwe Premier League";
  if (lower.includes("cup")) return `🏆 ${n}`;
  return `⚽ ${n}`;
}

export function MatchCard({ match, className }: MatchCardProps) {
  const isLive =
    match.status === MatchStatus.LIVE_1H ||
    match.status === MatchStatus.LIVE_2H ||
    match.status === MatchStatus.HT ||
    match.status === MatchStatus.ET ||
    match.status === MatchStatus.PENALTY ||
    match.status.toString().includes("LIVE") ||
    match.status === "HT";

  const isFinished = match.status === MatchStatus.FINISHED || match.status === "FINISHED";

  const homeScore = match.homeScore !== undefined ? match.homeScore : match.score?.home ?? 0;
  const awayScore = match.awayScore !== undefined ? match.awayScore : match.score?.away ?? 0;

  return (
    <Link
      href={`/matches/${match.id}`}
      className={cn(
        "block p-4 rounded-2xl bg-pitch-900 border border-pitch-800 hover:border-pitch-700 transition-all shadow-lg hover:shadow-xl font-sans group relative overflow-hidden",
        className
      )}
    >
      {/* Ambient Live Highlight */}
      {isLive && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-red via-brand-red to-transparent animate-pulse" />
      )}

      {/* Header: Competition & Status */}
      <div className="flex items-center justify-between pb-3 border-b border-pitch-800/80 text-xs">
        <span className="font-mono text-slate-400 text-[11px] truncate max-w-[200px] font-semibold">
          {formatCompetitionName(match.competition.name, match.competition.code)}
        </span>

        <div>
          {isLive && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-brand-red/20 text-brand-red border border-brand-red/30">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-ping" />
              <span>
                {match.status === "HT" || match.status === MatchStatus.HT
                  ? "HT"
                  : match.minute
                  ? `${match.minute}'`
                  : "LIVE"}
              </span>
            </span>
          )}
          {isFinished && (
            <span className="text-[10px] font-mono font-bold text-slate-400 bg-pitch-950 px-2 py-0.5 rounded border border-pitch-800">
              FT
            </span>
          )}
          {!isLive && !isFinished && (
            <span className="text-[10px] font-mono text-slate-400">
              {new Date(match.matchDate).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
      </div>

      {/* Main Match Info (Teams & Scores) */}
      <div className="py-3 space-y-2.5">
        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <TeamBadge name={match.homeTeam.name} tla={match.homeTeam.tla} size="sm" showName={false} />
            <span className="text-xs font-bold text-slate-200 truncate group-hover:text-[#c3ff00] transition-colors">
              {match.homeTeam.name}
            </span>
          </div>
          {(isLive || isFinished) && (
            <span className="font-mono font-black text-sm text-slate-100 px-2">
              {homeScore}
            </span>
          )}
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <TeamBadge name={match.awayTeam.name} tla={match.awayTeam.tla} size="sm" showName={false} />
            <span className="text-xs font-bold text-slate-200 truncate group-hover:text-[#c3ff00] transition-colors">
              {match.awayTeam.name}
            </span>
          </div>
          {(isLive || isFinished) && (
            <span className="font-mono font-black text-sm text-slate-100 px-2">
              {awayScore}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
