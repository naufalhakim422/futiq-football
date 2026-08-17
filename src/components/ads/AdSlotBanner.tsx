"use client";

import React from "react";
import { AdPlacementPosition } from "@prisma/client";
import { AdSlot } from "./AdSlot";

interface AdSlotBannerProps {
  position: AdPlacementPosition;
  device?: "DESKTOP" | "MOBILE" | "ALL";
  category?: string;
  teamSlug?: string;
  competitionCode?: string;
  className?: string;
}

export function AdSlotBanner({
  position,
  category,
  teamSlug,
  competitionCode,
  className,
}: AdSlotBannerProps) {
  return (
    <div className="my-6 w-full max-w-5xl mx-auto">
      <AdSlot
        placement={position}
        category={category}
        teamSlug={teamSlug}
        competitionCode={competitionCode}
        className={className}
      />
    </div>
  );
}
