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
} from "../types";

export class MockFootballProvider implements IFootballProvider {
  public readonly name = "MockFootballProvider";

  // ==========================================
  // 1. MOCK DATA DEFINITIONS
  // ==========================================

  private competitions: ProviderCompetition[] = [
    {
      id: "comp_pl",
      externalId: "ext_pl",
      slug: "premier-league",
      name: "Premier League",
      code: "PL",
      type: "LEAGUE",
      country: "England",
      logoUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=200&auto=format&fit=crop",
      currentSeason: "2025/2026",
    },
    {
      id: "comp_ucl",
      externalId: "ext_ucl",
      slug: "champions-league",
      name: "UEFA Champions League",
      code: "UCL",
      type: "INTERNATIONAL",
      country: "Europe",
      logoUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=200&auto=format&fit=crop",
      currentSeason: "2025/2026",
    },
    {
      id: "comp_ll",
      externalId: "ext_ll",
      slug: "la-liga",
      name: "La Liga",
      code: "LL",
      type: "LEAGUE",
      country: "Spain",
      logoUrl: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=200&auto=format&fit=crop",
      currentSeason: "2025/2026",
    },
    {
      id: "comp_sa",
      externalId: "ext_sa",
      slug: "serie-a",
      name: "Serie A",
      code: "SA",
      type: "LEAGUE",
      country: "Italy",
      logoUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=200&auto=format&fit=crop",
      currentSeason: "2025/2026",
    },
  ];

  private teams: ProviderTeam[] = [
    {
      id: "team_ars",
      externalId: "ext_team_ars",
      slug: "arsenal",
      name: "Arsenal FC",
      shortName: "Arsenal",
      tla: "ARS",
      country: "England",
      foundedYear: 1886,
      websiteUrl: "https://www.arsenal.com",
      competitionCode: "PL",
      stadium: {
        name: "Emirates Stadium",
        city: "London",
        capacity: 60704,
      },
      manager: {
        name: "Mikel Arteta",
        slug: "mikel-arteta",
        nationality: "Spain",
      },
    },
    {
      id: "team_mci",
      externalId: "ext_team_mci",
      slug: "manchester-city",
      name: "Manchester City FC",
      shortName: "Man City",
      tla: "MCI",
      country: "England",
      foundedYear: 1894,
      websiteUrl: "https://www.mancity.com",
      competitionCode: "PL",
      stadium: {
        name: "Etihad Stadium",
        city: "Manchester",
        capacity: 53400,
      },
      manager: {
        name: "Pep Guardiola",
        slug: "pep-guardiola",
        nationality: "Spain",
      },
    },
    {
      id: "team_liv",
      externalId: "ext_team_liv",
      slug: "liverpool",
      name: "Liverpool FC",
      shortName: "Liverpool",
      tla: "LIV",
      country: "England",
      foundedYear: 1892,
      websiteUrl: "https://www.liverpoolfc.com",
      competitionCode: "PL",
      stadium: {
        name: "Anfield",
        city: "Liverpool",
        capacity: 61276,
      },
      manager: {
        name: "Arne Slot",
        slug: "arne-slot",
        nationality: "Netherlands",
      },
    },
    {
      id: "team_che",
      externalId: "ext_team_che",
      slug: "chelsea",
      name: "Chelsea FC",
      shortName: "Chelsea",
      tla: "CHE",
      country: "England",
      foundedYear: 1905,
      websiteUrl: "https://www.chelseafc.com",
      competitionCode: "PL",
      stadium: {
        name: "Stamford Bridge",
        city: "London",
        capacity: 40341,
      },
      manager: {
        name: "Enzo Maresca",
        slug: "enzo-maresca",
        nationality: "Italy",
      },
    },
    {
      id: "team_rma",
      externalId: "ext_team_rma",
      slug: "real-madrid",
      name: "Real Madrid CF",
      shortName: "Real Madrid",
      tla: "RMA",
      country: "Spain",
      foundedYear: 1902,
      websiteUrl: "https://www.realmadrid.com",
      competitionCode: "LL",
      stadium: {
        name: "Santiago Bernabéu",
        city: "Madrid",
        capacity: 81044,
      },
      manager: {
        name: "Carlo Ancelotti",
        slug: "carlo-ancelotti",
        nationality: "Italy",
      },
    },
    {
      id: "team_bar",
      externalId: "ext_team_bar",
      slug: "barcelona",
      name: "FC Barcelona",
      shortName: "Barcelona",
      tla: "BAR",
      country: "Spain",
      foundedYear: 1899,
      websiteUrl: "https://www.fcbarcelona.com",
      competitionCode: "LL",
      stadium: {
        name: "Spotify Camp Nou",
        city: "Barcelona",
        capacity: 99354,
      },
      manager: {
        name: "Hansi Flick",
        slug: "hansi-flick",
        nationality: "Germany",
      },
    },
  ];

