-- CreateEnum
CREATE TYPE "CompetitionType" AS ENUM ('LEAGUE', 'CUP', 'INTERNATIONAL');

-- CreateEnum
CREATE TYPE "PlayerPosition" AS ENUM ('GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'ATTACKER');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'LIVE_1H', 'HT', 'LIVE_2H', 'ET', 'PENALTY', 'FINISHED', 'POSTPONED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('GOAL', 'ASSIST', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION', 'VAR', 'PENALTY_MISSED', 'OWN_GOAL');

-- CreateEnum
CREATE TYPE "TransferType" AS ENUM ('PERMANENT', 'LOAN', 'FREE_AGENT');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('RUMOR', 'ADVANCED', 'COMPLETED');

-- CreateTable
CREATE TABLE "competitions" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "CompetitionType" NOT NULL DEFAULT 'LEAGUE',
    "country" TEXT NOT NULL,
    "logoUrl" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competition_seasons" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competition_seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stadiums" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "capacity" INTEGER,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stadiums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "tla" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Global',
    "foundedYear" INTEGER,
    "websiteUrl" TEXT,
    "logoUrl" TEXT,
    "stadiumId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "managers" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "photoUrl" TEXT,
    "teamId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "managers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "position" "PlayerPosition" NOT NULL,
    "shirtNumber" INTEGER,
    "nationality" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "photoUrl" TEXT,
    "teamId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "competitionId" TEXT NOT NULL,
    "seasonId" TEXT,
    "homeTeamId" TEXT NOT NULL,
    "awayTeamId" TEXT NOT NULL,
    "venueId" TEXT,
    "matchDate" TIMESTAMP(3) NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "minute" INTEGER,
    "homeScore" INTEGER NOT NULL DEFAULT 0,
    "awayScore" INTEGER NOT NULL DEFAULT 0,
    "htHomeScore" INTEGER,
    "htAwayScore" INTEGER,
    "round" TEXT,
    "referee" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_events" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "playerId" TEXT,
    "assistPlayerId" TEXT,
    "minute" INTEGER NOT NULL,
    "extraMinute" INTEGER,
    "type" "EventType" NOT NULL,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_lineups" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "formation" TEXT NOT NULL,
    "startersJson" JSONB NOT NULL,
    "benchJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_lineups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "standings" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "played" INTEGER NOT NULL DEFAULT 0,
    "won" INTEGER NOT NULL DEFAULT 0,
    "drawn" INTEGER NOT NULL DEFAULT 0,
    "lost" INTEGER NOT NULL DEFAULT 0,
    "goalsFor" INTEGER NOT NULL DEFAULT 0,
    "goalsAgainst" INTEGER NOT NULL DEFAULT 0,
    "goalDifference" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "form" TEXT NOT NULL DEFAULT 'DDDDD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "standings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_statistics" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "appearances" INTEGER NOT NULL DEFAULT 0,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "yellowCards" INTEGER NOT NULL DEFAULT 0,
    "redCards" INTEGER NOT NULL DEFAULT 0,
    "minutesPlayed" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DECIMAL(3,1) NOT NULL DEFAULT 7.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfers" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "fromTeamId" TEXT,
    "toTeamId" TEXT,
    "feeEur" DECIMAL(14,2),
    "feeDescription" TEXT,
    "transferType" "TransferType" NOT NULL DEFAULT 'PERMANENT',
    "status" "TransferStatus" NOT NULL DEFAULT 'RUMOR',
    "announcementDate" TIMESTAMP(3),
    "contractUntil" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "competitions_externalId_key" ON "competitions"("externalId");
CREATE UNIQUE INDEX "competitions_slug_key" ON "competitions"("slug");
CREATE UNIQUE INDEX "competitions_code_key" ON "competitions"("code");
CREATE INDEX "competitions_code_idx" ON "competitions"("code");
CREATE INDEX "competitions_slug_idx" ON "competitions"("slug");

-- CreateIndex
CREATE INDEX "competition_seasons_competitionId_idx" ON "competition_seasons"("competitionId");
CREATE INDEX "competition_seasons_isCurrent_idx" ON "competition_seasons"("isCurrent");
CREATE UNIQUE INDEX "competition_seasons_competitionId_season_key" ON "competition_seasons"("competitionId", "season");

-- CreateIndex
CREATE INDEX "stadiums_name_idx" ON "stadiums"("name");

-- CreateIndex
CREATE UNIQUE INDEX "teams_externalId_key" ON "teams"("externalId");
CREATE UNIQUE INDEX "teams_slug_key" ON "teams"("slug");
CREATE INDEX "teams_slug_idx" ON "teams"("slug");
CREATE INDEX "teams_tla_idx" ON "teams"("tla");
CREATE INDEX "teams_stadiumId_idx" ON "teams"("stadiumId");

-- CreateIndex
CREATE UNIQUE INDEX "managers_externalId_key" ON "managers"("externalId");
CREATE UNIQUE INDEX "managers_slug_key" ON "managers"("slug");
CREATE UNIQUE INDEX "managers_teamId_key" ON "managers"("teamId");
CREATE INDEX "managers_slug_idx" ON "managers"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "players_externalId_key" ON "players"("externalId");
CREATE UNIQUE INDEX "players_slug_key" ON "players"("slug");
CREATE INDEX "players_slug_idx" ON "players"("slug");
CREATE INDEX "players_teamId_idx" ON "players"("teamId");
CREATE INDEX "players_position_idx" ON "players"("position");

-- CreateIndex
CREATE UNIQUE INDEX "matches_externalId_key" ON "matches"("externalId");
CREATE INDEX "matches_competitionId_idx" ON "matches"("competitionId");
CREATE INDEX "matches_seasonId_idx" ON "matches"("seasonId");
CREATE INDEX "matches_homeTeamId_idx" ON "matches"("homeTeamId");
CREATE INDEX "matches_awayTeamId_idx" ON "matches"("awayTeamId");
CREATE INDEX "matches_matchDate_idx" ON "matches"("matchDate");
CREATE INDEX "matches_status_idx" ON "matches"("status");

-- CreateIndex
CREATE INDEX "match_events_matchId_idx" ON "match_events"("matchId");
CREATE INDEX "match_events_teamId_idx" ON "match_events"("teamId");
CREATE INDEX "match_events_playerId_idx" ON "match_events"("playerId");

-- CreateIndex
CREATE INDEX "match_lineups_matchId_idx" ON "match_lineups"("matchId");
CREATE INDEX "match_lineups_teamId_idx" ON "match_lineups"("teamId");
CREATE UNIQUE INDEX "match_lineups_matchId_teamId_key" ON "match_lineups"("matchId", "teamId");

-- CreateIndex
CREATE INDEX "standings_seasonId_idx" ON "standings"("seasonId");
CREATE INDEX "standings_position_idx" ON "standings"("position");
CREATE UNIQUE INDEX "standings_seasonId_teamId_key" ON "standings"("seasonId", "teamId");

-- CreateIndex
CREATE INDEX "player_statistics_playerId_idx" ON "player_statistics"("playerId");
CREATE INDEX "player_statistics_seasonId_idx" ON "player_statistics"("seasonId");
CREATE UNIQUE INDEX "player_statistics_playerId_seasonId_key" ON "player_statistics"("playerId", "seasonId");

-- CreateIndex
CREATE INDEX "transfers_playerId_idx" ON "transfers"("playerId");
CREATE INDEX "transfers_fromTeamId_idx" ON "transfers"("fromTeamId");
CREATE INDEX "transfers_toTeamId_idx" ON "transfers"("toTeamId");
CREATE INDEX "transfers_status_idx" ON "transfers"("status");
CREATE INDEX "transfers_announcementDate_idx" ON "transfers"("announcementDate");

-- AddForeignKey
ALTER TABLE "competition_seasons" ADD CONSTRAINT "competition_seasons_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "teams" ADD CONSTRAINT "teams_stadiumId_fkey" FOREIGN KEY ("stadiumId") REFERENCES "stadiums"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "managers" ADD CONSTRAINT "managers_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "players" ADD CONSTRAINT "players_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "matches" ADD CONSTRAINT "matches_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "matches" ADD CONSTRAINT "matches_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "competition_seasons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "matches" ADD CONSTRAINT "matches_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "matches" ADD CONSTRAINT "matches_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "matches" ADD CONSTRAINT "matches_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "stadiums"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_assistPlayerId_fkey" FOREIGN KEY ("assistPlayerId") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "match_lineups" ADD CONSTRAINT "match_lineups_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "match_lineups" ADD CONSTRAINT "match_lineups_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "standings" ADD CONSTRAINT "standings_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "competition_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "standings" ADD CONSTRAINT "standings_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "player_statistics" ADD CONSTRAINT "player_statistics_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "player_statistics" ADD CONSTRAINT "player_statistics_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "competition_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_fromTeamId_fkey" FOREIGN KEY ("fromTeamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_toTeamId_fkey" FOREIGN KEY ("toTeamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
