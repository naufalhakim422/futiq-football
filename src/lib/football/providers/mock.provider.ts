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
import { playerIdentityResolver } from "../player-identity.resolver";
import { COMPETITION_STANDINGS_MAP } from "../standings-data";

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
    {
      id: "comp_wcq",
      externalId: "ext_wcq",
      slug: "world-cup-qualifiers",
      name: "FIFA World Cup Qualifiers",
      code: "WCQ",
      type: "INTERNATIONAL",
      country: "International",
      logoUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=200&auto=format&fit=crop",
      currentSeason: "2026 Qualifiers",
    },
    {
      id: "comp_unl",
      externalId: "ext_unl",
      slug: "uefa-nations-league",
      name: "UEFA Nations League",
      code: "UNL",
      type: "INTERNATIONAL",
      country: "Europe",
      logoUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=200&auto=format&fit=crop",
      currentSeason: "2024/2025",
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
      id: "match_fnb_lyo",
      externalId: "ext_match_fnb_lyo",
      competition: {
        id: "comp_ucl",
        name: "UEFA Champions League",
        code: "UCL",
        slug: "champions-league",
      },
      season: "2026",
      round: "League Phase Matchday 5",
      homeTeam: {
        id: "team_fnb",
        name: "Fenerbahçe",
        shortName: "Fenerbahçe",
        tla: "FNB",
        slug: "fenerbahce",
      },
      awayTeam: {
        id: "team_lyo",
        name: "Lyon",
        shortName: "Lyon",
        tla: "OL",
        slug: "lyon",
      },
      venue: {
        name: "Şükrü Saracoğlu Stadium",
        city: "Istanbul",
        capacity: 50530,
      },
      matchDate: new Date().toISOString(),
      status: "LIVE_2H",
      minute: 78,
      homeScore: 1,
      awayScore: 1,
      htHomeScore: 1,
      htAwayScore: 0,
      referee: "Clément Turpin",
      events: [
        {
          id: "ev_fnb_1",
          minute: 34,
          type: "GOAL",
          teamId: "team_fnb",
          playerName: "Mason Greenwood",
          detail: "Curled low left-footed strike into far post",
        },
        {
          id: "ev_lyo_1",
          minute: 59,
          type: "GOAL",
          teamId: "team_lyo",
          playerName: "Corentin Tolisso",
          detail: "Thunderous 20-yard volley from clearance",
        },
      ],
      lineups: {
        home: {
          teamId: "team_fnb",
          teamName: "Fenerbahçe",
          formation: "4-2-3-1",
          manager: {
            name: "Ismail Kartal",
            photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
          },
          starters: [
            { name: "Ederson", number: 31, position: "GK", rating: 6.8, photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop" },
            { name: "Nélson Semedo", number: 27, position: "RB", rating: 7.0, photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop" },
            { name: "Milan Škriniar", number: 37, position: "CB", rating: 7.2, photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop" },
            { name: "Nathan Aké", number: 15, position: "CB", rating: 7.0, photoUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&auto=format&fit=crop" },
            { name: "Archie Brown", number: 3, position: "LB", rating: 7.2, photoUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=200&auto=format&fit=crop" },
            { name: "N'Golo Kanté", number: 91, position: "DM", rating: 7.4, photoUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=200&auto=format&fit=crop" },
            { name: "Mattéo Guendouzi", number: 6, position: "DM", rating: 7.2, photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop" },
            { name: "Mason Greenwood", number: 11, position: "RW", rating: 8.2, isMotm: true, goals: 1, photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop" },
            { name: "Anderson Talisca", number: 94, position: "AM", rating: 6.4, photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" },
            { name: "Kerem Aktürkoğlu", number: 7, position: "LW", rating: 7.3, photoUrl: "https://images.unsplash.com/photo-1528892952291-009c663ce843?q=80&w=200&auto=format&fit=crop" },
            { name: "Vedat Muriqi", number: 19, position: "ST", rating: 6.7, photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" },
          ],
          bench: [
            { name: "İrfan Can Eğribayat", number: 70, position: "GK", rating: 6.5 },
            { name: "Alexander Djiku", number: 23, position: "DF", rating: 6.8 },
            { name: "İsmail Yüksek", number: 5, position: "MF", rating: 7.0 },
            { name: "Youssef En-Nesyri", number: 19, position: "FW", rating: 7.1 },
          ],
        },
        away: {
          teamId: "team_lyo",
          teamName: "Lyon",
          formation: "4-3-3",
          manager: {
            name: "Paulo Fonseca",
            photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
          },
          starters: [
            { name: "Dominik Greif", number: 1, position: "GK", rating: 6.6, photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" },
            { name: "Ainsley Maitland-Niles", number: 98, position: "RB", rating: 6.9, photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop" },
            { name: "Moussa Niakhaté", number: 19, position: "CB", rating: 7.1, photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop" },
            { name: "Justin Kluivert", number: 21, position: "CB", rating: 6.9, photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop" },
            { name: "Abner Vinícius", number: 16, position: "LB", rating: 6.7, photoUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&auto=format&fit=crop" },
            { name: "Corentin Tolisso", number: 8, position: "CM", rating: 8.0, goals: 1, photoUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=200&auto=format&fit=crop" },
            { name: "Tanner Tessmann", number: 6, position: "CM", rating: 7.1, photoUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=200&auto=format&fit=crop" },
            { name: "Tyler Morton", number: 23, position: "CM", rating: 6.9, photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop" },
            { name: "Ernest Nuamah", number: 7, position: "RW", rating: 6.9, photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop" },
            { name: "Loïs Openda", number: 17, position: "ST", rating: 7.7, photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" },
            { name: "Malick Fofana", number: 11, position: "LW", rating: 7.2, photoUrl: "https://images.unsplash.com/photo-1528892952291-009c663ce843?q=80&w=200&auto=format&fit=crop" },
          ],
          bench: [
            { name: "Lucas Perri", number: 23, position: "GK", rating: 6.5 },
            { name: "Duje Ćaleta-Car", number: 55, position: "DF", rating: 6.8 },
            { name: "Maxence Caqueret", number: 6, position: "MF", rating: 7.2 },
            { name: "Alexandre Lacazette", number: 10, position: "FW", rating: 7.4 },
          ],
        },
      },
      stats: {
        possessionHome: 52,
        possessionAway: 48,
        shotsHome: 14,
        shotsAway: 12,
        shotsOnTargetHome: 6,
        shotsOnTargetAway: 5,
        cornersHome: 5,
        cornersAway: 4,
        foulsHome: 11,
        foulsAway: 13,
        xgHome: 1.65,
        xgAway: 1.42,
        passesHome: 450,
        passesAway: 420,
        passAccuracyHome: 86,
        passAccuracyAway: 84,
      },
    },
    {
      id: "match_ina_aus",
      externalId: "ext_match_ina_aus",
      competition: {
        id: "comp_wcq",
        name: "FIFA World Cup Qualifiers (AFC)",
        code: "WCQ",
        slug: "world-cup-qualifiers",
      },
      season: "2026",
      round: "Third Round Group C",
      homeTeam: {
        id: "team_ina",
        name: "Indonesia",
        shortName: "Indonesia",
        tla: "INA",
        slug: "indonesia",
      },
      awayTeam: {
        id: "team_aus",
        name: "Australia",
        shortName: "Australia",
        tla: "AUS",
        slug: "australia",
      },
      venue: {
        name: "Gelora Bung Karno Stadium",
        city: "Jakarta",
        capacity: 78000,
      },
      matchDate: new Date().toISOString(),
      status: "LIVE_2H",
      minute: 82,
      homeScore: 2,
      awayScore: 1,
      htHomeScore: 1,
      htAwayScore: 1,
      referee: "Ahmed Al-Kaf",
      events: [
        {
          id: "ev_ina_1",
          minute: 19,
          type: "GOAL",
          teamId: "team_ina",
          playerName: "Marselino Ferdinan",
          assistPlayerName: "Calvin Verdonk",
          detail: "Curled low finish from inside the box",
        },
        {
          id: "ev_aus_1",
          minute: 38,
          type: "GOAL",
          teamId: "team_aus",
          playerName: "Mitchell Duke",
          detail: "Header from corner delivery",
        },
        {
          id: "ev_ina_2",
          minute: 67,
          type: "GOAL",
          teamId: "team_ina",
          playerName: "Thom Haye",
          detail: "Spectacular 25-yard free kick into top corner",
        },
        {
          id: "ev_aus_2",
          minute: 74,
          type: "YELLOW_CARD",
          teamId: "team_aus",
          playerName: "Jackson Irvine",
          detail: "Tactical foul breaking midfield transition",
        },
      ],
      lineups: {
        home: {
          teamId: "team_ina",
          teamName: "Indonesia",
          formation: "3-4-3",
          manager: {
            name: "Shin Tae-yong",
            photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
          },
          starters: [
            { name: "Maarten Paes", number: 1, position: "GK", gridPosition: "1:1", rating: 8.9, isMotm: true, photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" },
            { name: "Sandy Walsh", number: 6, position: "RB", gridPosition: "2:4", rating: 7.8, photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop" },
            { name: "Rizky Ridho", number: 5, position: "CB", gridPosition: "2:3", rating: 8.1, photoUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=200&auto=format&fit=crop" },
            { name: "Jay Idzes", number: 4, position: "CB", gridPosition: "2:2", rating: 8.7, isCaptain: true, photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop" },
            { name: "Justin Hubner", number: 23, position: "CB", gridPosition: "2:1", rating: 8.2, photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop" },
            { name: "Calvin Verdonk", number: 17, position: "LB", gridPosition: "3:4", rating: 8.4, assists: 1, photoUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&auto=format&fit=crop" },
            { name: "Thom Haye", number: 19, position: "CM", gridPosition: "3:3", rating: 8.8, goals: 1, photoUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=200&auto=format&fit=crop" },
            { name: "Ivar Jenner", number: 18, position: "CM", gridPosition: "3:2", rating: 7.9, photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop" },
            { name: "Marselino Ferdinan", number: 7, position: "RW", gridPosition: "4:3", rating: 8.6, goals: 1, photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop" },
            { name: "Rafael Struick", number: 9, position: "ST", gridPosition: "4:2", rating: 7.6, photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" },
            { name: "Ragnar Oratmangoen", number: 11, position: "LW", gridPosition: "4:1", rating: 8.1, photoUrl: "https://images.unsplash.com/photo-1528892952291-009c663ce843?q=80&w=200&auto=format&fit=crop" },
          ],
          bench: [
            { name: "Ernando Ari", number: 21, position: "GK", rating: 6.5 },
            { name: "Witan Sulaeman", number: 8, position: "MF", rating: 7.0 },
            { name: "Pratama Arhan", number: 12, position: "DF", rating: 7.2 },
            { name: "Nathan Tjoe-A-On", number: 22, position: "MF", rating: 7.4 },
          ],
        },
        away: {
          teamId: "team_aus",
          teamName: "Australia",
          formation: "4-2-3-1",
          manager: {
            name: "Tony Popovic",
            photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
          },
          starters: [
            { name: "Mathew Ryan", number: 1, position: "GK", gridPosition: "1:1", rating: 6.8, isCaptain: true },
            { name: "Aziz Behich", number: 16, position: "LB", gridPosition: "2:1", rating: 7.0 },
            { name: "Harry Souttar", number: 19, position: "CB", gridPosition: "2:2", rating: 7.4 },
            { name: "Cameron Burgess", number: 21, position: "CB", gridPosition: "2:3", rating: 6.9 },
            { name: "Lewis Miller", number: 3, position: "RB", gridPosition: "2:4", rating: 6.7 },
            { name: "Jackson Irvine", number: 22, position: "DM", gridPosition: "3:2", rating: 7.0, yellowCards: 1 },
            { name: "Keanu Baccus", number: 17, position: "DM", gridPosition: "3:3", rating: 7.1 },
            { name: "Craig Goodwin", number: 23, position: "LW", gridPosition: "4:1", rating: 7.3 },
            { name: "Connor Metcalfe", number: 8, position: "AM", gridPosition: "4:2", rating: 6.9 },
            { name: "Nestory Irankunda", number: 11, position: "RW", gridPosition: "4:3", rating: 7.2 },
            { name: "Mitchell Duke", number: 15, position: "ST", gridPosition: "5:2", rating: 7.5, goals: 1 },
          ],
          bench: [
            { name: "Joe Gauci", number: 12, position: "GK", rating: 6.5 },
            { name: "Awer Mabil", number: 10, position: "FW", rating: 6.8 },
            { name: "Kusini Yengi", number: 9, position: "FW", rating: 7.0 },
          ],
        },
      },
      stats: {
        possessionHome: 44,
        possessionAway: 56,
        shotsHome: 12,
        shotsAway: 14,
        shotsOnTargetHome: 6,
        shotsOnTargetAway: 7,
        cornersHome: 4,
        cornersAway: 8,
        foulsHome: 11,
        foulsAway: 13,
        xgHome: 1.72,
        xgAway: 1.45,
        passesHome: 382,
        passesAway: 498,
        passAccuracyHome: 82,
        passAccuracyAway: 87,
      },
      homeForm: ["W", "D", "L", "W", "D"],
      awayForm: ["L", "W", "W", "D", "W"],
      h2h: {
        totalMatches: 4,
        homeWins: 1,
        draws: 1,
        awayWins: 2,
        homeGoals: 3,
        awayGoals: 6,
        recentMatches: [
          {
            id: "match_ina_aus_past_1",
            competition: { id: "comp_wcq", name: "World Cup Qualifiers", code: "WCQ", slug: "world-cup-qualifiers" },
            season: "2024",
            matchDate: "2024-09-10T19:00:00Z",
            status: "FINISHED",
            homeScore: 0,
            awayScore: 0,
            homeTeam: { id: "team_ina", name: "Indonesia", shortName: "Indonesia", tla: "INA", slug: "indonesia" },
            awayTeam: { id: "team_aus", name: "Australia", shortName: "Australia", tla: "AUS", slug: "australia" },
          },
          {
            id: "match_ina_aus_past_2",
            competition: { id: "comp_afc", name: "AFC Asian Cup", code: "AFC", slug: "afc-asian-cup" },
            season: "2024",
            matchDate: "2024-01-28T14:30:00Z",
            status: "FINISHED",
            homeScore: 0,
            awayScore: 4,
            homeTeam: { id: "team_aus", name: "Australia", shortName: "Australia", tla: "AUS", slug: "australia" },
            awayTeam: { id: "team_ina", name: "Indonesia", shortName: "Indonesia", tla: "INA", slug: "indonesia" },
          },
        ],
      },
      standing: [
        {
          position: 1,
          team: { id: "team_jpn", name: "Japan", shortName: "Japan", tla: "JPN", slug: "japan" },
          played: 6,
          won: 5,
          drawn: 1,
          lost: 0,
          goalsFor: 22,
          goalsAgainst: 2,
          goalDifference: 20,
          points: 16,
          form: "WDWWW",
        },
        {
          position: 2,
          team: { id: "team_aus", name: "Australia", shortName: "Australia", tla: "AUS", slug: "australia" },
          played: 6,
          won: 1,
          drawn: 4,
          lost: 1,
          goalsFor: 6,
          goalsAgainst: 5,
          goalDifference: 1,
          points: 7,
          form: "DDDWL",
        },
        {
          position: 3,
          team: { id: "team_ina", name: "Indonesia", shortName: "Indonesia", tla: "INA", slug: "indonesia" },
          played: 6,
          won: 1,
          drawn: 3,
          lost: 2,
          goalsFor: 6,
          goalsAgainst: 9,
          goalDifference: -3,
          points: 6,
          form: "WLLDD",
        },
        {
          position: 4,
          team: { id: "team_ksa", name: "Saudi Arabia", shortName: "Saudi Arabia", tla: "KSA", slug: "saudi-arabia" },
          played: 6,
          won: 1,
          drawn: 3,
          lost: 2,
          goalsFor: 3,
          goalsAgainst: 6,
          goalDifference: -3,
          points: 6,
          form: "LDDWD",
        },
      ],
    },
    {
      id: "match_eng_fra",
      externalId: "ext_match_eng_fra",
      competition: {
        id: "comp_unl",
        name: "UEFA Nations League",
        code: "UNL",
        slug: "uefa-nations-league",
      },
      season: "2025",
      round: "League A Group 2",
      homeTeam: {
        id: "team_eng",
        name: "England",
        shortName: "England",
        tla: "ENG",
        slug: "england",
      },
      awayTeam: {
        id: "team_fra",
        name: "France",
        shortName: "France",
        tla: "FRA",
        slug: "france",
      },
      venue: {
        name: "Wembley Stadium",
        city: "London",
        capacity: 90000,
      },
      matchDate: new Date().toISOString(),
      status: "LIVE_2H",
      minute: 71,
      homeScore: 2,
      awayScore: 2,
      htHomeScore: 1,
      htAwayScore: 1,
      referee: "Szymon Marciniak",
      events: [
        {
          id: "ev_fra_1",
          minute: 14,
          type: "GOAL",
          teamId: "team_fra",
          playerName: "Kylian Mbappé",
          assistPlayerName: "Antoine Griezmann",
          detail: "Blistering pace finish past keeper",
        },
        {
          id: "ev_eng_1",
          minute: 32,
          type: "GOAL",
          teamId: "team_eng",
          playerName: "Harry Kane",
          detail: "Penalty smashed into roof of the net",
        },
        {
          id: "ev_eng_2",
          minute: 55,
          type: "GOAL",
          teamId: "team_eng",
          playerName: "Jude Bellingham",
          detail: "Brilliant solo drive through central defense",
        },
        {
          id: "ev_fra_2",
          minute: 64,
          type: "GOAL",
          teamId: "team_fra",
          playerName: "Bradley Barcola",
          detail: "Close range rebound tap-in",
        },
      ],
      lineups: {
        home: {
          teamId: "team_eng",
          teamName: "England",
          formation: "4-2-3-1",
          manager: {
            name: "Thomas Tuchel",
            photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
          },
          starters: [
            { name: "Jordan Pickford", number: 1, position: "GK", gridPosition: "1:1", rating: 7.2, photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" },
            { name: "Kyle Walker", number: 2, position: "RB", gridPosition: "2:4", rating: 7.4, photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop" },
            { name: "John Stones", number: 5, position: "CB", gridPosition: "2:3", rating: 7.8, photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop" },
            { name: "Marc Guéhi", number: 6, position: "CB", gridPosition: "2:2", rating: 7.5, photoUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&auto=format&fit=crop" },
            { name: "Luke Shaw", number: 3, position: "LB", gridPosition: "2:1", rating: 7.1, photoUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=200&auto=format&fit=crop" },
            { name: "Declan Rice", number: 4, position: "DM", gridPosition: "3:3", rating: 8.1, photoUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=200&auto=format&fit=crop" },
            { name: "Kobbie Mainoo", number: 26, position: "DM", gridPosition: "3:1", rating: 7.7, photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop" },
            { name: "Bukayo Saka", number: 7, position: "RW", gridPosition: "4:3", rating: 8.4, photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop" },
            { name: "Jude Bellingham", number: 10, position: "AM", gridPosition: "4:2", rating: 8.8, goals: 1, photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" },
            { name: "Phil Foden", number: 11, position: "LW", gridPosition: "4:1", rating: 7.9, photoUrl: "https://images.unsplash.com/photo-1528892952291-009c663ce843?q=80&w=200&auto=format&fit=crop" },
            { name: "Harry Kane", number: 9, position: "ST", gridPosition: "5:2", rating: 8.2, goals: 1, isCaptain: true, photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop" },
          ],
          bench: [
            { name: "Aaron Ramsdale", number: 13, position: "GK", rating: 6.5 },
            { name: "Cole Palmer", number: 20, position: "MF", rating: 7.5 },
            { name: "Ollie Watkins", number: 19, position: "FW", rating: 7.2 },
          ],
        },
        away: {
          teamId: "team_fra",
          teamName: "France",
          formation: "4-3-3",
          manager: {
            name: "Didier Deschamps",
            photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
          },
          starters: [
            { name: "Mike Maignan", number: 16, position: "GK", gridPosition: "1:1", rating: 7.6, photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" },
            { name: "Jules Koundé", number: 5, position: "RB", gridPosition: "2:4", rating: 7.9, photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop" },
            { name: "William Saliba", number: 4, position: "CB", gridPosition: "2:3", rating: 8.3, photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop" },
            { name: "Dayot Upamecano", number: 2, position: "CB", gridPosition: "2:2", rating: 7.4, photoUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&auto=format&fit=crop" },
            { name: "Theo Hernández", number: 22, position: "LB", gridPosition: "2:1", rating: 8.0, photoUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=200&auto=format&fit=crop" },
            { name: "Aurélien Tchouaméni", number: 8, position: "DM", gridPosition: "3:2", rating: 8.2, photoUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=200&auto=format&fit=crop" },
            { name: "Eduardo Camavinga", number: 6, position: "CM", gridPosition: "4:3", rating: 8.1, photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop" },
            { name: "Antoine Griezmann", number: 7, position: "AM", gridPosition: "4:1", rating: 8.5, assists: 1, photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop" },
            { name: "Ousmane Dembélé", number: 11, position: "RW", gridPosition: "5:3", rating: 7.8, photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" },
            { name: "Kylian Mbappé", number: 10, position: "ST", gridPosition: "5:2", rating: 8.9, goals: 1, isCaptain: true, isMotm: true, photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" },
            { name: "Bradley Barcola", number: 20, position: "LW", gridPosition: "5:1", rating: 8.0, goals: 1, photoUrl: "https://images.unsplash.com/photo-1528892952291-009c663ce843?q=80&w=200&auto=format&fit=crop" },
          ],
          bench: [
            { name: "Brice Samba", number: 1, position: "GK", rating: 6.5 },
            { name: "Randal Kolo Muani", number: 12, position: "FW", rating: 7.1 },
          ],
        },
      },
      stats: {
        possessionHome: 51,
        possessionAway: 49,
        shotsHome: 14,
        shotsAway: 16,
        shotsOnTargetHome: 7,
        shotsOnTargetAway: 8,
        cornersHome: 5,
        cornersAway: 6,
        foulsHome: 9,
        foulsAway: 10,
        xgHome: 2.15,
        xgAway: 2.30,
        passesHome: 462,
        passesAway: 448,
        passAccuracyHome: 88,
        passAccuracyAway: 86,
      },
    },
    {
      id: "match_arg_bra",
      externalId: "ext_match_arg_bra",
      competition: {
        id: "comp_wcq",
        name: "FIFA World Cup Qualifiers (CONMEBOL)",
        code: "WCQ",
        slug: "world-cup-qualifiers",
      },
      season: "2026",
      round: "Matchday 14",
      homeTeam: {
        id: "team_arg",
        name: "Argentina",
        shortName: "Argentina",
        tla: "ARG",
        slug: "argentina",
      },
      awayTeam: {
        id: "team_bra",
        name: "Brazil",
        shortName: "Brazil",
        tla: "BRA",
        slug: "brazil",
      },
      venue: {
        name: "Estadio Monumental",
        city: "Buenos Aires",
        capacity: 84567,
      },
      matchDate: new Date().toISOString(),
      status: "FINISHED",
      homeScore: 2,
      awayScore: 0,
      htHomeScore: 1,
      htAwayScore: 0,
      referee: "Wilmar Roldán",
      events: [
        {
          id: "ev_arg_1",
          minute: 24,
          type: "GOAL",
          teamId: "team_arg",
          playerName: "Lionel Messi",
          detail: "Curled 20-yard trademark finish into bottom left corner",
        },
        {
          id: "ev_arg_2",
          minute: 78,
          type: "GOAL",
          teamId: "team_arg",
          playerName: "Julián Álvarez",
          detail: "Counter-attack clinical chip over Alisson",
        },
      ],
      lineups: {
        home: {
          teamId: "team_arg",
          teamName: "Argentina",
          formation: "4-3-3",
          manager: {
            name: "Lionel Scaloni",
            photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
          },
          starters: [
            { name: "Emiliano Martínez", number: 23, position: "GK", gridPosition: "1:1", rating: 8.5, photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop" },
            { name: "Nahuel Molina", number: 4, position: "RB", gridPosition: "2:4", rating: 7.7, photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop" },
            { name: "Cristian Romero", number: 13, position: "CB", gridPosition: "2:3", rating: 8.4, photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop" },
            { name: "Nicolás Otamendi", number: 19, position: "CB", gridPosition: "2:2", rating: 7.9, photoUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&auto=format&fit=crop" },
            { name: "Nicolás Tagliafico", number: 3, position: "LB", gridPosition: "2:1", rating: 7.8, photoUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=200&auto=format&fit=crop" },
            { name: "Rodrigo De Paul", number: 7, position: "CM", gridPosition: "3:3", rating: 8.2, photoUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=200&auto=format&fit=crop" },
            { name: "Enzo Fernández", number: 24, position: "DM", gridPosition: "3:2", rating: 8.3, photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop" },
            { name: "Alexis Mac Allister", number: 20, position: "CM", gridPosition: "3:1", rating: 8.1, photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop" },
            { name: "Lionel Messi", number: 10, position: "RW", gridPosition: "4:3", rating: 9.3, goals: 1, isCaptain: true, isMotm: true, photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" },
            { name: "Julián Álvarez", number: 9, position: "ST", gridPosition: "4:2", rating: 8.6, goals: 1, photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" },
            { name: "Lautaro Martínez", number: 22, position: "LW", gridPosition: "4:1", rating: 7.9, photoUrl: "https://images.unsplash.com/photo-1528892952291-009c663ce843?q=80&w=200&auto=format&fit=crop" },
          ],
          bench: [
            { name: "Gerónimo Rulli", number: 1, position: "GK", rating: 6.5 },
            { name: "Alejandro Garnacho", number: 17, position: "FW", rating: 7.3 },
          ],
        },
        away: {
          teamId: "team_bra",
          teamName: "Brazil",
          formation: "4-2-3-1",
          manager: {
            name: "Dorival Júnior",
            photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
          },
          starters: [
            { name: "Alisson Becker", number: 1, position: "GK", gridPosition: "1:1", rating: 7.1, photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" },
            { name: "Danilo", number: 2, position: "RB", gridPosition: "2:4", rating: 6.8, isCaptain: true, photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop" },
            { name: "Marquinhos", number: 4, position: "CB", gridPosition: "2:3", rating: 7.3, photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop" },
            { name: "Gabriel Magalhães", number: 14, position: "CB", gridPosition: "2:2", rating: 7.4, photoUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&auto=format&fit=crop" },
            { name: "Wendell", number: 6, position: "LB", gridPosition: "2:1", rating: 6.9, photoUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=200&auto=format&fit=crop" },
            { name: "Bruno Guimarães", number: 5, position: "DM", gridPosition: "3:3", rating: 7.5, photoUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=200&auto=format&fit=crop" },
            { name: "João Gomes", number: 15, position: "DM", gridPosition: "3:1", rating: 7.0, photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop" },
            { name: "Raphinha", number: 11, position: "RW", gridPosition: "4:3", rating: 7.5, photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop" },
            { name: "Lucas Paquetá", number: 8, position: "AM", gridPosition: "4:2", rating: 7.1, photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" },
            { name: "Vinícius Júnior", number: 7, position: "LW", gridPosition: "4:1", rating: 7.4, photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" },
            { name: "Rodrygo", number: 10, position: "ST", gridPosition: "5:2", rating: 7.2, photoUrl: "https://images.unsplash.com/photo-1528892952291-009c663ce843?q=80&w=200&auto=format&fit=crop" },
          ],
          bench: [
            { name: "Bento", number: 12, position: "GK", rating: 6.5 },
            { name: "Endrick", number: 9, position: "FW", rating: 7.0 },
          ],
        },
      },
      stats: {
        possessionHome: 54,
        possessionAway: 46,
        shotsHome: 15,
        shotsAway: 11,
        shotsOnTargetHome: 8,
        shotsOnTargetAway: 3,
        cornersHome: 6,
        cornersAway: 4,
        foulsHome: 14,
        foulsAway: 18,
        xgHome: 2.45,
        xgAway: 0.95,
        passesHome: 520,
        passesAway: 410,
        passAccuracyHome: 89,
        passAccuracyAway: 83,
      },
    },
    {
      id: "match_fra_arg_wc",
      externalId: "ext_match_fra_arg_wc",
      competition: {
        id: "comp_wc",
        name: "FIFA World Cup",
        code: "WC",
        slug: "fifa-world-cup",
        isInternational: true,
      },
      season: "2022",
      round: "Final",
      stage: "Final",
      isKnockout: true,
      homeTeam: {
        id: "team_arg",
        name: "Argentina",
        shortName: "Argentina",
        tla: "ARG",
        slug: "argentina",
        isNationalTeam: true,
      },
      awayTeam: {
        id: "team_fra",
        name: "France",
        shortName: "France",
        tla: "FRA",
        slug: "france",
        isNationalTeam: true,
      },
      venue: {
        name: "Lusail Stadium",
        city: "Lusail",
        capacity: 88966,
      },
      matchDate: "2022-12-18T15:00:00Z",
      status: "FINISHED",
      homeScore: 3,
      awayScore: 3,
      htHomeScore: 2,
      htAwayScore: 0,
      etHomeScore: 3,
      etAwayScore: 3,
      penaltyHomeScore: 4,
      penaltyAwayScore: 2,
      decidedByPenalty: true,
      referee: "Szymon Marciniak",
      events: [
        { id: "ev_wc_1", minute: 23, type: "GOAL", teamId: "team_arg", playerName: "Lionel Messi", detail: "Penalty scored into bottom right" },
        { id: "ev_wc_2", minute: 36, type: "GOAL", teamId: "team_arg", playerName: "Ángel Di María", assistPlayerName: "Alexis Mac Allister", detail: "Fast-flowing team counter attack goal" },
        { id: "ev_wc_3", minute: 80, type: "GOAL", teamId: "team_fra", playerName: "Kylian Mbappé", detail: "Low penalty struck cleanly into corner" },
        { id: "ev_wc_4", minute: 81, type: "GOAL", teamId: "team_fra", playerName: "Kylian Mbappé", assistPlayerName: "Marcus Thuram", detail: "Sublime first-time volley into far bottom corner" },
        { id: "ev_wc_5", minute: 108, type: "GOAL", teamId: "team_arg", playerName: "Lionel Messi", detail: "Rebound forced over the line in extra time" },
        { id: "ev_wc_6", minute: 118, type: "GOAL", teamId: "team_fra", playerName: "Kylian Mbappé", detail: "Penalty completed World Cup Final hat-trick" },
        { id: "ev_wc_7", minute: 121, type: "GOAL", teamId: "team_arg", playerName: "Gonzalo Montiel", detail: "Decisive championship penalty shootout conversion" },
      ],
      lineups: {
        home: {
          teamId: "team_arg",
          teamName: "Argentina",
          formation: "4-3-3",
          manager: { name: "Lionel Scaloni" },
          starters: [
            { name: "Emiliano Martínez", number: 23, position: "GK", rating: 8.8, saves: 5 },
            { name: "Nahuel Molina", number: 26, position: "RB", rating: 7.2 },
            { name: "Cristian Romero", number: 13, position: "CB", rating: 8.1 },
            { name: "Nicolás Otamendi", number: 19, position: "CB", rating: 7.6 },
            { name: "Nicolás Tagliafico", number: 3, position: "LB", rating: 7.8 },
            { name: "Rodrigo De Paul", number: 7, position: "CM", rating: 8.4 },
            { name: "Enzo Fernández", number: 24, position: "DM", rating: 8.9 },
            { name: "Alexis Mac Allister", number: 20, position: "CM", rating: 8.7, assists: 1 },
            { name: "Lionel Messi", number: 10, position: "RW", rating: 9.8, goals: 2, isMotm: true, isCaptain: true },
            { name: "Julián Álvarez", number: 9, position: "ST", rating: 7.9 },
            { name: "Ángel Di María", number: 11, position: "LW", rating: 8.9, goals: 1 },
          ],
          bench: [
            { name: "Gonzalo Montiel", number: 4, position: "DF", rating: 7.5 },
            { name: "Lautaro Martínez", number: 22, position: "FW", rating: 7.8 },
          ],
        },
        away: {
          teamId: "team_fra",
          teamName: "France",
          formation: "4-3-3",
          manager: { name: "Didier Deschamps" },
          starters: [
            { name: "Hugo Lloris", number: 1, position: "GK", rating: 7.0, isCaptain: true },
            { name: "Jules Koundé", number: 5, position: "RB", rating: 6.8 },
            { name: "Raphaël Varane", number: 4, position: "CB", rating: 7.2 },
            { name: "Dayot Upamecano", number: 18, position: "CB", rating: 7.5 },
            { name: "Theo Hernández", number: 22, position: "LB", rating: 7.1 },
            { name: "Aurélien Tchouaméni", number: 8, position: "DM", rating: 7.6 },
            { name: "Adrien Rabiot", number: 14, position: "CM", rating: 7.4 },
            { name: "Antoine Griezmann", number: 7, position: "AM", rating: 7.1 },
            { name: "Ousmane Dembélé", number: 11, position: "RW", rating: 5.9 },
            { name: "Olivier Giroud", number: 9, position: "ST", rating: 6.2 },
            { name: "Kylian Mbappé", number: 10, position: "LW", rating: 9.7, goals: 3 },
          ],
          bench: [
            { name: "Randal Kolo Muani", number: 12, position: "FW", rating: 7.9 },
            { name: "Marcus Thuram", number: 26, position: "FW", rating: 7.7, assists: 1 },
          ],
        },
      },
      stats: {
        possessionHome: 54,
        possessionAway: 46,
        shotsHome: 20,
        shotsAway: 10,
        shotsOnTargetHome: 10,
        shotsOnTargetAway: 5,
        cornersHome: 6,
        cornersAway: 5,
        foulsHome: 26,
        foulsAway: 19,
        xgHome: 3.25,
        xgAway: 2.85,
        passesHome: 642,
        passesAway: 528,
        passAccuracyHome: 83,
        passAccuracyAway: 78,
      },
    },
    {
      id: "match_ina_mas_fr",
      externalId: "ext_match_ina_mas_fr",
      competition: {
        id: "comp_friendly",
        name: "International Friendly",
        code: "FRIENDLY",
        slug: "international-friendly",
        isInternational: true,
      },
      season: "2026",
      round: "FIFA Matchday",
      homeTeam: {
        id: "team_ina",
        name: "Indonesia",
        shortName: "Indonesia",
        tla: "INA",
        slug: "indonesia",
        isNationalTeam: true,
      },
      awayTeam: {
        id: "team_mas",
        name: "Malaysia",
        shortName: "Malaysia",
        tla: "MAS",
        slug: "malaysia",
        isNationalTeam: true,
      },
      venue: {
        name: "Gelora Bung Karno Stadium",
        city: "Jakarta",
        capacity: 78000,
      },
      matchDate: new Date().toISOString(),
      status: "FINISHED",
      homeScore: 3,
      awayScore: 0,
      htHomeScore: 1,
      htAwayScore: 0,
      referee: "Ko Hyung-jin",
      events: [
        { id: "ev_im_1", minute: 22, type: "GOAL", teamId: "team_ina", playerName: "Marselino Ferdinan", detail: "Spectacular 25-yard curling effort" },
        { id: "ev_im_2", minute: 58, type: "GOAL", teamId: "team_ina", playerName: "Ragnar Oratmangoen", assistPlayerName: "Thom Haye", detail: "Calm slot into bottom corner" },
        { id: "ev_im_3", minute: 84, type: "GOAL", teamId: "team_ina", playerName: "Rafael Struick", detail: "Clinical counter-attack finish" },
      ],
      lineups: {
        home: {
          teamId: "team_ina",
          teamName: "Indonesia",
          formation: "3-4-3",
          manager: { name: "Shin Tae-yong" },
          starters: [
            { name: "Maarten Paes", number: 1, position: "GK", rating: 8.5 },
            { name: "Sandy Walsh", number: 6, position: "RB", rating: 7.9 },
            { name: "Rizky Ridho", number: 5, position: "CB", rating: 8.3 },
            { name: "Jay Idzes", number: 4, position: "CB", rating: 8.8, isCaptain: true },
            { name: "Justin Hubner", number: 23, position: "CB", rating: 8.1 },
            { name: "Calvin Verdonk", number: 17, position: "LB", rating: 8.2 },
            { name: "Thom Haye", number: 19, position: "CM", rating: 8.9, assists: 1, isMotm: true },
            { name: "Ivar Jenner", number: 18, position: "CM", rating: 8.0 },
            { name: "Marselino Ferdinan", number: 7, position: "RW", rating: 8.7, goals: 1 },
            { name: "Rafael Struick", number: 9, position: "ST", rating: 8.0, goals: 1 },
            { name: "Ragnar Oratmangoen", number: 11, position: "LW", rating: 8.3, goals: 1 },
          ],
          bench: [
            { name: "Ernando Ari", number: 21, position: "GK", rating: 6.5 },
            { name: "Witan Sulaeman", number: 8, position: "MF", rating: 7.1 },
          ],
        },
        away: {
          teamId: "team_mas",
          teamName: "Malaysia",
          formation: "4-3-3",
          manager: { name: "Pau Martí Vicente" },
          starters: [
            { name: "Syihan Hazmi", number: 16, position: "GK", rating: 6.2 },
            { name: "Matthew Davies", number: 2, position: "RB", rating: 6.7 },
            { name: "Dion Cools", number: 21, position: "CB", rating: 7.0, isCaptain: true },
            { name: "Dominic Tan", number: 6, position: "CB", rating: 6.4 },
            { name: "La'Vere Corbin-Ong", number: 22, position: "LB", rating: 6.5 },
            { name: "Endrick dos Santos", number: 18, position: "CM", rating: 6.6 },
            { name: "Stuart Wilkin", number: 8, position: "CM", rating: 6.8 },
            { name: "Paulo Josué", number: 14, position: "AM", rating: 6.5 },
            { name: "Arif Aiman", number: 7, position: "RW", rating: 7.2 },
            { name: "Romel Morales", number: 19, position: "ST", rating: 6.4 },
            { name: "Faisal Halim", number: 11, position: "LW", rating: 6.9 },
          ],
          bench: [
            { name: "Azri Ghani", number: 1, position: "GK", rating: 6.5 },
            { name: "Safawi Rasid", number: 10, position: "FW", rating: 6.8 },
          ],
        },
      },
      stats: {
        possessionHome: 58,
        possessionAway: 42,
        shotsHome: 16,
        shotsAway: 7,
        shotsOnTargetHome: 8,
        shotsOnTargetAway: 2,
        cornersHome: 7,
        cornersAway: 3,
        foulsHome: 12,
        foulsAway: 15,
        xgHome: 2.15,
        xgAway: 0.65,
        passesHome: 540,
        passesAway: 380,
        passAccuracyHome: 88,
        passAccuracyAway: 79,
      },
    },
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
    if (!match) return null;

    const mapPlayer = (p: any) => {
      const resolvedPhoto = playerIdentityResolver.resolvePlayerPhoto(p.playerId, p.photoUrl, null, p.name);
      return {
        ...p,
        photoUrl: resolvedPhoto || undefined,
      };
    };

    return {
      ...match,
      lineups: {
        home: match.lineups?.home
          ? {
              ...match.lineups.home,
              starters: match.lineups.home.starters?.map(mapPlayer) || [],
              bench: match.lineups.home.bench?.map(mapPlayer) || [],
            }
          : undefined,
        away: match.lineups?.away
          ? {
              ...match.lineups.away,
              starters: match.lineups.away.starters?.map(mapPlayer) || [],
              bench: match.lineups.away.bench?.map(mapPlayer) || [],
            }
          : undefined,
      },
    };
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
    const key = (competitionCode || "PL").toUpperCase();
    const slugMap: Record<string, string> = {
      "PREMIER-LEAGUE": "PL",
      "CHAMPIONS-LEAGUE": "UCL",
      "LA-LIGA": "LL",
      "SERIE-A": "SA",
      "WORLD-CUP-QUALIFIERS": "WCQ",
      "NATIONS-LEAGUE": "UNL",
    };
    const code = slugMap[key] || slugMap[(competitionCode || "").toLowerCase()] || key;
    return COMPETITION_STANDINGS_MAP[code] || COMPETITION_STANDINGS_MAP["PL"];
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
