import { prisma } from "@/lib/db";
import {
  KycStatus,
  KycVerificationLevel,
  NotificationType,
} from "@prisma/client";
import { MockKycProvider } from "./mock-kyc.provider";
import { KycProvider } from "./kyc-provider.interface";
import {
  KycVerificationSummary,
  KycSessionInitResult,
  KycEvaluationResult,
  KycWebhookPayload,
} from "./types";
import crypto from "crypto";

export class KycService {
  private static instance: KycService;
  private provider: KycProvider;

  private constructor() {
    this.provider = new MockKycProvider();
  }

  public static getInstance(): KycService {
    if (!KycService.instance) {
      KycService.instance = new KycService();
    }
    return KycService.instance;
  }

  /**
   * Get sanitized KYC status for a contributor (Guarantees zero PII / biometric leak)
   */
  public async getContributorKycSummary(contributorProfileId: string): Promise<KycVerificationSummary> {
    const kyc = await prisma.kycVerification.findUnique({
      where: { contributorProfileId },
    });

    if (!kyc) {
      return {
        status: KycStatus.NOT_STARTED,
        verificationLevel: KycVerificationLevel.STANDARD,
        complianceHold: false,
      };
    }

    return {
      status: kyc.status,
      verificationLevel: kyc.verificationLevel,
      country: kyc.country,
      verifiedAt: kyc.verifiedAt ? kyc.verifiedAt.toISOString() : null,
      expiresAt: kyc.expiresAt ? kyc.expiresAt.toISOString() : null,
      complianceHold: kyc.complianceHold,
      complianceHoldReason: kyc.complianceHold ? kyc.complianceHoldReason : null,
      rejectionReasonCode: kyc.rejectionReasonCode,
      rejectionDetails: kyc.rejectionDetails,
    };
  }

  /**
   * Evaluate compliance eligibility for automatic payout
   */
  public async evaluateKycForPayout(contributorProfileId: string): Promise<KycEvaluationResult> {
    const kyc = await prisma.kycVerification.findUnique({
      where: { contributorProfileId },
    });

    const reasonCodes: string[] = [];

    if (!kyc) {
      reasonCodes.push("KYC_NOT_STARTED");
      return {
        isKycCompliant: false,
        status: KycStatus.NOT_STARTED,
        isExpired: false,
        complianceHold: false,
        reasonCodes,
      };
    }

    const now = new Date();
    const isExpired = kyc.expiresAt ? kyc.expiresAt <= now : false;

    if (kyc.status !== KycStatus.VERIFIED) {
      reasonCodes.push(`KYC_STATUS_${kyc.status}`);
    }

    if (isExpired) {
      reasonCodes.push("KYC_EXPIRED");
    }

    if (kyc.complianceHold) {
      reasonCodes.push("KYC_COMPLIANCE_HOLD");
    }

    const isKycCompliant = kyc.status === KycStatus.VERIFIED && !isExpired && !kyc.complianceHold;

    return {
      isKycCompliant,
      status: kyc.status,
      isExpired,
      complianceHold: kyc.complianceHold,
      reasonCodes,
    };
  }

