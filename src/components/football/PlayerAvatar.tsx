"use client";

import React, { useState } from "react";
import { playerIdentityResolver } from "@/lib/football/player-identity.resolver";
import { cn } from "@/lib/utils";

export interface PlayerAvatarProps {
  playerId?: string | number | null;
  playerName?: string;
  photoUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  number?: number;
  position?: string;
  team?: "home" | "away" | "neutral";
  className?: string;
}

const sizeClasses = {
  xs: "w-6 h-6 text-[8px]",
  sm: "w-7 h-7 text-[9px]",
  md: "w-9 h-9 text-[10px]",
  lg: "w-12 h-12 sm:w-14 sm:h-14 text-xs",
  xl: "w-16 h-16 sm:w-20 sm:h-20 text-sm",
};

export function PlayerAvatar({
  playerId,
  playerName = "Player",
  photoUrl,
  size = "md",
  number,
  position,
  team = "neutral",
  className,
}: PlayerAvatarProps) {
  const [imgError, setImgError] = useState(false);

  // Canonical player photo resolution
  const targetPhoto = playerIdentityResolver.resolvePlayerPhoto(playerId, photoUrl, null, playerName);

  const initials = playerName
    ? playerName
        .split(" ")
        .filter((part) => part.length > 0)
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : number !== undefined
    ? String(number)
    : "P";

  const isGk = position?.toUpperCase() === "GK";

  const fallbackColor = isGk
    ? "bg-gradient-to-b from-amber-400/20 to-amber-600/30 border-amber-400/40 text-amber-300"
    : team === "home"
    ? "bg-gradient-to-b from-[#c3ff00]/15 to-[#a2db00]/25 border-[#c3ff00]/40 text-[#c3ff00]"
    : team === "away"
    ? "bg-gradient-to-b from-cyan-400/15 to-blue-500/25 border-cyan-400/40 text-cyan-300"
    : "bg-gradient-to-b from-slate-800 to-slate-900 border-slate-700 text-slate-300";

  if (targetPhoto && !imgError) {
    return (
      <div
        className={cn(
          "relative rounded-full overflow-hidden bg-pitch-950 flex items-center justify-center shrink-0 border border-pitch-750 select-none shadow-sm",
          sizeClasses[size],
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={targetPhoto}
          alt={playerName}
          loading="lazy"
          className="w-full h-full object-cover object-top transition-transform duration-200 group-hover:scale-105"
          onError={() => setImgError(true)}
        />
        {number !== undefined && size === "lg" && (
          <div className="absolute bottom-0 right-0 bg-black/90 text-white font-mono font-bold text-[8px] px-1 rounded-tl shadow">
            #{number}
          </div>
        )}
      </div>
    );
  }

  // Clean Neutral FUTIQ Avatar Fallback with Initials & Number
  return (
    <div
      className={cn(
        "rounded-full flex flex-col items-center justify-center font-mono font-black shrink-0 border select-none shadow-inner",
        sizeClasses[size],
        fallbackColor,
        className
      )}
      title={`${playerName} ${number ? `(#${number})` : ""} ${position ? `[${position}]` : ""}`}
    >
      <span className="leading-none drop-shadow-sm tracking-tight">{initials}</span>
      {number !== undefined && (size === "lg" || size === "xl") && (
        <span className="text-[7px] sm:text-[8px] opacity-80 mt-0.5 leading-none">#{number}</span>
      )}
    </div>
  );
}
