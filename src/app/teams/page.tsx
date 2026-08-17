import React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { TeamBadge } from "@/components/football/TeamBadge";
import { footballService } from "@/lib/football/football.service";
import Link from "next/link";

export const revalidate = 3600; // 1 hour ISR

export default async function TeamsPage() {
  const teams = await footballService.getTeams();

  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        <SectionHeader
          title="Club Directory"
          subtitle="Profiles, squads, recent form, fixtures, and tactical dossiers"
          badgeText="Clubs"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/teams/${team.slug}`}
              className="bg-pitch-900 hover:bg-pitch-850 border border-pitch-800 hover:border-pitch-600 p-4 transition-all block space-y-3"
            >
              <TeamBadge name={team.name} tla={team.tla} size="lg" />
              <div className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-pitch-800">
                <div className="flex justify-between">
                  <span>League:</span>
                  <span className="text-slate-200 font-semibold uppercase font-mono">
                    {team.competitionCode || "Domestic"}
                  </span>
                </div>
                {team.stadium && (
                  <div className="flex justify-between">
                    <span>Venue:</span>
                    <span className="text-slate-300 truncate max-w-[140px]">
                      {team.stadium.name}
                    </span>
                  </div>
                )}
                {team.manager && (
                  <div className="flex justify-between">
                    <span>Manager:</span>
                    <span className="text-slate-300 truncate max-w-[140px]">
                      {team.manager.name}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </PageContainer>
    </div>
  );
}
