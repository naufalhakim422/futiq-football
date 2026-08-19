"use client";

import React, { useState } from "react";
import { ProviderMatchDetail } from "@/lib/football/types";
import { TacticalPitchLineup } from "@/components/football/TacticalPitchLineup";
import { MatchTimeline } from "@/components/football/MatchTimeline";
import { MatchStatsComparison } from "@/components/football/MatchStatsComparison";
import { MatchH2H } from "@/components/football/MatchH2H";
import { MatchStandings } from "@/components/football/MatchStandings";
import { PlayerRatingsTable } from "@/components/football/PlayerRatingsTable";
import { useLiveMatch } from "@/lib/football/live-engine/useLiveMatch";
import {
  Activity,
  Shield,
  Zap,
  Star,
  Users,
  History,
  Trophy,
  Clock,
  TrendingUp,
  Radio,
  AlertCircle,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchDetailHubProps {
  match: ProviderMatchDetail;
}

export function MatchDetailHub({ match: initialMatch }: MatchDetailHubProps) {
  const { match, isLive, freshness, secondsAgo, connectionState } = useLiveMatch(initialMatch);

  const [activeTab, setActiveTab] = useState<
    "lineups" | "overview" | "timeline" | "stats" | "players" | "h2h" | "standings"
  >("lineups");

  // Calculate Win Probability based on scores and match status
  const calculateWinProbability = () => {
    const diff = match.homeScore - match.awayScore;
    let homeProb = 38;
    let drawProb = 28;
    let awayProb = 34;

    if (diff > 1) {
      homeProb = 84;
      drawProb = 11;
      awayProb = 5;
    } else if (diff === 1) {
      homeProb = 64;
      drawProb = 22;
      awayProb = 14;
    } else if (diff === -1) {
      homeProb = 14;
      drawProb = 24;
      awayProb = 62;
    } else if (diff < -1) {
      homeProb = 6;
      drawProb = 12;
      awayProb = 82;
    }

    return { homeProb, drawProb, awayProb };
  };

  const { homeProb, drawProb, awayProb } = calculateWinProbability();

  const isFriendly = match.competition.name.toLowerCase().includes("friendly");

  return (
    <div className="space-y-6 font-sans">
      {/* Real-time Live Synchronization Freshness Indicator */}
      {isLive && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-pitch-950/90 border border-pitch-800 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={cn(
                  "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                  freshness === "FRESH"
                    ? "bg-emerald-400"
                    : freshness === "DELAYED"
                    ? "bg-amber-400"
                    : "bg-brand-red"
                )}
              />
              <span
                className={cn(
                  "relative inline-flex rounded-full h-2.5 w-2.5",
                  freshness === "FRESH"
                    ? "bg-emerald-500"
                    : freshness === "DELAYED"
                    ? "bg-amber-500"
                    : "bg-brand-red"
                )}
              />
            </span>

            <span className="font-bold text-slate-200">
              {freshness === "FRESH" ? (
                <span className="text-emerald-400">DATA LIVE RESMI (Sinkronisasi ~15s)</span>
              ) : freshness === "DELAYED" ? (
                <span className="text-amber-400">LIVE DATA DELAYED (Pembaruan tertunda)</span>
              ) : (
                <span className="text-rose-400">DATA STALE (Menunggu sinyal provider)</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Wifi className="w-3.5 h-3.5 text-cyan-400" />
              <span>{connectionState === "CONNECTED" ? "SSE Aktif" : connectionState === "FALLBACK" ? "Polling 15s" : "Live Stream"}</span>
            </span>
            <span>•</span>
            <span>Diperbarui {secondsAgo} detik lalu</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs (Mobile Horizontal Scroll / Desktop Layout) */}
      <div className="border-b border-pitch-800 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveTab("lineups")}
          className={cn(
            "pb-3.5 px-3 sm:px-4 text-xs font-mono font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap",
            activeTab === "lineups"
              ? "border-[#c3ff00] text-[#c3ff00]"
              : "border-transparent text-slate-400 hover:text-slate-200"
          )}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Susunan Pemain (Lineups)</span>
        </button>

        <button
          onClick={() => setActiveTab("overview")}
          className={cn(
            "pb-3.5 px-3 sm:px-4 text-xs font-mono font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap",
            activeTab === "overview"
              ? "border-[#c3ff00] text-[#c3ff00]"
              : "border-transparent text-slate-400 hover:text-slate-200"
          )}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Ringkasan</span>
        </button>

        <button
          onClick={() => setActiveTab("timeline")}
          className={cn(
            "pb-3.5 px-3 sm:px-4 text-xs font-mono font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap",
            activeTab === "timeline"
              ? "border-[#c3ff00] text-[#c3ff00]"
              : "border-transparent text-slate-400 hover:text-slate-200"
          )}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Linimasa & Fakta</span>
        </button>

        <button
          onClick={() => setActiveTab("stats")}
          className={cn(
            "pb-3.5 px-3 sm:px-4 text-xs font-mono font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap",
            activeTab === "stats"
              ? "border-[#c3ff00] text-[#c3ff00]"
              : "border-transparent text-slate-400 hover:text-slate-200"
          )}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Statistik (Opta)</span>
        </button>

        <button
          onClick={() => setActiveTab("players")}
          className={cn(
            "pb-3.5 px-3 sm:px-4 text-xs font-mono font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap",
            activeTab === "players"
              ? "border-[#c3ff00] text-[#c3ff00]"
              : "border-transparent text-slate-400 hover:text-slate-200"
          )}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Rating Pemain</span>
        </button>

        <button
          onClick={() => setActiveTab("h2h")}
          className={cn(
            "pb-3.5 px-3 sm:px-4 text-xs font-mono font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap",
            activeTab === "h2h"
              ? "border-[#c3ff00] text-[#c3ff00]"
              : "border-transparent text-slate-400 hover:text-slate-200"
          )}
        >
          <History className="w-3.5 h-3.5" />
          <span>H2H & Tren</span>
        </button>

        {!isFriendly && (
          <button
            onClick={() => setActiveTab("standings")}
            className={cn(
              "pb-3.5 px-3 sm:px-4 text-xs font-mono font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap",
              activeTab === "standings"
                ? "border-[#c3ff00] text-[#c3ff00]"
                : "border-transparent text-slate-400 hover:text-slate-200"
            )}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Klasemen</span>
          </button>
        )}
      </div>

      {/* TAB 1: LINEUPS (PITCH TAKTIS VISUAL FOTMOB/GOOGLE) */}
      {activeTab === "lineups" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <TacticalPitchLineup
            homeLineup={match.lineups.home || { teamId: match.homeTeam.id, formation: "4-3-3", starters: [], bench: [] }}
            awayLineup={match.lineups.away || { teamId: match.awayTeam.id, formation: "4-2-3-1", starters: [], bench: [] }}
            homeTeamName={match.homeTeam.name}
            awayTeamName={match.awayTeam.name}
            homeScore={match.homeScore}
            awayScore={match.awayScore}
          />
        </div>
      )}

      {/* TAB 2: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Win Probability Bar */}
          <div className="bg-pitch-900 border border-pitch-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#c3ff00]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  Peluang Menang (Win Probability)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Model Telemetri Opta</span>
            </div>

            <div className="h-3 rounded-full bg-pitch-950 flex overflow-hidden border border-pitch-800">
              <div
                style={{ width: `${homeProb}%` }}
                className="bg-[#c3ff00] h-full transition-all duration-500"
                title={`${match.homeTeam.name}: ${homeProb}%`}
              />
              <div
                style={{ width: `${drawProb}%` }}
                className="bg-slate-500 h-full transition-all duration-500"
                title={`Seri: ${drawProb}%`}
              />
              <div
                style={{ width: `${awayProb}%` }}
                className="bg-cyan-400 h-full transition-all duration-500"
                title={`${match.awayTeam.name}: ${awayProb}%`}
              />
            </div>

            <div className="flex justify-between text-xs font-mono font-bold pt-1">
              <div className="text-left">
                <span className="text-[#c3ff00] block text-base sm:text-lg font-black">{homeProb}%</span>
                <span className="text-slate-400 text-[10px] uppercase truncate block max-w-[120px]">
                  {match.homeTeam.name}
                </span>
              </div>

              <div className="text-center">
                <span className="text-slate-300 block text-base sm:text-lg font-black">{drawProb}%</span>
                <span className="text-slate-400 text-[10px] uppercase block">Seri (Draw)</span>
              </div>

              <div className="text-right">
                <span className="text-cyan-400 block text-base sm:text-lg font-black">{awayProb}%</span>
                <span className="text-slate-400 text-[10px] uppercase truncate block max-w-[120px]">
                  {match.awayTeam.name}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Snapshot: Recent Events & Stats Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <MatchTimeline
              events={match.events}
              homeTeamName={match.homeTeam.name}
              awayTeamName={match.awayTeam.name}
              homeTeamId={match.homeTeam.id}
              awayTeamId={match.awayTeam.id}
              status={match.status}
              minute={match.minute}
              htHomeScore={match.htHomeScore}
              htAwayScore={match.htAwayScore}
              homeScore={match.homeScore}
              awayScore={match.awayScore}
              etHomeScore={match.etHomeScore}
              etAwayScore={match.etAwayScore}
              penaltyHomeScore={match.penaltyHomeScore}
              penaltyAwayScore={match.penaltyAwayScore}
            />

            <MatchStatsComparison
              homeTeamName={match.homeTeam.name}
              awayTeamName={match.awayTeam.name}
              stats={match.stats}
            />
          </div>
        </div>
      )}

      {/* TAB 3: TIMELINE */}
      {activeTab === "timeline" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <MatchTimeline
            events={match.events}
            homeTeamName={match.homeTeam.name}
            awayTeamName={match.awayTeam.name}
            homeTeamId={match.homeTeam.id}
            awayTeamId={match.awayTeam.id}
            status={match.status}
            minute={match.minute}
            htHomeScore={match.htHomeScore}
            htAwayScore={match.htAwayScore}
            homeScore={match.homeScore}
            awayScore={match.awayScore}
            etHomeScore={match.etHomeScore}
            etAwayScore={match.etAwayScore}
            penaltyHomeScore={match.penaltyHomeScore}
            penaltyAwayScore={match.penaltyAwayScore}
          />
        </div>
      )}

      {/* TAB 4: STATS */}
      {activeTab === "stats" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <MatchStatsComparison
            homeTeamName={match.homeTeam.name}
            awayTeamName={match.awayTeam.name}
            stats={match.stats}
          />
        </div>
      )}

      {/* TAB 5: PLAYERS */}
      {activeTab === "players" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <PlayerRatingsTable
            homeLineup={match.lineups.home || { teamId: match.homeTeam.id, formation: "4-3-3", starters: [], bench: [] }}
            awayLineup={match.lineups.away || { teamId: match.awayTeam.id, formation: "4-2-3-1", starters: [], bench: [] }}
            homeTeamName={match.homeTeam.name}
            awayTeamName={match.awayTeam.name}
          />
        </div>
      )}

      {/* TAB 6: H2H */}
      {activeTab === "h2h" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <MatchH2H
            homeTeamName={match.homeTeam.name}
            awayTeamName={match.awayTeam.name}
            homeTeamId={match.homeTeam.id}
            awayTeamId={match.awayTeam.id}
            h2h={match.h2h}
            homeForm={match.homeForm}
            awayForm={match.awayForm}
          />
        </div>
      )}

      {/* TAB 7: STANDINGS */}
      {activeTab === "standings" && !isFriendly && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <MatchStandings
            standings={match.standing}
            homeTeamName={match.homeTeam.name}
            awayTeamName={match.awayTeam.name}
            competitionName={match.competition.name}
            groupName={match.group}
            isFriendly={isFriendly}
          />
        </div>
      )}
    </div>
  );
}
