"use client";

import React, { useState } from "react";
import { ProviderMatchLineup, LineupPlayer } from "@/lib/football/types";
import {
  Star,
  Shield,
  User,
  Activity,
  Award,
  Zap,
  Info,
  X,
  ChevronRight,
  TrendingUp,
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

export function TacticalPitchLineup({
  homeLineup,
  awayLineup,
  homeTeamName,
  awayTeamName,
  homeScore = 0,
  awayScore = 0,
}: TacticalPitchLineupProps) {
  const [selectedTeam, setSelectedTeam] = useState<"home" | "away">("home");
  const [viewMode, setViewMode] = useState<"pitch" | "table">("pitch");
  const [selectedPlayer, setSelectedPlayer] = useState<LineupPlayer | null>(null);

  const currentLineup = selectedTeam === "home" ? homeLineup : awayLineup;
  const currentTeamName = selectedTeam === "home" ? homeTeamName : awayTeamName;

  const formatRating = (rating?: number | string) => {
    if (!rating) return "7.0";
    const num = typeof rating === "string" ? parseFloat(rating) : rating;
    return num.toFixed(1);
  };

  const getRatingColor = (rating?: number | string) => {
    if (!rating) return "bg-pitch-850 text-slate-300 border-pitch-700";
    const num = typeof rating === "string" ? parseFloat(rating) : rating;
    if (num >= 8.5) return "bg-emerald-950 text-emerald-400 border-emerald-700 shadow-[0_0_10px_rgba(52,211,153,0.3)]";
    if (num >= 7.5) return "bg-cyan-950 text-cyan-300 border-cyan-700";
    if (num >= 6.5) return "bg-pitch-850 text-slate-200 border-pitch-700";
    return "bg-amber-950 text-amber-400 border-amber-800";
  };

  // Group starters into tactical horizontal rows for realistic pitch rendering (GK -> DEF -> MID -> ATT)
  const organizeByFormationRows = (starters: LineupPlayer[], formation: string) => {
    if (!starters || starters.length === 0) return [];
    
    // Parse formation e.g. "3-4-3" or "4-2-3-1" or "4-3-3"
    const parts = (formation || "4-3-3").split("-").map((n) => parseInt(n, 10)).filter((n) => !isNaN(n));
    
    const rows: LineupPlayer[][] = [];
    // Row 0: Goalkeeper (always first player)
    rows.push([starters[0]]);
    
    let currentIndex = 1;
    parts.forEach((count) => {
      const rowPlayers = starters.slice(currentIndex, currentIndex + count);
      if (rowPlayers.length > 0) {
        rows.push(rowPlayers);
      }
      currentIndex += count;
    });

    // If any leftover
    if (currentIndex < starters.length) {
      rows.push(starters.slice(currentIndex));
    }

    return rows;
  };

  const rows = organizeByFormationRows(currentLineup?.starters || [], currentLineup?.formation || "4-3-3");

  return (
    <div className="space-y-6 font-sans">
      {/* Top Controller Bar: Team Selector & View Toggle */}
      <div className="bg-pitch-900 border border-pitch-800 p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        {/* Team Selector Tabs */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setSelectedTeam("home")}
            className={cn(
              "flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2",
              selectedTeam === "home"
                ? "bg-[#c3ff00] text-slate-950 shadow-md"
                : "bg-pitch-950 text-slate-300 hover:text-white border border-pitch-800"
            )}
          >
            <span>{homeTeamName}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 font-mono">
              {homeLineup.formation}
            </span>
          </button>

          <button
            onClick={() => setSelectedTeam("away")}
            className={cn(
              "flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2",
              selectedTeam === "away"
                ? "bg-[#c3ff00] text-slate-950 shadow-md"
                : "bg-pitch-950 text-slate-300 hover:text-white border border-pitch-800"
            )}
          >
            <span>{awayTeamName}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 font-mono">
              {awayLineup.formation}
            </span>
          </button>
        </div>

        {/* View Mode Toggle: Visual Pitch vs Table */}
        <div className="flex items-center gap-1.5 bg-pitch-950 p-1 rounded-xl border border-pitch-800 text-xs font-mono">
          <button
            onClick={() => setViewMode("pitch")}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all font-bold",
              viewMode === "pitch"
                ? "bg-pitch-800 text-[#c3ff00] shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            🏟️ Lapangan Visual
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all font-bold",
              viewMode === "table"
                ? "bg-pitch-800 text-[#c3ff00] shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            📋 Tabel Rating
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === "pitch" ? (
        /* =========================================================
           1. REALISTIC TACTICAL FOOTBALL PITCH (LAPANGAN HIJAU)
           ========================================================= */
        <div className="relative overflow-hidden rounded-3xl border-2 border-pitch-750 bg-gradient-to-b from-[#0e3b1c] via-[#092b14] to-[#0e3b1c] p-4 sm:p-8 shadow-2xl min-h-[580px] flex flex-col justify-between select-none">
          {/* Subtle Turf Stripes */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[repeating-linear-gradient(0deg,#000,#000_40px,#fff_40px,#fff_80px)]" />

          {/* White Chalk Pitch Markings */}
          {/* Outer Boundary */}
          <div className="absolute inset-3.5 sm:inset-5 border-2 border-white/25 rounded-2xl pointer-events-none" />
          
          {/* Halfway Line & Center Circle */}
          <div className="absolute top-1/2 left-3.5 sm:left-5 right-3.5 sm:right-5 h-0.5 bg-white/25 -translate-y-1/2 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 border-white/25 pointer-events-none flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white/40" />
          </div>

          {/* Top Goal Box (Away side) */}
          <div className="absolute top-3.5 sm:top-5 left-1/2 -translate-x-1/2 w-48 sm:w-64 h-20 sm:h-24 border-2 border-t-0 border-white/25 rounded-b-xl pointer-events-none" />
          <div className="absolute top-3.5 sm:top-5 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-10 border-2 border-t-0 border-white/25 rounded-b pointer-events-none" />

          {/* Bottom Goal Box (Home side) */}
          <div className="absolute bottom-3.5 sm:bottom-5 left-1/2 -translate-x-1/2 w-48 sm:w-64 h-20 sm:h-24 border-2 border-b-0 border-white/25 rounded-t-xl pointer-events-none" />
          <div className="absolute bottom-3.5 sm:bottom-5 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-10 border-2 border-b-0 border-white/25 rounded-t pointer-events-none" />

          {/* Corner Arcs */}
          <div className="absolute top-3.5 sm:top-5 left-3.5 sm:left-5 w-6 h-6 border-b border-r border-white/25 rounded-br-full pointer-events-none" />
          <div className="absolute top-3.5 sm:top-5 right-3.5 sm:right-5 w-6 h-6 border-b border-l border-white/25 rounded-bl-full pointer-events-none" />
          <div className="absolute bottom-3.5 sm:bottom-5 left-3.5 sm:left-5 w-6 h-6 border-t border-r border-white/25 rounded-tr-full pointer-events-none" />
          <div className="absolute bottom-3.5 sm:bottom-5 right-3.5 sm:right-5 w-6 h-6 border-t border-l border-white/25 rounded-tl-full pointer-events-none" />

          {/* Team Info Watermark on Pitch */}
          <div className="relative z-10 flex items-center justify-between text-xs font-mono text-emerald-200/60 pb-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#c3ff00]" />
              <span className="font-extrabold uppercase text-slate-100">{currentTeamName}</span>
              <span>({currentLineup.formation})</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider">Klik pemain untuk detail performa</span>
          </div>

          {/* Player Nodes Rendered per Formation Row */}
          <div className="relative z-10 flex-1 flex flex-col justify-around py-4 sm:py-6 gap-6">
            {rows.map((rowPlayers, rowIndex) => (
              <div
                key={rowIndex}
                className="flex items-center justify-around w-full px-2 sm:px-6"
              >
                {rowPlayers.map((player) => {
                  const ratingStr = formatRating(player.rating);
                  const ratingClass = getRatingColor(player.rating);

                  return (
                    <button
                      key={player.number}
                      onClick={() => setSelectedPlayer(player)}
                      className="group relative flex flex-col items-center focus:outline-none transition-transform hover:scale-110 active:scale-95"
                    >
                      {/* Rating Badge Floating on Top */}
                      <div className="mb-1 flex items-center gap-0.5">
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold border shadow-lg flex items-center gap-1",
                            ratingClass
                          )}
                        >
                          {player.isMotm && (
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-300" />
                          )}
                          <span>{ratingStr}</span>
                        </span>
                      </div>

                      {/* Circular Avatar / Photo Container */}
                      <div className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-pitch-950 border-2 border-white/80 group-hover:border-[#c3ff00] transition-colors shadow-2xl flex items-center justify-center overflow-hidden">
                        {player.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={player.photoUrl}
                            alt={player.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-tr from-slate-900 to-pitch-800 flex items-center justify-center text-slate-200 font-mono font-black text-xs">
                            {player.number}
                          </div>
                        )}

                        {/* Shirt Number Mini Badge */}
                        <div className="absolute bottom-0 right-0 bg-black/90 text-white font-mono font-bold text-[8px] px-1 rounded-tl">
                          #{player.number}
                        </div>
                      </div>

                      {/* Player Name & Events Label */}
                      <div className="mt-1 text-center max-w-[85px] sm:max-w-[100px]">
                        <span className="font-bold text-white text-[11px] sm:text-xs leading-tight block truncate drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                          {player.name.split(" ").slice(-1)[0]}
                        </span>
                        
                        {/* Event Icons */}
                        <div className="flex items-center justify-center gap-1 mt-0.5">
                          {player.isCaptain && (
                            <span className="text-[9px] font-mono font-bold text-[#c3ff00] bg-black/60 px-1 rounded">
                              (C)
                            </span>
                          )}
                          {player.goals && player.goals > 0 && (
                            <span className="text-[10px]" title={`${player.goals} Gol`}>
                              ⚽{player.goals > 1 ? `x${player.goals}` : ""}
                            </span>
                          )}
                          {player.assists && player.assists > 0 && (
                            <span className="text-[10px]" title="Assist">
                              👟
                            </span>
                          )}
                          {player.yellowCards && player.yellowCards > 0 && (
                            <span className="text-[9px] bg-amber-400 text-black px-1 font-bold rounded">
                              🟨
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Bottom Pitch Legend */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-[10px] font-mono text-emerald-100/70">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>8.5+ Bintang Pertandingan</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>7.5 - 8.4 Sangat Baik</span>
              </span>
            </div>
            <span>⭐ Lencana MOTM = Man of the Match</span>
          </div>
        </div>
      ) : (
        /* =========================================================
           2. DETAILED STATS TABLE (TABEL RATING LENGKAP)
           ========================================================= */
        <div className="bg-pitch-900 border border-pitch-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-pitch-800">
            <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-tight">
              Susunan Pemain Utama: {currentTeamName}
            </h3>
            <span className="text-xs font-mono text-[#c3ff00] font-bold">
              Formasi: {currentLineup.formation}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-pitch-800 text-slate-400 uppercase font-mono text-[10px]">
                  <th className="py-2.5 px-3">No</th>
                  <th className="py-2.5 px-3">Pemain</th>
                  <th className="py-2.5 px-3">Posisi</th>
                  <th className="py-2.5 px-3">Gol / Momen</th>
                  <th className="py-2.5 px-3 text-right">Rating Performa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pitch-850">
                {currentLineup.starters.map((p) => {
                  const ratingStr = formatRating(p.rating);
                  const ratingClass = getRatingColor(p.rating);

                  return (
                    <tr
                      key={p.number}
                      onClick={() => setSelectedPlayer(p)}
                      className="hover:bg-pitch-850/60 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-3 font-mono font-bold text-slate-400">
                        #{p.number}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-pitch-950 border border-pitch-750 flex items-center justify-center overflow-hidden shrink-0">
                            {p.photoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={p.photoUrl}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-100 block">
                              {p.name}
                            </span>
                            {p.isCaptain && (
                              <span className="text-[10px] font-mono font-bold text-[#c3ff00]">
                                Kapten Tim (C)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300 font-semibold uppercase">
                        {p.position}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          {p.goals && p.goals > 0 && (
                            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-bold">
                              ⚽ {p.goals} Gol
                            </span>
                          )}
                          {p.assists && p.assists > 0 && (
                            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono font-bold">
                              👟 1 Assist
                            </span>
                          )}
                          {p.yellowCards && p.yellowCards > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-400 text-black text-[10px] font-mono font-bold">
                              🟨 Kartu Kuning
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-black border",
                            ratingClass
                          )}
                        >
                          {p.isMotm && (
                            <Star className="w-3 h-3 fill-amber-400 text-amber-300" />
                          )}
                          <span>{ratingStr}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bench (Pemain Cadangan) & Manager Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Substitutes */}
        <div className="md:col-span-8 bg-pitch-900 border border-pitch-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-pitch-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              Pemain Cadangan (Substitutes)
            </h4>
            <span className="text-[11px] font-mono text-slate-400">
              {currentLineup.bench?.length || 0} Pemain
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
            {currentLineup.bench?.map((b) => (
              <div
                key={b.number}
                onClick={() => setSelectedPlayer(b)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-pitch-950 border border-pitch-800/80 hover:border-pitch-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono text-slate-500 text-[11px] w-5 text-center font-bold">
                    #{b.number}
                  </span>
                  <div className="truncate">
                    <span className="font-semibold text-slate-200 block truncate">
                      {b.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono uppercase">
                      {b.position}
                    </span>
                  </div>
                </div>

                {b.rating && (
                  <span className="font-mono text-xs font-extrabold text-[#c3ff00] px-2 py-0.5 rounded bg-pitch-900 border border-pitch-750">
                    {formatRating(b.rating)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Manager / Coach */}
        <div className="md:col-span-4 bg-pitch-900 border border-pitch-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">
              Pelatih Utama (Head Coach)
            </span>
            <h4 className="text-base font-extrabold text-slate-100 font-sans">
              {currentLineup.manager?.name || "Pelatih Kepala"}
            </h4>
            <span className="text-xs text-[#c3ff00] font-mono font-bold">
              {currentTeamName}
            </span>
          </div>

          <div className="p-3 bg-pitch-950 rounded-xl border border-pitch-800 text-[11px] text-slate-400 font-mono space-y-1">
            <div className="flex justify-between">
              <span>Formasi Taktis:</span>
              <span className="text-slate-200 font-bold">{currentLineup.formation}</span>
            </div>
            <div className="flex justify-between">
              <span>Pendekatan:</span>
              <span className="text-slate-200">High Pressing & Counter</span>
            </div>
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
                {selectedPlayer.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedPlayer.photoUrl}
                    alt={selectedPlayer.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-[#c3ff00]" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#c3ff00]">
                    #{selectedPlayer.number}
                  </span>
                  <span className="text-xs font-mono text-slate-400 uppercase">
                    {selectedPlayer.position}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-100">
                  {selectedPlayer.name}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {currentTeamName}
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
                  {formatRating(selectedPlayer.rating)} / 10.0
                </span>
              </div>

              {selectedPlayer.isMotm && (
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
                  {selectedPlayer.goals || 0}
                </span>
              </div>

              <div className="p-3 bg-pitch-950 rounded-xl border border-pitch-800">
                <span className="text-slate-500 block text-[10px]">Assist</span>
                <span className="text-base font-bold text-slate-200">
                  {selectedPlayer.assists || 0}
                </span>
              </div>

              <div className="p-3 bg-pitch-950 rounded-xl border border-pitch-800">
                <span className="text-slate-500 block text-[10px]">Kartu Kuning</span>
                <span className="text-base font-bold text-amber-400">
                  {selectedPlayer.yellowCards || 0}
                </span>
              </div>

              <div className="p-3 bg-pitch-950 rounded-xl border border-pitch-800">
                <span className="text-slate-500 block text-[10px]">Status Peran</span>
                <span className="text-base font-bold text-[#c3ff00]">
                  {selectedPlayer.isCaptain ? "Kapten (C)" : "Starter"}
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
