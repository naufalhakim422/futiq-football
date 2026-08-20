"use client";

import React, { useState } from "react";
import { ProviderMatchLineup, LineupPlayer } from "@/lib/football/types";
import { Star, Shield, User, X, Sparkles, ExternalLink, TrendingUp, Award } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { playerIdentityResolver } from "@/lib/football/player-identity.resolver";

interface PlayerRatingsTableProps {
  homeLineup: ProviderMatchLineup;
  awayLineup: ProviderMatchLineup;
  homeTeamName: string;
  awayTeamName: string;
}

function PlayerAvatarItem({
  photoUrl,
  playerId,
  name,
  number,
  position,
  isHome,
}: {
  photoUrl?: string;
  playerId?: string;
  name: string;
  number: number;
  position: string;
  isHome: boolean;
}) {
  const [error, setError] = useState(false);
  const verifiedPhoto = playerIdentityResolver.resolvePlayerPhoto(playerId, photoUrl);

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : `${number}`;

  if (verifiedPhoto && !error) {
    return (
      <div className="w-7 h-7 rounded-full bg-pitch-950 border border-pitch-750 flex items-center justify-center overflow-hidden shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={verifiedPhoto}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-mono font-bold shrink-0 border select-none",
        isHome
          ? "bg-[#c3ff00]/15 border-[#c3ff00]/40 text-[#c3ff00]"
          : "bg-cyan-400/15 border-cyan-400/40 text-cyan-300"
      )}
      title={`${name} (#${number} - ${position})`}
    >
      {initials}
    </div>
  );
}

