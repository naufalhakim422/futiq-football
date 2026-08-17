-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('MYR', 'USD', 'GBP', 'EUR');

-- CreateEnum
CREATE TYPE "QualifiedViewStatus" AS ENUM ('PENDING', 'QUALIFIED', 'REJECTED', 'SUSPICIOUS');

-- CreateEnum
CREATE TYPE "RewardStatus" AS ENUM ('PENDING', 'CALCULATED', 'FINALIZED', 'CANCELLED', 'REVERSED');

-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('CREDIT', 'DEBIT', 'REVERSAL', 'ADJUSTMENT', 'WITHDRAWAL_HOLD', 'WITHDRAWAL_RELEASE', 'PAYOUT');

-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING_REVIEW', 'WITHDRAWAL_HOLD', 'APPROVED', 'PROCESSING', 'PAID', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'PROCESSING', 'PAID', 'FAILED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PayoutAttemptStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "FraudSignalSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "FraudSignalType" AS ENUM ('HIGH_VIEW_VELOCITY', 'REPEATED_SESSION', 'BOT_PATTERN', 'DATACENTER_PATTERN', 'SUSPICIOUS_USER_AGENT', 'MULTIPLE_ACCOUNTS_PATTERN', 'ABNORMAL_COUNTRY_PATTERN', 'REFRESH_ABUSE', 'AUTOMATED_TRAFFIC');

-- CreateEnum
CREATE TYPE "FinancialAuditAction" AS ENUM ('REWARD_CALCULATED', 'REWARD_FINALIZED', 'WALLET_CREDIT', 'WITHDRAWAL_REQUESTED', 'WITHDRAWAL_APPROVED', 'WITHDRAWAL_REJECTED', 'WITHDRAWAL_CANCELLED', 'PAYOUT_CREATED', 'PAYOUT_PROCESSING', 'PAYOUT_PAID', 'PAYOUT_FAILED', 'ADJUSTMENT_CREATED', 'FRAUD_FLAGGED', 'PAYOUT_ACCOUNT_UPDATED');

-- AlterEnum
ALTER TYPE "RoleType" ADD VALUE IF NOT EXISTS 'FINANCE';

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'REWARD_FINALIZED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'WITHDRAWAL_REQUESTED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'WITHDRAWAL_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'WITHDRAWAL_REJECTED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PAYOUT_SENT';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PAYOUT_FAILED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'FRAUD_ALERT';

