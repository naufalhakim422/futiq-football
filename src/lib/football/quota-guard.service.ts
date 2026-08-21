export type QuotaLevel = "NORMAL" | "WARNING" | "CRITICAL" | "EMERGENCY" | "BLOCKED";

export interface QuotaRequestLog {
  requestId: string;
  endpoint: string;
  purpose: string;
  fixtureId?: string;
  quotaBefore: number;
  quotaAfter: number;
  durationMs: number;
  statusCode: number;
  timestamp: string;
}

export interface QuotaTelemetry {
  provider: string;
  plan: "FREE";
  dailyLimit: number;
  perMinuteLimit: number;
  requestsToday: number;
  requestsRemainingToday: number;
  requestsRemaining: number;
  requestsThisMinute: number;
  requestsRemainingThisMinute: number;
  quotaLevel: QuotaLevel;
  rateLimitReached: boolean;
  dailyQuotaReached: boolean;
  isRateLimited: boolean;
  rateLimitResetAt: string | null;
  rateLimit429Count: number;
  lastProviderRequest: string | null;
  providerStatus: "OPERATIONAL" | "RATE_LIMITED" | "QUOTA_EXHAUSTED" | "DEGRADED";
  lastProviderResponse: string | null;
  lastSuccessfulRequestAt: string | null;
  lastFailureAt: string | null;
  lastErrorStatus: number | null;
  lastErrorMessage: string | null;
  recentLogs: QuotaRequestLog[];
}

export class FootballQuotaGuard {
  private static instance: FootballQuotaGuard;

  // Free tier constraints
  public static readonly DAILY_LIMIT = 100;
  public static readonly PER_MINUTE_LIMIT = 10;
  public static readonly WARNING_THRESHOLD = 20; // 80% used (20 left)
  public static readonly CRITICAL_THRESHOLD = 10; // 90% used (10 left)
  public static readonly EMERGENCY_THRESHOLD = 5; // 95% used (5 left)

  private requestsToday = 0;
  private currentDayString: string;
  private minuteTimestamps: number[] = [];
  private isRateLimited = false;
  private rateLimitResetAt: number | null = null;
  private rateLimit429Count = 0;
  private lastProviderRequest: string | null = null;
  private lastProviderResponse: string | null = null;
  private lastSuccessfulRequestAt: string | null = null;
  private lastFailureAt: string | null = null;
  private lastErrorStatus: number | null = null;
  private lastErrorMessage: string | null = null;
  private requestLogs: QuotaRequestLog[] = [];

  private constructor() {
    this.currentDayString = this.getTodayDateString();
  }

  public static getInstance(): FootballQuotaGuard {
    if (!FootballQuotaGuard.instance) {
      FootballQuotaGuard.instance = new FootballQuotaGuard();
    }
    return FootballQuotaGuard.instance;
  }

  private getTodayDateString(): string {
    return new Date().toISOString().split("T")[0];
  }

  private refreshDayWindow(): void {
    const today = this.getTodayDateString();
    if (today !== this.currentDayString) {
      this.currentDayString = today;
      this.requestsToday = 0;
      this.rateLimit429Count = 0;
      this.isRateLimited = false;
      this.rateLimitResetAt = null;
      this.requestLogs = [];
    }
  }

  private cleanMinuteWindow(): void {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    this.minuteTimestamps = this.minuteTimestamps.filter((ts) => ts > oneMinuteAgo);

    if (this.isRateLimited && this.rateLimitResetAt && now >= this.rateLimitResetAt) {
      this.isRateLimited = false;
      this.rateLimitResetAt = null;
    }
  }

  public getQuotaLevel(): QuotaLevel {
    const remaining = Math.max(0, FootballQuotaGuard.DAILY_LIMIT - this.requestsToday);
    if (remaining === 0) return "BLOCKED";
    if (remaining <= FootballQuotaGuard.EMERGENCY_THRESHOLD) return "EMERGENCY";
    if (remaining <= FootballQuotaGuard.CRITICAL_THRESHOLD) return "CRITICAL";
    if (remaining <= FootballQuotaGuard.WARNING_THRESHOLD) return "WARNING";
    return "NORMAL";
  }

