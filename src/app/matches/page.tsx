import React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { MatchCard } from "@/components/football/MatchCard";
import { MatchSummary } from "@/types/football";

const ALL_MATCHES: MatchSummary[] = [
  {
    id: "m-101",
    competition: { id: "c-1", name: "Premier League", code: "PL", country: "ENG" },
    homeTeam: { id: "t-1", name: "Arsenal", shortName: "Arsenal", tla: "ARS" },
    awayTeam: { id: "t-2", name: "Chelsea", shortName: "Chelsea", tla: "CHE" },
    score: { home: 2, away: 1 },
    status: "LIVE_2H",
    minute: 74,
    matchDate: "Today",
  },
  {
    id: "m-102",
    competition: { id: "c-1", name: "Premier League", code: "PL", country: "ENG" },
    homeTeam: { id: "t-3", name: "Man City", shortName: "Man City", tla: "MCI" },
    awayTeam: { id: "t-4", name: "Liverpool", shortName: "Liverpool", tla: "LIV" },
    score: { home: 1, away: 1 },
    status: "HT",
    minute: 45,
    matchDate: "Today",
  },
  {
    id: "m-103",
    competition: { id: "c-2", name: "La Liga", code: "LL", country: "ESP" },
    homeTeam: { id: "t-5", name: "Real Madrid", shortName: "Real Madrid", tla: "RMA" },
    awayTeam: { id: "t-6", name: "Barcelona", shortName: "Barcelona", tla: "BAR" },
    score: { home: 3, away: 2 },
    status: "FINISHED",
    matchDate: "FT",
  },
  {
    id: "m-104",
    competition: { id: "c-3", name: "UEFA Champions League", code: "UCL", country: "EUR" },
    homeTeam: { id: "t-7", name: "Bayern Munich", shortName: "Bayern", tla: "BAY" },
    awayTeam: { id: "t-8", name: "Paris SG", shortName: "PSG", tla: "PSG" },
    score: { home: 0, away: 0 },
    status: "SCHEDULED",
    matchDate: "20:00",
  },
  {
    id: "m-105",
    competition: { id: "c-4", name: "Serie A", code: "SA", country: "ITA" },
    homeTeam: { id: "t-9", name: "Inter Milan", shortName: "Inter", tla: "INT" },
    awayTeam: { id: "t-10", name: "Juventus", shortName: "Juventus", tla: "JUV" },
    score: { home: 1, away: 0 },
    status: "LIVE_1H",
    minute: 31,
    matchDate: "Today",
  },
];

export default function MatchesPage() {
  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        <SectionHeader
          title="Match Center & Live Scores"
          subtitle="Real-time match telemetry, fixture calendars, and full-time results"
          badgeText="Opta Data"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_MATCHES.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </PageContainer>
    </div>
  );
}
