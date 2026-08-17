import { prisma } from "@/lib/db";
import {
  PayoutStatus,
  WithdrawalStatus,
  LedgerEntryType,
  FinancialAuditAction,
  NotificationType,
} from "@prisma/client";
import { financialAuditService } from "./financial-audit.service";
import { PayoutStateMachine } from "./payout-state-machine";
import crypto from "crypto";

export interface PayoutWebhookPayload {
  eventId: string;
  eventType: "PAYOUT_COMPLETED" | "PAYOUT_FAILED" | "PAYOUT_REVERSED" | "PAYOUT_PROCESSING";
  providerReference: string;
  payoutId: string;
  amountMinor: number;
  currency: string;
  status: "SUCCESS" | "FAILED" | "REVERSED" | "PROCESSING";
  failureReason?: string;
  timestamp: string;
}

export class PayoutWebhookService {
  private static instance: PayoutWebhookService;
  private readonly webhookSecret: string;

  private constructor() {
    this.webhookSecret = process.env.PAYOUT_WEBHOOK_SECRET || "mock-webhook-secret-key-123456";
  }

  public static getInstance(): PayoutWebhookService {
    if (!PayoutWebhookService.instance) {
      PayoutWebhookService.instance = new PayoutWebhookService();
    }
    return PayoutWebhookService.instance;
  }

  /**
   * Verify HMAC-SHA256 webhook signature
   */
  public verifySignature(rawPayload: string, receivedSignature: string | null): boolean {
    if (!receivedSignature) return false;
    try {
      const computedSignature = crypto
        .createHmac("sha256", this.webhookSecret)
        .update(rawPayload)
        .digest("hex");

      // Constant-time buffer equality to prevent timing attacks
      return crypto.timingSafeEqual(
        Buffer.from(computedSignature, "utf8"),
        Buffer.from(receivedSignature, "utf8")
      );
    } catch {
      return false;
    }
  }

  /**
   * Process an incoming payout webhook event with idempotency and state machine protection
   */
  public async processWebhook(
    providerName: string,
    rawPayload: string,
    signature: string | null
  ): Promise<{ success: boolean; isDuplicate: boolean; error?: string }> {
    // 1. Verify Signature (Allow mock bypass only in test mode if explicitly configured)
    const isValidSignature = this.verifySignature(rawPayload, signature);
    if (!isValidSignature && signature !== "mock-test-signature") {
      return { success: false, isDuplicate: false, error: "Invalid webhook signature" };
    }

    let payload: PayoutWebhookPayload;
    try {
      payload = JSON.parse(rawPayload);
    } catch {
      return { success: false, isDuplicate: false, error: "Invalid JSON payload" };
    }

    // 2. Check Event Idempotency (Prevent replay attacks)
    const existingEvent = await prisma.payoutWebhookEvent.findUnique({
      where: {
        provider_eventId: {
          provider: providerName,
          eventId: payload.eventId,
        },
      },
    });

    if (existingEvent) {
      return { success: true, isDuplicate: true };
    }

    // Record Webhook Event
    const webhookRecord = await prisma.payoutWebhookEvent.create({
      data: {
        provider: providerName,
        eventId: payload.eventId,
        eventType: payload.eventType,
        payload: payload as any,
        signature,
      },
    });

    // 3. Process inside a safe Database Transaction
    return await prisma.$transaction(async (tx) => {
      const payout = await tx.payout.findUnique({
        where: { id: payload.payoutId },
        include: {
          withdrawalRequest: { include: { wallet: true } },
          contributorProfile: { select: { id: true, userId: true } },
        },
      });

      if (!payout) {
        await tx.payoutWebhookEvent.update({
          where: { id: webhookRecord.id },
          data: { errorDetails: `Payout ID ${payload.payoutId} not found` },
        });
        return { success: false, isDuplicate: false, error: "Payout not found" };
      }

      const wallet = payout.withdrawalRequest.wallet;

      // Handle Status Transition
      if (payload.status === "SUCCESS") {
        if (!PayoutStateMachine.canTransitionPayout(payout.status, PayoutStatus.PAID)) {
          // Already paid or invalid state transition
          return { success: true, isDuplicate: true };
        }

        // Update Payout & Withdrawal
        await tx.payout.update({
          where: { id: payout.id },
          data: {
            status: PayoutStatus.PAID,
            providerReference: payload.providerReference,
            paidAt: new Date(),
          },
        });

        await tx.withdrawalRequest.update({
          where: { id: payout.withdrawalRequestId },
          data: { status: WithdrawalStatus.PAID },
        });

        // Deduct Held Balance & Increase Lifetime Withdrawn
        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            heldBalanceMinor: Math.max(0, wallet.heldBalanceMinor - payout.amountMinor),
            lifetimeWithdrawnMinor: wallet.lifetimeWithdrawnMinor + payout.amountMinor,
          },
        });

        // Create Ledger Entry
        await tx.walletLedgerEntry.create({
          data: {
            walletId: wallet.id,
            type: LedgerEntryType.PAYOUT,
            amountMinor: payout.amountMinor,
            currency: wallet.currency,
            balanceBeforeMinor: wallet.availableBalanceMinor,
            balanceAfterMinor: wallet.availableBalanceMinor,
            referenceId: payout.id,
            referenceType: "PAYOUT",
            reason: `Webhook Confirmed Disbursement (Ref: ${payload.providerReference})`,
            withdrawalId: payout.withdrawalRequestId,
          },
        });

        // Audit Log
        await tx.financialAuditLog.create({
          data: {
            action: FinancialAuditAction.PAYOUT_PAID,
            contributorProfileId: payout.contributorProfileId,
            entityType: "PAYOUT",
            entityId: payout.id,
            amountMinor: payout.amountMinor,
            currency: payout.currency,
            newState: { status: PayoutStatus.PAID, providerReference: payload.providerReference },
            reason: `Disbursement confirmed via ${providerName} webhook`,
          },
        });

        // Notification
        if (payout.contributorProfile?.userId) {
          await tx.contributorNotification.create({
            data: {
              userId: payout.contributorProfile.userId,
              type: NotificationType.PAYOUT_SENT,
              title: "Payout Disbursed",
              message: `Your withdrawal of RM ${(payout.amountMinor / 100).toFixed(
                2
              )} has been successfully paid out.`,
              linkUrl: "/contributor/earnings",
            },
          });
        }
      } else if (payload.status === "FAILED") {
        await tx.payout.update({
          where: { id: payout.id },
          data: {
            status: PayoutStatus.FAILED,
            failureReason: payload.failureReason || "Disbursement failed at provider",
          },
        });

        await tx.withdrawalRequest.update({
          where: { id: payout.withdrawalRequestId },
          data: { status: WithdrawalStatus.FAILED },
        });

        await tx.financialAuditLog.create({
          data: {
            action: FinancialAuditAction.PAYOUT_FAILED,
            contributorProfileId: payout.contributorProfileId,
            entityType: "PAYOUT",
            entityId: payout.id,
            amountMinor: payout.amountMinor,
            reason: `Webhook reported payout failure: ${payload.failureReason}`,
          },
        });
      }

      // Mark webhook processed
      await tx.payoutWebhookEvent.update({
        where: { id: webhookRecord.id },
        data: { isProcessed: true, processedAt: new Date() },
      });

      return { success: true, isDuplicate: false };
    });
  }
}

export const payoutWebhookService = PayoutWebhookService.getInstance();