export function PlayerRatingsTable({
  homeLineup,
  awayLineup,
  homeTeamName,
  awayTeamName,
}: PlayerRatingsTableProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<{
    player: LineupPlayer;
    teamName: string;
  } | null>(null);

  const formatRating = (rating?: number | string) => {
    if (!rating) return "—";
    const num = typeof rating === "string" ? parseFloat(rating) : rating;
    return num.toFixed(1);
  };

  const getRatingBadgeClass = (rating?: number | string, isMotm?: boolean) => {
    if (isMotm) {
      return "bg-[#0091ea] text-white border-[#00b0ff] shadow-[0_0_10px_rgba(0,145,234,0.5)]";
    }
    if (!rating) return "bg-pitch-950 text-slate-400 border-pitch-800";
    const num = typeof rating === "string" ? parseFloat(rating) : rating;
    if (num >= 7.5) return "bg-[#00c853] text-slate-950 border-[#69f0ae]";
    if (num >= 7.0) return "bg-[#64dd17] text-slate-950 border-[#b2ff59]";
    if (num >= 6.0) return "bg-[#ff9100] text-slate-950 border-[#ffb74d]";
    return "bg-[#ff3d00] text-white border-[#ff6e40]";
  };

  // Find Man of the Match across both teams
  const allHome = [...(homeLineup.starters || []), ...(homeLineup.bench || [])];
  const allAway = [...(awayLineup.starters || []), ...(awayLineup.bench || [])];
  
  const motmCandidate =
    allHome.find((p) => p.isMotm) ||
    allAway.find((p) => p.isMotm) ||
    [...allHome, ...allAway].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))[0];

  const motmTeam = motmCandidate && allHome.includes(motmCandidate) ? homeTeamName : awayTeamName;
  const motmPhoto = motmCandidate
    ? playerIdentityResolver.resolvePlayerPhoto(motmCandidate.playerId, motmCandidate.photoUrl)
    : null;

  const renderTeamSection = (lineup: ProviderMatchLineup, teamName: string, isHome: boolean) => {
    const allPlayers = [
      ...(lineup.starters || []).map((p) => ({ ...p, isStarter: true })),
      ...(lineup.bench || []).map((p) => ({ ...p, isStarter: false })),
    ];

    return (
      <div className="bg-pitch-900 border border-pitch-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4 font-sans">
        {/* Team Header */}
        <div className="flex items-center justify-between pb-3 border-b border-pitch-800">
          <div className="flex items-center gap-2.5">
            <span className={cn("w-3 h-3 rounded-full", isHome ? "bg-[#c3ff00]" : "bg-cyan-400")} />
            <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-tight">
              {teamName}
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            Formation: {lineup.formation || "—"}
          </span>
        </div>

        {/* Players List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-pitch-800 text-slate-400 uppercase font-mono text-[10px]">
                <th className="py-2.5 px-2 w-8 text-center">No</th>
                <th className="py-2.5 px-3">Player</th>
                <th className="py-2.5 px-2 text-center">Pos</th>
                <th className="py-2.5 px-2 text-center">Role</th>
                <th className="py-2.5 px-2 text-right">Opta Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pitch-850">
              {allPlayers.map((p, idx) => (
                <tr
                  key={`${p.number}_${idx}`}
                  onClick={() => setSelectedPlayer({ player: p, teamName })}
                  className="hover:bg-pitch-850/60 transition-colors cursor-pointer"
                >
                  <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-400">
                    #{p.number}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <PlayerAvatarItem
                        photoUrl={p.photoUrl}
                        playerId={p.playerId}
                        name={p.name}
                        number={p.number}
                        position={p.position}
                        isHome={isHome}
                      />
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-200">
                          {p.name}
                        </span>
                        {p.isCaptain && (
                          <span className="text-[8px] font-mono font-bold text-[#c3ff00] bg-black/80 px-1 rounded border border-[#c3ff00]/30" title="Captain">
                            (C)
                          </span>
                        )}
                        {p.isMotm && (
                          <span className="text-[9px] font-mono font-bold text-white bg-[#0091ea] px-1.5 py-0.2 rounded" title="Man of the Match">
                            MOTM
                          </span>
                        )}
                        {Boolean(p.goals && p.goals > 0) && (
                          <span className="text-[10px]" title={`${p.goals} Goals`}>⚽</span>
                        )}
                        {Boolean(p.assists && p.assists > 0) && (
                          <span className="text-[10px]" title={`${p.assists} Assists`}>🅰</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono text-slate-400 uppercase font-semibold">
                    {p.position}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded", p.isStarter ? "bg-pitch-950 text-slate-300" : "bg-pitch-950/50 text-slate-500")}>
                      {p.isStarter ? "Starter" : "Sub"}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-black border",
                        getRatingBadgeClass(p.rating, p.isMotm)
                      )}
                    >
                      {p.isMotm && <Star className="w-2.5 h-2.5 fill-white text-white" />}
                      <span>{formatRating(p.rating)}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      {/* MOTM SPOTLIGHT CARD */}
      {motmCandidate && (
        <div className="bg-gradient-to-r from-pitch-900 via-pitch-850 to-pitch-900 border border-pitch-750 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-32 bg-[#0091ea]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-pitch-950 border-2 border-[#0091ea] overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(0,145,234,0.4)] shrink-0">
              {motmPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={motmPhoto} alt={motmCandidate.name} className="w-full h-full object-cover" />
              ) : (
                <Award className="w-8 h-8 text-[#0091ea]" />
              )}
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0091ea]/20 text-[#00b0ff] border border-[#0091ea]/40 text-[10px] font-mono font-bold uppercase tracking-wider">
                <Star className="w-3 h-3 fill-[#00b0ff]" />
                <span>Man of the Match</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-100 uppercase tracking-tight">
                {motmCandidate.name}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {motmTeam} • #{motmCandidate.number} ({motmCandidate.position})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 relative z-10 self-end md:self-center font-mono">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Opta Rating
              </span>
              <span className="text-3xl font-black text-[#00b0ff]">
                {formatRating(motmCandidate.rating)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* RATING TABLES (HOME & AWAY) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderTeamSection(homeLineup, homeTeamName, true)}
        {renderTeamSection(awayLineup, awayTeamName, false)}
      </div>

      {/* Attribution Disclaimer */}
      <div className="p-3 bg-pitch-950 border border-pitch-800 rounded-xl text-center text-[10px] text-slate-400 font-mono">
        💡 <strong>Rating Transparency Note:</strong> Player performance ratings are computed from official match statistics feeds (passes, tackles, goals, key actions) and verified by the Opta telemetry model.
      </div>
    </div>
  );
}
