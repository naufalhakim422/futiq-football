import { AdCampaignRecord, AdCreativeRecord, AdTargetingContext, AdCreativeOutput, AdFormat, PricingModel, CampaignType, CampaignStatus } from "./types";
import { adAuditService } from "./ad-audit.service";
import { sponsorService } from "./sponsor.service";

export class CampaignService {
  private static instance: CampaignService;

  private static mockCampaigns: Map<string, AdCampaignRecord> = new Map([
    [
      "camp_nike_01",
      {
        id: "camp_nike_01",
        campaignName: "Nike Football Boots — August Campaign",
        sponsorId: "spon_nike_01",
        sponsorName: "Nike Football Global",
        providerId: "sponsor-direct",
        providerName: "Direct Sponsor Platform",
        type: "DIRECT_SPONSOR",
        objective: "Promote new 2026/27 boot collection across European football and Premier League articles.",
        pricingModel: "FLAT_RATE",
        agreedPriceMinor: 500000, // RM 5,000.00
        currency: "MYR",
        startAt: "2026-08-01T00:00:00Z",
        endAt: "2026-09-30T23:59:59Z",
        status: "ACTIVE",
        priority: 100,
        frequencyCap: 5,
        impressionCap: 250000,
        clickCap: 10000,
        impressionsDelivered: 42150,
        clicksDelivered: 1320,
        targetDevice: "ALL",
        targetCategory: "Tactical Analysis",
        targetCompetition: "Premier League",
        notes: "Primary sponsor banner on Article Header and Matchday Center.",
        creatives: [
          {
            id: "crt_nike_banner_01",
            campaignId: "camp_nike_01",
            name: "Nike Elite Boots Leaderboard (1200x250)",
            format: "BANNER",
            title: "Nike Football Performance Collection 2026",
            description: "Engineered for lethal accuracy and explosive transition speed.",
            imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
            mobileImageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
            targetUrl: "https://example.com/nike-football",
            ctaText: "Shop New Collection",
            dimensions: "1200x250",
            aspectRatio: "16:9",
            status: "ACTIVE",
            approvalState: "APPROVED",
            createdAt: "2026-08-01T00:00:00Z",
            updatedAt: "2026-08-17T00:00:00Z",
          },
        ],
        createdAt: "2026-08-01T00:00:00Z",
        updatedAt: "2026-08-17T00:00:00Z",
      },
    ],
    [
      "camp_adsterra_global",
      {
        id: "camp_adsterra_global",
        campaignName: "Adsterra Network In-Stream Delivery",
        providerId: "adsterra",
        providerName: "Adsterra Network",
        type: "NETWORK",
        objective: "Global remnant and programmatic banner monetization.",
        pricingModel: "CPM",
        agreedPriceMinor: 0,
        currency: "USD",
        startAt: "2026-01-01T00:00:00Z",
        status: "ACTIVE",
        priority: 50,
        impressionsDelivered: 184500,
        clicksDelivered: 3620,
        targetDevice: "ALL",
        creatives: [
          {
            id: "crt_adsterra_banner_01",
            campaignId: "camp_adsterra_global",
            name: "Adsterra Global Sports Merchandise Banner",
            format: "BANNER",
            title: "Global Sports Merchandise & Fan Gear",
            description: "Official football kits, cleats, and authentic accessories.",
            imageUrl: "https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=1200&q=80",
            targetUrl: "https://example.com/adsterra-sports",
            ctaText: "Explore Offers",
            dimensions: "1200x250",
            aspectRatio: "16:9",
            status: "ACTIVE",
            approvalState: "APPROVED",
            createdAt: "2026-01-01T00:00:00Z",
            updatedAt: "2026-08-17T00:00:00Z",
          },
        ],
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-08-17T00:00:00Z",
      },
    ],
    [
      "camp_house_writers",
      {
        id: "camp_house_writers",
        campaignName: "FUTIQ Contributor Acquisition (House)",
        providerId: "house-ad",
        providerName: "FUTIQ House Engine",
        type: "HOUSE_AD",
        objective: "Recruit independent football analysts and tactical journalists.",
        pricingModel: "FREE",
        agreedPriceMinor: 0,
        currency: "MYR",
        startAt: "2026-01-01T00:00:00Z",
        status: "ACTIVE",
        priority: 10,
        impressionsDelivered: 58000,
        clicksDelivered: 2410,
        targetDevice: "ALL",
        creatives: [
          {
            id: "crt_house_writer_01",
            campaignId: "camp_house_writers",
            name: "Write for FUTIQ — Contributor Banner",
            format: "BANNER",
            title: "Write for FUTIQ FOOTBALL — Earn Revenue for Sports Journalism",
            description: "Submit tactical analysis and earn verified engagement rewards.",
            imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
            targetUrl: "/contributor/apply",
            ctaText: "Apply as Writer",
            dimensions: "1200x250",
            aspectRatio: "16:9",
            status: "ACTIVE",
            approvalState: "APPROVED",
            createdAt: "2026-01-01T00:00:00Z",
            updatedAt: "2026-08-17T00:00:00Z",
          },
        ],
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-08-17T00:00:00Z",
      },
    ],
  ]);

