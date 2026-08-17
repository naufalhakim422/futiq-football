import { RevenueStatus } from "@prisma/client";

export const AnalyticsEventType = {
  PAGE_VIEW: "PAGE_VIEW",
  ARTICLE_VIEW: "ARTICLE_VIEW",
  ARTICLE_READ: "ARTICLE_READ",
  SCROLL_DEPTH: "SCROLL_DEPTH",
  SESSION_START: "SESSION_START",
  AD_IMPRESSION: "AD_IMPRESSION",
  AD_CLICK: "AD_CLICK",
} as const;

export type AnalyticsEventType = (typeof AnalyticsEventType)[keyof typeof AnalyticsEventType];

export interface AnalyticsEventInput {
  eventType: AnalyticsEventType;
  pageUrl?: string;
  articleId?: string;
  adPlacementId?: string;
  sessionFingerprint?: string;
  scrollDepthPercent?: number;
  readTimeSeconds?: number;
  userAgent?: string;
  ipAddress?: string;
}

export interface DailyRevenueMetrics {
  date: string;
  pageViews: number;
  articleReads: number;
  adImpressions: number;
  adClicks: number;
  ctrPercent: number;
  rpmMinor: number; // Revenue per thousand impressions in cents
  estimatedRevenueMinor: number;
  revenueStatus: RevenueStatus;
}
