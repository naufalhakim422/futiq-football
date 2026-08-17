import { prisma } from "@/lib/db";
import {
  Currency,
  RewardStatus,
  ArticleStatus,
  QualifiedViewStatus,
  FinancialAuditAction,
  NotificationType,
} from "@prisma/client";
import { RewardCalculationResult } from "./types";
import { walletService } from "./wallet.service";
import { fraudDetectionService } from "./fraud-detection.service";
import { financialAuditService } from "./financial-audit.service";

export class RewardEngineService {
  private static instance: RewardEngineService;
  public readonly calculationVersion = "reward_v1";

  // Financial Constants (Integer Minor Units in MYR cents)
  public readonly BASE_ARTICLE_REWARD_MINOR = 500; // RM 5.00
  public readonly VIEW_BONUS_RATE_PER_VIEW_MINOR = 2; // RM 2.00 per 100 views (2 cents/view)
  public readonly QUALITY_BONUS_TIER_1_MINOR = 500; // Score >= 90: RM 5.00
  public readonly QUALITY_BONUS_TIER_2_MINOR = 250; // Score >= 80: RM 2.50
  public readonly BREAKING_NEWS_BONUS_MINOR = 1000; // RM 10.00

  private constructor() {}

  public static getInstance(): RewardEngineService {
    if (!RewardEngineService.instance) {
      RewardEngineService.instance = new RewardEngineService();
    }
    return RewardEngineService.instance;
  }

  /**
   * Preview reward calculation for an article (read-only, does not mutate financial state)
   */
  public async previewReward(articleId: string): Promise<RewardCalculationResult> {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        contributorProfile: true,
        gateRuns: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    if (!article || !article.contributorProfileId) {
      throw new Error("Article not found or not associated with a contributor profile.");
    }

    // 1. Qualified Views Count
    const qualifiedViewsCount = await prisma.qualifiedView.count({
      where: {
        articleId,
        status: QualifiedViewStatus.QUALIFIED,
      },
    });

    // 2. Gate Quality Score
    const latestGateRun = article.gateRuns[0];
    const qualityScore = latestGateRun ? Number(latestGateRun.overallScore) : 100;

    // 3. Compute Formula Parts
    const baseRewardMinor = this.BASE_ARTICLE_REWARD_MINOR;
    const viewBonusMinor = qualifiedViewsCount * this.VIEW_BONUS_RATE_PER_VIEW_MINOR;

    let qualityBonusMinor = 0;
    if (qualityScore >= 90) {
      qualityBonusMinor = this.QUALITY_BONUS_TIER_1_MINOR;
    } else if (qualityScore >= 80) {
      qualityBonusMinor = this.QUALITY_BONUS_TIER_2_MINOR;
    }

    const breakingBonusMinor = article.isBreaking ? this.BREAKING_NEWS_BONUS_MINOR : 0;
    const totalRewardMinor = baseRewardMinor + viewBonusMinor + qualityBonusMinor + breakingBonusMinor;

    return {
      articleId: article.id,
      contributorProfileId: article.contributorProfileId,
      baseRewardMinor,
      viewBonusMinor,
      qualityBonusMinor,
      breakingBonusMinor,
      totalRewardMinor,
      qualifiedViewsCount,
      qualityScore,
      currency: Currency.MYR,
      calculationVersion: this.calculationVersion,
      metadata: {
        isBreaking: article.isBreaking,
        publishedAt: article.publishedAt,
        qualityScore,
      },
    };
  }