  private constructor() {}

  public static getInstance(): CampaignService {
    if (!CampaignService.instance) {
      CampaignService.instance = new CampaignService();
    }
    return CampaignService.instance;
  }

  public async listCampaigns(): Promise<AdCampaignRecord[]> {
    return Array.from(CampaignService.mockCampaigns.values());
  }

  public async getCampaignById(id: string): Promise<AdCampaignRecord | null> {
    return CampaignService.mockCampaigns.get(id) || null;
  }

  public async createCampaign(
    data: {
      campaignName: string;
      sponsorId?: string;
      providerId: string;
      type: CampaignType;
      objective?: string;
      pricingModel?: PricingModel;
      agreedPriceMinor?: number;
      currency?: string;
      startAt: string;
      endAt?: string;
      priority?: number;
      frequencyCap?: number;
      impressionCap?: number;
      clickCap?: number;
      targetDevice?: string;
      targetCountry?: string;
      targetCategory?: string;
      targetCompetition?: string;
      targetTeam?: string;
      notes?: string;
      creatives?: AdCreativeRecord[];
    },
    actorId = "admin"
  ): Promise<AdCampaignRecord> {
    const id = `camp_${Date.now()}`;
    const now = new Date().toISOString();

    let sponsorName: string | undefined;
    if (data.sponsorId) {
      const sponsor = await sponsorService.getSponsorById(data.sponsorId);
      sponsorName = sponsor?.companyName;
    }

    const campaign: AdCampaignRecord = {
      id,
      campaignName: data.campaignName,
      sponsorId: data.sponsorId,
      sponsorName,
      providerId: data.providerId,
      providerName: data.type === "DIRECT_SPONSOR" ? "Direct Sponsor Platform" : data.providerId,
      type: data.type,
      objective: data.objective,
      pricingModel: data.pricingModel || "FLAT_RATE",
      agreedPriceMinor: data.agreedPriceMinor || 0,
      currency: data.currency || "MYR",
      startAt: data.startAt,
      endAt: data.endAt,
      status: "ACTIVE",
      priority: data.priority ?? (data.type === "DIRECT_SPONSOR" ? 100 : data.type === "NETWORK" ? 50 : 10),
      frequencyCap: data.frequencyCap,
      impressionCap: data.impressionCap,
      clickCap: data.clickCap,
      impressionsDelivered: 0,
      clicksDelivered: 0,
      targetDevice: data.targetDevice || "ALL",
      targetCountry: data.targetCountry,
      targetCategory: data.targetCategory,
      targetCompetition: data.targetCompetition,
      targetTeam: data.targetTeam,
      notes: data.notes,
      creatives: data.creatives || [],
      createdAt: now,
      updatedAt: now,
    };

    CampaignService.mockCampaigns.set(id, campaign);

    await adAuditService.logAction({
      actorId,
      action: "CREATE_CAMPAIGN",
      entityType: "CAMPAIGN",
      entityId: id,
      details: `Created campaign ${campaign.campaignName} (Priority: ${campaign.priority}, Type: ${campaign.type})`,
    });

    return campaign;
  }

  public async updateCampaign(
    id: string,
    data: Partial<AdCampaignRecord>,
    actorId = "admin"
  ): Promise<AdCampaignRecord | null> {
    const existing = CampaignService.mockCampaigns.get(id);
    if (!existing) return null;

    const updated: AdCampaignRecord = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    CampaignService.mockCampaigns.set(id, updated);

    await adAuditService.logAction({
      actorId,
      action: "UPDATE_CAMPAIGN",
      entityType: "CAMPAIGN",
      entityId: id,
      details: `Updated campaign ${updated.campaignName} (Status: ${updated.status})`,
    });

    return updated;
  }

