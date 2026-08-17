import React from "react";
import { notFound } from "next/navigation";
import { footballService } from "@/lib/football/football.service";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { CompetitionBadge } from "@/components/football/CompetitionBadge";
import { TeamBadge } from "@/components/football/TeamBadge";
import { MatchCard } from "@/components/football/MatchCard";
import Link from "next/link";

interface CompetitionDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 600; // 10 minutes ISR

export default async function CompetitionDetailPage({ params }: CompetitionDetailPageProps) {
  const { slug } = await params;
  const comp = await footballService.getCompetition(slug);

  if (!comp) {
    notFound();
  }

  const [standings, fixtures] = await Promise.all([
    footballService.getStandings(comp.code),
    footballService.getFixtures({ competitionCode: comp.code }),
  ]);

  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        {/* Header */}
        <div className="bg-pitch-900 border border-pitch-800 p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-pitch-800">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-pitch-800 border border-pitch-700 flex items-center justify-center font-bold text-lg text-brand-green font-mono">
                {comp.code}
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400">
                  {comp.country} • {comp.type}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 uppercase tracking-tight font-sans">
                  {comp.name}
                </h1>
              </div>
            </div>

            <div className="bg-pitch-850 border border-pitch-750 px-4 py-2 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Current Season
              </span>
              <div className="text-base font-bold font-mono text-slate-100">
                {comp.currentSeason}
              </div>
            </div>
          </div>
        </div>

        {/* Standings Table */}
        <div className="space-y-4">
          <SectionHeader
            title="League Table Standings"
            badgeText="Rankings"
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
        </div>

        {/* Fixtures in Competition */}
        {fixtures.length > 0 && (
          <div className="space-y-4">
            <SectionHeader
              title="Recent & Upcoming Competition Matches"
              badgeText="Fixtures"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fixtures.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
