import { KycProvider } from "./kyc-provider.interface";
import { KycSessionInitResult } from "./types";
import { KycVerificationLevel } from "@prisma/client";
import crypto from "crypto";

export class MockKycProvider implements KycProvider {
  public readonly providerName = "mock-kyc-provider";
  public readonly status = "MOCK" as const;
  private readonly webhookSecret: string;

  constructor() {
    this.webhookSecret = process.env.KYC_WEBHOOK_SECRET || "mock-kyc-secret-key-123456";
  }

  public async initiateSession(
    contributorProfileId: string,
    country: string,
    level: KycVerificationLevel
  ): Promise<KycSessionInitResult> {
    const sessionToken = `kyc_sess_${crypto.randomBytes(12).toString("hex")}`;
    const expiresAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString();

    return {
      sessionToken,
      hostedVerificationUrl: `https://verification.mock-compliance.example/session/${sessionToken}?country=${country}&level=${level}&ref=${contributorProfileId}`,
      provider: this.providerName,
      expiresAt,
    };
  }

  public verifyWebhookSignature(rawPayload: string, signature: string | null): boolean {
    if (!signature) return false;
    if (signature === "mock-test-signature") return true;

    try {
      const computed = crypto
        .createHmac("sha256", this.webhookSecret)
        .update(rawPayload)
        .digest("hex");

      return crypto.timingSafeEqual(
        Buffer.from(computed, "utf8"),
        Buffer.from(signature, "utf8")
      );
    } catch {
      return false;
    }
  }
}
