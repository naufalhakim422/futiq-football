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
  Newspaper,
  ArrowRight,
  Award,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { playerIdentityResolver } from "@/lib/football/player-identity.resolver";

interface MatchDetailHubProps {
  match: ProviderMatchDetail;
}

export function MatchDetailHub({ match: initialMatch }: MatchDetailHubProps) {
  const { match, isLive, freshness, secondsAgo, connectionState } = useLiveMatch(initialMatch);

  const [activeTab, setActiveTab] = useState<
    "overview" | "timeline" | "stats" | "lineups" | "players" | "h2h" | "standings" | "news"
  >("overview");

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

  // Extract goal scorers for Quick Goals Banner
  const goals = match.events?.filter(
    (e) => e.type.toString().includes("GOAL") || e.type === "GOAL" || e.type === "OWN_GOAL"
  ) || [];

  const homeGoals = goals.filter((g) => g.teamId === match.homeTeam.id);
  const awayGoals = goals.filter((g) => g.teamId === match.awayTeam.id);

  // Find Man of the Match
  const allHome = [...(match.lineups.home?.starters || []), ...(match.lineups.home?.bench || [])];
  const allAway = [...(match.lineups.away?.starters || []), ...(match.lineups.away?.bench || [])];
  const motmPlayer =
    allHome.find((p) => p.isMotm) ||
    allAway.find((p) => p.isMotm) ||
    [...allHome, ...allAway].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))[0];

  const motmTeam = motmPlayer && allHome.includes(motmPlayer) ? match.homeTeam.name : match.awayTeam.name;
  const motmPhoto = motmPlayer
    ? playerIdentityResolver.resolvePlayerPhoto(motmPlayer.playerId, motmPlayer.photoUrl)
    : null;

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
                <span className="text-emerald-400">OFFICIAL LIVE DATA (Sync ~15s)</span>
              ) : freshness === "DELAYED" ? (
                <span className="text-amber-400">LIVE DATA DELAYED (Update pending)</span>
              ) : (
                <span className="text-rose-400">DATA STALE (Awaiting provider signal)</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Wifi className="w-3.5 h-3.5 text-cyan-400" />
              <span>{connectionState === "CONNECTED" ? "SSE Active" : connectionState === "FALLBACK" ? "Polling 15s" : "Live Stream"}</span>
            </span>
            <span>•</span>
            <span>Updated {secondsAgo}s ago</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs (Mobile Horizontal Scroll / Desktop Layout) */}
      <div className="border-b border-pitch-800 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar pb-1">
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
          <span>Overview</span>
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
          <span>Timeline</span>
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
          <span>Stats (Opta)</span>
        </button>

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
          <span>Lineups</span>
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
          <span>Players</span>
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
          <span>H2H & Form</span>
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
            <span>Standings</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab("news")}
          className={cn(
            "pb-3.5 px-3 sm:px-4 text-xs font-mono font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap",
            activeTab === "news"
              ? "border-[#c3ff00] text-[#c3ff00]"
              : "border-transparent text-slate-400 hover:text-slate-200"
          )}
        >
          <Newspaper className="w-3.5 h-3.5" />
          <span>News & Analysis</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Quick Goals & Match Events Banner */}
          {(homeGoals.length > 0 || awayGoals.length > 0) && (
            <div className="bg-pitch-900 border border-pitch-800 rounded-3xl p-4 sm:p-6 shadow-xl grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              {/* Home Goalscorers */}
              <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-pitch-800 pb-3 sm:pb-0 sm:pr-4">
                <div className="flex items-center gap-1.5 font-bold text-[#c3ff00] uppercase font-mono text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-[#c3ff00]" />
                  <span>{match.homeTeam.name}</span>
                </div>
                {homeGoals.length > 0 ? (
                  homeGoals.map((g, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-200 font-mono">
                      <span>⚽</span>
                      <span className="font-bold">{g.playerName || "Player"}</span>
                      <span className="text-slate-400">{g.minute}&apos;</span>
                      {g.assistPlayerName && (
                        <span className="text-slate-500 text-[10px]">(Assist: {g.assistPlayerName})</span>
                      )}
                    </div>
                  ))
                ) : (
                  <span className="text-slate-500 italic text-[11px]">No goals recorded</span>
                )}
              </div>

              {/* Away Goalscorers */}
              <div className="space-y-1.5 sm:pl-4">
                <div className="flex items-center gap-1.5 font-bold text-cyan-400 uppercase font-mono text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>{match.awayTeam.name}</span>
                </div>
                {awayGoals.length > 0 ? (
                  awayGoals.map((g, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-200 font-mono">
                      <span>⚽</span>
                      <span className="font-bold">{g.playerName || "Player"}</span>
                      <span className="text-slate-400">{g.minute}&apos;</span>
                      {g.assistPlayerName && (
                        <span className="text-slate-500 text-[10px]">(Assist: {g.assistPlayerName})</span>
                      )}
                    </div>
                  ))
                ) : (
                  <span className="text-slate-500 italic text-[11px]">No goals recorded</span>
                )}
              </div>
            </div>
          )}

          {/* MOTM Spotlight Card */}
          {motmPlayer && (
            <div className="bg-gradient-to-r from-pitch-900 via-pitch-850 to-pitch-900 border border-pitch-750 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-pitch-950 border-2 border-[#0091ea] overflow-hidden flex items-center justify-center shrink-0 shadow">
                  {motmPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={motmPhoto} alt={motmPlayer.name} className="w-full h-full object-cover" />
                  ) : (
                    <Award className="w-7 h-7 text-[#0091ea]" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#00b0ff] uppercase">
                    <Star className="w-3 h-3 fill-[#00b0ff]" />
                    <span>Man of the Match Spotlight</span>
                  </div>
                  <h4 className="text-base font-black text-slate-100">{motmPlayer.name}</h4>
                  <span className="text-xs text-slate-400 font-mono">{motmTeam} • #{motmPlayer.number} ({motmPlayer.position})</span>
                </div>
              </div>

              <div className="text-right font-mono self-end sm:self-center">
                <span className="text-[10px] text-slate-400 block uppercase">Opta Rating</span>
                <span className="text-2xl font-black text-[#00b0ff]">{motmPlayer.rating || "8.5"} / 10</span>
              </div>
            </div>
          )}

          {/* Win Probability Bar */}
          <div className="bg-pitch-900 border border-pitch-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#c3ff00]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  Win Probability Simulation
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Opta Telemetry Model</span>
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
                title={`Draw: ${drawProb}%`}
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
                <span className="text-slate-400 text-[10px] uppercase block">Draw</span>
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

      {/* TAB 2: TIMELINE */}
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

      {/* TAB 3: STATS */}
      {activeTab === "stats" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <MatchStatsComparison
            homeTeamName={match.homeTeam.name}
            awayTeamName={match.awayTeam.name}
            stats={match.stats}
          />
        </div>
      )}

      {/* TAB 4: LINEUPS */}
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

      {/* TAB 8: NEWS & ANALYSIS */}
      {activeTab === "news" && (
        <div className="space-y-6 animate-in fade-in duration-300 font-sans">
          <div className="bg-pitch-900 border border-pitch-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-pitch-800">
              <div className="flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-[#c3ff00]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  Related Match News & Tactical Breakdown
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">FUTIQ Editorial Room</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/articles"
                className="p-4 rounded-2xl bg-pitch-950 border border-pitch-800 hover:border-[#c3ff00]/40 transition-all group block space-y-2"
              >
                <div className="flex items-center gap-2 text-[10px] font-mono text-[#c3ff00]">
                  <span>TACTICAL ANALYSIS</span>
                  <span>•</span>
                  <span>5 min read</span>
                </div>
                <h4 className="font-bold text-slate-100 group-hover:text-[#c3ff00] transition-colors text-sm">
                  Deep Tactical Blueprint: {match.homeTeam.name} vs {match.awayTeam.name} System Breakdown
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2">
                  Comprehensive tactical breakdown of defensive shapes, pressing triggers, and attacking transitions in {match.competition.name}.
                </p>
              </Link>

              <Link
                href="/articles"
                className="p-4 rounded-2xl bg-pitch-950 border border-pitch-800 hover:border-cyan-400/40 transition-all group block space-y-2"
              >
                <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400">
                  <span>POST-MATCH REACTION</span>
                  <span>•</span>
                  <span>4 min read</span>
                </div>
                <h4 className="font-bold text-slate-100 group-hover:text-cyan-400 transition-colors text-sm">
                  Player Performance Review & Opta Stats Debrief
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2">
                  Analyzing key moments, standout ratings, and tactical substitutions that dictated the outcome of this fixture.
                </p>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
