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
    redirect("/login?unauthorized=true");
  }

  const contributorProfile = await prisma.contributorProfile.findUnique({
    where: { userId: user.id },
  });

  if (!contributorProfile) {
    redirect("/contributor/apply");
  }

  // Load server-authoritative wallet data
  const walletSummary = await walletService.getWalletSummary(contributorProfile.id);
  const rewards = await rewardEngineService.getContributorRewards(contributorProfile.id);

  const withdrawals = await prisma.withdrawalRequest.findMany({
    where: { contributorProfileId: contributorProfile.id },
    include: { payout: { select: { id: true, status: true, paidAt: true } } },
    orderBy: { createdAt: "desc" },
  });

  const wallet = await walletService.getOrCreateWallet(contributorProfile.id);
  const ledgerHistory = await walletService.getLedgerHistory(wallet.id, 50, 0);

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
            title="Contributor Earnings & Wallet"
            subtitle="Server-authoritative reward calculation, qualified view bonuses, and payout management"
          />
        </div>
      </div>

      {/* Main Interactive Console */}
      <EarningsConsole
        initialWallet={walletSummary}
        initialRewards={rewards}
        initialWithdrawals={withdrawals}
        initialLedger={ledgerHistory.entries}
      />
    </PageContainer>
  );
}