  public async deleteCampaign(id: string, actorId = "admin"): Promise<boolean> {
    const exists = CampaignService.mockCampaigns.has(id);
    if (!exists) return false;

    CampaignService.mockCampaigns.delete(id);

    await adAuditService.logAction({
      actorId,
      action: "DELETE_CAMPAIGN",
      entityType: "CAMPAIGN",
      entityId: id,
      details: `Deleted campaign ID ${id}`,
    });

    return true;
  }

  /**
   * Resolves the best matching campaign & creative for a given targeting context with priority order
   */
  public async resolveMatchingCreative(
    context: AdTargetingContext,
    slotKey: string
  ): Promise<AdCreativeOutput | null> {
    const now = new Date();
    const campaigns = Array.from(CampaignService.mockCampaigns.values());

    // 1. Filter campaigns that are ACTIVE and currently in flight
    const eligibleCampaigns = campaigns.filter((camp) => {
      if (camp.status !== "ACTIVE") return false;

      // Start date check
      if (new Date(camp.startAt) > now) return false;

      // End date check
      if (camp.endAt && new Date(camp.endAt) < now) return false;

      // Impression cap check
      if (camp.impressionCap && camp.impressionsDelivered >= camp.impressionCap) return false;

      // Click cap check
      if (camp.clickCap && camp.clicksDelivered >= camp.clickCap) return false;

      // Device targeting
      if (
        camp.targetDevice &&
        camp.targetDevice !== "ALL" &&
        context.device &&
        context.device !== "ALL" &&
        camp.targetDevice !== context.device
      ) {
        return false;
      }

      // Country targeting
      if (
        camp.targetCountry &&
        context.country &&
        camp.targetCountry !== "ALL" &&
        camp.targetCountry.toUpperCase() !== context.country.toUpperCase()
      ) {
        return false;
      }

      return true;
    });

    // 2. Sort by Priority (Descending) + Context Specificity Bonus
    eligibleCampaigns.sort((a, b) => {
      let scoreA = a.priority;
      let scoreB = b.priority;

      // Contextual match bonus (Competition / Team / Category)
      if (context.competitionCode && a.targetCompetition === context.competitionCode) scoreA += 25;
      if (context.competitionCode && b.targetCompetition === context.competitionCode) scoreB += 25;

      if (context.teamSlug && a.targetTeam === context.teamSlug) scoreA += 30;
      if (context.teamSlug && b.targetTeam === context.teamSlug) scoreB += 30;

      if (context.category && a.targetCategory === context.category) scoreA += 15;
      if (context.category && b.targetCategory === context.category) scoreB += 15;

      return scoreB - scoreA;
    });

    if (eligibleCampaigns.length === 0) {
      return null;
    }

    // 3. Select winning campaign & return its active creative
    for (const campaign of eligibleCampaigns) {
      const activeCreative = (campaign.creatives || []).find(
        (c) => c.status === "ACTIVE" && c.approvalState === "APPROVED"
      );

      if (activeCreative) {
        return {
          id: activeCreative.id,
          slotKey,
          title: activeCreative.title,
          description: activeCreative.description,
          format: activeCreative.format,
          position: context.position,
          providerName: campaign.providerName,
          providerType: campaign.type,
          sponsorName: campaign.sponsorName,
          targetUrl: activeCreative.targetUrl,
          clickUrl: `/api/ads/click/${activeCreative.id}?dest=${encodeURIComponent(activeCreative.targetUrl)}`,
          imageUrl:
            context.device === "MOBILE" && activeCreative.mobileImageUrl
              ? activeCreative.mobileImageUrl
              : activeCreative.imageUrl,
          mobileImageUrl: activeCreative.mobileImageUrl,
          videoUrl: activeCreative.videoUrl,
          ctaText: activeCreative.ctaText || "Learn More",
          sponsorBadgeText: campaign.type === "DIRECT_SPONSOR" ? "Official Sponsor" : campaign.type === "HOUSE_AD" ? "FUTIQ Spotlight" : "Promoted Partner",
          aspectRatio: activeCreative.aspectRatio || "16:9",
          customMarkupSafe: activeCreative.customMarkupSafe,
          isSandboxed: true,
          priority: campaign.priority,
        };
      }
    }

    return null;
  }
}

export const campaignService = CampaignService.getInstance();