  private players: ProviderPlayer[] = [
    {
      id: "ply_saka",
      externalId: "ext_ply_saka",
      slug: "bukayo-saka",
      name: "Bukayo Saka",
      firstName: "Bukayo",
      lastName: "Saka",
      position: "ATTACKER",
      shirtNumber: 7,
      nationality: "England",
      dateOfBirth: "2001-09-05",
      teamId: "team_ars",
      teamName: "Arsenal FC",
      teamTla: "ARS",
    },
    {
      id: "ply_odegaard",
      externalId: "ext_ply_odegaard",
      slug: "martin-odegaard",
      name: "Martin Ødegaard",
      firstName: "Martin",
      lastName: "Ødegaard",
      position: "MIDFIELDER",
      shirtNumber: 8,
      nationality: "Norway",
      dateOfBirth: "1998-12-17",
      teamId: "team_ars",
      teamName: "Arsenal FC",
      teamTla: "ARS",
    },
    {
      id: "ply_saliba",
      externalId: "ext_ply_saliba",
      slug: "william-saliba",
      name: "William Saliba",
      firstName: "William",
      lastName: "Saliba",
      position: "DEFENDER",
      shirtNumber: 2,
      nationality: "France",
      dateOfBirth: "2001-03-24",
      teamId: "team_ars",
      teamName: "Arsenal FC",
      teamTla: "ARS",
    },
    {
      id: "ply_haaland",
      externalId: "ext_ply_haaland",
      slug: "erling-haaland",
      name: "Erling Haaland",
      firstName: "Erling",
      lastName: "Haaland",
      position: "ATTACKER",
      shirtNumber: 9,
      nationality: "Norway",
      dateOfBirth: "2000-07-21",
      teamId: "team_mci",
      teamName: "Manchester City FC",
      teamTla: "MCI",
    },
    {
      id: "ply_rodri",
      externalId: "ext_ply_rodri",
      slug: "rodri",
      name: "Rodrigo Hernández",
      firstName: "Rodrigo",
      lastName: "Hernández",
      position: "MIDFIELDER",
      shirtNumber: 16,
      nationality: "Spain",
      dateOfBirth: "1996-06-22",
      teamId: "team_mci",
      teamName: "Manchester City FC",
      teamTla: "MCI",
    },
    {
      id: "ply_bellingham",
      externalId: "ext_ply_bellingham",
      slug: "jude-bellingham",
      name: "Jude Bellingham",
      firstName: "Jude",
      lastName: "Bellingham",
      position: "MIDFIELDER",
      shirtNumber: 5,
      nationality: "England",
      dateOfBirth: "2003-06-29",
      teamId: "team_rma",
      teamName: "Real Madrid CF",
      teamTla: "RMA",
    },
    {
      id: "ply_vini",
      externalId: "ext_ply_vini",
      slug: "vinicius-junior",
      name: "Vinícius Júnior",
      firstName: "Vinícius",
      lastName: "Júnior",
      position: "ATTACKER",
      shirtNumber: 7,
      nationality: "Brazil",
      dateOfBirth: "2000-07-12",
      teamId: "team_rma",
      teamName: "Real Madrid CF",
      teamTla: "RMA",
    },
    {
      id: "ply_yamal",
      externalId: "ext_ply_yamal",
      slug: "lamine-yamal",
      name: "Lamine Yamal",
      firstName: "Lamine",
      lastName: "Yamal",
      position: "ATTACKER",
      shirtNumber: 19,
      nationality: "Spain",
      dateOfBirth: "2007-07-13",
      teamId: "team_bar",
      teamName: "FC Barcelona",
      teamTla: "BAR",
    },
  ];

