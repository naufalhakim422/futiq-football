import React from "react";
import { notFound } from "next/navigation";
import { footballService } from "@/lib/football/football.service";
import { PageContainer } from "@/components/layout/PageContainer";
import { TeamBadge } from "@/components/football/TeamBadge";
import { CompetitionBadge } from "@/components/football/CompetitionBadge";
import { Clock, Shield, MapPin, User, Activity, Star, Award, Zap, ChevronLeft } from "lucide-react";
import Link from "next/link";
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

  const formatRating = (rating?: number | string) => {
    if (!rating) return null;
    const num = typeof rating === "string" ? parseFloat(rating) : rating;
    return num.toFixed(1);
  };

  const getRatingColor = (rating?: number | string) => {
    if (!rating) return "bg-pitch-800 text-slate-400";
    const num = typeof rating === "string" ? parseFloat(rating) : rating;
    if (num >= 8.5) return "bg-emerald-950 text-emerald-400 border-emerald-700 shadow-sm";
    if (num >= 7.5) return "bg-cyan-950 text-cyan-300 border-cyan-700";
    if (num >= 6.5) return "bg-pitch-800 text-slate-200 border-pitch-700";
    return "bg-red-950 text-red-400 border-red-800";
  };

  return (
    <div className="py-8 space-y-8 font-sans">
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
            <span>{match.round || "Matchday"}</span>
          </div>
        </div>

        {/* Match Header / Main Scoreboard */}
        <div className="bg-pitch-900 border border-pitch-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden relative">
          {/* Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-[#c3ff00]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-pitch-800 text-xs text-slate-400 relative z-10">
            <div className="flex items-center gap-2">
              <CompetitionBadge
                name={match.competition.name}
                code={match.competition.code}
              />
              <span className="font-mono text-slate-300">{match.round || "Matchday"}</span>
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
                  Tuan Rumah
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

              <div className="mt-3">
                {isLive && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-widest bg-brand-red/20 text-brand-red border border-brand-red/30 rounded-full font-mono shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-brand-red animate-ping" />
                    <span>{match.status === "HT" ? "Babak Pertama (HT)" : `LIVE ${match.minute}'`}</span>
                  </span>
                )}
                {isFinished && (
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-pitch-950 border border-pitch-750 text-slate-300">
                    Selesai (Full Time)
                  </span>
                )}
                {match.status === "SCHEDULED" && (
                  <span className="text-xs font-mono text-slate-300 px-3 py-1 rounded bg-pitch-950 border border-pitch-800">
                    {new Date(match.matchDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} WIB
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
                <span className="text-xs text-slate-400 font-mono uppercase font-bold">
                  Tim Tamu
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Match Breakdown Grid: Events + Advanced Stats + Lineups with Player Ratings */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Events & Match Statistics */}
          <div className="lg:col-span-5 space-y-6">
            {/* Match Events Timeline */}
            <div className="bg-pitch-900 border border-pitch-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-pitch-800">
                <Activity className="w-4 h-4 text-[#c3ff00]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  Momen & Gol Pertandingan
                </h3>
              </div>

              {match.events.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center font-mono">
                  Belum ada catatan gol atau kartu tercatat.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {match.events.map((event) => {
                    const isHome = event.teamId === match.homeTeam.id;
                    return (
                      <div
                        key={event.id}
                        className={cn(
                          "flex items-center gap-3 text-xs p-2.5 rounded-xl border transition-colors",
                          isHome
                            ? "bg-pitch-950/80 border-pitch-800"
                            : "bg-pitch-950/80 border-pitch-800 flex-row-reverse text-right"
                        )}
                      >
                        <span className="font-mono font-bold text-[#c3ff00] bg-pitch-900 px-2 py-0.5 rounded text-[11px] border border-pitch-750">
                          {event.minute}&apos;
                        </span>
                        <div className="space-y-0.5 flex-1">
                          <p className="font-bold text-slate-200">
                            {event.playerName || "Pemain"}
                          </p>
                          {event.detail && (
                            <p className="text-[11px] text-slate-400 font-normal">
                              {event.detail}
                            </p>
                          )}
                        </div>
                        <span
                          className={cn(
                            "px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded font-mono border",
                            event.type === "GOAL" && "bg-emerald-950/80 text-emerald-400 border-emerald-800",
                            event.type === "YELLOW_CARD" && "bg-amber-950/80 text-amber-400 border-amber-800",
                            event.type === "RED_CARD" && "bg-red-950/80 text-red-400 border-red-800"
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

            {/* In-Game Telemetry & Match Statistics */}
            {match.stats && (
              <div className="bg-pitch-900 border border-pitch-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-pitch-800">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#c3ff00]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                      Statistik Lengkap Pertandingan
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Opta Index</span>
                </div>

                <div className="space-y-3.5 text-xs font-mono">
                  {/* Expected Goals (xG) */}
                  {typeof match.stats.xgHome === "number" && (
                    <div className="p-3 bg-pitch-950 rounded-xl border border-pitch-800 space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="text-[#c3ff00] text-sm">{match.stats.xgHome}</span>
                        <span className="text-slate-400 uppercase text-[10px]">Expected Goals (xG)</span>
                        <span className="text-cyan-400 text-sm">{match.stats.xgAway}</span>
                      </div>
                    </div>
                  )}

                  {/* Possession */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-300 font-bold">
                      <span>{match.stats.possessionHome}%</span>
                      <span className="text-slate-400 uppercase text-[10px]">Penguasaan Bola</span>
                      <span>{match.stats.possessionAway}%</span>
                    </div>
                    <div className="h-2 bg-pitch-950 rounded-full flex overflow-hidden border border-pitch-800">
                      <div
                        style={{ width: `${match.stats.possessionHome}%` }}
                        className="bg-[#c3ff00] h-full"
                      />
                      <div
                        style={{ width: `${match.stats.possessionAway}%` }}
                        className="bg-slate-600 h-full"
                      />
                    </div>
                  </div>

                  {/* Total Shots */}
                  <div className="flex justify-between py-1.5 border-b border-pitch-800">
                    <span className="text-slate-200 font-bold">{match.stats.shotsHome}</span>
                    <span className="text-slate-400 uppercase text-[10px]">Total Tembakan</span>
                    <span className="text-slate-200 font-bold">{match.stats.shotsAway}</span>
                  </div>

                  {/* Shots on Target */}
                  <div className="flex justify-between py-1.5 border-b border-pitch-800">
                    <span className="text-emerald-400 font-bold">{match.stats.shotsOnTargetHome}</span>
                    <span className="text-slate-400 uppercase text-[10px]">Tembakan Tepat Sasaran</span>
                    <span className="text-emerald-400 font-bold">{match.stats.shotsOnTargetAway}</span>
                  </div>

                  {/* Pass Accuracy */}
                  {typeof match.stats.passAccuracyHome === "number" && (
                    <div className="flex justify-between py-1.5 border-b border-pitch-800">
                      <span className="text-slate-200 font-bold">{match.stats.passAccuracyHome}%</span>
                      <span className="text-slate-400 uppercase text-[10px]">Akurasi Operan</span>
                      <span className="text-slate-200 font-bold">{match.stats.passAccuracyAway}%</span>
                    </div>
                  )}

                  {/* Corners */}
                  <div className="flex justify-between py-1.5 border-b border-pitch-800">
                    <span className="text-slate-200 font-bold">{match.stats.cornersHome}</span>
                    <span className="text-slate-400 uppercase text-[10px]">Tendangan Sudut</span>
                    <span className="text-slate-200 font-bold">{match.stats.cornersAway}</span>
                  </div>

                  {/* Fouls */}
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-200 font-bold">{match.stats.foulsHome}</span>
                    <span className="text-slate-400 uppercase text-[10px]">Pelanggaran</span>
                    <span className="text-slate-200 font-bold">{match.stats.foulsAway}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Tactical Lineups & Player Performance Ratings */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-pitch-900 border border-pitch-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-pitch-800 gap-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#c3ff00]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                    Susunan Pemain & Rating Performa
                  </h3>
                </div>
                <div className="text-xs font-mono text-[#c3ff00] font-bold">
                  {match.lineups.home?.formation || "4-3-3"} vs {match.lineups.away?.formation || "4-2-3-1"}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Home Starters */}
                <div className="space-y-3">
                  <div className="p-2.5 bg-pitch-950 rounded-xl border border-pitch-800 font-bold text-slate-200 flex justify-between items-center">
                    <span className="text-sm font-extrabold">{match.homeTeam.name}</span>
                    <span className="font-mono text-[10px] text-[#c3ff00] px-2 py-0.5 rounded bg-pitch-900 border border-pitch-750">
                      {match.lineups.home?.formation}
                    </span>
                  </div>

                  <ul className="space-y-1.5">
                    {match.lineups.home?.starters?.map((p, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-pitch-950/60 border border-pitch-800/80 hover:border-pitch-700 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <span className="text-slate-500 font-mono text-[11px] w-4 text-center">
                            {p.number}
                          </span>
                          <div className="truncate">
                            <span className="font-semibold text-slate-100 font-sans text-xs truncate block">
                              {p.name} {p.isCaptain && <strong className="text-[#c3ff00] text-[10px] font-mono ml-1">(C)</strong>}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono uppercase">
                              {p.position}
                            </span>
                          </div>
                        </div>

                        {/* Player Badges & Rating */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {p.isMotm && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700 flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-amber-400" />
                              <span>MOTM</span>
                            </span>
                          )}
                          {p.rating && (
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-lg text-xs font-mono font-extrabold border",
                                getRatingColor(p.rating)
                              )}
                            >
                              {formatRating(p.rating)}
                            </span>
                          )}
                        </div>
                      </li>
                    )) || (
                      <p className="text-slate-500 font-mono text-[11px] py-4 text-center">
                        Susunan pemain resmi sedang dipersiapkan.
                      </p>
                    )}
                  </ul>
                </div>

                {/* Away Starters */}
                <div className="space-y-3">
                  <div className="p-2.5 bg-pitch-950 rounded-xl border border-pitch-800 font-bold text-slate-200 flex justify-between items-center">
                    <span className="text-sm font-extrabold">{match.awayTeam.name}</span>
                    <span className="font-mono text-[10px] text-cyan-400 px-2 py-0.5 rounded bg-pitch-900 border border-pitch-750">
                      {match.lineups.away?.formation}
                    </span>
                  </div>

                  <ul className="space-y-1.5">
                    {match.lineups.away?.starters?.map((p, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-pitch-950/60 border border-pitch-800/80 hover:border-pitch-700 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <span className="text-slate-500 font-mono text-[11px] w-4 text-center">
                            {p.number}
                          </span>
                          <div className="truncate">
                            <span className="font-semibold text-slate-100 font-sans text-xs truncate block">
                              {p.name} {p.isCaptain && <strong className="text-cyan-400 text-[10px] font-mono ml-1">(C)</strong>}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono uppercase">
                              {p.position}
                            </span>
                          </div>
                        </div>

                        {/* Player Badges & Rating */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {p.isMotm && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700 flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-amber-400" />
                              <span>MOTM</span>
                            </span>
                          )}
                          {p.rating && (
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-lg text-xs font-mono font-extrabold border",
                                getRatingColor(p.rating)
                              )}
                            >
                              {formatRating(p.rating)}
                            </span>
                          )}
                        </div>
                      </li>
                    )) || (
                      <p className="text-slate-500 font-mono text-[11px] py-4 text-center">
                        Susunan pemain resmi sedang dipersiapkan.
                      </p>
                    )}
                  </ul>
                </div>
              </div>

              {/* Substitutes / Bench Section */}
              <div className="pt-4 border-t border-pitch-800/80">
                <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Pemain Cadangan (Bench)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-slate-300">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">{match.homeTeam.shortName}</span>
                    {match.lineups.home?.bench?.map((p, i) => (
                      <div key={i} className="flex justify-between items-center py-1 px-2 rounded bg-pitch-950/40 border border-pitch-850">
                        <span>#{p.number} {p.name} ({p.position})</span>
                        {p.rating && <span className="text-[#c3ff00] font-bold">{formatRating(p.rating)}</span>}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">{match.awayTeam.shortName}</span>
                    {match.lineups.away?.bench?.map((p, i) => (
                      <div key={i} className="flex justify-between items-center py-1 px-2 rounded bg-pitch-950/40 border border-pitch-850">
                        <span>#{p.number} {p.name} ({p.position})</span>
                        {p.rating && <span className="text-cyan-400 font-bold">{formatRating(p.rating)}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
