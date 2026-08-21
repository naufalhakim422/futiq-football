import { ProviderStanding } from "./types";

export const COMPETITION_STANDINGS_MAP: Record<string, ProviderStanding[]> = {
  // =========================================================================
  // 1. PREMIER LEAGUE (OFFICIAL 38 MATCHES FINAL STANDINGS)
  // =========================================================================
  PL: [
    {
      position: 1,
      team: { id: "team_liv", name: "Liverpool FC", shortName: "Liverpool", tla: "LIV", slug: "liverpool" },
      played: 38, won: 25, drawn: 9, lost: 4, goalsFor: 86, goalsAgainst: 41, goalDifference: 45, points: 84, form: "WWDWW",
    },
    {
      position: 2,
      team: { id: "team_ars", name: "Arsenal FC", shortName: "Arsenal", tla: "ARS", slug: "arsenal" },
      played: 38, won: 20, drawn: 14, lost: 4, goalsFor: 69, goalsAgainst: 34, goalDifference: 35, points: 74, form: "DWDWW",
    },
    {
      position: 3,
      team: { id: "team_mci", name: "Manchester City FC", shortName: "Man City", tla: "MCI", slug: "manchester-city" },
      played: 38, won: 21, drawn: 8, lost: 9, goalsFor: 73, goalsAgainst: 45, goalDifference: 28, points: 71, form: "WWLWW",
    },
    {
      position: 4,
      team: { id: "team_che", name: "Chelsea FC", shortName: "Chelsea", tla: "CHE", slug: "chelsea" },
      played: 38, won: 20, drawn: 9, lost: 9, goalsFor: 66, goalsAgainst: 45, goalDifference: 21, points: 69, form: "WWWDW",
    },
    {
      position: 5,
      team: { id: "team_new", name: "Newcastle United", shortName: "Newcastle", tla: "NEW", slug: "newcastle" },
      played: 38, won: 20, drawn: 6, lost: 12, goalsFor: 68, goalsAgainst: 47, goalDifference: 21, points: 66, form: "WLWWW",
    },
    {
      position: 6,
      team: { id: "team_avl", name: "Aston Villa", shortName: "Aston Villa", tla: "AVL", slug: "aston-villa" },
      played: 38, won: 19, drawn: 9, lost: 10, goalsFor: 59, goalsAgainst: 52, goalDifference: 7, points: 66, form: "DWLWW",
    },
    {
      position: 7,
      team: { id: "team_nfo", name: "Nottingham Forest", shortName: "Nott'm Forest", tla: "NFO", slug: "nottingham-forest" },
      played: 38, won: 19, drawn: 8, lost: 11, goalsFor: 58, goalsAgainst: 46, goalDifference: 12, points: 65, form: "LWWWD",
    },
    {
      position: 8,
      team: { id: "team_bha", name: "Brighton & Hove Albion", shortName: "Brighton", tla: "BHA", slug: "brighton" },
      played: 38, won: 16, drawn: 13, lost: 9, goalsFor: 63, goalsAgainst: 56, goalDifference: 7, points: 61, form: "DWDDW",
    },
    {
      position: 9,
      team: { id: "team_bou", name: "AFC Bournemouth", shortName: "Bournemouth", tla: "BOU", slug: "bournemouth" },
      played: 38, won: 15, drawn: 11, lost: 12, goalsFor: 57, goalsAgainst: 45, goalDifference: 12, points: 56, form: "WDWWL",
    },
    {
      position: 10,
      team: { id: "team_bre", name: "Brentford FC", shortName: "Brentford", tla: "BRE", slug: "brentford" },
      played: 38, won: 16, drawn: 8, lost: 14, goalsFor: 66, goalsAgainst: 57, goalDifference: 9, points: 56, form: "WWLDW",
    },
    {
      position: 11,
      team: { id: "team_ful", name: "Fulham FC", shortName: "Fulham", tla: "FUL", slug: "fulham" },
      played: 38, won: 15, drawn: 9, lost: 14, goalsFor: 54, goalsAgainst: 54, goalDifference: 0, points: 54, form: "LWDWW",
    },
    {
      position: 12,
      team: { id: "team_cry", name: "Crystal Palace", shortName: "Crystal Palace", tla: "CRY", slug: "crystal-palace" },
      played: 38, won: 13, drawn: 14, lost: 11, goalsFor: 50, goalsAgainst: 50, goalDifference: 0, points: 53, form: "DLDWW",
    },
    {
      position: 13,
      team: { id: "team_eve", name: "Everton FC", shortName: "Everton", tla: "EVE", slug: "everton" },
      played: 38, won: 11, drawn: 15, lost: 12, goalsFor: 44, goalsAgainst: 46, goalDifference: -2, points: 48, form: "DWWDD",
    },
    {
      position: 14,
      team: { id: "team_whu", name: "West Ham United", shortName: "West Ham", tla: "WHU", slug: "west-ham" },
      played: 38, won: 11, drawn: 10, lost: 17, goalsFor: 46, goalsAgainst: 62, goalDifference: -16, points: 43, form: "WLLWD",
    },
    {
      position: 15,
      team: { id: "team_mun", name: "Manchester United", shortName: "Man United", tla: "MUN", slug: "manchester-united" },
      played: 38, won: 11, drawn: 9, lost: 18, goalsFor: 44, goalsAgainst: 54, goalDifference: -10, points: 42, form: "LLWLL",
    },
    {
      position: 16,
      team: { id: "team_wol", name: "Wolverhampton Wanderers", shortName: "Wolves", tla: "WOL", slug: "wolves" },
      played: 38, won: 12, drawn: 6, lost: 20, goalsFor: 54, goalsAgainst: 69, goalDifference: -15, points: 42, form: "LWWLL",
    },
    {
      position: 17,
      team: { id: "team_tot", name: "Tottenham Hotspur", shortName: "Tottenham", tla: "TOT", slug: "tottenham" },
      played: 38, won: 11, drawn: 5, lost: 22, goalsFor: 64, goalsAgainst: 65, goalDifference: -1, points: 38, form: "LLLLD",
    },
    {
      position: 18,
      team: { id: "team_lei", name: "Leicester City", shortName: "Leicester", tla: "LEI", slug: "leicester" },
      played: 38, won: 6, drawn: 7, lost: 25, goalsFor: 33, goalsAgainst: 80, goalDifference: -47, points: 25, form: "LLLDL",
    },
    {
      position: 19,
      team: { id: "team_ips", name: "Ipswich Town", shortName: "Ipswich", tla: "IPS", slug: "ipswich" },
      played: 38, won: 4, drawn: 10, lost: 24, goalsFor: 36, goalsAgainst: 82, goalDifference: -46, points: 22, form: "LDLLL",
    },
    {
      position: 20,
      team: { id: "team_sou", name: "Southampton FC", shortName: "Southampton", tla: "SOU", slug: "southampton" },
      played: 38, won: 2, drawn: 6, lost: 30, goalsFor: 26, goalsAgainst: 86, goalDifference: -60, points: 12, form: "LLLLL",
    },
  ],

  // =========================================================================
  // 2. LA LIGA (OFFICIAL 38 MATCHES FINAL STANDINGS)
  // =========================================================================
  LL: [
    {
      position: 1,
      team: { id: "team_bar", name: "FC Barcelona", shortName: "Barcelona", tla: "BAR", slug: "barcelona" },
      played: 38, won: 28, drawn: 4, lost: 6, goalsFor: 98, goalsAgainst: 35, goalDifference: 63, points: 88, form: "WWWWW",
    },
    {
      position: 2,
      team: { id: "team_rma", name: "Real Madrid CF", shortName: "Real Madrid", tla: "RMA", slug: "real-madrid" },
      played: 38, won: 26, drawn: 6, lost: 6, goalsFor: 78, goalsAgainst: 38, goalDifference: 40, points: 84, form: "WWWDW",
    },
    {
      position: 3,
      team: { id: "team_atm", name: "Atlético de Madrid", shortName: "Atlético", tla: "ATM", slug: "atletico-madrid" },
      played: 38, won: 21, drawn: 11, lost: 6, goalsFor: 68, goalsAgainst: 30, goalDifference: 38, points: 74, form: "WDWWL",
    },
    {
      position: 4,
      team: { id: "team_ath", name: "Athletic Club Bilbao", shortName: "Athletic Club", tla: "ATH", slug: "athletic-club" },
      played: 38, won: 19, drawn: 11, lost: 8, goalsFor: 58, goalsAgainst: 35, goalDifference: 23, points: 68, form: "WDWWD",
    },
    {
      position: 5,
      team: { id: "team_vil", name: "Villarreal CF", shortName: "Villarreal", tla: "VIL", slug: "villarreal" },
      played: 38, won: 18, drawn: 10, lost: 10, goalsFor: 67, goalsAgainst: 52, goalDifference: 15, points: 64, form: "WLDWW",
    },
    {
      position: 6,
      team: { id: "team_rso", name: "Real Sociedad", shortName: "Real Sociedad", tla: "RSO", slug: "real-sociedad" },
      played: 38, won: 17, drawn: 10, lost: 11, goalsFor: 49, goalsAgainst: 39, goalDifference: 10, points: 61, form: "LWWDL",
    },
    {
      position: 7,
      team: { id: "team_bet", name: "Real Betis", shortName: "Real Betis", tla: "BET", slug: "real-betis" },
      played: 38, won: 16, drawn: 12, lost: 10, goalsFor: 52, goalsAgainst: 45, goalDifference: 7, points: 60, form: "WWLDW",
    },
    {
      position: 8,
      team: { id: "team_gir", name: "Girona FC", shortName: "Girona", tla: "GIR", slug: "girona" },
      played: 38, won: 15, drawn: 9, lost: 14, goalsFor: 53, goalsAgainst: 51, goalDifference: 2, points: 54, form: "LLDWW",
    },
    {
      position: 9,
      team: { id: "team_clt", name: "Celta de Vigo", shortName: "Celta Vigo", tla: "CLT", slug: "celta-vigo" },
      played: 38, won: 14, drawn: 10, lost: 14, goalsFor: 56, goalsAgainst: 58, goalDifference: -2, points: 52, form: "LWDLD",
    },
    {
      position: 10,
      team: { id: "team_mll", name: "RCD Mallorca", shortName: "Mallorca", tla: "MLL", slug: "mallorca" },
      played: 38, won: 13, drawn: 12, lost: 13, goalsFor: 37, goalsAgainst: 42, goalDifference: -5, points: 51, form: "WLWLD",
    },
    {
      position: 11,
      team: { id: "team_osa", name: "CA Osasuna", shortName: "Osasuna", tla: "OSA", slug: "osasuna" },
      played: 38, won: 12, drawn: 13, lost: 13, goalsFor: 46, goalsAgainst: 53, goalDifference: -7, points: 49, form: "DLDDW",
    },
    {
      position: 12,
      team: { id: "team_ray", name: "Rayo Vallecano", shortName: "Rayo Vallecano", tla: "RAY", slug: "rayo-vallecano" },
      played: 38, won: 12, drawn: 12, lost: 14, goalsFor: 39, goalsAgainst: 45, goalDifference: -6, points: 48, form: "DLDWL",
    },
    {
      position: 13,
      team: { id: "team_sev", name: "Sevilla FC", shortName: "Sevilla", tla: "SEV", slug: "sevilla" },
      played: 38, won: 11, drawn: 11, lost: 16, goalsFor: 42, goalsAgainst: 52, goalDifference: -10, points: 44, form: "WDLLW",
    },
    {
      position: 14,
      team: { id: "team_ala", name: "Deportivo Alavés", shortName: "Alavés", tla: "ALA", slug: "alaves" },
      played: 38, won: 11, drawn: 9, lost: 18, goalsFor: 43, goalsAgainst: 54, goalDifference: -11, points: 42, form: "WLDLL",
    },
    {
      position: 15,
      team: { id: "team_get", name: "Getafe CF", shortName: "Getafe", tla: "GET", slug: "getafe" },
      played: 38, won: 9, drawn: 15, lost: 14, goalsFor: 31, goalsAgainst: 38, goalDifference: -7, points: 42, form: "DLDDW",
    },
    {
      position: 16,
      team: { id: "team_esp", name: "RCD Espanyol", shortName: "Espanyol", tla: "ESP", slug: "espanyol" },
      played: 38, won: 10, drawn: 11, lost: 17, goalsFor: 40, goalsAgainst: 58, goalDifference: -18, points: 41, form: "LWLLD",
    },
    {
      position: 17,
      team: { id: "team_val", name: "Valencia CF", shortName: "Valencia", tla: "VAL", slug: "valencia" },
      played: 38, won: 9, drawn: 13, lost: 16, goalsFor: 38, goalsAgainst: 54, goalDifference: -16, points: 40, form: "DLDLL",
    },
    {
      position: 18,
      team: { id: "team_leg", name: "CD Leganés", shortName: "Leganés", tla: "LEG", slug: "leganes" },
      played: 38, won: 9, drawn: 13, lost: 16, goalsFor: 34, goalsAgainst: 54, goalDifference: -20, points: 40, form: "LLDDL",
    },
    {
      position: 19,
      team: { id: "team_lpa", name: "UD Las Palmas", shortName: "Las Palmas", tla: "LPA", slug: "las-palmas" },
      played: 38, won: 8, drawn: 8, lost: 22, goalsFor: 42, goalsAgainst: 65, goalDifference: -23, points: 32, form: "LWWLL",
    },
    {
      position: 20,
      team: { id: "team_vld", name: "Real Valladolid", shortName: "Valladolid", tla: "VLD", slug: "valladolid" },
      played: 38, won: 4, drawn: 4, lost: 30, goalsFor: 24, goalsAgainst: 88, goalDifference: -64, points: 16, form: "LLLLL",
    },
  ],

  // =========================================================================
  // 3. SERIE A (OFFICIAL 38 MATCHES FINAL STANDINGS)
  // =========================================================================
  SA: [
    {
      position: 1,
      team: { id: "team_nap", name: "SSC Napoli", shortName: "Napoli", tla: "NAP", slug: "napoli" },
      played: 38, won: 24, drawn: 10, lost: 4, goalsFor: 59, goalsAgainst: 27, goalDifference: 32, points: 82, form: "WWDWW",
    },
    {
      position: 2,
      team: { id: "team_int", name: "Inter Milan", shortName: "Inter", tla: "INT", slug: "inter-milan" },
      played: 38, won: 24, drawn: 9, lost: 5, goalsFor: 79, goalsAgainst: 35, goalDifference: 44, points: 81, form: "WWWDW",
    },
    {
      position: 3,
      team: { id: "team_ata", name: "Atalanta BC", shortName: "Atalanta", tla: "ATA", slug: "atalanta" },
      played: 38, won: 22, drawn: 8, lost: 8, goalsFor: 78, goalsAgainst: 37, goalDifference: 41, points: 74, form: "DWWWL",
    },
    {
      position: 4,
      team: { id: "team_juv", name: "Juventus FC", shortName: "Juventus", tla: "JUV", slug: "juventus" },
      played: 38, won: 18, drawn: 16, lost: 4, goalsFor: 58, goalsAgainst: 35, goalDifference: 23, points: 70, form: "DDWDW",
    },
    {
      position: 5,
      team: { id: "team_rom", name: "AS Roma", shortName: "Roma", tla: "ROM", slug: "roma" },
      played: 38, won: 20, drawn: 9, lost: 9, goalsFor: 56, goalsAgainst: 35, goalDifference: 21, points: 69, form: "WLDDW",
    },
    {
      position: 6,
      team: { id: "team_fio", name: "ACF Fiorentina", shortName: "Fiorentina", tla: "FIO", slug: "fiorentina" },
      played: 38, won: 19, drawn: 8, lost: 11, goalsFor: 60, goalsAgainst: 41, goalDifference: 19, points: 65, form: "LWWDL",
    },
    {
      position: 7,
      team: { id: "team_laz", name: "SS Lazio", shortName: "Lazio", tla: "LAZ", slug: "lazio" },
      played: 38, won: 18, drawn: 11, lost: 9, goalsFor: 61, goalsAgainst: 49, goalDifference: 12, points: 65, form: "WLDWW",
    },
    {
      position: 8,
      team: { id: "team_mil", name: "AC Milan", shortName: "AC Milan", tla: "MIL", slug: "ac-milan" },
      played: 38, won: 18, drawn: 9, lost: 11, goalsFor: 61, goalsAgainst: 43, goalDifference: 18, points: 63, form: "WDLDW",
    },
    {
      position: 9,
      team: { id: "team_bol", name: "Bologna FC", shortName: "Bologna", tla: "BOL", slug: "bologna" },
      played: 38, won: 16, drawn: 14, lost: 8, goalsFor: 57, goalsAgainst: 47, goalDifference: 10, points: 62, form: "DWDWL",
    },
    {
      position: 10,
      team: { id: "team_com", name: "Como 1907", shortName: "Como", tla: "COM", slug: "como" },
      played: 38, won: 13, drawn: 10, lost: 15, goalsFor: 49, goalsAgainst: 52, goalDifference: -3, points: 49, form: "LLDWW",
    },
    {
      position: 11,
      team: { id: "team_tor", name: "Torino FC", shortName: "Torino", tla: "TOR", slug: "torino" },
      played: 38, won: 10, drawn: 14, lost: 14, goalsFor: 39, goalsAgainst: 45, goalDifference: -6, points: 44, form: "DLLWW",
    },
    {
      position: 12,
      team: { id: "team_udi", name: "Udinese Calcio", shortName: "Udinese", tla: "UDI", slug: "udinese" },
      played: 38, won: 12, drawn: 8, lost: 18, goalsFor: 41, goalsAgainst: 56, goalDifference: -15, points: 44, form: "LWLLD",
    },
    {
      position: 13,
      team: { id: "team_gen", name: "Genoa CFC", shortName: "Genoa", tla: "GEN", slug: "genoa" },
      played: 38, won: 10, drawn: 13, lost: 15, goalsFor: 37, goalsAgainst: 49, goalDifference: -12, points: 43, form: "WLDLD",
    },
    {
      position: 14,
      team: { id: "team_ver", name: "Hellas Verona", shortName: "Verona", tla: "VER", slug: "verona" },
      played: 38, won: 10, drawn: 7, lost: 21, goalsFor: 34, goalsAgainst: 66, goalDifference: -32, points: 37, form: "LLLWL",
    },
    {
      position: 15,
      team: { id: "team_cag", name: "Cagliari Calcio", shortName: "Cagliari", tla: "CAG", slug: "cagliari" },
      played: 38, won: 9, drawn: 9, lost: 20, goalsFor: 40, goalsAgainst: 56, goalDifference: -16, points: 36, form: "WLLDD",
    },
    {
      position: 16,
      team: { id: "team_par", name: "Parma Calcio", shortName: "Parma", tla: "PAR", slug: "parma" },
      played: 38, won: 7, drawn: 15, lost: 16, goalsFor: 44, goalsAgainst: 58, goalDifference: -14, points: 36, form: "DWDLL",
    },
    {
      position: 17,
      team: { id: "team_lec", name: "US Lecce", shortName: "Lecce", tla: "LEC", slug: "lecce" },
      played: 38, won: 8, drawn: 10, lost: 20, goalsFor: 27, goalsAgainst: 58, goalDifference: -31, points: 34, form: "DLDLL",
    },
    {
      position: 18,
      team: { id: "team_emp", name: "Empoli FC", shortName: "Empoli", tla: "EMP", slug: "empoli" },
      played: 38, won: 6, drawn: 13, lost: 19, goalsFor: 33, goalsAgainst: 59, goalDifference: -26, points: 31, form: "DLDWL",
    },
    {
      position: 19,
      team: { id: "team_ven", name: "Venezia FC", shortName: "Venezia", tla: "VEN", slug: "venezia" },
      played: 38, won: 5, drawn: 14, lost: 19, goalsFor: 32, goalsAgainst: 56, goalDifference: -24, points: 29, form: "DLLLL",
    },
    {
      position: 20,
      team: { id: "team_mon", name: "AC Monza", shortName: "Monza", tla: "MON", slug: "monza" },
      played: 38, won: 3, drawn: 9, lost: 26, goalsFor: 28, goalsAgainst: 69, goalDifference: -41, points: 18, form: "LLDLL",
    },
  ],

  // =========================================================================
  // 4. UEFA CHAMPIONS LEAGUE (OFFICIAL 36-TEAM SWISS PHASE TOP 16)
  // =========================================================================
  UCL: [
    {
      position: 1,
      team: { id: "team_liv", name: "Liverpool FC", shortName: "Liverpool", tla: "LIV", slug: "liverpool" },
      played: 8, won: 7, drawn: 0, lost: 1, goalsFor: 17, goalsAgainst: 3, goalDifference: 14, points: 21, form: "WWWWL",
    },
    {
      position: 2,
      team: { id: "team_bar", name: "FC Barcelona", shortName: "Barcelona", tla: "BAR", slug: "barcelona" },
      played: 8, won: 6, drawn: 1, lost: 1, goalsFor: 28, goalsAgainst: 13, goalDifference: 15, points: 19, form: "WWLWW",
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
      played: 8, won: 6, drawn: 0, lost: 2, goalsFor: 20, goalsAgainst: 13, goalDifference: 7, points: 18, form: "WWWLW",
    },
    {
      position: 6,
      team: { id: "team_b04", name: "Bayer 04 Leverkusen", shortName: "Leverkusen", tla: "B04", slug: "bayer-leverkusen" },
      played: 8, won: 5, drawn: 2, lost: 1, goalsFor: 16, goalsAgainst: 7, goalDifference: 9, points: 17, form: "DWWLW",
    },
    {
      position: 7,
      team: { id: "team_lil", name: "Lille OSC", shortName: "Lille", tla: "LIL", slug: "lille" },
      played: 8, won: 5, drawn: 2, lost: 1, goalsFor: 17, goalsAgainst: 10, goalDifference: 7, points: 17, form: "WWWDW",
    },
    {
      position: 8,
      team: { id: "team_avl", name: "Aston Villa", shortName: "Aston Villa", tla: "AVL", slug: "aston-villa" },
      played: 8, won: 5, drawn: 1, lost: 2, goalsFor: 13, goalsAgainst: 6, goalDifference: 7, points: 16, form: "DWWLD",
    },
    {
      position: 9,
      team: { id: "team_ata", name: "Atalanta BC", shortName: "Atalanta", tla: "ATA", slug: "atalanta" },
      played: 8, won: 4, drawn: 3, lost: 1, goalsFor: 18, goalsAgainst: 6, goalDifference: 12, points: 15, form: "WDWDW",
    },
    {
      position: 10,
      team: { id: "team_bvb", name: "Borussia Dortmund", shortName: "Dortmund", tla: "BVB", slug: "borussia-dortmund" },
      played: 8, won: 5, drawn: 0, lost: 3, goalsFor: 21, goalsAgainst: 11, goalDifference: 10, points: 15, form: "WLWDW",
    },
    {
      position: 11,
      team: { id: "team_rma", name: "Real Madrid CF", shortName: "Real Madrid", tla: "RMA", slug: "real-madrid" },
      played: 8, won: 5, drawn: 0, lost: 3, goalsFor: 17, goalsAgainst: 11, goalDifference: 6, points: 15, form: "WWLLW",
    },
    {
      position: 12,
      team: { id: "team_bay", name: "FC Bayern München", shortName: "Bayern", tla: "BAY", slug: "bayern-munchen" },
      played: 8, won: 5, drawn: 0, lost: 3, goalsFor: 18, goalsAgainst: 8, goalDifference: 10, points: 15, form: "WLWLW",
    },
    {
      position: 13,
      team: { id: "team_mil", name: "AC Milan", shortName: "AC Milan", tla: "MIL", slug: "ac-milan" },
      played: 8, won: 5, drawn: 0, lost: 3, goalsFor: 15, goalsAgainst: 11, goalDifference: 4, points: 15, form: "WWLWD",
    },
    {
      position: 14,
      team: { id: "team_psv", name: "PSV Eindhoven", shortName: "PSV", tla: "PSV", slug: "psv-eindhoven" },
      played: 8, won: 4, drawn: 2, lost: 2, goalsFor: 16, goalsAgainst: 12, goalDifference: 4, points: 14, form: "WWDLD",
    },
    {
      position: 15,
      team: { id: "team_psg", name: "Paris Saint-Germain", shortName: "PSG", tla: "PSG", slug: "paris-sg" },
      played: 8, won: 4, drawn: 1, lost: 3, goalsFor: 12, goalsAgainst: 9, goalDifference: 3, points: 13, form: "WLDLW",
    },
    {
      position: 16,
      team: { id: "team_ben", name: "SL Benfica", shortName: "Benfica", tla: "BEN", slug: "benfica" },
      played: 8, won: 4, drawn: 1, lost: 3, goalsFor: 16, goalsAgainst: 12, goalDifference: 4, points: 13, form: "LWLLD",
    },
  ],

  // =========================================================================
  // 5. FIFA WORLD CUP QUALIFIERS (AFC ROUND 3 GROUP C & CONMEBOL)
  // =========================================================================
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

  // =========================================================================
  // 6. UEFA NATIONS LEAGUE (OFFICIAL LEAGUE A TABLES)
  // =========================================================================
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
