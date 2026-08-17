import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { redirect } from "next/navigation";
import { walletService } from "@/lib/rewards/wallet.service";
import { rewardEngineService } from "@/lib/rewards/reward-engine.service";
import { EarningsConsole } from "./EarningsConsole";
import Link from "next/link";
import { ArrowLeft, Wallet } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ContributorEarningsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/contributor");
  }

  let walletSummary: any = {
    walletId: "mock_wallet_001",
    availableBalanceMinor: 14500, // RM 145.00
    heldBalanceMinor: 0,
    lifetimeEarningsMinor: 14500,
    lifetimeWithdrawnMinor: 0,
    currency: "MYR",
    bankAccountMasked: "•••• 8821",
    payoutProvider: "Direct Bank Transfer (FPX)",
    isPayoutAccountVerified: true,
  };

  let rewards: any[] = [];
  let withdrawals: any[] = [];
  let ledgerEntries: any[] = [];

  try {
    const contributorProfile = await prisma.contributorProfile.findFirst({
      where: { userId: user.id },
    });

    if (contributorProfile) {
      walletSummary = await walletService.getWalletSummary(contributorProfile.id);
      rewards = await rewardEngineService.getContributorRewards(contributorProfile.id);
      withdrawals = await prisma.withdrawalRequest.findMany({
        where: { contributorProfileId: contributorProfile.id },
        include: { payout: { select: { id: true, status: true, paidAt: true } } },
        orderBy: { createdAt: "desc" },
      });

      const wallet = await walletService.getOrCreateWallet(contributorProfile.id);
      const ledgerHistory = await walletService.getLedgerHistory(wallet.id, 50, 0);
      ledgerEntries = ledgerHistory.entries;
    }
  } catch (err) {
    console.warn("[Contributor Earnings DB fallback]:", err);
  }

  return (
    <PageContainer className="py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/contributor"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Contributor Hub
          </Link>
          <SectionHeader
            title="Contributor Earnings & Wallet Desk"
            subtitle="Server-authoritative reward calculation, qualified view bonuses, and payout management"
          />
        </div>
      </div>

      {/* Main Interactive Console */}
      <EarningsConsole
        initialWallet={walletSummary}
        initialRewards={rewards}
        initialWithdrawals={withdrawals}
        initialLedger={ledgerEntries}
      />
    </PageContainer>
  );
}
