import { redis, getCachedData, setCachedData } from "@/lib/redis";
import { IFootballProvider } from "../provider.interface";
import { MockFootballProvider } from "../providers/mock.provider";
import { ApiFootballProvider } from "../providers/api-football.provider";
import { footballQuotaGuard } from "../quota-guard.service";
import {
  MatchStatus,
  ProviderMatchDetail,
  ProviderMatch,
  EventType,
} from "../types";
import {
  LiveMatch,
  CacheEnvelope,
  FutiqCacheKeys,
  getMatchPriorityTier,
  LiveEngineTelemetry,
  PerFixtureTelemetry,
  CanonicalPlayerStat,
  DataFreshness,
} from "./types";
import { prisma } from "@/lib/db";

export class LiveMatchEngine {
  private static instance: LiveMatchEngine;
  private provider: IFootballProvider;
  private fallbackProvider: MockFootballProvider;

  // In-flight Promise Deduplication Map (Prevents concurrent parallel calls to external provider)
  private pendingFixtureRequests = new Map<string, Promise<LiveMatch | null>>();
  private pendingLiveListRequest: Promise<LiveMatch[]> | null = null;

  // Circuit Breaker State
  private circuitBreakerState: "CLOSED" | "HALF_OPEN" | "OPEN" = "CLOSED";
  private consecutiveFailures = 0;
  private circuitBreakerOpenUntil = 0;
  private static readonly FAILURE_THRESHOLD = 3;
  private static readonly CIRCUIT_COOLDOWN_MS = 30000; // 30s backoff

  // Telemetry Aggregates
  private cacheHits = 0;
  private cacheMisses = 0;
  private successfulRequests = 0;
  private failedRequests = 0;
  private rateLimit429Errors = 0;
  private latencies: number[] = [];
  private perFixtureTelemetryMap = new Map<string, PerFixtureTelemetry>();
  private totalSynchronizedToday = 0;
  private workerHeartbeat = new Date().toISOString();

  // Polling Intervals (ms)
  public static readonly SYNC_INTERVAL_LIVE_MS = 15000; // 15 seconds for live matches
  public static readonly SYNC_INTERVAL_UPCOMING_MS = 300000; // 5 minutes for scheduled
  public static readonly STALE_DELAYED_THRESHOLD_MS = 45000; // > 45s without update -> DELAYED
  public static readonly STALE_CRITICAL_THRESHOLD_MS = 90000; // > 90s without update -> STALE

  private constructor(provider?: IFootballProvider) {
    this.fallbackProvider = new MockFootballProvider();

    if (provider) {
      this.provider = provider;
    } else if (process.env.FOOTBALL_API_KEY && process.env.FOOTBALL_API_KEY.trim().length > 0) {
      this.provider = new ApiFootballProvider(
        process.env.FOOTBALL_API_KEY,
        process.env.FOOTBALL_API_BASE_URL
      );
    } else {
      this.provider = this.fallbackProvider;
    }
  }

  public static getInstance(provider?: IFootballProvider): LiveMatchEngine {
    if (!LiveMatchEngine.instance) {
      LiveMatchEngine.instance = new LiveMatchEngine(provider);
    } else if (provider) {
      LiveMatchEngine.instance.setProvider(provider);
    }
    return LiveMatchEngine.instance;
  }

  public setProvider(provider: IFootballProvider) {
    this.provider = provider;
  }

  public getProvider(): IFootballProvider {
    return this.provider;
  }

  // ==========================================
  // 1. DISTRIBUTED REDIS LOCKING
  // ==========================================

  private async acquireLock(lockKey: string, ttlSeconds = 10): Promise<string | null> {
    if (!redis) return "memory-lock";
    try {
      const lockValue = `${Date.now()}_${Math.random()}`;
      // Atomic SET with NX (Only if not exists) and EX (expire in seconds)
      const result = await redis.set(lockKey, lockValue, "EX", ttlSeconds, "NX");
      return result === "OK" ? lockValue : null;
    } catch {
      return "memory-lock";
    }
  }

  private async releaseLock(lockKey: string, lockValue: string): Promise<void> {
    if (!redis || lockValue === "memory-lock") return;
    try {
      const current = await redis.get(lockKey);
      if (current === lockValue) {
        await redis.del(lockKey);
      }
    } catch {
      // Ignored
    }
  }

  // ==========================================
  // 2. STALE DETECTION & FRESHNESS EVALUATION
  // ==========================================

