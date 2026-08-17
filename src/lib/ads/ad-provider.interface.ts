import { AdCreativeOutput, AdTargetingContext } from "./types";

export interface AdProviderAdapter {
  readonly providerName: string;
  readonly status: "MOCK" | "NOT_CONFIGURED" | "ACTIVE";
  getCreative(context: AdTargetingContext, slotKey: string): Promise<AdCreativeOutput | null>;
}
