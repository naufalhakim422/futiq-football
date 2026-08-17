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

    // Aggregate key financial metrics
    const [
      totalRewardsAgg,
      totalWalletsAgg,
      pendingWithdrawalsCount,
      pendingWithdrawalsAgg,
      processingPayoutsCount,
      paidPayoutsAgg,
      activeFraudSignalsCount,
    ] = await Promise.all([
      // Total finalized rewards
      prisma.contributorReward.aggregate({
        where: { status: RewardStatus.FINALIZED },
        _sum: { totalRewardMinor: true },
        _count: true,
      }),
      // Total wallet liability (Available + Held)
      prisma.wallet.aggregate({
        _sum: {
          availableBalanceMinor: true,
          heldBalanceMinor: true,
          lifetimeEarningsMinor: true,
          lifetimeWithdrawnMinor: true,
        },
      }),
      // Pending withdrawal requests count
      prisma.withdrawalRequest.count({
        where: { status: WithdrawalStatus.PENDING_REVIEW },
      }),
      // Pending withdrawal total amount
      prisma.withdrawalRequest.aggregate({
        where: { status: WithdrawalStatus.PENDING_REVIEW },
        _sum: { amountMinor: true },
      }),
      // Processing payouts count
      prisma.payout.count({
        where: { status: PayoutStatus.PROCESSING },
      }),
      // Total paid out
      prisma.payout.aggregate({
        where: { status: PayoutStatus.PAID },
        _sum: { amountMinor: true },
        _count: true,
      }),
      // Active fraud signals
      prisma.fraudSignal.count({
        where: { isResolved: false },
      }),
    ]);

    const totalLiabilityMinor =
      (totalWalletsAgg._sum.availableBalanceMinor || 0) +
      (totalWalletsAgg._sum.heldBalanceMinor || 0);

    return NextResponse.json({
      success: true,
      overview: {
        totalFinalizedRewardsMinor: totalRewardsAgg._sum.totalRewardMinor || 0,
        totalFinalizedRewardsCount: totalRewardsAgg._count,
        totalAvailableLiabilityMinor: totalWalletsAgg._sum.availableBalanceMinor || 0,
        totalHeldLiabilityMinor: totalWalletsAgg._sum.heldBalanceMinor || 0,
        totalWalletLiabilityMinor: totalLiabilityMinor,
        pendingWithdrawalsCount,
        pendingWithdrawalsAmountMinor: pendingWithdrawalsAgg._sum.amountMinor || 0,
        processingPayoutsCount,
        totalPaidOutMinor: paidPayoutsAgg._sum.amountMinor || 0,
        totalPaidOutCount: paidPayoutsAgg._count,
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
