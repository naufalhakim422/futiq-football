import {
  CompetitionType,
  PlayerPosition,
  MatchStatus,
  EventType,
  TransferType,
  TransferStatus,
} from "@prisma/client";

export {
  CompetitionType,
  PlayerPosition,
  MatchStatus,
  EventType,
  TransferType,
  TransferStatus,
};

// ==========================================
// 1. DATA CONTRACTS (PROVIDER & SERVICE)
// ==========================================

export interface ProviderStadium {
  name: string;
  city: string;
  capacity?: number;
  imageUrl?: string;
}

export interface ProviderManager {
  name: string;
  slug: string;
  nationality: string;
  photoUrl?: string;
}

export interface ProviderPlayer {
  id: string;
  externalId?: string;
  slug: string;
  name: string;
  firstName?: string;
  lastName?: string;
  position: PlayerPosition;
  shirtNumber?: number;
  nationality: string;
  dateOfBirth?: string;
  photoUrl?: string;
  teamId?: string;
  teamName?: string;
  teamTla?: string;
}

export interface ProviderPlayerStatistic {
  playerId: string;
  season: string;
  competitionCode: string;
  appearances: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  averageRating: number;
}

export interface ProviderPlayerDetail extends ProviderPlayer {
  statistics?: ProviderPlayerStatistic[];
  recentTransfers?: ProviderTransfer[];
  recentMatches?: ProviderMatch[];
}

export interface ProviderTeam {
  id: string;
  externalId?: string;
  slug: string;
  name: string;
  shortName: string;
  tla: string;
  country: string;
  foundedYear?: number;
  websiteUrl?: string;
  logoUrl?: string;
  stadium?: ProviderStadium;
  manager?: ProviderManager;
  competitionCode?: string;
}

export interface ProviderTeamDetail extends ProviderTeam {
  squad: ProviderPlayer[];
  recentMatches: ProviderMatch[];
  upcomingFixtures: ProviderMatch[];
  standing?: ProviderStanding;
}

export interface ProviderCompetition {
  id: string;
  externalId?: string;
  slug: string;
  name: string;
  code: string;
  type: CompetitionType;
  country: string;
  logoUrl?: string;
  currentSeason: string;
}

export interface ProviderMatchEvent {
  id: string;
  minute: number;
  extraMinute?: number;
  type: EventType;
  teamId: string;
  playerId?: string;
  playerName?: string;
  assistPlayerId?: string;
  assistPlayerName?: string;
  inPlayerName?: string;
  outPlayerName?: string;
  varReason?: string;
  detail?: string;
  description?: string; // Factual generated description
}

export interface LineupPlayer {
  playerId?: string;
  name: string;
  number: number;
  position: string;
  positionLabel?: string; // e.g. "Kiper", "Bek Tengah", "Gelandang Serang"
  gridPosition?: string; // e.g. "1:1", "2:3"
  photoUrl?: string;
  rating?: number | string; // e.g. 8.8
  isCaptain?: boolean;
  isMotm?: boolean;
  goals?: number;
  assists?: number;
  yellowCards?: number;
  redCards?: number;
  saves?: number;
  tackles?: number;
  passes?: number;
  passAccuracy?: number;
  keyPasses?: number;
  interceptions?: number;
  clearances?: number;
  fouls?: number;
  fouled?: number;
  dribbles?: number;
  duelsWon?: number;
  minutesPlayed?: number;
  subInMinute?: number;
  subOutMinute?: number;
  isSubstitutedIn?: boolean;
  isSubstitutedOut?: boolean;
}

export interface ProviderMatchLineup {
  teamId: string;
  teamName?: string;
  formation: string;
  manager?: {
    name: string;
    photoUrl?: string;
  };
  starters: LineupPlayer[];
  bench: LineupPlayer[];
}

export interface ProviderH2HSummary {
  totalMatches: number;
  homeWins: number;
  draws: number;
  awayWins: number;
  homeGoals: number;
  awayGoals: number;
  recentMatches: ProviderMatch[];
}

