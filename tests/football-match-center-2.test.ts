import test, { describe } from "node:test";
import assert from "node:assert";
import { MockFootballProvider } from "../src/lib/football/providers/mock.provider";
import { EventType, MatchStatus } from "../src/lib/football/types";

describe("Sprint Match Center 2.0 — Google & FotMob Level Football Engine Suite", () => {
  const provider = new MockFootballProvider();

  describe("1. Club and National Team Coverage", () => {
    test("should retrieve club football match (UEFA Champions League)", async () => {
      const match = await provider.getMatch("match_fnb_lyo");
      assert.ok(match, "Fenerbahce vs Lyon match should exist");
      assert.strictEqual(match.homeTeam.name, "Fenerbahçe");
      assert.strictEqual(match.awayTeam.name, "Lyon");
      assert.strictEqual(match.competition.code, "UCL");
      assert.strictEqual(match.lineups.home?.starters.length, 11);
      assert.strictEqual(match.lineups.away?.starters.length, 11);
    });

    test("should retrieve international tournament match (World Cup Qualifiers)", async () => {
      const match = await provider.getMatch("match_ina_aus");
      assert.ok(match, "Indonesia vs Australia fixture should exist");
      assert.strictEqual(match.homeTeam.name, "Indonesia");
      assert.strictEqual(match.awayTeam.name, "Australia");
      assert.strictEqual(match.competition.code, "WCQ");
      assert.strictEqual(match.homeScore, 2);
      assert.strictEqual(match.awayScore, 1);
    });

    test("should retrieve international friendly match and flag friendly status", async () => {
      const match = await provider.getMatch("match_ina_mas_fr");
      assert.ok(match, "Indonesia vs Malaysia friendly should exist");
      assert.strictEqual(match.competition.code, "FRIENDLY");
      assert.strictEqual(match.homeTeam.name, "Indonesia");
      assert.strictEqual(match.awayTeam.name, "Malaysia");
      assert.strictEqual(match.homeScore, 3);
      assert.strictEqual(match.awayScore, 0);
    });
  });

  describe("2. Knockout, Extra Time & Penalty Shootout Handling", () => {
    test("should correctly identify extra time and penalty shootout score", async () => {
      const match = await provider.getMatch("match_fra_arg_wc");
      assert.ok(match, "World cup final match should exist");
      assert.strictEqual(match.homeScore, 3);
      assert.strictEqual(match.awayScore, 3);
      assert.strictEqual(match.etHomeScore, 3);
      assert.strictEqual(match.etAwayScore, 3);
      assert.strictEqual(match.penaltyHomeScore, 4);
      assert.strictEqual(match.penaltyAwayScore, 2);
      assert.strictEqual(match.decidedByPenalty, true);
      assert.strictEqual(match.isKnockout, true);
    });
  });

  describe("3. Structured Match Timeline & Facts", () => {
    test("should contain structured goal, card, and assist events", async () => {
      const match = await provider.getMatch("match_ina_aus");
      assert.ok(match?.events && match.events.length > 0, "Events should be populated");
      
      const goals = match.events.filter((e) => e.type === EventType.GOAL);
      assert.strictEqual(goals.length, 3, "There should be 3 goals in Indonesia vs Australia");

      const marselinoGoal = goals.find((g) => g.playerName === "Marselino Ferdinan");
      assert.ok(marselinoGoal, "Marselino Ferdinan goal should exist");
      assert.strictEqual(marselinoGoal.assistPlayerName, "Calvin Verdonk");

      const yellowCards = match.events.filter((e) => e.type === EventType.YELLOW_CARD);
      assert.strictEqual(yellowCards.length, 1, "There should be 1 yellow card recorded");
    });
  });

  describe("4. Visual Tactical Lineups & Player Performance Ratings", () => {
    test("should provide 11 starters with valid formations and player ratings", async () => {
      const match = await provider.getMatch("match_eng_fra");
      assert.ok(match?.lineups.home, "Home lineup should exist");
      assert.ok(match?.lineups.away, "Away lineup should exist");

      assert.strictEqual(match.lineups.home.starters.length, 11);
      assert.strictEqual(match.lineups.away.starters.length, 11);
      assert.strictEqual(match.lineups.home.formation, "4-2-3-1");
      assert.strictEqual(match.lineups.away.formation, "4-3-3");

      const bellingham = match.lineups.home.starters.find((p) => p.name === "Jude Bellingham");
      assert.ok(bellingham, "Jude Bellingham should be in England starting XI");
      assert.strictEqual(typeof bellingham.rating, "number");
      assert.ok(Number(bellingham.rating) >= 6.0 && Number(bellingham.rating) <= 10.0);
    });

    test("should highlight Man of the Match with authentic rating", async () => {
      const match = await provider.getMatch("match_fnb_lyo");
      assert.ok(match?.lineups.home, "Lineup must exist");
      const motm = match.lineups.home.starters.find((p) => p.isMotm);
      assert.ok(motm, "MOTM player should exist");
      assert.strictEqual(motm.name, "Mason Greenwood");
      assert.strictEqual(motm.rating, 8.2);
    });
  });

  describe("5. Match Statistics & Opta Telemetry", () => {
    test("should provide complete comparative stats without fake data", async () => {
      const match = await provider.getMatch("match_arg_bra");
      assert.ok(match?.stats, "Match stats must exist");
      assert.strictEqual(match.stats.possessionHome + match.stats.possessionAway, 100);
      assert.ok(match.stats.shotsHome >= match.stats.shotsOnTargetHome);
      assert.ok(match.stats.shotsAway >= match.stats.shotsOnTargetAway);
      assert.strictEqual(typeof match.stats.xgHome, "number");
      assert.strictEqual(typeof match.stats.xgAway, "number");
    });
  });
});
