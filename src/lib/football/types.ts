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
  detail?: string;
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
  keyPasses?: number;
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

export interface ProviderMatch {
  id: string;
  externalId?: string;
  competition: {
    id: string;
    name: string;
    code: string;
    slug: string;
    logoUrl?: string;
  };
  season: string;
  round?: string;
  homeTeam: {
    id: string;
    name: string;
    shortName: string;
    tla: string;
    slug: string;
    logoUrl?: string;
  };
  awayTeam: {
    id: string;
    name: string;
    shortName: string;
    tla: string;
    slug: string;
    logoUrl?: string;
  };
  venue?: ProviderStadium;
  matchDate: string; // ISO 8601
  status: MatchStatus;
  minute?: number;
  homeScore: number;
  awayScore: number;
  htHomeScore?: number;
  htAwayScore?: number;
  referee?: string;
}

export interface ProviderMatchDetail extends ProviderMatch {
  events: ProviderMatchEvent[];
  lineups: {
    home?: ProviderMatchLineup;
    away?: ProviderMatchLineup;
  };
  stats?: {
    possessionHome: number;
    possessionAway: number;
    shotsHome: number;
    shotsAway: number;
    shotsOnTargetHome: number;
    shotsOnTargetAway: number;
    cornersHome: number;
    cornersAway: number;
    foulsHome: number;
    foulsAway: number;
    xgHome?: number;
    xgAway?: number;
    passesHome?: number;
    passesAway?: number;
    passAccuracyHome?: number;
    passAccuracyAway?: number;
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
