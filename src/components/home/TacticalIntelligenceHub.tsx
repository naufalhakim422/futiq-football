"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Activity, Zap, TrendingUp, Award, ChevronRight, BarChart2, ShieldCheck, Crosshair } from "lucide-react";
import { cn } from "@/lib/utils";

const TACTICAL_RADARS = [
  {
    team: "Arsenal",
    rival: "Manchester City",
    match: "Premier League Super Matchday",
    score: "2 - 1",
    status: "FULL TIME",
    xg: "1.84 vs 1.12",
    possession: "48% - 52%",
    pressingIntensity: "91% Territory Domination",
    keyInsight: "Rest defense with twin pivots neutralized rapid transition channels.",
  },
  {
    team: "Real Madrid",
    rival: "Bayern Munich",
    match: "UEFA Champions League Semifinal",
    score: "3 - 2",
    status: "LIVE 76'",
    xg: "2.41 vs 2.05",
    possession: "54% - 46%",
    pressingIntensity: "High Box Overload",
    keyInsight: "Direct vertical directness through inverted wingers yielded 4 big chances.",
  },
];

const TOP_PERFORMERS = [
  {
    rank: "01",
    name: "Erling Haaland",
    club: "Manchester City",
    metric: "18 Goals (14.2 xG)",
    rating: "8.9",
  },
  {
    rank: "02",
    name: "Bukayo Saka",
    club: "Arsenal",
    metric: "9 Goals / 11 Assists",
    rating: "8.7",
  },
  {
    rank: "03",
    name: "Vinícius Júnior",
    club: "Real Madrid",
    metric: "12 Goals / 8 Assists",
    rating: "8.6",
  },
  {
    rank: "04",
    name: "Kylian Mbappé",
    club: "Real Madrid",
    metric: "15 Goals (12.8 xG)",
    rating: "8.5",
  },
];

export function TacticalIntelligenceHub() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const currentRadar = TACTICAL_RADARS[activeTab];

  return (
    <div className="bg-pitch-900 border border-pitch-800 rounded-2xl overflow-hidden shadow-2xl font-sans">
      {/* Hub Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-pitch-950 via-pitch-900 to-pitch-950 border-b border-pitch-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#c3ff00]/10 border border-[#c3ff00]/30 flex items-center justify-center text-[#c3ff00]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#c3ff00]">
                TELEMETRY & MATCH DATA
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#c3ff00] animate-pulse" />
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-100 tracking-tight">
              Pusat Intelijen Taktik & Radar Pertandingan
            </h3>
          </div>
        </div>

        {/* Tab Selectors */}
        <div className="flex items-center gap-1.5 bg-pitch-950 p-1 rounded-xl border border-pitch-800 font-mono text-xs">
          {TACTICAL_RADARS.map((radar, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold transition-all",
                activeTab === idx
                  ? "bg-[#c3ff00] text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              {radar.team} vs {radar.rival.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-pitch-800">
        {/* Left: Tactical Radar Snapshot */}
        <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded bg-pitch-950 border border-pitch-750 text-[11px] font-mono font-bold text-slate-300">
              {currentRadar.match}
            </span>
            <span className={cn(
              "px-2.5 py-1 rounded text-[11px] font-mono font-bold tracking-wider",
              currentRadar.status.includes("LIVE")
                ? "bg-brand-red text-white animate-pulse"
                : "bg-pitch-850 text-slate-400 border border-pitch-750"
            )}>
              {currentRadar.status}
            </span>
          </div>

          {/* Match Score Display */}
          <div className="flex items-center justify-around py-4 bg-pitch-950/60 border border-pitch-800 rounded-xl">
            <div className="text-center space-y-1">
              <div className="text-lg font-extrabold text-slate-100">{currentRadar.team}</div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">Home Side</span>
            </div>

            <div className="px-4 py-2 bg-pitch-900 border border-pitch-750 rounded-xl font-mono text-2xl font-extrabold text-[#c3ff00]">
              {currentRadar.score}
            </div>

            <div className="text-center space-y-1">
              <div className="text-lg font-extrabold text-slate-100">{currentRadar.rival}</div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">Away Side</span>
            </div>
          </div>

          {/* Metrics Matrix */}
          <div className="grid grid-cols-3 gap-3 font-mono text-xs text-center">
            <div className="p-3 bg-pitch-950 border border-pitch-800 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-500 uppercase">Expected Goals (xG)</span>
              <div className="font-extrabold text-slate-100 text-sm">{currentRadar.xg}</div>
            </div>
            <div className="p-3 bg-pitch-950 border border-pitch-800 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-500 uppercase">Possession Delta</span>
              <div className="font-extrabold text-slate-100 text-sm">{currentRadar.possession}</div>
            </div>
            <div className="p-3 bg-pitch-950 border border-pitch-800 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-500 uppercase">Pressing Intensity</span>
              <div className="font-extrabold text-[#c3ff00] text-sm truncate">{currentRadar.pressingIntensity}</div>
            </div>
          </div>

          {/* Key Editorial Insight */}
          <div className="p-4 bg-[#c3ff00]/5 border border-[#c3ff00]/30 rounded-xl flex items-start gap-3 text-xs leading-relaxed">
            <Crosshair className="w-4 h-4 text-[#c3ff00] shrink-0 mt-0.5" />
            <p className="text-slate-200 font-sans">
              <strong className="text-[#c3ff00]">Analisis Redaksi:</strong> {currentRadar.keyInsight}
            </p>
          </div>
        </div>

        {/* Right: Top Rating Performers Leaderboard */}
        <div className="lg:col-span-5 p-6 sm:p-8 space-y-5 bg-pitch-950/40">
          <div className="flex items-center justify-between pb-2 border-b border-pitch-800">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#c3ff00]" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Top Form Performers
              </h4>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Opta Index</span>
          </div>

          <div className="space-y-3">
            {TOP_PERFORMERS.map((player) => (
              <div
                key={player.rank}
                className="p-3 bg-pitch-900 border border-pitch-800 hover:border-pitch-700 rounded-xl flex items-center justify-between gap-3 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-slate-500 group-hover:text-[#c3ff00] transition-colors">
                    {player.rank}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-100 group-hover:text-white transition-colors">
                      {player.name}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {player.club} • <span className="text-slate-500">{player.metric}</span>
                    </div>
                  </div>
                </div>

                <div className="px-2 py-1 rounded bg-pitch-950 border border-pitch-750 text-xs font-mono font-bold text-[#c3ff00]">
                  {player.rating}
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/players"
            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold font-mono text-slate-300 hover:text-white bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 rounded-xl transition-colors"
          >
            <span>Lihat Seluruh Database Pemain</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#c3ff00]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
