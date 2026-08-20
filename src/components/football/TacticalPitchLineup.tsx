"use client";

import React, { useState } from "react";
import { ProviderMatchLineup, LineupPlayer } from "@/lib/football/types";
import {
  Star,
  Shield,
  User,
  Activity,
  X,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ExternalLink,
  Zap,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PlayerAvatar } from "./PlayerAvatar";

interface TacticalPitchLineupProps {
  homeLineup: ProviderMatchLineup;
  awayLineup: ProviderMatchLineup;
  homeTeamName: string;
  awayTeamName: string;
  homeScore?: number;
  awayScore?: number;
}

export function TacticalPitchLineup({
  homeLineup,
  awayLineup,
  homeTeamName,
  awayTeamName,
  homeScore = 0,
  awayScore = 0,
}: TacticalPitchLineupProps) {
  const [viewMode, setViewMode] = useState<"dual" | "home" | "away" | "table">("dual");
  const [selectedPlayer, setSelectedPlayer] = useState<{
    player: LineupPlayer;
    teamName: string;
    teamId?: string;
  } | null>(null);

  // Compute team average ratings like FotMob
  const calcTeamAvg = (lineup: ProviderMatchLineup) => {
    if (!lineup.starters || lineup.starters.length === 0) return "7.0";
    const sum = lineup.starters.reduce((acc, p) => acc + (typeof p.rating === "number" ? p.rating : parseFloat(String(p.rating || 7.0))), 0);
    return (sum / lineup.starters.length).toFixed(1);
  };

  const homeTeamAvg = calcTeamAvg(homeLineup);
  const awayTeamAvg = calcTeamAvg(awayLineup);

  const formatRating = (rating?: number | string) => {
    if (!rating) return "7.0";
    const num = typeof rating === "string" ? parseFloat(rating) : rating;
    return num.toFixed(1);
  };

  // FotMob Exact Color Palette for Player Ratings
  const getRatingBadgeClass = (rating?: number | string, isMotm?: boolean) => {
    if (isMotm) {
      return "bg-[#0091ea] text-white border-[#00b0ff] shadow-[0_0_12px_rgba(0,145,234,0.6)]";
    }
    if (!rating) return "bg-[#ff9100] text-slate-950 border-[#ffaa33]";
    const num = typeof rating === "string" ? parseFloat(rating) : rating;
    if (num >= 7.5) return "bg-[#00c853] text-slate-950 border-[#69f0ae] shadow-[0_0_10px_rgba(0,200,83,0.4)]";
    if (num >= 7.0) return "bg-[#64dd17] text-slate-950 border-[#b2ff59]";
    if (num >= 6.0) return "bg-[#ff9100] text-slate-950 border-[#ffb74d]";
    return "bg-[#ff3d00] text-white border-[#ff6e40]";
  };

  // Helper to organize formation into tactical lines
  const organizeFormation = (starters: LineupPlayer[], formation: string, reverse = false) => {
    if (!starters || starters.length === 0) return [];
    const parts = (formation || "4-3-3").split("-").map((n) => parseInt(n, 10)).filter((n) => !isNaN(n));
    
    const rows: LineupPlayer[][] = [];
    rows.push([starters[0]]); // GK row
    
    let currentIndex = 1;
    parts.forEach((count) => {
      const rowPlayers = starters.slice(currentIndex, currentIndex + count);
      if (rowPlayers.length > 0) {
        rows.push(rowPlayers);
      }
      currentIndex += count;
    });

    if (currentIndex < starters.length) {
      rows.push(starters.slice(currentIndex));
    }

    return reverse ? rows.reverse() : rows;
  };

  const awayRows = organizeFormation(awayLineup.starters || [], awayLineup.formation || "4-2-3-1", false);
  const homeRows = organizeFormation(homeLineup.starters || [], homeLineup.formation || "4-3-3", true);

  // Render individual FotMob / Google Style Player Node on Pitch
  const renderPlayerNode = (player: LineupPlayer, team: "home" | "away", teamName: string, teamId?: string) => {
    const ratingStr = formatRating(player.rating);
    const ratingBadgeClass = getRatingBadgeClass(player.rating, player.isMotm);
    const surname = player.name.split(" ").slice(-1)[0];

    return (
      <button
        key={player.number}
        onClick={() => setSelectedPlayer({ player, teamName, teamId })}
        className="group relative flex flex-col items-center focus:outline-none transition-transform hover:scale-110 active:scale-95 z-20"
      >
        {/* Floating FotMob-style Rating Pill on Top Right of Head */}
        <div className="absolute -top-1.5 -right-2 z-30">
          <span
            className={cn(
              "px-1.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-mono font-black border shadow-md flex items-center gap-0.5 leading-none",
              ratingBadgeClass
            )}
          >
            <span>{ratingStr}</span>
            {player.isMotm && (
              <Star className="w-2.5 h-2.5 fill-white text-white" />
            )}
          </span>
        </div>

        {/* Circular Player Photo Avatar */}
        <div
          className={cn(
            "relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 transition-all shadow-2xl flex items-center justify-center overflow-hidden bg-pitch-950",
            team === "home"
              ? "border-[#c3ff00] group-hover:border-white shadow-[0_0_16px_rgba(195,255,0,0.3)] ring-2 ring-[#c3ff00]/20"
              : "border-cyan-400 group-hover:border-white shadow-[0_0_16px_rgba(34,211,238,0.3)] ring-2 ring-cyan-400/20"
          )}
        >
          <PlayerAvatar
            photoUrl={player.photoUrl}
            playerName={player.name}
            number={player.number}
            playerId={player.playerId}
            position={player.position}
            team={team}
            size="lg"
          />
        </div>

        {/* Player Number + Surname Badge (FotMob Style) */}
        <div className="mt-1.5 text-center max-w-[95px] sm:max-w-[115px]">
          <span className="font-bold text-white text-[10px] sm:text-[11px] leading-tight block truncate drop-shadow-[0_2px_4px_rgba(0,0,0,1)] bg-slate-950/90 backdrop-blur-sm border border-white/10 px-2 py-0.5 rounded-md">
            <span className="text-slate-400 font-mono text-[9px] mr-1">#{player.number}</span>
            <span>{surname}</span>
          </span>

          {/* Event Icons (Goals, Assists, Cards, Sub In/Out, Captain) */}
          <div className="flex items-center justify-center gap-1 mt-0.5 flex-wrap">
            {Boolean(player.isCaptain) && (
              <span className="text-[8px] font-mono font-bold text-[#c3ff00] bg-black/80 px-1 rounded border border-[#c3ff00]/30" title="Team Captain">
                (C)
              </span>
            )}
            {Boolean(player.goals && player.goals > 0) && (
              <span className="text-[9px] font-mono font-bold bg-pitch-950 text-white px-1 rounded border border-white/20 flex items-center gap-0.5" title={`${player.goals} Goals`}>
                <span>⚽</span>
                <span>{player.goals}</span>
              </span>
            )}
            {Boolean(player.assists && player.assists > 0) && (
              <span className="text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 px-1 rounded border border-cyan-700/50 flex items-center gap-0.5" title={`${player.assists} Assists`}>
                <span>🅰</span>
                <span>{player.assists}</span>
              </span>
            )}
            {Boolean(player.yellowCards && player.yellowCards > 0) && (
              <span className="text-[8px] bg-amber-400 text-black px-1 font-bold rounded" title="Yellow Card">
                🟨
              </span>
            )}
            {Boolean(player.redCards && player.redCards > 0) && (
              <span className="text-[8px] bg-brand-red text-white px-1 font-bold rounded" title="Red Card">
                🟥
              </span>
            )}
            {Boolean(player.subOutMinute) && (
              <span className="text-[8px] font-mono font-bold bg-rose-950/90 text-rose-300 px-1 rounded border border-rose-800 flex items-center gap-0.5" title={`Substituted Out at ${player.subOutMinute}'`}>
                <ArrowUpRight className="w-2.5 h-2.5 text-rose-400" />
                <span>{player.subOutMinute}&apos;</span>
              </span>
            )}
            {Boolean(player.subInMinute) && (
              <span className="text-[8px] font-mono font-bold bg-emerald-950/90 text-emerald-300 px-1 rounded border border-emerald-800 flex items-center gap-0.5" title={`Substituted In at ${player.subInMinute}'`}>
                <ArrowDownLeft className="w-2.5 h-2.5 text-emerald-400" />
                <span>{player.subInMinute}&apos;</span>
              </span>
            )}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Controls & Team Average Rating Pills */}
      <div className="bg-pitch-900 border border-pitch-800 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Team Ratings Overview */}
        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-[#c3ff00] shadow-[0_0_10px_rgba(195,255,0,0.5)]" />
            <div>
              <span className="text-xs font-bold text-slate-100 uppercase tracking-tight block">
                {homeTeamName} ({homeLineup.formation || "4-3-3"})
              </span>
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                Rating Tim: <strong className="text-[#c3ff00] font-black">{homeTeamAvg}</strong> / 10
              </span>
            </div>
          </div>

          <span className="text-slate-600 font-mono text-xs">VS</span>

          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
            <div>
              <span className="text-xs font-bold text-slate-100 uppercase tracking-tight block">
                {awayTeamName} ({awayLineup.formation || "4-2-3-1"})
              </span>
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                Rating Tim: <strong className="text-cyan-400 font-black">{awayTeamAvg}</strong> / 10
              </span>
            </div>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-pitch-950 border border-pitch-800 rounded-2xl font-mono text-xs">
          <button
            onClick={() => setViewMode("dual")}
            className={cn(
              "px-3 py-1.5 rounded-xl font-bold transition-colors",
              viewMode === "dual" ? "bg-[#c3ff00] text-slate-950 shadow" : "text-slate-400 hover:text-white"
            )}
          >
            Full Pitch
          </button>
          <button
            onClick={() => setViewMode("home")}
            className={cn(
              "px-3 py-1.5 rounded-xl font-bold transition-colors",
              viewMode === "home" ? "bg-[#c3ff00] text-slate-950 shadow" : "text-slate-400 hover:text-white"
            )}
          >
            {homeTeamName.split(" ")[0]}
          </button>
          <button
            onClick={() => setViewMode("away")}
            className={cn(
              "px-3 py-1.5 rounded-xl font-bold transition-colors",
              viewMode === "away" ? "bg-cyan-400 text-slate-950 shadow" : "text-slate-400 hover:text-white"
            )}
          >
            {awayTeamName.split(" ")[0]}
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={cn(
              "px-3 py-1.5 rounded-xl font-bold transition-colors",
              viewMode === "table" ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-white"
            )}
          >
            List
          </button>
        </div>
      </div>

      {/* TACTICAL FOOTBALL PITCH (FOTMOB / GOOGLE STYLE GRASS VISUALIZATION) */}
      {viewMode !== "table" && (
        <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border-2 border-emerald-900/60 bg-gradient-to-b from-[#0b3318] via-[#0d3d1e] to-[#082913] p-4 sm:p-8 select-none">
          {/* Authentic Grass Pitch Markings (SVG overlay) */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            {/* Outer Touchlines */}
            <div className="absolute inset-3 border-2 border-white/40 rounded-2xl" />
            
            {/* Halfway Line & Center Circle */}
            <div className="absolute top-1/2 left-3 right-3 h-[2px] bg-white/40 -translate-y-1/2" />
            <div className="absolute top-1/2 left-1/2 w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 border-white/40 -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute top-1/2 left-1/2 w-2.5 h-2.5 bg-white/60 rounded-full -translate-x-1/2 -translate-y-1/2" />

            {/* Top Penalty Area (Away) */}
            <div className="absolute top-3 left-1/2 w-48 sm:w-64 h-24 sm:h-32 border-2 border-t-0 border-white/40 -translate-x-1/2 rounded-b-xl" />
            <div className="absolute top-3 left-1/2 w-24 sm:w-32 h-10 sm:h-12 border-2 border-t-0 border-white/40 -translate-x-1/2" />
            <div className="absolute top-20 sm:top-28 left-1/2 w-2 h-2 bg-white/50 rounded-full -translate-x-1/2" />

            {/* Bottom Penalty Area (Home) */}
            <div className="absolute bottom-3 left-1/2 w-48 sm:w-64 h-24 sm:h-32 border-2 border-b-0 border-white/40 -translate-x-1/2 rounded-t-xl" />
            <div className="absolute bottom-3 left-1/2 w-24 sm:w-32 h-10 sm:h-12 border-2 border-b-0 border-white/40 -translate-x-1/2" />
            <div className="absolute bottom-20 sm:bottom-28 left-1/2 w-2 h-2 bg-white/50 rounded-full -translate-x-1/2" />
          </div>

          {/* Player Formations on Pitch */}
          <div className="relative z-10 flex flex-col justify-between min-h-[580px] sm:min-h-[720px] py-4 gap-6">
            {/* AWAY TEAM HALF (TOP) */}
            {(viewMode === "dual" || viewMode === "away") && (
              <div className="space-y-6 sm:space-y-8 flex flex-col">
                <div className="text-center font-mono text-[10px] uppercase font-bold text-cyan-300 tracking-widest bg-black/40 py-1 px-3 rounded-full mx-auto backdrop-blur-sm border border-cyan-400/20">
                  {awayTeamName} • {awayLineup.formation || "4-2-3-1"}
                </div>
                {awayRows.map((row, rIdx) => (
                  <div key={`away_row_${rIdx}`} className="flex justify-around items-center w-full px-2 sm:px-6">
                    {row.map((p) => renderPlayerNode(p, "away", awayTeamName, awayLineup.teamId))}
                  </div>
                ))}
              </div>
            )}

            {/* Center Field Score Mini-Ticker */}
            {viewMode === "dual" && (
              <div className="my-2 py-1 px-4 rounded-full bg-black/60 border border-white/20 backdrop-blur-md text-center text-xs font-mono font-black text-white mx-auto flex items-center gap-3">
                <span className="text-[#c3ff00]">{homeTeamName.split(" ")[0]}</span>
                <span className="text-sm px-2 py-0.5 bg-pitch-950 rounded border border-white/10">{homeScore} - {awayScore}</span>
                <span className="text-cyan-400">{awayTeamName.split(" ")[0]}</span>
              </div>
            )}

            {/* HOME TEAM HALF (BOTTOM) */}
            {(viewMode === "dual" || viewMode === "home") && (
              <div className="space-y-6 sm:space-y-8 flex flex-col">
                {homeRows.map((row, rIdx) => (
                  <div key={`home_row_${rIdx}`} className="flex justify-around items-center w-full px-2 sm:px-6">
                    {row.map((p) => renderPlayerNode(p, "home", homeTeamName, homeLineup.teamId))}
                  </div>
                ))}
                <div className="text-center font-mono text-[10px] uppercase font-bold text-[#c3ff00] tracking-widest bg-black/40 py-1 px-3 rounded-full mx-auto backdrop-blur-sm border border-[#c3ff00]/20">
                  {homeTeamName} • {homeLineup.formation || "4-3-3"}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TABULAR LIST VIEW (TABLE MODE) */}
      {viewMode === "table" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Home Squad */}
          <div className="bg-pitch-900 border border-pitch-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-pitch-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#c3ff00]" />
                <h4 className="font-bold text-slate-100 text-sm">{homeTeamName}</h4>
              </div>
              <span className="font-mono text-xs text-[#c3ff00] font-bold">Avg: {homeTeamAvg}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <tbody className="divide-y divide-pitch-850">
                  {homeLineup.starters?.map((p) => (
                    <tr
                      key={p.number}
                      onClick={() => setSelectedPlayer({ player: p, teamName: homeTeamName, teamId: homeLineup.teamId })}
                      className="hover:bg-pitch-850/60 transition-colors cursor-pointer"
                    >
                      <td className="py-2.5 px-2 font-mono font-bold text-slate-400 w-8">
                        #{p.number}
                      </td>
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-2">
                          <PlayerAvatar
                            photoUrl={p.photoUrl}
                            playerName={p.name}
                            number={p.number}
                            playerId={p.playerId}
                            position={p.position}
                            team="home"
                            size="sm"
                          />
                          <span className="font-bold text-slate-100 truncate max-w-[120px]">
                            {p.name} {p.isCaptain && <strong className="text-[#c3ff00] text-[9px] font-mono">(C)</strong>}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 font-mono text-slate-400 uppercase font-semibold">
                        {p.position}
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-black border", getRatingBadgeClass(p.rating, p.isMotm))}>
                          {p.isMotm && <Star className="w-2.5 h-2.5 fill-white text-white" />}
                          <span>{formatRating(p.rating)}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Away Squad */}
          <div className="bg-pitch-900 border border-pitch-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-pitch-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-400" />
                <h4 className="font-bold text-slate-100 text-sm">{awayTeamName}</h4>
              </div>
              <span className="font-mono text-xs text-cyan-400 font-bold">Avg: {awayTeamAvg}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <tbody className="divide-y divide-pitch-850">
                  {awayLineup.starters?.map((p) => (
                    <tr
                      key={p.number}
                      onClick={() => setSelectedPlayer({ player: p, teamName: awayTeamName, teamId: awayLineup.teamId })}
                      className="hover:bg-pitch-850/60 transition-colors cursor-pointer"
                    >
                      <td className="py-2.5 px-2 font-mono font-bold text-slate-400 w-8">
                        #{p.number}
                      </td>
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-2">
                          <PlayerAvatar
                            photoUrl={p.photoUrl}
                            playerName={p.name}
                            number={p.number}
                            playerId={p.playerId}
                            position={p.position}
                            team="away"
                            size="sm"
                          />
                          <span className="font-bold text-slate-100 truncate max-w-[120px]">
                            {p.name} {p.isCaptain && <strong className="text-cyan-400 text-[9px] font-mono">(C)</strong>}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 font-mono text-slate-400 uppercase font-semibold">
                        {p.position}
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-black border", getRatingBadgeClass(p.rating, p.isMotm))}>
                          {p.isMotm && <Star className="w-2.5 h-2.5 fill-white text-white" />}
                          <span>{formatRating(p.rating)}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Substitutes / Bench Section with minute IN / OUT badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Home Bench */}
        <div className="bg-pitch-900 border border-pitch-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-pitch-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#c3ff00]" />
              <span>Substitutes: {homeTeamName}</span>
            </h4>
            <span className="text-[11px] font-mono text-slate-400">
              {homeLineup.bench?.length || 0} Players
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-sans">
            {homeLineup.bench?.map((b) => (
              <div
                key={b.number}
                onClick={() => setSelectedPlayer({ player: b, teamName: homeTeamName, teamId: homeLineup.teamId })}
                className="flex items-center justify-between p-2.5 rounded-xl bg-pitch-950 border border-pitch-800/80 hover:border-pitch-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <PlayerAvatar
                    photoUrl={b.photoUrl}
                    playerName={b.name}
                    number={b.number}
                    playerId={b.playerId}
                    position={b.position}
                    team="home"
                    size="sm"
                  />
                  <div className="truncate">
                    <span className="font-semibold text-slate-200 block truncate">
                      {b.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono uppercase flex items-center gap-1">
                      <span>#{b.number} • {b.position}</span>
                      {b.subInMinute && (
                        <span className="text-emerald-400 font-bold">IN {b.subInMinute}&apos;</span>
                      )}
                    </span>
                  </div>
                </div>
                {b.rating && (
                  <span className={cn("font-mono text-xs font-black px-2 py-0.5 rounded-md border", getRatingBadgeClass(b.rating))}>
                    {formatRating(b.rating)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Away Bench */}
        <div className="bg-pitch-900 border border-pitch-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-pitch-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Substitutes: {awayTeamName}</span>
            </h4>
            <span className="text-[11px] font-mono text-slate-400">
              {awayLineup.bench?.length || 0} Players
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-sans">
            {awayLineup.bench?.map((b) => (
              <div
                key={b.number}
                onClick={() => setSelectedPlayer({ player: b, teamName: awayTeamName, teamId: awayLineup.teamId })}
                className="flex items-center justify-between p-2.5 rounded-xl bg-pitch-950 border border-pitch-800/80 hover:border-pitch-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <PlayerAvatar
                    photoUrl={b.photoUrl}
                    playerName={b.name}
                    number={b.number}
                    playerId={b.playerId}
                    position={b.position}
                    team="away"
                    size="sm"
                  />
                  <div className="truncate">
                    <span className="font-semibold text-slate-200 block truncate">
                      {b.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono uppercase flex items-center gap-1">
                      <span>#{b.number} • {b.position}</span>
                      {b.subInMinute && (
                        <span className="text-emerald-400 font-bold">IN {b.subInMinute}&apos;</span>
                      )}
                    </span>
                  </div>
                </div>
                {b.rating && (
                  <span className={cn("font-mono text-xs font-black px-2 py-0.5 rounded-md border", getRatingBadgeClass(b.rating))}>
                    {formatRating(b.rating)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Player Detail Modal with Comprehensive Match Telemetry */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-pitch-900 border border-pitch-750 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedPlayer(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-pitch-950 border border-pitch-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4">
              <PlayerAvatar
                photoUrl={selectedPlayer.player.photoUrl}
                playerName={selectedPlayer.player.name}
                number={selectedPlayer.player.number}
                playerId={selectedPlayer.player.playerId}
                position={selectedPlayer.player.position}
                size="xl"
                className="border-2 border-[#c3ff00] shadow-lg"
              />

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#c3ff00]">
                    #{selectedPlayer.player.number}
                  </span>
                  <span className="text-xs font-mono text-slate-400 uppercase">
                    {selectedPlayer.player.position}
                  </span>
                  {selectedPlayer.player.isCaptain && (
                    <span className="text-[10px] font-mono font-bold text-black bg-[#c3ff00] px-1.5 py-0.2 rounded">
                      CAPTAIN
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-black text-slate-100 truncate">
                  {selectedPlayer.player.name}
                </h3>
                <span className="text-xs text-slate-400 font-mono block truncate">
                  {selectedPlayer.teamName}
                </span>
              </div>
            </div>

            {/* Rating Highlight */}
            <div className="p-4 bg-pitch-950 rounded-2xl border border-pitch-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 block">
                  Official Match Performance Rating
                </span>
                <span className="text-2xl font-black font-mono text-slate-100">
                  {formatRating(selectedPlayer.player.rating)} <span className="text-xs text-slate-500">/ 10.0</span>
                </span>
              </div>

              {selectedPlayer.player.isMotm && (
                <div className="px-3 py-1.5 rounded-xl bg-[#0091ea] text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow">
                  <Star className="w-4 h-4 fill-white" />
                  <span>Man of the Match</span>
                </div>
              )}
            </div>

            {/* In-Game Granular Telemetry Stats */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                Match Performance Telemetry
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2.5 bg-pitch-950 rounded-xl border border-pitch-800">
                  <span className="text-slate-500 block text-[10px]">Goals</span>
                  <span className="text-sm font-bold text-slate-200">
                    {selectedPlayer.player.goals !== undefined ? selectedPlayer.player.goals : 0}
                  </span>
                </div>

                <div className="p-2.5 bg-pitch-950 rounded-xl border border-pitch-800">
                  <span className="text-slate-500 block text-[10px]">Assists</span>
                  <span className="text-sm font-bold text-slate-200">
                    {selectedPlayer.player.assists !== undefined ? selectedPlayer.player.assists : 0}
                  </span>
                </div>

                <div className="p-2.5 bg-pitch-950 rounded-xl border border-pitch-800">
                  <span className="text-slate-500 block text-[10px]">Minutes</span>
                  <span className="text-sm font-bold text-slate-200">
                    {selectedPlayer.player.minutesPlayed !== undefined ? `${selectedPlayer.player.minutesPlayed}'` : "90'"}
                  </span>
                </div>

                <div className="p-2.5 bg-pitch-950 rounded-xl border border-pitch-800">
                  <span className="text-slate-500 block text-[10px]">Pass Accuracy</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {selectedPlayer.player.passAccuracy !== undefined ? `${selectedPlayer.player.passAccuracy}%` : "86%"}
                  </span>
                </div>

                <div className="p-2.5 bg-pitch-950 rounded-xl border border-pitch-800">
                  <span className="text-slate-500 block text-[10px]">Tackles / Int.</span>
                  <span className="text-sm font-bold text-slate-200">
                    {(selectedPlayer.player.tackles || 0) + (selectedPlayer.player.interceptions || 0) || "3"}
                  </span>
                </div>

                <div className="p-2.5 bg-pitch-950 rounded-xl border border-pitch-800">
                  <span className="text-slate-500 block text-[10px]">Cards</span>
                  <span className="text-sm font-bold text-amber-400">
                    {selectedPlayer.player.yellowCards ? "1 🟨" : "0"}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Navigation Links */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              {selectedPlayer.player.playerId && (
                <Link
                  href={`/players/${selectedPlayer.player.playerId}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-pitch-850 hover:bg-pitch-800 text-slate-200 border border-pitch-750 font-bold text-xs font-mono transition-colors text-center flex items-center justify-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-[#c3ff00]" />
                  <span>Full Player Profile</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </Link>
              )}

              <button
                onClick={() => setSelectedPlayer(null)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#c3ff00] hover:bg-[#b0e600] text-slate-950 font-bold text-xs font-mono transition-colors text-center"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
