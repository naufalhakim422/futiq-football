import React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { MatchCard } from "@/components/football/MatchCard";
import { footballService } from "@/lib/football/football.service";
import { EmptyState } from "@/components/ui/EmptyState";
import { Zap } from "lucide-react";

export const revalidate = 30; // 30 seconds ISR

export default async function MatchesPage() {
  const [liveMatches, allFixtures] = await Promise.all([
    footballService.getLiveMatches(),
    footballService.getFixtures(),
  ]);

  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        {/* Live Matches Section */}
        {liveMatches.length > 0 && (
          <div className="mb-10">
            <SectionHeader
              title="Live Match Center"
              subtitle="Real-time match telemetry, in-play scores, and live clock updates"
              badgeText="In-Play"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        )}

        {/* All Fixtures & Results Section */}
        <SectionHeader
          title="Fixtures & Matchday Results"
          subtitle="Complete match schedule, recent full-time results, and head-to-head records"
          badgeText="Calendar"
        />

        {allFixtures.length === 0 ? (
          <EmptyState
            title="No Matches Scheduled"
            description="There are currently no active fixtures or matches recorded."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allFixtures.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
