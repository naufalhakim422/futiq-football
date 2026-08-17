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

/**
 * Provider-agnostic interface for football data ingestion.
 * Implementations can be MockFootballProvider, OptaProvider, ApiFootballProvider, FootballDataOrgProvider, etc.
 */
export interface IFootballProvider {
  readonly name: string;

  /**
   * List all supported competitions (e.g. PL, UCL, La Liga)
   */
  getCompetitions(): Promise<ProviderCompetition[]>;

  /**
   * Fetch single competition by ID, slug or code
   */
  getCompetition(idOrCode: string): Promise<ProviderCompetition | null>;

  /**
   * List teams, optionally filtered by competition
   */
  getTeams(competitionCode?: string): Promise<ProviderTeam[]>;

  /**
   * Fetch comprehensive team detail including squad, manager, stadium, and recent matches
   */
  getTeam(idOrSlug: string): Promise<ProviderTeamDetail | null>;

  /**
   * List players, optionally filtered by team
   */
  getPlayers(teamId?: string): Promise<ProviderPlayer[]>;

  /**
   * Fetch single player profile with performance stats and recent transfers
   */
  getPlayer(idOrSlug: string): Promise<ProviderPlayerDetail | null>;

  /**
   * Fetch fixtures / match list matching query parameters
   */
  getFixtures(params?: FixtureQueryParams): Promise<ProviderMatch[]>;

  /**
   * Fetch full match telemetry including live events, lineups, and in-game statistics
   */
  getMatch(id: string): Promise<ProviderMatchDetail | null>;

  /**
   * Fetch active in-play live matches
   */
  getLiveMatches(): Promise<ProviderMatch[]>;

  /**
   * Fetch competition standings table for a specific season
   */
  getStandings(competitionCode: string, season?: string): Promise<ProviderStanding[]>;

  /**
   * Fetch transfer market movements (rumors and confirmed deals)
   */
  getTransfers(params?: TransferQueryParams): Promise<ProviderTransfer[]>;
}
