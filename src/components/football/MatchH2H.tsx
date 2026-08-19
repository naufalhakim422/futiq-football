"use client";

import React from "react";
import Link from "next/link";
import { ProviderH2HSummary, ProviderMatch } from "@/lib/football/types";
import { Shield, Trophy, History, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchH2HProps {
  homeTeamName: string;
  awayTeamName: string;
  homeTeamId: string;
  awayTeamId: string;
  h2h?: ProviderH2HSummary;
  homeForm?: string[];
  awayForm?: string[];
}

export function MatchH2H({
  homeTeamName,
  awayTeamName,
  homeTeamId,
  awayTeamId,
  h2h,
  homeForm,
  awayForm,
}: MatchH2HProps) {
  const formBadgeClass = (f: string) => {
    switch (f.toUpperCase()) {
      case "W":
        return "bg-emerald-500 text-slate-950 font-black";
      case "D":
        return "bg-slate-500 text-white font-bold";
      case "L":
        return "bg-brand-red text-white font-bold";
      default:
        return "bg-pitch-800 text-slate-400";
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Form Guide (Last 5 Matches) */}
      {(homeForm || awayForm) && (
        <div className="bg-pitch-900 border border-pitch-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-pitch-800">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#c3ff00]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                Recent Team Form (Last 5 Matches)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Most Recent on Left</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Home Form */}
            <div className="p-4 rounded-2xl bg-pitch-950 border border-pitch-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#c3ff00] truncate">{homeTeamName}</span>
                <span className="text-[10px] font-mono text-slate-400">Home Team</span>
              </div>
              <div className="flex items-center gap-1.5">
                {homeForm && homeForm.length > 0 ? (
                  homeForm.map((f, i) => (
                    <span
                      key={i}
                      className={cn("w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono shadow-sm", formBadgeClass(f))}
                    >
                      {f}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 font-mono">Form data not available yet</span>
                )}
              </div>
            </div>

            {/* Away Form */}
            <div className="p-4 rounded-2xl bg-pitch-950 border border-pitch-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-cyan-400 truncate">{awayTeamName}</span>
                <span className="text-[10px] font-mono text-slate-400">Away Team</span>
              </div>
              <div className="flex items-center gap-1.5">
                {awayForm && awayForm.length > 0 ? (
                  awayForm.map((f, i) => (
                    <span
                      key={i}
                      className={cn("w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono shadow-sm", formBadgeClass(f))}
                    >
                      {f}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 font-mono">Form data not available yet</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. H2H Summary Box */}
      {h2h ? (
        <div className="bg-pitch-900 border border-pitch-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-pitch-800">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#c3ff00]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                Head to Head (H2H) Record
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Total {h2h.totalMatches} Meetings
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-4 rounded-2xl bg-pitch-950 border border-pitch-800">
              <span className="text-[10px] uppercase font-mono text-[#c3ff00] block truncate">
                {homeTeamName} Wins
              </span>
              <span className="text-2xl font-black font-mono text-slate-100 mt-1 block">
                {h2h.homeWins}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-pitch-950 border border-pitch-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">
                Draws
              </span>
              <span className="text-2xl font-black font-mono text-slate-100 mt-1 block">
                {h2h.draws}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-pitch-950 border border-pitch-800">
              <span className="text-[10px] uppercase font-mono text-cyan-400 block truncate">
                {awayTeamName} Wins
              </span>
              <span className="text-2xl font-black font-mono text-slate-100 mt-1 block">
                {h2h.awayWins}
              </span>
            </div>
          </div>

          {/* Previous Meetings List */}
          {h2h.recentMatches && h2h.recentMatches.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-mono uppercase font-bold text-slate-300">
                Previous Meetings History:
              </h4>

              <div className="space-y-2">
                {h2h.recentMatches.map((m) => (
                  <Link
                    key={m.id}
                    href={`/matches/${m.id}`}
                    className="p-3 rounded-2xl bg-pitch-950 border border-pitch-800/80 hover:border-pitch-700 transition-colors flex items-center justify-between text-xs font-sans group block"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                        {new Date(m.matchDate).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px] hidden sm:inline truncate max-w-[120px]">
                        {m.competition.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 font-mono font-bold">
                      <span className={cn(m.homeScore > m.awayScore ? "text-slate-100 font-black" : "text-slate-400")}>
                        {m.homeTeam.name}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-pitch-900 border border-pitch-800 text-slate-200">
                        {m.homeScore} - {m.awayScore}
                      </span>
                      <span className={cn(m.awayScore > m.homeScore ? "text-slate-100 font-black" : "text-slate-400")}>
                        {m.awayTeam.name}
                      </span>
                    </div>

                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#c3ff00] transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-pitch-900 border border-pitch-800 rounded-3xl p-8 shadow-xl text-center space-y-2">
          <Shield className="w-8 h-8 text-slate-600 mx-auto" />
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase">
            Head to Head Data Not Available Yet
          </h4>
          <p className="text-[11px] text-slate-500 font-sans">
            These two teams have no recorded head-to-head encounters in the official database.
          </p>
        </div>
      )}
    </div>
  );
}
