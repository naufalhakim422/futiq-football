import { AdCreativeOutput, AdTargetingContext, AdFormat, AdEventPayload, ProviderStatus, CampaignType } from "./types";

export interface AdProviderConfig {
  providerName: string;
  providerType: CampaignType;
  adapterKey: string;
  status: ProviderStatus;
  supportedFormats: AdFormat[];
  isTestMode: boolean;
  credentialsConfigured: boolean;
  metadata?: Record<string, any>;
}

export interface AdProviderAdapter {
  readonly providerName: string;
  readonly providerType: CampaignType;
  readonly status: ProviderStatus;
  readonly supportedFormats: AdFormat[];

  getProviderConfig(): AdProviderConfig;
  supportsFormat(format: AdFormat): boolean;
  validateCreative(data: {
    format: AdFormat;
    targetUrl?: string;
    imageUrl?: string;
    customMarkupSafe?: string;
  }): { valid: boolean; error?: string };
  getCreative(context: AdTargetingContext, slotKey: string): Promise<AdCreativeOutput | null>;
  trackImpression?(event: AdEventPayload): Promise<void>;
  trackClick?(event: AdEventPayload): Promise<void>;
}