  /**
   * Finalize reward calculation and credit contributor's wallet in a single atomic transaction
   */
  public async finalizeReward(articleId: string, actorId?: string) {
    // 1. Check if existing finalized reward already exists (Idempotency Guarantee)
    const existing = await prisma.contributorReward.findFirst({
      where: {
        articleId,
        calculationVersion: this.calculationVersion,
        status: RewardStatus.FINALIZED,
      },
      include: { qualifiedViews: true },
    });

    if (existing) {
      return { reward: existing, isIdempotentReplay: true };
    }

    // 2. Fetch article and check publication/approval status
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        contributorProfile: { select: { id: true, userId: true } },
        gateRuns: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    if (!article || !article.contributorProfileId) {
      throw new Error("Article not found or not associated with a contributor profile.");
    }

    if (article.status !== ArticleStatus.PUBLISHED && article.status !== ArticleStatus.APPROVED) {
      throw new Error(
        `Cannot finalize reward for article in "${article.status}" state. Article must be APPROVED or PUBLISHED.`
      );
    }

    // 3. Fraud Risk Check
    const risk = await fraudDetectionService.evaluateContributorRisk(article.contributorProfileId);
    if (risk.isBlockedForPayout) {
      throw new Error("Reward finalization halted due to active contributor risk review.");
    }

    // 4. Compute Authoritative Reward
    const calculation = await this.previewReward(articleId);

    // 5. Atomic Transaction: Create Reward + Credit Wallet + Update Qualified Views + Audit Log
    return await prisma.$transaction(async (tx) => {
      // Find or create wallet
      let wallet = await tx.wallet.findUnique({
        where: { contributorProfileId: article.contributorProfileId! },
      });

      if (!wallet) {
        wallet = await tx.wallet.create({
          data: {
            contributorProfileId: article.contributorProfileId!,
            availableBalanceMinor: 0,
            heldBalanceMinor: 0,
            lifetimeEarningsMinor: 0,
            lifetimeWithdrawnMinor: 0,
            currency: Currency.MYR,
          },
        });
      }

      // Create ContributorReward
      const reward = await tx.contributorReward.create({
        data: {
          contributorProfileId: article.contributorProfileId!,
          articleId: article.id,
          baseRewardMinor: calculation.baseRewardMinor,
          viewBonusMinor: calculation.viewBonusMinor,
          qualityBonusMinor: calculation.qualityBonusMinor,
          breakingBonusMinor: calculation.breakingBonusMinor,
          totalRewardMinor: calculation.totalRewardMinor,
          qualifiedViewsCount: calculation.qualifiedViewsCount,
          qualityScore: calculation.qualityScore,
          currency: calculation.currency,
          status: RewardStatus.FINALIZED,
          calculationVersion: calculation.calculationVersion,
          calculationMetadata: calculation.metadata,
          finalizedAt: new Date(),
        },
      });

      // Link unaggregated qualified views to this reward
      await tx.qualifiedView.updateMany({
        where: {
          articleId: article.id,
          status: QualifiedViewStatus.QUALIFIED,
          rewardId: null,
        },
        data: { rewardId: reward.id },
      });

      // Credit Wallet with double-entry ledger
      const balanceBefore = wallet.availableBalanceMinor;
      const balanceAfter = balanceBefore + calculation.totalRewardMinor;

      await tx.walletLedgerEntry.create({
        data: {
          walletId: wallet.id,
          type: "CREDIT",
          amountMinor: calculation.totalRewardMinor,
          currency: wallet.currency,
          balanceBeforeMinor: balanceBefore,
          balanceAfterMinor: balanceAfter,
          referenceId: reward.id,
          referenceType: "REWARD",
          reason: `Article Reward for "${article.title.slice(0, 60)}" (v1)`,
          actorId: actorId || null,
          rewardId: reward.id,
        },
      });

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalanceMinor: balanceAfter,
          lifetimeEarningsMinor: wallet.lifetimeEarningsMinor + calculation.totalRewardMinor,
        },
      });

      // Audit Log
      await tx.financialAuditLog.create({
        data: {
          action: FinancialAuditAction.REWARD_FINALIZED,
          actorId: actorId || null,
          contributorProfileId: article.contributorProfileId,
          entityType: "REWARD",
          entityId: reward.id,
          amountMinor: calculation.totalRewardMinor,
          currency: wallet.currency,
          newState: {
            rewardId: reward.id,
            totalRewardMinor: calculation.totalRewardMinor,
            articleId: article.id,
          },
          reason: `Finalized reward for article "${article.title.slice(0, 50)}"`,
        },
      });

      // Send Contributor Notification
      if (article.contributorProfile?.userId) {
        await tx.contributorNotification.create({
          data: {
            userId: article.contributorProfile.userId,
            type: NotificationType.REWARD_FINALIZED,
            title: "Article Reward Finalized",
            message: `You earned RM ${(calculation.totalRewardMinor / 100).toFixed(2)} for your article "${
              article.title
            }". Funds have been credited to your wallet.`,
            linkUrl: "/contributor/earnings",
          },
        });
      }

      return { reward, isIdempotentReplay: false };
    });
  }

  /**
   * Get contributor rewards history
   */
  public async getContributorRewards(contributorProfileId: string) {
    return await prisma.contributorReward.findMany({
      where: { contributorProfileId },
      include: {
        article: {
          select: { id: true, title: true, slug: true, category: true, publishedAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const rewardEngineService = RewardEngineService.getInstance();