export interface ProviderMatch {
  id: string;
  externalId?: string;
  competition: {
    id: string;
    name: string;
    code: string;
    slug: string;
    logoUrl?: string;
    isInternational?: boolean;
  };
  season: string;
  round?: string;
  group?: string; // e.g. "Group C"
  stage?: string; // e.g. "Round of 16", "Quarter-Final"
  isKnockout?: boolean;
  homeTeam: {
    id: string;
    name: string;
    shortName: string;
    tla: string;
    slug: string;
    logoUrl?: string;
    isNationalTeam?: boolean;
  };
  awayTeam: {
    id: string;
    name: string;
    shortName: string;
    tla: string;
    slug: string;
    logoUrl?: string;
    isNationalTeam?: boolean;
  };
  venue?: ProviderStadium;
  matchDate: string; // ISO 8601
  status: MatchStatus;
  minute?: number;
  homeScore: number;
  awayScore: number;
  htHomeScore?: number;
  htAwayScore?: number;
  etHomeScore?: number;
  etAwayScore?: number;
  penaltyHomeScore?: number;
  penaltyAwayScore?: number;
  decidedByPenalty?: boolean;
  referee?: string;
}

export interface ProviderMatchDetail extends ProviderMatch {
  events: ProviderMatchEvent[];
  lineups: {
    home?: ProviderMatchLineup;
    away?: ProviderMatchLineup;
  };
  h2h?: ProviderH2HSummary;
  homeForm?: string[]; // e.g. ["W", "W", "D", "L", "W"]
  awayForm?: string[];
  homeRecentMatches?: ProviderMatch[];
  awayRecentMatches?: ProviderMatch[];
  standing?: ProviderStanding[];
  stats?: {
    possessionHome: number;
    possessionAway: number;
    shotsHome: number;
    shotsAway: number;
    shotsOnTargetHome: number;
    shotsOnTargetAway: number;
    shotsOffTargetHome?: number;
    shotsOffTargetAway?: number;
    blockedShotsHome?: number;
    blockedShotsAway?: number;
    cornersHome: number;
    cornersAway: number;
    foulsHome: number;
    foulsAway: number;
    yellowCardsHome?: number;
    yellowCardsAway?: number;
    redCardsHome?: number;
    redCardsAway?: number;
    offsidesHome?: number;
    offsidesAway?: number;
    savesHome?: number;
    savesAway?: number;
    bigChancesHome?: number;
    bigChancesAway?: number;
    passesHome?: number;
    passesAway?: number;
    passAccuracyHome?: number;
    passAccuracyAway?: number;
    xgHome?: number;
    xgAway?: number;
  };
}

export interface ProviderStanding {
  position: number;
  team: {
    id: string;
    name: string;
    shortName: string;
    tla: string;
    slug: string;
    logoUrl?: string;
  };
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string; // e.g. "WWDLW"
}

export interface ProviderTransfer {
  id: string;
  playerId: string;
  playerName: string;
  playerPosition: PlayerPosition;
  playerNationality: string;
  fromTeam?: {
    id: string;
    name: string;
    tla: string;
    slug: string;
    logoUrl?: string;
  };
  toTeam?: {
    id: string;
    name: string;
    tla: string;
    slug: string;
    logoUrl?: string;
  };
  feeEur?: number;
  feeDescription?: string;
  transferType: TransferType;
  status: TransferStatus;
  announcementDate: string;
  contractUntil?: string;
}

// ==========================================
// 2. QUERY PARAMETERS & FILTER CRITERIA
// ==========================================

export interface FixtureQueryParams {
  competitionCode?: string;
  teamId?: string;
  status?: MatchStatus;
  date?: string; // YYYY-MM-DD
  fromDate?: string;
  toDate?: string;
  limit?: number;
}

export interface TransferQueryParams {
  teamId?: string;
  status?: TransferStatus;
  transferType?: TransferType;
  limit?: number;
}
