import { IFootballProvider } from "./provider.interface";
import { MockFootballProvider } from "./providers/mock.provider";
import { footballService } from "./football.service";

export interface SyncStatus {
  lastSyncAt: string | null;
  status: "IDLE" | "SYNCING" | "SUCCESS" | "FAILED";
  providerName: string;
  recordsSynced: {
    competitions: number;
    teams: number;
    players: number;
    matches: number;
    standings: number;
    transfers: number;
  };
  lastError: string | null;
}

export class FootballSyncService {
  private static instance: FootballSyncService;
  private provider: IFootballProvider;
  private currentStatus: SyncStatus = {
    lastSyncAt: null,
    status: "IDLE",
    providerName: "MockFootballProvider",
    recordsSynced: {
      competitions: 0,
      teams: 0,
      players: 0,
      matches: 0,
      standings: 0,
      transfers: 0,
    },
    lastError: null,
  };

  private constructor(provider?: IFootballProvider) {
    this.provider = provider || new MockFootballProvider();
    this.currentStatus.providerName = this.provider.name;
  }

  public static getInstance(provider?: IFootballProvider): FootballSyncService {
    if (!FootballSyncService.instance) {
      FootballSyncService.instance = new FootballSyncService(provider);
    }
    return FootballSyncService.instance;
  }

  public getStatus(): SyncStatus {
    return { ...this.currentStatus };
  }

  /**
   * Run full synchronization cycle across all football domain entities
   */
  public async syncAll(): Promise<SyncStatus> {
    if (this.currentStatus.status === "SYNCING") {
      return this.currentStatus;
    }

    this.currentStatus.status = "SYNCING";
    this.currentStatus.lastError = null;

    try {
      // 1. Sync Competitions
      const comps = await this.provider.getCompetitions();
      this.currentStatus.recordsSynced.competitions = comps.length;

      // 2. Sync Teams
      const teams = await this.provider.getTeams();
      this.currentStatus.recordsSynced.teams = teams.length;

      // 3. Sync Players
      const players = await this.provider.getPlayers();
      this.currentStatus.recordsSynced.players = players.length;

      // 4. Sync Fixtures & Live Matches
      const matches = await this.provider.getFixtures();
      this.currentStatus.recordsSynced.matches = matches.length;

      // 5. Sync Standings
      const standings = await this.provider.getStandings("PL");
      this.currentStatus.recordsSynced.standings = standings.length;

      // 6. Sync Transfers
      const transfers = await this.provider.getTransfers();
      this.currentStatus.recordsSynced.transfers = transfers.length;

      // Invalidate relevant Redis cache partitions
      await footballService.flushCache();

      this.currentStatus.status = "SUCCESS";
      this.currentStatus.lastSyncAt = new Date().toISOString();
      return this.getStatus();
    } catch (error: any) {
      this.currentStatus.status = "FAILED";
      this.currentStatus.lastError = error?.message || "Unknown synchronization error";
      console.error("[FootballSyncService.syncAll Failed]:", error);
      return this.getStatus();
    }
  }

  /**
   * Fast sync cycle for in-play live scores (called on frequent intervals)
   */
  public async syncLiveScores(): Promise<number> {
    try {
      const liveMatches = await this.provider.getLiveMatches();
      await footballService.flushCache("football:matches:live");
      return liveMatches.length;
    } catch (error) {
      console.error("[FootballSyncService.syncLiveScores Error]:", error);
      return 0;
    }
  }
}

export const footballSyncService = FootballSyncService.getInstance();
