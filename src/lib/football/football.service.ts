import { IFootballProvider } from "./provider.interface";
import { MockFootballProvider } from "./providers/mock.provider";
import {
  ProviderCompetition,
  ProviderTeam,
  ProviderTeamDetail,
  ProviderPlayer,
  ProviderPlayerDetail,
  ProviderMatch,
  ProviderMatchDetail,
  ProviderStanding,
  ProviderTransfer,
  FixtureQueryParams,
  TransferQueryParams,
} from "./types";
import { getCachedData, setCachedData, invalidateCache } from "@/lib/redis";
import { prisma } from "@/lib/db";

export class FootballService {
  private static instance: FootballService;
  private provider: IFootballProvider;

  // Cache TTL configuration in seconds
  private static readonly TTL_LIVE = 15; // 15 seconds
  private static readonly TTL_FIXTURES = 300; // 5 minutes
  private static readonly TTL_STANDINGS = 600; // 10 minutes
  private static readonly TTL_TEAM = 3600; // 1 hour
  private static readonly TTL_PLAYER = 3600; // 1 hour
  private static readonly TTL_TRANSFERS = 600; // 10 minutes

  private constructor(provider?: IFootballProvider) {
    // Default to MockFootballProvider until external licensed provider is plugged in
    this.provider = provider || new MockFootballProvider();
  }

  public static getInstance(provider?: IFootballProvider): FootballService {
    if (!FootballService.instance) {
      FootballService.instance = new FootballService(provider);
    }
    return FootballService.instance;
  }

  /**
   * Swap or inject provider dynamically (e.g. for testing or switching to Opta/ApiFootball)
   */
  public setProvider(provider: IFootballProvider) {
    this.provider = provider;
  }

  public getProviderName(): string {
    return this.provider.name;
  }

  // ==========================================
  // 1. LIVE MATCHES & TICKER
  // ==========================================

  public async getLiveMatches(): Promise<ProviderMatch[]> {
    const cacheKey = "football:matches:live";
    const cached = await getCachedData<ProviderMatch[]>(cacheKey);
    if (cached) return cached;

    try {
      const liveMatches = await this.provider.getLiveMatches();
      await setCachedData(cacheKey, liveMatches, FootballService.TTL_LIVE);
      return liveMatches;
    } catch (error) {
      console.error("[FootballService.getLiveMatches Error]:", error);
      return [];
    }
  }

  // ==========================================
  // 2. COMPETITIONS & STANDINGS
  // ==========================================

  public async getCompetitions(): Promise<ProviderCompetition[]> {
    const cacheKey = "football:competitions:all";
    const cached = await getCachedData<ProviderCompetition[]>(cacheKey);
    if (cached) return cached;

    try {
      const competitions = await this.provider.getCompetitions();
      await setCachedData(cacheKey, competitions, FootballService.TTL_STANDINGS);
      return competitions;
    } catch (error) {
      console.error("[FootballService.getCompetitions Error]:", error);
      return [];
    }
  }

  public async getCompetition(idOrSlugOrCode: string): Promise<ProviderCompetition | null> {
    const cacheKey = `football:competition:${idOrSlugOrCode.toLowerCase()}`;
    const cached = await getCachedData<ProviderCompetition>(cacheKey);
    if (cached) return cached;

    try {
      const competition = await this.provider.getCompetition(idOrSlugOrCode);
      if (competition) {
        await setCachedData(cacheKey, competition, FootballService.TTL_STANDINGS);
      }
      return competition;
    } catch (error) {
      console.error(`[FootballService.getCompetition "${idOrSlugOrCode}" Error]:`, error);
      return null;
    }
  }

  public async getStandings(
    competitionCode: string,
    season?: string
  ): Promise<ProviderStanding[]> {
    const cacheKey = `football:standings:${competitionCode.toLowerCase()}:${season || "current"}`;
    const cached = await getCachedData<ProviderStanding[]>(cacheKey);
    if (cached) return cached;

    try {
      const standings = await this.provider.getStandings(competitionCode, season);
      await setCachedData(cacheKey, standings, FootballService.TTL_STANDINGS);
      return standings;
    } catch (error) {
      console.error(`[FootballService.getStandings "${competitionCode}" Error]:`, error);
      return [];
    }
  }

  // ==========================================
  // 3. MATCHES & FIXTURES
  // ==========================================

