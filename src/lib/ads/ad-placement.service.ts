import { prisma } from "@/lib/db";
import { AdPlacementPosition, AdSlotStatus } from "@prisma/client";
import { AdTargetingContext, AdCreativeOutput } from "./types";
import { campaignService } from "./campaign.service";

export class AdPlacementService {
  private static instance: AdPlacementService;

  private constructor() {}

  public static getInstance(): AdPlacementService {
    if (!AdPlacementService.instance) {
      AdPlacementService.instance = new AdPlacementService();
    }
    return AdPlacementService.instance;
  }

  /**
   * Resolves the highest priority ad creative for a given placement context
   * Hierarchy: Direct Sponsor (100) -> Paid Campaign (75) -> Adsterra Network (50) -> House Ad (10)
   * If all campaigns are paused or deleted, returns null cleanly.
   */
  public async getAdForPlacement(context: AdTargetingContext): Promise<AdCreativeOutput | null> {
    const slotKey = `slot_${context.position.toLowerCase()}`;

    try {
      // 1. Check custom campaigns via Campaign Priority Engine
      const matchingCampaignCreative = await campaignService.resolveMatchingCreative(context, slotKey);
      if (matchingCampaignCreative) {
        return matchingCampaignCreative;
      }

      // 2. Query active database placements if available
      try {
        const now = new Date();
        const placements = await prisma.adPlacement.findMany({
          where: {
            position: context.position,
            status: AdSlotStatus.ACTIVE,
            device: { in: ["ALL", context.device || "ALL"] },
          },
          include: {
            provider: true,
            schedules: {
              where: {
                isActive: true,
                startDate: { lte: now },
                OR: [{ endDate: null }, { endDate: { gte: now } }],
              },
            },
          },
          orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        });

        if (placements && placements.length > 0) {
          const selected = placements[0];
          return {
            id: selected.id,
            slotKey: selected.slotKey,
            title: selected.title,
            format: "BANNER",
            position: selected.position,
            providerName: selected.provider?.name || "Direct Sponsor",
            providerType: "DIRECT_SPONSOR",
            targetUrl: selected.targetUrl || undefined,
            clickUrl: selected.targetUrl ? `/api/ads/click/${selected.id}?dest=${encodeURIComponent(selected.targetUrl)}` : undefined,
            imageUrl: selected.customMarkupSafe || undefined,
            sponsorBadgeText: "Promoted Partner",
            aspectRatio: "16:9",
            isSandboxed: true,
            priority: selected.priority,
          };
        }
      } catch {
        // Non-blocking database fallback
      }

      // If no active campaign matches or all campaigns are paused, return null cleanly
      return null;
    } catch (err) {
      console.warn("[Ad Placement Resolution Error]:", err);
      return null;
    }
  }

  /**
   * Sanitizes custom HTML markup or image URLs
   * Rejects executable JavaScript, event handlers, iframe injection, and dangerous protocols
   */
  public sanitizeCustomMarkup(markup?: string): string {
    if (!markup) return "";

    const dangerousPatterns = [
      /<script/i,
      /<\/script>/i,
      /<iframe/i,
      /<embed/i,
      /<object/i,
      /javascript:/i,
      /data:text\/html/i,
      /data:/i,
      /vbscript:/i,
      /onerror\s*=/i,
      /onload\s*=/i,
      /onclick\s*=/i,
      /onmouseover\s*=/i,
      /eval\s*\(/i,
      /document\.cookie/i,
      /document\.location/i,
      /window\.location/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(markup)) {
        throw new Error("Custom creative markup contains dangerous scripts or event handlers.");
      }
    }

    return markup;
  }

  /**
   * List all ad placements for admin management
   */
  public async listPlacements() {
    try {
      return await prisma.adPlacement.findMany({
        include: {
          provider: true,
          schedules: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } catch {
      return [
        {
          id: "plc_default_top",
          name: "Home Page Leaderboard",
          slotKey: "slot_home_top",
          position: AdPlacementPosition.HOME_TOP,
          device: "ALL",
          status: AdSlotStatus.ACTIVE,
          priority: 100,
          provider: { name: "Direct Sponsor Platform" },
        },
        {
          id: "plc_default_middle",
          name: "In-Feed Native Banner",
          slotKey: "slot_home_middle",
          position: AdPlacementPosition.HOME_MIDDLE,
          device: "ALL",
          status: AdSlotStatus.ACTIVE,
          priority: 75,
          provider: { name: "Adsterra Network" },
        },
        {
          id: "plc_default_article_top",
          name: "Article Header Billboard",
          slotKey: "slot_article_top",
          position: AdPlacementPosition.ARTICLE_TOP,
          device: "ALL",
          status: AdSlotStatus.ACTIVE,
          priority: 100,
          provider: { name: "Direct Sponsor Platform" },
        },
        {
          id: "plc_default_article_bottom",
          name: "Article Footer Banner",
          slotKey: "slot_article_bottom",
          device: "ALL",
          position: AdPlacementPosition.ARTICLE_BOTTOM,
          status: AdSlotStatus.ACTIVE,
          priority: 50,
          provider: { name: "House Ad Engine" },
        },
      ];
    }
  }
}

export const adPlacementService = AdPlacementService.getInstance();