-- CreateTable
CREATE TABLE "qualified_views" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "contributorProfileId" TEXT NOT NULL,
    "sessionFingerprint" TEXT NOT NULL,
    "ipHash" TEXT,
    "userAgentHash" TEXT,
    "status" "QualifiedViewStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "readTimeSeconds" INTEGER NOT NULL DEFAULT 0,
    "scrollDepthPercent" INTEGER NOT NULL DEFAULT 0,
    "isBot" BOOLEAN NOT NULL DEFAULT false,
    "rewardId" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qualified_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contributor_rewards" (
    "id" TEXT NOT NULL,
    "contributorProfileId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "baseRewardMinor" INTEGER NOT NULL DEFAULT 0,
    "viewBonusMinor" INTEGER NOT NULL DEFAULT 0,
    "qualityBonusMinor" INTEGER NOT NULL DEFAULT 0,
    "breakingBonusMinor" INTEGER NOT NULL DEFAULT 0,
    "totalRewardMinor" INTEGER NOT NULL DEFAULT 0,
    "qualifiedViewsCount" INTEGER NOT NULL DEFAULT 0,
    "qualityScore" DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    "currency" "Currency" NOT NULL DEFAULT 'MYR',
    "status" "RewardStatus" NOT NULL DEFAULT 'PENDING',
    "calculationVersion" TEXT NOT NULL DEFAULT 'reward_v1',
    "calculationMetadata" JSONB,
    "finalizedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contributor_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "contributorProfileId" TEXT NOT NULL,
    "availableBalanceMinor" INTEGER NOT NULL DEFAULT 0,
    "heldBalanceMinor" INTEGER NOT NULL DEFAULT 0,
    "lifetimeEarningsMinor" INTEGER NOT NULL DEFAULT 0,
    "lifetimeWithdrawnMinor" INTEGER NOT NULL DEFAULT 0,
    "currency" "Currency" NOT NULL DEFAULT 'MYR',
    "payoutBankName" TEXT,
    "payoutAccountNumberMasked" TEXT,
    "payoutAccountHolderName" TEXT,
    "payoutAccountUpdatedAt" TIMESTAMP(3),
    "payoutCooldownUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_ledger_entries" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" "LedgerEntryType" NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'MYR',
    "balanceBeforeMinor" INTEGER NOT NULL,
    "balanceAfterMinor" INTEGER NOT NULL,
    "referenceId" TEXT,
    "referenceType" TEXT,
    "reason" TEXT NOT NULL,
    "actorId" TEXT,
    "rewardId" TEXT,
    "withdrawalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdrawal_requests" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "contributorProfileId" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'MYR',
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "idempotencyKey" TEXT,
    "rejectionReason" TEXT,
    "bankName" TEXT NOT NULL,
    "accountNumberMasked" TEXT NOT NULL,
    "accountHolderName" TEXT NOT NULL,
    "reviewedByUserId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "withdrawal_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" TEXT NOT NULL,
    "withdrawalRequestId" TEXT NOT NULL,
    "contributorProfileId" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'MYR',
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "provider" TEXT NOT NULL DEFAULT 'mock',
    "providerReference" TEXT,
    "approvedByUserId" TEXT,
    "processedByUserId" TEXT,
    "failureReason" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payout_attempts" (
    "id" TEXT NOT NULL,
    "payoutId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "provider" TEXT NOT NULL DEFAULT 'mock',
    "providerReference" TEXT,
    "amountMinor" INTEGER NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'MYR',
    "status" "PayoutAttemptStatus" NOT NULL DEFAULT 'PENDING',
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payout_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fraud_signals" (
    "id" TEXT NOT NULL,
    "contributorProfileId" TEXT NOT NULL,
    "articleId" TEXT,
    "signalType" "FraudSignalType" NOT NULL,
    "severity" "FraudSignalSeverity" NOT NULL DEFAULT 'LOW',
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "evidence" TEXT NOT NULL,
    "metadata" JSONB,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedByUserId" TEXT,
    "resolutionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fraud_signals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_audit_logs" (
    "id" TEXT NOT NULL,
    "action" "FinancialAuditAction" NOT NULL,
    "actorId" TEXT,
    "contributorProfileId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "amountMinor" INTEGER,
    "currency" "Currency" DEFAULT 'MYR',
    "previousState" JSONB,
    "newState" JSONB,
    "reason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "financial_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "qualified_views_articleId_status_idx" ON "qualified_views"("articleId", "status");
CREATE INDEX "qualified_views_contributorProfileId_status_idx" ON "qualified_views"("contributorProfileId", "status");
CREATE INDEX "qualified_views_sessionFingerprint_articleId_idx" ON "qualified_views"("sessionFingerprint", "articleId");
CREATE INDEX "qualified_views_viewedAt_idx" ON "qualified_views"("viewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "contributor_rewards_contributorProfileId_articleId_calculationVersion_key" ON "contributor_rewards"("contributorProfileId", "articleId", "calculationVersion");
CREATE INDEX "contributor_rewards_contributorProfileId_status_idx" ON "contributor_rewards"("contributorProfileId", "status");
CREATE INDEX "contributor_rewards_articleId_idx" ON "contributor_rewards"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_contributorProfileId_key" ON "wallets"("contributorProfileId");
CREATE INDEX "wallets_contributorProfileId_idx" ON "wallets"("contributorProfileId");

-- CreateIndex
CREATE INDEX "wallet_ledger_entries_walletId_createdAt_idx" ON "wallet_ledger_entries"("walletId", "createdAt");
CREATE INDEX "wallet_ledger_entries_referenceId_idx" ON "wallet_ledger_entries"("referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "withdrawal_requests_idempotencyKey_key" ON "withdrawal_requests"("idempotencyKey");
CREATE INDEX "withdrawal_requests_walletId_idx" ON "withdrawal_requests"("walletId");
CREATE INDEX "withdrawal_requests_contributorProfileId_status_idx" ON "withdrawal_requests"("contributorProfileId", "status");
CREATE INDEX "withdrawal_requests_status_idx" ON "withdrawal_requests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payouts_withdrawalRequestId_key" ON "payouts"("withdrawalRequestId");
CREATE INDEX "payouts_contributorProfileId_status_idx" ON "payouts"("contributorProfileId", "status");
CREATE INDEX "payouts_status_idx" ON "payouts"("status");

-- CreateIndex
CREATE INDEX "payout_attempts_payoutId_idx" ON "payout_attempts"("payoutId");

-- CreateIndex
CREATE INDEX "fraud_signals_contributorProfileId_isResolved_idx" ON "fraud_signals"("contributorProfileId", "isResolved");
CREATE INDEX "fraud_signals_severity_idx" ON "fraud_signals"("severity");

-- CreateIndex
CREATE INDEX "financial_audit_logs_action_idx" ON "financial_audit_logs"("action");
CREATE INDEX "financial_audit_logs_actorId_idx" ON "financial_audit_logs"("actorId");
CREATE INDEX "financial_audit_logs_contributorProfileId_idx" ON "financial_audit_logs"("contributorProfileId");
CREATE INDEX "financial_audit_logs_entityType_entityId_idx" ON "financial_audit_logs"("entityType", "entityId");
CREATE INDEX "financial_audit_logs_createdAt_idx" ON "financial_audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "qualified_views" ADD CONSTRAINT "qualified_views_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "qualified_views" ADD CONSTRAINT "qualified_views_contributorProfileId_fkey" FOREIGN KEY ("contributorProfileId") REFERENCES "contributor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "qualified_views" ADD CONSTRAINT "qualified_views_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "contributor_rewards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributor_rewards" ADD CONSTRAINT "contributor_rewards_contributorProfileId_fkey" FOREIGN KEY ("contributorProfileId") REFERENCES "contributor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "contributor_rewards" ADD CONSTRAINT "contributor_rewards_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_contributorProfileId_fkey" FOREIGN KEY ("contributorProfileId") REFERENCES "contributor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_ledger_entries" ADD CONSTRAINT "wallet_ledger_entries_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "wallet_ledger_entries" ADD CONSTRAINT "wallet_ledger_entries_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "contributor_rewards"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "wallet_ledger_entries" ADD CONSTRAINT "wallet_ledger_entries_withdrawalId_fkey" FOREIGN KEY ("withdrawalId") REFERENCES "withdrawal_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_contributorProfileId_fkey" FOREIGN KEY ("contributorProfileId") REFERENCES "contributor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_withdrawalRequestId_fkey" FOREIGN KEY ("withdrawalRequestId") REFERENCES "withdrawal_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_contributorProfileId_fkey" FOREIGN KEY ("contributorProfileId") REFERENCES "contributor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payout_attempts" ADD CONSTRAINT "payout_attempts_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "payouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fraud_signals" ADD CONSTRAINT "fraud_signals_contributorProfileId_fkey" FOREIGN KEY ("contributorProfileId") REFERENCES "contributor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "fraud_signals" ADD CONSTRAINT "fraud_signals_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_audit_logs" ADD CONSTRAINT "financial_audit_logs_contributorProfileId_fkey" FOREIGN KEY ("contributorProfileId") REFERENCES "contributor_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
