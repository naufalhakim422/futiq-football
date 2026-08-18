export interface QuotaTelemetry {
  provider: string;
  plan: "FREE";
  dailyLimit: number;
  perMinuteLimit: number;
  requestsToday: number;
  requestsRemaining: number;
  requestsThisMinute: number;
  isRateLimited: boolean;
  rateLimitResetAt: string | null;
  rateLimit429Count: number;
  lastSuccessfulRequestAt: string | null;
  lastFailureAt: string | null;
  lastErrorStatus: number | null;
  lastErrorMessage: string | null;
}

export class FootballQuotaGuard {
  private static instance: FootballQuotaGuard;

  // Free tier constraints
  public static readonly DAILY_LIMIT = 100;
  public static readonly PER_MINUTE_LIMIT = 10;
  public static readonly LOW_QUOTA_THRESHOLD = 5;

  private requestsToday = 0;
  private currentDayString: string;
  private minuteTimestamps: number[] = [];
  private isRateLimited = false;
  private rateLimitResetAt: number | null = null;
  private rateLimit429Count = 0;
  private lastSuccessfulRequestAt: string | null = null;
  private lastFailureAt: string | null = null;
  private lastErrorStatus: number | null = null;
  private lastErrorMessage: string | null = null;

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

  /**
   * Evaluates whether an outgoing HTTP request to API-Football is permitted under Free Plan constraints
   */
  public canMakeRequest(options?: { isBackgroundSync?: boolean }): {
    allowed: boolean;
    reason?: string;
    remainingDaily: number;
    remainingMinute: number;
  } {
    this.refreshDayWindow();
    this.cleanMinuteWindow();

    const now = Date.now();

    // 1. Check if currently in 429 rate-limit backoff
    if (this.isRateLimited && this.rateLimitResetAt && now < this.rateLimitResetAt) {
      const waitSeconds = Math.ceil((this.rateLimitResetAt - now) / 1000);
      return {
        allowed: false,
        reason: `Rate limit 429 backoff active. Try again in ${waitSeconds}s.`,
        remainingDaily: Math.max(0, FootballQuotaGuard.DAILY_LIMIT - this.requestsToday),
        remainingMinute: Math.max(0, FootballQuotaGuard.PER_MINUTE_LIMIT - this.minuteTimestamps.length),
      };
    }

    // 2. Check Daily Limit (100 req/day)
    if (this.requestsToday >= FootballQuotaGuard.DAILY_LIMIT) {
      return {
        allowed: false,
        reason: `Daily quota exhausted (${this.requestsToday}/${FootballQuotaGuard.DAILY_LIMIT} requests used today).`,
        remainingDaily: 0,
        remainingMinute: Math.max(0, FootballQuotaGuard.PER_MINUTE_LIMIT - this.minuteTimestamps.length),
      };
    }

    // 3. Check Per-Minute Limit (10 req/minute)
    if (this.minuteTimestamps.length >= FootballQuotaGuard.PER_MINUTE_LIMIT) {
      return {
        allowed: false,
        reason: `Per-minute rate limit reached (${this.minuteTimestamps.length}/${FootballQuotaGuard.PER_MINUTE_LIMIT} req/min). Throttle active.`,
        remainingDaily: Math.max(0, FootballQuotaGuard.DAILY_LIMIT - this.requestsToday),
        remainingMinute: 0,
      };
    }

    // 4. Low-quota protection for background / batch synchronizations
    const remaining = FootballQuotaGuard.DAILY_LIMIT - this.requestsToday;
    if (options?.isBackgroundSync && remaining <= FootballQuotaGuard.LOW_QUOTA_THRESHOLD) {
      return {
        allowed: false,
        reason: `Low quota protection: Only ${remaining} daily requests remaining. Background sync delayed to preserve real-time match queries.`,
        remainingDaily: remaining,
        remainingMinute: FootballQuotaGuard.PER_MINUTE_LIMIT - this.minuteTimestamps.length,
      };
    }

    return {
      allowed: true,
      remainingDaily: remaining,
      remainingMinute: FootballQuotaGuard.PER_MINUTE_LIMIT - this.minuteTimestamps.length,
    };
  }

  /**
   * Records that an external API request was made and updates usage telemetry
   */
  public recordRequest(
    statusCode: number,
    headers?: Headers | Record<string, string>,
    errorMessage?: string
  ): void {
    this.refreshDayWindow();
    this.cleanMinuteWindow();

    const now = Date.now();
    this.requestsToday += 1;
    this.minuteTimestamps.push(now);

    // Parse official API-Sports rate-limit headers if provided
    if (headers) {
      const getHeader = (name: string): string | null => {
        if (headers instanceof Headers) {
          return headers.get(name);
        }
        return headers[name] || headers[name.toLowerCase()] || null;
      };

      const remainingHeader = getHeader("x-ratelimit-requests-remaining");
      if (remainingHeader !== null && !isNaN(Number(remainingHeader))) {
        const remaining = parseInt(remainingHeader, 10);
        if (remaining >= 0 && remaining <= FootballQuotaGuard.DAILY_LIMIT) {
          this.requestsToday = FootballQuotaGuard.DAILY_LIMIT - remaining;
        }
      }
    }

    if (statusCode >= 200 && statusCode < 300) {
      this.lastSuccessfulRequestAt = new Date(now).toISOString();
      this.lastErrorStatus = null;
      this.lastErrorMessage = null;
    } else {
      this.lastFailureAt = new Date(now).toISOString();
      this.lastErrorStatus = statusCode;
      this.lastErrorMessage = errorMessage || `HTTP Error ${statusCode}`;

      if (statusCode === 429) {
        this.rateLimit429Count += 1;
        this.isRateLimited = true;
        // Default 60-second backoff on 429
        this.rateLimitResetAt = now + 60000;
      }
    }
  }

  /**
   * Returns current quota telemetry formatted for Admin UI & monitoring
   */
  public getQuotaTelemetry(): QuotaTelemetry {
    this.refreshDayWindow();
    this.cleanMinuteWindow();

    const remainingDaily = Math.max(0, FootballQuotaGuard.DAILY_LIMIT - this.requestsToday);

    return {
      provider: "API-Football (v3)",
      plan: "FREE",
      dailyLimit: FootballQuotaGuard.DAILY_LIMIT,
      perMinuteLimit: FootballQuotaGuard.PER_MINUTE_LIMIT,
      requestsToday: this.requestsToday,
      requestsRemaining: remainingDaily,
      requestsThisMinute: this.minuteTimestamps.length,
      isRateLimited: this.isRateLimited,
      rateLimitResetAt: this.rateLimitResetAt ? new Date(this.rateLimitResetAt).toISOString() : null,
      rateLimit429Count: this.rateLimit429Count,
      lastSuccessfulRequestAt: this.lastSuccessfulRequestAt,
      lastFailureAt: this.lastFailureAt,
      lastErrorStatus: this.lastErrorStatus,
      lastErrorMessage: this.lastErrorMessage,
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
    this.lastSuccessfulRequestAt = null;
    this.lastFailureAt = null;
    this.lastErrorStatus = null;
    this.lastErrorMessage = null;
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
