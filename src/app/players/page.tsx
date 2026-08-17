import React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import Link from "next/link";

const PLAYERS_LIST = [
  { id: "p-1", name: "Bukayo Saka", position: "Winger", club: "Arsenal", nationality: "England", number: 7, goals: 18, assists: 14 },
  { id: "p-2", name: "Erling Haaland", position: "Striker", club: "Manchester City", nationality: "Norway", number: 9, goals: 34, assists: 6 },
  { id: "p-3", name: "Vinícius Júnior", position: "Winger", club: "Real Madrid", nationality: "Brazil", number: 7, goals: 24, assists: 12 },
  { id: "p-4", name: "Jude Bellingham", position: "Midfielder", club: "Real Madrid", nationality: "England", number: 5, goals: 21, assists: 10 },
  { id: "p-5", name: "Lamine Yamal", position: "Winger", club: "Barcelona", nationality: "Spain", number: 19, goals: 12, assists: 17 },
  { id: "p-6", name: "Lautaro Martínez", position: "Striker", club: "Inter Milan", nationality: "Argentina", number: 10, goals: 27, assists: 7 },
];

export default function PlayersPage() {
  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        <SectionHeader
          title="Player Intelligence & Profiles"
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
                  <th className="py-3 px-4 text-center">Goals</th>
                  <th className="py-3 px-4 text-center">Assists</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pitch-850">
                {PLAYERS_LIST.map((player) => (
                  <tr key={player.id} className="hover:bg-pitch-850 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-100 font-sans">
                      <Link href={`/players/${player.id}`} className="hover:text-brand-green">
                        {player.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{player.club}</td>
                    <td className="py-3 px-4 text-slate-400">{player.position}</td>
                    <td className="py-3 px-4 text-slate-400">{player.nationality}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-200">
                      {player.goals}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-200">
                      {player.assists}
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
