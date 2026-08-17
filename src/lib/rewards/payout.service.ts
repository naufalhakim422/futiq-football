import { prisma } from "@/lib/db";
import {
  Currency,
  WithdrawalStatus,
  PayoutStatus,
  PayoutAttemptStatus,
  LedgerEntryType,
  FinancialAuditAction,
  NotificationType,
} from "@prisma/client";
import { PayoutProviderResponse, PayoutRecipientDetails } from "./types";
import { financialAuditService } from "./financial-audit.service";
import { walletService } from "./wallet.service";

export interface PayoutProvider {
  readonly providerName: string;
  readonly status: "MOCK" | "NOT_CONFIGURED" | "ACTIVE";
  createPayout(
    payoutId: string,
    amountMinor: number,
    currency: Currency,
    recipient: PayoutRecipientDetails
  ): Promise<PayoutProviderResponse>;
}

export class MockPayoutProvider implements PayoutProvider {
  public readonly providerName = "mock-payout-provider";
  public readonly status = "MOCK" as const;

  public async createPayout(
    payoutId: string,
    amountMinor: number,
    currency: Currency,
    recipient: PayoutRecipientDetails
  ): Promise<PayoutProviderResponse> {
    // In test / simulation environment, mock provider succeeds
    return {
      success: true,
      providerReference: `MOCK_TX_${Date.now()}_${payoutId.slice(0, 8)}`,
      status: PayoutAttemptStatus.SUCCESS,
    };
  }
}

export class PayoutService {
  private static instance: PayoutService;
  private payoutProvider: PayoutProvider;

  private constructor() {
    this.payoutProvider = new MockPayoutProvider();
  }

  public static getInstance(): PayoutService {
    if (!PayoutService.instance) {
      PayoutService.instance = new PayoutService();
    }
    return PayoutService.instance;
  }

  public setPayoutProvider(provider: PayoutProvider) {
    this.payoutProvider = provider;
  }

