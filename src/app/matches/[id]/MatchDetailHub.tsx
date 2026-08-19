"use client";

import React, { useState } from "react";
import { ProviderMatchDetail } from "@/lib/football/types";
import { TacticalPitchLineup } from "@/components/football/TacticalPitchLineup";
import {
  Activity,
  Shield,
  Zap,
  Star,
  Percent,
  Calendar,
  MapPin,
  User,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchDetailHubProps {
  match: ProviderMatchDetail;
}

export function MatchDetailHub({ match }: MatchDetailHubProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "lineups" | "stats">("lineups");

  // Calculate Google-style Win Probability % based on current score & match situation
  const calculateWinProbability = () => {
    const diff = match.homeScore - match.awayScore;
    let homeProb = 38;
    let drawProb = 28;
    let awayProb = 34;

    if (diff > 1) {
      homeProb = 82;
      drawProb = 12;
      awayProb = 6;
    } else if (diff === 1) {
      homeProb = 62;
      drawProb = 24;
      awayProb = 14;
    } else if (diff === -1) {
      homeProb = 16;
      drawProb = 24;
      awayProb = 60;
    } else if (diff < -1) {
      homeProb = 8;
      drawProb = 14;
      awayProb = 78;
    }

    return { homeProb, drawProb, awayProb };
  };

  const { homeProb, drawProb, awayProb } = calculateWinProbability();

  return (
    <div className="space-y-8 font-sans">
      {/* Google-Style Match Navigation Tabs */}
      <div className="border-b border-pitch-800 flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("lineups")}
          className={cn(
            "pb-3.5 px-3 sm:px-4 text-xs font-mono font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 whitespace-nowrap",
            activeTab === "lineups"
              ? "border-[#c3ff00] text-[#c3ff00]"
              : "border-transparent text-slate-400 hover:text-slate-200"
          )}
        >
          <Shield className="w-4 h-4" />
          <span>Susunan Pemain (Lineups)</span>
        </button>

        <button
          onClick={() => setActiveTab("overview")}
          className={cn(
            "pb-3.5 px-3 sm:px-4 text-xs font-mono font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 whitespace-nowrap",
            activeTab === "overview"
              ? "border-[#c3ff00] text-[#c3ff00]"
              : "border-transparent text-slate-400 hover:text-slate-200"
          )}
        >
          <Activity className="w-4 h-4" />
          <span>Ringkasan & Momen</span>
        </button>

        <button
          onClick={() => setActiveTab("stats")}
          className={cn(
            "pb-3.5 px-3 sm:px-4 text-xs font-mono font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 whitespace-nowrap",
            activeTab === "stats"
              ? "border-[#c3ff00] text-[#c3ff00]"
              : "border-transparent text-slate-400 hover:text-slate-200"
          )}
        >
          <Zap className="w-4 h-4" />
          <span>Statistik Lengkap (Opta)</span>
        </button>
      </div>

      {/* TAB 1: SUSUNAN PEMAIN (LINEUPS LAPANGAN GRAFIS ALA GOOGLE) */}
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

      {/* TAB 2: RINGKASAN & WIN PROBABILITY ALA GOOGLE */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Google-Style Win Probability Bar */}
          <div className="bg-pitch-900 border border-pitch-800 rounded-3xl p-6 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#c3ff00]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  Peluang Menang (Win Probability)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Model Prediksi Google-Opta</span>
            </div>

            {/* 3-Segment Bar */}
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

            {/* Labels */}
            <div className="flex justify-between text-xs font-mono font-bold pt-1">
              <div className="text-left">
                <span className="text-slate-200">{match.homeTeam.shortName}</span>
                <span className="text-[#c3ff00] block text-sm">{homeProb}%</span>
              </div>
              <div className="text-center">
                <span className="text-slate-400">Seri</span>
                <span className="text-slate-300 block text-sm">{drawProb}%</span>
              </div>
              <div className="text-right">
                <span className="text-slate-200">{match.awayTeam.shortName}</span>
                <span className="text-cyan-400 block text-sm">{awayProb}%</span>
              </div>
            </div>
          </div>

          {/* Match Events Timeline */}
          <div className="bg-pitch-900 border border-pitch-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-pitch-800">
              <Activity className="w-4 h-4 text-[#c3ff00]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                Kronologi & Momen Pertandingan
              </h3>
            </div>

            {match.events.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center font-mono">
                Belum ada gol atau kartu yang tercatat.
              </p>
            ) : (
              <div className="space-y-3">
                {match.events.map((event) => {
                  const isHome = event.teamId === match.homeTeam.id;
                  return (
                    <div
                      key={event.id}
                      className={cn(
                        "flex items-center gap-3.5 text-xs p-3 rounded-2xl border transition-colors",
                        isHome
                          ? "bg-pitch-950 border-pitch-800"
                          : "bg-pitch-950 border-pitch-800 flex-row-reverse text-right"
                      )}
                    >
                      <span className="font-mono font-bold text-[#c3ff00] bg-pitch-900 px-2.5 py-1 rounded-lg text-xs border border-pitch-750">
                        {event.minute}&apos;
                      </span>
                      <div className="space-y-0.5 flex-1">
                        <p className="font-bold text-slate-100 text-sm">
                          {event.playerName || "Pemain"}
                        </p>
                        {event.detail && (
                          <p className="text-xs text-slate-400 font-normal">
                            {event.detail}
                          </p>
                        )}
                      </div>
                      <span
                        className={cn(
                          "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg font-mono border",
                          event.type === "GOAL" && "bg-emerald-950 text-emerald-400 border-emerald-800",
                          event.type === "YELLOW_CARD" && "bg-amber-950 text-amber-400 border-amber-800",
                          event.type === "RED_CARD" && "bg-red-950 text-red-400 border-red-800"
                        )}
                      >
                        {event.type}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: STATISTIK LENGKAP (OPTA TELEMETRY) */}
      {activeTab === "stats" && match.stats && (
        <div className="bg-pitch-900 border border-pitch-800 rounded-3xl p-6 shadow-xl space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-pitch-800">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#c3ff00]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                Statistik Telemetri Pertandingan
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Opta Real-Time Index</span>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Expected Goals (xG) */}
            {typeof match.stats.xgHome === "number" && (
              <div className="p-4 bg-pitch-950 rounded-2xl border border-pitch-800 space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span className="text-[#c3ff00] text-base">{match.stats.xgHome}</span>
                  <span className="text-slate-400 uppercase text-[11px]">Expected Goals (xG)</span>
                  <span className="text-cyan-400 text-base">{match.stats.xgAway}</span>
                </div>
              </div>
            )}

            {/* Possession */}
            <div className="space-y-1.5 p-3.5 bg-pitch-950 rounded-2xl border border-pitch-850">
              <div className="flex justify-between text-slate-200 font-bold">
                <span>{match.stats.possessionHome}%</span>
                <span className="text-slate-400 uppercase text-[11px]">Penguasaan Bola</span>
                <span>{match.stats.possessionAway}%</span>
              </div>
              <div className="h-2.5 bg-pitch-900 rounded-full flex overflow-hidden border border-pitch-800">
                <div
                  style={{ width: `${match.stats.possessionHome}%` }}
                  className="bg-[#c3ff00] h-full"
                />
                <div
                  style={{ width: `${match.stats.possessionAway}%` }}
                  className="bg-cyan-400 h-full"
                />
              </div>
            </div>

            {/* Total Shots */}
            <div className="flex justify-between py-2 border-b border-pitch-800">
              <span className="text-slate-100 font-bold text-sm">{match.stats.shotsHome}</span>
              <span className="text-slate-400 uppercase text-[11px]">Total Tembakan</span>
              <span className="text-slate-100 font-bold text-sm">{match.stats.shotsAway}</span>
            </div>

            {/* Shots on Target */}
            <div className="flex justify-between py-2 border-b border-pitch-800">
              <span className="text-emerald-400 font-bold text-sm">{match.stats.shotsOnTargetHome}</span>
              <span className="text-slate-400 uppercase text-[11px]">Tembakan Tepat Sasaran</span>
              <span className="text-emerald-400 font-bold text-sm">{match.stats.shotsOnTargetAway}</span>
            </div>

            {/* Pass Accuracy */}
            {typeof match.stats.passAccuracyHome === "number" && (
              <div className="flex justify-between py-2 border-b border-pitch-800">
                <span className="text-slate-100 font-bold text-sm">{match.stats.passAccuracyHome}%</span>
                <span className="text-slate-400 uppercase text-[11px]">Akurasi Operan</span>
                <span className="text-slate-100 font-bold text-sm">{match.stats.passAccuracyAway}%</span>
              </div>
            )}

            {/* Corners */}
            <div className="flex justify-between py-2 border-b border-pitch-800">
              <span className="text-slate-100 font-bold text-sm">{match.stats.cornersHome}</span>
              <span className="text-slate-400 uppercase text-[11px]">Tendangan Sudut</span>
              <span className="text-slate-100 font-bold text-sm">{match.stats.cornersAway}</span>
            </div>

            {/* Fouls */}
            <div className="flex justify-between py-2">
              <span className="text-slate-100 font-bold text-sm">{match.stats.foulsHome}</span>
              <span className="text-slate-400 uppercase text-[11px]">Pelanggaran</span>
              <span className="text-slate-100 font-bold text-sm">{match.stats.foulsAway}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