  public evaluateFreshness(lastProviderSyncIso?: string | null): {
    freshness: DataFreshness;
    isStale: boolean;
    ageSeconds: number;
  } {
    if (!lastProviderSyncIso) {
      return { freshness: "FRESH", isStale: false, ageSeconds: 0 };
    }

    const elapsedMs = Date.now() - new Date(lastProviderSyncIso).getTime();
    const ageSeconds = Math.floor(Math.max(0, elapsedMs / 1000));

    if (elapsedMs >= LiveMatchEngine.STALE_CRITICAL_THRESHOLD_MS) {
      return { freshness: "STALE", isStale: true, ageSeconds };
    }
    if (elapsedMs >= LiveMatchEngine.STALE_DELAYED_THRESHOLD_MS) {
      return { freshness: "DELAYED", isStale: true, ageSeconds };
    }
    return { freshness: "FRESH", isStale: false, ageSeconds };
  }

  // ==========================================
  // 3. CANONICAL MODEL NORMALIZER
  // ==========================================

  public normalizeToLiveMatch(detail: ProviderMatchDetail, version = 1): LiveMatch {
    const priorityTier = getMatchPriorityTier(detail.status);
    const nowIso = new Date().toISOString();
    const { freshness, isStale } = this.evaluateFreshness(nowIso);

    // Extract players list with canonical provider player IDs
    const homePlayers: CanonicalPlayerStat[] = (detail.lineups?.home?.starters || []).map((p) => ({
      providerPlayerId: p.playerId || `ply_home_${p.number}`,
      name: p.name,
      photoUrl: p.photoUrl,
      position: p.position,
      shirtNumber: p.number,
      rating: typeof p.rating === "number" ? p.rating : typeof p.rating === "string" ? parseFloat(p.rating) : undefined,
      goals: p.goals,
      assists: p.assists,
      saves: p.saves,
      tackles: p.tackles,
      passes: p.passes,
      passAccuracy: p.passAccuracy,
      yellowCards: p.yellowCards,
      redCards: p.redCards,
      isMotm: p.isMotm,
    }));

    const awayPlayers: CanonicalPlayerStat[] = (detail.lineups?.away?.starters || []).map((p) => ({
      providerPlayerId: p.playerId || `ply_away_${p.number}`,
      name: p.name,
      photoUrl: p.photoUrl,
      position: p.position,
      shirtNumber: p.number,
      rating: typeof p.rating === "number" ? p.rating : typeof p.rating === "string" ? parseFloat(p.rating) : undefined,
      goals: p.goals,
      assists: p.assists,
      saves: p.saves,
      tackles: p.tackles,
      passes: p.passes,
      passAccuracy: p.passAccuracy,
      yellowCards: p.yellowCards,
      redCards: p.redCards,
      isMotm: p.isMotm,
    }));

    let period: LiveMatch["period"] = "PRE";
    if (detail.status === MatchStatus.LIVE_1H) period = "1H";
    else if (detail.status === MatchStatus.HT) period = "HT";
    else if (detail.status === MatchStatus.LIVE_2H) period = "2H";
    else if (detail.status === MatchStatus.ET) period = "ET";
    else if (detail.status === MatchStatus.PENALTY) period = "PEN";
    else if (detail.status === MatchStatus.FINISHED) period = "FT";

    return {
      fixtureId: detail.id,
      externalId: detail.externalId,
      competition: detail.competition,
      season: detail.season,
      round: detail.round,
      group: detail.group,
      stage: detail.stage,
      isKnockout: detail.isKnockout,
      status: detail.status,
      priorityTier,
      minute: detail.minute,
      period,
      matchDate: detail.matchDate,
      venue: detail.venue,
      referee: detail.referee,
      homeTeam: {
        id: detail.homeTeam.id,
        name: detail.homeTeam.name,
        shortName: detail.homeTeam.shortName,
        tla: detail.homeTeam.tla,
        slug: detail.homeTeam.slug,
        logoUrl: detail.homeTeam.logoUrl,
        isNationalTeam: detail.homeTeam.isNationalTeam,
      },
      awayTeam: {
        id: detail.awayTeam.id,
        name: detail.awayTeam.name,
        shortName: detail.awayTeam.shortName,
        tla: detail.awayTeam.tla,
        slug: detail.awayTeam.slug,
        logoUrl: detail.awayTeam.logoUrl,
        isNationalTeam: detail.awayTeam.isNationalTeam,
      },
      score: {
        home: {
          current: detail.homeScore,
          halftime: detail.htHomeScore,
          extraTime: detail.etHomeScore,
          penalty: detail.penaltyHomeScore,
        },
        away: {
          current: detail.awayScore,
          halftime: detail.htAwayScore,
          extraTime: detail.etAwayScore,
          penalty: detail.penaltyAwayScore,
        },
      },
      events: detail.events || [],
      lineups: detail.lineups || {},
      statistics: detail.stats,
      players: {
        home: homePlayers,
        away: awayPlayers,
      },
      h2h: detail.h2h,
      standing: detail.standing,
      homeForm: detail.homeForm,
      awayForm: detail.awayForm,
      dataVersion: version,
      lastUpdatedAt: nowIso,
      providerUpdatedAt: nowIso,
      dataFreshness: freshness,
      isStale,
    };
  }

