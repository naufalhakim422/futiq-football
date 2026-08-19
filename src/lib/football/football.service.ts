import { IFootballProvider } from "./provider.interface";
import { MockFootballProvider } from "./providers/mock.provider";
import { ApiFootballProvider } from "./providers/api-football.provider";
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

export class FootballService {
  private static instance: FootballService;
  private provider: IFootballProvider;
  private fallbackProvider: MockFootballProvider;

  // Free Tier Production-Safe Cache TTLs (seconds)
  public static readonly TTL_LIVE = 60; // 60 seconds shared live score cache
  public static readonly TTL_FIXTURES = 300; // 5 minutes
  public static readonly TTL_RESULTS = 600; // 10 minutes
  public static readonly TTL_STANDINGS = 600; // 10 minutes
  public static readonly TTL_TEAM = 3600; // 1 hour
  public static readonly TTL_PLAYER = 3600; // 1 hour
  public static readonly TTL_COMPETITIONS = 86400; // 24 hours
  public static readonly TTL_TRANSFERS = 1800; // 30 minutes

  private constructor(provider?: IFootballProvider) {
    this.fallbackProvider = new MockFootballProvider();

    if (provider) {
      this.provider = provider;
    } else if (process.env.FOOTBALL_API_KEY && process.env.FOOTBALL_API_KEY.trim().length > 0) {
      this.provider = new ApiFootballProvider(process.env.FOOTBALL_API_KEY, process.env.FOOTBALL_API_BASE_URL);
    } else {
      this.provider = this.fallbackProvider;
    }
  }

  public static getInstance(provider?: IFootballProvider): FootballService {
    if (!FootballService.instance) {
      FootballService.instance = new FootballService(provider);
    } else if (provider) {
      FootballService.instance.setProvider(provider);
    }
    return FootballService.instance;
  }

  /**
   * Swap or inject provider dynamically (e.g. for testing or switching between mock and API-Football)
   */
  public setProvider(provider: IFootballProvider) {
    this.provider = provider;
  }

  public getProvider(): IFootballProvider {
    return this.provider;
  }

  public getProviderName(): string {
    return this.provider.name;
  }

  // ==========================================
  // 1. LIVE MATCHES & TICKER
  // ==========================================

  public async getLiveMatches(): Promise<ProviderMatch[]> {
    try {
      const { liveMatchEngine } = await import("./live-engine/live-match.engine");
      const liveList = await liveMatchEngine.getLiveMatchesList();
      return liveList.map((m) => ({
        id: m.fixtureId,
        externalId: m.externalId,
        competition: m.competition,
        season: m.season,
        round: m.round,
        group: m.group,
        stage: m.stage,
        isKnockout: m.isKnockout,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        venue: m.venue,
        matchDate: m.matchDate,
        status: m.status,
        minute: m.minute,
        homeScore: m.score.home.current,
        awayScore: m.score.away.current,
        htHomeScore: m.score.home.halftime,
        htAwayScore: m.score.away.halftime,
        etHomeScore: m.score.home.extraTime,
        etAwayScore: m.score.away.extraTime,
        penaltyHomeScore: m.score.home.penalty,
        penaltyAwayScore: m.score.away.penalty,
        decidedByPenalty: m.score.home.penalty !== undefined,
        referee: m.referee,
      }));
    } catch (error) {
      console.warn("[FootballService.getLiveMatches Fallback]:", error);
      const fallback = await this.fallbackProvider.getLiveMatches();
      return fallback;
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
      let competitions = await this.provider.getCompetitions();
      if (!competitions || competitions.length === 0) {
        competitions = await this.fallbackProvider.getCompetitions();
      }
      await setCachedData(cacheKey, competitions, FootballService.TTL_COMPETITIONS);
      return competitions;
    } catch (error) {
      console.warn("[FootballService.getCompetitions Fallback]:", error);
      const fallback = await this.fallbackProvider.getCompetitions();
      return fallback;
    }
  }

  public async getCompetition(idOrSlugOrCode: string): Promise<ProviderCompetition | null> {
    const cacheKey = `football:competition:${idOrSlugOrCode.toLowerCase()}`;
    const cached = await getCachedData<ProviderCompetition>(cacheKey);
    if (cached) return cached;

    try {
      let competition = await this.provider.getCompetition(idOrSlugOrCode);
      if (!competition) {
        competition = await this.fallbackProvider.getCompetition(idOrSlugOrCode);
      }
      if (competition) {
        await setCachedData(cacheKey, competition, FootballService.TTL_COMPETITIONS);
      }
      return competition;
    } catch (error) {
      console.warn(`[FootballService.getCompetition "${idOrSlugOrCode}" Fallback]:`, error);
      return this.fallbackProvider.getCompetition(idOrSlugOrCode);
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
      let standings = await this.provider.getStandings(competitionCode, season);
      if (!standings || standings.length === 0) {
        standings = await this.fallbackProvider.getStandings(competitionCode, season);
      }
      await setCachedData(cacheKey, standings, FootballService.TTL_STANDINGS);
      return standings;
    } catch (error) {
      console.warn(`[FootballService.getStandings "${competitionCode}" Fallback]:`, error);
      const fallback = await this.fallbackProvider.getStandings(competitionCode, season);
      return fallback;
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
      if (matches !== null && matches !== undefined) {
        await setCachedData(cacheKey, matches, FootballService.TTL_FIXTURES);
        return matches;
      }
      const fallback = await this.fallbackProvider.getFixtures(params);
      await setCachedData(cacheKey, fallback, FootballService.TTL_FIXTURES);
      return fallback;
    } catch (error) {
      console.warn("[FootballService.getFixtures Fallback]:", error);
      const fallback = await this.fallbackProvider.getFixtures(params);
      return fallback;
    }
  }

