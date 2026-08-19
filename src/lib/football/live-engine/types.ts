import {
  MatchStatus,
  EventType,
  PlayerPosition,
  ProviderMatchEvent,
  ProviderMatchLineup,
  LineupPlayer,
  ProviderStanding,
  ProviderH2HSummary,
  ProviderStadium,
} from "@/lib/football/types";

// ==========================================
// 1. DATA FRESHNESS & MATCH PRIORITY TIERS
// ==========================================

export type DataFreshness = "FRESH" | "DELAYED" | "STALE";

export type MatchPriorityTier =
  | "UPCOMING"
  | "LIVE"
  | "HALFTIME"
  | "EXTRA_TIME"
  | "PENALTY"
  | "FINISHED"
  | "POSTPONED"
  | "CANCELLED";

export function getMatchPriorityTier(status: MatchStatus): MatchPriorityTier {
  switch (status) {
    case MatchStatus.LIVE_1H:
    case MatchStatus.LIVE_2H:
      return "LIVE";
    case MatchStatus.HT:
      return "HALFTIME";
    case MatchStatus.ET:
      return "EXTRA_TIME";
    case MatchStatus.PENALTY:
      return "PENALTY";
    case MatchStatus.FINISHED:
      return "FINISHED";
    case MatchStatus.POSTPONED:
      return "POSTPONED";
    case MatchStatus.CANCELLED:
      return "CANCELLED";
    case MatchStatus.SCHEDULED:
    default:
      return "UPCOMING";
  }
}

// ==========================================
// 2. GRANULAR CACHE ENVELOPE CONTRACT
// ==========================================

export interface CacheEnvelope<T> {
  fixtureId: string;
  data: T;
  status: MatchStatus;
  dataVersion: number;
  fetchedAt: string; // ISO 8601
  providerUpdatedAt?: string; // ISO 8601
  expiresAt: string; // ISO 8601
  isStale: boolean;
  freshness: DataFreshness;
}

// Granular Cache Key Builder
export const FutiqCacheKeys = {
  fixture: (id: string) => `futiq:fixture:${id}`,
  events: (id: string) => `futiq:fixture:${id}:events`,
  lineups: (id: string) => `futiq:fixture:${id}:lineups`,
  statistics: (id: string) => `futiq:fixture:${id}:statistics`,
  players: (id: string) => `futiq:fixture:${id}:players`,
  liveList: () => "futiq:fixtures:live",
  lockSyncFixture: (id: string) => `futiq:lock:sync:fixture:${id}`,
  lockSyncLiveList: () => "futiq:lock:sync:live_list",
};

// ==========================================
// 3. CANONICAL INTERNAL LIVE MATCH MODEL
// ==========================================

export interface CanonicalTeamScore {
  current: number;
  halftime?: number;
  extraTime?: number;
  penalty?: number;
}

export interface CanonicalLiveTeam {
  id: string;
  externalId?: string;
  name: string;
  shortName: string;
  tla: string;
  slug: string;
  logoUrl?: string;
  isNationalTeam?: boolean;
}

export interface CanonicalPlayerStat {
  providerPlayerId: string;
  name: string;
  photoUrl?: string;
  position: string;
  shirtNumber: number;
  rating?: number;
  goals?: number;
  assists?: number;
  shots?: number;
  shotsOnTarget?: number;
  passes?: number;
  passAccuracy?: number;
  tackles?: number;
  duelsWon?: number;
  dribbles?: number;
  yellowCards?: number;
  redCards?: number;
  saves?: number;
  minutesPlayed?: number;
  isMotm?: boolean;
}

