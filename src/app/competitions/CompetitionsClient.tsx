"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { CompetitionBadge } from "@/components/football/CompetitionBadge";
import { TeamBadge } from "@/components/football/TeamBadge";
import { ProviderCompetition, ProviderStanding } from "@/lib/football/types";
import { Trophy, Globe, Flame, Shield, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompetitionsClientProps {
  competitions: ProviderCompetition[];
  standingsMap: Record<string, ProviderStanding[]>;
}

export function CompetitionsClient({
  competitions,
  standingsMap,
}: CompetitionsClientProps) {
  const [activeCode, setActiveCode] = useState<string>("PL");

  const currentComp =
    competitions.find((c) => c.code === activeCode) || competitions[0];
  const currentStandings = standingsMap[activeCode] || standingsMap["PL"] || [];

  return (
    <div className="py-8 space-y-10 font-sans">
      <PageContainer>
        {/* Header */}
        <SectionHeader
          title="Major Leagues & Competitions"
          subtitle="Real-time league standings, points tables, goal difference metrics, and current season statistics"
          badgeText="Official Standings"
        />

        {/* Competition Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {competitions.map((comp) => {
            const isActive = activeCode === comp.code;
            return (
              <button
                key={comp.id}
                onClick={() => setActiveCode(comp.code)}
                type="button"
                className={cn(
                  "p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group flex flex-col justify-between min-h-[100px]",
                  isActive
                    ? "bg-pitch-900 border-[#c3ff00] shadow-[0_0_20px_rgba(195,255,0,0.15)] ring-1 ring-[#c3ff00]/40"
                    : "bg-pitch-950/80 border-pitch-800 hover:border-pitch-700 hover:bg-pitch-900/60"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={cn(
                      "px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-md tracking-wider border",
                      isActive
                        ? "bg-[#c3ff00]/20 text-[#c3ff00] border-[#c3ff00]/40"
                        : "bg-pitch-850 text-slate-400 border-pitch-750"
                    )}
                  >
                    {comp.code}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase truncate max-w-[60px]">
                    {comp.country}
                  </span>
                </div>

                <div className="pt-2">
                  <h3
                    className={cn(
                      "text-xs font-bold font-sans truncate",
                      isActive ? "text-[#c3ff00]" : "text-slate-200 group-hover:text-white"
                    )}
                  >
                    {comp.name}
                  </h3>
                  <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                    {comp.currentSeason}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Table Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-pitch-900 border border-pitch-800">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-pitch-850 border border-pitch-750 flex items-center justify-center font-bold text-sm text-[#c3ff00] font-mono shadow-inner">
                {currentComp.code}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                    {currentComp.country} • {currentComp.type}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-100 uppercase tracking-tight">
                  {currentComp.name} Table {currentComp.currentSeason}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/competitions/${currentComp.slug}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 hover:border-[#c3ff00]/40 text-slate-200 text-xs font-semibold font-sans transition-all"
              >
                <span>Lihat Jadwal & Fixture</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#c3ff00]" />
              </Link>
            </div>
          </div>

          {/* Standings Table */}
          <div className="rounded-2xl bg-pitch-900 border border-pitch-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-pitch-950 text-slate-400 font-mono uppercase tracking-wider border-b border-pitch-800 text-[11px]">
                  <tr>
                    <th className="py-3 px-3 text-center w-12">Pos</th>
                    <th className="py-3 px-4">Club / Team</th>
                    <th className="py-3 px-3 text-center">PL</th>
                    <th className="py-3 px-3 text-center">W</th>
                    <th className="py-3 px-3 text-center">D</th>
                    <th className="py-3 px-3 text-center">L</th>
                    <th className="py-3 px-3 text-center">GF</th>
                    <th className="py-3 px-3 text-center">GA</th>
                    <th className="py-3 px-3 text-center">GD</th>
                    <th className="py-3 px-4 text-center font-bold">PTS</th>
                    <th className="py-3 px-4 text-center">Form</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pitch-850/60 font-mono">
                  {currentStandings.map((row) => {
                    const isUCL = row.position <= 4;
                    const isUEL = row.position === 5;
                    const isUECL = row.position === 6;
                    const isRelegation =
                      currentStandings.length >= 18 &&
                      row.position >= currentStandings.length - 2;

                    return (
                      <tr
                        key={row.position}
                        className="hover:bg-pitch-850/80 transition-colors group"
                      >
                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={cn(
                              "w-6 h-6 rounded-md inline-flex items-center justify-center font-bold text-xs font-mono",
                              isUCL
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : isUEL
                                ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                                : isUECL
                                ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                                : isRelegation
                                ? "bg-red-500/15 text-red-400 border border-red-500/30"
                                : "text-slate-400"
                            )}
                          >
                            {row.position}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-sans font-medium">
                          <Link
                            href={`/teams/${row.team.slug}`}
                            className="inline-flex items-center gap-2 hover:text-[#c3ff00] transition-colors"
                          >
                            <TeamBadge
                              name={row.team.name}
                              tla={row.team.tla}
                              size="sm"
                            />
                            <span className="font-semibold text-slate-200 group-hover:text-white">
                              {row.team.name}
                            </span>
                          </Link>
                        </td>
                        <td className="py-3.5 px-3 text-center text-slate-400">
                          {row.played}
                        </td>
                        <td className="py-3.5 px-3 text-center text-slate-200 font-semibold">
                          {row.won}
                        </td>
                        <td className="py-3.5 px-3 text-center text-slate-400">
                          {row.drawn}
                        </td>
                        <td className="py-3.5 px-3 text-center text-slate-400">
                          {row.lost}
                        </td>
                        <td className="py-3.5 px-3 text-center text-slate-400 hidden sm:table-cell">
                          {row.goalsFor}
                        </td>
                        <td className="py-3.5 px-3 text-center text-slate-400 hidden sm:table-cell">
                          {row.goalsAgainst}
                        </td>
                        <td className="py-3.5 px-3 text-center font-semibold">
                          <span
                            className={
                              row.goalDifference > 0
                                ? "text-emerald-400"
                                : row.goalDifference < 0
                                ? "text-red-400"
                                : "text-slate-400"
                            }
                          >
                            {row.goalDifference > 0
                              ? `+${row.goalDifference}`
                              : row.goalDifference}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-extrabold text-[#c3ff00] text-sm">
                          {row.points}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {row.form.split("").map((f, i) => (
                              <span
                                key={i}
                                className={cn(
                                  "w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center font-mono",
                                  f === "W"
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : f === "D"
                                    ? "bg-slate-800 text-slate-300 border border-slate-700"
                                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                                )}
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Zone Legend */}
            <div className="p-4 bg-pitch-950/80 border-t border-pitch-800 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
                  <span>UEFA Champions League / Qualifiers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-400" />
                  <span>UEFA Europa League</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-purple-400" />
                  <span>Conference League</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-red-400" />
                  <span>Zona Degradasi (Relegation)</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-500">
                Data diperbarui berkala • Musim 2025/2026
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