  /**
   * Finance officer approves a withdrawal request and provisions a Payout entity
   */
  public async approveWithdrawal(data: {
    withdrawalId: string;
    financeUserId: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const { withdrawalId, financeUserId, ipAddress, userAgent } = data;

    return await prisma.$transaction(async (tx) => {
      const withdrawal = await tx.withdrawalRequest.findUnique({
        where: { id: withdrawalId },
        include: {
          contributorProfile: { select: { id: true, userId: true } },
        },
      });

      if (!withdrawal) throw new Error("Withdrawal request not found.");

      // Separation of Duties: The requester cannot approve their own withdrawal
      if (withdrawal.contributorProfile.userId === financeUserId) {
        throw new Error("Separation of duties violation: You cannot approve your own withdrawal request.");
      }

      if (withdrawal.status !== WithdrawalStatus.PENDING_REVIEW) {
        throw new Error(
          `Cannot approve withdrawal in "${withdrawal.status}" state. Expected "PENDING_REVIEW".`
        );
      }

      // Update Withdrawal Status
      const updatedWithdrawal = await tx.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: {
          status: WithdrawalStatus.APPROVED,
          reviewedByUserId: financeUserId,
          reviewedAt: new Date(),
        },
      });

      // Create Payout Record
      const payout = await tx.payout.create({
        data: {
          withdrawalRequestId: withdrawal.id,
          contributorProfileId: withdrawal.contributorProfileId,
          amountMinor: withdrawal.amountMinor,
          currency: withdrawal.currency,
          status: PayoutStatus.APPROVED,
          provider: this.payoutProvider.providerName,
          approvedByUserId: financeUserId,
        },
      });

      // Audit Log
      await tx.financialAuditLog.create({
        data: {
          action: FinancialAuditAction.WITHDRAWAL_APPROVED,
          actorId: financeUserId,
          contributorProfileId: withdrawal.contributorProfileId,
          entityType: "WITHDRAWAL",
          entityId: withdrawal.id,
          amountMinor: withdrawal.amountMinor,
          currency: withdrawal.currency,
          previousState: { status: WithdrawalStatus.PENDING_REVIEW },
          newState: { status: WithdrawalStatus.APPROVED, payoutId: payout.id },
          reason: "Finance officer approved withdrawal request",
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
        },
      });

      // Send Notification
      await tx.contributorNotification.create({
        data: {
          userId: withdrawal.contributorProfile.userId,
          type: NotificationType.WITHDRAWAL_APPROVED,
          title: "Withdrawal Approved",
          message: `Your withdrawal for RM ${(withdrawal.amountMinor / 100).toFixed(
            2
          )} has been approved and queued for payout processing.`,
          linkUrl: "/contributor/earnings",
        },
      });

      return { withdrawal: updatedWithdrawal, payout };
    });
  }

  /**
   * Finance officer rejects a withdrawal request and immediately releases funds back to available balance
   */
  public async rejectWithdrawal(data: {
    withdrawalId: string;
    financeUserId: string;
    reason: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const { withdrawalId, financeUserId, reason, ipAddress, userAgent } = data;

    if (!reason || reason.trim().length < 5) {
      throw new Error("Mandatory rejection reason required (minimum 5 characters).");
    }

    return await prisma.$transaction(async (tx) => {
      const withdrawal = await tx.withdrawalRequest.findUnique({
        where: { id: withdrawalId },
        include: {
          wallet: true,
          contributorProfile: { select: { id: true, userId: true } },
        },
      });

      if (!withdrawal) throw new Error("Withdrawal request not found.");

      if (
        withdrawal.status !== WithdrawalStatus.PENDING_REVIEW &&
        withdrawal.status !== WithdrawalStatus.APPROVED
      ) {
        throw new Error(`Cannot reject withdrawal in "${withdrawal.status}" state.`);
      }

      const wallet = withdrawal.wallet;
      const amount = withdrawal.amountMinor;

      const balanceBefore = wallet.availableBalanceMinor;
      const balanceAfter = balanceBefore + amount;

      // 1. Update Withdrawal Request
      const updatedWithdrawal = await tx.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: {
          status: WithdrawalStatus.REJECTED,
          rejectionReason: reason.trim(),
          reviewedByUserId: financeUserId,
          reviewedAt: new Date(),
        },
      });

      // 2. Create Ledger Entry (WITHDRAWAL_RELEASE)
      await tx.walletLedgerEntry.create({
        data: {
          walletId: wallet.id,
          type: LedgerEntryType.WITHDRAWAL_RELEASE,
          amountMinor: amount,
          currency: wallet.currency,
          balanceBeforeMinor: balanceBefore,
          balanceAfterMinor: balanceAfter,
          referenceId: withdrawal.id,
          referenceType: "WITHDRAWAL",
          reason: `Withdrawal Rejected (${reason.trim()}) — Funds Released`,
          actorId: financeUserId,
          withdrawalId: withdrawal.id,
        },
      });

      // 3. Update Wallet Balance (move from held back to available)
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalanceMinor: balanceAfter,
          heldBalanceMinor: Math.max(0, wallet.heldBalanceMinor - amount),
        },
      });

      // 4. If a Payout record was already created, update its status
      await tx.payout.updateMany({
        where: { withdrawalRequestId: withdrawal.id },
        data: { status: PayoutStatus.REJECTED, failureReason: reason.trim() },
      });

      // 5. Audit Log
      await tx.financialAuditLog.create({
        data: {
          action: FinancialAuditAction.WITHDRAWAL_REJECTED,
          actorId: financeUserId,
          contributorProfileId: withdrawal.contributorProfileId,
          entityType: "WITHDRAWAL",
          entityId: withdrawal.id,
          amountMinor: amount,
          currency: wallet.currency,
          previousState: { status: withdrawal.status },
          newState: { status: WithdrawalStatus.REJECTED, reason: reason.trim() },
          reason: `Withdrawal Rejected: ${reason.trim()}`,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
        },
      });

      // 6. Notification
      await tx.contributorNotification.create({
        data: {
          userId: withdrawal.contributorProfile.userId,
          type: NotificationType.WITHDRAWAL_REJECTED,
          title: "Withdrawal Request Rejected",
          message: `Your withdrawal request for RM ${(amount / 100).toFixed(
            2
          )} was rejected: "${reason.trim()}". Funds have been released back to your available balance.`,
          linkUrl: "/contributor/earnings",
        },
      });

      return { withdrawal: updatedWithdrawal };
    });
  }

  /**
   * Process payout execution through the provider interface
   */
  public async processPayout(data: {
    payoutId: string;
    financeUserId: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const { payoutId, financeUserId, ipAddress, userAgent } = data;

    const payout = await prisma.payout.findUnique({
      where: { id: payoutId },
      include: {
        withdrawalRequest: { include: { wallet: true } },
        contributorProfile: { select: { id: true, userId: true } },
      },
    });

    if (!payout) throw new Error("Payout record not found.");

    if (payout.status !== PayoutStatus.APPROVED && payout.status !== PayoutStatus.FAILED) {
      throw new Error(`Cannot process payout in "${payout.status}" state. Expected "APPROVED".`);
    }

    // Set to PROCESSING
    await prisma.payout.update({
      where: { id: payoutId },
      data: { status: PayoutStatus.PROCESSING, processedByUserId: financeUserId },
    });

    await prisma.withdrawalRequest.update({
      where: { id: payout.withdrawalRequestId },
      data: { status: WithdrawalStatus.PROCESSING },
    });

    const recipientDetails: PayoutRecipientDetails = {
      bankName: payout.withdrawalRequest.bankName,
      accountNumberMasked: payout.withdrawalRequest.accountNumberMasked,
      accountHolderName: payout.withdrawalRequest.accountHolderName,
    };

    // Record Payout Attempt
    const attemptCount = await prisma.payoutAttempt.count({ where: { payoutId } });
    const attempt = await prisma.payoutAttempt.create({
      data: {
        payoutId: payout.id,
        attemptNumber: attemptCount + 1,
        provider: this.payoutProvider.providerName,
        amountMinor: payout.amountMinor,
        currency: payout.currency,
        status: PayoutAttemptStatus.PROCESSING,
      },
    });

    try {
      const response = await this.payoutProvider.createPayout(
        payout.id,
        payout.amountMinor,
        payout.currency,
        recipientDetails
      );

      if (response.success) {
        // Payout Successful: Finalize in Transaction
        return await prisma.$transaction(async (tx) => {
          const wallet = payout.withdrawalRequest.wallet;

          // 1. Update Attempt
          await tx.payoutAttempt.update({
            where: { id: attempt.id },
            data: {
              status: PayoutAttemptStatus.SUCCESS,
              providerReference: response.providerReference || null,
              completedAt: new Date(),
            },
          });

          // 2. Update Payout
          const finalPayout = await tx.payout.update({
            where: { id: payout.id },
            data: {
              status: PayoutStatus.PAID,
              providerReference: response.providerReference || null,
              paidAt: new Date(),
            },
          });

          // 3. Update Withdrawal
          await tx.withdrawalRequest.update({
            where: { id: payout.withdrawalRequestId },
            data: { status: WithdrawalStatus.PAID },
          });

          // 4. Create Ledger Entry (PAYOUT)
          await tx.walletLedgerEntry.create({
            data: {
              walletId: wallet.id,
              type: LedgerEntryType.PAYOUT,
              amountMinor: payout.amountMinor,
              currency: wallet.currency,
              balanceBeforeMinor: wallet.availableBalanceMinor,
              balanceAfterMinor: wallet.availableBalanceMinor,
              referenceId: finalPayout.id,
              referenceType: "PAYOUT",
              reason: `Disbursed via ${this.payoutProvider.providerName} (Ref: ${
                response.providerReference || "N/A"
              })`,
              actorId: financeUserId,
              withdrawalId: payout.withdrawalRequestId,
            },
          });

          // 5. Update Wallet Held Balance & Lifetime Withdrawn
          await tx.wallet.update({
            where: { id: wallet.id },
            data: {
              heldBalanceMinor: Math.max(0, wallet.heldBalanceMinor - payout.amountMinor),
              lifetimeWithdrawnMinor: wallet.lifetimeWithdrawnMinor + payout.amountMinor,
            },
          });

          // 6. Audit Log
          await tx.financialAuditLog.create({
            data: {
              action: FinancialAuditAction.PAYOUT_PAID,
              actorId: financeUserId,
              contributorProfileId: payout.contributorProfileId,
              entityType: "PAYOUT",
              entityId: finalPayout.id,
              amountMinor: payout.amountMinor,
              currency: payout.currency,
              newState: { status: PayoutStatus.PAID, providerRef: response.providerReference },
              reason: "Payout disbursement confirmed",
              ipAddress: ipAddress || null,
              userAgent: userAgent || null,
            },
          });

          // 7. Notification
          await tx.contributorNotification.create({
            data: {
              userId: payout.contributorProfile.userId,
              type: NotificationType.PAYOUT_SENT,
              title: "Payout Disbursed",
              message: `Your payout of RM ${(payout.amountMinor / 100).toFixed(
                2
              )} has been disbursed to ${recipientDetails.bankName} (${recipientDetails.accountNumberMasked}).`,
              linkUrl: "/contributor/earnings",
            },
          });

          return { payout: finalPayout, success: true };
        });
      } else {
        // Provider Returned Failure
        await prisma.payoutAttempt.update({
          where: { id: attempt.id },
          data: {
            status: PayoutAttemptStatus.FAILED,
            errorCode: response.errorCode || "PROVIDER_ERROR",
            errorMessage: response.errorMessage || "Disbursement failed at provider",
            completedAt: new Date(),
          },
        });

        const failedPayout = await prisma.payout.update({
          where: { id: payout.id },
          data: {
            status: PayoutStatus.FAILED,
            failureReason: response.errorMessage || "Provider error",
          },
        });

        await financialAuditService.logEvent({
          action: FinancialAuditAction.PAYOUT_FAILED,
          actorId: financeUserId,
          contributorProfileId: payout.contributorProfileId,
          entityType: "PAYOUT",
          entityId: payout.id,
          amountMinor: payout.amountMinor,
          reason: `Payout failed: ${response.errorMessage || "Provider error"}`,
          ipAddress,
          userAgent,
        });

        return { payout: failedPayout, success: false, error: response.errorMessage };
      }
    } catch (err: any) {
      await prisma.payoutAttempt.update({
        where: { id: attempt.id },
        data: {
          status: PayoutAttemptStatus.FAILED,
          errorCode: "EXCEPTION",
          errorMessage: err?.message || "Unhandled exception during payout processing",
          completedAt: new Date(),
        },
      });

      await prisma.payout.update({
        where: { id: payout.id },
        data: {
          status: PayoutStatus.FAILED,
          failureReason: err?.message || "Execution exception",
        },
      });

      return { payout, success: false, error: err?.message };
    }
  }

  /**
   * List payouts for admin finance review
   */
  public async listPayouts(options?: { status?: PayoutStatus; limit?: number; offset?: number }) {
    const limit = Math.min(options?.limit || 50, 100);
    const offset = options?.offset || 0;
    const where: any = {};
    if (options?.status) where.status = options.status;

    const [total, payouts] = await Promise.all([
      prisma.payout.count({ where }),
      prisma.payout.findMany({
        where,
        include: {
          withdrawalRequest: true,
          contributorProfile: {
            select: { id: true, displayName: true, user: { select: { email: true } } },
          },
          attempts: { orderBy: { attemptNumber: "desc" } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
    ]);

    return { total, payouts, limit, offset };
  }
}

export const payoutService = PayoutService.getInstance();
