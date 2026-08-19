import { IFootballProvider } from "../provider.interface";
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
  MatchStatus,
  PlayerPosition,
  EventType,
} from "../types";
import { footballQuotaGuard } from "../quota-guard.service";
import { MockFootballProvider } from "./mock.provider";
import { getCompleteTeamLineup } from "../roster-generator";

// Official API-Football League IDs for top competitions
const LEAGUE_ID_MAP: Record<string, { id: number; name: string; code: string; slug: string; country: string; type: "LEAGUE" | "INTERNATIONAL" }> = {
  PL: { id: 39, name: "Premier League", code: "PL", slug: "premier-league", country: "England", type: "LEAGUE" },
  UCL: { id: 2, name: "UEFA Champions League", code: "UCL", slug: "champions-league", country: "Europe", type: "INTERNATIONAL" },
  LL: { id: 140, name: "La Liga", code: "LL", slug: "la-liga", country: "Spain", type: "LEAGUE" },
  SA: { id: 135, name: "Serie A", code: "SA", slug: "serie-a", country: "Italy", type: "LEAGUE" },
  BL1: { id: 78, name: "Bundesliga", code: "BL1", slug: "bundesliga", country: "Germany", type: "LEAGUE" },
  FL1: { id: 61, name: "Ligue 1", code: "FL1", slug: "ligue-1", country: "France", type: "LEAGUE" },
};

const CODE_BY_LEAGUE_ID: Record<number, string> = {
  39: "PL",
  2: "UCL",
  140: "LL",
  135: "SA",
  78: "BL1",
  61: "FL1",
};

export class ApiFootballProvider implements IFootballProvider {
  public readonly name = "ApiFootballProvider";

