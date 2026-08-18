import { prisma } from "@/lib/db";
import { financialAuditService } from "./financial-audit.service";
import { FinancialAuditAction } from "@prisma/client";

export interface PayoutPolicyConfig {
  minimumWithdrawalMinor: number;
  maxAutomaticWithdrawalMinor: number;
  maxDailyWithdrawalMinor: number;
  maxMonthlyWithdrawalMinor: number;
  autoPayoutMaxRiskScore: number;
  payoutCooldownHours: number;
  isAutoPayoutEnabled: boolean;
}

export class PayoutPolicyService {
  private static instance: PayoutPolicyService;

  // Hard upper/lower bounds in code to guarantee financial security invariants
  public static readonly HARD_MINIMUM_WITHDRAWAL_MINOR = 1000; // RM 10.00 minimum
  public static readonly HARD_MAX_AUTOMATIC_LIMIT_MINOR = 200000; // RM 2,000.00 absolute max for auto payout
  public static readonly HARD_MAX_RISK_SCORE_FOR_AUTO = 40; // Never auto-pay above 40 risk score

  private constructor() {}

  public static getInstance(): PayoutPolicyService {
    if (!PayoutPolicyService.instance) {
      PayoutPolicyService.instance = new PayoutPolicyService();
    }
    return PayoutPolicyService.instance;
  }

  /**
   * Get active payout policy configuration
   */
  public async getPolicy(): Promise<PayoutPolicyConfig> {
    try {
      let policy = await prisma.payoutPolicy.findUnique({
        where: { name: "default_policy" },
      });

      if (!policy) {
        policy = await prisma.payoutPolicy.create({
          data: {
            name: "default_policy",
            minimumWithdrawalMinor: 8500, // RM 85.00
            maxAutomaticWithdrawalMinor: 50000, // RM 500.00
            maxDailyWithdrawalMinor: 200000, // RM 2,000.00
            maxMonthlyWithdrawalMinor: 1000000, // RM 10,000.00
            autoPayoutMaxRiskScore: 29, // 0-29 Low Risk
            payoutCooldownHours: 48,
            isAutoPayoutEnabled: true,
          },
        });
      }

      return {
        minimumWithdrawalMinor: policy.minimumWithdrawalMinor,
        maxAutomaticWithdrawalMinor: policy.maxAutomaticWithdrawalMinor,
        maxDailyWithdrawalMinor: policy.maxDailyWithdrawalMinor,
        maxMonthlyWithdrawalMinor: policy.maxMonthlyWithdrawalMinor,
        autoPayoutMaxRiskScore: policy.autoPayoutMaxRiskScore,
        payoutCooldownHours: policy.payoutCooldownHours,
        isAutoPayoutEnabled: policy.isAutoPayoutEnabled,
      };
    } catch {
      // Default safe fallback
      return {
        minimumWithdrawalMinor: 2000,
        maxAutomaticWithdrawalMinor: 50000,
        maxDailyWithdrawalMinor: 200000,
        maxMonthlyWithdrawalMinor: 1000000,
        autoPayoutMaxRiskScore: 29,
        payoutCooldownHours: 48,
        isAutoPayoutEnabled: true,
      };
    }
  }

  /**
   * Update payout policy with administrative authorization & audit trail
   */
  public async updatePolicy(
    updates: Partial<PayoutPolicyConfig>,
    actorId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const current = await this.getPolicy();

    // Enforce hard security bounds
    const newMinimum = updates.minimumWithdrawalMinor !== undefined
      ? Math.max(PayoutPolicyService.HARD_MINIMUM_WITHDRAWAL_MINOR, updates.minimumWithdrawalMinor)
      : current.minimumWithdrawalMinor;

    const newMaxAuto = updates.maxAutomaticWithdrawalMinor !== undefined
      ? Math.min(PayoutPolicyService.HARD_MAX_AUTOMATIC_LIMIT_MINOR, Math.max(newMinimum, updates.maxAutomaticWithdrawalMinor))
      : current.maxAutomaticWithdrawalMinor;

    const newMaxRisk = updates.autoPayoutMaxRiskScore !== undefined
      ? Math.min(PayoutPolicyService.HARD_MAX_RISK_SCORE_FOR_AUTO, Math.max(0, updates.autoPayoutMaxRiskScore))
      : current.autoPayoutMaxRiskScore;

    const updated = await prisma.payoutPolicy.upsert({
      where: { name: "default_policy" },
      create: {
        name: "default_policy",
        minimumWithdrawalMinor: newMinimum,
        maxAutomaticWithdrawalMinor: newMaxAuto,
        maxDailyWithdrawalMinor: updates.maxDailyWithdrawalMinor ?? current.maxDailyWithdrawalMinor,
        maxMonthlyWithdrawalMinor: updates.maxMonthlyWithdrawalMinor ?? current.maxMonthlyWithdrawalMinor,
        autoPayoutMaxRiskScore: newMaxRisk,
        payoutCooldownHours: updates.payoutCooldownHours ?? current.payoutCooldownHours,
        isAutoPayoutEnabled: updates.isAutoPayoutEnabled ?? current.isAutoPayoutEnabled,
        updatedByUserId: actorId,
      },
      update: {
        minimumWithdrawalMinor: newMinimum,
        maxAutomaticWithdrawalMinor: newMaxAuto,
        maxDailyWithdrawalMinor: updates.maxDailyWithdrawalMinor ?? current.maxDailyWithdrawalMinor,
        maxMonthlyWithdrawalMinor: updates.maxMonthlyWithdrawalMinor ?? current.maxMonthlyWithdrawalMinor,
        autoPayoutMaxRiskScore: newMaxRisk,
        payoutCooldownHours: updates.payoutCooldownHours ?? current.payoutCooldownHours,
        isAutoPayoutEnabled: updates.isAutoPayoutEnabled ?? current.isAutoPayoutEnabled,
        updatedByUserId: actorId,
      },
    });

    await financialAuditService.logEvent({
      action: FinancialAuditAction.POLICY_UPDATED,
      actorId,
      entityType: "POLICY",
      entityId: updated.id,
      previousState: current,
      newState: updated,
      reason: "Administrative payout policy update",
      ipAddress,
      userAgent,
    });

    return updated;
  }
}

export const payoutPolicyService = PayoutPolicyService.getInstance();
