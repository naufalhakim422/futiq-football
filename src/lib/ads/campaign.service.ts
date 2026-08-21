import fs from "fs";
import path from "path";
import { AdCampaignRecord, AdCreativeRecord, AdTargetingContext, AdCreativeOutput, AdFormat, PricingModel, CampaignType, CampaignStatus } from "./types";
import { adAuditService } from "./ad-audit.service";
import { sponsorService } from "./sponsor.service";

const CAMPAIGNS_FILE_PATH = path.join(process.cwd(), "src", "data", "ads-campaigns.json");

function loadCampaignsFromDisk(): Map<string, AdCampaignRecord> {
  try {
    if (fs.existsSync(CAMPAIGNS_FILE_PATH)) {
      const data = fs.readFileSync(CAMPAIGNS_FILE_PATH, "utf-8");
      const list = JSON.parse(data);
      if (Array.isArray(list)) {
        const map = new Map<string, AdCampaignRecord>();
        list.forEach((c: AdCampaignRecord) => map.set(c.id, c));
        return map;
      }
    }
  } catch (err) {
    console.warn("[CampaignService] Error reading ads-campaigns.json:", err);
  }
  return new Map<string, AdCampaignRecord>();
}

function saveCampaignsToDisk(map: Map<string, AdCampaignRecord>) {
  try {
    const list = Array.from(map.values());
    const dir = path.dirname(CAMPAIGNS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CAMPAIGNS_FILE_PATH, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.warn("[CampaignService] Error saving ads-campaigns.json:", err);
  }
}

export class CampaignService {
  private static instance: CampaignService;
  private static mockCampaigns: Map<string, AdCampaignRecord> = loadCampaignsFromDisk();

  private constructor() {}

  public static getInstance(): CampaignService {
    if (!CampaignService.instance) {
      CampaignService.instance = new CampaignService();
    }
    return CampaignService.instance;
  }

  public async listCampaigns(): Promise<AdCampaignRecord[]> {
    CampaignService.mockCampaigns = loadCampaignsFromDisk();
    return Array.from(CampaignService.mockCampaigns.values());
  }

  public async getCampaignById(id: string): Promise<AdCampaignRecord | null> {
    CampaignService.mockCampaigns = loadCampaignsFromDisk();
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
    saveCampaignsToDisk(CampaignService.mockCampaigns);

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
    saveCampaignsToDisk(CampaignService.mockCampaigns);

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
    saveCampaignsToDisk(CampaignService.mockCampaigns);

    await adAuditService.logAction({
      actorId,
      action: "DELETE_CAMPAIGN",
      entityType: "CAMPAIGN",
      entityId: id,
      details: `Deleted campaign ID ${id}`,
    });

    return true;
  }

  public async recordImpression(creativeIdOrSlotKey: string): Promise<void> {
    Array.from(CampaignService.mockCampaigns.values()).forEach((camp: AdCampaignRecord) => {
      const hasCreative = camp.creatives?.some((c) => c.id === creativeIdOrSlotKey || c.campaignId === camp.id);
      if (hasCreative || camp.id === creativeIdOrSlotKey) {
        camp.impressionsDelivered = (camp.impressionsDelivered || 0) + 1;
      }
    });
    saveCampaignsToDisk(CampaignService.mockCampaigns);
  }

  public async recordClick(creativeIdOrSlotKey: string): Promise<void> {
    Array.from(CampaignService.mockCampaigns.values()).forEach((camp: AdCampaignRecord) => {
      const hasCreative = camp.creatives?.some((c) => c.id === creativeIdOrSlotKey || c.campaignId === camp.id);
      if (hasCreative || camp.id === creativeIdOrSlotKey) {
        camp.clicksDelivered = (camp.clicksDelivered || 0) + 1;
      }
    });
    saveCampaignsToDisk(CampaignService.mockCampaigns);
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