  /**
   * Evaluates whether an outgoing HTTP request to API-Football is permitted under Free Plan constraints
   */
  public canMakeRequest(options?: { isBackgroundSync?: boolean; purpose?: string }): {
    allowed: boolean;
    reason?: string;
    remainingDaily: number;
    remainingMinute: number;
    quotaLevel: QuotaLevel;
  } {
    this.refreshDayWindow();
    this.cleanMinuteWindow();

    const now = Date.now();
    const quotaLevel = this.getQuotaLevel();
    const remainingDaily = Math.max(0, FootballQuotaGuard.DAILY_LIMIT - this.requestsToday);
    const remainingMinute = Math.max(0, FootballQuotaGuard.PER_MINUTE_LIMIT - this.minuteTimestamps.length);

    // 1. Check if currently in 429 rate-limit backoff
    if (this.isRateLimited && this.rateLimitResetAt && now < this.rateLimitResetAt) {
      const waitSeconds = Math.ceil((this.rateLimitResetAt - now) / 1000);
      return {
        allowed: false,
        reason: `Rate limit 429 backoff active. Try again in ${waitSeconds}s.`,
        remainingDaily,
        remainingMinute,
        quotaLevel,
      };
    }

    // 2. Check Daily Limit (100 req/day - Hard Safety Block)
    if (this.requestsToday >= FootballQuotaGuard.DAILY_LIMIT) {
      return {
        allowed: false,
        reason: `Daily quota exhausted (${this.requestsToday}/${FootballQuotaGuard.DAILY_LIMIT} requests used today). Provider calls blocked.`,
        remainingDaily: 0,
        remainingMinute,
        quotaLevel: "BLOCKED",
      };
    }

    // 3. Check Per-Minute Limit (10 req/minute)
    if (this.minuteTimestamps.length >= FootballQuotaGuard.PER_MINUTE_LIMIT) {
      return {
        allowed: false,
        reason: `Per-minute rate limit reached (${this.minuteTimestamps.length}/${FootballQuotaGuard.PER_MINUTE_LIMIT} req/min). Throttle active.`,
        remainingDaily,
        remainingMinute: 0,
        quotaLevel,
      };
    }

    // 4. Quota Conservation & Emergency Modes (Non-essential/Background requests)
    if (options?.isBackgroundSync && remainingDaily <= FootballQuotaGuard.WARNING_THRESHOLD) {
      return {
        allowed: false,
        reason: `Quota Conservation Active: Only ${remainingDaily} daily requests remaining. Background sync paused to preserve quota for live match requests.`,
        remainingDaily,
        remainingMinute,
        quotaLevel,
      };
    }

    return {
      allowed: true,
      remainingDaily,
      remainingMinute,
      quotaLevel,
    };
  }