  private matches: ProviderMatchDetail[] = [
    {
      id: "match_ars_che",
      externalId: "ext_match_ars_che",
      competition: {
        id: "comp_pl",
        name: "Premier League",
        code: "PL",
        slug: "premier-league",
      },
      season: "2025/2026",
      round: "Matchday 28",
      homeTeam: {
        id: "team_ars",
        name: "Arsenal FC",
        shortName: "Arsenal",
        tla: "ARS",
        slug: "arsenal",
      },
      awayTeam: {
        id: "team_che",
        name: "Chelsea FC",
        shortName: "Chelsea",
        tla: "CHE",
        slug: "chelsea",
      },
      venue: {
        name: "Emirates Stadium",
        city: "London",
        capacity: 60704,
      },
      matchDate: new Date().toISOString(),
      status: "LIVE_2H",
      minute: 76,
      homeScore: 2,
      awayScore: 1,
      htHomeScore: 1,
      htAwayScore: 1,
      referee: "Michael Oliver",
      events: [
        {
          id: "ev_1",
          minute: 19,
          type: "GOAL",
          teamId: "team_ars",
          playerId: "ply_saka",
          playerName: "Bukayo Saka",
          assistPlayerId: "ply_odegaard",
          assistPlayerName: "Martin Ødegaard",
          detail: "Curled left foot into top corner",
        },
        {
          id: "ev_2",
          minute: 38,
          type: "GOAL",
          teamId: "team_che",
          playerName: "Cole Palmer",
          detail: "Penalty converted low right",
        },
        {
          id: "ev_3",
          minute: 62,
          type: "GOAL",
          teamId: "team_ars",
          playerId: "ply_odegaard",
          playerName: "Martin Ødegaard",
          detail: "First time half-volley from edge of box",
        },
        {
          id: "ev_4",
          minute: 71,
          type: "YELLOW_CARD",
          teamId: "team_che",
          playerName: "Moisés Caicedo",
          detail: "Tactical foul in transition",
        },
      ],
      lineups: {
        home: {
          teamId: "team_ars",
          formation: "4-3-3",
          starters: [
            { name: "David Raya", number: 22, position: "GK", gridPosition: "1:1" },
            { name: "Ben White", number: 4, position: "RB", gridPosition: "2:4" },
            { name: "William Saliba", number: 2, position: "CB", gridPosition: "2:3", playerId: "ply_saliba" },
            { name: "Gabriel Magalhães", number: 6, position: "CB", gridPosition: "2:2" },
            { name: "Jurriën Timber", number: 12, position: "LB", gridPosition: "2:1" },
            { name: "Thomas Partey", number: 5, position: "DM", gridPosition: "3:2" },
            { name: "Declan Rice", number: 41, position: "CM", gridPosition: "4:3" },
            { name: "Martin Ødegaard", number: 8, position: "AM", gridPosition: "4:1", playerId: "ply_odegaard" },
            { name: "Bukayo Saka", number: 7, position: "RW", gridPosition: "5:3", playerId: "ply_saka" },
            { name: "Kai Havertz", number: 29, position: "ST", gridPosition: "5:2" },
            { name: "Gabriel Martinelli", number: 11, position: "LW", gridPosition: "5:1" },
          ],
          bench: [
            { name: "Aaron Ramsdale", number: 1, position: "GK" },
            { name: "Leandro Trossard", number: 19, position: "FW" },
            { name: "Jorginho", number: 20, position: "MF" },
          ],
        },
        away: {
          teamId: "team_che",
          formation: "4-2-3-1",
          starters: [
            { name: "Robert Sánchez", number: 1, position: "GK", gridPosition: "1:1" },
            { name: "Malo Gusto", number: 27, position: "RB", gridPosition: "2:4" },
            { name: "Wesley Fofana", number: 29, position: "CB", gridPosition: "2:3" },
            { name: "Levi Colwill", number: 6, position: "CB", gridPosition: "2:2" },
            { name: "Marc Cucurella", number: 3, position: "LB", gridPosition: "2:1" },
            { name: "Moisés Caicedo", number: 25, position: "DM", gridPosition: "3:3" },
            { name: "Enzo Fernández", number: 8, position: "DM", gridPosition: "3:1" },
            { name: "Noni Madueke", number: 11, position: "RW", gridPosition: "4:3" },
            { name: "Cole Palmer", number: 20, position: "AM", gridPosition: "4:2" },
            { name: "Pedro Neto", number: 7, position: "LW", gridPosition: "4:1" },
            { name: "Nicolas Jackson", number: 15, position: "ST", gridPosition: "5:2" },
          ],
          bench: [
            { name: "Filip Jörgensen", number: 12, position: "GK" },
            { name: "Christopher Nkunku", number: 18, position: "FW" },
          ],
        },
      },
      stats: {
        possessionHome: 58,
        possessionAway: 42,
        shotsHome: 14,
        shotsAway: 8,
        shotsOnTargetHome: 6,
        shotsOnTargetAway: 3,
        cornersHome: 7,
        cornersAway: 4,
        foulsHome: 9,
        foulsAway: 12,
      },
    },
    {
      id: "match_mci_liv",
      externalId: "ext_match_mci_liv",
      competition: {
        id: "comp_pl",
        name: "Premier League",
        code: "PL",
        slug: "premier-league",
      },
      season: "2025/2026",
      round: "Matchday 28",
      homeTeam: {
        id: "team_mci",
        name: "Manchester City FC",
        shortName: "Man City",
        tla: "MCI",
        slug: "manchester-city",
      },
      awayTeam: {
        id: "team_liv",
        name: "Liverpool FC",
        shortName: "Liverpool",
        tla: "LIV",
        slug: "liverpool",
      },
      venue: {
        name: "Etihad Stadium",
        city: "Manchester",
        capacity: 53400,
      },
      matchDate: new Date().toISOString(),
      status: "HT",
      minute: 45,
      homeScore: 1,
      awayScore: 1,
      htHomeScore: 1,
      htAwayScore: 1,
      events: [
        {
          id: "ev_mci_1",
          minute: 23,
          type: "GOAL",
          teamId: "team_mci",
          playerId: "ply_haaland",
          playerName: "Erling Haaland",
          detail: "Left foot blast into bottom corner",
        },
        {
          id: "ev_liv_1",
          minute: 41,
          type: "GOAL",
          teamId: "team_liv",
          playerName: "Mohamed Salah",
          detail: "Counter-attack clinical chip",
        },
      ],
      lineups: {},
    },
    {
      id: "match_rma_bar",
      externalId: "ext_match_rma_bar",
      competition: {
        id: "comp_ll",
        name: "La Liga",
        code: "LL",
        slug: "la-liga",
      },
      season: "2025/2026",
      round: "Matchday 26",
      homeTeam: {
        id: "team_rma",
        name: "Real Madrid CF",
        shortName: "Real Madrid",
        tla: "RMA",
        slug: "real-madrid",
      },
      awayTeam: {
        id: "team_bar",
        name: "FC Barcelona",
        shortName: "Barcelona",
        tla: "BAR",
        slug: "barcelona",
      },
      venue: {
        name: "Santiago Bernabéu",
        city: "Madrid",
        capacity: 81044,
      },
      matchDate: new Date(Date.now() - 86400000).toISOString(),
      status: "FINISHED",
      homeScore: 3,
      awayScore: 2,
      htHomeScore: 1,
      htAwayScore: 1,
      events: [],
      lineups: {},
    },
    {
      id: "match_ucl_bay_psg",
      externalId: "ext_match_ucl_bay_psg",
      competition: {
        id: "comp_ucl",
        name: "UEFA Champions League",
        code: "UCL",
        slug: "champions-league",
      },
      season: "2025/2026",
      round: "Quarter-Final",
      homeTeam: {
        id: "team_bay",
        name: "FC Bayern München",
        shortName: "Bayern",
        tla: "BAY",
        slug: "bayern-munich",
      },
      awayTeam: {
        id: "team_psg",
        name: "Paris Saint-Germain",
        shortName: "PSG",
        tla: "PSG",
        slug: "paris-sg",
      },
      matchDate: new Date(Date.now() + 86400000).toISOString(),
      status: "SCHEDULED",
      homeScore: 0,
      awayScore: 0,
      events: [],
      lineups: {},
    },
  ];

