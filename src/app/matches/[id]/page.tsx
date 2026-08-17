import React from "react";
import { notFound } from "next/navigation";
import { footballService } from "@/lib/football/football.service";
import { PageContainer } from "@/components/layout/PageContainer";
import { TeamBadge } from "@/components/football/TeamBadge";
import { CompetitionBadge } from "@/components/football/CompetitionBadge";
import { Clock, Shield, MapPin, User, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchDetailPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 15; // 15 seconds ISR for live matches

export default async function MatchDetailPage({ params }: MatchDetailPageProps) {
  const { id } = await params;
  const match = await footballService.getMatchDetail(id);

  if (!match) {
    notFound();
  }

  const isLive =
    match.status === "LIVE_1H" ||
    match.status === "LIVE_2H" ||
    match.status === "HT";
  const isFinished = match.status === "FINISHED";

  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        {/* Match Header / Scoreboard */}
        <div className="bg-pitch-900 border border-pitch-800 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-pitch-800 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CompetitionBadge
                name={match.competition.name}
                code={match.competition.code}
              />
              <span className="font-mono">{match.round || "Matchday"}</span>
            </div>

            <div className="flex items-center gap-4 font-mono text-[11px]">
              {match.venue && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{match.venue.name}, {match.venue.city}</span>
                </span>
              )}
              {match.referee && (
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Ref: {match.referee}</span>
                </span>
              )}
            </div>
          </div>

          {/* Main Scoreboard Banner */}
          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-6 py-8">
            {/* Home Team */}
            <div className="md:col-span-5 flex items-center justify-center md:justify-end gap-4">
              <div className="text-center md:text-right">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-100 uppercase tracking-tight font-sans">
                  {match.homeTeam.name}
                </h2>
                <span className="text-xs text-slate-400 font-mono uppercase">
                  Home
                </span>
              </div>
              <TeamBadge
                name={match.homeTeam.name}
                tla={match.homeTeam.tla}
                size="lg"
                showName={false}
              />
            </div>

            {/* Score & Status Center */}
            <div className="md:col-span-2 flex flex-col items-center justify-center text-center">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-100 tracking-tight">
                {match.status === "SCHEDULED" ? (
                  <span className="text-lg text-slate-400">VS</span>
                ) : (
                  `${match.homeScore} - ${match.awayScore}`
                )}
              </div>

              <div className="mt-2">
                {isLive && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold uppercase tracking-widest bg-brand-green/20 text-brand-green border border-brand-green/30 rounded font-mono">
                    <span className="w-2 h-2 rounded-full bg-brand-green animate-ping" />
                    <span>{match.status === "HT" ? "Half Time" : `${match.minute}'`}</span>
                  </span>
                )}
                {isFinished && (
                  <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                    Full Time
                  </span>
                )}
                {match.status === "SCHEDULED" && (
                  <span className="text-xs font-mono text-slate-400">
                    {new Date(match.matchDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>

            {/* Away Team */}
            <div className="md:col-span-5 flex items-center justify-center md:justify-start gap-4">
              <TeamBadge
                name={match.awayTeam.name}
                tla={match.awayTeam.tla}
                size="lg"
                showName={false}
              />
              <div className="text-center md:text-left">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-100 uppercase tracking-tight font-sans">
                  {match.awayTeam.name}
                </h2>
                <span className="text-xs text-slate-400 font-mono uppercase">
                  Away
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Match Breakdown Tabs & Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Match Events Timeline */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-pitch-900 border border-pitch-800 p-5">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-pitch-800">
                <Activity className="w-4 h-4 text-brand-green" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Key Match Events
                </h3>
              </div>

              {match.events.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center font-mono">
                  No major match events logged yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {match.events.map((event) => {
                    const isHome = event.teamId === match.homeTeam.id;
                    return (
                      <div
                        key={event.id}
                        className={cn(
                          "flex items-center gap-3 text-xs p-2 rounded",
                          isHome ? "flex-row" : "flex-row-reverse text-right"
                        )}
                      >
                        <span className="font-mono font-bold text-slate-400 bg-pitch-800 px-2 py-0.5 rounded text-[11px]">
                          {event.minute}&apos;
                        </span>
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-200">
                            {event.playerName || "Player"}
                          </p>
                          {event.detail && (
                            <p className="text-[11px] text-slate-400">
                              {event.detail}
                            </p>
                          )}
                        </div>
                        <span
                          className={cn(
                            "px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded font-mono",
                            event.type === "GOAL" && "bg-brand-green/20 text-brand-green",
                            event.type === "YELLOW_CARD" && "bg-brand-gold/20 text-brand-gold",
                            event.type === "RED_CARD" && "bg-brand-red/20 text-brand-red"
                          )}
                        >
                          {event.type}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* In-Game Statistics */}
            {match.stats && (
              <div className="bg-pitch-900 border border-pitch-800 p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-pitch-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Match Statistics
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Opta Telemetry</span>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  {/* Possession */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>{match.stats.possessionHome}%</span>
                      <span className="text-slate-400 uppercase text-[10px]">Ball Possession</span>
                      <span>{match.stats.possessionAway}%</span>
                    </div>
                    <div className="h-1.5 bg-pitch-800 rounded-full flex overflow-hidden">
                      <div
                        style={{ width: `${match.stats.possessionHome}%` }}
                        className="bg-brand-green h-full"
                      />
                      <div
                        style={{ width: `${match.stats.possessionAway}%` }}
                        className="bg-slate-600 h-full"
                      />
                    </div>
                  </div>

                  {/* Shots */}
                  <div className="flex justify-between py-1 border-b border-pitch-850">
                    <span className="text-slate-200 font-bold">{match.stats.shotsHome}</span>
                    <span className="text-slate-400 uppercase text-[10px]">Total Shots</span>
                    <span className="text-slate-200 font-bold">{match.stats.shotsAway}</span>
                  </div>

                  {/* Shots on Target */}
                  <div className="flex justify-between py-1 border-b border-pitch-850">
                    <span className="text-slate-200 font-bold">{match.stats.shotsOnTargetHome}</span>
                    <span className="text-slate-400 uppercase text-[10px]">Shots on Target</span>
                    <span className="text-slate-200 font-bold">{match.stats.shotsOnTargetAway}</span>
                  </div>

                  {/* Corners */}
                  <div className="flex justify-between py-1 border-b border-pitch-850">
                    <span className="text-slate-200 font-bold">{match.stats.cornersHome}</span>
                    <span className="text-slate-400 uppercase text-[10px]">Corner Kicks</span>
                    <span className="text-slate-200 font-bold">{match.stats.cornersAway}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Starting Lineups */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-pitch-900 border border-pitch-800 p-5">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-pitch-800">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-brand-green" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Tactical Lineups
                  </h3>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  {match.lineups.home?.formation || "4-3-3"} vs {match.lineups.away?.formation || "4-2-3-1"}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                {/* Home Starters */}
                <div className="space-y-2">
                  <div className="font-bold text-slate-300 uppercase pb-1 border-b border-pitch-800 flex justify-between">
                    <span>{match.homeTeam.shortName}</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {match.lineups.home?.formation}
                    </span>
                  </div>
                  <ul className="space-y-1.5 font-mono">
                    {match.lineups.home?.starters?.map((p, idx) => (
                      <li key={idx} className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-500 w-5">{p.number}</span>
                        <span className="flex-1 font-sans font-medium text-slate-200">
                          {p.name}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase">
                          {p.position}
                        </span>
                      </li>
                    )) || (
                      <p className="text-slate-500 font-mono text-[11px]">Official lineup pending</p>
                    )}
                  </ul>
                </div>

                {/* Away Starters */}
                <div className="space-y-2">
                  <div className="font-bold text-slate-300 uppercase pb-1 border-b border-pitch-800 flex justify-between">
                    <span>{match.awayTeam.shortName}</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {match.lineups.away?.formation}
                    </span>
                  </div>
                  <ul className="space-y-1.5 font-mono">
                    {match.lineups.away?.starters?.map((p, idx) => (
                      <li key={idx} className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-500 w-5">{p.number}</span>
                        <span className="flex-1 font-sans font-medium text-slate-200">
                          {p.name}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase">
                          {p.position}
                        </span>
                      </li>
                    )) || (
                      <p className="text-slate-500 font-mono text-[11px]">Official lineup pending</p>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
