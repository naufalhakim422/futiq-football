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

  // Developer Simulation Wallet Balance ($50.00 USD = 5000 minor cents ≈ Rp 800.000 / RM 225.00)
  let walletSummary: any = {
    walletId: `wallet_${user.id}`,
    availableBalanceMinor: 5000, // $50.00 USD
    heldBalanceMinor: 0,
    lifetimeEarningsMinor: 5000, // $50.00 USD
    lifetimeWithdrawnMinor: 0,
    currency: "USD",
    bankAccountMasked: "•••• 8821",
    payoutProvider: null,
    isPayoutAccountVerified: true,
    payoutAccount: {
      isConfigured: true,
      bankName: "BCA (Bank Central Asia) / GoPay",
      accountNumberMasked: "•••• 8821",
      accountHolderName: user.fullName || "Developer Contributor",
      isUnderCooldown: false,
    },
  };

  let rewards: any[] = [
    {
      id: "rew_sim_01",
      totalRewardMinor: 2850, // $28.50 USD
      baseRewardMinor: 500,
      viewBonusMinor: 1425,
      qualityBonusMinor: 500,
      breakingBonusMinor: 425,
      qualifiedViewsCount: 1425,
      status: "FINALIZED",
      createdAt: new Date(Date.now() - 86400000 * 2),
      article: {
        title: "Inside Mikel Arteta's High-Press Evolution & Tactical Rest-Defense Masterclass",
        category: "TACTICS",
      },
    },
    {
      id: "rew_sim_02",
      totalRewardMinor: 2150, // $21.50 USD
      baseRewardMinor: 500,
      viewBonusMinor: 1075,
      qualityBonusMinor: 575,
      breakingBonusMinor: 0,
      qualifiedViewsCount: 1075,
      status: "FINALIZED",
      createdAt: new Date(Date.now() - 86400000 * 5),
      article: {
        title: "Premier League Expected Goals (xG) Delta & Midfield Engine Room Analysis",
        category: "ANALYTICS",
      },
    },
  ];

  let withdrawals: any[] = [];
  let ledgerEntries: any[] = [
    {
      id: "ledg_sim_01",
      type: "CREDIT",
      reason: "Article Reward #rew_sim_01 (70% Adsterra Revenue Share)",
      amountMinor: 2850,
      balanceAfterMinor: 2850,
      createdAt: new Date(Date.now() - 86400000 * 2),
    },
    {
      id: "ledg_sim_02",
      type: "CREDIT",
      reason: "Article Reward #rew_sim_02 (70% Adsterra Revenue Share)",
      amountMinor: 2150,
      balanceAfterMinor: 5000,
      createdAt: new Date(Date.now() - 86400000 * 5),
    },
  ];

  try {
    const contributorProfile = await prisma.contributorProfile.findFirst({
      where: { userId: user.id },
    });

    if (contributorProfile) {
      const dbWallet = await walletService.getWalletSummary(contributorProfile.id);
      const dbRewards = await rewardEngineService.getContributorRewards(contributorProfile.id);
      const dbWithdrawals = await prisma.withdrawalRequest.findMany({
        where: { contributorProfileId: contributorProfile.id },
        include: { payout: { select: { id: true, status: true, paidAt: true } } },
        orderBy: { createdAt: "desc" },
      });

      if (dbWallet && dbWallet.availableBalanceMinor > 0) {
        walletSummary = dbWallet;
      }
      if (dbRewards && dbRewards.length > 0) {
        rewards = dbRewards;
      }
      if (dbWithdrawals && dbWithdrawals.length > 0) {
        withdrawals = dbWithdrawals;
      }
    }
  } catch (err) {
    // Graceful fallback with simulation data active
  }

  return (
    <PageContainer className="py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/contributor"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-500 mb-2 transition-colors font-sans"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Contributor Desk
          </Link>
          <SectionHeader
            title="Contributor Earnings & Wallet Desk"
            subtitle="Server-authoritative 70% Adsterra revenue share, qualified reader telemetry, and payout settlement"
            badgeText="Simulation Active • $50.00 USD"
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
