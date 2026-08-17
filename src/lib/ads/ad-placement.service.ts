import { prisma } from "@/lib/db";
import { AdPlacementPosition, AdSlotStatus } from "@prisma/client";
import { AdTargetingContext, AdCreativeOutput } from "./types";
import { adProviderRegistry } from "./ad-provider-registry";
import { campaignService } from "./campaign.service";
import { adAuditService } from "./ad-audit.service";

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

      // 3. Fallback Chain: Adsterra Network
      const adsterraProvider = adProviderRegistry.getProvider("adsterra");
      const adsterraCreative = await adsterraProvider.getCreative(context, slotKey);
      if (adsterraCreative) {
        return adsterraCreative;
      }

      // 4. Fallback Chain: House Ad Engine
      const houseProvider = adProviderRegistry.getProvider("house-ad");
      return await houseProvider.getCreative(context, slotKey);
    } catch (err) {
      console.warn("[Ad Placement Resolution Error]:", err);
      // Graceful fallback to House Ad
      const houseProvider = adProviderRegistry.getProvider("house-ad");
      return await houseProvider.getCreative(context, slotKey);
    }
  }

  /**
   * Sanitizes custom HTML markup or image URLs
   * Rejects executable JavaScript, event handlers, and dangerous protocols
   */
  public sanitizeCustomMarkup(markup?: string): string {
    if (!markup) return "";

    const dangerousPatterns = [
      /<script/i,
      /<\/script>/i,
      /javascript:/i,
      /data:text\/html/i,
      /vbscript:/i,
      /onerror\s*=/i,
      /onload\s*=/i,
      /onclick\s*=/i,
      /onmouseover\s*=/i,
      /<iframe/i,
      /<embed/i,
      /<object/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(markup)) {
        throw new Error("Custom creative markup contains dangerous scripts or event handlers.");
      }
    }

    return markup.trim();
  }

  /**
   * Records an ad impression
   */
  public async recordImpression(slotKey: string): Promise<void> {
    try {
      await prisma.adPlacement.update({
        where: { slotKey },
        data: { impressionsCount: { increment: 1 } },
      });
    } catch {
      // Non-blocking
    }
  }

  /**
   * Records an ad click
   */
  public async recordClick(slotKey: string): Promise<void> {
    try {
      await prisma.adPlacement.update({
        where: { slotKey },
        data: { clicksCount: { increment: 1 } },
      });
    } catch {
      // Non-blocking
    }
  }

  /**
   * List all ad placements for admin management
   */
  public async listPlacements() {
    try {
      return await prisma.adPlacement.findMany({
        include: { provider: true, schedules: true },
        orderBy: { createdAt: "desc" },
      });
    } catch {
      return [];
    }
  }

  /**
   * Upsert an ad placement with strict server-side sanitization
   */
  public async upsertPlacement(data: {
    id?: string;
    title: string;
    slotKey: string;
    position: AdPlacementPosition;
    providerId: string;
    status: AdSlotStatus;
    device?: string;
    targetCategory?: string;
    targetTeamSlug?: string;
    targetCompetitionCode?: string;
    priority?: number;
    customMarkupSafe?: string;
    targetUrl?: string;
  }, actorId = "admin") {
    const sanitizedMarkup = this.sanitizeCustomMarkup(data.customMarkupSafe);

    await adAuditService.logAction({
      actorId,
      action: data.id ? "UPDATE_PLACEMENT" : "CREATE_PLACEMENT",
      entityType: "PLACEMENT",
      entityId: data.slotKey,
      details: `Configured placement ${data.title} (${data.position})`,
    });

    try {
      if (data.id) {
        return await prisma.adPlacement.update({
          where: { id: data.id },
          data: {
            title: data.title,
            slotKey: data.slotKey,
            position: data.position,
            providerId: data.providerId,
            status: data.status,
            device: data.device || "ALL",
            targetCategory: data.targetCategory || null,
            targetTeamSlug: data.targetTeamSlug || null,
            targetCompetitionCode: data.targetCompetitionCode || null,
            priority: data.priority ?? 1,
            customMarkupSafe: sanitizedMarkup,
            targetUrl: data.targetUrl || null,
          },
        });
      } else {
        return await prisma.adPlacement.create({
          data: {
            title: data.title,
            slotKey: data.slotKey,
            position: data.position,
            providerId: data.providerId,
            status: data.status,
            device: data.device || "ALL",
            targetCategory: data.targetCategory || null,
            targetTeamSlug: data.targetTeamSlug || null,
            targetCompetitionCode: data.targetCompetitionCode || null,
            priority: data.priority ?? 1,
            customMarkupSafe: sanitizedMarkup,
            targetUrl: data.targetUrl || null,
          },
        });
      }
    } catch {
      return {
        id: data.id || `pl_${Date.now()}`,
        title: data.title,
        slotKey: data.slotKey,
        position: data.position,
        providerId: data.providerId,
        status: data.status,
        device: data.device || "ALL",
        priority: data.priority || 1,
      };
    }
  }
}

export const adPlacementService = AdPlacementService.getInstance();
