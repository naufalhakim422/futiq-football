import React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { TeamBadge } from "@/components/football/TeamBadge";
import Link from "next/link";

const TEAMS_LIST = [
  { id: "t-1", name: "Arsenal", tla: "ARS", league: "Premier League", country: "England", stadium: "Emirates Stadium" },
  { id: "t-2", name: "Chelsea", tla: "CHE", league: "Premier League", country: "England", stadium: "Stamford Bridge" },
  { id: "t-3", name: "Manchester City", tla: "MCI", league: "Premier League", country: "England", stadium: "Etihad Stadium" },
  { id: "t-4", name: "Liverpool", tla: "LIV", league: "Premier League", country: "England", stadium: "Anfield" },
  { id: "t-5", name: "Real Madrid", tla: "RMA", league: "La Liga", country: "Spain", stadium: "Santiago Bernabéu" },
  { id: "t-6", name: "Barcelona", tla: "BAR", league: "La Liga", country: "Spain", stadium: "Spotify Camp Nou" },
  { id: "t-7", name: "Bayern Munich", tla: "BAY", league: "Bundesliga", country: "Germany", stadium: "Allianz Arena" },
  { id: "t-8", name: "Inter Milan", tla: "INT", league: "Serie A", country: "Italy", stadium: "San Siro" },
];

export default function TeamsPage() {
  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        <SectionHeader
          title="Club Directory"
          subtitle="Profiles, squads, recent form, fixtures, and tactical dossiers"
          badgeText="Clubs"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEAMS_LIST.map((team) => (
            <Link
              key={team.id}
              href={`/teams/${team.id}`}
              className="bg-pitch-900 hover:bg-pitch-850 border border-pitch-800 hover:border-pitch-600 p-4 transition-all block space-y-3"
            >
              <TeamBadge name={team.name} tla={team.tla} size="lg" />
              <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-pitch-800">
                <div className="flex justify-between">
                  <span>League:</span>
                  <span className="text-slate-200 font-semibold">{team.league}</span>
                </div>
                <div className="flex justify-between">
                  <span>Venue:</span>
                  <span className="text-slate-300 truncate max-w-[140px]">{team.stadium}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </PageContainer>
    </div>
  );
}
