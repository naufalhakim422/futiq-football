-- AlterEnum
ALTER TYPE "WithdrawalStatus" ADD VALUE IF NOT EXISTS 'RISK_CHECKING';
ALTER TYPE "WithdrawalStatus" ADD VALUE IF NOT EXISTS 'AUTO_APPROVED';
ALTER TYPE "WithdrawalStatus" ADD VALUE IF NOT EXISTS 'MANUAL_REVIEW';
ALTER TYPE "WithdrawalStatus" ADD VALUE IF NOT EXISTS 'FAILED';
ALTER TYPE "WithdrawalStatus" ADD VALUE IF NOT EXISTS 'RETRY_PENDING';

-- AlterEnum
ALTER TYPE "PayoutStatus" ADD VALUE IF NOT EXISTS 'REVERSED';
ALTER TYPE "PayoutStatus" ADD VALUE IF NOT EXISTS 'RECONCILIATION_REQUIRED';

-- AlterEnum
ALTER TYPE "FinancialAuditAction" ADD VALUE IF NOT EXISTS 'AUTO_PAYOUT_TRIGGERED';
ALTER TYPE "FinancialAuditAction" ADD VALUE IF NOT EXISTS 'PAYOUT_RECONCILED';
ALTER TYPE "FinancialAuditAction" ADD VALUE IF NOT EXISTS 'PAYOUT_REVERSED';
ALTER TYPE "FinancialAuditAction" ADD VALUE IF NOT EXISTS 'WEBHOOK_RECEIVED';
ALTER TYPE "FinancialAuditAction" ADD VALUE IF NOT EXISTS 'POLICY_UPDATED';

-- CreateEnum
CREATE TYPE "AdPlacementPosition" AS ENUM ('HOME_TOP', 'HOME_HERO', 'HOME_MIDDLE', 'HOME_BOTTOM', 'ARTICLE_TOP', 'ARTICLE_AFTER_P3', 'ARTICLE_AFTER_P5', 'ARTICLE_MIDDLE', 'ARTICLE_BOTTOM', 'MOBILE_STICKY');