  // ==========================================
  // 4. GRANULAR CACHE STORAGE
  // ==========================================

  private async saveGranularCache(liveMatch: LiveMatch): Promise<void> {
    const isLive =
      liveMatch.priorityTier === "LIVE" ||
      liveMatch.priorityTier === "HALFTIME" ||
      liveMatch.priorityTier === "EXTRA_TIME" ||
      liveMatch.priorityTier === "PENALTY";

    const ttl = isLive ? 20 : liveMatch.priorityTier === "FINISHED" ? 86400 : 300;
    const nowIso = new Date().toISOString();
    const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();

    const createEnvelope = <T>(data: T): CacheEnvelope<T> => ({
      fixtureId: liveMatch.fixtureId,
      data,
      status: liveMatch.status,
      dataVersion: liveMatch.dataVersion,
      fetchedAt: nowIso,
      providerUpdatedAt: liveMatch.providerUpdatedAt,
      expiresAt,
      isStale: liveMatch.isStale,
      freshness: liveMatch.dataFreshness,
    });

    // Write granular partition keys simultaneously
    await Promise.all([
      setCachedData(FutiqCacheKeys.fixture(liveMatch.fixtureId), createEnvelope(liveMatch), ttl),
      setCachedData(FutiqCacheKeys.events(liveMatch.fixtureId), createEnvelope(liveMatch.events), ttl),
      setCachedData(FutiqCacheKeys.lineups(liveMatch.fixtureId), createEnvelope(liveMatch.lineups), ttl),
      setCachedData(FutiqCacheKeys.statistics(liveMatch.fixtureId), createEnvelope(liveMatch.statistics), ttl),
      setCachedData(FutiqCacheKeys.players(liveMatch.fixtureId), createEnvelope(liveMatch.players), ttl),
    ]);
  }

  // ==========================================
  // 5. LIVE FIXTURE SYNCHRONIZER (WITH DEDUPLICATION & LOCKS)
  // ==========================================

