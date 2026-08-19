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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { playerIdentityResolver } from "@/lib/football/player-identity.resolver";

interface TacticalPitchLineupProps {
  homeLineup: ProviderMatchLineup;
  awayLineup: ProviderMatchLineup;
  homeTeamName: string;
  awayTeamName: string;
  homeScore?: number;
  awayScore?: number;
}

// 3D Jersey Avatar fallback for players without photo in database
function JerseyAvatar({
  number,
  position,
  team = "home",
}: {
  number: number;
  position?: string;
  team?: "home" | "away";
}) {
  const isGk = position?.toUpperCase() === "GK";
  const isHome = team === "home";

  const jerseyColor = isGk
    ? "from-amber-400 via-amber-500 to-amber-600 text-slate-950 border-amber-300"
    : isHome
    ? "from-[#c3ff00] via-[#a2db00] to-[#7fae00] text-slate-950 border-[#d8ff4d]"
    : "from-[#00d4ff] via-[#00a6e6] to-[#0077b3] text-slate-950 border-[#80e5ff]";

  return (
    <div
      className={cn(
        "w-full h-full rounded-full bg-gradient-to-b flex flex-col items-center justify-center border shadow-inner select-none relative",
        jerseyColor
      )}
    >
      <span className="font-mono font-black text-xs sm:text-sm leading-none drop-shadow-sm">
        {number}
      </span>
      <span className="font-mono text-[7px] sm:text-[8px] uppercase tracking-tighter font-black leading-none mt-0.5 opacity-90">
        {position || (isGk ? "GK" : "MF")}
      </span>
    </div>
  );
}

