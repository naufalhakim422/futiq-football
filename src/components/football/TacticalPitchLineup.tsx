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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TacticalPitchLineupProps {
  homeLineup: ProviderMatchLineup;
  awayLineup: ProviderMatchLineup;
  homeTeamName: string;
  awayTeamName: string;
  homeScore?: number;
  awayScore?: number;
}

// Robust Player Avatar component with automatic seamless fallback
function PlayerAvatar({
  photoUrl,
  name,
  number,
  position,
  team = "home",
}: {
  photoUrl?: string;
  name: string;
  number: number;
  position?: string;
  team?: "home" | "away";
}) {
  const [imgError, setImgError] = useState(false);
  const isGk = position?.toUpperCase() === "GK";
  const isHome = team === "home";

  if (photoUrl && !imgError) {
    return (
      <div className="w-full h-full relative overflow-hidden bg-pitch-950 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrl}
          alt=""
          className="w-full h-full object-cover select-none"
          onError={() => setImgError(true)}
        />
        {/* Number mini-tag */}
        <div className="absolute bottom-0 right-0 bg-black/90 text-white font-mono font-bold text-[8px] px-1 rounded-tl">
          #{number}
        </div>
      </div>
    );
  }

  // Crisp, high-contrast 3D Jersey Avatar with shirt number
  const gradientColor = isGk
    ? "from-amber-400 via-amber-500 to-amber-600 text-slate-950 border-amber-300"
    : isHome
    ? "from-[#c3ff00] via-[#a6db00] to-[#88b800] text-slate-950 border-[#d8ff4d]"
    : "from-[#00d4ff] via-[#00a6e6] to-[#0077b3] text-slate-950 border-[#80e5ff]";

  return (
    <div
      className={cn(
        "w-full h-full bg-gradient-to-b flex flex-col items-center justify-center border shadow-inner select-none relative",
        gradientColor
      )}
    >
      <span className="font-mono font-black text-xs sm:text-sm leading-none drop-shadow-sm">
        {number}
      </span>
      <span className="font-mono text-[7px] sm:text-[8px] uppercase tracking-tighter font-extrabold leading-none mt-0.5 opacity-90">
        {position || (isGk ? "GK" : "MF")}
      </span>
    </div>
  );
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

  const formatRating = (rating?: number | string) => {
    if (!rating) return "7.0";
    const num = typeof rating === "string" ? parseFloat(rating) : rating;
    return num.toFixed(1);
  };

  const getRatingBadgeClass = (rating?: number | string) => {
    if (!rating) return "bg-pitch-900 text-slate-300 border-pitch-700";
    const num = typeof rating === "string" ? parseFloat(rating) : rating;
    if (num >= 8.5) return "bg-emerald-950 text-emerald-400 border-emerald-500 shadow-[0_0_12px_rgba(52,211,153,0.4)]";
    if (num >= 7.5) return "bg-cyan-950 text-cyan-300 border-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.3)]";
    if (num >= 6.5) return "bg-pitch-900 text-slate-200 border-pitch-700";
    return "bg-amber-950 text-amber-400 border-amber-800";
  };

  // Helper to split starters into tactical formation rows
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

  // Render player node on pitch
  const renderPlayerNode = (player: LineupPlayer, team: "home" | "away", teamName: string) => {
    const ratingStr = formatRating(player.rating);
    const ratingBadgeClass = getRatingBadgeClass(player.rating);

    return (
      <button
        key={player.number}
        onClick={() => setSelectedPlayer({ player, teamName })}
        className="group relative flex flex-col items-center focus:outline-none transition-transform hover:scale-110 active:scale-95"
      >
        {/* Rating Badge on Top */}
        <div className="mb-1">
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-black border shadow-lg flex items-center gap-1",
              ratingBadgeClass
            )}
          >
            {player.isMotm && (
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-300" />
            )}
            <span>{ratingStr}</span>
          </span>
        </div>

        {/* Circular Player Photo Avatar */}
        <div
          className={cn(
            "relative w-11 h-11 sm:w-13 sm:h-13 rounded-full border-2 transition-all shadow-2xl flex items-center justify-center overflow-hidden bg-pitch-950",
            team === "home"
              ? "border-[#c3ff00] group-hover:border-white shadow-[0_0_15px_rgba(195,255,0,0.35)]"
              : "border-cyan-400 group-hover:border-white shadow-[0_0_15px_rgba(34,211,238,0.35)]"
          )}
        >
          <PlayerAvatar
            photoUrl={player.photoUrl}
            name={player.name}
            number={player.number}
            position={player.position}
            team={team}
          />
        </div>

        {/* Player Name Tag */}
        <div className="mt-1 text-center max-w-[85px] sm:max-w-[100px]">
          <span className="font-bold text-white text-[10px] sm:text-[11px] leading-tight block truncate drop-shadow-[0_1px_4px_rgba(0,0,0,1)] bg-black/60 px-1.5 py-0.5 rounded-md">
            {player.name.split(" ").slice(-1)[0]}
          </span>

          {/* Event Badges */}
          <div className="flex items-center justify-center gap-1 mt-0.5">
            {Boolean(player.isCaptain) && (
              <span className="text-[9px] font-mono font-bold text-[#c3ff00] bg-black/70 px-1 rounded">
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
            <span>🏟️ Kedua Tim Berhadapan (Full Pitch)</span>
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
            <span>📋 Tabel Rating Lengkap</span>
          </button>
        </div>
      </div>

      {/* =========================================================
         1. UNIFIED FULL PITCH (KEDUA TIM BERHADAPAN ALA GOOGLE)
         ========================================================= */}
      {viewMode === "dual" && (
        <div className="relative overflow-hidden rounded-3xl border-2 border-pitch-750 bg-gradient-to-b from-[#0b3317] via-[#072410] to-[#0b3317] p-4 sm:p-8 shadow-2xl min-h-[920px] flex flex-col justify-between select-none">
          {/* Subtle Turf Stripes */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[repeating-linear-gradient(0deg,#000,#000_45px,#fff_45px,#fff_90px)]" />

          {/* White Chalk Pitch Markings */}
          {/* Outer Boundary */}
          <div className="absolute inset-4 sm:inset-6 border-2 border-white/30 rounded-2xl pointer-events-none" />
          
          {/* Halfway Line & Center Circle */}
          <div className="absolute top-1/2 left-4 sm:left-6 right-4 sm:right-6 h-0.5 bg-white/35 -translate-y-1/2 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-44 sm:h-44 rounded-full border-2 border-white/35 pointer-events-none flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-white/50" />
          </div>

          {/* Top Goal Box (Away side) */}
          <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 w-48 sm:w-72 h-20 sm:h-28 border-2 border-t-0 border-white/30 rounded-b-2xl pointer-events-none" />
          <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 w-24 sm:w-36 h-10 border-2 border-t-0 border-white/30 rounded-b pointer-events-none" />

          {/* Bottom Goal Box (Home side) */}
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-48 sm:w-72 h-20 sm:h-28 border-2 border-b-0 border-white/30 rounded-t-2xl pointer-events-none" />
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-24 sm:w-36 h-10 border-2 border-b-0 border-white/30 rounded-t pointer-events-none" />

          {/* TOP HALF: AWAY TEAM (BLUE) */}
          <div className="relative z-10 space-y-4 pb-6">
            <div className="flex items-center justify-between text-xs font-mono text-cyan-200 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-2xl border border-cyan-500/30">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#00d4ff]" />
                <span className="font-extrabold uppercase text-white">{awayTeamName}</span>
                <span className="text-cyan-300">({awayLineup.formation})</span>
              </div>
              <span className="text-[10px] text-slate-300 font-normal">Tim Tamu (Menghadap Bawah)</span>
            </div>

            {/* Away Formation Rows */}
            <div className="flex flex-col justify-around gap-6 py-2">
              {awayRows.map((row, idx) => (
                <div key={idx} className="flex items-center justify-around w-full px-2 sm:px-8">
                  {row.map((p) => renderPlayerNode(p, "away", awayTeamName))}
                </div>
              ))}
            </div>
          </div>

          {/* CENTER PITCH BADGE */}
          <div className="relative z-10 flex items-center justify-center my-2 pointer-events-none">
            <span className="px-4 py-1 rounded-full bg-black/70 border border-white/20 text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest backdrop-blur-md">
              Garis Tengah Lapangan
            </span>
          </div>

          {/* BOTTOM HALF: HOME TEAM (NEON GREEN) */}
          <div className="relative z-10 space-y-4 pt-6">
            {/* Home Formation Rows */}
            <div className="flex flex-col justify-around gap-6 py-2">
              {homeRows.map((row, idx) => (
                <div key={idx} className="flex items-center justify-around w-full px-2 sm:px-8">
                  {row.map((p) => renderPlayerNode(p, "home", homeTeamName))}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-emerald-200 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-2xl border border-[#c3ff00]/30">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#c3ff00] shadow-[0_0_8px_#c3ff00]" />
                <span className="font-extrabold uppercase text-white">{homeTeamName}</span>
                <span className="text-[#c3ff00]">({homeLineup.formation})</span>
              </div>
              <span className="text-[10px] text-slate-300 font-normal">Tuan Rumah (Menghadap Atas)</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
         2. SINGLE TEAM HALF PITCH ZOOM VIEW (HOME ATAU AWAY)
         ========================================================= */}
      {(viewMode === "home" || viewMode === "away") && (
        <div className="relative overflow-hidden rounded-3xl border-2 border-pitch-750 bg-gradient-to-b from-[#0b3317] via-[#072410] to-[#0b3317] p-4 sm:p-8 shadow-2xl min-h-[580px] flex flex-col justify-between select-none">
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[repeating-linear-gradient(0deg,#000,#000_40px,#fff_40px,#fff_80px)]" />
          <div className="absolute inset-4 sm:inset-6 border-2 border-white/30 rounded-2xl pointer-events-none" />
          <div className="absolute top-1/2 left-4 sm:left-6 right-4 sm:right-6 h-0.5 bg-white/35 -translate-y-1/2 pointer-events-none" />

          {/* Team Label */}
          <div className="relative z-10 flex items-center justify-between text-xs font-mono text-white bg-black/50 px-4 py-2 rounded-2xl border border-pitch-750">
            <span className="font-extrabold uppercase">
              {viewMode === "home" ? homeTeamName : awayTeamName} ({viewMode === "home" ? homeLineup.formation : awayLineup.formation})
            </span>
            <span className="text-[10px] text-[#c3ff00]">Klik pemain untuk detail</span>
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
         3. DETAILED STATS TABLE (TABEL RATING LENGKAP KEDUA TIM)
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
                    <th className="py-2.5 px-2">Pemain</th>
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
                          <div className="w-7 h-7 rounded-full bg-pitch-950 border border-pitch-750 flex items-center justify-center overflow-hidden shrink-0">
                            <PlayerAvatar
                              photoUrl={p.photoUrl}
                              name={p.name}
                              number={p.number}
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
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-mono font-black border", getRatingBadgeClass(p.rating))}>
                          {p.isMotm && <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-300" />}
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
                    <th className="py-2.5 px-2">Pemain</th>
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
                          <div className="w-7 h-7 rounded-full bg-pitch-950 border border-pitch-750 flex items-center justify-center overflow-hidden shrink-0">
                            <PlayerAvatar
                              photoUrl={p.photoUrl}
                              name={p.name}
                              number={p.number}
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
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-mono font-black border", getRatingBadgeClass(p.rating))}>
                          {p.isMotm && <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-300" />}
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
              <span>Cadangan: {homeTeamName}</span>
            </h4>
            <span className="text-[11px] font-mono text-slate-400">
              {homeLineup.bench?.length || 0} Pemain
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-sans">
            {homeLineup.bench?.map((b) => (
              <div
                key={b.number}
                onClick={() => setSelectedPlayer({ player: b, teamName: homeTeamName })}
                className="flex items-center justify-between p-2 rounded-xl bg-pitch-950 border border-pitch-800/80 hover:border-pitch-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-slate-500 text-[11px] w-4 font-bold">
                    #{b.number}
                  </span>
                  <span className="font-semibold text-slate-200 truncate">
                    {b.name}
                  </span>
                </div>
                {b.rating && (
                  <span className="font-mono text-xs font-bold text-[#c3ff00] px-1.5 py-0.5 rounded bg-pitch-900 border border-pitch-750">
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
              <span>Cadangan: {awayTeamName}</span>
            </h4>
            <span className="text-[11px] font-mono text-slate-400">
              {awayLineup.bench?.length || 0} Pemain
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-sans">
            {awayLineup.bench?.map((b) => (
              <div
                key={b.number}
                onClick={() => setSelectedPlayer({ player: b, teamName: awayTeamName })}
                className="flex items-center justify-between p-2 rounded-xl bg-pitch-950 border border-pitch-800/80 hover:border-pitch-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-slate-500 text-[11px] w-4 font-bold">
                    #{b.number}
                  </span>
                  <span className="font-semibold text-slate-200 truncate">
                    {b.name}
                  </span>
                </div>
                {b.rating && (
                  <span className="font-mono text-xs font-bold text-cyan-400 px-1.5 py-0.5 rounded bg-pitch-900 border border-pitch-750">
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
                  Rating Performa Opta
                </span>
                <span className="text-2xl font-black font-mono text-slate-100">
                  {formatRating(selectedPlayer.player.rating)} / 10.0
                </span>
              </div>

              {selectedPlayer.player.isMotm && (
                <div className="px-3 py-1.5 rounded-xl bg-amber-950 border border-amber-700 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>Man of the Match</span>
                </div>
              )}
            </div>

            {/* In-Game Telemetry Stats */}
            <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
              <div className="p-3 bg-pitch-950 rounded-xl border border-pitch-800">
                <span className="text-slate-500 block text-[10px]">Gol Dicetak</span>
                <span className="text-base font-bold text-slate-200">
                  {selectedPlayer.player.goals || 0}
                </span>
              </div>

              <div className="p-3 bg-pitch-950 rounded-xl border border-pitch-800">
                <span className="text-slate-500 block text-[10px]">Assist</span>
                <span className="text-base font-bold text-slate-200">
                  {selectedPlayer.player.assists || 0}
                </span>
              </div>

              <div className="p-3 bg-pitch-950 rounded-xl border border-pitch-800">
                <span className="text-slate-500 block text-[10px]">Kartu Kuning</span>
                <span className="text-base font-bold text-amber-400">
                  {selectedPlayer.player.yellowCards || 0}
                </span>
              </div>

              <div className="p-3 bg-pitch-950 rounded-xl border border-pitch-800">
                <span className="text-slate-500 block text-[10px]">Status Peran</span>
                <span className="text-base font-bold text-[#c3ff00]">
                  {selectedPlayer.player.isCaptain ? "Kapten (C)" : "Starter"}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedPlayer(null)}
              className="w-full py-3 rounded-xl bg-[#c3ff00] hover:bg-[#b0e600] text-slate-950 font-bold text-xs font-mono transition-colors shadow-md"
            >
              Tutup Rincian
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
