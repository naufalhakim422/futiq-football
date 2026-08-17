import { AdPlacementPosition, AdSlotStatus } from "@prisma/client";

export interface AdTargetingContext {
  position: AdPlacementPosition;
  device?: "DESKTOP" | "MOBILE" | "ALL";
  category?: string;
  teamSlug?: string;
  competitionCode?: string;
}

export interface AdCreativeOutput {
  slotKey: string;
  title: string;
  position: AdPlacementPosition;
  providerName: string;
  targetUrl?: string;
  imageUrl?: string;
  sponsorBadgeText?: string;
  aspectRatio?: string;
  isSandboxed: boolean;
}

export interface AdEventPayload {
  adPlacementId: string;
  eventType: "IMPRESSION" | "CLICK";
  sessionFingerprint?: string;
  userAgent?: string;
}
