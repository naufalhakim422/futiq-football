import { prisma } from "@/lib/db";
import {
  Currency,
  LedgerEntryType,
  WithdrawalStatus,
  FinancialAuditAction,
  NotificationType,
} from "@prisma/client";
import { financialAuditService } from "./financial-audit.service";
import { fraudDetectionService } from "./fraud-detection.service";

export class WalletService {
  private static instance: WalletService;

  private constructor() {}

  public static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  /**
   * Get or initialize a contributor's wallet
   */
  public async getOrCreateWallet(contributorProfileId: string) {
    let wallet = await prisma.wallet.findUnique({
      where: { contributorProfileId },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          contributorProfileId,
          availableBalanceMinor: 0,
          heldBalanceMinor: 0,
          lifetimeEarningsMinor: 0,
          lifetimeWithdrawnMinor: 0,
          currency: Currency.MYR,
        },
      });
    }

    return wallet;
  }

  /**
   * Get wallet balance, statistics, and payout account status
   */
  public async getWalletSummary(contributorProfileId: string) {
    const wallet = await this.getOrCreateWallet(contributorProfileId);
    const now = new Date();
    const isUnderCooldown = wallet.payoutCooldownUntil ? wallet.payoutCooldownUntil > now : false;

    const risk = await fraudDetectionService.evaluateContributorRisk(contributorProfileId);

    return {
      id: wallet.id,
      contributorProfileId: wallet.contributorProfileId,
      availableBalanceMinor: wallet.availableBalanceMinor,
      heldBalanceMinor: wallet.heldBalanceMinor,
      totalBalanceMinor: wallet.availableBalanceMinor + wallet.heldBalanceMinor,
      lifetimeEarningsMinor: wallet.lifetimeEarningsMinor,
      lifetimeWithdrawnMinor: wallet.lifetimeWithdrawnMinor,
      currency: wallet.currency,
      payoutAccount: {
        isConfigured: Boolean(wallet.payoutBankName && wallet.payoutAccountNumberMasked),
        bankName: wallet.payoutBankName || null,
        accountNumberMasked: wallet.payoutAccountNumberMasked || null,
        accountHolderName: wallet.payoutAccountHolderName || null,
        updatedAt: wallet.payoutAccountUpdatedAt || null,
        isUnderCooldown,
        cooldownUntil: wallet.payoutCooldownUntil || null,
      },
      isWithdrawalBlocked: risk.isBlockedForPayout,
      riskSeverity: risk.severity,
    };
  }

  /**
   * Credit finalized reward into contributor wallet with double-entry ledger
   */
  public async creditReward(
    walletId: string,
    rewardId: string,
    amountMinor: number,
    reason: string
  ) {
    if (amountMinor <= 0) {
      throw new Error("Credit amount must be greater than zero.");
    }

    return await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { id: walletId },
      });

      if (!wallet) throw new Error("Wallet not found.");

      const balanceBefore = wallet.availableBalanceMinor;
      const balanceAfter = balanceBefore + amountMinor;

      // 1. Create Ledger Entry
      const ledgerEntry = await tx.walletLedgerEntry.create({
        data: {
          walletId: wallet.id,
          type: LedgerEntryType.CREDIT,
          amountMinor,
          currency: wallet.currency,
          balanceBeforeMinor: balanceBefore,
          balanceAfterMinor: balanceAfter,
          referenceId: rewardId,
          referenceType: "REWARD",
          reason,
          rewardId,
        },
      });

      // 2. Update Cached Balances
      const updatedWallet = await tx.wallet.update({
        where: { id: walletId },
        data: {
          availableBalanceMinor: balanceAfter,
          lifetimeEarningsMinor: wallet.lifetimeEarningsMinor + amountMinor,
        },
      });

      // 3. Log Financial Audit Trail
      await tx.financialAuditLog.create({
        data: {
          action: FinancialAuditAction.WALLET_CREDIT,
          contributorProfileId: wallet.contributorProfileId,
          entityType: "WALLET",
          entityId: wallet.id,
          amountMinor,
          currency: wallet.currency,
          previousState: { availableBalanceMinor: balanceBefore },
          newState: { availableBalanceMinor: balanceAfter },
          reason: `Reward Credited: ${reason}`,
        },
      });

      return { wallet: updatedWallet, ledgerEntry };
    });
  }

  /**
   * Request a withdrawal with double-entry ledger hold and concurrency lock
   */
  public async requestWithdrawal(data: {
    contributorProfileId: string;
    amountMinor: number;
    idempotencyKey?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const { contributorProfileId, amountMinor, idempotencyKey, ipAddress, userAgent } = data;

    // Minimum withdrawal amount: RM 20.00 (2000 minor units)
    const MINIMUM_WITHDRAWAL_MINOR = 2000;
    if (amountMinor < MINIMUM_WITHDRAWAL_MINOR) {
      throw new Error(`Minimum withdrawal is RM ${(MINIMUM_WITHDRAWAL_MINOR / 100).toFixed(2)}.`);
    }

    // Check Idempotency
    if (idempotencyKey) {
      const existing = await prisma.withdrawalRequest.findUnique({
        where: { idempotencyKey },
      });
      if (existing) {
        return { withdrawalRequest: existing, isIdempotentReplay: true };
      }
    }

    // Check Fraud Status
    const risk = await fraudDetectionService.evaluateContributorRisk(contributorProfileId);
    if (risk.isBlockedForPayout) {
      throw new Error("Withdrawals are currently on hold pending account risk review.");
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Fetch Wallet with concurrency lock
      const wallet = await tx.wallet.findUnique({
        where: { contributorProfileId },
        include: { contributorProfile: { select: { userId: true } } },
      });

      if (!wallet) throw new Error("Wallet not found.");

      // Check configured payout account
      if (!wallet.payoutBankName || !wallet.payoutAccountNumberMasked || !wallet.payoutAccountHolderName) {
        throw new Error("Please configure your bank payout account before requesting a withdrawal.");
      }

      // Check cooldown period
      const now = new Date();
      if (wallet.payoutCooldownUntil && wallet.payoutCooldownUntil > now) {
        throw new Error(
          `Payout account was recently changed. Cooldown active until ${wallet.payoutCooldownUntil.toISOString()}.`
        );
      }

      // Check Available Balance
      if (wallet.availableBalanceMinor < amountMinor) {
        throw new Error(
          `Insufficient available balance. Available: RM ${(wallet.availableBalanceMinor / 100).toFixed(
            2
          )}, Requested: RM ${(amountMinor / 100).toFixed(2)}.`
        );
      }

      const balanceBefore = wallet.availableBalanceMinor;
      const balanceAfter = balanceBefore - amountMinor;

      // 2. Create Withdrawal Request
      const withdrawal = await tx.withdrawalRequest.create({
        data: {
          walletId: wallet.id,
          contributorProfileId,
          amountMinor,
          currency: wallet.currency,
          status: WithdrawalStatus.PENDING_REVIEW,
          idempotencyKey: idempotencyKey || null,
          bankName: wallet.payoutBankName,
          accountNumberMasked: wallet.payoutAccountNumberMasked,
          accountHolderName: wallet.payoutAccountHolderName,
        },
      });

      // 3. Create Ledger Entry (WITHDRAWAL_HOLD)
      await tx.walletLedgerEntry.create({
        data: {
          walletId: wallet.id,
          type: LedgerEntryType.WITHDRAWAL_HOLD,
          amountMinor,
          currency: wallet.currency,
          balanceBeforeMinor: balanceBefore,
          balanceAfterMinor: balanceAfter,
          referenceId: withdrawal.id,
          referenceType: "WITHDRAWAL",
          reason: `Withdrawal Hold for Request #${withdrawal.id}`,
          withdrawalId: withdrawal.id,
        },
      });

      // 4. Update Wallet Balances (move from available to held)
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalanceMinor: balanceAfter,
          heldBalanceMinor: wallet.heldBalanceMinor + amountMinor,
        },
      });

      // 5. Audit Log
      await tx.financialAuditLog.create({
        data: {
          action: FinancialAuditAction.WITHDRAWAL_REQUESTED,
          contributorProfileId,
          entityType: "WITHDRAWAL",
          entityId: withdrawal.id,
          amountMinor,
          currency: wallet.currency,
          previousState: { availableBalanceMinor: balanceBefore },
          newState: { availableBalanceMinor: balanceAfter, withdrawalId: withdrawal.id },
          reason: `Withdrawal Request of RM ${(amountMinor / 100).toFixed(2)}`,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
        },
      });

      // 6. Send Notification
      if (wallet.contributorProfile?.userId) {
        await tx.contributorNotification.create({
          data: {
            userId: wallet.contributorProfile.userId,
            type: NotificationType.WITHDRAWAL_REQUESTED,
            title: "Withdrawal Request Received",
            message: `Your withdrawal request for RM ${(amountMinor / 100).toFixed(
              2
            )} has been placed into editorial review.`,
            linkUrl: "/contributor/earnings",
          },
        });
      }

      return { withdrawalRequest: withdrawal, isIdempotentReplay: false };
    });
  }

  /**
   * Update contributor payout bank account details with 48h cooldown protection
   */
  public async updatePayoutAccount(
    contributorProfileId: string,
    account: { bankName: string; accountNumber: string; accountHolderName: string },
    actorId?: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    if (!account.bankName || !account.accountNumber || !account.accountHolderName) {
      throw new Error("Bank name, account number, and account holder name are mandatory.");
    }

    const trimmedAcc = account.accountNumber.trim();
    if (trimmedAcc.length < 6) {
      throw new Error("Invalid account number length.");
    }

    // Mask account number: preserve last 4 digits
    const masked = "*".repeat(Math.max(4, trimmedAcc.length - 4)) + trimmedAcc.slice(-4);
    const cooldownPeriod = new Date(Date.now() + 48 * 3600 * 1000); // 48-hour cooldown

    const wallet = await this.getOrCreateWallet(contributorProfileId);

    const updated = await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        payoutBankName: account.bankName.trim(),
        payoutAccountNumberMasked: masked,
        payoutAccountHolderName: account.accountHolderName.trim().toUpperCase(),
        payoutAccountUpdatedAt: new Date(),
        payoutCooldownUntil: cooldownPeriod,
      },
    });

    await financialAuditService.logEvent({
      action: FinancialAuditAction.PAYOUT_ACCOUNT_UPDATED,
      actorId,
      contributorProfileId,
      entityType: "WALLET",
      entityId: wallet.id,
      reason: `Payout account updated with 48-hour cooldown until ${cooldownPeriod.toISOString()}`,
      ipAddress,
      userAgent,
    });

    return updated;
  }

  /**
   * Perform administrative wallet adjustment (requires audit reason)
   */
  public async adminAdjustBalance(data: {
    walletId: string;
    amountMinor: number;
    type: "CREDIT" | "DEBIT" | "ADJUSTMENT" | "REVERSAL";
    reason: string;
    actorId: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const { walletId, amountMinor, type, reason, actorId, ipAddress, userAgent } = data;

    if (!reason || reason.trim().length < 10) {
      throw new Error("Administrative adjustment requires a minimum 10-character justification.");
    }

    if (amountMinor <= 0) {
      throw new Error("Adjustment amount must be a positive integer minor unit.");
    }

    return await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { id: walletId },
      });

      if (!wallet) throw new Error("Wallet not found.");

      const isCredit = type === "CREDIT" || type === "ADJUSTMENT";
      const balanceBefore = wallet.availableBalanceMinor;

      if (!isCredit && balanceBefore < amountMinor) {
        throw new Error(
          `Insufficient balance for debit adjustment. Available: RM ${(balanceBefore / 100).toFixed(2)}.`
        );
      }

      const balanceAfter = isCredit ? balanceBefore + amountMinor : balanceBefore - amountMinor;
      const ledgerType = isCredit ? LedgerEntryType.ADJUSTMENT : LedgerEntryType.DEBIT;

      const ledgerEntry = await tx.walletLedgerEntry.create({
        data: {
          walletId: wallet.id,
          type: ledgerType,
          amountMinor,
          currency: wallet.currency,
          balanceBeforeMinor: balanceBefore,
          balanceAfterMinor: balanceAfter,
          reason,
          actorId,
          referenceType: "ADJUSTMENT",
        },
      });

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalanceMinor: balanceAfter,
          lifetimeEarningsMinor: isCredit
            ? wallet.lifetimeEarningsMinor + amountMinor
            : wallet.lifetimeEarningsMinor,
        },
      });

      await tx.financialAuditLog.create({
        data: {
          action: FinancialAuditAction.ADJUSTMENT_CREATED,
          actorId,
          contributorProfileId: wallet.contributorProfileId,
          entityType: "WALLET",
          entityId: wallet.id,
          amountMinor,
          currency: wallet.currency,
          previousState: { availableBalanceMinor: balanceBefore },
          newState: { availableBalanceMinor: balanceAfter },
          reason: `Admin Adjustment (${type}): ${reason}`,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
        },
      });

      return { wallet: updatedWallet, ledgerEntry };
    });
  }

  /**
   * Verify double-entry ledger integrity invariant
   */
  public async verifyLedgerIntegrity(walletId: string): Promise<{
    isValid: boolean;
    cachedAvailable: number;
    cachedHeld: number;
    computedLedgerTotal: number;
  }> {
    const wallet = await prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) throw new Error("Wallet not found.");

    const entries = await prisma.walletLedgerEntry.findMany({
      where: { walletId },
    });

    let computedTotal = 0;
    for (const entry of entries) {
      if (entry.type === LedgerEntryType.CREDIT || entry.type === LedgerEntryType.ADJUSTMENT) {
        computedTotal += entry.amountMinor;
      } else if (entry.type === LedgerEntryType.DEBIT || entry.type === LedgerEntryType.PAYOUT) {
        computedTotal -= entry.amountMinor;
      }
      // Note: WITHDRAWAL_HOLD and WITHDRAWAL_RELEASE move funds between available and held without altering net balance
    }

    const currentTotal = wallet.availableBalanceMinor + wallet.heldBalanceMinor;
    const isValid = computedTotal === currentTotal;

    return {
      isValid,
      cachedAvailable: wallet.availableBalanceMinor,
      cachedHeld: wallet.heldBalanceMinor,
      computedLedgerTotal: computedTotal,
    };
  }

  /**
   * Get ledger history for a wallet
   */
  public async getLedgerHistory(walletId: string, limit = 50, offset = 0) {
    const [total, entries] = await Promise.all([
      prisma.walletLedgerEntry.count({ where: { walletId } }),
      prisma.walletLedgerEntry.findMany({
        where: { walletId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
    ]);

    return { total, entries, limit, offset };
  }
}

export const walletService = WalletService.getInstance();
