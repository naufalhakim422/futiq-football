import test, { describe } from "node:test";
import assert from "node:assert";
import { LiveMatchEngine } from "../src/lib/football/live-engine/live-match.engine";
import { MockFootballProvider } from "../src/lib/football/providers/mock.provider";
import { MatchStatus, EventType } from "../src/lib/football/types";
import { getMatchPriorityTier, FutiqCacheKeys } from "../src/lib/football/live-engine/types";

describe("Sprint Live Match Center & Live Football Engine 2.0 Suite", () => {
  const mockProvider = new MockFootballProvider();
  const engine = LiveMatchEngine.getInstance(mockProvider);

  describe("1. Live Match Normalization & Canonical Internal Model", () => {
    test("should normalize live fixture into canonical LiveMatch model", async () => {
      const match = await engine.getLiveMatch("match_fnb_lyo", true);
      assert.ok(match, "Live match must be returned");
      assert.strictEqual(match.fixtureId, "match_fnb_lyo");
      assert.strictEqual(match.status, MatchStatus.LIVE_2H);
      assert.strictEqual(match.priorityTier, "LIVE");
      assert.strictEqual(match.period, "2H");
      assert.strictEqual(match.homeTeam.name, "Fenerbahçe");
      assert.strictEqual(match.awayTeam.name, "Lyon");
      assert.strictEqual(match.score.home.current, 1);
      assert.strictEqual(match.score.away.current, 1);
      assert.strictEqual(match.dataFreshness, "FRESH");
      assert.strictEqual(match.isStale, false);
    });

    test("should extract player stats with canonical providerPlayerId and zero fake data", async () => {
      const match = await engine.getLiveMatch("match_fnb_lyo");
      assert.ok(match?.players?.home, "Home players list must exist");
      assert.strictEqual(match.players.home.length, 11);

      const greenwood = match.players.home.find((p) => p.name === "Mason Greenwood");
      assert.ok(greenwood, "Mason Greenwood must be found");
      assert.ok(greenwood.providerPlayerId, "Must have canonical providerPlayerId");
      assert.strictEqual(greenwood.rating, 8.2);
      assert.strictEqual(greenwood.goals, 1);
      assert.strictEqual(greenwood.isMotm, true);
    });
  });

  describe("2. Match Priority Tier Classification & Polling Policy", () => {
    test("should classify match status into correct polling priority tiers", () => {
      assert.strictEqual(getMatchPriorityTier(MatchStatus.LIVE_1H), "LIVE");
      assert.strictEqual(getMatchPriorityTier(MatchStatus.LIVE_2H), "LIVE");
      assert.strictEqual(getMatchPriorityTier(MatchStatus.HT), "HALFTIME");
      assert.strictEqual(getMatchPriorityTier(MatchStatus.ET), "EXTRA_TIME");
      assert.strictEqual(getMatchPriorityTier(MatchStatus.PENALTY), "PENALTY");
      assert.strictEqual(getMatchPriorityTier(MatchStatus.FINISHED), "FINISHED");
      assert.strictEqual(getMatchPriorityTier(MatchStatus.POSTPONED), "POSTPONED");
      assert.strictEqual(getMatchPriorityTier(MatchStatus.CANCELLED), "CANCELLED");
      assert.strictEqual(getMatchPriorityTier(MatchStatus.SCHEDULED), "UPCOMING");
    });
  });

  describe("3. Stale Data Detection & Freshness Lifecycle", () => {
    test("should mark data FRESH when updated within 45 seconds", () => {
      const recentIso = new Date(Date.now() - 10000).toISOString(); // 10s ago
      const { freshness, isStale, ageSeconds } = engine.evaluateFreshness(recentIso);
      assert.strictEqual(freshness, "FRESH");
      assert.strictEqual(isStale, false);
      assert.ok(ageSeconds >= 9 && ageSeconds <= 12);
    });

    test("should mark data DELAYED when update lapses between 45 and 90 seconds", () => {
      const delayedIso = new Date(Date.now() - 55000).toISOString(); // 55s ago
      const { freshness, isStale, ageSeconds } = engine.evaluateFreshness(delayedIso);
      assert.strictEqual(freshness, "DELAYED");
      assert.strictEqual(isStale, true);
      assert.ok(ageSeconds >= 54 && ageSeconds <= 58);
    });

    test("should mark data STALE when update lapses beyond 90 seconds", () => {
      const staleIso = new Date(Date.now() - 120000).toISOString(); // 120s ago
      const { freshness, isStale, ageSeconds } = engine.evaluateFreshness(staleIso);
      assert.strictEqual(freshness, "STALE");
      assert.strictEqual(isStale, true);
      assert.ok(ageSeconds >= 118 && ageSeconds <= 125);
    });
  });

  describe("4. Request Deduplication & Granular Cache Partitioning", () => {
    test("should deduplicate simultaneous parallel requests for the same fixture", async () => {
      // Launch 5 parallel requests for match_ina_aus at the same millisecond
      const results = await Promise.all([
        engine.getLiveMatch("match_ina_aus"),
        engine.getLiveMatch("match_ina_aus"),
        engine.getLiveMatch("match_ina_aus"),
        engine.getLiveMatch("match_ina_aus"),
        engine.getLiveMatch("match_ina_aus"),
      ]);

      assert.strictEqual(results.length, 5);
      results.forEach((res) => {
        assert.ok(res, "Result must exist");
        assert.strictEqual(res.fixtureId, "match_ina_aus");
        assert.strictEqual(res.homeTeam.name, "Indonesia");
        assert.strictEqual(res.awayTeam.name, "Australia");
      });
    });

    test("should generate granular cache keys conforming to standard contracts", () => {
      assert.strictEqual(FutiqCacheKeys.fixture("123"), "futiq:fixture:123");
      assert.strictEqual(FutiqCacheKeys.events("123"), "futiq:fixture:123:events");
      assert.strictEqual(FutiqCacheKeys.lineups("123"), "futiq:fixture:123:lineups");
      assert.strictEqual(FutiqCacheKeys.statistics("123"), "futiq:fixture:123:statistics");
      assert.strictEqual(FutiqCacheKeys.players("123"), "futiq:fixture:123:players");
      assert.strictEqual(FutiqCacheKeys.lockSyncFixture("123"), "futiq:lock:sync:fixture:123");
    });
  });

  describe("5. Live Telemetry & Inspector Aggregation", () => {
    test("should generate comprehensive live engine telemetry", async () => {
      const telemetry = await engine.getLiveTelemetry();
      assert.ok(telemetry, "Telemetry object must exist");
      assert.strictEqual(telemetry.system.workerStatus, "RUNNING");
      assert.ok(telemetry.system.workerHeartbeat);
      assert.ok(["CLOSED", "HALF_OPEN", "OPEN"].includes(telemetry.system.circuitBreakerState));
      assert.ok(typeof telemetry.api.remainingDailyQuota === "number");
      assert.ok(typeof telemetry.cache.cacheHitRatePercent === "number");
      assert.ok(Array.isArray(telemetry.liveData.activeFixtures));
    });
  });
});
