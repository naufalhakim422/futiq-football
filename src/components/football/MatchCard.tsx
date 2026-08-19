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

function formatCompetitionName(name: string, code?: string) {
  const n = (name || "").trim();
  const lower = n.toLowerCase();
  if (lower.includes("world cup")) return "🌍 Kualifikasi Piala Dunia";
  if (lower.includes("nations league")) return "🇪🇺 UEFA Nations League";
  if (lower.includes("asean")) return "🌏 Piala AFF / ASEAN";
  if (lower.includes("champions")) return "🏆 Champions League";
  if (lower.includes("premier league")) return "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League";
  if (lower.includes("la liga")) return "🇪🇸 La Liga Spanyol";
  if (lower.includes("serie a")) return "🇮🇹 Serie A Italia";
  if (lower.includes("iii liga")) return "🇵🇱 III Liga Polandia";
  if (lower.includes("ligi kuu bara")) return "🇹🇿 Liga Utama Tanzania";
  if (lower.includes("super league") && !lower.includes("premier")) return "🇺🇿 Uzbekistan Super League";
  if (lower.includes("premier soccer league")) return "🇿🇼 Zimbabwe Soccer League";
  if (lower.includes("cup")) return `🏆 ${n}`;
  return n || code || "Kompetisi";
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

  const displayCompName = formatCompetitionName(match.competition.name, match.competition.code);

  return (
    <Link
      href={`/matches/${match.id}`}
      className={cn(
        "group block bg-pitch-900 hover:bg-pitch-850 border border-pitch-800 hover:border-[#c3ff00]/40 rounded-2xl transition-all p-4 shadow-md",
        className
      )}
    >
      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-3 pb-2.5 border-b border-pitch-800">
        <span className="font-mono font-bold text-slate-200 truncate max-w-[200px]" title={match.competition.name}>
          {displayCompName}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {isLive && (
            <span className="flex items-center gap-1 text-brand-red font-mono font-bold text-[10px] uppercase bg-brand-red/10 border border-brand-red/30 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-ping" />
              <span>{match.status === "HT" ? "HT" : match.minute ? `${match.minute}'` : "LIVE"}</span>
            </span>
          )}
          {isFinished && (
            <span className="text-slate-400 font-mono text-[10px] uppercase bg-pitch-950 px-2 py-0.5 rounded border border-pitch-800">
              FT
            </span>
          )}
          {match.status === "SCHEDULED" && (
            <span className="text-slate-400 font-mono text-[10px] bg-pitch-950 px-2 py-0.5 rounded border border-pitch-800">
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
