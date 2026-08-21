import { ProviderStanding } from "./types";

export const COMPETITION_STANDINGS_MAP: Record<string, ProviderStanding[]> = {
  // ==========================================
  // 1. PREMIER LEAGUE (20 TEAMS)
  // ==========================================
  PL: [
    {
      position: 1,
      team: { id: "team_liv", name: "Liverpool FC", shortName: "Liverpool", tla: "LIV", slug: "liverpool" },
      played: 28, won: 20, drawn: 7, lost: 1, goalsFor: 67, goalsAgainst: 24, goalDifference: 43, points: 67, form: "WWWDW",
    },
    {
      position: 2,
      team: { id: "team_ars", name: "Arsenal FC", shortName: "Arsenal", tla: "ARS", slug: "arsenal" },
      played: 28, won: 18, drawn: 7, lost: 3, goalsFor: 58, goalsAgainst: 23, goalDifference: 35, points: 61, form: "WDWWW",
    },
    {
      position: 3,
      team: { id: "team_nfo", name: "Nottingham Forest", shortName: "Nott'm Forest", tla: "NFO", slug: "nottingham-forest" },
      played: 28, won: 16, drawn: 6, lost: 6, goalsFor: 44, goalsAgainst: 29, goalDifference: 15, points: 54, form: "WWLWW",
    },
    {
      position: 4,
      team: { id: "team_che", name: "Chelsea FC", shortName: "Chelsea", tla: "CHE", slug: "chelsea" },
      played: 28, won: 15, drawn: 7, lost: 6, goalsFor: 54, goalsAgainst: 34, goalDifference: 20, points: 52, form: "LWWWD",
    },
    {
      position: 5,
      team: { id: "team_mci", name: "Manchester City FC", shortName: "Man City", tla: "MCI", slug: "manchester-city" },
      played: 28, won: 15, drawn: 6, lost: 7, goalsFor: 55, goalsAgainst: 35, goalDifference: 20, points: 51, form: "WLDWW",
    },
    {
      position: 6,
      team: { id: "team_new", name: "Newcastle United", shortName: "Newcastle", tla: "NEW", slug: "newcastle" },
      played: 28, won: 14, drawn: 6, lost: 8, goalsFor: 46, goalsAgainst: 35, goalDifference: 11, points: 48, form: "WWDLW",
    },
    {
      position: 7,
      team: { id: "team_bou", name: "AFC Bournemouth", shortName: "Bournemouth", tla: "BOU", slug: "bournemouth" },
      played: 28, won: 13, drawn: 7, lost: 8, goalsFor: 45, goalsAgainst: 33, goalDifference: 12, points: 46, form: "WDWWL",
    },
    {
      position: 8,
      team: { id: "team_avl", name: "Aston Villa", shortName: "Aston Villa", tla: "AVL", slug: "aston-villa" },
      played: 28, won: 12, drawn: 8, lost: 8, goalsFor: 43, goalsAgainst: 40, goalDifference: 3, points: 44, form: "DLDWW",
    },
    {
      position: 9,
      team: { id: "team_ful", name: "Fulham FC", shortName: "Fulham", tla: "FUL", slug: "fulham" },
      played: 28, won: 12, drawn: 7, lost: 9, goalsFor: 41, goalsAgainst: 37, goalDifference: 4, points: 43, form: "WWLLD",
    },
    {
      position: 10,
      team: { id: "team_bha", name: "Brighton & Hove Albion", shortName: "Brighton", tla: "BHA", slug: "brighton" },
      played: 28, won: 11, drawn: 10, lost: 7, goalsFor: 44, goalsAgainst: 41, goalDifference: 3, points: 43, form: "DWDLD",
    },
    {
      position: 11,
      team: { id: "team_bre", name: "Brentford FC", shortName: "Brentford", tla: "BRE", slug: "brentford" },
      played: 28, won: 11, drawn: 5, lost: 12, goalsFor: 48, goalsAgainst: 46, goalDifference: 2, points: 38, form: "LLWDW",
    },
    {
      position: 12,
      team: { id: "team_tot", name: "Tottenham Hotspur", shortName: "Tottenham", tla: "TOT", slug: "tottenham" },
      played: 28, won: 10, drawn: 4, lost: 14, goalsFor: 52, goalsAgainst: 43, goalDifference: 9, points: 34, form: "LLWLD",
    },
    {
      position: 13,
      team: { id: "team_mun", name: "Manchester United", shortName: "Man United", tla: "MUN", slug: "manchester-united" },
      played: 28, won: 9, drawn: 7, lost: 12, goalsFor: 34, goalsAgainst: 39, goalDifference: -5, points: 34, form: "LDWLL",
    },
    {
      position: 14,
      team: { id: "team_whu", name: "West Ham United", shortName: "West Ham", tla: "WHU", slug: "west-ham" },
      played: 28, won: 9, drawn: 6, lost: 13, goalsFor: 33, goalsAgainst: 49, goalDifference: -16, points: 33, form: "WLLWD",
    },
    {
      position: 15,
      team: { id: "team_eve", name: "Everton FC", shortName: "Everton", tla: "EVE", slug: "everton" },
      played: 28, won: 8, drawn: 9, lost: 11, goalsFor: 30, goalsAgainst: 35, goalDifference: -5, points: 33, form: "DWWDD",
    },
    {
      position: 16,
      team: { id: "team_cry", name: "Crystal Palace", shortName: "Crystal Palace", tla: "CRY", slug: "crystal-palace" },
      played: 28, won: 7, drawn: 10, lost: 11, goalsFor: 31, goalsAgainst: 38, goalDifference: -7, points: 31, form: "DLDWL",
    },
    {
      position: 17,
      team: { id: "team_wol", name: "Wolverhampton Wanderers", shortName: "Wolves", tla: "WOL", slug: "wolves" },
      played: 28, won: 6, drawn: 5, lost: 17, goalsFor: 38, goalsAgainst: 58, goalDifference: -20, points: 23, form: "LLWLL",
    },
    {
      position: 18,
      team: { id: "team_ips", name: "Ipswich Town", shortName: "Ipswich", tla: "IPS", slug: "ipswich" },
      played: 28, won: 3, drawn: 8, lost: 17, goalsFor: 27, goalsAgainst: 58, goalDifference: -31, points: 17, form: "LDLLL",
    },
    {
      position: 19,
      team: { id: "team_lei", name: "Leicester City", shortName: "Leicester", tla: "LEI", slug: "leicester" },
      played: 28, won: 4, drawn: 5, lost: 19, goalsFor: 26, goalsAgainst: 63, goalDifference: -37, points: 17, form: "LLLLL",
    },
    {
      position: 20,
      team: { id: "team_sou", name: "Southampton FC", shortName: "Southampton", tla: "SOU", slug: "southampton" },
      played: 28, won: 2, drawn: 3, lost: 23, goalsFor: 19, goalsAgainst: 68, goalDifference: -49, points: 9, form: "LLLLL",
    },
  ],

  // ==========================================
  // 2. LA LIGA (20 TEAMS)
  // ==========================================
  LL: [
    {
      position: 1,
      team: { id: "team_bar", name: "FC Barcelona", shortName: "Barcelona", tla: "BAR", slug: "barcelona" },
      played: 28, won: 20, drawn: 4, lost: 4, goalsFor: 75, goalsAgainst: 27, goalDifference: 48, points: 64, form: "WWWWD",
    },
    {
      position: 2,
      team: { id: "team_rma", name: "Real Madrid CF", shortName: "Real Madrid", tla: "RMA", slug: "real-madrid" },
      played: 28, won: 19, drawn: 6, lost: 3, goalsFor: 60, goalsAgainst: 23, goalDifference: 37, points: 63, form: "WWWDW",
    },
    {
      position: 3,
      team: { id: "team_atm", name: "Atlético de Madrid", shortName: "Atlético", tla: "ATM", slug: "atletico-madrid" },
      played: 28, won: 16, drawn: 9, lost: 3, goalsFor: 47, goalsAgainst: 19, goalDifference: 28, points: 57, form: "WDWWL",
    },
    {
      position: 4,
      team: { id: "team_ath", name: "Athletic Club Bilbao", shortName: "Athletic Club", tla: "ATH", slug: "athletic-club" },
      played: 28, won: 15, drawn: 7, lost: 6, goalsFor: 45, goalsAgainst: 26, goalDifference: 19, points: 52, form: "WDWWD",
    },
    {
      position: 5,
      team: { id: "team_vil", name: "Villarreal CF", shortName: "Villarreal", tla: "VIL", slug: "villarreal" },
      played: 28, won: 13, drawn: 8, lost: 7, goalsFor: 51, goalsAgainst: 40, goalDifference: 11, points: 47, form: "WLDWW",
    },
    {
      position: 6,
      team: { id: "team_bet", name: "Real Betis", shortName: "Real Betis", tla: "BET", slug: "real-betis" },
      played: 28, won: 12, drawn: 8, lost: 8, goalsFor: 37, goalsAgainst: 32, goalDifference: 5, points: 44, form: "WWLDW",
    },
    {
      position: 7,
      team: { id: "team_rso", name: "Real Sociedad", shortName: "Real Sociedad", tla: "RSO", slug: "real-sociedad" },
      played: 28, won: 12, drawn: 7, lost: 9, goalsFor: 34, goalsAgainst: 28, goalDifference: 6, points: 43, form: "LWWDL",
    },
    {
      position: 8,
      team: { id: "team_mll", name: "RCD Mallorca", shortName: "Mallorca", tla: "MLL", slug: "mallorca" },
      played: 28, won: 11, drawn: 6, lost: 11, goalsFor: 29, goalsAgainst: 34, goalDifference: -5, points: 39, form: "WLWLD",
    },
    {
      position: 9,
      team: { id: "team_osa", name: "CA Osasuna", shortName: "Osasuna", tla: "OSA", slug: "osasuna" },
      played: 28, won: 9, drawn: 10, lost: 9, goalsFor: 34, goalsAgainst: 39, goalDifference: -5, points: 37, form: "DLDDW",
    },
    {
      position: 10,
      team: { id: "team_gir", name: "Girona FC", shortName: "Girona", tla: "GIR", slug: "girona" },
      played: 28, won: 10, drawn: 6, lost: 12, goalsFor: 38, goalsAgainst: 40, goalDifference: -2, points: 36, form: "LLDWW",
    },
    {
      position: 11,
      team: { id: "team_sev", name: "Sevilla FC", shortName: "Sevilla", tla: "SEV", slug: "sevilla" },
      played: 28, won: 9, drawn: 8, lost: 11, goalsFor: 34, goalsAgainst: 39, goalDifference: -5, points: 35, form: "WDLLW",
    },
    {
      position: 12,
      team: { id: "team_clt", name: "Celta de Vigo", shortName: "Celta Vigo", tla: "CLT", slug: "celta-vigo" },
      played: 28, won: 9, drawn: 7, lost: 12, goalsFor: 40, goalsAgainst: 45, goalDifference: -5, points: 34, form: "LWDLD",
    },
    {
      position: 13,
      team: { id: "team_ray", name: "Rayo Vallecano", shortName: "Rayo Vallecano", tla: "RAY", slug: "rayo-vallecano" },
      played: 28, won: 8, drawn: 9, lost: 11, goalsFor: 28, goalsAgainst: 33, goalDifference: -5, points: 33, form: "DLDWL",
    },
    {
      position: 14,
      team: { id: "team_lpa", name: "UD Las Palmas", shortName: "Las Palmas", tla: "LPA", slug: "las-palmas" },
      played: 28, won: 8, drawn: 7, lost: 13, goalsFor: 36, goalsAgainst: 47, goalDifference: -11, points: 31, form: "LWWLL",
    },
    {
      position: 15,
      team: { id: "team_ala", name: "Deportivo Alavés", shortName: "Alavés", tla: "ALA", slug: "alaves" },
      played: 28, won: 8, drawn: 6, lost: 14, goalsFor: 33, goalsAgainst: 44, goalDifference: -11, points: 30, form: "WLDLL",
    },
    {
      position: 16,
      team: { id: "team_get", name: "Getafe CF", shortName: "Getafe", tla: "GET", slug: "getafe" },
      played: 28, won: 6, drawn: 11, lost: 11, goalsFor: 22, goalsAgainst: 28, goalDifference: -6, points: 29, form: "DLDDW",
    },
    {
      position: 17,
      team: { id: "team_esp", name: "RCD Espanyol", shortName: "Espanyol", tla: "ESP", slug: "espanyol" },
      played: 28, won: 7, drawn: 6, lost: 15, goalsFor: 27, goalsAgainst: 46, goalDifference: -19, points: 27, form: "LWLLD",
    },
    {
      position: 18,
      team: { id: "team_leg", name: "CD Leganés", shortName: "Leganés", tla: "LEG", slug: "leganes" },
      played: 28, won: 5, drawn: 9, lost: 14, goalsFor: 24, goalsAgainst: 43, goalDifference: -19, points: 24, form: "LLDDL",
    },
    {
      position: 19,
      team: { id: "team_val", name: "Valencia CF", shortName: "Valencia", tla: "VAL", slug: "valencia" },
      played: 28, won: 5, drawn: 9, lost: 14, goalsFor: 24, goalsAgainst: 44, goalDifference: -20, points: 24, form: "DLDLL",
    },
    {
      position: 20,
      team: { id: "team_vld", name: "Real Valladolid", shortName: "Valladolid", tla: "VLD", slug: "valladolid" },
      played: 28, won: 4, drawn: 4, lost: 20, goalsFor: 18, goalsAgainst: 60, goalDifference: -42, points: 16, form: "LLLLL",
    },
  ],

  // ==========================================
  // 3. SERIE A (20 TEAMS)
  // ==========================================
  SA: [
    {
      position: 1,
      team: { id: "team_int", name: "Inter Milan", shortName: "Inter", tla: "INT", slug: "inter-milan" },
      played: 28, won: 20, drawn: 5, lost: 3, goalsFor: 65, goalsAgainst: 23, goalDifference: 42, points: 65, form: "WWWDW",
    },
    {
      position: 2,
      team: { id: "team_nap", name: "SSC Napoli", shortName: "Napoli", tla: "NAP", slug: "napoli" },
      played: 28, won: 19, drawn: 6, lost: 3, goalsFor: 53, goalsAgainst: 21, goalDifference: 32, points: 63, form: "WWDWW",
    },
    {
      position: 3,
      team: { id: "team_ata", name: "Atalanta BC", shortName: "Atalanta", tla: "ATA", slug: "atalanta" },
      played: 28, won: 18, drawn: 4, lost: 6, goalsFor: 63, goalsAgainst: 30, goalDifference: 33, points: 58, form: "DWWWL",
    },
    {
      position: 4,
      team: { id: "team_juv", name: "Juventus FC", shortName: "Juventus", tla: "JUV", slug: "juventus" },
      played: 28, won: 14, drawn: 13, lost: 1, goalsFor: 46, goalsAgainst: 19, goalDifference: 27, points: 55, form: "DDWDW",
    },
    {
      position: 5,
      team: { id: "team_laz", name: "SS Lazio", shortName: "Lazio", tla: "LAZ", slug: "lazio" },
      played: 28, won: 16, drawn: 4, lost: 8, goalsFor: 49, goalsAgainst: 34, goalDifference: 15, points: 52, form: "WLDWW",
    },
    {
      position: 6,
      team: { id: "team_fio", name: "ACF Fiorentina", shortName: "Fiorentina", tla: "FIO", slug: "fiorentina" },
      played: 28, won: 14, drawn: 6, lost: 8, goalsFor: 47, goalsAgainst: 31, goalDifference: 16, points: 48, form: "LWWDL",
    },
    {
      position: 7,
      team: { id: "team_mil", name: "AC Milan", shortName: "AC Milan", tla: "MIL", slug: "ac-milan" },
      played: 28, won: 13, drawn: 8, lost: 7, goalsFor: 46, goalsAgainst: 33, goalDifference: 13, points: 47, form: "WDLDW",
    },
    {
      position: 8,
      team: { id: "team_bol", name: "Bologna FC", shortName: "Bologna", tla: "BOL", slug: "bologna" },
      played: 28, won: 11, drawn: 11, lost: 6, goalsFor: 39, goalsAgainst: 33, goalDifference: 6, points: 44, form: "DWDWL",
    },
    {
      position: 9,
      team: { id: "team_rom", name: "AS Roma", shortName: "Roma", tla: "ROM", slug: "roma" },
      played: 28, won: 11, drawn: 7, lost: 10, goalsFor: 38, goalsAgainst: 37, goalDifference: 1, points: 40, form: "WLDDW",
    },
    {
      position: 10,
      team: { id: "team_tor", name: "Torino FC", shortName: "Torino", tla: "TOR", slug: "torino" },
      played: 28, won: 9, drawn: 8, lost: 11, goalsFor: 32, goalsAgainst: 37, goalDifference: -5, points: 35, form: "DLLWW",
    },
    {
      position: 11,
      team: { id: "team_udi", name: "Udinese Calcio", shortName: "Udinese", tla: "UDI", slug: "udinese" },
      played: 28, won: 10, drawn: 4, lost: 14, goalsFor: 33, goalsAgainst: 45, goalDifference: -12, points: 34, form: "LWLLD",
    },
    {
      position: 12,
      team: { id: "team_emp", name: "Empoli FC", shortName: "Empoli", tla: "EMP", slug: "empoli" },
      played: 28, won: 7, drawn: 10, lost: 11, goalsFor: 25, goalsAgainst: 35, goalDifference: -10, points: 31, form: "DLDWL",
    },
    {
      position: 13,
      team: { id: "team_gen", name: "Genoa CFC", shortName: "Genoa", tla: "GEN", slug: "genoa" },
      played: 28, won: 7, drawn: 10, lost: 11, goalsFor: 28, goalsAgainst: 39, goalDifference: -11, points: 31, form: "WLDLD",
    },
    {
      position: 14,
      team: { id: "team_par", name: "Parma Calcio", shortName: "Parma", tla: "PAR", slug: "parma" },
      played: 28, won: 6, drawn: 11, lost: 11, goalsFor: 35, goalsAgainst: 46, goalDifference: -11, points: 29, form: "DWDLL",
    },
    {
      position: 15,
      team: { id: "team_com", name: "Como 1907", shortName: "Como", tla: "COM", slug: "como" },
      played: 28, won: 6, drawn: 10, lost: 12, goalsFor: 31, goalsAgainst: 44, goalDifference: -13, points: 28, form: "LLDWW",
    },
    {
      position: 16,
      team: { id: "team_cag", name: "Cagliari Calcio", shortName: "Cagliari", tla: "CAG", slug: "cagliari" },
      played: 28, won: 6, drawn: 8, lost: 14, goalsFor: 29, goalsAgainst: 47, goalDifference: -18, points: 26, form: "WLLDD",
    },
    {
      position: 17,
      team: { id: "team_lec", name: "US Lecce", shortName: "Lecce", tla: "LEC", slug: "lecce" },
      played: 28, won: 6, drawn: 7, lost: 15, goalsFor: 21, goalsAgainst: 45, goalDifference: -24, points: 25, form: "DLDLL",
    },
    {
      position: 18,
      team: { id: "team_ver", name: "Hellas Verona", shortName: "Verona", tla: "VER", slug: "verona" },
      played: 28, won: 7, drawn: 2, lost: 19, goalsFor: 30, goalsAgainst: 57, goalDifference: -27, points: 23, form: "LLLWL",
    },
    {
      position: 19,
      team: { id: "team_ven", name: "Venezia FC", shortName: "Venezia", tla: "VEN", slug: "venezia" },
      played: 28, won: 4, drawn: 7, lost: 17, goalsFor: 25, goalsAgainst: 49, goalDifference: -24, points: 19, form: "DLLLL",
    },
    {
      position: 20,
      team: { id: "team_mon", name: "AC Monza", shortName: "Monza", tla: "MON", slug: "monza" },
      played: 28, won: 2, drawn: 9, lost: 17, goalsFor: 20, goalsAgainst: 47, goalDifference: -27, points: 15, form: "LLDLL",
    },
  ],

  // ==========================================
  // 4. UEFA CHAMPIONS LEAGUE (SWISS PHASE)
  // ==========================================
  UCL: [
    {
      position: 1,
      team: { id: "team_liv", name: "Liverpool FC", shortName: "Liverpool", tla: "LIV", slug: "liverpool" },
      played: 8, won: 7, drawn: 1, lost: 0, goalsFor: 17, goalsAgainst: 3, goalDifference: 14, points: 22, form: "WWWDW",
    },
    {
      position: 2,
      team: { id: "team_bar", name: "FC Barcelona", shortName: "Barcelona", tla: "BAR", slug: "barcelona" },
      played: 8, won: 6, drawn: 1, lost: 1, goalsFor: 24, goalsAgainst: 9, goalDifference: 15, points: 19, form: "WWLWW",
    },
    {
      position: 3,
      team: { id: "team_ars", name: "Arsenal FC", shortName: "Arsenal", tla: "ARS", slug: "arsenal" },
      played: 8, won: 6, drawn: 1, lost: 1, goalsFor: 16, goalsAgainst: 3, goalDifference: 13, points: 19, form: "WWWDW",
    },
    {
      position: 4,
      team: { id: "team_int", name: "Inter Milan", shortName: "Inter", tla: "INT", slug: "inter-milan" },
      played: 8, won: 6, drawn: 1, lost: 1, goalsFor: 12, goalsAgainst: 2, goalDifference: 10, points: 19, form: "WWDWW",
    },
    {
      position: 5,
      team: { id: "team_atm", name: "Atlético de Madrid", shortName: "Atlético", tla: "ATM", slug: "atletico-madrid" },
      played: 8, won: 6, drawn: 0, lost: 2, goalsFor: 18, goalsAgainst: 12, goalDifference: 6, points: 18, form: "WWWLW",
    },
    {
      position: 6,
      team: { id: "team_b04", name: "Bayer 04 Leverkusen", shortName: "Leverkusen", tla: "B04", slug: "bayer-leverkusen" },
      played: 8, won: 5, drawn: 2, lost: 1, goalsFor: 16, goalsAgainst: 7, goalDifference: 9, points: 17, form: "DWWLW",
    },
    {
      position: 7,
      team: { id: "team_bvb", name: "Borussia Dortmund", shortName: "Dortmund", tla: "BVB", slug: "borussia-dortmund" },
      played: 8, won: 5, drawn: 1, lost: 2, goalsFor: 21, goalsAgainst: 11, goalDifference: 10, points: 16, form: "WLWDW",
    },
    {
      position: 8,
      team: { id: "team_rma", name: "Real Madrid CF", shortName: "Real Madrid", tla: "RMA", slug: "real-madrid" },
      played: 8, won: 5, drawn: 0, lost: 3, goalsFor: 17, goalsAgainst: 11, goalDifference: 6, points: 15, form: "WWLLW",
    },
    {
      position: 9,
      team: { id: "team_bay", name: "FC Bayern München", shortName: "Bayern", tla: "BAY", slug: "bayern-munchen" },
      played: 8, won: 5, drawn: 0, lost: 3, goalsFor: 18, goalsAgainst: 8, goalDifference: 10, points: 15, form: "WLWLW",
    },
    {
      position: 10,
      team: { id: "team_mci", name: "Manchester City FC", shortName: "Man City", tla: "MCI", slug: "manchester-city" },
      played: 8, won: 4, drawn: 2, lost: 2, goalsFor: 16, goalsAgainst: 8, goalDifference: 8, points: 14, form: "LDWWD",
    },
    {
      position: 11,
      team: { id: "team_juv", name: "Juventus FC", shortName: "Juventus", tla: "JUV", slug: "juventus" },
      played: 8, won: 4, drawn: 2, lost: 2, goalsFor: 11, goalsAgainst: 7, goalDifference: 4, points: 14, form: "DWDWL",
    },
    {
      position: 12,
      team: { id: "team_avl", name: "Aston Villa", shortName: "Aston Villa", tla: "AVL", slug: "aston-villa" },
      played: 8, won: 4, drawn: 2, lost: 2, goalsFor: 10, goalsAgainst: 6, goalDifference: 4, points: 14, form: "DWWLD",
    },
    {
      position: 13,
      team: { id: "team_mil", name: "AC Milan", shortName: "AC Milan", tla: "MIL", slug: "ac-milan" },
      played: 8, won: 4, drawn: 1, lost: 3, goalsFor: 14, goalsAgainst: 12, goalDifference: 2, points: 13, form: "WWLWD",
    },
    {
      position: 14,
      team: { id: "team_psg", name: "Paris Saint-Germain", shortName: "PSG", tla: "PSG", slug: "paris-sg" },
      played: 8, won: 3, drawn: 2, lost: 3, goalsFor: 8, goalsAgainst: 8, goalDifference: 0, points: 11, form: "WLDLW",
    },
    {
      position: 15,
      team: { id: "team_ben", name: "SL Benfica", shortName: "Benfica", tla: "BEN", slug: "benfica" },
      played: 8, won: 3, drawn: 1, lost: 4, goalsFor: 13, goalsAgainst: 13, goalDifference: 0, points: 10, form: "LWLLD",
    },
    {
      position: 16,
      team: { id: "team_spo", name: "Sporting CP", shortName: "Sporting", tla: "SPO", slug: "sporting-cp" },
      played: 8, won: 3, drawn: 1, lost: 4, goalsFor: 12, goalsAgainst: 14, goalDifference: -2, points: 10, form: "LLDWW",
    },
  ],

  // ==========================================
  // 5. FIFA WORLD CUP QUALIFIERS (AFC & CONMEBOL)
  // ==========================================
  WCQ: [
    {
      position: 1,
      team: { id: "nat_jpn", name: "Japan", shortName: "Japan", tla: "JPN", slug: "japan" },
      played: 6, won: 5, drawn: 1, lost: 0, goalsFor: 22, goalsAgainst: 2, goalDifference: 20, points: 16, form: "WWWDW",
    },
    {
      position: 2,
      team: { id: "nat_aus", name: "Australia", shortName: "Australia", tla: "AUS", slug: "australia" },
      played: 6, won: 1, drawn: 4, lost: 1, goalsFor: 6, goalsAgainst: 5, goalDifference: 1, points: 7, form: "DDDWD",
    },
    {
      position: 3,
      team: { id: "nat_ina", name: "Indonesia", shortName: "Indonesia", tla: "INA", slug: "indonesia" },
      played: 6, won: 1, drawn: 3, lost: 2, goalsFor: 6, goalsAgainst: 9, goalDifference: -3, points: 6, form: "WLDLD",
    },
    {
      position: 4,
      team: { id: "nat_ksa", name: "Saudi Arabia", shortName: "Saudi Arabia", tla: "KSA", slug: "saudi-arabia" },
      played: 6, won: 1, drawn: 3, lost: 2, goalsFor: 3, goalsAgainst: 6, goalDifference: -3, points: 6, form: "LDDLW",
    },
    {
      position: 5,
      team: { id: "nat_bhr", name: "Bahrain", shortName: "Bahrain", tla: "BHR", slug: "bahrain" },
      played: 6, won: 1, drawn: 3, lost: 2, goalsFor: 5, goalsAgainst: 10, goalDifference: -5, points: 6, form: "DLDDL",
    },
    {
      position: 6,
      team: { id: "nat_chn", name: "China PR", shortName: "China", tla: "CHN", slug: "china" },
      played: 6, won: 2, drawn: 0, lost: 4, goalsFor: 6, goalsAgainst: 16, goalDifference: -10, points: 6, form: "LWWLL",
    },
    {
      position: 7,
      team: { id: "nat_arg", name: "Argentina", shortName: "Argentina", tla: "ARG", slug: "argentina" },
      played: 12, won: 8, drawn: 1, lost: 3, goalsFor: 21, goalsAgainst: 7, goalDifference: 14, points: 25, form: "WLWDW",
    },
    {
      position: 8,
      team: { id: "nat_uru", name: "Uruguay", shortName: "Uruguay", tla: "URU", slug: "uruguay" },
      played: 12, won: 5, drawn: 5, lost: 2, goalsFor: 16, goalsAgainst: 9, goalDifference: 7, points: 20, form: "DWDDL",
    },
    {
      position: 9,
      team: { id: "nat_ecu", name: "Ecuador", shortName: "Ecuador", tla: "ECU", slug: "ecuador" },
      played: 12, won: 6, drawn: 4, lost: 2, goalsFor: 11, goalsAgainst: 4, goalDifference: 7, points: 19, form: "WWDWD",
    },
    {
      position: 10,
      team: { id: "nat_col", name: "Colombia", shortName: "Colombia", tla: "COL", slug: "colombia" },
      played: 12, won: 5, drawn: 4, lost: 3, goalsFor: 15, goalsAgainst: 10, goalDifference: 5, points: 19, form: "LLWDW",
    },
    {
      position: 11,
      team: { id: "nat_bra", name: "Brazil", shortName: "Brazil", tla: "BRA", slug: "brazil" },
      played: 12, won: 5, drawn: 3, lost: 4, goalsFor: 17, goalsAgainst: 11, goalDifference: 6, points: 18, form: "DDWWL",
    },
  ],

  // ==========================================
  // 6. UEFA NATIONS LEAGUE
  // ==========================================
  UNL: [
    {
      position: 1,
      team: { id: "nat_esp", name: "Spain", shortName: "Spain", tla: "ESP", slug: "spain" },
      played: 6, won: 5, drawn: 1, lost: 0, goalsFor: 13, goalsAgainst: 4, goalDifference: 9, points: 16, form: "WWWDW",
    },
    {
      position: 2,
      team: { id: "nat_ger", name: "Germany", shortName: "Germany", tla: "GER", slug: "germany" },
      played: 6, won: 4, drawn: 2, lost: 0, goalsFor: 18, goalsAgainst: 4, goalDifference: 14, points: 14, form: "DWWWD",
    },
    {
      position: 3,
      team: { id: "nat_por", name: "Portugal", shortName: "Portugal", tla: "POR", slug: "portugal" },
      played: 6, won: 4, drawn: 2, lost: 0, goalsFor: 13, goalsAgainst: 5, goalDifference: 8, points: 14, form: "DWWWD",
    },
    {
      position: 4,
      team: { id: "nat_fra", name: "France", shortName: "France", tla: "FRA", slug: "france" },
      played: 6, won: 4, drawn: 1, lost: 1, goalsFor: 12, goalsAgainst: 6, goalDifference: 6, points: 13, form: "WWWDW",
    },
    {
      position: 5,
      team: { id: "nat_ita", name: "Italy", shortName: "Italy", tla: "ITA", slug: "italy" },
      played: 6, won: 4, drawn: 1, lost: 1, goalsFor: 13, goalsAgainst: 8, goalDifference: 5, points: 13, form: "LWDWW",
    },
    {
      position: 6,
      team: { id: "nat_ned", name: "Netherlands", shortName: "Netherlands", tla: "NED", slug: "netherlands" },
      played: 6, won: 2, drawn: 3, lost: 1, goalsFor: 13, goalsAgainst: 7, goalDifference: 6, points: 9, form: "DLDWD",
    },
    {
      position: 7,
      team: { id: "nat_cro", name: "Croatia", shortName: "Croatia", tla: "CRO", slug: "croatia" },
      played: 6, won: 2, drawn: 2, lost: 2, goalsFor: 8, goalsAgainst: 8, goalDifference: 0, points: 8, form: "DLDWW",
    },
    {
      position: 8,
      team: { id: "nat_den", name: "Denmark", shortName: "Denmark", tla: "DEN", slug: "denmark" },
      played: 6, won: 2, drawn: 2, lost: 2, goalsFor: 7, goalsAgainst: 5, goalDifference: 2, points: 8, form: "DLDLW",
    },
  ],
};