  public async getLiveMatch(fixtureId: string, forceFresh = false): Promise<LiveMatch | null> {
    this.workerHeartbeat = new Date().toISOString();

    // 1. Check Granular Redis Cache first (unless forceFresh)
    if (!forceFresh) {
      const cachedEnvelope = await getCachedData<CacheEnvelope<LiveMatch>>(
        FutiqCacheKeys.fixture(fixtureId)
      );

      if (cachedEnvelope && cachedEnvelope.data) {
        this.cacheHits += 1;
        const { freshness, isStale } = this.evaluateFreshness(cachedEnvelope.fetchedAt);
        const liveData: LiveMatch = {
          ...cachedEnvelope.data,
          dataFreshness: freshness,
          isStale,
        };

        this.updateFixtureTelemetry(liveData, "HIT");
        return liveData;
      }
    }

    this.cacheMisses += 1;

    // 2. Request Deduplication: Check if there is already an in-flight Promise for this fixtureId
    if (this.pendingFixtureRequests.has(fixtureId)) {
      return this.pendingFixtureRequests.get(fixtureId)!;
    }

    // 3. Execute synchronized fetch with Redis lock
    const fetchPromise = (async (): Promise<LiveMatch | null> => {
      const lockKey = FutiqCacheKeys.lockSyncFixture(fixtureId);
      const lock = await this.acquireLock(lockKey, 12);

      const startTime = Date.now();

      try {
        // Circuit breaker check
        if (this.circuitBreakerState === "OPEN") {
          if (Date.now() < this.circuitBreakerOpenUntil) {
            console.warn(`[LiveMatchEngine]: Circuit breaker OPEN. Serving fallback for ${fixtureId}`);
            const fallback = await this.fallbackProvider.getMatch(fixtureId);
            return fallback ? this.normalizeToLiveMatch(fallback) : null;
          }
          this.circuitBreakerState = "HALF_OPEN";
        }

        // Quota Guard check
        const quotaCheck = footballQuotaGuard.canMakeRequest();
        if (!quotaCheck.allowed && this.provider instanceof ApiFootballProvider) {
          console.warn(`[LiveMatchEngine]: Quota Guard prevented external call (${quotaCheck.reason}). Serving fallback.`);
          const fallback = await this.fallbackProvider.getMatch(fixtureId);
          return fallback ? this.normalizeToLiveMatch(fallback) : null;
        }

        // Perform external provider fetch
        let rawMatch = await this.provider.getMatch(fixtureId);
        if (!rawMatch) {
          rawMatch = await this.fallbackProvider.getMatch(fixtureId);
        }

        if (!rawMatch) {
          return null;
        }

        const duration = Date.now() - startTime;
        this.latencies.push(duration);
        if (this.latencies.length > 50) this.latencies.shift();
        this.successfulRequests += 1;
        this.consecutiveFailures = 0;
        this.circuitBreakerState = "CLOSED";
        this.totalSynchronizedToday += 1;

        const liveMatch = this.normalizeToLiveMatch(rawMatch);
        await this.saveGranularCache(liveMatch);

        this.updateFixtureTelemetry(liveMatch, "MISS");
        return liveMatch;
      } catch (error: any) {
        this.failedRequests += 1;
        this.consecutiveFailures += 1;

        if (error?.message?.includes("429") || error?.status === 429) {
          this.rateLimit429Errors += 1;
        }

        if (this.consecutiveFailures >= LiveMatchEngine.FAILURE_THRESHOLD) {
          this.circuitBreakerState = "OPEN";
          this.circuitBreakerOpenUntil = Date.now() + LiveMatchEngine.CIRCUIT_COOLDOWN_MS;
          console.error(`[LiveMatchEngine]: Failure threshold reached. Circuit breaker tripped to OPEN for 30s.`);
        }

        console.error(`[LiveMatchEngine.getLiveMatch Error for "${fixtureId}"]`, error);

        // Fallback to offline/mock
        const fallback = await this.fallbackProvider.getMatch(fixtureId);
        if (fallback) {
          const normalized = this.normalizeToLiveMatch(fallback);
          normalized.dataFreshness = "STALE";
          normalized.isStale = true;
          return normalized;
        }
        return null;
      } finally {
        if (lock) {
          await this.releaseLock(lockKey, lock);
        }
        this.pendingFixtureRequests.delete(fixtureId);
      }
    })();

    this.pendingFixtureRequests.set(fixtureId, fetchPromise);
    return fetchPromise;
  }

  // ==========================================
  // 6. LIVE TICKER / LIST SYNCHRONIZER
  // ==========================================

  public async getLiveMatchesList(): Promise<LiveMatch[]> {
    this.workerHeartbeat = new Date().toISOString();

    const cacheKey = FutiqCacheKeys.liveList();
    const cached = await getCachedData<LiveMatch[]>(cacheKey);
    if (cached) {
      this.cacheHits += 1;
      return cached;
    }

    if (this.pendingLiveListRequest) {
      return this.pendingLiveListRequest;
    }

    this.pendingLiveListRequest = (async () => {
      const lockKey = FutiqCacheKeys.lockSyncLiveList();
      const lock = await this.acquireLock(lockKey, 10);
      try {
        let rawMatches = await this.provider.getLiveMatches();
        if (!rawMatches || rawMatches.length === 0) {
          if (this.provider.name === "MockFootballProvider") {
            rawMatches = await this.fallbackProvider.getLiveMatches();
          } else {
            rawMatches = [];
          }
        }

        const normalizedList = rawMatches.map((m) => {
          return this.normalizeToLiveMatch({
            ...m,
            events: (m as any).events || [],
            lineups: (m as any).lineups || {},
          });
        });

        await setCachedData(cacheKey, normalizedList, 15);
        return normalizedList;
      } catch (error) {
        console.warn("[LiveMatchEngine.getLiveMatchesList Error]:", error);
        if (this.provider.name === "MockFootballProvider") {
          const fallback = await this.fallbackProvider.getLiveMatches();
          return fallback.map((m) => this.normalizeToLiveMatch({ ...m, events: [], lineups: {} }));
        }
        return [];
      } finally {
        if (lock) await this.releaseLock(lockKey, lock);
        this.pendingLiveListRequest = null;
      }
    })();

    return this.pendingLiveListRequest;
  }

  // ==========================================
  // 7. TELEMETRY AGGREGATOR
  // ==========================================