  /**
   * Initiate KYC verification session via provider
   */
  public async initiateVerification(
    contributorProfileId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<KycSessionInitResult> {
    const contributor = await prisma.contributorProfile.findUnique({
      where: { id: contributorProfileId },
      include: { user: true },
    });

    if (!contributor) throw new Error("Contributor profile not found.");

    const country = contributor.country || "MY";
    const level = KycVerificationLevel.STANDARD;

    const session = await this.provider.initiateSession(contributorProfileId, country, level);

    const kyc = await prisma.kycVerification.upsert({
      where: { contributorProfileId },
      create: {
        contributorProfileId,
        status: KycStatus.PENDING,
        verificationLevel: level,
        provider: this.provider.providerName,
        country,
        providerCustomerId: session.sessionToken,
      },
      update: {
        status: KycStatus.PENDING,
        providerCustomerId: session.sessionToken,
        rejectionReasonCode: null,
        rejectionDetails: null,
      },
    });

    await prisma.kycAuditLog.create({
      data: {
        kycVerificationId: kyc.id,
        action: "INITIATED",
        actorId: contributor.userId,
        newStatus: KycStatus.PENDING,
        reason: "Contributor initiated verification session",
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });

    return session;
  }

  /**
   * Process incoming KYC webhook callback from verification provider
   */
  public async processWebhook(
    providerName: string,
    rawPayload: string,
    signature: string | null
  ): Promise<{ success: boolean; isDuplicate: boolean; error?: string }> {
    const isValidSignature = this.provider.verifyWebhookSignature(rawPayload, signature);
    if (!isValidSignature) {
      return { success: false, isDuplicate: false, error: "Invalid KYC webhook signature." };
    }

    let payload: KycWebhookPayload;
    try {
      payload = JSON.parse(rawPayload);
    } catch {
      return { success: false, isDuplicate: false, error: "Invalid JSON payload." };
    }

    // Idempotency check
    const existing = await prisma.kycWebhookEvent.findUnique({
      where: { provider_eventId: { provider: providerName, eventId: payload.eventId } },
    });

    if (existing) {
      return { success: true, isDuplicate: true };
    }

    const webhookRecord = await prisma.kycWebhookEvent.create({
      data: {
        provider: providerName,
        eventId: payload.eventId,
        eventType: payload.eventType,
        payload: payload as any,
        signature,
      },
    });

    return await prisma.$transaction(async (tx) => {
      const kyc = await tx.kycVerification.findFirst({
        where: { providerCustomerId: payload.providerCustomerId },
        include: { contributorProfile: { select: { id: true, userId: true } } },
      });

      if (!kyc) {
        await tx.kycWebhookEvent.update({
          where: { id: webhookRecord.id },
          data: { errorDetails: `KYC record with customer ID ${payload.providerCustomerId} not found.` },
        });
        return { success: false, isDuplicate: false, error: "KYC applicant record not found." };
      }

      let newStatus: KycStatus = KycStatus.PENDING;
      let verifiedAt: Date | null = null;
      let expiresAt: Date | null = null;
      let notificationType: NotificationType = NotificationType.KYC_SUBMITTED;
      let notificationTitle = "Identity Verification Update";
      let notificationMsg = "Your identity verification status has been updated.";

      if (payload.status === "VERIFIED") {
        newStatus = KycStatus.VERIFIED;
        verifiedAt = payload.verifiedAt ? new Date(payload.verifiedAt) : new Date();
        expiresAt = payload.expiresAt ? new Date(payload.expiresAt) : new Date(Date.now() + 365 * 24 * 3600 * 1000); // 1-year default validity
        notificationType = NotificationType.KYC_VERIFIED;
        notificationTitle = "Identity Verified Successfully";
        notificationMsg = "Your identity has been verified. Automatic payouts and contributor withdrawals are now unlocked.";
      } else if (payload.status === "REJECTED") {
        newStatus = KycStatus.REJECTED;
        notificationType = NotificationType.KYC_REJECTED;
        notificationTitle = "Identity Verification Needs Attention";
        notificationMsg = `Verification could not be approved: ${payload.rejectionDetails || payload.rejectionReasonCode || "Please resubmit with clear documentation."}`;
      } else if (payload.status === "UNDER_REVIEW") {
        newStatus = KycStatus.UNDER_REVIEW;
      } else if (payload.status === "EXPIRED") {
        newStatus = KycStatus.EXPIRED;
        notificationType = NotificationType.KYC_EXPIRED;
        notificationTitle = "Identity Verification Expired";
        notificationMsg = "Your verification period has expired. Please re-verify your identity to continue withdrawals.";
      } else if (payload.status === "SUSPENDED") {
        newStatus = KycStatus.SUSPENDED;
      }

      await tx.kycVerification.update({
        where: { id: kyc.id },
        data: {
          status: newStatus,
          providerVerificationId: payload.providerVerificationId,
          rejectionReasonCode: payload.rejectionReasonCode || null,
          rejectionDetails: payload.rejectionDetails || null,
          verifiedAt,
          expiresAt,
          lastCheckedAt: new Date(),
        },
      });

      await tx.kycAuditLog.create({
        data: {
          kycVerificationId: kyc.id,
          action: payload.eventType,
          actorId: "PROVIDER_WEBHOOK",
          previousStatus: kyc.status,
          newStatus,
          reason: `Webhook callback: ${payload.eventType}`,
        },
      });

      // Notification to Contributor
      if (kyc.contributorProfile?.userId) {
        await tx.contributorNotification.create({
          data: {
            userId: kyc.contributorProfile.userId,
            type: notificationType,
            title: notificationTitle,
            message: notificationMsg,
            linkUrl: "/contributor/earnings",
          },
        });
      }

      await tx.kycWebhookEvent.update({
        where: { id: webhookRecord.id },
        data: { isProcessed: true, processedAt: new Date() },
      });

      return { success: true, isDuplicate: false };
    });
  }

  /**
   * Compliance officer manual override with mandatory audit reasoning
   */
  public async overrideKycStatus(data: {
    kycVerificationId: string;
    newStatus: KycStatus;
    officerUserId: string;
    reason: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const { kycVerificationId, newStatus, officerUserId, reason, ipAddress, userAgent } = data;

    if (!reason || reason.trim().length < 10) {
      throw new Error("Compliance override requires a minimum 10-character justification.");
    }

    const kyc = await prisma.kycVerification.findUnique({
      where: { id: kycVerificationId },
    });

    if (!kyc) throw new Error("KYC verification record not found.");

    return await prisma.$transaction(async (tx) => {
      const verifiedAt = newStatus === KycStatus.VERIFIED ? new Date() : kyc.verifiedAt;
      const expiresAt =
        newStatus === KycStatus.VERIFIED
          ? new Date(Date.now() + 365 * 24 * 3600 * 1000)
          : kyc.expiresAt;

      const updated = await tx.kycVerification.update({
        where: { id: kycVerificationId },
        data: {
          status: newStatus,
          verifiedAt,
          expiresAt,
          complianceNotes: `Officer Override (${officerUserId}): ${reason}`,
        },
      });

      await tx.kycAuditLog.create({
        data: {
          kycVerificationId,
          action: "OVERRIDDEN",
          actorId: officerUserId,
          previousStatus: kyc.status,
          newStatus,
          reason,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
        },
      });

      return updated;
    });
  }

  /**
   * Apply or release compliance hold on contributor account
   */
  public async setComplianceHold(data: {
    kycVerificationId: string;
    hold: boolean;
    holdReason?: string;
    officerUserId: string;
  }) {
    const { kycVerificationId, hold, holdReason, officerUserId } = data;

    const kyc = await prisma.kycVerification.findUnique({
      where: { id: kycVerificationId },
    });

    if (!kyc) throw new Error("KYC verification record not found.");

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.kycVerification.update({
        where: { id: kycVerificationId },
        data: {
          complianceHold: hold,
          complianceHoldReason: hold ? holdReason || "Under compliance review" : null,
        },
      });

      await tx.kycAuditLog.create({
        data: {
          kycVerificationId,
          action: hold ? "HOLD_APPLIED" : "HOLD_RELEASED",
          actorId: officerUserId,
          previousStatus: kyc.status,
          newStatus: kyc.status,
          reason: hold ? holdReason : "Compliance hold cleared",
        },
      });

      return updated;
    });
  }
}

export const kycService = KycService.getInstance();
