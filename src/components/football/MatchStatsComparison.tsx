"use client";

import React from "react";
import { Zap, Activity, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchStatsComparisonProps {
  homeTeamName: string;
  awayTeamName: string;
  stats?: {
    possessionHome: number;
    possessionAway: number;
    shotsHome: number;
    shotsAway: number;
    shotsOnTargetHome: number;
    shotsOnTargetAway: number;
    shotsOffTargetHome?: number;
    shotsOffTargetAway?: number;
    blockedShotsHome?: number;
    blockedShotsAway?: number;
    cornersHome: number;
    cornersAway: number;
    foulsHome: number;
    foulsAway: number;
    yellowCardsHome?: number;
    yellowCardsAway?: number;
    redCardsHome?: number;
    redCardsAway?: number;
    offsidesHome?: number;
    offsidesAway?: number;
    savesHome?: number;
    savesAway?: number;
    bigChancesHome?: number;
    bigChancesAway?: number;
    passesHome?: number;
    passesAway?: number;
    passAccuracyHome?: number;
    passAccuracyAway?: number;
    xgHome?: number;
    xgAway?: number;
  };
}

export function MatchStatsComparison({
  homeTeamName,
  awayTeamName,
  stats,
}: MatchStatsComparisonProps) {
  if (!stats) {
    return (
      <div className="bg-pitch-900 border border-pitch-800 rounded-3xl p-8 shadow-xl text-center space-y-2">
        <Zap className="w-8 h-8 text-slate-600 mx-auto" />
        <h4 className="text-xs font-mono font-bold text-slate-300 uppercase">
          Statistik Pertandingan Belum Tersedia
        </h4>
        <p className="text-[11px] text-slate-500 font-sans">
          Data statistik resmi akan diperbarui saat penyedia data mengirimkan telemetri pertandingan.
        </p>
      </div>
    );
  }

  // Row renderer for comparative stat bar
  const renderStatRow = (
    label: string,
    homeVal?: number | string,
    awayVal?: number | string,
    isPercentage = false
  ) => {
    if (homeVal === undefined && awayVal === undefined) return null;

    const numHome = typeof homeVal === "number" ? homeVal : parseFloat(String(homeVal || 0));
    const numAway = typeof awayVal === "number" ? awayVal : parseFloat(String(awayVal || 0));
    const total = numHome + numAway;

    const homeWidth = total > 0 ? Math.max(8, Math.min(92, Math.round((numHome / total) * 100))) : 50;
    const awayWidth = 100 - homeWidth;

    return (
      <div className="space-y-1.5 py-2.5 border-b border-pitch-850 last:border-0 font-sans">
        <div className="flex items-center justify-between text-xs font-mono font-bold">
          <span className="text-[#c3ff00] text-sm font-black">
            {homeVal !== undefined ? `${homeVal}${isPercentage ? "%" : ""}` : "—"}
          </span>
          <span className="text-slate-300 uppercase text-[11px] tracking-wide font-sans font-semibold">
            {label}
          </span>
          <span className="text-cyan-400 text-sm font-black">
            {awayVal !== undefined ? `${awayVal}${isPercentage ? "%" : ""}` : "—"}
          </span>
        </div>

        {/* Dual Color Comparison Bar */}
        <div className="h-2 rounded-full bg-pitch-950 flex overflow-hidden border border-pitch-800">
          <div
            style={{ width: `${homeWidth}%` }}
            className="bg-[#c3ff00] h-full transition-all duration-500"
          />
          <div
            style={{ width: `${awayWidth}%` }}
            className="bg-cyan-400 h-full transition-all duration-500"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-pitch-900 border border-pitch-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-pitch-800">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#c3ff00]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
            Statistik Pertandingan Resmi (Opta / Data Provider)
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono font-bold">
          <span className="text-[#c3ff00] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#c3ff00]" />
            <span>{homeTeamName}</span>
          </span>
          <span className="text-cyan-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>{awayTeamName}</span>
          </span>
        </div>
      </div>

      {/* Main Stats Rows */}
      <div className="space-y-1">
        {renderStatRow("Penguasaan Bola", stats.possessionHome, stats.possessionAway, true)}
        {renderStatRow("Total Tembakan", stats.shotsHome, stats.shotsAway)}
        {renderStatRow("Tembakan Tepat Sasaran", stats.shotsOnTargetHome, stats.shotsOnTargetAway)}
        {renderStatRow("Tembakan Melenceng", stats.shotsOffTargetHome, stats.shotsOffTargetAway)}
        {renderStatRow("Tembakan Terblokir", stats.blockedShotsHome, stats.blockedShotsAway)}
        {renderStatRow("Tendangan Sudut", stats.cornersHome, stats.cornersAway)}
        {renderStatRow("Pelanggaran", stats.foulsHome, stats.foulsAway)}
        {renderStatRow("Kartu Kuning", stats.yellowCardsHome, stats.yellowCardsAway)}
        {renderStatRow("Kartu Merah", stats.redCardsHome, stats.redCardsAway)}
        {renderStatRow("Offside", stats.offsidesHome, stats.offsidesAway)}
        {renderStatRow("Penyelamatan Kiper", stats.savesHome, stats.savesAway)}
        {renderStatRow("Total Operan", stats.passesHome, stats.passesAway)}
        {renderStatRow("Akurasi Operan", stats.passAccuracyHome, stats.passAccuracyAway, true)}
        {renderStatRow("Expected Goals (xG)", stats.xgHome, stats.xgAway)}
      </div>
    </div>
  );
}
