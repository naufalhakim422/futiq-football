import { KycStatus, KycVerificationLevel } from "@prisma/client";

export interface KycVerificationSummary {
  status: KycStatus;
  verificationLevel: KycVerificationLevel;
  country?: string | null;
  verifiedAt?: string | null;
  expiresAt?: string | null;
  complianceHold: boolean;
  complianceHoldReason?: string | null;
  rejectionReasonCode?: string | null;
  rejectionDetails?: string | null;
}

export interface KycSessionInitResult {
  sessionToken: string;
  hostedVerificationUrl: string;
  provider: string;
  expiresAt: string;
}

export interface KycWebhookPayload {
  eventId: string;
  eventType: "KYC_VERIFIED" | "KYC_REJECTED" | "KYC_EXPIRED" | "KYC_REVIEW_REQUIRED" | "KYC_SUSPENDED";
  providerCustomerId: string;
  providerVerificationId: string;
  status: "VERIFIED" | "REJECTED" | "EXPIRED" | "UNDER_REVIEW" | "SUSPENDED";
  country?: string;
  rejectionReasonCode?: string;
  rejectionDetails?: string;
  verifiedAt?: string;
  expiresAt?: string;
  timestamp: string;
}

export interface KycEvaluationResult {
  isKycCompliant: boolean;
  status: KycStatus;
  isExpired: boolean;
  complianceHold: boolean;
  reasonCodes: string[];
}
