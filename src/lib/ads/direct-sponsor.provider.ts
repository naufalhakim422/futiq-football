import { AdProviderAdapter, AdProviderConfig } from "./ad-provider.interface";
import { AdCreativeOutput, AdTargetingContext, AdFormat, ProviderStatus, CampaignType } from "./types";

export class DirectSponsorProvider implements AdProviderAdapter {
  public readonly providerName = "Direct Sponsor Platform";
  public readonly providerType: CampaignType = "DIRECT_SPONSOR";
  public readonly status: ProviderStatus = "ACTIVE";
  public readonly supportedFormats: AdFormat[] = [
    "BANNER",
    "IMAGE_LINK",
    "NATIVE",
    "TEXT_LINK",
    "SPONSORED_CARD",
    "SPONSORED_ARTICLE",
    "VIDEO",
    "CUSTOM_SAFE",
  ];

  public getProviderConfig(): AdProviderConfig {
    return {
      providerName: this.providerName,
      providerType: this.providerType,
      adapterKey: "sponsor-direct",
      status: this.status,
      supportedFormats: this.supportedFormats,
      isTestMode: false,
      credentialsConfigured: true,
      metadata: {
        description: "Direct advertising and sponsor contract management engine with fixed-price deal support",
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
    customMarkupSafe?: string;
  }): { valid: boolean; error?: string } {
    if (!this.supportsFormat(data.format)) {
      return { valid: false, error: `Format ${data.format} is not supported for Direct Sponsors.` };
    }

    if (data.targetUrl && !/^https?:\/\//i.test(data.targetUrl)) {
      return { valid: false, error: "Target URL must begin with http:// or https://" };
    }

    if (data.customMarkupSafe) {
      if (/<script|onerror|onload|javascript:|data:/i.test(data.customMarkupSafe)) {
        return { valid: false, error: "Custom creative markup contains dangerous scripts or event handlers." };
      }
    }

    return { valid: true };
  }

  public async getCreative(
    context: AdTargetingContext,
    slotKey: string
  ): Promise<AdCreativeOutput | null> {
    return {
      id: `sponsor_direct_${slotKey}`,
      slotKey,
      title: "Nike Football Performance Collection — Season 2026/27",
      description: "Precision touch, lightweight agility, and elite engineering designed for Champions League nights.",
      format: "BANNER",
      position: context.position,
      providerName: this.providerName,
      providerType: this.providerType,
      sponsorName: "Nike Football",
      targetUrl: "https://example.com/nike-football",
      clickUrl: `/api/ads/click/sponsor_direct_${slotKey}?dest=${encodeURIComponent("https://example.com/nike-football")}`,
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
      mobileImageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
      ctaText: "Shop Collection",
      sponsorBadgeText: "Official Sponsor",
      aspectRatio: "16:9",
      isSandboxed: true,
      priority: 100,
    };
  }
}
