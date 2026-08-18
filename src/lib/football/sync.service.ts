import { IFootballProvider } from "./provider.interface";
import { MockFootballProvider } from "./providers/mock.provider";
import { ApiFootballProvider } from "./providers/api-football.provider";
import { footballService } from "./football.service";
import { footballQuotaGuard, QuotaTelemetry } from "./quota-guard.service";

export interface SyncStatus {
  lastSyncAt: string | null;
  status: "IDLE" | "SYNCING" | "SUCCESS" | "FAILED";
  providerName: string;
  isConfigured: boolean;
  recordsSynced: {
    competitions: number;
    teams: number;
    players: number;
    matches: number;
    standings: number;
    transfers: number;
  };
  lastError: string | null;
  quota: QuotaTelemetry;
}

export class FootballSyncService {
  private static instance: FootballSyncService;
  private provider: IFootballProvider;
  private currentStatus: {
    lastSyncAt: string | null;
    status: "IDLE" | "SYNCING" | "SUCCESS" | "FAILED";
    recordsSynced: {
      competitions: number;
      teams: number;
      players: number;
      matches: number;
      standings: number;
      transfers: number;
    };
    lastError: string | null;
  } = {
    lastSyncAt: null,
    status: "IDLE",
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
    if (provider) {
      this.provider = provider;
    } else if (process.env.FOOTBALL_API_KEY && process.env.FOOTBALL_API_KEY.trim().length > 0) {
      this.provider = new ApiFootballProvider(process.env.FOOTBALL_API_KEY, process.env.FOOTBALL_API_BASE_URL);
    } else {
      this.provider = new MockFootballProvider();
    }
  }

  public static getInstance(provider?: IFootballProvider): FootballSyncService {
    if (!FootballSyncService.instance) {
      FootballSyncService.instance = new FootballSyncService(provider);
    }
    return FootballSyncService.instance;
  }

  public setProvider(provider: IFootballProvider) {
    this.provider = provider;
  }

  public getStatus(): SyncStatus {
    const quota = footballQuotaGuard.getQuotaTelemetry();
    const isConfigured =
      this.provider instanceof ApiFootballProvider
        ? (this.provider as ApiFootballProvider).isConfigured()
        : false;

    return {
      lastSyncAt: this.currentStatus.lastSyncAt,
      status: this.currentStatus.status,
      providerName: this.provider.name === "ApiFootballProvider" ? "API-Football (v3)" : this.provider.name,
      isConfigured,
      recordsSynced: { ...this.currentStatus.recordsSynced },
      lastError: this.currentStatus.lastError,
      quota,
    };
  }

  /**
   * Run full synchronization cycle across all football domain entities
   */
  public async syncAll(): Promise<SyncStatus> {
    if (this.currentStatus.status === "SYNCING") {
      return this.getStatus();
    }

    // Check quota guard before running background sync
    const quotaCheck = footballQuotaGuard.canMakeRequest({ isBackgroundSync: true });
    if (!quotaCheck.allowed && this.provider instanceof ApiFootballProvider) {
      this.currentStatus.lastError = quotaCheck.reason || "Quota guard blocked background sync";
      return this.getStatus();
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
}

export const footballSyncService = FootballSyncService.getInstance();
