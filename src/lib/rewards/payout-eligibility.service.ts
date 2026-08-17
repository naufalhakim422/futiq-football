import { prisma } from "@/lib/db";
import { Currency, WithdrawalStatus } from "@prisma/client";
import { payoutPolicyService } from "./payout-policy.service";
import { fraudDetectionService } from "./fraud-detection.service";

export interface PayoutEligibilityResult {
  eligible: boolean;
  isAutoPayEligible: boolean;
  requiresManualReview: boolean;
  riskScore: number;
  reasonCodes: string[];
  providerRoute: string;
  policySnapshot: {
    minimumWithdrawalMinor: number;
    maxAutomaticWithdrawalMinor: number;
    isAutoPayoutEnabled: boolean;
  };
}

export class PayoutEligibilityService {
  private static instance: PayoutEligibilityService;

  private constructor() {}

  public static getInstance(): PayoutEligibilityService {
    if (!PayoutEligibilityService.instance) {
      PayoutEligibilityService.instance = new PayoutEligibilityService();
    }
    return PayoutEligibilityService.instance;
  }

  /**
   * Evaluate complete server-authoritative payout eligibility
   */
  public async evaluateEligibility(
    contributorProfileId: string,
    amountMinor: number,
    currency: Currency = Currency.MYR
  ): Promise<PayoutEligibilityResult> {
    const reasonCodes: string[] = [];
    const policy = await payoutPolicyService.getPolicy();

    // 1. Fetch Contributor & Wallet
    const contributor = await prisma.contributorProfile.findUnique({
      where: { id: contributorProfileId },
      include: {
        wallet: true,
        user: { select: { id: true, isActive: true, isVerified: true } },
      },
    });

    if (!contributor || !contributor.user.isActive) {
      reasonCodes.push("CONTRIBUTOR_INACTIVE");
      return this.buildResult(false, false, false, 100, reasonCodes, "NONE", policy);
    }

    const wallet = contributor.wallet;
    if (!wallet) {
      reasonCodes.push("WALLET_NOT_FOUND");
      return this.buildResult(false, false, false, 0, reasonCodes, "NONE", policy);
    }

    // 2. Balance Check
    if (wallet.availableBalanceMinor < amountMinor) {
      reasonCodes.push("INSUFFICIENT_AVAILABLE_BALANCE");
    }

    // 3. Minimum Withdrawal Check
    if (amountMinor < policy.minimumWithdrawalMinor) {
      reasonCodes.push("BELOW_MINIMUM_THRESHOLD");
    }

    // 4. Payout Account Configuration Check
    if (!wallet.payoutBankName || !wallet.payoutAccountNumberMasked || !wallet.payoutAccountHolderName) {
      reasonCodes.push("PAYOUT_ACCOUNT_UNCONFIGURED");
    }

    // 5. Bank Account Cooldown Check
    const now = new Date();
    if (wallet.payoutCooldownUntil && wallet.payoutCooldownUntil > now) {
      reasonCodes.push("PAYOUT_ACCOUNT_COOLDOWN_ACTIVE");
    }

    // 6. Active Withdrawal Check (Prevent multiple simultaneous in-flight withdrawals)
    const activeWithdrawalsCount = await prisma.withdrawalRequest.count({
      where: {
        contributorProfileId,
        status: {
          in: [
            WithdrawalStatus.PENDING_REVIEW,
            WithdrawalStatus.RISK_CHECKING,
            WithdrawalStatus.AUTO_APPROVED,
            WithdrawalStatus.MANUAL_REVIEW,
            WithdrawalStatus.PROCESSING,
          ],
        },
      },
    });

    if (activeWithdrawalsCount > 0) {
      reasonCodes.push("ACTIVE_WITHDRAWAL_IN_FLIGHT");
    }

    // 7. Daily & Monthly Cumulative Limits Check
    const oneDayAgo = new Date(Date.now() - 24 * 3600 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000);

    const [dailySumAgg, monthlySumAgg] = await Promise.all([
      prisma.withdrawalRequest.aggregate({
        where: {
          contributorProfileId,
          createdAt: { gte: oneDayAgo },
          status: { in: [WithdrawalStatus.AUTO_APPROVED, WithdrawalStatus.APPROVED, WithdrawalStatus.PROCESSING, WithdrawalStatus.PAID] },
        },
        _sum: { amountMinor: true },
      }),
      prisma.withdrawalRequest.aggregate({
        where: {
          contributorProfileId,
          createdAt: { gte: thirtyDaysAgo },
          status: { in: [WithdrawalStatus.AUTO_APPROVED, WithdrawalStatus.APPROVED, WithdrawalStatus.PROCESSING, WithdrawalStatus.PAID] },
        },
        _sum: { amountMinor: true },
      }),
    ]);

    const dailyTotal = (dailySumAgg._sum.amountMinor || 0) + amountMinor;
    if (dailyTotal > policy.maxDailyWithdrawalMinor) {
      reasonCodes.push("EXCEEDS_DAILY_WITHDRAWAL_LIMIT");
    }

    const monthlyTotal = (monthlySumAgg._sum.amountMinor || 0) + amountMinor;
    if (monthlyTotal > policy.maxMonthlyWithdrawalMinor) {
      reasonCodes.push("EXCEEDS_MONTHLY_WITHDRAWAL_LIMIT");
    }

    // 8. Fraud Risk Evaluation
    const risk = await fraudDetectionService.evaluateContributorRisk(contributorProfileId);
    const riskScore = risk.riskScore;

    if (risk.isBlockedForPayout || riskScore >= 80) {
      reasonCodes.push("FRAUD_RISK_CRITICAL_BLOCK");
    }

    // 9. KYC Identity Verification Check (Must be VERIFIED, active, and not on compliance hold)
    const { kycService } = await import("@/lib/kyc/kyc.service");
    const kyc = await kycService.evaluateKycForPayout(contributorProfileId);
    if (!kyc.isKycCompliant) {
      reasonCodes.push(...kyc.reasonCodes);
    }

    // 10. Evaluate Final Eligibility & Auto-Approval Capability
    const hasHardBlock = reasonCodes.some((code) =>
      [
        "CONTRIBUTOR_INACTIVE",
        "INSUFFICIENT_AVAILABLE_BALANCE",
        "BELOW_MINIMUM_THRESHOLD",
        "PAYOUT_ACCOUNT_UNCONFIGURED",
        "PAYOUT_ACCOUNT_COOLDOWN_ACTIVE",
        "ACTIVE_WITHDRAWAL_IN_FLIGHT",
        "FRAUD_RISK_CRITICAL_BLOCK",
        "KYC_NOT_STARTED",
        "KYC_STATUS_NOT_STARTED",
        "KYC_STATUS_PENDING",
        "KYC_STATUS_UNDER_REVIEW",
        "KYC_STATUS_REJECTED",
        "KYC_STATUS_EXPIRED",
        "KYC_STATUS_REVERIFICATION_REQUIRED",
        "KYC_STATUS_SUSPENDED",
        "KYC_EXPIRED",
        "KYC_COMPLIANCE_HOLD",
      ].includes(code)
    );

    const eligible = !hasHardBlock;
    const isMediumRisk = riskScore >= 30 && riskScore < 80;
    const exceedsAutoLimit = amountMinor > policy.maxAutomaticWithdrawalMinor;
    const requiresManualReview =
      eligible &&
      (!policy.isAutoPayoutEnabled || isMediumRisk || exceedsAutoLimit || dailyTotal > policy.maxDailyWithdrawalMinor);

    const isAutoPayEligible = eligible && !requiresManualReview;

    // Determine Provider Route
    const country = contributor.country || "MY";
    const providerRoute = `${country.toUpperCase()}_${currency}_BANK`;

    return this.buildResult(
      eligible,
      isAutoPayEligible,
      requiresManualReview,
      riskScore,
      reasonCodes,
      providerRoute,
      policy
    );
  }

  private buildResult(
    eligible: boolean,
    isAutoPayEligible: boolean,
    requiresManualReview: boolean,
    riskScore: number,
    reasonCodes: string[],
    providerRoute: string,
    policy: any
  ): PayoutEligibilityResult {
    return {
      eligible,
      isAutoPayEligible,
      requiresManualReview,
      riskScore,
      reasonCodes,
      providerRoute,
      policySnapshot: {
        minimumWithdrawalMinor: policy.minimumWithdrawalMinor,
        maxAutomaticWithdrawalMinor: policy.maxAutomaticWithdrawalMinor,
        isAutoPayoutEnabled: policy.isAutoPayoutEnabled,
      },
    };
  }
}

export const payoutEligibilityService = PayoutEligibilityService.getInstance();
