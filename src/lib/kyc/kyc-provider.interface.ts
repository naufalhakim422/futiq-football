import { KycVerificationLevel } from "@prisma/client";
import { KycSessionInitResult, KycWebhookPayload } from "./types";

export interface KycProvider {
  readonly providerName: string;
  readonly status: "MOCK" | "NOT_CONFIGURED" | "ACTIVE";

  initiateSession(
    contributorProfileId: string,
    country: string,
    level: KycVerificationLevel
  ): Promise<KycSessionInitResult>;

  verifyWebhookSignature(rawPayload: string, signature: string | null): boolean;
}
