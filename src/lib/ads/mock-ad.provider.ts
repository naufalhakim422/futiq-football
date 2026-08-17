import { AdProviderAdapter } from "./ad-provider.interface";
import { AdCreativeOutput, AdTargetingContext } from "./types";

export class MockAdProvider implements AdProviderAdapter {
  public readonly providerName = "mock-ad-provider";
  public readonly status = "MOCK" as const;

  public async getCreative(
    context: AdTargetingContext,
    slotKey: string
  ): Promise<AdCreativeOutput | null> {
    return {
      slotKey,
      title: "Official Matchday Experience 2026",
      position: context.position,
      providerName: this.providerName,
      targetUrl: "https://example.com/matchday-sponsor",
      imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
      sponsorBadgeText: "Promoted Partner",
      aspectRatio: "16:9",
      isSandboxed: true,
    };
  }
}
