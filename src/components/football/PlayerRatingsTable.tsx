"use client";

import React, { useState } from "react";
import { ProviderMatchLineup, LineupPlayer } from "@/lib/football/types";
import { Star, Shield, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPlayerFacePhoto } from "@/lib/football/player-face.helper";

interface PlayerRatingsTableProps {
  homeLineup: ProviderMatchLineup;
  awayLineup: ProviderMatchLineup;
  homeTeamName: string;
  awayTeamName: string;
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
            Formasi: {lineup.formation || "—"}
          </span>
        </div>

        {/* Players List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-pitch-800 text-slate-400 uppercase font-mono text-[10px]">
                <th className="py-2.5 px-2 w-8 text-center">No</th>
                <th className="py-2.5 px-3">Pemain</th>
                <th className="py-2.5 px-2 text-center">Pos</th>
                <th className="py-2.5 px-2 text-center">Status</th>
                <th className="py-2.5 px-2 text-right">Rating Provider</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pitch-850">
              {allPlayers.map((p, idx) => {
                const verifiedPhoto = p.photoUrl || getPlayerFacePhoto(p.name, p.number, p.playerId);

                return (
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
                        <div className="w-7 h-7 rounded-full bg-pitch-950 border border-pitch-750 flex items-center justify-center overflow-hidden shrink-0">
                          {verifiedPhoto ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={verifiedPhoto} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-mono text-[9px] font-bold text-slate-400">{p.position}</span>
                          )}
                        </div>
                        <span className="font-bold text-slate-200 truncate max-w-[140px]">
                          {p.name} {p.isCaptain && <strong className="text-[#c3ff00] text-[9px] font-mono ml-1">(C)</strong>}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono text-slate-400 uppercase font-semibold">
                      {p.position || "—"}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono text-[10px]">
                      {p.isStarter ? (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                          Starter
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-pitch-950 text-slate-400 border border-pitch-800">
                          Cadangan
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-black border", getRatingBadgeClass(p.rating, p.isMotm))}>
                        {p.isMotm && <Star className="w-2.5 h-2.5 fill-white text-white" />}
                        <span>{formatRating(p.rating)}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {renderTeamSection(homeLineup, homeTeamName, true)}
        {renderTeamSection(awayLineup, awayTeamName, false)}
      </div>

      {/* Selected Player Detail Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-pitch-900 border border-pitch-750 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 relative">
            <button
              onClick={() => setSelectedPlayer(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-pitch-950 border border-pitch-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-pitch-950 border-2 border-[#c3ff00] overflow-hidden flex items-center justify-center shadow-lg shrink-0">
                {selectedPlayer.player.photoUrl || getPlayerFacePhoto(selectedPlayer.player.name, selectedPlayer.player.number, selectedPlayer.player.playerId) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedPlayer.player.photoUrl || getPlayerFacePhoto(selectedPlayer.player.name, selectedPlayer.player.number, selectedPlayer.player.playerId)!}
                    alt={selectedPlayer.player.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-[#c3ff00]" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#c3ff00]">
                    #{selectedPlayer.player.number}
                  </span>
                  <span className="text-xs font-mono text-slate-400 uppercase">
                    {selectedPlayer.player.position}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-100">
                  {selectedPlayer.player.name}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {selectedPlayer.teamName}
                </span>
              </div>
            </div>

            <div className="p-4 bg-pitch-950 rounded-2xl border border-pitch-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 block">
                  Rating Resmi Provider
                </span>
                <span className="text-2xl font-black font-mono text-slate-100">
                  {formatRating(selectedPlayer.player.rating)}
                </span>
              </div>

              {selectedPlayer.player.isMotm && (
                <div className="px-3 py-1.5 rounded-xl bg-[#0091ea] text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow">
                  <Star className="w-4 h-4 fill-white" />
                  <span>Man of the Match</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedPlayer(null)}
              className="w-full py-3 rounded-xl bg-[#c3ff00] hover:bg-[#b0e600] text-slate-950 font-bold text-xs font-mono transition-colors shadow-md"
            >
              Tutup Rincian
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
