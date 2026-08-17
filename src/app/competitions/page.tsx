import React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { CompetitionBadge } from "@/components/football/CompetitionBadge";
import { TeamBadge } from "@/components/football/TeamBadge";
import { footballService } from "@/lib/football/football.service";
import Link from "next/link";

export const revalidate = 600; // 10 minutes ISR

export default async function CompetitionsPage() {
  const [competitions, standings] = await Promise.all([
    footballService.getCompetitions(),
    footballService.getStandings("PL"),
  ]);

  return (
    <div className="py-8 space-y-10">
      <PageContainer>
        {/* Competitions Index */}
        <SectionHeader
          title="Major Leagues & Competitions"
          subtitle="Domestic leagues, UEFA tournaments, and international brackets"
          badgeText="Tournaments"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {competitions.map((comp) => (
            <Link
              key={comp.id}
              href={`/competitions/${comp.slug}`}
              className="bg-pitch-900 hover:bg-pitch-850 border border-pitch-800 hover:border-pitch-600 p-4 transition-all block space-y-2"
            >
              <div className="flex items-center justify-between">
                <CompetitionBadge name={comp.name} code={comp.code} />
                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  {comp.country}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-100 font-sans">
                {comp.name}
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                Season: {comp.currentSeason}
              </p>
            </Link>
          ))}
        </div>

        {/* Premier League Table Preview */}
        <SectionHeader
          title="Premier League Table 2025/2026"
          subtitle="Live standings, points, goal difference, and recent form guides"
          badgeText="Standings"
        />

        <div className="bg-pitch-900 border border-pitch-800 overflow-hidden">
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
                {standings.map((row) => (
                  <tr key={row.position} className="hover:bg-pitch-850 transition-colors">
                    <td className="py-3 px-3 text-center font-bold text-slate-300">
                      {row.position}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <Link href={`/teams/${row.team.slug}`} className="hover:text-brand-green">
                        <TeamBadge name={row.team.name} tla={row.team.tla} size="sm" />
                      </Link>
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
                        {row.form.split("").map((f, i) => (
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