-- CreateEnum
CREATE TYPE "AdSlotStatus" AS ENUM ('ACTIVE', 'PAUSED', 'DRAFT', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AnalyticsEventType" AS ENUM ('PAGE_VIEW', 'ARTICLE_VIEW', 'ARTICLE_READ', 'SCROLL_DEPTH', 'SESSION_START', 'AD_IMPRESSION', 'AD_CLICK');

-- CreateEnum
CREATE TYPE "RevenueStatus" AS ENUM ('ESTIMATED', 'IMPORTED', 'CONFIRMED');

-- CreateTable
CREATE TABLE "payout_policies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'default_policy',
    "minimumWithdrawalMinor" INTEGER NOT NULL DEFAULT 2000,
    "maxAutomaticWithdrawalMinor" INTEGER NOT NULL DEFAULT 50000,
    "maxDailyWithdrawalMinor" INTEGER NOT NULL DEFAULT 200000,
    "maxMonthlyWithdrawalMinor" INTEGER NOT NULL DEFAULT 1000000,
    "autoPayoutMaxRiskScore" INTEGER NOT NULL DEFAULT 29,
    "payoutCooldownHours" INTEGER NOT NULL DEFAULT 48,
    "isAutoPayoutEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payout_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payout_webhook_events" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "signature" TEXT,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "errorDetails" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payout_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payout_reconciliations" (
    "id" TEXT NOT NULL,
    "payoutId" TEXT,
    "withdrawalRequestId" TEXT,
    "provider" TEXT NOT NULL,
    "providerReference" TEXT,
    "internalStatus" "PayoutStatus" NOT NULL,
    "providerStatus" TEXT NOT NULL,
    "internalAmountMinor" INTEGER NOT NULL,
    "providerAmountMinor" INTEGER NOT NULL,
    "isMatched" BOOLEAN NOT NULL DEFAULT false,
    "discrepancyType" TEXT,
    "notes" TEXT,
    "resolvedByUserId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payout_reconciliations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_providers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "adapterKey" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ad_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_placements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slotKey" TEXT NOT NULL,
    "position" "AdPlacementPosition" NOT NULL,
    "providerId" TEXT NOT NULL,
    "status" "AdSlotStatus" NOT NULL DEFAULT 'ACTIVE',
    "device" TEXT NOT NULL DEFAULT 'ALL',
    "targetCategory" TEXT,
    "targetTeamSlug" TEXT,
    "targetCompetitionCode" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "customMarkupSafe" TEXT,
    "targetUrl" TEXT,
    "impressionsCount" INTEGER NOT NULL DEFAULT 0,
    "clicksCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ad_placements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_schedules" (
    "id" TEXT NOT NULL,
    "adPlacementId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ad_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_daily_aggregates" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "pageViewsCount" INTEGER NOT NULL DEFAULT 0,
    "uniqueVisitorsCount" INTEGER NOT NULL DEFAULT 0,
    "articleReadsCount" INTEGER NOT NULL DEFAULT 0,
    "adImpressionsCount" INTEGER NOT NULL DEFAULT 0,
    "adClicksCount" INTEGER NOT NULL DEFAULT 0,
    "estimatedRevenueMinor" INTEGER NOT NULL DEFAULT 0,
    "revenueStatus" "RevenueStatus" NOT NULL DEFAULT 'ESTIMATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analytics_daily_aggregates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_analytics" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "readsCount" INTEGER NOT NULL DEFAULT 0,
    "avgScrollDepth" INTEGER NOT NULL DEFAULT 0,
    "avgReadTimeSeconds" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_analytics" (
    "id" TEXT NOT NULL,
    "adPlacementId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "estimatedRevenueMinor" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ad_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payout_policies_name_key" ON "payout_policies"("name");

-- CreateIndex
CREATE UNIQUE INDEX "payout_webhook_events_provider_eventId_key" ON "payout_webhook_events"("provider", "eventId");
CREATE INDEX "payout_webhook_events_provider_isProcessed_idx" ON "payout_webhook_events"("provider", "isProcessed");

-- CreateIndex
CREATE INDEX "payout_reconciliations_isMatched_idx" ON "payout_reconciliations"("isMatched");
CREATE INDEX "payout_reconciliations_payoutId_idx" ON "payout_reconciliations"("payoutId");

-- CreateIndex
CREATE UNIQUE INDEX "ad_providers_name_key" ON "ad_providers"("name");
CREATE UNIQUE INDEX "ad_providers_slug_key" ON "ad_providers"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ad_placements_slotKey_key" ON "ad_placements"("slotKey");
CREATE INDEX "ad_placements_position_status_idx" ON "ad_placements"("position", "status");
CREATE INDEX "ad_placements_slotKey_idx" ON "ad_placements"("slotKey");

-- CreateIndex
CREATE INDEX "ad_schedules_adPlacementId_isActive_idx" ON "ad_schedules"("adPlacementId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_daily_aggregates_date_key" ON "analytics_daily_aggregates"("date");
CREATE INDEX "analytics_daily_aggregates_date_idx" ON "analytics_daily_aggregates"("date");

-- CreateIndex
CREATE UNIQUE INDEX "article_analytics_articleId_date_key" ON "article_analytics"("articleId", "date");
CREATE INDEX "article_analytics_articleId_idx" ON "article_analytics"("articleId");
CREATE INDEX "article_analytics_date_idx" ON "article_analytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "ad_analytics_adPlacementId_date_key" ON "ad_analytics"("adPlacementId", "date");
CREATE INDEX "ad_analytics_adPlacementId_idx" ON "ad_analytics"("adPlacementId");
CREATE INDEX "ad_analytics_date_idx" ON "ad_analytics"("date");

-- AddForeignKey
ALTER TABLE "ad_placements" ADD CONSTRAINT "ad_placements_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ad_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_schedules" ADD CONSTRAINT "ad_schedules_adPlacementId_fkey" FOREIGN KEY ("adPlacementId") REFERENCES "ad_placements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_analytics" ADD CONSTRAINT "article_analytics_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_analytics" ADD CONSTRAINT "ad_analytics_adPlacementId_fkey" FOREIGN KEY ("adPlacementId") REFERENCES "ad_placements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
