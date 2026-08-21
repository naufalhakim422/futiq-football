import React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { footballService } from "@/lib/football/football.service";
import { MatchCenterConsole } from "./MatchCenterConsole";
import { Trophy, Activity } from "lucide-react";
import { AdSlotBanner } from "@/components/ads/AdSlotBanner";
import { AdPlacementPosition } from "@prisma/client";

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
              <span>Live Match Center & Telemetry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 uppercase tracking-tight">
              Football Matches & Live Scores
            </h1>
            <p className="text-xs text-slate-400 max-w-xl font-normal">
              Grouped by official world competitions: FIFA World Cup Qualifiers, UEFA Champions League, Premier League, La Liga, and international tournaments.
            </p>
          </div>
        </div>

        {/* Ad Placement: Match Center Sponsor */}
        <AdSlotBanner position={AdPlacementPosition.HOME_HERO} className="mb-6" />

        {/* Interactive Match Center Console with Groupings and Filters */}
        <MatchCenterConsole
          liveMatches={liveMatches}
          allFixtures={allFixtures}
        />
      </PageContainer>
    </div>
  );
}
