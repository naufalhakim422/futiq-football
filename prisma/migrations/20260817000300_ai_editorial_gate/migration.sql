-- CreateEnum
CREATE TYPE "GateStatus" AS ENUM ('NOT_RUN', 'CHECKING', 'PASSED', 'REVIEW', 'REJECTED');

-- CreateEnum
CREATE TYPE "FindingSeverity" AS ENUM ('PASS', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "FindingCategory" AS ENUM ('ORIGINALITY', 'SIMILARITY', 'EXACT_PHRASE', 'FACT_CHECK', 'CLICKBAIT', 'QUALITY', 'IMAGE_RIGHTS', 'IMAGE_DUPLICATE', 'IMAGE_OCR');

-- AlterTable
ALTER TABLE "articles" ADD COLUMN "gateStatus" "GateStatus" NOT NULL DEFAULT 'NOT_RUN';

-- CreateIndex
CREATE INDEX "articles_gateStatus_idx" ON "articles"("gateStatus");

-- CreateTable
CREATE TABLE "editorial_gate_runs" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "submissionId" TEXT,
    "status" "GateStatus" NOT NULL DEFAULT 'NOT_RUN',
    "overallScore" DECIMAL(5,2) NOT NULL DEFAULT 100.0,
    "originalityScore" DECIMAL(5,2) NOT NULL DEFAULT 100.0,
    "sourceScore" DECIMAL(5,2) NOT NULL DEFAULT 100.0,
    "factScore" DECIMAL(5,2) NOT NULL DEFAULT 100.0,
    "qualityScore" DECIMAL(5,2) NOT NULL DEFAULT 100.0,
    "clickbaitScore" DECIMAL(5,2) NOT NULL DEFAULT 100.0,
    "plagiarismRisk" "FindingSeverity" NOT NULL DEFAULT 'PASS',
    "imageRisk" "FindingSeverity" NOT NULL DEFAULT 'PASS',
    "provider" TEXT NOT NULL DEFAULT 'mock',
    "model" TEXT,
    "summary" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "editorial_gate_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "editorial_findings" (
    "id" TEXT NOT NULL,
    "gateRunId" TEXT NOT NULL,
    "category" "FindingCategory" NOT NULL,
    "severity" "FindingSeverity" NOT NULL,
    "finding" TEXT NOT NULL,
    "evidence" TEXT,
    "sourceUrl" TEXT,
    "sourceTitle" TEXT,
    "matchedText" TEXT,
    "recommendation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "editorial_findings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "editorial_override_logs" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "previousGateStatus" "GateStatus" NOT NULL,
    "newDecision" "ReviewDecision" NOT NULL,
    "reason" TEXT NOT NULL,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "editorial_override_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "editorial_gate_runs_articleId_idx" ON "editorial_gate_runs"("articleId");

-- CreateIndex
CREATE INDEX "editorial_gate_runs_status_idx" ON "editorial_gate_runs"("status");

-- CreateIndex
CREATE INDEX "editorial_findings_gateRunId_idx" ON "editorial_findings"("gateRunId");

-- CreateIndex
CREATE INDEX "editorial_findings_category_idx" ON "editorial_findings"("category");

-- CreateIndex
CREATE INDEX "editorial_findings_severity_idx" ON "editorial_findings"("severity");

-- CreateIndex
CREATE INDEX "editorial_override_logs_articleId_idx" ON "editorial_override_logs"("articleId");

-- CreateIndex
CREATE INDEX "editorial_override_logs_userId_idx" ON "editorial_override_logs"("userId");

-- AddForeignKey
ALTER TABLE "editorial_gate_runs" ADD CONSTRAINT "editorial_gate_runs_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editorial_findings" ADD CONSTRAINT "editorial_findings_gateRunId_fkey" FOREIGN KEY ("gateRunId") REFERENCES "editorial_gate_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editorial_override_logs" ADD CONSTRAINT "editorial_override_logs_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editorial_override_logs" ADD CONSTRAINT "editorial_override_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
