import React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { footballService } from "@/lib/football/football.service";
import { MatchCenterConsole } from "./MatchCenterConsole";
import { Trophy, Activity } from "lucide-react";

export const revalidate = 30; // 30 seconds ISR

export default async function MatchesPage() {
  const [liveMatches, allFixtures] = await Promise.all([
    footballService.getLiveMatches(),
    footballService.getFixtures(),
  ]);

  return (
    <div className="py-8 space-y-8 font-sans">
      <PageContainer>
        {/* Header Title */}
        <div className="pb-6 border-b border-pitch-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-pitch-900 border border-pitch-750 text-[#c3ff00] text-[10px] font-mono font-bold uppercase tracking-widest rounded-full">
              <Activity className="w-3 h-3 text-[#c3ff00]" />
              <span>Live Match Center & Telemetri</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 uppercase tracking-tight">
              Pusat Pertandingan & Skor
            </h1>
            <p className="text-xs text-slate-400 max-w-xl font-normal">
              Dikelompokkan berdasarkan turnamen resmi dunia: Kualifikasi Piala Dunia, UEFA Nations League, Premier League, La Liga, dan kompetisi domestik.
            </p>
          </div>
        </div>

        {/* Interactive Match Center Console with Groupings and Filters */}
        <MatchCenterConsole
          liveMatches={liveMatches}
          allFixtures={allFixtures}
        />
      </PageContainer>
    </div>
  );
}
