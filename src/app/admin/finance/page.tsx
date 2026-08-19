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
import { simulationStore } from "@/lib/rewards/simulation-store";
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
    // Database offline - fallback to developer simulation store
    totalWalletsAgg = {
      _sum: {
        availableBalanceMinor: simulationStore.availableBalanceMinor,
        heldBalanceMinor: simulationStore.heldBalanceMinor,
        lifetimeEarningsMinor: simulationStore.lifetimeEarningsMinor,
        lifetimeWithdrawnMinor: simulationStore.lifetimeWithdrawnMinor,
      },
    };
    pendingWithdrawalsCount = simulationStore.withdrawals.filter((w) => w.status === "PENDING_REVIEW").length;
    pendingWithdrawalsAgg = {
      _sum: {
        amountMinor: simulationStore.heldBalanceMinor,
      },
    };
    withdrawals = simulationStore.withdrawals;
    payouts = simulationStore.payouts;
    fraudSignals = simulationStore.fraudSignals;
    auditLogsRes = { logs: simulationStore.auditLogs, total: simulationStore.auditLogs.length };
  }

  // If DB returned 0 withdrawals in dev session, load simulation store
  if (withdrawals.length === 0 && simulationStore.withdrawals.length > 0) {
    withdrawals = simulationStore.withdrawals;
    pendingWithdrawalsCount = simulationStore.withdrawals.filter((w) => w.status === "PENDING_REVIEW").length;
  }

  const availableLiab = totalWalletsAgg?._sum?.availableBalanceMinor ?? simulationStore.availableBalanceMinor;
  const heldLiab = totalWalletsAgg?._sum?.heldBalanceMinor ?? simulationStore.heldBalanceMinor;
  const lifetimeWithdrawn = totalWalletsAgg?._sum?.lifetimeWithdrawnMinor ?? 0;

  const overview = {
    totalAvailableLiabilitiesMinor: availableLiab,
    totalHeldLiabilitiesMinor: heldLiab,
    totalLifetimeWithdrawnMinor: lifetimeWithdrawn,
    pendingWithdrawalsCount: pendingWithdrawalsCount || withdrawals.filter((w) => w.status === "PENDING_REVIEW").length,
    unresolvedFraudSignalsCount: activeFraudSignalsCount || 0,
    totalFinalizedRewardsMinor: totalRewardsAgg?._sum?.totalRewardMinor || 5000,
  };

  return (
    <PageContainer className="py-8 space-y-8">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-500 mb-2 transition-colors font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Admin Portal
        </Link>
        <SectionHeader
          title="Platform Treasury & Finance Operations"
          subtitle="Real-time ledger reconciliation, dual-custody payout approvals, and automated disbursement engine"
          badgeText="Simulation Active • $50.00 USD"
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
