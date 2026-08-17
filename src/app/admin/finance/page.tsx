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
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminFinancePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?unauthorized=true");
  }

  const isAuthorized = user.roles.some((r) => ["SUPER_ADMIN", "FINANCE"].includes(r));
  if (!isAuthorized) {
    redirect("/unauthorized");
  }

  // Load Initial Financial State
  const [
    totalRewardsAgg,
    totalWalletsAgg,
    pendingWithdrawalsCount,
    pendingWithdrawalsAgg,
    processingPayoutsCount,
    paidPayoutsAgg,
    activeFraudSignalsCount,
    withdrawals,
    payouts,
    fraudSignals,
    auditLogsRes,
  ] = await Promise.all([
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

  const overview = {
    totalFinalizedRewardsMinor: totalRewardsAgg._sum.totalRewardMinor || 0,
    totalFinalizedRewardsCount: totalRewardsAgg._count,
    totalAvailableLiabilityMinor: totalWalletsAgg._sum.availableBalanceMinor || 0,
    totalHeldLiabilityMinor: totalWalletsAgg._sum.heldBalanceMinor || 0,
    totalWalletLiabilityMinor:
      (totalWalletsAgg._sum.availableBalanceMinor || 0) +
      (totalWalletsAgg._sum.heldBalanceMinor || 0),
    pendingWithdrawalsCount,
    pendingWithdrawalsAmountMinor: pendingWithdrawalsAgg._sum.amountMinor || 0,
    processingPayoutsCount,
    totalPaidOutMinor: paidPayoutsAgg._sum.amountMinor || 0,
    totalPaidOutCount: paidPayoutsAgg._count,
    activeFraudSignalsCount,
    currency: "MYR",
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
          title="Finance & Payout Command Center"
          subtitle="Real-time financial liabilities, double-entry wallet reconciliation, payout disbursements, and fraud risk monitoring"
        />
      </div>

      <FinanceConsole
        initialOverview={overview}
        initialWithdrawals={withdrawals}
        initialPayouts={payouts}
        initialFraudSignals={fraudSignals}
        initialAuditLogs={auditLogsRes.logs}
      />
    </PageContainer>
  );
}
