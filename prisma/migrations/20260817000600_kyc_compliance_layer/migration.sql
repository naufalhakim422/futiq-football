-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'KYC_SUBMITTED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'KYC_VERIFIED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'KYC_REJECTED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'KYC_EXPIRED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'KYC_REVERIFICATION_REQUIRED';

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('NOT_STARTED', 'PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'EXPIRED', 'REVERIFICATION_REQUIRED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "KycVerificationLevel" AS ENUM ('STANDARD', 'ENHANCED');

-- CreateTable
CREATE TABLE "kyc_verifications" (
    "id" TEXT NOT NULL,
    "contributorProfileId" TEXT NOT NULL,
    "status" "KycStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "verificationLevel" "KycVerificationLevel" NOT NULL DEFAULT 'STANDARD',
    "provider" TEXT NOT NULL DEFAULT 'mock-kyc-provider',
    "providerCustomerId" TEXT,
    "providerVerificationId" TEXT,
    "country" TEXT,
    "rejectionReasonCode" TEXT,
    "rejectionDetails" TEXT,
    "complianceNotes" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "lastCheckedAt" TIMESTAMP(3),
    "complianceHold" BOOLEAN NOT NULL DEFAULT false,
    "complianceHoldReason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kyc_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyc_audit_logs" (
    "id" TEXT NOT NULL,
    "kycVerificationId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorId" TEXT,
    "previousStatus" "KycStatus",
    "newStatus" "KycStatus" NOT NULL,
    "reason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kyc_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyc_webhook_events" (
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

    CONSTRAINT "kyc_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kyc_verifications_contributorProfileId_key" ON "kyc_verifications"("contributorProfileId");
CREATE INDEX "kyc_verifications_status_idx" ON "kyc_verifications"("status");
CREATE INDEX "kyc_verifications_providerCustomerId_idx" ON "kyc_verifications"("providerCustomerId");

-- CreateIndex
CREATE INDEX "kyc_audit_logs_kycVerificationId_idx" ON "kyc_audit_logs"("kycVerificationId");
CREATE INDEX "kyc_audit_logs_action_idx" ON "kyc_audit_logs"("action");

-- CreateIndex
CREATE UNIQUE INDEX "kyc_webhook_events_provider_eventId_key" ON "kyc_webhook_events"("provider", "eventId");
CREATE INDEX "kyc_webhook_events_provider_isProcessed_idx" ON "kyc_webhook_events"("provider", "isProcessed");

-- AddForeignKey
ALTER TABLE "kyc_verifications" ADD CONSTRAINT "kyc_verifications_contributorProfileId_fkey" FOREIGN KEY ("contributorProfileId") REFERENCES "contributor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_audit_logs" ADD CONSTRAINT "kyc_audit_logs_kycVerificationId_fkey" FOREIGN KEY ("kycVerificationId") REFERENCES "kyc_verifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