// FotMob / Google Style Player Avatar
function PlayerAvatar({
  photoUrl,
  name,
  number,
  playerId,
  position,
  team = "home",
}: {
  photoUrl?: string;
  name: string;
  number: number;
  playerId?: string;
  position?: string;
  team?: "home" | "away";
}) {
  const [imgError, setImgError] = useState(false);

  // Use centralized PlayerIdentityResolver with canonical provider ID validation
  const targetPhoto = playerIdentityResolver.resolvePlayerPhoto(playerId, photoUrl);

  if (targetPhoto && !imgError) {
    return (
      <div className="w-full h-full relative overflow-hidden bg-pitch-950 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={targetPhoto}
          alt={name}
          className="w-full h-full object-cover select-none group-hover:scale-110 transition-transform duration-200"
          onError={() => setImgError(true)}
        />
        {/* Number mini-tag */}
        <div className="absolute bottom-0 right-0 bg-black/90 text-white font-mono font-bold text-[8px] px-1 rounded-tl shadow">
          #{number}
        </div>
      </div>
    );
  }

  return <JerseyAvatar number={number} position={position} team={team} />;
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
  const renderPlayerNode = (player: LineupPlayer, team: "home" | "away", teamName: string) => {
    const ratingStr = formatRating(player.rating);
    const ratingBadgeClass = getRatingBadgeClass(player.rating, player.isMotm);
    const surname = player.name.split(" ").slice(-1)[0];

    return (
      <button
        key={player.number}
        onClick={() => setSelectedPlayer({ player, teamName })}
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
            name={player.name}
            number={player.number}
            playerId={player.playerId}
            position={player.position}
            team={team}
          />
        </div>

        {/* Player Number + Surname Badge (FotMob Style) */}
        <div className="mt-1.5 text-center max-w-[95px] sm:max-w-[115px]">
          <span className="font-bold text-white text-[10px] sm:text-[11px] leading-tight block truncate drop-shadow-[0_2px_4px_rgba(0,0,0,1)] bg-slate-950/90 backdrop-blur-sm border border-white/10 px-2 py-0.5 rounded-md">
            <span className="text-slate-400 font-mono text-[9px] mr-1">#{player.number}</span>
            <span>{surname}</span>
          </span>

          {/* Event Icons (Goals, Assists, Cards, Captain) */}
          <div className="flex items-center justify-center gap-1 mt-0.5">
            {Boolean(player.isCaptain) && (
              <span className="text-[8px] font-mono font-bold text-[#c3ff00] bg-black/80 px-1 rounded border border-[#c3ff00]/30">
                (C)
              </span>
            )}
            {Boolean(player.goals && player.goals > 0) && (
              <span className="text-[10px]" title={`${player.goals} Gol`}>
                ⚽{player.goals! > 1 ? `x${player.goals}` : ""}
              </span>
            )}
            {Boolean(player.assists && player.assists > 0) && (
              <span className="text-[10px]" title="Assist">
                👟
              </span>
            )}
            {Boolean(player.yellowCards && player.yellowCards > 0) && (
              <span className="text-[8px] bg-amber-400 text-black px-1 font-bold rounded">
                🟨
              </span>
            )}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Controller Bar: View Selector */}
      <div className="bg-pitch-900 border border-pitch-800 p-3 sm:p-4 rounded-3xl flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold">
          <button
            onClick={() => setViewMode("dual")}
            className={cn(
              "px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5",
              viewMode === "dual"
                ? "bg-[#c3ff00] text-slate-950 shadow-md"
                : "bg-pitch-950 text-slate-300 hover:text-white border border-pitch-800"
            )}
          >
            <span>🏟️ Full Pitch Tactical View</span>
          </button>

          <button
            onClick={() => setViewMode("home")}
            className={cn(
              "px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5",
              viewMode === "home"
                ? "bg-[#c3ff00] text-slate-950 shadow-md"
                : "bg-pitch-950 text-slate-300 hover:text-white border border-pitch-800"
            )}
          >
            <span>🟢 {homeTeamName} ({homeLineup.formation})</span>
          </button>

          <button
            onClick={() => setViewMode("away")}
            className={cn(
              "px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5",
              viewMode === "away"
                ? "bg-[#c3ff00] text-slate-950 shadow-md"
                : "bg-pitch-950 text-slate-300 hover:text-white border border-pitch-800"
            )}
          >
            <span>🔵 {awayTeamName} ({awayLineup.formation})</span>
          </button>

          <button
            onClick={() => setViewMode("table")}
            className={cn(
              "px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5",
              viewMode === "table"
                ? "bg-[#c3ff00] text-slate-950 shadow-md"
                : "bg-pitch-950 text-slate-300 hover:text-white border border-pitch-800"
            )}
          >
            <span>📋 Full Ratings Table</span>
          </button>
        </div>
      </div>

      {/* =========================================================
         1. FOTMOB / GOOGLE FULL PITCH TACTICAL VIEW
         ========================================================= */}
      {viewMode === "dual" && (
        <div className="relative overflow-hidden rounded-3xl border-2 border-pitch-750 bg-gradient-to-b from-[#121c15] via-[#0d1610] to-[#121c15] p-4 sm:p-8 shadow-2xl min-h-[960px] flex flex-col justify-between select-none">
          {/* Subtle Turf Stripes */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[repeating-linear-gradient(0deg,#000,#000_50px,#fff_50px,#fff_100px)]" />

          {/* White Chalk Pitch Markings */}
          {/* Outer Boundary */}
          <div className="absolute inset-4 sm:inset-6 border-2 border-white/20 rounded-2xl pointer-events-none" />
          
          {/* Halfway Line & Center Circle */}
          <div className="absolute top-1/2 left-4 sm:left-6 right-4 sm:right-6 h-0.5 bg-white/25 -translate-y-1/2 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-44 sm:h-44 rounded-full border-2 border-white/25 pointer-events-none flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
          </div>

          {/* Top Goal Box (Away side) */}
          <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 w-48 sm:w-72 h-20 sm:h-28 border-2 border-t-0 border-white/20 rounded-b-2xl pointer-events-none" />
          <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 w-24 sm:w-36 h-10 border-2 border-t-0 border-white/20 rounded-b pointer-events-none" />

          {/* Bottom Goal Box (Home side) */}
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-48 sm:w-72 h-20 sm:h-28 border-2 border-b-0 border-white/20 rounded-t-2xl pointer-events-none" />
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-24 sm:w-36 h-10 border-2 border-b-0 border-white/20 rounded-t pointer-events-none" />

          {/* TOP TEAM HEADER (FotMob Style Header) */}
          <div className="relative z-10 flex items-center justify-between text-xs font-mono px-4 py-3 rounded-2xl bg-black/60 backdrop-blur-md border border-pitch-750">
            <div className="flex items-center gap-2.5">
              <span className={cn("px-2 py-0.5 rounded-md font-black text-xs font-mono", getRatingBadgeClass(awayTeamAvg))}>
                {awayTeamAvg}
              </span>
              <span className="font-extrabold uppercase text-white text-sm tracking-tight">{awayTeamName}</span>
              <span className="text-cyan-300 font-bold">({awayLineup.formation})</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Away Team</span>
          </div>

          {/* TOP HALF: AWAY TEAM FORMATION */}
          <div className="relative z-10 flex flex-col justify-around gap-6 py-4">
            {awayRows.map((row, idx) => (
              <div key={idx} className="flex items-center justify-around w-full px-2 sm:px-8">
                {row.map((p) => renderPlayerNode(p, "away", awayTeamName))}
              </div>
            ))}
          </div>

          {/* CENTER PITCH BADGE */}
          <div className="relative z-10 flex items-center justify-center my-2 pointer-events-none">
            <span className="px-4 py-1 rounded-full bg-black/80 border border-white/15 text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest backdrop-blur-md">
              Halfway Line
            </span>
          </div>

          {/* BOTTOM HALF: HOME TEAM FORMATION */}
          <div className="relative z-10 flex flex-col justify-around gap-6 py-4">
            {homeRows.map((row, idx) => (
              <div key={idx} className="flex items-center justify-around w-full px-2 sm:px-8">
                {row.map((p) => renderPlayerNode(p, "home", homeTeamName))}
              </div>
            ))}
          </div>

          {/* BOTTOM TEAM HEADER (FotMob Style Header) */}
          <div className="relative z-10 flex items-center justify-between text-xs font-mono px-4 py-3 rounded-2xl bg-black/60 backdrop-blur-md border border-pitch-750">
            <div className="flex items-center gap-2.5">
              <span className={cn("px-2 py-0.5 rounded-md font-black text-xs font-mono", getRatingBadgeClass(homeTeamAvg))}>
                {homeTeamAvg}
              </span>
              <span className="font-extrabold uppercase text-white text-sm tracking-tight">{homeTeamName}</span>
              <span className="text-[#c3ff00] font-bold">({homeLineup.formation})</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Home Team</span>
          </div>

          {/* FOOTER COACH BAR (FotMob Style Coach Bar) */}
          <div className="relative z-10 mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-300">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-pitch-900 border border-pitch-750 flex items-center justify-center overflow-hidden">
                {homeLineup.manager?.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={homeLineup.manager.photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-3 h-3 text-[#c3ff00]" />
                )}
              </div>
              <span className="font-bold text-slate-200">{homeLineup.manager?.name || `Coach ${homeTeamName}`}</span>
            </div>

            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Head Coach</span>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-200">{awayLineup.manager?.name || `Coach ${awayTeamName}`}</span>
              <div className="w-6 h-6 rounded-full bg-pitch-900 border border-pitch-750 flex items-center justify-center overflow-hidden">
                {awayLineup.manager?.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={awayLineup.manager.photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-3 h-3 text-cyan-400" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
         2. SINGLE TEAM HALF PITCH ZOOM VIEW
         ========================================================= */}
      {(viewMode === "home" || viewMode === "away") && (
        <div className="relative overflow-hidden rounded-3xl border-2 border-pitch-750 bg-gradient-to-b from-[#121c15] via-[#0d1610] to-[#121c15] p-4 sm:p-8 shadow-2xl min-h-[600px] flex flex-col justify-between select-none">
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[repeating-linear-gradient(0deg,#000,#000_40px,#fff_40px,#fff_80px)]" />
          <div className="absolute inset-4 sm:inset-6 border-2 border-white/20 rounded-2xl pointer-events-none" />
          <div className="absolute top-1/2 left-4 sm:left-6 right-4 sm:right-6 h-0.5 bg-white/25 -translate-y-1/2 pointer-events-none" />

          {/* Team Label */}
          <div className="relative z-10 flex items-center justify-between text-xs font-mono text-white bg-black/60 px-4 py-2.5 rounded-2xl border border-pitch-750">
            <div className="flex items-center gap-2">
              <span className={cn("px-2 py-0.5 rounded-md font-black text-xs font-mono", getRatingBadgeClass(viewMode === "home" ? homeTeamAvg : awayTeamAvg))}>
                {viewMode === "home" ? homeTeamAvg : awayTeamAvg}
              </span>
              <span className="font-extrabold uppercase">
                {viewMode === "home" ? homeTeamName : awayTeamName} ({viewMode === "home" ? homeLineup.formation : awayLineup.formation})
              </span>
            </div>
            <span className="text-[10px] text-[#c3ff00]">Click player for details</span>
          </div>

          {/* Rows */}
          <div className="relative z-10 flex-1 flex flex-col justify-around py-6 gap-6">
            {(viewMode === "home" ? organizeFormation(homeLineup.starters || [], homeLineup.formation || "4-3-3", false) : awayRows).map((row, idx) => (
              <div key={idx} className="flex items-center justify-around w-full px-2 sm:px-8">
                {row.map((p) => renderPlayerNode(p, viewMode === "home" ? "home" : "away", viewMode === "home" ? homeTeamName : awayTeamName))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
         3. DETAILED STATS TABLE
         ========================================================= */}
      {viewMode === "table" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Home Team Table */}
          <div className="bg-pitch-900 border border-pitch-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-pitch-800">
              <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-tight flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#c3ff00]" />
                <span>{homeTeamName}</span>
              </h3>
              <span className="text-xs font-mono text-[#c3ff00] font-bold">
                {homeLineup.formation}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-pitch-800 text-slate-400 uppercase font-mono text-[10px]">
                    <th className="py-2.5 px-2">No</th>
                    <th className="py-2.5 px-2">Player</th>
                    <th className="py-2.5 px-2">Pos</th>
                    <th className="py-2.5 px-2 text-right">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pitch-850">
                  {homeLineup.starters?.map((p) => (
                    <tr
                      key={p.number}
                      onClick={() => setSelectedPlayer({ player: p, teamName: homeTeamName })}
                      className="hover:bg-pitch-850/60 transition-colors cursor-pointer"
                    >
                      <td className="py-2.5 px-2 font-mono font-bold text-slate-400">
                        #{p.number}
                      </td>
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-pitch-950 border border-pitch-750 flex items-center justify-center overflow-hidden shrink-0">
                            <PlayerAvatar
                              photoUrl={p.photoUrl}
                              name={p.name}
                              number={p.number}
                              playerId={p.playerId}
                              position={p.position}
                              team="home"
                            />
                          </div>
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

          {/* Away Team Table */}
          <div className="bg-pitch-900 border border-pitch-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-pitch-800">
              <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-tight flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span>{awayTeamName}</span>
              </h3>
              <span className="text-xs font-mono text-cyan-400 font-bold">
                {awayLineup.formation}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-pitch-800 text-slate-400 uppercase font-mono text-[10px]">
                    <th className="py-2.5 px-2">No</th>
                    <th className="py-2.5 px-2">Player</th>
                    <th className="py-2.5 px-2">Pos</th>
                    <th className="py-2.5 px-2 text-right">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pitch-850">
                  {awayLineup.starters?.map((p) => (
                    <tr
                      key={p.number}
                      onClick={() => setSelectedPlayer({ player: p, teamName: awayTeamName })}
                      className="hover:bg-pitch-850/60 transition-colors cursor-pointer"
                    >
                      <td className="py-2.5 px-2 font-mono font-bold text-slate-400">
                        #{p.number}
                      </td>
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-pitch-950 border border-pitch-750 flex items-center justify-center overflow-hidden shrink-0">
                            <PlayerAvatar
                              photoUrl={p.photoUrl}
                              name={p.name}
                              number={p.number}
                              playerId={p.playerId}
                              position={p.position}
                              team="away"
                            />
                          </div>
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

      {/* Substitutes / Bench Section */}
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
                onClick={() => setSelectedPlayer({ player: b, teamName: homeTeamName })}
                className="flex items-center justify-between p-2.5 rounded-xl bg-pitch-950 border border-pitch-800/80 hover:border-pitch-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-pitch-900 border border-pitch-750 flex items-center justify-center overflow-hidden shrink-0">
                    <PlayerAvatar
                      photoUrl={b.photoUrl}
                      name={b.name}
                      number={b.number}
                      playerId={b.playerId}
                      position={b.position}
                      team="home"
                    />
                  </div>
                  <div className="truncate">
                    <span className="font-semibold text-slate-200 block truncate">
                      {b.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono uppercase">
                      #{b.number} • {b.position}
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
                onClick={() => setSelectedPlayer({ player: b, teamName: awayTeamName })}
                className="flex items-center justify-between p-2.5 rounded-xl bg-pitch-950 border border-pitch-800/80 hover:border-pitch-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-pitch-900 border border-pitch-750 flex items-center justify-center overflow-hidden shrink-0">
                    <PlayerAvatar
                      photoUrl={b.photoUrl}
                      name={b.name}
                      number={b.number}
                      playerId={b.playerId}
                      position={b.position}
                      team="away"
                    />
                  </div>
                  <div className="truncate">
                    <span className="font-semibold text-slate-200 block truncate">
                      {b.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono uppercase">
                      #{b.number} • {b.position}
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

      {/* Interactive Player Detail Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-pitch-900 border border-pitch-750 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 relative">
            <button
              onClick={() => setSelectedPlayer(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-pitch-950 border border-pitch-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-pitch-950 border-2 border-[#c3ff00] overflow-hidden flex items-center justify-center shadow-lg shrink-0">
                <PlayerAvatar
                  photoUrl={selectedPlayer.player.photoUrl}
                  name={selectedPlayer.player.name}
                  number={selectedPlayer.player.number}
                  playerId={selectedPlayer.player.playerId}
                  position={selectedPlayer.player.position}
                  team={selectedPlayer.teamName === homeTeamName ? "home" : "away"}
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#c3ff00]">
                    #{selectedPlayer.player.number}
                  </span>
                  <span className="text-xs font-mono text-slate-400 uppercase">
                    {selectedPlayer.player.position}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-100">
                  {selectedPlayer.player.name}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {selectedPlayer.teamName}
                </span>
              </div>
            </div>

            {/* Rating Highlight */}
            <div className="p-4 bg-pitch-950 rounded-2xl border border-pitch-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 block">
                  Opta Performance Rating
                </span>
                <span className="text-2xl font-black font-mono text-slate-100">
                  {formatRating(selectedPlayer.player.rating)} / 10.0
                </span>
              </div>

              {selectedPlayer.player.isMotm && (
                <div className="px-3 py-1.5 rounded-xl bg-[#0091ea] text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow">
                  <Star className="w-4 h-4 fill-white" />
                  <span>Man of the Match</span>
                </div>
              )}
            </div>

            {/* In-Game Telemetry Stats */}
            <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
              <div className="p-3 bg-pitch-950 rounded-xl border border-pitch-800">
                <span className="text-slate-500 block text-[10px]">Goals Scored</span>
                <span className="text-base font-bold text-slate-200">
                  {selectedPlayer.player.goals || 0}
                </span>
              </div>

              <div className="p-3 bg-pitch-950 rounded-xl border border-pitch-800">
                <span className="text-slate-500 block text-[10px]">Assists</span>
                <span className="text-base font-bold text-slate-200">
                  {selectedPlayer.player.assists || 0}
                </span>
              </div>

              <div className="p-3 bg-pitch-950 rounded-xl border border-pitch-800">
                <span className="text-slate-500 block text-[10px]">Yellow Cards</span>
                <span className="text-base font-bold text-amber-400">
                  {selectedPlayer.player.yellowCards || 0}
                </span>
              </div>

              <div className="p-3 bg-pitch-950 rounded-xl border border-pitch-800">
                <span className="text-slate-500 block text-[10px]">Squad Role</span>
                <span className="text-base font-bold text-[#c3ff00]">
                  {selectedPlayer.player.isCaptain ? "Captain (C)" : "Starter"}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedPlayer(null)}
              className="w-full py-3 rounded-xl bg-[#c3ff00] hover:bg-[#b0e600] text-slate-950 font-bold text-xs font-mono transition-colors shadow-md"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
