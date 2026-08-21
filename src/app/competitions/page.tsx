import React from "react";
import { footballService } from "@/lib/football/football.service";
import { CompetitionsClient } from "./CompetitionsClient";

export const revalidate = 600; // 10 minutes ISR

export default async function CompetitionsPage() {
  const competitions = await footballService.getCompetitions();

  const standingsEntries = await Promise.all(
    competitions.map(async (comp) => {
      const standings = await footballService.getStandings(comp.code);
      return [comp.code, standings] as const;
    })
  );

  const standingsMap = Object.fromEntries(standingsEntries);

  return (
    <CompetitionsClient
      competitions={competitions}
      standingsMap={standingsMap}
    />
  );
}