  /**
   * Records that an external API request was made and updates usage telemetry
   */
  public recordRequest(
    statusCode: number,
    headers?: Headers | Record<string, string>,
    errorMessage?: string,
    meta?: { endpoint?: string; purpose?: string; fixtureId?: string; durationMs?: number }
  ): void {
    this.refreshDayWindow();
    this.cleanMinuteWindow();

    const now = Date.now();
    const quotaBefore = Math.max(0, FootballQuotaGuard.DAILY_LIMIT - this.requestsToday);
    this.requestsToday += 1;
    this.minuteTimestamps.push(now);
    const quotaAfter = Math.max(0, FootballQuotaGuard.DAILY_LIMIT - this.requestsToday);

    if (meta?.endpoint) {
      this.lastProviderRequest = `${meta.endpoint} (${new Date(now).toISOString()})`;
    }

    // Parse official API-Sports rate-limit headers if provided
    if (headers) {
      const getHeader = (name: string): string | null => {
        if (headers instanceof Headers) {
          return headers.get(name);
        }
        return headers[name] || headers[name.toLowerCase()] || null;
      };

      const remainingHeader =
        getHeader("x-ratelimit-requests-remaining") || getHeader("x-ratelimit-remaining");
      if (remainingHeader !== null && !isNaN(Number(remainingHeader))) {
        const remaining = parseInt(remainingHeader, 10);
        if (remaining >= 0 && remaining <= FootballQuotaGuard.DAILY_LIMIT) {
          this.requestsToday = FootballQuotaGuard.DAILY_LIMIT - remaining;
        }
      }
    }

    if (statusCode >= 200 && statusCode < 300) {
      this.lastSuccessfulRequestAt = new Date(now).toISOString();
      this.lastProviderResponse = `200 OK (${new Date(now).toISOString()})`;
      this.lastErrorStatus = null;
      this.lastErrorMessage = null;
    } else {
      this.lastFailureAt = new Date(now).toISOString();
      this.lastErrorStatus = statusCode;
      this.lastErrorMessage = errorMessage || `HTTP Error ${statusCode}`;
      this.lastProviderResponse = `${statusCode} ${errorMessage || "Error"} (${new Date(now).toISOString()})`;

      if (statusCode === 429) {
        this.rateLimit429Count += 1;
        this.isRateLimited = true;
        this.rateLimitResetAt = now + 60000;
      }
    }

    // Push structured log (kept in memory, capped at 50 entries)
    const logItem: QuotaRequestLog = {
      requestId: `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      endpoint: meta?.endpoint || "unknown",
      purpose: meta?.purpose || "DATA_SYNC",
      fixtureId: meta?.fixtureId,
      quotaBefore,
      quotaAfter,
      durationMs: meta?.durationMs || 0,
      statusCode,
      timestamp: new Date(now).toISOString(),
    };

    this.requestLogs.unshift(logItem);
    if (this.requestLogs.length > 50) {
      this.requestLogs.pop();
    }
  }

  /**
   * Returns current quota telemetry formatted for Admin UI & monitoring
   */
  public getQuotaTelemetry(): QuotaTelemetry {
    this.refreshDayWindow();
    this.cleanMinuteWindow();

    const remainingDaily = Math.max(0, FootballQuotaGuard.DAILY_LIMIT - this.requestsToday);
    const remainingMinute = Math.max(0, FootballQuotaGuard.PER_MINUTE_LIMIT - this.minuteTimestamps.length);
    const quotaLevel = this.getQuotaLevel();

    let providerStatus: QuotaTelemetry["providerStatus"] = "OPERATIONAL";
    if (remainingDaily === 0) {
      providerStatus = "QUOTA_EXHAUSTED";
    } else if (this.isRateLimited) {
      providerStatus = "RATE_LIMITED";
    } else if (quotaLevel === "CRITICAL" || quotaLevel === "EMERGENCY") {
      providerStatus = "DEGRADED";
    }

    return {
      provider: "API-Football (v3)",
      plan: "FREE",
      dailyLimit: FootballQuotaGuard.DAILY_LIMIT,
      perMinuteLimit: FootballQuotaGuard.PER_MINUTE_LIMIT,
      requestsToday: this.requestsToday,
      requestsRemainingToday: remainingDaily,
      requestsRemaining: remainingDaily,
      requestsThisMinute: this.minuteTimestamps.length,
      requestsRemainingThisMinute: remainingMinute,
      quotaLevel,
      rateLimitReached: this.minuteTimestamps.length >= FootballQuotaGuard.PER_MINUTE_LIMIT || this.isRateLimited,
      dailyQuotaReached: this.requestsToday >= FootballQuotaGuard.DAILY_LIMIT,
      isRateLimited: this.isRateLimited,
      rateLimitResetAt: this.rateLimitResetAt ? new Date(this.rateLimitResetAt).toISOString() : null,
      rateLimit429Count: this.rateLimit429Count,
      lastProviderRequest: this.lastProviderRequest,
      providerStatus,
      lastProviderResponse: this.lastProviderResponse,
      lastSuccessfulRequestAt: this.lastSuccessfulRequestAt,
      lastFailureAt: this.lastFailureAt,
      lastErrorStatus: this.lastErrorStatus,
      lastErrorMessage: this.lastErrorMessage,
      recentLogs: this.requestLogs.slice(0, 10),
    };
  }

  /**
   * Resets internal metrics (used in automated unit testing)
   */
  public resetForTesting(): void {
    this.requestsToday = 0;
    this.minuteTimestamps = [];
    this.isRateLimited = false;
    this.rateLimitResetAt = null;
    this.rateLimit429Count = 0;
    this.lastProviderRequest = null;
    this.lastProviderResponse = null;
    this.lastSuccessfulRequestAt = null;
    this.lastFailureAt = null;
    this.lastErrorStatus = null;
    this.lastErrorMessage = null;
    this.requestLogs = [];
    this.currentDayString = this.getTodayDateString();
  }

  /**
   * Set specific usage numbers for testing quota limits
   */
  public setUsageForTesting(todayCount: number, minuteCount = 0, isRateLimited = false): void {
    this.requestsToday = todayCount;
    this.minuteTimestamps = Array.from({ length: minuteCount }, () => Date.now());
    this.isRateLimited = isRateLimited;
    if (isRateLimited) {
      this.rateLimitResetAt = Date.now() + 60000;
    }
  }
}

export const footballQuotaGuard = FootballQuotaGuard.getInstance();
