import { AdProviderAdapter, AdProviderConfig } from "./ad-provider.interface";
import { AdCreativeOutput, AdTargetingContext, AdFormat, ProviderStatus, CampaignType } from "./types";

export class HouseAdProvider implements AdProviderAdapter {
  public readonly providerName = "FUTIQ House Engine";
  public readonly providerType: CampaignType = "HOUSE_AD";
  public readonly status: ProviderStatus = "ACTIVE";
  public readonly supportedFormats: AdFormat[] = [
    "BANNER",
    "NATIVE",
    "SPONSORED_CARD",
    "TEXT_LINK",
    "SMARTLINK",
    "IMAGE_LINK",
  ];

  public getProviderConfig(): AdProviderConfig {
    return {
      providerName: this.providerName,
      providerType: this.providerType,
      adapterKey: "house-ad",
      status: this.status,
      supportedFormats: this.supportedFormats,
      isTestMode: false,
      credentialsConfigured: true,
      metadata: {
        description: "Internal promotion engine for contributor acquisition, app downloads, and newsletter signups",
      },
    };
  }

  public supportsFormat(format: AdFormat): boolean {
    return this.supportedFormats.includes(format);
  }

  public validateCreative(data: {
    format: AdFormat;
    targetUrl?: string;
  }): { valid: boolean; error?: string } {
    return { valid: true };
  }

  public async getCreative(
    context: AdTargetingContext,
    slotKey: string
  ): Promise<AdCreativeOutput | null> {
    return {
      id: `house_ad_${slotKey}`,
      slotKey,
      title: "Write for FUTIQ FOOTBALL — Earn Transparent Revenue Rewards",
      description: "Join our accredited newsroom. Publish deep tactical breakdowns, match analysis, and exclusive transfer journalism.",
      format: "BANNER",
      position: context.position,
      providerName: this.providerName,
      providerType: this.providerType,
      sponsorName: "FUTIQ Editorial Platform",
      targetUrl: "/contributor/apply",
      clickUrl: "/contributor/apply",
      imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
      ctaText: "Apply as Writer",
      sponsorBadgeText: "FUTIQ Spotlight",
      aspectRatio: "16:9",
      isSandboxed: true,
      priority: 10,
    };
  }
}