  public async getMatchDetail(id: string): Promise<ProviderMatchDetail | null> {
    try {
      const { liveMatchEngine } = await import("./live-engine/live-match.engine");
      const live = await liveMatchEngine.getLiveMatch(id);
      if (!live) return null;

      return {
        id: live.fixtureId,
        externalId: live.externalId,
        competition: live.competition,
        season: live.season,
        round: live.round,
        group: live.group,
        stage: live.stage,
        isKnockout: live.isKnockout,
        homeTeam: live.homeTeam,
        awayTeam: live.awayTeam,
        venue: live.venue,
        matchDate: live.matchDate,
        status: live.status,
        minute: live.minute,
        homeScore: live.score.home.current,
        awayScore: live.score.away.current,
        htHomeScore: live.score.home.halftime,
        htAwayScore: live.score.away.halftime,
        etHomeScore: live.score.home.extraTime,
        etAwayScore: live.score.away.extraTime,
        penaltyHomeScore: live.score.home.penalty,
        penaltyAwayScore: live.score.away.penalty,
        decidedByPenalty: live.score.home.penalty !== undefined,
        referee: live.referee,
        events: live.events,
        lineups: live.lineups,
        stats: live.statistics,
        h2h: live.h2h,
        standing: live.standing,
        homeForm: live.homeForm,
        awayForm: live.awayForm,
      };
    } catch (error) {
      console.warn(`[FootballService.getMatchDetail "${id}" Fallback]:`, error);
      return this.fallbackProvider.getMatch(id);
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
      let teams = await this.provider.getTeams(competitionCode);
      if (!teams || teams.length === 0) {
        teams = await this.fallbackProvider.getTeams(competitionCode);
      }
      await setCachedData(cacheKey, teams, FootballService.TTL_TEAM);
      return teams;
    } catch (error) {
      console.warn("[FootballService.getTeams Fallback]:", error);
      const fallback = await this.fallbackProvider.getTeams(competitionCode);
      return fallback;
    }
  }

  public async getTeamDetail(idOrSlug: string): Promise<ProviderTeamDetail | null> {
    const cacheKey = `football:team:${idOrSlug.toLowerCase()}`;
    const cached = await getCachedData<ProviderTeamDetail>(cacheKey);
    if (cached) return cached;

    try {
      let team = await this.provider.getTeam(idOrSlug);
      if (!team) {
        team = await this.fallbackProvider.getTeam(idOrSlug);
      }
      if (team) {
        await setCachedData(cacheKey, team, FootballService.TTL_TEAM);
      }
      return team;
    } catch (error) {
      console.warn(`[FootballService.getTeamDetail "${idOrSlug}" Fallback]:`, error);
      return this.fallbackProvider.getTeam(idOrSlug);
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
      let players = await this.provider.getPlayers(teamId);
      if (!players || players.length === 0) {
        players = await this.fallbackProvider.getPlayers(teamId);
      }
      await setCachedData(cacheKey, players, FootballService.TTL_PLAYER);
      return players;
    } catch (error) {
      console.warn("[FootballService.getPlayers Fallback]:", error);
      const fallback = await this.fallbackProvider.getPlayers(teamId);
      return fallback;
    }
  }

  public async getPlayerDetail(idOrSlug: string): Promise<ProviderPlayerDetail | null> {
    const cacheKey = `football:player:${idOrSlug.toLowerCase()}`;
    const cached = await getCachedData<ProviderPlayerDetail>(cacheKey);
    if (cached) return cached;

    try {
      let player = await this.provider.getPlayer(idOrSlug);
      if (!player) {
        player = await this.fallbackProvider.getPlayer(idOrSlug);
      }
      if (player) {
        await setCachedData(cacheKey, player, FootballService.TTL_PLAYER);
      }
      return player;
    } catch (error) {
      console.warn(`[FootballService.getPlayerDetail "${idOrSlug}" Fallback]:`, error);
      return this.fallbackProvider.getPlayer(idOrSlug);
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
      let transfers = await this.provider.getTransfers(params);
      if (!transfers || transfers.length === 0) {
        transfers = await this.fallbackProvider.getTransfers(params);
      }
      await setCachedData(cacheKey, transfers, FootballService.TTL_TRANSFERS);
      return transfers;
    } catch (error) {
      console.warn("[FootballService.getTransfers Fallback]:", error);
      const fallback = await this.fallbackProvider.getTransfers(params);
      return fallback;
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