  private updateFixtureTelemetry(match: LiveMatch, cacheStatus: "HIT" | "MISS") {
    const existing = this.perFixtureTelemetryMap.get(match.fixtureId);
    const syncCount = (existing?.syncCount || 0) + 1;

    const nextSyncMs =
      match.priorityTier === "LIVE" ||
      match.priorityTier === "HALFTIME" ||
      match.priorityTier === "EXTRA_TIME" ||
      match.priorityTier === "PENALTY"
        ? LiveMatchEngine.SYNC_INTERVAL_LIVE_MS
        : match.priorityTier === "UPCOMING"
        ? LiveMatchEngine.SYNC_INTERVAL_UPCOMING_MS
        : null;

    const nextScheduledSyncAt = nextSyncMs ? new Date(Date.now() + nextSyncMs).toISOString() : null;

    this.perFixtureTelemetryMap.set(match.fixtureId, {
      fixtureId: match.fixtureId,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      competition: match.competition.name,
      status: match.status,
      currentMinute: match.minute,
      priorityTier: match.priorityTier,
      lastProviderSyncAt: match.providerUpdatedAt || null,
      lastInternalSyncAt: match.lastUpdatedAt,
      nextScheduledSyncAt,
      eventsCount: match.events.length,
      hasLineups: Boolean(match.lineups.home && match.lineups.away),
      hasStatistics: Boolean(match.statistics),
      hasPlayers: Boolean(match.players?.home && match.players.home.length > 0),
      cacheStatus: match.isStale ? "STALE" : cacheStatus,
      isStale: match.isStale,
      dataFreshness: match.dataFreshness,
      syncCount,
      errorCount: 0,
      lastError: null,
    });
  }

  public async getLiveTelemetry(): Promise<LiveEngineTelemetry> {
    const quota = footballQuotaGuard.getQuotaTelemetry();

    let redisHealth: "HEALTHY" | "DEGRADED" | "OFFLINE" = "HEALTHY";
    let activeLocksCount = 0;
    try {
      if (redis) {
        await redis.ping();
      } else {
        redisHealth = "DEGRADED";
      }
    } catch {
      redisHealth = "OFFLINE";
    }

    let postgresHealth: "HEALTHY" | "DEGRADED" | "OFFLINE" = "HEALTHY";
    let dbLatencyMs = 0;
    const dbStart = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - dbStart;
    } catch {
      postgresHealth = "OFFLINE";
    }

    const totalCacheRequests = this.cacheHits + this.cacheMisses;
    const hitRate = totalCacheRequests > 0 ? Math.round((this.cacheHits / totalCacheRequests) * 100) : 100;
    const avgLatency =
      this.latencies.length > 0
        ? Math.round(this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length)
        : 85;

    const fixtures = Array.from(this.perFixtureTelemetryMap.values());
    const staleCount = fixtures.filter((f) => f.isStale).length;
    const activeLiveCount = fixtures.filter(
      (f) =>
        f.priorityTier === "LIVE" ||
        f.priorityTier === "HALFTIME" ||
        f.priorityTier === "EXTRA_TIME" ||
        f.priorityTier === "PENALTY"
    ).length;

    return {
      system: {
        workerStatus: "RUNNING",
        workerHeartbeat: this.workerHeartbeat,
        activeLiveMatchesCount: activeLiveCount,
        queuedMatchesCount: this.pendingFixtureRequests.size,
        staleMatchesCount: staleCount,
        failedMatchesCount: this.failedRequests,
        circuitBreakerState: this.circuitBreakerState,
      },
      api: {
        providerName: this.provider.name === "ApiFootballProvider" ? "API-Football (v3)" : this.provider.name,
        requestsToday: quota.requestsToday,
        remainingDailyQuota: quota.requestsRemaining,
        requestsPerMinute: quota.requestsThisMinute,
        successfulRequests: this.successfulRequests,
        failedRequests: this.failedRequests,
        rateLimit429Errors: this.rateLimit429Errors + quota.rateLimit429Count,
        providerAverageLatencyMs: avgLatency,
        lastSuccessfulRequestAt: quota.lastSuccessfulRequestAt || this.workerHeartbeat,
      },
      cache: {
        redisHealth,
        cacheHitRatePercent: hitRate,
        cacheHits: this.cacheHits,
        cacheMisses: this.cacheMisses,
        staleCacheCount: staleCount,
        activeDistributedLocksCount: activeLocksCount,
      },
      database: {
        postgresHealth,
        queryLatencyMs: dbLatencyMs,
        failedQueriesCount: 0,
      },
      liveData: {
        activeFixtures: fixtures,
        totalSynchronizedToday: this.totalSynchronizedToday,
        lastSyncTimestamp: this.workerHeartbeat,
        nextSyncTimestamp: new Date(Date.now() + LiveMatchEngine.SYNC_INTERVAL_LIVE_MS).toISOString(),
      },
    };
  }
}

export const liveMatchEngine = LiveMatchEngine.getInstance();
