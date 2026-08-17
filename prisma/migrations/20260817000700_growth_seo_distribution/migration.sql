-- CreateTable
CREATE TABLE "user_favorite_teams" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_favorite_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_favorite_players" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_favorite_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_favorite_competitions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_favorite_competitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "breakingNews" BOOLEAN NOT NULL DEFAULT true,
    "transfers" BOOLEAN NOT NULL DEFAULT true,
    "matchResults" BOOLEAN NOT NULL DEFAULT true,
    "favoriteClubs" BOOLEAN NOT NULL DEFAULT true,
    "articlePublished" BOOLEAN NOT NULL DEFAULT true,
    "financialPayouts" BOOLEAN NOT NULL DEFAULT true,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "inAppNotifications" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "url_redirects" (
    "id" TEXT NOT NULL,
    "sourcePath" TEXT NOT NULL,
    "targetPath" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL DEFAULT 301,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "lastHitAt" TIMESTAMP(3),
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "url_redirects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_trend_scores" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "score" DECIMAL(10,4) NOT NULL DEFAULT 0.0,
    "recencyScore" DECIMAL(10,4) NOT NULL DEFAULT 0.0,
    "engagementScore" DECIMAL(10,4) NOT NULL DEFAULT 0.0,
    "qualifiedReadScore" DECIMAL(10,4) NOT NULL DEFAULT 0.0,
    "shareScore" DECIMAL(10,4) NOT NULL DEFAULT 0.0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_trend_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_global_settings" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL DEFAULT 'Football Media Platform',
    "defaultTitle" TEXT NOT NULL DEFAULT 'Football Media Platform | Live Scores, News & Tactical Analysis',
    "defaultDescription" TEXT NOT NULL DEFAULT 'Comprehensive football journalism, live scores, tactical insights, and real-time transfer news.',
    "canonicalDomain" TEXT NOT NULL DEFAULT 'https://football.example.com',
    "defaultOgImageUrl" TEXT NOT NULL DEFAULT '/images/og-default.jpg',
    "twitterHandle" TEXT NOT NULL DEFAULT '@footballmedia',
    "googleSiteVerification" TEXT,
    "isDiscoverOptimized" BOOLEAN NOT NULL DEFAULT true,
    "updatedByUserId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_global_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_favorite_teams_userId_teamId_key" ON "user_favorite_teams"("userId", "teamId");
CREATE INDEX "user_favorite_teams_userId_idx" ON "user_favorite_teams"("userId");
CREATE INDEX "user_favorite_teams_teamId_idx" ON "user_favorite_teams"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "user_favorite_players_userId_playerId_key" ON "user_favorite_players"("userId", "playerId");
CREATE INDEX "user_favorite_players_userId_idx" ON "user_favorite_players"("userId");
CREATE INDEX "user_favorite_players_playerId_idx" ON "user_favorite_players"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "user_favorite_competitions_userId_competitionId_key" ON "user_favorite_competitions"("userId", "competitionId");
CREATE INDEX "user_favorite_competitions_userId_idx" ON "user_favorite_competitions"("userId");
CREATE INDEX "user_favorite_competitions_competitionId_idx" ON "user_favorite_competitions"("competitionId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_key" ON "notification_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "url_redirects_sourcePath_key" ON "url_redirects"("sourcePath");
CREATE INDEX "url_redirects_sourcePath_isActive_idx" ON "url_redirects"("sourcePath", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "article_trend_scores_articleId_key" ON "article_trend_scores"("articleId");
CREATE INDEX "article_trend_scores_score_idx" ON "article_trend_scores"("score");

-- AddForeignKey
ALTER TABLE "user_favorite_teams" ADD CONSTRAINT "user_favorite_teams_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_favorite_teams" ADD CONSTRAINT "user_favorite_teams_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorite_players" ADD CONSTRAINT "user_favorite_players_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_favorite_players" ADD CONSTRAINT "user_favorite_players_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorite_competitions" ADD CONSTRAINT "user_favorite_competitions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_favorite_competitions" ADD CONSTRAINT "user_favorite_competitions_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_trend_scores" ADD CONSTRAINT "article_trend_scores_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
