import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { WithdrawalStatus, PayoutStatus, RewardStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const isAuthorized = user.roles.some((r) => ["SUPER_ADMIN", "FINANCE"].includes(r));
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Forbidden: Finance or Super Admin role required." },
        { status: 403 }
      );
    }

    let totalRewardsAgg: any = { _sum: { totalRewardMinor: 0 }, _count: 0 };
    let totalWalletsAgg: any = { _sum: { availableBalanceMinor: 0, heldBalanceMinor: 0, lifetimeEarningsMinor: 0, lifetimeWithdrawnMinor: 0 } };
    let pendingWithdrawalsCount = 0;
    let pendingWithdrawalsAgg: any = { _sum: { amountMinor: 0 } };
    let processingPayoutsCount = 0;
    let paidPayoutsAgg: any = { _sum: { amountMinor: 0 }, _count: 0 };
    let activeFraudSignalsCount = 0;

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
      ]);

      totalRewardsAgg = results[0];
      totalWalletsAgg = results[1];
      pendingWithdrawalsCount = results[2];
      pendingWithdrawalsAgg = results[3];
      processingPayoutsCount = results[4];
      paidPayoutsAgg = results[5];
      activeFraudSignalsCount = results[6];
    } catch (dbErr) {
      console.warn("[Admin Finance API DB fallback]:", dbErr);
    }

    const totalLiabilityMinor =
      (totalWalletsAgg._sum.availableBalanceMinor || 0) +
      (totalWalletsAgg._sum.heldBalanceMinor || 0);

    return NextResponse.json({
      success: true,
      overview: {
        totalFinalizedRewardsMinor: totalRewardsAgg._sum.totalRewardMinor || 0,
        totalFinalizedRewardsCount: totalRewardsAgg._count || 0,
        totalAvailableLiabilityMinor: totalWalletsAgg._sum.availableBalanceMinor || 0,
        totalHeldLiabilityMinor: totalWalletsAgg._sum.heldBalanceMinor || 0,
        totalWalletLiabilityMinor: totalLiabilityMinor,
        pendingWithdrawalsCount,
        pendingWithdrawalsAmountMinor: pendingWithdrawalsAgg._sum.amountMinor || 0,
        processingPayoutsCount,
        totalPaidOutMinor: paidPayoutsAgg._sum.amountMinor || 0,
        totalPaidOutCount: paidPayoutsAgg._count || 0,
        activeFraudSignalsCount,
        currency: "MYR",
      },
    });
  } catch (error: any) {
    console.error("[Admin Finance Overview GET Error]:", error);
    return NextResponse.json(
      { error: "Failed to retrieve financial overview." },
      { status: 500 }
    );
  }
}