export interface LiveMatchStatistics {
  possessionHome: number;
  possessionAway: number;
  shotsHome: number;
  shotsAway: number;
  shotsOnTargetHome: number;
  shotsOnTargetAway: number;
  shotsOffTargetHome?: number;
  shotsOffTargetAway?: number;
  blockedShotsHome?: number;
  blockedShotsAway?: number;
  cornersHome: number;
  cornersAway: number;
  foulsHome: number;
  foulsAway: number;
  yellowCardsHome?: number;
  yellowCardsAway?: number;
  redCardsHome?: number;
  redCardsAway?: number;
  offsidesHome?: number;
  offsidesAway?: number;
  savesHome?: number;
  savesAway?: number;
  passesHome?: number;
  passesAway?: number;
  passAccuracyHome?: number;
  passAccuracyAway?: number;
  xgHome?: number;
  xgAway?: number;
}

export interface LiveMatch {
  fixtureId: string;
  externalId?: string;
  competition: {
    id: string;
    name: string;
    code: string;
    slug: string;
    logoUrl?: string;
    isInternational?: boolean;
  };
  season: string;
  round?: string;
  group?: string;
  stage?: string;
  isKnockout?: boolean;
  status: MatchStatus;
  priorityTier: MatchPriorityTier;
  minute?: number;
  period?: "1H" | "HT" | "2H" | "ET" | "PEN" | "FT" | "PRE";
  matchDate: string;
  venue?: ProviderStadium;
  referee?: string;
  homeTeam: CanonicalLiveTeam;
  awayTeam: CanonicalLiveTeam;
  score: {
    home: CanonicalTeamScore;
    away: CanonicalTeamScore;
  };
  events: ProviderMatchEvent[];
  lineups: {
    home?: ProviderMatchLineup;
    away?: ProviderMatchLineup;
  };
  statistics?: LiveMatchStatistics;
  players?: {
    home: CanonicalPlayerStat[];
    away: CanonicalPlayerStat[];
  };
  h2h?: ProviderH2HSummary;
  standing?: ProviderStanding[];
  homeForm?: string[];
  awayForm?: string[];
  dataVersion: number;
  lastUpdatedAt: string; // ISO 8601
  providerUpdatedAt?: string;
  dataFreshness: DataFreshness;
  isStale: boolean;
}

// ==========================================
// 4. LIVE TELEMETRY MODELS
// ==========================================

export interface PerFixtureTelemetry {
  fixtureId: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  status: MatchStatus;
  currentMinute?: number;
  priorityTier: MatchPriorityTier;
  lastProviderSyncAt: string | null;
  lastInternalSyncAt: string;
  nextScheduledSyncAt: string | null;
  eventsCount: number;
  hasLineups: boolean;
  hasStatistics: boolean;
  hasPlayers: boolean;
  cacheStatus: "HIT" | "MISS" | "STALE" | "EXPIRED";
  isStale: boolean;
  dataFreshness: DataFreshness;
  syncCount: number;
  errorCount: number;
  lastError: string | null;
}

export interface LiveEngineTelemetry {
  system: {
    workerStatus: "RUNNING" | "PAUSED" | "STOPPED";
    workerHeartbeat: string;
    activeLiveMatchesCount: number;
    queuedMatchesCount: number;
    staleMatchesCount: number;
    failedMatchesCount: number;
    circuitBreakerState: "CLOSED" | "HALF_OPEN" | "OPEN";
  };
  api: {
    providerName: string;
    requestsToday: number;
    remainingDailyQuota: number;
    requestsPerMinute: number;
    successfulRequests: number;
    failedRequests: number;
    rateLimit429Errors: number;
    providerAverageLatencyMs: number;
    lastSuccessfulRequestAt: string | null;
  };
  cache: {
    redisHealth: "HEALTHY" | "DEGRADED" | "OFFLINE";
    cacheHitRatePercent: number;
    cacheHits: number;
    cacheMisses: number;
    staleCacheCount: number;
    activeDistributedLocksCount: number;
  };
  database: {
    postgresHealth: "HEALTHY" | "DEGRADED" | "OFFLINE";
    queryLatencyMs: number;
    failedQueriesCount: number;
  };
  liveData: {
    activeFixtures: PerFixtureTelemetry[];
    totalSynchronizedToday: number;
    lastSyncTimestamp: string;
    nextSyncTimestamp: string;
  };
}