  private standings: ProviderStanding[] = [
    {
      position: 1,
      team: {
        id: "team_ars",
        name: "Arsenal FC",
        shortName: "Arsenal",
        tla: "ARS",
        slug: "arsenal",
      },
      played: 28,
      won: 21,
      drawn: 4,
      lost: 3,
      goalsFor: 70,
      goalsAgainst: 24,
      goalDifference: 46,
      points: 67,
      form: "WWWDW",
    },
    {
      position: 2,
      team: {
        id: "team_mci",
        name: "Manchester City FC",
        shortName: "Man City",
        tla: "MCI",
        slug: "manchester-city",
      },
      played: 28,
      won: 20,
      drawn: 6,
      lost: 2,
      goalsFor: 68,
      goalsAgainst: 26,
      goalDifference: 42,
      points: 66,
      form: "WWDWW",
    },
    {
      position: 3,
      team: {
        id: "team_liv",
        name: "Liverpool FC",
        shortName: "Liverpool",
        tla: "LIV",
        slug: "liverpool",
      },
      played: 28,
      won: 19,
      drawn: 7,
      lost: 2,
      goalsFor: 65,
      goalsAgainst: 27,
      goalDifference: 38,
      points: 64,
      form: "WDWWL",
    },
    {
      position: 4,
      team: {
        id: "team_che",
        name: "Chelsea FC",
        shortName: "Chelsea",
        tla: "CHE",
        slug: "chelsea",
      },
      played: 28,
      won: 15,
      drawn: 6,
      lost: 7,
      goalsFor: 52,
      goalsAgainst: 34,
      goalDifference: 18,
      points: 51,
      form: "LWWLW",
    },
  ];

