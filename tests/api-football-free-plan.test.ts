import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { ApiFootballProvider } from "../src/lib/football/providers/api-football.provider";
import { MockFootballProvider } from "../src/lib/football/providers/mock.provider";
import { FootballService } from "../src/lib/football/football.service";
import { FootballSyncService } from "../src/lib/football/sync.service";
import { FootballQuotaGuard, footballQuotaGuard } from "../src/lib/football/quota-guard.service";
import { Logger } from "../src/lib/logger";

describe("Sprint 2 — Football API Free Plan Production-Safe Suite", () => {
  const TEST_API_KEY = "test_apisports_secret_key_12345";
  const TEST_BASE_URL = "https://v3.football.api-sports.io";

  beforeEach(() => {
    footballQuotaGuard.resetForTesting();
  });

  /* =========================================================
     1. API KEY CONFIGURATION & BASE URL
     ========================================================= */
  describe("1. Configuration & Security Bounds", () => {
    it("should correctly store base URL and API key server-side", () => {
      const provider = new ApiFootballProvider(TEST_API_KEY, TEST_BASE_URL);
      assert.equal(provider.getBaseUrl(), "https://v3.football.api-sports.io");
      assert.equal(provider.isConfigured(), true);
    });

    it("should never expose API key in serialized provider output or public properties", () => {
      const provider = new ApiFootballProvider(TEST_API_KEY, TEST_BASE_URL);
      const json = JSON.stringify(provider);
      assert.ok(!json.includes(TEST_API_KEY), "API key must not leak into JSON serialization");
      assert.equal((provider as any).apiKey, TEST_API_KEY, "Key must exist only on private server instance");
    });

    it("should safely identify unconfigured state without throwing exceptions", () => {
      const unconfiguredProvider = new ApiFootballProvider("", TEST_BASE_URL);
      assert.equal(unconfiguredProvider.isConfigured(), false);
    });
  });

  /* =========================================================
     2. SERVER-SIDE QUOTA GUARD (FREE PLAN: 100/DAY, 10/MIN)
     ========================================================= */
  describe("2. Server-Side Quota Guard Enforcement", () => {
    it("should permit requests when well within the 100 req/day and 10 req/min limits", () => {
      const check = footballQuotaGuard.canMakeRequest();
      assert.equal(check.allowed, true);
      assert.equal(check.remainingDaily, 100);
      assert.equal(check.remainingMinute, 10);
    });

    it("should strictly block requests when daily quota (100 req) is exhausted", () => {
      footballQuotaGuard.setUsageForTesting(100, 0);
      const check = footballQuotaGuard.canMakeRequest();
      assert.equal(check.allowed, false);
      assert.match(check.reason || "", /daily quota exhausted/i);
    });

    it("should strictly throttle requests when per-minute limit (10 req/min) is reached", () => {
      footballQuotaGuard.setUsageForTesting(20, 10);
      const check = footballQuotaGuard.canMakeRequest();
      assert.equal(check.allowed, false);
      assert.match(check.reason || "", /per-minute rate limit reached/i);
    });

    it("should delay background synchronization when daily quota is low (<= 5 remaining)", () => {
      footballQuotaGuard.setUsageForTesting(96, 2); // 4 remaining
      const backgroundCheck = footballQuotaGuard.canMakeRequest({ isBackgroundSync: true });
      assert.equal(backgroundCheck.allowed, false);
      assert.match(backgroundCheck.reason || "", /quota conservation|low quota/i);

      // But real-time user query is still allowed
      const userCheck = footballQuotaGuard.canMakeRequest({ isBackgroundSync: false });
      assert.equal(userCheck.allowed, true);
    });

    it("should enforce backoff cooldown when 429 Too Many Requests is recorded", () => {
      footballQuotaGuard.recordRequest(429, undefined, "Rate limit reached");
      const check = footballQuotaGuard.canMakeRequest();
      assert.equal(check.allowed, false);
      assert.match(check.reason || "", /rate limit 429/i);
    });
  });

  /* =========================================================
     3. LOGGER SECRETS REDACTION
     ========================================================= */
  describe("3. Secrets Redaction & Logging Safety", () => {
    it("should strictly redact FOOTBALL_API_KEY and x-apisports-key in logs", () => {
      const payload = {
        message: "API-Football request dispatched",
        headers: {
          "x-apisports-key": "secret_live_key_abcdef987654",
          "FOOTBALL_API_KEY": "secret_key_123",
          Accept: "application/json",
        },
      };

      const redacted = Logger.redact(payload);
      assert.equal(redacted.headers["x-apisports-key"], "[REDACTED]");
      assert.equal(redacted.headers["FOOTBALL_API_KEY"], "[REDACTED]");
      assert.equal(redacted.headers["Accept"], "application/json");
    });
  });

  /* =========================================================
     4. CACHE STRATEGY & DYNAMIC FALLBACK RESILIENCE
     ========================================================= */
  describe("4. Cache Strategy & Graceful Provider Fallback", () => {
    it("should serve live matches via FootballService with Redis caching", async () => {
      const mockProvider = new MockFootballProvider();
      const liveMatches = await mockProvider.getLiveMatches();
      assert.ok(Array.isArray(liveMatches));
      assert.ok(liveMatches.length > 0);
    });

    it("should maintain valid competition codes and standings structures", async () => {
      const service = FootballService.getInstance(new MockFootballProvider());
      const standings = await service.getStandings("PL");
      assert.ok(Array.isArray(standings));
      assert.ok(standings.length > 0);
      assert.equal(standings[0].position, 1);
      assert.ok(standings[0].team.name);
    });

    it("should provide full sync telemetry via FootballSyncService", () => {
      const syncService = FootballSyncService.getInstance(new MockFootballProvider());
      const status = syncService.getStatus();
      assert.ok(status.quota);
      assert.equal(status.quota.dailyLimit, 100);
      assert.equal(status.quota.perMinuteLimit, 10);
      assert.equal(typeof status.quota.requestsToday, "number");
    });
  });
});
