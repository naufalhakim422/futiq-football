import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MockFootballProvider } from "../src/lib/football/providers/mock.provider";
import { FootballService } from "../src/lib/football/football.service";
import { FootballSyncService } from "../src/lib/football/sync.service";

describe("Football Engine Test Suite", () => {
  const provider = new MockFootballProvider();
  const footballService = FootballService.getInstance(provider);
  const syncService = FootballSyncService.getInstance(provider);

  describe("MockFootballProvider", () => {
    it("should return list of competitions", async () => {
      const competitions = await provider.getCompetitions();
      assert.ok(Array.isArray(competitions));
      assert.ok(competitions.length >= 4);
      assert.equal(competitions[0].code, "PL");
    });

    it("should retrieve single competition by code and slug", async () => {
      const pl = await provider.getCompetition("PL");
      assert.ok(pl);
      assert.equal(pl.name, "Premier League");

      const ucl = await provider.getCompetition("champions-league");
      assert.ok(ucl);
      assert.equal(ucl.code, "UCL");
    });

    it("should return teams and filter by competition code", async () => {
      const allTeams = await provider.getTeams();
      assert.ok(allTeams.length >= 6);

      const plTeams = await provider.getTeams("PL");
      assert.ok(plTeams.length >= 4);
      assert.ok(plTeams.every((t) => t.competitionCode === "PL"));
    });

    it("should retrieve team detail with squad and stadium", async () => {
      const arsenal = await provider.getTeam("arsenal");
      assert.ok(arsenal);
      assert.equal(arsenal.name, "Arsenal FC");
      assert.equal(arsenal.tla, "ARS");
      assert.ok(arsenal.stadium);
      assert.equal(arsenal.stadium.name, "Emirates Stadium");
      assert.ok(Array.isArray(arsenal.squad));
      assert.ok(arsenal.squad.length > 0);
    });

    it("should retrieve player detail and statistics", async () => {
      const saka = await provider.getPlayer("bukayo-saka");
      assert.ok(saka);
      assert.equal(saka.name, "Bukayo Saka");
      assert.equal(saka.position, "ATTACKER");
      assert.ok(saka.statistics);
      assert.ok(saka.statistics.length > 0);
      assert.equal(saka.statistics[0].goals, 18);
    });

    it("should retrieve fixtures and filter by parameters", async () => {
      const allFixtures = await provider.getFixtures();
      assert.ok(allFixtures.length >= 4);

      const liveMatches = await provider.getLiveMatches();
      assert.ok(liveMatches.length >= 2);
      assert.ok(liveMatches.every((m) => m.status.startsWith("LIVE") || m.status === "HT"));

      const matchDetail = await provider.getMatch("match_ars_che");
      assert.ok(matchDetail);
      assert.ok(matchDetail.events.length > 0);
      assert.ok(matchDetail.lineups.home);
      assert.equal(matchDetail.lineups.home.formation, "4-3-3");
    });

    it("should retrieve standings and transfers", async () => {
      const standings = await provider.getStandings("PL");
      assert.ok(standings.length >= 4);
      assert.equal(standings[0].position, 1);
      assert.equal(standings[0].team.tla, "ARS");

      const transfers = await provider.getTransfers();
      assert.ok(transfers.length >= 3);
      assert.ok(transfers.some((t) => t.status === "COMPLETED"));
    });
  });

  describe("FootballService (Cache & Resilient Retrieval)", () => {
    it("should fetch live matches via service layer", async () => {
      const live = await footballService.getLiveMatches();
      assert.ok(Array.isArray(live));
      assert.ok(live.length > 0);
    });

    it("should fetch team details gracefully", async () => {
      const team = await footballService.getTeamDetail("real-madrid");
      assert.ok(team);
      assert.equal(team.tla, "RMA");
      assert.equal(team.manager?.name, "Carlo Ancelotti");
    });

    it("should return null for non-existent team without throwing", async () => {
      const nonExistent = await footballService.getTeamDetail("unknown-club-xyz");
      assert.equal(nonExistent, null);
    });
  });

  describe("FootballSyncService", () => {
    it("should report initial status and execute full sync cycle", async () => {
      const initialStatus = syncService.getStatus();
      assert.ok(initialStatus);
      assert.equal(initialStatus.providerName, "MockFootballProvider");

      const syncResult = await syncService.syncAll();
      assert.equal(syncResult.status, "SUCCESS");
      assert.ok(syncResult.lastSyncAt);
      assert.ok(syncResult.recordsSynced.competitions >= 4);
      assert.ok(syncResult.recordsSynced.teams >= 6);
      assert.ok(syncResult.recordsSynced.matches >= 4);
    });
  });
});