  private transfers: ProviderTransfer[] = [
    {
      id: "tr_mbappe",
      playerId: "ply_mbappe",
      playerName: "Kylian Mbappé",
      playerPosition: "ATTACKER",
      playerNationality: "France",
      fromTeam: {
        id: "team_psg",
        name: "Paris Saint-Germain",
        tla: "PSG",
        slug: "paris-sg",
      },
      toTeam: {
        id: "team_rma",
        name: "Real Madrid CF",
        tla: "RMA",
        slug: "real-madrid",
      },
      feeDescription: "Free Transfer",
      transferType: "FREE_AGENT",
      status: "COMPLETED",
      announcementDate: "2026-07-01",
      contractUntil: "2029-06-30",
    },
    {
      id: "tr_kimmich",
      playerId: "ply_kimmich",
      playerName: "Joshua Kimmich",
      playerPosition: "MIDFIELDER",
      playerNationality: "Germany",
      fromTeam: {
        id: "team_bay",
        name: "FC Bayern München",
        tla: "BAY",
        slug: "bayern-munich",
      },
      toTeam: {
        id: "team_mci",
        name: "Manchester City FC",
        tla: "MCI",
        slug: "manchester-city",
      },
      feeEur: 55000000,
      feeDescription: "€55.0M",
      transferType: "PERMANENT",
      status: "ADVANCED",
      announcementDate: "2026-08-16",
    },
    {
      id: "tr_osimhen",
      playerId: "ply_osimhen",
      playerName: "Victor Osimhen",
      playerPosition: "ATTACKER",
      playerNationality: "Nigeria",
      fromTeam: {
        id: "team_nap",
        name: "SSC Napoli",
        tla: "NAP",
        slug: "napoli",
      },
      toTeam: {
        id: "team_che",
        name: "Chelsea FC",
        tla: "CHE",
        slug: "chelsea",
      },
      feeEur: 95000000,
      feeDescription: "€95.0M",
      transferType: "PERMANENT",
      status: "RUMOR",
      announcementDate: "2026-08-17",
    },
  ];

  // ==========================================
  // 2. INTERFACE IMPLEMENTATIONS
  // ==========================================

  public async getCompetitions(): Promise<ProviderCompetition[]> {
    return this.competitions;
  }

  public async getCompetition(idOrCode: string): Promise<ProviderCompetition | null> {
    const comp = this.competitions.find(
      (c) =>
        c.id === idOrCode ||
        c.code.toLowerCase() === idOrCode.toLowerCase() ||
        c.slug.toLowerCase() === idOrCode.toLowerCase()
    );
    return comp || null;
  }

