import { AdProviderAdapter, AdProviderConfig } from "./ad-provider.interface";
import { AdCreativeOutput, AdTargetingContext, AdFormat, ProviderStatus, CampaignType } from "./types";

export class AdsterraProvider implements AdProviderAdapter {
  public readonly providerName = "Adsterra Network";
  public readonly providerType: CampaignType = "NETWORK";
  public readonly supportedFormats: AdFormat[] = [
    "BANNER",
    "NATIVE",
    "SOCIAL_BAR",
    "POPUNDER",
    "SMARTLINK",
    "IMAGE_LINK",
  ];

  private isConfigured: boolean;
  private apiToken?: string;
  private defaultZoneId?: string;

  constructor() {
    this.apiToken = process.env.ADSTERRA_API_TOKEN;
    this.defaultZoneId = process.env.ADSTERRA_DEFAULT_ZONE_ID;
    this.isConfigured = !!(this.apiToken || this.defaultZoneId);
  }

  public get status(): ProviderStatus {
    return this.isConfigured ? "ACTIVE" : "NOT_CONFIGURED";
  }

  public getProviderConfig(): AdProviderConfig {
    return {
      providerName: this.providerName,
      providerType: this.providerType,
      adapterKey: "adsterra",
      status: this.status,
      supportedFormats: this.supportedFormats,
      isTestMode: !this.isConfigured,
      credentialsConfigured: this.isConfigured,
      metadata: {
        network: "Adsterra Global Ad Network",
        hasZoneId: !!this.defaultZoneId,
        supportedTypes: ["Banner", "Native Banner", "Social Bar", "Popunder", "SmartLink / Direct Link"],
      },
    };
  }

  public supportsFormat(format: AdFormat): boolean {
    return this.supportedFormats.includes(format);
  }

  public validateCreative(data: {
    format: AdFormat;
    targetUrl?: string;
    imageUrl?: string;
  }): { valid: boolean; error?: string } {
    if (!this.supportsFormat(data.format)) {
      return { valid: false, error: `Format ${data.format} is not supported by ${this.providerName}` };
    }

    if (data.targetUrl && !/^https?:\/\//i.test(data.targetUrl)) {
      return { valid: false, error: "Target URL must begin with http:// or https://" };
    }

    return { valid: true };
  }

  public async getCreative(
    context: AdTargetingContext,
    slotKey: string
  ): Promise<AdCreativeOutput | null> {
    const isMobile = context.device === "MOBILE";

    // Standard Adsterra format resolution
    return {
      id: `adsterra_slot_${slotKey}`,
      slotKey,
      title: "Global Sports Merchandise & Gear",
      description: "Official club kits, footwear, and exclusive international tournament memorabilia.",
      format: "BANNER",
      position: context.position,
      providerName: this.providerName,
      providerType: this.providerType,
      targetUrl: "https://example.com/adsterra-partner",
      clickUrl: `/api/ads/click/adsterra_${slotKey}?dest=${encodeURIComponent("https://example.com/adsterra-partner")}`,
      imageUrl: isMobile
        ? "https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=600&q=80"
        : "https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=1200&q=80",
      ctaText: "View Partner Offers",
      sponsorBadgeText: "Adsterra Ad",
      aspectRatio: isMobile ? "6:5" : "16:9",
      isSandboxed: true,
      priority: 50,
    };
  }
}
