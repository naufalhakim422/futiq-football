import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { redirect } from "next/navigation";
import { FinanceConsole } from "./FinanceConsole";
import { financialAuditService } from "@/lib/rewards/financial-audit.service";
import { fraudDetectionService } from "@/lib/rewards/fraud-detection.service";
import { WithdrawalStatus, PayoutStatus, RewardStatus } from "@prisma/client";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminFinancePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin");
  }

  const isAuthorized = user.roles.some((r) => ["SUPER_ADMIN", "FINANCE"].includes(r));
  if (!isAuthorized) {
    redirect("/admin");
  }

  let totalRewardsAgg: any = { _sum: { totalRewardMinor: 0 }, _count: 0 };
  let totalWalletsAgg: any = { _sum: { availableBalanceMinor: 0, heldBalanceMinor: 0, lifetimeEarningsMinor: 0, lifetimeWithdrawnMinor: 0 } };
  let pendingWithdrawalsCount = 0;
  let pendingWithdrawalsAgg: any = { _sum: { amountMinor: 0 } };
  let processingPayoutsCount = 0;
  let paidPayoutsAgg: any = { _sum: { amountMinor: 0 }, _count: 0 };
  let activeFraudSignalsCount = 0;
  let withdrawals: any[] = [];
  let payouts: any[] = [];
  let fraudSignals: any[] = [];
  let auditLogsRes: any = { logs: [], total: 0 };

  try {
    const results = await Promise.all([
      prisma.contributorReward.aggregate({
        where: { status: RewardStatus.FINALIZED },
        _sum: { totalRewardMinor: true },
        _count: true,
      }),
      prisma.wallet.aggregate({
        _sum: {
          availableBalanceMinor: true,
          heldBalanceMinor: true,
          lifetimeEarningsMinor: true,
          lifetimeWithdrawnMinor: true,
        },
      }),
      prisma.withdrawalRequest.count({
        where: { status: WithdrawalStatus.PENDING_REVIEW },
      }),
      prisma.withdrawalRequest.aggregate({
        where: { status: WithdrawalStatus.PENDING_REVIEW },
        _sum: { amountMinor: true },
      }),
      prisma.payout.count({
        where: { status: PayoutStatus.PROCESSING },
      }),
      prisma.payout.aggregate({
        where: { status: PayoutStatus.PAID },
        _sum: { amountMinor: true },
        _count: true,
      }),
      prisma.fraudSignal.count({
        where: { isResolved: false },
      }),
      prisma.withdrawalRequest.findMany({
        include: {
          contributorProfile: {
            select: {
              id: true,
              displayName: true,
              user: { select: { email: true } },
            },
          },
          payout: { select: { id: true, status: true, provider: true, paidAt: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.payout.findMany({
        include: {
          withdrawalRequest: true,
          contributorProfile: {
            select: { id: true, displayName: true, user: { select: { email: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      fraudDetectionService.listSignals(),
      financialAuditService.getAuditLogs({ limit: 50 }),
    ]);

    totalRewardsAgg = results[0];
    totalWalletsAgg = results[1];
    pendingWithdrawalsCount = results[2];
    pendingWithdrawalsAgg = results[3];
    processingPayoutsCount = results[4];
    paidPayoutsAgg = results[5];
    activeFraudSignalsCount = results[6];
    withdrawals = results[7];
    payouts = results[8];
    fraudSignals = results[9];
    auditLogsRes = results[10];
  } catch (err) {
    console.warn("[Admin Finance DB offline fallback]:", err);
  }

  const overview = {
    totalFinalizedRewardsMinor: totalRewardsAgg._sum.totalRewardMinor || 0,
    totalRewardsCount: totalRewardsAgg._count || 0,
    totalSystemAvailableBalanceMinor: totalWalletsAgg._sum.availableBalanceMinor || 0,
    totalSystemHeldBalanceMinor: totalWalletsAgg._sum.heldBalanceMinor || 0,
    totalLifetimeEarningsMinor: totalWalletsAgg._sum.lifetimeEarningsMinor || 0,
    totalLifetimeWithdrawnMinor: totalWalletsAgg._sum.lifetimeWithdrawnMinor || 0,
    pendingWithdrawalsCount,
    pendingWithdrawalsAmountMinor: pendingWithdrawalsAgg._sum.amountMinor || 0,
    processingPayoutsCount,
    totalPaidPayoutsMinor: paidPayoutsAgg._sum.amountMinor || 0,
    totalPaidPayoutsCount: paidPayoutsAgg._count || 0,
    activeFraudSignalsCount,
  };

  return (
    <PageContainer className="py-8 space-y-8">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Admin Central
        </Link>
        <SectionHeader
          title="Platform Finance & Automated Payout Operations"
          subtitle="Real-time financial telemetry, dual-approval withdrawal management, auto-payout state machine, and fraud control"
        />
      </div>

      <FinanceConsole
        initialOverview={overview}
        initialWithdrawals={withdrawals}
        initialPayouts={payouts}
        initialFraudSignals={fraudSignals}
        initialAuditLogs={auditLogsRes.logs || []}
      />
    </PageContainer>
  );
}
