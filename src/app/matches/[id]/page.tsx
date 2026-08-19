import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { footballService } from "@/lib/football/football.service";
import { PageContainer } from "@/components/layout/PageContainer";
import { TeamBadge } from "@/components/football/TeamBadge";
import { CompetitionBadge } from "@/components/football/CompetitionBadge";
import { MatchDetailHub } from "./MatchDetailHub";
import { MapPin, User, ChevronLeft, Shield, AlertTriangle, Trophy } from "lucide-react";
import Link from "next/link";

interface MatchDetailPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 15; // 15 seconds ISR for live matches

export async function generateMetadata({ params }: MatchDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const match = await footballService.getMatchDetail(id);

  if (!match) {
    return {
      title: "Pertandingan Tidak Ditemukan | FUTIQ FOOTBALL",
    };
  }

  const statusText =
    match.status === "FINISHED"
      ? `Hasil Akhir ${match.homeScore} - ${match.awayScore}`
      : match.status.startsWith("LIVE")
      ? `Skor Langsung ${match.homeScore} - ${match.awayScore} (${match.minute}')`
      : "Jadwal & Susunan Pemain";

  return {
    title: `${match.homeTeam.name} vs ${match.awayTeam.name} — ${statusText} | ${match.competition.name} | FUTIQ`,
    description: `Ikuti pertandingan sepak bola ${match.homeTeam.name} vs ${match.awayTeam.name} di ${match.competition.name}. Skor langsung, susunan pemain resmi, statistik Opta, rating pemain, dan linimasa pertandingan.`,
    openGraph: {
      title: `${match.homeTeam.name} vs ${match.awayTeam.name} — ${statusText}`,
      description: `Live Match Center & Telemetri Sepak Bola: ${match.competition.name}`,
    },
  };
}

export default async function MatchDetailPage({ params }: MatchDetailPageProps) {
  const { id } = await params;
  const match = await footballService.getMatchDetail(id);

  if (!match) {
    notFound();
  }

  const isLive =
    match.status === "LIVE_1H" ||
    match.status === "LIVE_2H" ||
    match.status === "HT" ||
    match.status === "ET" ||
    match.status === "PENALTY";
  const isFinished = match.status === "FINISHED";
  const isPostponed = match.status === "POSTPONED" || match.status === "CANCELLED";

  // Structured Data Schema for SportsEvent
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
    startDate: match.matchDate,
    location: {
      "@type": "Place",
      name: match.venue?.name || "Stadion Resmi",
      address: {
        "@type": "PostalAddress",
        addressLocality: match.venue?.city || "Kota Pertandingan",
      },
    },
    homeTeam: {
      "@type": "SportsTeam",
      name: match.homeTeam.name,
    },
    awayTeam: {
      "@type": "SportsTeam",
      name: match.awayTeam.name,
    },
  };

  return (
    <div className="py-8 space-y-8 font-sans">
      {/* Injected SportsEvent JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageContainer>
        {/* Navigation Breadcrumb */}
        <div className="pb-4 border-b border-pitch-800 flex items-center justify-between">
          <Link
            href="/matches"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-[#c3ff00]" />
            <span>Kembali ke Pusat Pertandingan</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="text-[#c3ff00] font-bold">{match.competition.name}</span>
            <span>•</span>
            <span>{match.group ? `${match.round || "Matchday"} (${match.group})` : match.round || "Matchday"}</span>
          </div>
        </div>

        {/* Main Scoreboard Header */}
        <div className="bg-pitch-900 border border-pitch-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden relative">
          {/* Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-[#c3ff00]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-pitch-800 text-xs text-slate-400 relative z-10">
            <div className="flex items-center gap-2">
              <CompetitionBadge
                name={match.competition.name}
                code={match.competition.code}
              />
              <span className="font-mono text-slate-300">
                {match.group ? `${match.round || "Matchday"} (${match.group})` : match.round || "Matchday"}
              </span>
            </div>

            <div className="flex items-center gap-4 font-mono text-[11px]">
              {match.venue && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#c3ff00]" />
                  <span>{match.venue.name}, {match.venue.city}</span>
                </span>
              )}
              {match.referee && (
                <span className="flex items-center gap-1 text-slate-400">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Wasit: {match.referee}</span>
                </span>
              )}
            </div>
          </div>

          {/* Main Scoreboard Banner */}
          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-6 py-8 relative z-10">
            {/* Home Team */}
            <div className="md:col-span-5 flex items-center justify-center md:justify-end gap-5">
              <div className="text-center md:text-right">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 uppercase tracking-tight font-sans">
                  {match.homeTeam.name}
                </h2>
                <span className="text-xs text-[#c3ff00] font-mono uppercase font-bold">
                  {match.homeTeam.isNationalTeam ? "Tim Nasional" : "Tuan Rumah"}
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
              <div className="text-4xl sm:text-5xl font-black font-mono text-slate-100 tracking-tight">
                {match.status === "SCHEDULED" ? (
                  <span className="text-xl text-slate-400">VS</span>
                ) : (
                  `${match.homeScore} - ${match.awayScore}`
                )}
              </div>

              {/* Extra Time or Penalty Shootout Result */}
              {match.penaltyHomeScore !== undefined && match.penaltyAwayScore !== undefined && (
                <span className="mt-1 text-xs font-mono font-bold text-purple-300 bg-purple-950/80 px-2.5 py-0.5 rounded-full border border-purple-800">
                  Adu Penalti: {match.penaltyHomeScore} - {match.penaltyAwayScore}
                </span>
              )}

              <div className="mt-3">
                {isLive && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-widest bg-brand-red/20 text-brand-red border border-brand-red/30 rounded-full font-mono shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-brand-red animate-ping" />
                    <span>
                      {match.status === "HT"
                        ? "Babak Pertama (HT)"
                        : match.status === "ET"
                        ? `Extra Time (${match.minute}')`
                        : match.status === "PENALTY"
                        ? "Adu Penalti (LIVE)"
                        : `LIVE ${match.minute}'`}
                    </span>
                  </span>
                )}
                {isFinished && (
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-pitch-950 border border-pitch-750 text-slate-300">
                    {match.etHomeScore !== undefined ? "Selesai (AET)" : "Selesai (Full Time)"}
                  </span>
                )}
                {match.status === "SCHEDULED" && (
                  <span className="text-xs font-mono text-slate-300 px-3 py-1 rounded bg-pitch-950 border border-pitch-800">
                    {new Date(match.matchDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} WIB
                  </span>
                )}
                {isPostponed && (
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-amber-950/80 text-amber-300 border border-amber-800">
                    Ditunda (Postponed)
                  </span>
                )}
              </div>
            </div>

            {/* Away Team */}
            <div className="md:col-span-5 flex items-center justify-center md:justify-start gap-5">
              <TeamBadge
                name={match.awayTeam.name}
                tla={match.awayTeam.tla}
                size="lg"
                showName={false}
              />
              <div className="text-center md:text-left">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 uppercase tracking-tight font-sans">
                  {match.awayTeam.name}
                </h2>
                <span className="text-xs text-cyan-400 font-mono uppercase font-bold">
                  {match.awayTeam.isNationalTeam ? "Tim Nasional" : "Tim Tamu"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Google & FotMob Level Match Hub with Multi-Tab Telemetry */}
        <MatchDetailHub match={match} />
      </PageContainer>
    </div>
  );
}
