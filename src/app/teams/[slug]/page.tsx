import React from "react";
import { notFound } from "next/navigation";
import { footballService } from "@/lib/football/football.service";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { TeamBadge } from "@/components/football/TeamBadge";
import { MatchCard } from "@/components/football/MatchCard";
import Link from "next/link";
import { MapPin, User, Calendar, Globe, Users } from "lucide-react";

interface TeamDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600; // 1 hour ISR

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const { slug } = await params;
  const team = await footballService.getTeamDetail(slug);

  if (!team) {
    notFound();
  }

  // Group squad by position
  const goalkeepers = team.squad.filter((p) => p.position === "GOALKEEPER");
  const defenders = team.squad.filter((p) => p.position === "DEFENDER");
  const midfielders = team.squad.filter((p) => p.position === "MIDFIELDER");
  const attackers = team.squad.filter((p) => p.position === "ATTACKER");

  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        {/* Team Masthead */}
        <div className="bg-pitch-900 border border-pitch-800 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-pitch-800">
            <div className="flex items-center gap-4">
              <TeamBadge
                name={team.name}
                tla={team.tla}
                size="lg"
                showName={false}
              />
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 uppercase tracking-tight font-sans">
                  {team.name}
                </h1>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-1">
                  <span>{team.country}</span>
                  {team.foundedYear && <span>• Est. {team.foundedYear}</span>}
                  {team.competitionCode && (
                    <span>• {team.competitionCode}</span>
                  )}
                </div>
              </div>
            </div>

            {team.standing && (
              <div className="bg-pitch-850 border border-pitch-750 px-4 py-2 text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  League Position
                </span>
                <div className="text-xl font-bold font-mono text-brand-green">
                  #{team.standing.position}{" "}
                  <span className="text-xs text-slate-400 font-normal">
                    ({team.standing.points} pts)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Club Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            {team.stadium && (
              <div className="bg-pitch-850 border border-pitch-750 p-3 flex items-center gap-3">
                <MapPin className="w-4 h-4 text-brand-green shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Stadium</span>
                  <p className="font-semibold text-slate-200 truncate">
                    {team.stadium.name} ({team.stadium.capacity?.toLocaleString()} cap)
                  </p>
                </div>
              </div>
            )}

            {team.manager && (
              <div className="bg-pitch-850 border border-pitch-750 p-3 flex items-center gap-3">
                <User className="w-4 h-4 text-brand-green shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Head Coach</span>
                  <p className="font-semibold text-slate-200 truncate">
                    {team.manager.name} ({team.manager.nationality})
                  </p>
                </div>
              </div>
            )}

            {team.websiteUrl && (
              <div className="bg-pitch-850 border border-pitch-750 p-3 flex items-center gap-3">
                <Globe className="w-4 h-4 text-brand-green shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Official Site</span>
                  <a
                    href={team.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-brand-green hover:underline truncate block"
                  >
                    Visit Club Website
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Squad Breakdown */}
        <div className="space-y-6">
          <SectionHeader
            title="Active First Team Squad"
            subtitle="Current roster registered for domestic and continental campaigns"
            badgeText={`${team.squad.length} Players`}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Goalkeepers */}
            <div className="bg-pitch-900 border border-pitch-800 p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-pitch-800">
                Goalkeepers
              </h3>
              <ul className="space-y-2 text-xs">
                {goalkeepers.map((p) => (
                  <li key={p.id} className="flex items-center justify-between">
                    <span className="font-mono text-slate-500 w-5">{p.shirtNumber || "-"}</span>
                    <Link href={`/players/${p.slug}`} className="flex-1 font-semibold text-slate-200 hover:text-brand-green truncate">
                      {p.name}
                    </Link>
                    <span className="text-[10px] text-slate-500 font-mono">{p.nationality}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Defenders */}
            <div className="bg-pitch-900 border border-pitch-800 p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-pitch-800">
                Defenders
              </h3>
              <ul className="space-y-2 text-xs">
                {defenders.map((p) => (
                  <li key={p.id} className="flex items-center justify-between">
                    <span className="font-mono text-slate-500 w-5">{p.shirtNumber || "-"}</span>
                    <Link href={`/players/${p.slug}`} className="flex-1 font-semibold text-slate-200 hover:text-brand-green truncate">
                      {p.name}
                    </Link>
                    <span className="text-[10px] text-slate-500 font-mono">{p.nationality}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Midfielders */}
            <div className="bg-pitch-900 border border-pitch-800 p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-pitch-800">
                Midfielders
              </h3>
              <ul className="space-y-2 text-xs">
                {midfielders.map((p) => (
                  <li key={p.id} className="flex items-center justify-between">
                    <span className="font-mono text-slate-500 w-5">{p.shirtNumber || "-"}</span>
                    <Link href={`/players/${p.slug}`} className="flex-1 font-semibold text-slate-200 hover:text-brand-green truncate">
                      {p.name}
                    </Link>
                    <span className="text-[10px] text-slate-500 font-mono">{p.nationality}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Attackers */}
            <div className="bg-pitch-900 border border-pitch-800 p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-pitch-800">
                Forwards
              </h3>
              <ul className="space-y-2 text-xs">
                {attackers.map((p) => (
                  <li key={p.id} className="flex items-center justify-between">
                    <span className="font-mono text-slate-500 w-5">{p.shirtNumber || "-"}</span>
                    <Link href={`/players/${p.slug}`} className="flex-1 font-semibold text-slate-200 hover:text-brand-green truncate">
                      {p.name}
                    </Link>
                    <span className="text-[10px] text-slate-500 font-mono">{p.nationality}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Recent & Upcoming Matches */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <SectionHeader
              title="Recent Results"
              badgeText="Finished"
            />
            <div className="space-y-3">
              {team.recentMatches.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </div>

          <div>
            <SectionHeader
              title="Upcoming Fixtures"
              badgeText="Schedule"
            />
            <div className="space-y-3">
              {team.upcomingFixtures.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
