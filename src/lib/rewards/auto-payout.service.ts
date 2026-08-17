import { prisma } from "@/lib/db";
import {
  WithdrawalStatus,
  PayoutStatus,
  PayoutAttemptStatus,
  LedgerEntryType,
  FinancialAuditAction,
  NotificationType,
} from "@prisma/client";
import { payoutEligibilityService } from "./payout-eligibility.service";
import { payoutRouter } from "./payout-router";
import { financialAuditService } from "./financial-audit.service";
import { PayoutRecipientDetails } from "./types";

export class AutoPayoutService {
  private static instance: AutoPayoutService;

  private constructor() {}

  public static getInstance(): AutoPayoutService {
    if (!AutoPayoutService.instance) {
      AutoPayoutService.instance = new AutoPayoutService();
    }
    return AutoPayoutService.instance;
  }

  /**
   * Process withdrawal through the Automatic Payout & Risk Gateway
   */
  public async processAutomaticWithdrawal(withdrawalId: string, ipAddress?: string, userAgent?: string) {
    const withdrawal = await prisma.withdrawalRequest.findUnique({
      where: { id: withdrawalId },
      include: {
        wallet: true,
        contributorProfile: { select: { id: true, userId: true, country: true } },
      },
    });

    if (!withdrawal) throw new Error("Withdrawal request not found.");

    // 1. Evaluate Server-Authoritative Eligibility & Risk
    const evaluation = await payoutEligibilityService.evaluateEligibility(
      withdrawal.contributorProfileId,
      withdrawal.amountMinor,
      withdrawal.currency
    );

    // 2. Case A: Ineligible / Critical Fraud Block
    if (!evaluation.eligible) {
      // Release funds back to available balance
      return await prisma.$transaction(async (tx) => {
        const wallet = withdrawal.wallet;
        const balanceBefore = wallet.availableBalanceMinor;
        const balanceAfter = balanceBefore + withdrawal.amountMinor;

        await tx.withdrawalRequest.update({
          where: { id: withdrawal.id },
          data: {
            status: WithdrawalStatus.REJECTED,
            rejectionReason: `Automated Security Evaluation Block: ${evaluation.reasonCodes.join(", ")}`,
          },
        });

        await tx.walletLedgerEntry.create({
          data: {
            walletId: wallet.id,
            type: LedgerEntryType.WITHDRAWAL_RELEASE,
            amountMinor: withdrawal.amountMinor,
            currency: wallet.currency,
            balanceBeforeMinor: balanceBefore,
            balanceAfterMinor: balanceAfter,
            referenceId: withdrawal.id,
            referenceType: "WITHDRAWAL",
            reason: "Auto-Payout Risk Block — Funds Released",
            withdrawalId: withdrawal.id,
          },
        });

        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            availableBalanceMinor: balanceAfter,
            heldBalanceMinor: Math.max(0, wallet.heldBalanceMinor - withdrawal.amountMinor),
          },
        });

        await tx.financialAuditLog.create({
          data: {
            action: FinancialAuditAction.WITHDRAWAL_REJECTED,
            contributorProfileId: withdrawal.contributorProfileId,
            entityType: "WITHDRAWAL",
            entityId: withdrawal.id,
            amountMinor: withdrawal.amountMinor,
            reason: `Auto-Payout Ineligible Block: ${evaluation.reasonCodes.join(", ")}`,
            ipAddress: ipAddress || null,
            userAgent: userAgent || null,
          },
        });

        return {
          status: WithdrawalStatus.REJECTED,
          isAutoPaid: false,
          requiresManualReview: false,
          evaluation,
        };
      });
    }

    // 3. Case B: Requires Manual Finance Review (Medium risk / above auto limit)
    if (evaluation.requiresManualReview || !evaluation.isAutoPayEligible) {
      await prisma.withdrawalRequest.update({
        where: { id: withdrawal.id },
        data: { status: WithdrawalStatus.MANUAL_REVIEW },
      });

      await financialAuditService.logEvent({
        action: FinancialAuditAction.WITHDRAWAL_REQUESTED,
        contributorProfileId: withdrawal.contributorProfileId,
        entityType: "WITHDRAWAL",
        entityId: withdrawal.id,
        amountMinor: withdrawal.amountMinor,
        reason: `Queued for Manual Finance Review (Risk Score: ${evaluation.riskScore})`,
        ipAddress,
        userAgent,
      });

      return {
        status: WithdrawalStatus.MANUAL_REVIEW,
        isAutoPaid: false,
        requiresManualReview: true,
        evaluation,
      };
    }

    // 4. Case C: Automatic Approval & Instant Payout Dispatch
    return await prisma.$transaction(async (tx) => {
      // Mark AUTO_APPROVED
      await tx.withdrawalRequest.update({
        where: { id: withdrawal.id },
        data: { status: WithdrawalStatus.AUTO_APPROVED },
      });

      // Route Payout
      const route = payoutRouter.resolveProvider({
        country: withdrawal.contributorProfile.country || "MY",
        currency: withdrawal.currency,
        payoutMethod: "BANK",
        amountMinor: withdrawal.amountMinor,
      });

      // Provision Payout Entity
      const payout = await tx.payout.create({
        data: {
          withdrawalRequestId: withdrawal.id,
          contributorProfileId: withdrawal.contributorProfileId,
          amountMinor: withdrawal.amountMinor,
          currency: withdrawal.currency,
          status: PayoutStatus.PROCESSING,
          provider: route.provider.providerName,
        },
      });

      await tx.withdrawalRequest.update({
        where: { id: withdrawal.id },
        data: { status: WithdrawalStatus.PROCESSING },
      });

      // Execute Payout via Provider
      const recipientDetails: PayoutRecipientDetails = {
        bankName: withdrawal.bankName,
        accountNumberMasked: withdrawal.accountNumberMasked,
        accountHolderName: withdrawal.accountHolderName,
      };

      const attempt = await tx.payoutAttempt.create({
        data: {
          payoutId: payout.id,
          attemptNumber: 1,
          provider: route.provider.providerName,
          amountMinor: payout.amountMinor,
          currency: payout.currency,
          status: PayoutAttemptStatus.PROCESSING,
        },
      });

      const providerResponse = await route.provider.createPayout(
        payout.id,
        payout.amountMinor,
        payout.currency,
        recipientDetails
      );

      if (providerResponse.success) {
        // Disburse and discharge held balance
        const wallet = withdrawal.wallet;

        await tx.payoutAttempt.update({
          where: { id: attempt.id },
          data: {
            status: PayoutAttemptStatus.SUCCESS,
            providerReference: providerResponse.providerReference || null,
            completedAt: new Date(),
          },
        });

        await tx.payout.update({
          where: { id: payout.id },
          data: {
            status: PayoutStatus.PAID,
            providerReference: providerResponse.providerReference || null,
            paidAt: new Date(),
          },
        });

        await tx.withdrawalRequest.update({
          where: { id: withdrawal.id },
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
            reason: `Auto-Disbursed via ${route.provider.providerName} (Ref: ${
              providerResponse.providerReference || "N/A"
            })`,
            withdrawalId: withdrawal.id,
          },
        });

        // Audit Log
        await tx.financialAuditLog.create({
          data: {
            action: FinancialAuditAction.AUTO_PAYOUT_TRIGGERED,
            contributorProfileId: withdrawal.contributorProfileId,
            entityType: "PAYOUT",
            entityId: payout.id,
            amountMinor: payout.amountMinor,
            currency: payout.currency,
            newState: { status: PayoutStatus.PAID, providerRef: providerResponse.providerReference },
            reason: "Automatic payout successfully executed and verified",
            ipAddress: ipAddress || null,
            userAgent: userAgent || null,
          },
        });

        // Notification
        if (withdrawal.contributorProfile?.userId) {
          await tx.contributorNotification.create({
            data: {
              userId: withdrawal.contributorProfile.userId,
              type: NotificationType.PAYOUT_SENT,
              title: "Automatic Payout Disbursed",
              message: `Your withdrawal of RM ${(payout.amountMinor / 100).toFixed(
                2
              )} was automatically approved and disbursed to ${withdrawal.bankName}.`,
              linkUrl: "/contributor/earnings",
            },
          });
        }

        return {
          status: WithdrawalStatus.PAID,
          isAutoPaid: true,
          requiresManualReview: false,
          payout,
          evaluation,
        };
      } else {
        // Provider Failed: Mark FAILED and queue for review / retry
        await tx.payoutAttempt.update({
          where: { id: attempt.id },
          data: {
            status: PayoutAttemptStatus.FAILED,
            errorCode: providerResponse.errorCode || "PROVIDER_FAILED",
            errorMessage: providerResponse.errorMessage || "Provider dispatch error",
            completedAt: new Date(),
          },
        });

        await tx.payout.update({
          where: { id: payout.id },
          data: {
            status: PayoutStatus.FAILED,
            failureReason: providerResponse.errorMessage || "Provider error",
          },
        });

        await tx.withdrawalRequest.update({
          where: { id: withdrawal.id },
          data: { status: WithdrawalStatus.FAILED },
        });

        return {
          status: WithdrawalStatus.FAILED,
          isAutoPaid: false,
          requiresManualReview: true,
          error: providerResponse.errorMessage,
          evaluation,
        };
      }
    });
  }

  /**
   * Retry a failed payout attempt
   */
  public async retryFailedPayout(payoutId: string, financeUserId: string) {
    const payout = await prisma.payout.findUnique({
      where: { id: payoutId },
      include: {
        withdrawalRequest: { include: { wallet: true, contributorProfile: true } },
      },
    });

    if (!payout) throw new Error("Payout record not found.");
    if (payout.status !== PayoutStatus.FAILED) {
      throw new Error(`Cannot retry payout in "${payout.status}" state.`);
    }

    return await prisma.$transaction(async (tx) => {
      await tx.withdrawalRequest.update({
        where: { id: payout.withdrawalRequestId },
        data: { status: WithdrawalStatus.RETRY_PENDING },
      });

      await tx.payout.update({
        where: { id: payout.id },
        data: { status: PayoutStatus.PROCESSING },
      });

      const attemptCount = await tx.payoutAttempt.count({ where: { payoutId } });
      const attempt = await tx.payoutAttempt.create({
        data: {
          payoutId: payout.id,
          attemptNumber: attemptCount + 1,
          provider: payout.provider,
          amountMinor: payout.amountMinor,
          currency: payout.currency,
          status: PayoutAttemptStatus.PROCESSING,
        },
      });

      const route = payoutRouter.resolveProvider({
        country: payout.withdrawalRequest.contributorProfile.country || "MY",
        currency: payout.currency,
        payoutMethod: "BANK",
        amountMinor: payout.amountMinor,
      });

      const response = await route.provider.createPayout(
        payout.id,
        payout.amountMinor,
        payout.currency,
        {
          bankName: payout.withdrawalRequest.bankName,
          accountNumberMasked: payout.withdrawalRequest.accountNumberMasked,
          accountHolderName: payout.withdrawalRequest.accountHolderName,
        }
      );

      if (response.success) {
        const wallet = payout.withdrawalRequest.wallet;

        await tx.payoutAttempt.update({
          where: { id: attempt.id },
          data: {
            status: PayoutAttemptStatus.SUCCESS,
            providerReference: response.providerReference || null,
            completedAt: new Date(),
          },
        });

        await tx.payout.update({
          where: { id: payout.id },
          data: {
            status: PayoutStatus.PAID,
            providerReference: response.providerReference || null,
            paidAt: new Date(),
          },
        });

        await tx.withdrawalRequest.update({
          where: { id: payout.withdrawalRequestId },
          data: { status: WithdrawalStatus.PAID },
        });

        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            heldBalanceMinor: Math.max(0, wallet.heldBalanceMinor - payout.amountMinor),
            lifetimeWithdrawnMinor: wallet.lifetimeWithdrawnMinor + payout.amountMinor,
          },
        });

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
            reason: `Disbursed on Retry (Ref: ${response.providerReference})`,
            actorId: financeUserId,
            withdrawalId: payout.withdrawalRequestId,
          },
        });

        await tx.financialAuditLog.create({
          data: {
            action: FinancialAuditAction.PAYOUT_PAID,
            actorId: financeUserId,
            contributorProfileId: payout.contributorProfileId,
            entityType: "PAYOUT",
            entityId: payout.id,
            amountMinor: payout.amountMinor,
            reason: "Manual retry succeeded",
          },
        });

        return { success: true, status: PayoutStatus.PAID };
      } else {
        await tx.payoutAttempt.update({
          where: { id: attempt.id },
          data: {
            status: PayoutAttemptStatus.FAILED,
            errorCode: response.errorCode || "RETRY_FAILED",
            errorMessage: response.errorMessage || "Retry failed at provider",
            completedAt: new Date(),
          },
        });

        await tx.payout.update({
          where: { id: payout.id },
          data: { status: PayoutStatus.FAILED, failureReason: response.errorMessage },
        });

        await tx.withdrawalRequest.update({
          where: { id: payout.withdrawalRequestId },
          data: { status: WithdrawalStatus.FAILED },
        });

        return { success: false, status: PayoutStatus.FAILED, error: response.errorMessage };
      }
    });
  }
}

export const autoPayoutService = AutoPayoutService.getInstance();