  private baseUrl: string;
  private apiKey: string;
  private fallbackProvider: MockFootballProvider;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey !== undefined ? apiKey : (process.env.FOOTBALL_API_KEY || "");
    this.baseUrl = baseUrl || process.env.FOOTBALL_API_BASE_URL || "https://v3.football.api-sports.io";
    this.fallbackProvider = new MockFootballProvider();
  }

  public isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Redacts secret credentials during any serialization or logging
   */
  public toJSON() {
    return {
      name: this.name,
      baseUrl: this.baseUrl,
      isConfigured: this.isConfigured(),
      apiKey: "[REDACTED]",
    };
  }

  /**
   * Internal HTTP client with timeout, quota guard, and graceful fallback
   */
  private async executeRequest<T>(
    endpoint: string,
    params?: Record<string, string | number | undefined>,
    options?: { isBackgroundSync?: boolean }
  ): Promise<T | null> {
    if (!this.isConfigured()) {
      return null;
    }

    // 1. Check server-side quota guard
    const quotaCheck = footballQuotaGuard.canMakeRequest(options);
    if (!quotaCheck.allowed) {
      console.warn(`[API-Football Quota Guard]: Request to ${endpoint} blocked: ${quotaCheck.reason}`);
      return null;
    }

    // 2. Build URL
    const url = new URL(`${this.baseUrl.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          url.searchParams.append(k, String(v));
        }
      });
    }

    // 3. Dispatch with timeout (8000ms)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "x-apisports-key": this.apiKey,
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      footballQuotaGuard.recordRequest(res.status, res.headers);

      if (res.status === 401 || res.status === 403) {
        console.error(`[API-Football Unauthorized]: Status ${res.status} returned. Check API credentials.`);
        return null;
      }

      if (res.status === 429) {
        console.warn(`[API-Football Rate Limit]: 429 Too Many Requests. Cooling down.`);
        return null;
      }

      if (!res.ok) {
        console.warn(`[API-Football HTTP Error]: ${res.status} ${res.statusText}`);
        return null;
      }

      const json = await res.json();

      // Check if API-Sports returned error messages in body
      if (json.errors && Object.keys(json.errors).length > 0) {
        const errorKey = Object.keys(json.errors)[0];
        console.warn(`[API-Football API Error Body]: ${errorKey}: ${json.errors[errorKey]}`);
        if (errorKey === "rateLimit" || errorKey === "requests") {
          footballQuotaGuard.recordRequest(429, res.headers, String(json.errors[errorKey]));
        }
        return null;
      }

      return json.response as T;
    } catch (err: any) {
      clearTimeout(timeoutId);
      const isTimeout = err.name === "AbortError";
      footballQuotaGuard.recordRequest(isTimeout ? 408 : 500, undefined, isTimeout ? "Timeout (8000ms)" : err.message);
      console.warn(`[API-Football Network Failure]: ${endpoint} -> ${err.message}`);
      return null;
    }
  }

  // ==========================================
  // 1. COMPETITIONS
  // ==========================================

  public async getCompetitions(): Promise<ProviderCompetition[]> {
    const raw = await this.executeRequest<any[]>("leagues", { current: "true" });
    if (!raw || raw.length === 0) {
      return this.fallbackProvider.getCompetitions();
    }

    const mapped: ProviderCompetition[] = [];
    for (const item of raw) {
      const code = CODE_BY_LEAGUE_ID[item.league?.id] || `LG_${item.league?.id}`;
      const config = LEAGUE_ID_MAP[code];

      mapped.push({
        id: `comp_${item.league?.id}`,
        externalId: String(item.league?.id),
        name: item.league?.name,
        code,
        slug: config?.slug || item.league?.name?.toLowerCase().replace(/\s+/g, "-"),
        type: config?.type || (item.league?.type === "League" ? "LEAGUE" : "INTERNATIONAL"),
        country: item.country?.name || "Global",
        logoUrl: item.league?.logo,
        currentSeason: item.seasons?.[0]?.year ? String(item.seasons[0].year) : "2025/2026",
      });
    }

    return mapped.length > 0 ? mapped : this.fallbackProvider.getCompetitions();
  }

  public async getCompetition(idOrCode: string): Promise<ProviderCompetition | null> {
    const uppercaseCode = idOrCode.toUpperCase();
    const config = LEAGUE_ID_MAP[uppercaseCode];

    if (config) {
      const raw = await this.executeRequest<any[]>("leagues", { id: config.id });
      if (raw && raw.length > 0) {
        const item = raw[0];
        return {
          id: `comp_${item.league?.id}`,
          externalId: String(item.league?.id),
          name: item.league?.name,
          code: config.code,
          slug: config.slug,
          type: config.type,
          country: item.country?.name || config.country,
          logoUrl: item.league?.logo,
          currentSeason: "2025/2026",
        };
      }
    }

    return this.fallbackProvider.getCompetition(idOrCode);
  }

  // ==========================================
  // 2. TEAMS
  // ==========================================

  public async getTeams(competitionCode?: string): Promise<ProviderTeam[]> {
    const code = competitionCode?.toUpperCase() || "PL";
    const config = LEAGUE_ID_MAP[code];
    const leagueId = config ? config.id : 39;

    const raw = await this.executeRequest<any[]>("teams", {
      league: leagueId,
      season: 2025,
    });

    if (!raw || raw.length === 0) {
      return this.fallbackProvider.getTeams(competitionCode);
    }

    return raw.map((item) => ({
      id: `team_${item.team?.id}`,
      externalId: String(item.team?.id),
      name: item.team?.name,
      shortName: item.team?.name?.replace(/ FC| AFC| CF/gi, "").trim() || item.team?.name,
      tla: item.team?.code || item.team?.name?.substring(0, 3).toUpperCase(),
      slug: item.team?.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      country: item.team?.country || "England",
      foundedYear: item.team?.founded,
      logoUrl: item.team?.logo,
      competitionCode: code,
      stadium: item.venue
        ? {
            name: item.venue.name,
            city: item.venue.city,
            capacity: item.venue.capacity,
            imageUrl: item.venue.image,
          }
        : undefined,
    }));
  }

  public async getTeam(idOrSlug: string): Promise<ProviderTeamDetail | null> {
    const cleanId = idOrSlug.replace("team_", "");
    const numericId = parseInt(cleanId, 10);

    if (!isNaN(numericId)) {
      const raw = await this.executeRequest<any[]>("teams", { id: numericId });
      if (raw && raw.length > 0) {
        const item = raw[0];
        const squad = await this.getPlayers(String(item.team?.id));

        return {
          id: `team_${item.team?.id}`,
          externalId: String(item.team?.id),
          name: item.team?.name,
          shortName: item.team?.name?.replace(/ FC| AFC| CF/gi, "").trim() || item.team?.name,
          tla: item.team?.code || item.team?.name?.substring(0, 3).toUpperCase(),
          slug: item.team?.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          country: item.team?.country || "England",
          foundedYear: item.team?.founded,
          logoUrl: item.team?.logo,
          stadium: item.venue
            ? {
                name: item.venue.name,
                city: item.venue.city,
                capacity: item.venue.capacity,
                imageUrl: item.venue.image,
              }
            : undefined,
          squad,
          recentMatches: [],
          upcomingFixtures: [],
        };
      }
    }

    return this.fallbackProvider.getTeam(idOrSlug);
  }

  // ==========================================
  // 3. PLAYERS
  // ==========================================

  public async getPlayers(teamId?: string): Promise<ProviderPlayer[]> {
    if (teamId) {
      const numericTeamId = parseInt(teamId.replace("team_", ""), 10);
      if (!isNaN(numericTeamId)) {
        const raw = await this.executeRequest<any[]>("players/squads", { team: numericTeamId });
        if (raw && raw.length > 0 && raw[0].players) {
          return raw[0].players.map((p: any) => ({
            id: `ply_${p.id}`,
            externalId: String(p.id),
            name: p.name,
            slug: p.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            position: this.mapPlayerPosition(p.position),
            shirtNumber: p.number,
            nationality: "International",
            photoUrl: p.photo,
            teamId: `team_${numericTeamId}`,
          }));
        }
      }
    }

    return this.fallbackProvider.getPlayers(teamId);
  }

  public async getPlayer(idOrSlug: string): Promise<ProviderPlayerDetail | null> {
    const cleanId = idOrSlug.replace("ply_", "");
    const numericId = parseInt(cleanId, 10);

    if (!isNaN(numericId)) {
      const raw = await this.executeRequest<any[]>("players", { id: numericId, season: 2025 });
      if (raw && raw.length > 0) {
        const item = raw[0];
        const p = item.player;
        const stats = item.statistics?.[0];

        return {
          id: `ply_${p.id}`,
          externalId: String(p.id),
          name: p.name,
          firstName: p.firstname,
          lastName: p.lastname,
          slug: p.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          position: this.mapPlayerPosition(stats?.games?.position),
          shirtNumber: stats?.games?.number,
          nationality: p.nationality || "International",
          dateOfBirth: p.birth?.date,
          photoUrl: p.photo,
          teamId: stats?.team?.id ? `team_${stats.team.id}` : undefined,
          teamName: stats?.team?.name,
          teamTla: stats?.team?.name?.substring(0, 3).toUpperCase(),
          statistics: stats
            ? [
                {
                  playerId: `ply_${p.id}`,
                  season: "2025/2026",
                  competitionCode: stats.league?.name || "PL",
                  appearances: stats.games?.appearences || 0,
                  goals: stats.goals?.total || 0,
                  assists: stats.goals?.assists || 0,
                  yellowCards: stats.cards?.yellow || 0,
                  redCards: stats.cards?.red || 0,
                  minutesPlayed: stats.games?.minutes || 0,
                  averageRating: stats.games?.rating ? parseFloat(stats.games.rating) : 7.0,
                },
              ]
            : [],
        };
      }
    }

    return this.fallbackProvider.getPlayer(idOrSlug);
  }

  // ==========================================
  // 4. FIXTURES & LIVE MATCHES
  // ==========================================

  public async getLiveMatches(): Promise<ProviderMatch[]> {
    const raw = await this.executeRequest<any[]>("fixtures", { live: "all" });
    if (raw === null || raw === undefined) {
      return this.fallbackProvider.getLiveMatches();
    }

    return raw.map((item) => this.mapMatchRecord(item));
  }

  public async getFixtures(params?: FixtureQueryParams): Promise<ProviderMatch[]> {
    const apiParams: Record<string, any> = {};

    if (params?.competitionCode) {
      const config = LEAGUE_ID_MAP[params.competitionCode.toUpperCase()];
      if (config) apiParams.league = config.id;
    }

    if (params?.date) {
      apiParams.date = params.date;
    }

    if (params?.status) {
      if (params.status.startsWith("LIVE")) apiParams.live = "all";
      else if (params.status === MatchStatus.FINISHED) apiParams.status = "FT";
      else if (params.status === MatchStatus.SCHEDULED) apiParams.status = "NS";
    }

    // If no specific league or date is given, default to today's real fixtures
    if (!apiParams.league && !apiParams.date && !apiParams.live) {
      apiParams.date = new Date().toISOString().split("T")[0];
    }

    const raw = await this.executeRequest<any[]>("fixtures", apiParams);
    if (raw === null || raw === undefined) {
      return this.fallbackProvider.getFixtures(params);
    }

    const mapped = raw.map((item) => this.mapMatchRecord(item));
    if (params?.limit && mapped.length > params.limit) {
      return mapped.slice(0, params.limit);
    }
    return mapped;
  }

  public async getMatch(id: string): Promise<ProviderMatchDetail | null> {
    const numericId = parseInt(id.replace("match_", ""), 10);
    if (!isNaN(numericId)) {
      const raw = await this.executeRequest<any[]>("fixtures", { id: numericId });
      if (raw && raw.length > 0) {
        const item = raw[0];
        const baseMatch = this.mapMatchRecord(item);

        const events = (item.events || []).map((ev: any, idx: number) => {
          let eventType: EventType = EventType.GOAL;
          const rawType = ev.type?.toUpperCase();
          const detail = ev.detail || "";

          if (rawType === "GOAL") {
            eventType = detail.toLowerCase().includes("own") ? EventType.OWN_GOAL : EventType.GOAL;
          } else if (rawType === "CARD") {
            eventType = detail.toLowerCase().includes("red") ? EventType.RED_CARD : EventType.YELLOW_CARD;
          } else if (rawType === "SUBST") {
            eventType = EventType.SUBSTITUTION;
          } else if (rawType === "VAR") {
            eventType = EventType.VAR;
          }

          return {
            id: `ev_${idx}`,
            type: eventType,
            minute: ev.time?.elapsed || 0,
            extraMinute: ev.time?.extra || undefined,
            teamId: `team_${ev.team?.id}`,
            playerId: `ply_${ev.player?.id}`,
            playerName: ev.player?.name || "Pemain",
            assistPlayerId: ev.assist?.id ? `ply_${ev.assist.id}` : undefined,
            assistPlayerName: ev.assist?.name || undefined,
            inPlayerName: eventType === EventType.SUBSTITUTION ? ev.player?.name : undefined,
            outPlayerName: eventType === EventType.SUBSTITUTION ? ev.assist?.name : undefined,
            detail: ev.detail,
          };
        });

        const homeEvents = events.filter((e: any) => e.teamId === `team_${item.teams?.home?.id}`);
        const awayEvents = events.filter((e: any) => e.teamId === `team_${item.teams?.away?.id}`);

        const homeRawLineup = item.lineups?.find((l: any) => l.team?.id === item.teams?.home?.id) || item.lineups?.[0];
        const awayRawLineup = item.lineups?.find((l: any) => l.team?.id === item.teams?.away?.id) || item.lineups?.[1];

        const homeLineup = this.buildTeamLineup(
          homeRawLineup,
          baseMatch.homeTeam.name,
          `team_${item.teams?.home?.id}`,
          homeEvents,
          true,
          baseMatch.homeScore
        );

        const awayLineup = this.buildTeamLineup(
          awayRawLineup,
          baseMatch.awayTeam.name,
          `team_${item.teams?.away?.id}`,
          awayEvents,
          false,
          baseMatch.awayScore
        );

        // Find match MOTM
        let topRating = 0;
        let motmPlayer: any = null;
        [...homeLineup.starters, ...awayLineup.starters].forEach((p) => {
          const r = typeof p.rating === "number" ? p.rating : parseFloat(String(p.rating || 0));
          if (r > topRating) {
            topRating = r;
            motmPlayer = p;
          }
        });
        if (motmPlayer) {
          motmPlayer.isMotm = true;
        }

        // Stats calculation / extraction helper
        const getStatValue = (teamIdx: number, typeName: string): number | undefined => {
          const statsList = item.statistics?.[teamIdx]?.statistics;
          if (!statsList) return undefined;
          const found = statsList.find((s: any) => s.type?.toLowerCase() === typeName.toLowerCase());
          if (!found || found.value === null || found.value === undefined) return undefined;
          if (typeof found.value === "string") {
            const parsed = parseInt(found.value.replace("%", ""), 10);
            return isNaN(parsed) ? undefined : parsed;
          }
          return typeof found.value === "number" ? found.value : undefined;
        };

        const posH = getStatValue(0, "Ball Possession") ?? (baseMatch.homeScore > baseMatch.awayScore ? 52 : 48);
        const posA = getStatValue(1, "Ball Possession") ?? (100 - posH);

        const shotsH = getStatValue(0, "Total Shots") ?? (baseMatch.homeScore * 4 + 6);
        const shotsA = getStatValue(1, "Total Shots") ?? (baseMatch.awayScore * 4 + 5);

        const onTargetH = getStatValue(0, "Shots on Goal") ?? Math.max(baseMatch.homeScore + 2, 3);
        const onTargetA = getStatValue(1, "Shots on Goal") ?? Math.max(baseMatch.awayScore + 2, 2);

        const offTargetH = getStatValue(0, "Shots off Goal") ?? Math.max(shotsH - onTargetH, 2);
        const offTargetA = getStatValue(1, "Shots off Goal") ?? Math.max(shotsA - onTargetA, 2);

        const blockedH = getStatValue(0, "Blocked Shots");
        const blockedA = getStatValue(1, "Blocked Shots");

        const cornersH = getStatValue(0, "Corner Kicks") ?? 5;
        const cornersA = getStatValue(1, "Corner Kicks") ?? 4;

        const foulsH = getStatValue(0, "Fouls") ?? 11;
        const foulsA = getStatValue(1, "Fouls") ?? 12;

        const yellowCardsH = getStatValue(0, "Yellow Cards") ?? homeEvents.filter((e: any) => e.type === EventType.YELLOW_CARD).length;
        const yellowCardsA = getStatValue(1, "Yellow Cards") ?? awayEvents.filter((e: any) => e.type === EventType.YELLOW_CARD).length;

        const redCardsH = getStatValue(0, "Red Cards") ?? homeEvents.filter((e: any) => e.type === EventType.RED_CARD).length;
        const redCardsA = getStatValue(1, "Red Cards") ?? awayEvents.filter((e: any) => e.type === EventType.RED_CARD).length;

        const offsidesH = getStatValue(0, "Offsides") ?? 2;
        const offsidesA = getStatValue(1, "Offsides") ?? 1;

        const savesH = getStatValue(0, "Goalkeeper Saves") ?? Math.max(onTargetA - baseMatch.awayScore, 1);
        const savesA = getStatValue(1, "Goalkeeper Saves") ?? Math.max(onTargetH - baseMatch.homeScore, 1);

        const passesH = getStatValue(0, "Total Passes") ?? 460;
        const passesA = getStatValue(1, "Total Passes") ?? 420;

        const passAccH = getStatValue(0, "Passes %") ?? 84;
        const passAccA = getStatValue(1, "Passes %") ?? 82;

        return {
          ...baseMatch,
          lineups: {
            home: homeLineup,
            away: awayLineup,
          },
          events,
          stats: {
            possessionHome: posH,
            possessionAway: posA,
            shotsHome: shotsH,
            shotsAway: shotsA,
            shotsOnTargetHome: onTargetH,
            shotsOnTargetAway: onTargetA,
            shotsOffTargetHome: offTargetH,
            shotsOffTargetAway: offTargetA,
            blockedShotsHome: blockedH,
            blockedShotsAway: blockedA,
            cornersHome: cornersH,
            cornersAway: cornersA,
            foulsHome: foulsH,
            foulsAway: foulsA,
            yellowCardsHome: yellowCardsH,
            yellowCardsAway: yellowCardsA,
            redCardsHome: redCardsH,
            redCardsAway: redCardsA,
            offsidesHome: offsidesH,
            offsidesAway: offsidesA,
            savesHome: savesH,
            savesAway: savesA,
            passesHome: passesH,
            passesAway: passesA,
            passAccuracyHome: passAccH,
            passAccuracyAway: passAccA,
            xgHome: parseFloat((baseMatch.homeScore * 0.75 + onTargetH * 0.15).toFixed(2)),
            xgAway: parseFloat((baseMatch.awayScore * 0.75 + onTargetA * 0.15).toFixed(2)),
          },
        };
      }
    }

    return this.fallbackProvider.getMatch(id);
  }

  private buildTeamLineup(
    rawLineup: any,
    teamName: string,
    teamId: string,
    events: any[],
    isHome: boolean,
    score: number
  ) {
    const formation = rawLineup?.formation || (isHome ? "4-3-3" : "4-2-3-1");

    if (rawLineup?.startXI && rawLineup.startXI.length > 0) {
      return {
        teamId,
        teamName,
        formation,
        manager: {
          name: rawLineup.coach?.name || `Pelatih ${teamName}`,
          photoUrl: rawLineup.coach?.photo || undefined,
        },
        starters: rawLineup.startXI.map((x: any, idx: number) => {
          const hasScored = events.some((e: any) => e.type === EventType.GOAL && e.playerId === `ply_${x.player?.id}`);
          const hasCard = events.some((e: any) => (e.type === EventType.YELLOW_CARD || e.type === EventType.RED_CARD) && e.playerId === `ply_${x.player?.id}`);
          
          let ratingNum = x.player?.rating ? parseFloat(x.player.rating) : (7.2 + (score > 1 ? 0.4 : 0));
          if (hasScored) ratingNum += 1.3;
          if (hasCard) ratingNum -= 0.5;

          const photoUrl = x.player?.id ? `/api/football/player-image?id=${x.player.id}` : undefined;

          return {
            playerId: `ply_${x.player?.id}`,
            name: x.player?.name || `Player ${idx + 1}`,
            position: x.player?.pos || (idx === 0 ? "GK" : idx < 5 ? "DF" : idx < 8 ? "MF" : "FW"),
            number: x.player?.number || idx + 1,
            gridPosition: x.player?.grid,
            photoUrl,
            rating: parseFloat(Math.min(9.8, Math.max(6.0, ratingNum)).toFixed(1)),
            isCaptain: idx === 0 || idx === 3,
            goals: hasScored ? 1 : 0,
          };
        }),
        bench: (rawLineup.substitutes || []).map((x: any, idx: number) => ({
          playerId: `ply_${x.player?.id}`,
          name: x.player?.name || `Cadangan ${idx + 1}`,
          position: x.player?.pos || "SUB",
          number: x.player?.number || idx + 12,
          photoUrl: x.player?.id ? `/api/football/player-image?id=${x.player.id}` : undefined,
          rating: 6.8,
        })),
      };
    }

    // Generate full authentic tactical starting 11 & bench if provider does not have lineups
    return getCompleteTeamLineup(teamName, teamId, score, events, isHome);
  }

  // ==========================================
  // 5. STANDINGS
  // ==========================================

  public async getStandings(competitionCode: string, season = "2025"): Promise<ProviderStanding[]> {
    const code = competitionCode.toUpperCase();
    const config = LEAGUE_ID_MAP[code];
    const leagueId = config ? config.id : 39;

    const raw = await this.executeRequest<any[]>("standings", {
      league: leagueId,
      season: parseInt(season, 10) || 2025,
    });

    if (!raw || raw.length === 0 || !raw[0].league?.standings?.[0]) {
      return this.fallbackProvider.getStandings(competitionCode, season);
    }

    const table = raw[0].league.standings[0];
    return table.map((row: any) => ({
      position: row.rank,
      team: {
        id: `team_${row.team?.id}`,
        name: row.team?.name,
        shortName: row.team?.name?.replace(/ FC| AFC| CF/gi, "").trim() || row.team?.name,
        tla: row.team?.name?.substring(0, 3).toUpperCase(),
        logoUrl: row.team?.logo,
        slug: row.team?.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      },
      playedGames: row.all?.played || 0,
      won: row.all?.win || 0,
      draw: row.all?.draw || 0,
      lost: row.all?.lose || 0,
      points: row.points || 0,
      goalsFor: row.all?.goals?.for || 0,
      goalsAgainst: row.all?.goals?.against || 0,
      goalDifference: row.goalsDiff || 0,
      form: row.form,
      status: row.description,
    }));
  }

  // ==========================================
  // 6. TRANSFERS
  // ==========================================

  public async getTransfers(params?: TransferQueryParams): Promise<ProviderTransfer[]> {
    return this.fallbackProvider.getTransfers(params);
  }

  // ==========================================
  // HELPER MAPPERS
  // ==========================================

  private mapMatchRecord(item: any): ProviderMatch {
    const knownCode = CODE_BY_LEAGUE_ID[item.league?.id];
    const leagueName = item.league?.name || "Football";
    const leagueCode = knownCode || (item.league?.name?.length <= 4 ? item.league?.name : item.league?.name?.substring(0, 3).toUpperCase()) || "INT";
    const leagueSlug = (knownCode && LEAGUE_ID_MAP[knownCode]?.slug) || item.league?.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "football";

    const isInternationalComp = item.league?.country === "World" || item.league?.type === "Cup";

    return {
      id: `match_${item.fixture?.id}`,
      externalId: String(item.fixture?.id),
      competition: {
        id: `comp_${item.league?.id}`,
        name: leagueName,
        code: leagueCode,
        slug: leagueSlug,
        logoUrl: item.league?.logo,
        isInternational: isInternationalComp,
      },
      season: String(item.league?.season || "2025/2026"),
      round: item.league?.round || "Regular Season",
      homeTeam: {
        id: `team_${item.teams?.home?.id}`,
        name: item.teams?.home?.name,
        shortName: item.teams?.home?.name?.replace(/ FC| AFC| CF/gi, "").trim() || item.teams?.home?.name,
        tla: item.teams?.home?.name?.substring(0, 3).toUpperCase(),
        slug: item.teams?.home?.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        logoUrl: item.teams?.home?.logo,
        isNationalTeam: item.teams?.home?.national ?? isInternationalComp,
      },
      awayTeam: {
        id: `team_${item.teams?.away?.id}`,
        name: item.teams?.away?.name,
        shortName: item.teams?.away?.name?.replace(/ FC| AFC| CF/gi, "").trim() || item.teams?.away?.name,
        tla: item.teams?.away?.name?.substring(0, 3).toUpperCase(),
        slug: item.teams?.away?.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        logoUrl: item.teams?.away?.logo,
        isNationalTeam: item.teams?.away?.national ?? isInternationalComp,
      },
      venue: item.fixture?.venue?.name ? {
        name: item.fixture.venue.name,
        city: item.fixture.venue.city || "",
      } : undefined,
      referee: item.fixture?.referee || undefined,
      status: this.mapMatchStatus(item.fixture?.status?.short),
      minute: item.fixture?.status?.elapsed || undefined,
      matchDate: item.fixture?.date || new Date().toISOString(),
      homeScore: item.goals?.home ?? 0,
      awayScore: item.goals?.away ?? 0,
      htHomeScore: item.score?.halftime?.home ?? undefined,
      htAwayScore: item.score?.halftime?.away ?? undefined,
      etHomeScore: item.score?.extratime?.home ?? undefined,
      etAwayScore: item.score?.extratime?.away ?? undefined,
      penaltyHomeScore: item.score?.penalty?.home ?? undefined,
      penaltyAwayScore: item.score?.penalty?.away ?? undefined,
      decidedByPenalty: item.score?.penalty?.home !== null && item.score?.penalty?.home !== undefined,
    };
  }

  private mapMatchStatus(shortStatus?: string): MatchStatus {
    switch (shortStatus) {
      case "1H":
        return MatchStatus.LIVE_1H;
      case "2H":
        return MatchStatus.LIVE_2H;
      case "HT":
        return MatchStatus.HT;
      case "ET":
        return MatchStatus.ET;
      case "P":
      case "PEN":
        return MatchStatus.PENALTY;
      case "FT":
      case "AET":
        return MatchStatus.FINISHED;
      case "PST":
        return MatchStatus.POSTPONED;
      case "CANC":
        return MatchStatus.CANCELLED;
      case "NS":
      case "TBD":
      default:
        return MatchStatus.SCHEDULED;
    }
  }

  private mapPlayerPosition(pos?: string): PlayerPosition {
    if (!pos) return PlayerPosition.MIDFIELDER;
    const p = pos.toUpperCase();
    if (p.startsWith("G") || p.includes("GOAL")) return PlayerPosition.GOALKEEPER;
    if (p.startsWith("D") || p.includes("DEF")) return PlayerPosition.DEFENDER;
    if (p.startsWith("M") || p.includes("MID")) return PlayerPosition.MIDFIELDER;
    if (p.startsWith("A") || p.startsWith("F") || p.includes("ATT") || p.includes("FOR")) return PlayerPosition.ATTACKER;
    return PlayerPosition.MIDFIELDER;
  }
}
