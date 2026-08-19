"use client";

import React from "react";
import { ProviderStanding } from "@/lib/football/types";
import { Trophy, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchStandingsProps {
  standings?: ProviderStanding[];
  homeTeamName: string;
  awayTeamName: string;
  competitionName: string;
  groupName?: string;
  isFriendly?: boolean;
}

export function MatchStandings({
  standings,
  homeTeamName,
  awayTeamName,
  competitionName,
  groupName,
  isFriendly,
}: MatchStandingsProps) {
  if (isFriendly || competitionName.toLowerCase().includes("friendly")) {
    return (
      <div className="bg-pitch-900 border border-pitch-800 rounded-3xl p-8 shadow-xl text-center space-y-2 font-sans">
        <Trophy className="w-8 h-8 text-slate-600 mx-auto" />
        <h4 className="text-xs font-mono font-bold text-slate-300 uppercase">
          Friendly / Exhibition Match
        </h4>
        <p className="text-[11px] text-slate-500">
          This fixture is an international exhibition with no league table or group points standing.
        </p>
      </div>
    );
  }

  if (!standings || standings.length === 0) {
    return (
      <div className="bg-pitch-900 border border-pitch-800 rounded-3xl p-8 shadow-xl text-center space-y-2 font-sans">
        <Trophy className="w-8 h-8 text-slate-600 mx-auto" />
        <h4 className="text-xs font-mono font-bold text-slate-300 uppercase">
          Standings Not Available
        </h4>
        <p className="text-[11px] text-slate-500">
          Group standings for this competition are not applicable or the tournament is currently in knockout rounds.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-pitch-900 border border-pitch-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-pitch-800">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[#c3ff00]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
            Standings: {groupName ? `${competitionName} — ${groupName}` : competitionName}
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">Live Standings Update</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-pitch-800 text-slate-400 uppercase font-mono text-[10px]">
              <th className="py-2.5 px-2 text-center w-8">#</th>
              <th className="py-2.5 px-3">Club / Team</th>
              <th className="py-2.5 px-2 text-center">P</th>
              <th className="py-2.5 px-2 text-center">W</th>
              <th className="py-2.5 px-2 text-center">D</th>
              <th className="py-2.5 px-2 text-center">L</th>
              <th className="py-2.5 px-2 text-center hidden sm:table-cell">GF</th>
              <th className="py-2.5 px-2 text-center hidden sm:table-cell">GA</th>
              <th className="py-2.5 px-2 text-center">GD</th>
              <th className="py-2.5 px-3 text-center font-bold text-slate-200">Pts</th>
              <th className="py-2.5 px-2 text-center hidden md:table-cell">Form</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pitch-850">
            {standings.map((s) => {
              const isHome = s.team.name.toLowerCase().includes(homeTeamName.toLowerCase()) || homeTeamName.toLowerCase().includes(s.team.name.toLowerCase());
              const isAway = s.team.name.toLowerCase().includes(awayTeamName.toLowerCase()) || awayTeamName.toLowerCase().includes(s.team.name.toLowerCase());

              return (
                <tr
                  key={s.position}
                  className={cn(
                    "transition-colors",
                    isHome
                      ? "bg-[#c3ff00]/10 border-l-4 border-l-[#c3ff00] font-bold"
                      : isAway
                      ? "bg-cyan-400/10 border-l-4 border-l-cyan-400 font-bold"
                      : "hover:bg-pitch-850/50"
                  )}
                >
                  <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-300">
                    {s.position}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "truncate max-w-[150px] sm:max-w-[220px]",
                        isHome ? "text-[#c3ff00] font-black" : isAway ? "text-cyan-300 font-black" : "text-slate-200"
                      )}>
                        {s.team.name}
                      </span>
                      {isHome && (
                        <span className="text-[9px] font-mono px-1 rounded bg-[#c3ff00]/20 text-[#c3ff00]">
                          HOME
                        </span>
                      )}
                      {isAway && (
                        <span className="text-[9px] font-mono px-1 rounded bg-cyan-400/20 text-cyan-300">
                          AWAY
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono text-slate-300">{s.played}</td>
                  <td className="py-2.5 px-2 text-center font-mono text-emerald-400">{s.won}</td>
                  <td className="py-2.5 px-2 text-center font-mono text-slate-400">{s.drawn}</td>
                  <td className="py-2.5 px-2 text-center font-mono text-brand-red">{s.lost}</td>
                  <td className="py-2.5 px-2 text-center font-mono text-slate-400 hidden sm:table-cell">{s.goalsFor}</td>
                  <td className="py-2.5 px-2 text-center font-mono text-slate-400 hidden sm:table-cell">{s.goalsAgainst}</td>
                  <td className="py-2.5 px-2 text-center font-mono font-semibold text-slate-200">
                    {s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-black text-slate-100 text-sm">
                    {s.points}
                  </td>
                  <td className="py-2.5 px-2 text-center hidden md:table-cell">
                    <div className="flex items-center justify-center gap-1">
                      {s.form?.split("").map((f, i) => (
                        <span
                          key={i}
                          className={cn(
                            "w-4 h-4 rounded text-[9px] font-mono flex items-center justify-center font-bold",
                            f === "W" ? "bg-emerald-500 text-black" : f === "D" ? "bg-slate-600 text-white" : "bg-brand-red text-white"
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
    </div>
  );
}
