import { AdProviderAdapter } from "./ad-provider.interface";
import { MockAdProvider } from "./mock-ad.provider";
import { AdsterraProvider } from "./adsterra.provider";
import { DirectSponsorProvider } from "./direct-sponsor.provider";
import { HouseAdProvider } from "./house-ad.provider";

export class AdProviderRegistry {
  private static instance: AdProviderRegistry;
  private providers: Map<string, AdProviderAdapter> = new Map();

  private constructor() {
    this.registerProvider("mock-ad-provider", new MockAdProvider());
    this.registerProvider("adsterra", new AdsterraProvider());
    this.registerProvider("sponsor-direct", new DirectSponsorProvider());
    this.registerProvider("house-ad", new HouseAdProvider());
  }

  public static getInstance(): AdProviderRegistry {
    if (!AdProviderRegistry.instance) {
      AdProviderRegistry.instance = new AdProviderRegistry();
    }
    return AdProviderRegistry.instance;
  }

  public registerProvider(key: string, provider: AdProviderAdapter): void {
    this.providers.set(key.toLowerCase(), provider);
  }

  public getProvider(key: string): AdProviderAdapter {
    const normalizedKey = key.toLowerCase();
    const provider = this.providers.get(normalizedKey);
    if (provider) return provider;

    // Fallback to Mock Provider if key is not found
    return this.providers.get("mock-ad-provider") || new MockAdProvider();
  }

  public listProviders(): AdProviderAdapter[] {
    return Array.from(this.providers.values());
  }
}

export const adProviderRegistry = AdProviderRegistry.getInstance();
