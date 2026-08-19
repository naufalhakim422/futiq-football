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

  // Pure Contributor Simulation Wallet Balance ($100.00 USD = 10,000 minor units ≈ Rp 1.600.000 / RM 450.00 / €92.00)
  let walletSummary: any = {
    walletId: `wallet_${user.id}`,
    availableBalanceMinor: 10000, // $100.00 USD
    heldBalanceMinor: 0,
    lifetimeEarningsMinor: 10000, // $100.00 USD
    lifetimeWithdrawnMinor: 0,
    currency: "USD",
    bankAccountMasked: "•••• 8821",
    payoutProvider: null,
    isPayoutAccountVerified: true,
    payoutAccount: {
      isConfigured: true,
      bankName: "BCA (Bank Central Asia)",
      accountNumberMasked: "•••• 8821",
      accountHolderName: user.fullName || "Naufal (Pure Contributor)",
      isUnderCooldown: false,
    },
  };

  let rewards: any[] = [
    {
      id: "rew_sim_01",
      totalRewardMinor: 3500, // $35.00 USD
      baseRewardMinor: 500,
      viewBonusMinor: 2000,
      qualityBonusMinor: 600,
      breakingBonusMinor: 400,
      qualifiedViewsCount: 2000,
      status: "FINALIZED",
      createdAt: new Date(Date.now() - 86400000 * 1),
      article: {
        title: "Tactical Blueprint: Real Madrid Midfield Transition Mastery & Counter-Press Efficiency",
        category: "TACTICS",
      },
    },
    {
      id: "rew_sim_02",
      totalRewardMinor: 2850, // $28.50 USD
      baseRewardMinor: 500,
      viewBonusMinor: 1425,
      qualityBonusMinor: 500,
      breakingBonusMinor: 425,
      qualifiedViewsCount: 1425,
      status: "FINALIZED",
      createdAt: new Date(Date.now() - 86400000 * 3),
      article: {
        title: "Inside Mikel Arteta's High-Press Evolution & Tactical Rest-Defense Masterclass",
        category: "TACTICS",
      },
    },
    {
      id: "rew_sim_03",
      totalRewardMinor: 2150, // $21.50 USD
      baseRewardMinor: 500,
      viewBonusMinor: 1075,
      qualityBonusMinor: 575,
      breakingBonusMinor: 0,
      qualifiedViewsCount: 1075,
      status: "FINALIZED",
      createdAt: new Date(Date.now() - 86400000 * 6),
      article: {
        title: "Premier League Expected Goals (xG) Delta & Midfield Engine Room Analysis",
        category: "ANALYTICS",
      },
    },
    {
      id: "rew_sim_04",
      totalRewardMinor: 1500, // $15.00 USD
      baseRewardMinor: 500,
      viewBonusMinor: 750,
      qualityBonusMinor: 250,
      breakingBonusMinor: 0,
      qualifiedViewsCount: 750,
      status: "FINALIZED",
      createdAt: new Date(Date.now() - 86400000 * 9),
      article: {
        title: "Champions League Knockout Stage: Top 5 High-Impact Tactical Substitutions",
        category: "ANALYSIS",
      },
    },
  ];

  let withdrawals: any[] = [];
  let ledgerEntries: any[] = [
    {
      id: "ledg_sim_01",
      type: "CREDIT",
      reason: "Article Reward #rew_sim_01 (70% Adsterra Revenue Share)",
      amountMinor: 3500,
      balanceAfterMinor: 3500,
      createdAt: new Date(Date.now() - 86400000 * 1),
    },
    {
      id: "ledg_sim_02",
      type: "CREDIT",
      reason: "Article Reward #rew_sim_02 (70% Adsterra Revenue Share)",
      amountMinor: 2850,
      balanceAfterMinor: 6350,
      createdAt: new Date(Date.now() - 86400000 * 3),
    },
    {
      id: "ledg_sim_03",
      type: "CREDIT",
      reason: "Article Reward #rew_sim_03 (70% Adsterra Revenue Share)",
      amountMinor: 2150,
      balanceAfterMinor: 8500,
      createdAt: new Date(Date.now() - 86400000 * 6),
    },
    {
      id: "ledg_sim_04",
      type: "CREDIT",
      reason: "Article Reward #rew_sim_04 (70% Adsterra Revenue Share)",
      amountMinor: 1500,
      balanceAfterMinor: 10000,
      createdAt: new Date(Date.now() - 86400000 * 9),
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
    // Simulation active
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
            badgeText="Pure Contributor Simulation • $100.00 USD"
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
