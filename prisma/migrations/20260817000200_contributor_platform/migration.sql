-- CreateEnum
CREATE TYPE "ContributorStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED', 'BANNED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'IN_REVIEW', 'REVISION_REQUIRED', 'REJECTED', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'REVISION_REQUIRED', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReviewDecision" AS ENUM ('APPROVE', 'REQUEST_REVISION', 'REJECT');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('OFFICIAL', 'INTERVIEW', 'PRESS_RELEASE', 'FOOTBALL_DATA', 'NEWS_REPORT', 'SOCIAL', 'OTHER');

-- CreateEnum
CREATE TYPE "ImageRightsStatus" AS ENUM ('OWNED', 'LICENSED', 'OFFICIAL_PRESS', 'PUBLIC_DOMAIN', 'PERMISSION_GRANTED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('APPLICATION_APPROVED', 'APPLICATION_REJECTED', 'ARTICLE_SUBMITTED', 'REVISION_REQUESTED', 'ARTICLE_APPROVED', 'ARTICLE_REJECTED', 'ARTICLE_PUBLISHED');

-- CreateTable
CREATE TABLE "contributor_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "country" TEXT NOT NULL,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "footballInterests" JSONB NOT NULL DEFAULT '[]',
    "socialLinks" JSONB NOT NULL DEFAULT '{}',
    "portfolioUrl" TEXT,
    "status" "ContributorStatus" NOT NULL DEFAULT 'ACTIVE',
    "overallTrustScore" DECIMAL(5,2) NOT NULL DEFAULT 100.0,
    "accuracyScore" DECIMAL(5,2) NOT NULL DEFAULT 100.0,
    "originalityScore" DECIMAL(5,2) NOT NULL DEFAULT 100.0,
    "reliabilityScore" DECIMAL(5,2) NOT NULL DEFAULT 100.0,
    "copyrightScore" DECIMAL(5,2) NOT NULL DEFAULT 100.0,
    "qualityScore" DECIMAL(5,2) NOT NULL DEFAULT 100.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contributor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contributor_applications" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "fullName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "footballInterests" TEXT NOT NULL,
    "preferredCategories" TEXT NOT NULL,
    "shortBio" TEXT NOT NULL,
    "writingExperience" TEXT NOT NULL,
    "portfolioUrl" TEXT,
    "socialUrl" TEXT,
    "agreementAccepted" BOOLEAN NOT NULL DEFAULT true,
    "originalityDeclared" BOOLEAN NOT NULL DEFAULT true,
    "copyrightDeclared" BOOLEAN NOT NULL DEFAULT true,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewerNotes" TEXT,
    "reviewedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contributor_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contributor_agreements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "ipAddress" TEXT,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contributor_agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "excerpt" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "featuredImageUrl" TEXT,
    "featuredImageCaption" TEXT,
    "imageRightsStatus" "ImageRightsStatus" NOT NULL DEFAULT 'UNKNOWN',
    "imageAttribution" TEXT,
    "imageSource" TEXT,
    "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "category" TEXT NOT NULL,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "readTimeMinutes" INTEGER NOT NULL DEFAULT 1,
    "isBreaking" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "contributorProfileId" TEXT,
    "competitionId" TEXT,
    "teamId" TEXT,
    "playerId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_sources" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceType" "SourceType" NOT NULL DEFAULT 'NEWS_REPORT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_revisions" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "revisionNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "metadataSnapshot" JSONB NOT NULL,
    "changeSummary" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_submissions" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "contributorId" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "article_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "editorial_reviews" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "submissionId" TEXT,
    "reviewerId" TEXT NOT NULL,
    "decision" "ReviewDecision" NOT NULL,
    "internalNotes" TEXT,
    "contributorFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "editorial_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contributor_notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "linkUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contributor_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contributor_analytics" (
    "id" TEXT NOT NULL,
    "contributorProfileId" TEXT NOT NULL,
    "articleId" TEXT,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "readTimeMinutesTotal" INTEGER NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contributor_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contributor_profiles_userId_key" ON "contributor_profiles"("userId");
CREATE UNIQUE INDEX "contributor_profiles_slug_key" ON "contributor_profiles"("slug");
CREATE INDEX "contributor_profiles_slug_idx" ON "contributor_profiles"("slug");
CREATE INDEX "contributor_profiles_status_idx" ON "contributor_profiles"("status");

-- CreateIndex
CREATE INDEX "contributor_applications_email_idx" ON "contributor_applications"("email");
CREATE INDEX "contributor_applications_status_idx" ON "contributor_applications"("status");

-- CreateIndex
CREATE INDEX "contributor_agreements_userId_idx" ON "contributor_agreements"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");
CREATE INDEX "articles_slug_idx" ON "articles"("slug");
CREATE INDEX "articles_authorId_idx" ON "articles"("authorId");
CREATE INDEX "articles_status_idx" ON "articles"("status");
CREATE INDEX "articles_category_idx" ON "articles"("category");
CREATE INDEX "articles_publishedAt_idx" ON "articles"("publishedAt");

-- CreateIndex
CREATE INDEX "article_sources_articleId_idx" ON "article_sources"("articleId");

-- CreateIndex
CREATE INDEX "article_revisions_articleId_idx" ON "article_revisions"("articleId");
CREATE UNIQUE INDEX "article_revisions_articleId_revisionNumber_key" ON "article_revisions"("articleId", "revisionNumber");

-- CreateIndex
CREATE INDEX "article_submissions_articleId_idx" ON "article_submissions"("articleId");
CREATE INDEX "article_submissions_contributorId_idx" ON "article_submissions"("contributorId");
CREATE INDEX "article_submissions_status_idx" ON "article_submissions"("status");

-- CreateIndex
CREATE INDEX "editorial_reviews_articleId_idx" ON "editorial_reviews"("articleId");
CREATE INDEX "editorial_reviews_reviewerId_idx" ON "editorial_reviews"("reviewerId");

-- CreateIndex
CREATE INDEX "contributor_notifications_userId_idx" ON "contributor_notifications"("userId");
CREATE INDEX "contributor_notifications_isRead_idx" ON "contributor_notifications"("isRead");

-- CreateIndex
CREATE INDEX "contributor_analytics_contributorProfileId_idx" ON "contributor_analytics"("contributorProfileId");
CREATE INDEX "contributor_analytics_articleId_idx" ON "contributor_analytics"("articleId");

-- AddForeignKey
ALTER TABLE "contributor_profiles" ADD CONSTRAINT "contributor_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributor_applications" ADD CONSTRAINT "contributor_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributor_agreements" ADD CONSTRAINT "contributor_agreements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_contributorProfileId_fkey" FOREIGN KEY ("contributorProfileId") REFERENCES "contributor_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_sources" ADD CONSTRAINT "article_sources_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_revisions" ADD CONSTRAINT "article_revisions_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_submissions" ADD CONSTRAINT "article_submissions_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editorial_reviews" ADD CONSTRAINT "editorial_reviews_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editorial_reviews" ADD CONSTRAINT "editorial_reviews_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "article_submissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "editorial_reviews" ADD CONSTRAINT "editorial_reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributor_notifications" ADD CONSTRAINT "contributor_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributor_analytics" ADD CONSTRAINT "contributor_analytics_contributorProfileId_fkey" FOREIGN KEY ("contributorProfileId") REFERENCES "contributor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributor_analytics" ADD CONSTRAINT "contributor_analytics_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