  public async getFixtures(params?: FixtureQueryParams): Promise<ProviderMatch[]> {
    const cacheKey = `football:fixtures:${JSON.stringify(params || {})}`;
    const cached = await getCachedData<ProviderMatch[]>(cacheKey);
    if (cached) return cached;

    try {
      const matches = await this.provider.getFixtures(params);
      await setCachedData(cacheKey, matches, FootballService.TTL_FIXTURES);
      return matches;
    } catch (error) {
      console.error("[FootballService.getFixtures Error]:", error);
      return [];
    }
  }

  public async getMatchDetail(id: string): Promise<ProviderMatchDetail | null> {
    const cacheKey = `football:match:${id}`;
    const cached = await getCachedData<ProviderMatchDetail>(cacheKey);
    if (cached) return cached;

    try {
      const match = await this.provider.getMatch(id);
      if (match) {
        const isLive = match.status.startsWith("LIVE") || match.status === "HT";
        const ttl = isLive ? FootballService.TTL_LIVE : FootballService.TTL_FIXTURES;
        await setCachedData(cacheKey, match, ttl);
      }
      return match;
    } catch (error) {
      console.error(`[FootballService.getMatchDetail "${id}" Error]:`, error);
      return null;
    }
  }

  // ==========================================
  // 4. TEAMS
  // ==========================================

  public async getTeams(competitionCode?: string): Promise<ProviderTeam[]> {
    const cacheKey = `football:teams:${competitionCode || "all"}`;
    const cached = await getCachedData<ProviderTeam[]>(cacheKey);
    if (cached) return cached;

    try {
      const teams = await this.provider.getTeams(competitionCode);
      await setCachedData(cacheKey, teams, FootballService.TTL_TEAM);
      return teams;
    } catch (error) {
      console.error("[FootballService.getTeams Error]:", error);
      return [];
    }
  }

  public async getTeamDetail(idOrSlug: string): Promise<ProviderTeamDetail | null> {
    const cacheKey = `football:team:${idOrSlug.toLowerCase()}`;
    const cached = await getCachedData<ProviderTeamDetail>(cacheKey);
    if (cached) return cached;

    try {
      const team = await this.provider.getTeam(idOrSlug);
      if (team) {
        await setCachedData(cacheKey, team, FootballService.TTL_TEAM);
      }
      return team;
    } catch (error) {
      console.error(`[FootballService.getTeamDetail "${idOrSlug}" Error]:`, error);
      return null;
    }
  }

  // ==========================================
  // 5. PLAYERS
  // ==========================================

  public async getPlayers(teamId?: string): Promise<ProviderPlayer[]> {
    const cacheKey = `football:players:${teamId || "all"}`;
    const cached = await getCachedData<ProviderPlayer[]>(cacheKey);
    if (cached) return cached;

    try {
      const players = await this.provider.getPlayers(teamId);
      await setCachedData(cacheKey, players, FootballService.TTL_PLAYER);
      return players;
    } catch (error) {
      console.error("[FootballService.getPlayers Error]:", error);
      return [];
    }
  }

  public async getPlayerDetail(idOrSlug: string): Promise<ProviderPlayerDetail | null> {
    const cacheKey = `football:player:${idOrSlug.toLowerCase()}`;
    const cached = await getCachedData<ProviderPlayerDetail>(cacheKey);
    if (cached) return cached;

    try {
      const player = await this.provider.getPlayer(idOrSlug);
      if (player) {
        await setCachedData(cacheKey, player, FootballService.TTL_PLAYER);
      }
      return player;
    } catch (error) {
      console.error(`[FootballService.getPlayerDetail "${idOrSlug}" Error]:`, error);
      return null;
    }
  }

  // ==========================================
  // 6. TRANSFERS
  // ==========================================

  public async getTransfers(params?: TransferQueryParams): Promise<ProviderTransfer[]> {
    const cacheKey = `football:transfers:${JSON.stringify(params || {})}`;
    const cached = await getCachedData<ProviderTransfer[]>(cacheKey);
    if (cached) return cached;

    try {
      const transfers = await this.provider.getTransfers(params);
      await setCachedData(cacheKey, transfers, FootballService.TTL_TRANSFERS);
      return transfers;
    } catch (error) {
      console.error("[FootballService.getTransfers Error]:", error);
      return [];
    }
  }

  /**
   * Flush football cache keys (e.g. after a sync cycle)
   */
  public async flushCache(pattern?: string) {
    if (pattern) {
      await invalidateCache(pattern);
    } else {
      await invalidateCache("football:matches:live");
      await invalidateCache("football:competitions:all");
    }
  }
}

// Export singleton instance
export const footballService = FootballService.getInstance();