  public async getTeams(competitionCode?: string): Promise<ProviderTeam[]> {
    if (!competitionCode) return this.teams;
    return this.teams.filter(
      (t) => t.competitionCode?.toLowerCase() === competitionCode.toLowerCase()
    );
  }

  public async getTeam(idOrSlug: string): Promise<ProviderTeamDetail | null> {
    const team = this.teams.find(
      (t) =>
        t.id === idOrSlug ||
        t.slug.toLowerCase() === idOrSlug.toLowerCase() ||
        t.tla.toLowerCase() === idOrSlug.toLowerCase()
    );
    if (!team) return null;

    const squad = this.players.filter((p) => p.teamId === team.id);
    const recentMatches = this.matches.filter(
      (m) =>
        (m.homeTeam.id === team.id || m.awayTeam.id === team.id) &&
        m.status === "FINISHED"
    );
    const upcomingFixtures = this.matches.filter(
      (m) =>
        (m.homeTeam.id === team.id || m.awayTeam.id === team.id) &&
        (m.status === "SCHEDULED" || m.status.startsWith("LIVE"))
    );
    const standing = this.standings.find((s) => s.team.id === team.id);

    return {
      ...team,
      squad,
      recentMatches,
      upcomingFixtures,
      standing,
    };
  }

  public async getPlayers(teamId?: string): Promise<ProviderPlayer[]> {
    if (!teamId) return this.players;
    return this.players.filter((p) => p.teamId === teamId);
  }

  public async getPlayer(idOrSlug: string): Promise<ProviderPlayerDetail | null> {
    const player = this.players.find(
      (p) =>
        p.id === idOrSlug ||
        p.slug.toLowerCase() === idOrSlug.toLowerCase()
    );
    if (!player) return null;

    const recentTransfers = this.transfers.filter((t) => t.playerId === player.id);
    const statistics = [
      {
        playerId: player.id,
        season: "2025/2026",
        competitionCode: "PL",
        appearances: 28,
        goals: player.position === "ATTACKER" ? 18 : player.position === "MIDFIELDER" ? 8 : 1,
        assists: player.position === "MIDFIELDER" ? 14 : player.position === "ATTACKER" ? 11 : 2,
        yellowCards: 3,
        redCards: 0,
        minutesPlayed: 2420,
        averageRating: 7.8,
      },
    ];

    return {
      ...player,
      statistics,
      recentTransfers,
    };
  }

  public async getFixtures(params?: FixtureQueryParams): Promise<ProviderMatch[]> {
    let result = [...this.matches];

    if (params?.competitionCode) {
      result = result.filter(
        (m) =>
          m.competition.code.toLowerCase() ===
          params.competitionCode!.toLowerCase()
      );
    }
    if (params?.status) {
      result = result.filter((m) => m.status === params.status);
    }
    if (params?.teamId) {
      result = result.filter(
        (m) => m.homeTeam.id === params.teamId || m.awayTeam.id === params.teamId
      );
    }
    if (params?.limit) {
      result = result.slice(0, params.limit);
    }

    return result;
  }

  public async getMatch(id: string): Promise<ProviderMatchDetail | null> {
    const match = this.matches.find((m) => m.id === id || m.externalId === id);
    return match || null;
  }

  public async getLiveMatches(): Promise<ProviderMatch[]> {
    return this.matches.filter(
      (m) =>
        m.status === "LIVE_1H" ||
        m.status === "LIVE_2H" ||
        m.status === "HT" ||
        m.status === "ET" ||
        m.status === "PENALTY"
    );
  }

  public async getStandings(
    competitionCode: string,
    season?: string
  ): Promise<ProviderStanding[]> {
    return this.standings;
  }

  public async getTransfers(params?: TransferQueryParams): Promise<ProviderTransfer[]> {
    let result = [...this.transfers];

    if (params?.status) {
      result = result.filter((t) => t.status === params.status);
    }
    if (params?.transferType) {
      result = result.filter((t) => t.transferType === params.transferType);
    }
    if (params?.limit) {
      result = result.slice(0, params.limit);
    }

    return result;
  }
}
