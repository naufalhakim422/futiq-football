import React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { StandingRow } from "@/types/football";
import { TeamBadge } from "@/components/football/TeamBadge";

const SAMPLE_STANDINGS: StandingRow[] = [
  {
    position: 1,
    team: { id: "t-1", name: "Arsenal", shortName: "Arsenal", tla: "ARS" },
    played: 28,
    won: 21,
    drawn: 4,
    lost: 3,
    goalsFor: 70,
    goalsAgainst: 24,
    goalDifference: 46,
    points: 67,
    form: ["W", "W", "W", "D", "W"],
  },
  {
    position: 2,
    team: { id: "t-3", name: "Manchester City", shortName: "Man City", tla: "MCI" },
    played: 28,
    won: 20,
    drawn: 6,
    lost: 2,
    goalsFor: 68,
    goalsAgainst: 26,
    goalDifference: 42,
    points: 66,
    form: ["W", "W", "D", "W", "W"],
  },
  {
    position: 3,
    team: { id: "t-4", name: "Liverpool", shortName: "Liverpool", tla: "LIV" },
    played: 28,
    won: 19,
    drawn: 7,
    lost: 2,
    goalsFor: 65,
    goalsAgainst: 27,
    goalDifference: 38,
    points: 64,
    form: ["W", "D", "W", "W", "L"],
  },
  {
    position: 4,
    team: { id: "t-2", name: "Chelsea", shortName: "Chelsea", tla: "CHE" },
    played: 28,
    won: 15,
    drawn: 6,
    lost: 7,
    goalsFor: 52,
    goalsAgainst: 34,
    goalDifference: 18,
    points: 51,
    form: ["L", "W", "W", "D", "W"],
  },
];

export default function CompetitionsPage() {
  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        <SectionHeader
          title="League Tables & Standings"
          subtitle="Real-time domestic leagues, UEFA competitions, and tournament brackets"
          badgeText="Premier League"
        />

        <div className="bg-pitch-900 border border-pitch-800 overflow-hidden">
          <div className="p-4 bg-pitch-950 border-b border-pitch-800 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Premier League Table 2025/26
            </h3>
            <span className="text-xs font-mono text-slate-400">Matchday 28</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-pitch-950 text-slate-400 font-mono uppercase tracking-wider border-b border-pitch-800">
                <tr>
                  <th className="py-2.5 px-3 text-center w-12">Pos</th>
                  <th className="py-2.5 px-4">Club</th>
                  <th className="py-2.5 px-3 text-center">PL</th>
                  <th className="py-2.5 px-3 text-center">W</th>
                  <th className="py-2.5 px-3 text-center">D</th>
                  <th className="py-2.5 px-3 text-center">L</th>
                  <th className="py-2.5 px-3 text-center">GD</th>
                  <th className="py-2.5 px-4 text-center font-bold">PTS</th>
                  <th className="py-2.5 px-4 text-center">Form</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pitch-850 font-mono">
                {SAMPLE_STANDINGS.map((row) => (
                  <tr key={row.position} className="hover:bg-pitch-850 transition-colors">
                    <td className="py-3 px-3 text-center font-bold text-slate-300">
                      {row.position}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <TeamBadge name={row.team.name} tla={row.team.tla} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-center text-slate-400">{row.played}</td>
                    <td className="py-3 px-3 text-center text-slate-300">{row.won}</td>
                    <td className="py-3 px-3 text-center text-slate-400">{row.drawn}</td>
                    <td className="py-3 px-3 text-center text-slate-400">{row.lost}</td>
                    <td className="py-3 px-3 text-center text-slate-300 font-semibold">
                      {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-brand-green text-sm">
                      {row.points}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {row.form.map((f, i) => (
                          <span
                            key={i}
                            className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center ${
                              f === "W"
                                ? "bg-brand-green/20 text-brand-green"
                                : f === "D"
                                ? "bg-slate-700 text-slate-300"
                                : "bg-brand-red/20 text-brand-red"
                            }`}
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
