import { AdPlacementPosition, AdSlotStatus } from "@prisma/client";

// Supported Advertising Formats
export type AdFormat =
  | "BANNER"
  | "NATIVE"
  | "SOCIAL_BAR"
  | "POPUNDER"
  | "SMARTLINK"
  | "IMAGE_LINK"
  | "TEXT_LINK"
  | "SPONSORED_CARD"
  | "SPONSORED_ARTICLE"
  | "VIDEO"
  | "CUSTOM_SAFE";

// Campaign Types
export type CampaignType = "NETWORK" | "DIRECT_SPONSOR" | "HOUSE_AD";

// Pricing Models
export type PricingModel = "FLAT_RATE" | "CPM" | "CPC" | "CPA" | "FREE" | "CUSTOM";

// Sponsor Status
export type SponsorStatus = "LEAD" | "ACTIVE" | "PAUSED" | "COMPLETED" | "BLOCKED";

// Campaign Status
export type CampaignStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";

// Creative Approval State
export type CreativeApprovalState = "PENDING" | "APPROVED" | "REJECTED";

// Provider Status
export type ProviderStatus = "ACTIVE" | "PAUSED" | "DISABLED" | "MOCK" | "NOT_CONFIGURED";

// Targeting Parameters
export interface AdTargetingContext {
  position: AdPlacementPosition;
  device?: "DESKTOP" | "TABLET" | "MOBILE" | "ALL";
  country?: string;
  pageType?: "HOME" | "ARTICLE" | "NEWS" | "MATCH" | "TEAM" | "PLAYER" | "TRANSFER" | "COMPETITION" | "SEARCH";
  category?: string;
  teamSlug?: string;
  playerSlug?: string;
  competitionCode?: string;
  currentRoute?: string;
  sessionFingerprint?: string;
}

// Creative Output for Public Rendering
export interface AdCreativeOutput {
  id: string;
  slotKey: string;
  title: string;
  description?: string;
  format: AdFormat;
  position: AdPlacementPosition;
  providerName: string;
  providerType: CampaignType;
  sponsorName?: string;
  targetUrl?: string;
  clickUrl?: string;
  imageUrl?: string;
  mobileImageUrl?: string;
  videoUrl?: string;
  ctaText?: string;
  sponsorBadgeText?: string;
  aspectRatio?: string;
  customMarkupSafe?: string;
  isSandboxed: boolean;
  priority: number;
}

// Event Tracking
export interface AdEventPayload {
  adPlacementId: string;
  campaignId?: string;
  creativeId?: string;
  eventType: "IMPRESSION" | "CLICK" | "VIEW";
  sessionFingerprint?: string;
  userAgent?: string;
  ipAddress?: string;
  device?: string;
  country?: string;
  route?: string;
}

// Sponsor Record
export interface AdSponsorRecord {
  id: string;
  companyName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  logoUrl?: string;
  billingEmail?: string;
  notes?: string;
  status: SponsorStatus;
  createdAt: string;
  updatedAt: string;
}

// Campaign Record
export interface AdCampaignRecord {
  id: string;
  campaignName: string;
  sponsorId?: string;
  sponsorName?: string;
  providerId: string;
  providerName: string;
  type: CampaignType;
  objective?: string;
  pricingModel: PricingModel;
  agreedPriceMinor: number;
  currency: string;
  startAt: string;
  endAt?: string;
  status: CampaignStatus;
  priority: number;
  frequencyCap?: number;
  impressionCap?: number;
  clickCap?: number;
  impressionsDelivered: number;
  clicksDelivered: number;
  targetDevice: string;
  targetCountry?: string;
  targetCategory?: string;
  targetCompetition?: string;
  targetTeam?: string;
  notes?: string;
  creatives?: AdCreativeRecord[];
  createdAt: string;
  updatedAt: string;
}

// Creative Record
export interface AdCreativeRecord {
  id: string;
  campaignId: string;
  name: string;
  format: AdFormat;
  title: string;
  description?: string;
  imageUrl?: string;
  mobileImageUrl?: string;
  videoUrl?: string;
  targetUrl: string;
  ctaText?: string;
  customMarkupSafe?: string;
  dimensions?: string;
  aspectRatio?: string;
  status: "ACTIVE" | "PAUSED" | "ARCHIVED";
  approvalState: CreativeApprovalState;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Popunder Policy
export interface PopunderPolicy {
  id: string;
  enabled: boolean;
  desktopEnabled: boolean;
  mobileEnabled: boolean;
  frequencyCapMinutes: number; // e.g. 30 minutes
  cooldownSeconds: number; // e.g. 1800
  maxPerSession: number; // e.g. 1
  maxPerDay: number; // e.g. 2
  allowedRoutes: string[];
  excludedRoutes: string[];
  targetUrl?: string;
  campaignId?: string;
  providerName: string;
  startAt?: string;
  endAt?: string;
  updatedAt: string;
}

// Ad Audit Log
export interface AdAuditLogEntry {
  id: string;
  actorId: string;
  actorEmail?: string;
  action: string;
  entityType: "CAMPAIGN" | "CREATIVE" | "PROVIDER" | "SPONSOR" | "PLACEMENT" | "POLICY";
  entityId: string;
  details: string;
  ipHash?: string;
  userAgent?: string;
  createdAt: string;
}
