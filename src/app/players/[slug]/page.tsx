import React from "react";
import { notFound } from "next/navigation";
import { footballService } from "@/lib/football/football.service";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import Link from "next/link";
import { User, Shield, ArrowRight, Award, Star, Activity } from "lucide-react";

interface PlayerDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600; // 1 hour ISR

export default async function PlayerDetailPage({ params }: PlayerDetailPageProps) {
  const { slug } = await params;
  const player = await footballService.getPlayerDetail(slug);

  if (!player) {
    notFound();
  }

  const stat = player.statistics?.[0];

  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        {/* Player Profile Header */}
        <div className="bg-pitch-900 border border-pitch-800 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-pitch-800">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-pitch-800 border border-pitch-700 flex items-center justify-center font-bold text-xl text-brand-green font-mono">
                {player.shirtNumber ? `#${player.shirtNumber}` : player.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-pitch-800 text-brand-green border border-pitch-700 font-mono">
                    {player.position}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {player.nationality}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 uppercase tracking-tight font-sans">
                  {player.name}
                </h1>
                {player.teamName && (
                  <p className="text-xs text-slate-300 font-medium mt-1">
                    Current Club:{" "}
                    <Link
                      href={`/teams/${player.teamTla?.toLowerCase()}`}
                      className="text-brand-green hover:underline"
                    >
                      {player.teamName}
                    </Link>
                  </p>
                )}
              </div>
            </div>

            {stat && (
              <div className="bg-pitch-850 border border-pitch-750 p-4 text-center sm:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Season Rating
                </span>
                <div className="text-2xl font-bold font-mono text-brand-green flex items-center justify-center sm:justify-end gap-1">
                  <Star className="w-4 h-4 fill-brand-green text-brand-green" />
                  <span>{stat.averageRating.toFixed(1)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Key Statistics Grid */}
          {stat && (
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Season 2025/2026 Telemetry ({stat.competitionCode})
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-pitch-850 border border-pitch-750 p-3 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Apps</span>
                  <div className="text-lg font-bold font-mono text-slate-100">{stat.appearances}</div>
                </div>
                <div className="bg-pitch-850 border border-pitch-750 p-3 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Goals</span>
                  <div className="text-lg font-bold font-mono text-brand-green">{stat.goals}</div>
                </div>
                <div className="bg-pitch-850 border border-pitch-750 p-3 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Assists</span>
                  <div className="text-lg font-bold font-mono text-brand-green">{stat.assists}</div>
                </div>
                <div className="bg-pitch-850 border border-pitch-750 p-3 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Minutes</span>
                  <div className="text-lg font-bold font-mono text-slate-100">{stat.minutesPlayed.toLocaleString()}</div>
                </div>
                <div className="bg-pitch-850 border border-pitch-750 p-3 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Yellows</span>
                  <div className="text-lg font-bold font-mono text-brand-gold">{stat.yellowCards}</div>
                </div>
                <div className="bg-pitch-850 border border-pitch-750 p-3 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Reds</span>
                  <div className="text-lg font-bold font-mono text-brand-red">{stat.redCards}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Transfer Record & Career Moves */}
        {player.recentTransfers && player.recentTransfers.length > 0 && (
          <div className="space-y-4">
            <SectionHeader
              title="Transfer Intelligence & Career Movement"
              badgeText="Market Record"
            />
            <div className="bg-pitch-900 border border-pitch-800 divide-y divide-pitch-800">
              {player.recentTransfers.map((tr) => (
                <div key={tr.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                      <span>{tr.fromTeam?.name || "Previous Club"}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-brand-green" />
                      <span className="text-brand-green font-bold">{tr.toTeam?.name || "Current Club"}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Type: {tr.transferType} • Status: {tr.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono font-bold text-slate-100">{tr.feeDescription || "Undisclosed"}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{tr.announcementDate}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
