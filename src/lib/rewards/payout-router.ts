import { Currency } from "@prisma/client";
import { PayoutProvider, MockPayoutProvider } from "./payout.service";
import { PayoutRecipientDetails, PayoutProviderResponse } from "./types";

export interface PayoutRouteDetails {
  country: string;
  currency: Currency;
  payoutMethod: "BANK" | "EWALLET";
  amountMinor: number;
}

export class PayoutProviderRouter {
  private static instance: PayoutProviderRouter;
  private providers = new Map<string, PayoutProvider>();

  private constructor() {
    // Register Default Mock Payout Provider
    const mock = new MockPayoutProvider();
    this.registerProvider(mock);
  }

  public static getInstance(): PayoutProviderRouter {
    if (!PayoutProviderRouter.instance) {
      PayoutProviderRouter.instance = new PayoutProviderRouter();
    }
    return PayoutProviderRouter.instance;
  }

  public registerProvider(provider: PayoutProvider) {
    this.providers.set(provider.providerName, provider);
  }

  /**
   * Resolve best provider adapter for a payout request
   */
  public resolveProvider(route: PayoutRouteDetails): {
    provider: PayoutProvider;
    routeKey: string;
    capabilities: { supportsCancel: boolean; supportsWebhooks: boolean };
  } {
    const routeKey = `${route.country.toUpperCase()}_${route.currency}_${route.payoutMethod}`;

    // Development & testing fallback: use MockPayoutProvider
    const provider = this.providers.get("mock-payout-provider") || new MockPayoutProvider();

    return {
      provider,
      routeKey,
      capabilities: {
        supportsCancel: false,
        supportsWebhooks: true,
      },
    };
  }

  public getProvider(name: string): PayoutProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      return new MockPayoutProvider();
    }
    return provider;
  }
}

export const payoutRouter = PayoutProviderRouter.getInstance();
