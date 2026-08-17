import React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { footballService } from "@/lib/football/football.service";
import Link from "next/link";

export const revalidate = 3600; // 1 hour ISR

export default async function PlayersPage() {
  const players = await footballService.getPlayers();

  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        <SectionHeader
          title="Player Intelligence & Index"
          subtitle="Advanced player metrics, goal contributions, career histories, and scouting reports"
          badgeText="Players"
        />

        <div className="bg-pitch-900 border border-pitch-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-pitch-950 text-slate-400 font-mono uppercase tracking-wider border-b border-pitch-800">
                <tr>
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-4">Club</th>
                  <th className="py-3 px-4">Position</th>
                  <th className="py-3 px-4">Nationality</th>
                  <th className="py-3 px-4 text-center">Squad #</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pitch-850">
                {players.map((player) => (
                  <tr key={player.id} className="hover:bg-pitch-850 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-100 font-sans">
                      <Link href={`/players/${player.slug}`} className="hover:text-brand-green">
                        {player.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {player.teamName || "Unattached"}
                    </td>
                    <td className="py-3 px-4 text-slate-400 uppercase font-mono text-[11px]">
                      {player.position}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {player.nationality}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-200">
                      {player.shirtNumber || "-"}
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
