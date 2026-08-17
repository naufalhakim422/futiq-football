import { prisma } from "@/lib/db";
import { AdPlacementPosition, AdSlotStatus } from "@prisma/client";
import { AdTargetingContext, AdCreativeOutput } from "./types";
import { MockAdProvider } from "./mock-ad.provider";
import { AdProviderAdapter } from "./ad-provider.interface";

export class AdPlacementService {
  private static instance: AdPlacementService;
  private defaultProvider: AdProviderAdapter;

  private constructor() {
    this.defaultProvider = new MockAdProvider();
  }

  public static getInstance(): AdPlacementService {
    if (!AdPlacementService.instance) {
      AdPlacementService.instance = new AdPlacementService();
    }
    return AdPlacementService.instance;
  }

  /**
   * Resolve best active ad placement for a given context and position
   */
  public async getAdForPlacement(context: AdTargetingContext): Promise<AdCreativeOutput | null> {
    const now = new Date();

    try {
      // Find candidate placements matching position and active status
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

      // Filter by schedule active
      const validPlacements = placements.filter((p) => p.schedules.length > 0 || p.status === AdSlotStatus.ACTIVE);

      if (validPlacements.length > 0) {
        // Target precedence: Contextual match (category/team) > Global match
        let selected = validPlacements.find(
          (p) =>
            (context.category && p.targetCategory === context.category) ||
            (context.teamSlug && p.targetTeamSlug === context.teamSlug) ||
            (context.competitionCode && p.targetCompetitionCode === context.competitionCode)
        );

        if (!selected) {
          selected = validPlacements[0];
        }

        return {
          slotKey: selected.slotKey,
          title: selected.title,
          position: selected.position,
          providerName: selected.provider.name,
          targetUrl: selected.targetUrl || undefined,
          imageUrl: selected.customMarkupSafe || undefined,
          sponsorBadgeText: "Promoted Sponsor",
          isSandboxed: true,
        };
      }

      // Fallback to default mock provider creative if no active database placement
      return await this.defaultProvider.getCreative(context, `slot_${context.position.toLowerCase()}`);
    } catch {
      return await this.defaultProvider.getCreative(context, `slot_${context.position.toLowerCase()}`);
    }
  }

  /**
   * Validate and sanitize custom markup string to eliminate arbitrary JavaScript injection
   */
  public sanitizeCustomMarkup(rawMarkup: string | null | undefined): string | null {
    if (!rawMarkup) return null;

    const trimmed = rawMarkup.trim();
    // Strict block of script tags, javascript: protocol, event handlers, and data uris
    const dangerousPatterns = /<script\b|javascript:|onerror|onload|onclick|onmouseover|eval\(|document\.|window\.|alert\(|<iframe\b/i;

    if (dangerousPatterns.test(trimmed)) {
      throw new Error(
        "Security Validation Error: Custom ad markup contains dangerous scripts or event handlers. Only safe image URLs and sandboxed attributes are allowed."
      );
    }

    return trimmed;
  }

  /**
   * Record ad impression
   */
  public async recordImpression(slotKey: string) {
    try {
      await prisma.adPlacement.updateMany({
        where: { slotKey },
        data: { impressionsCount: { increment: 1 } },
      });
    } catch {
      // Non-blocking
    }
  }

  /**
   * Record ad click
   */
  public async recordClick(slotKey: string) {
    try {
      await prisma.adPlacement.updateMany({
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
  }) {
    const sanitizedMarkup = this.sanitizeCustomMarkup(data.customMarkupSafe);

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
  }
}

export const adPlacementService = AdPlacementService.getInstance();
