export type MatchStatus =
  | "SCHEDULED"
  | "LIVE_1H"
  | "HT"
  | "LIVE_2H"
  | "ET"
  | "PENALTY"
  | "FINISHED"
  | "POSTPONED";

export interface Team {
  id: string;
  name: string;
  shortName: string;
  tla: string; // Three-letter abbreviation (ARS, CHE, RMA, BAR)
  logoUrl?: string;
}

export interface Competition {
  id: string;
  name: string;
  code: string;
  country: string;
  logoUrl?: string;
}

export interface MatchScore {
  home: number;
  away: number;
}

export interface MatchSummary {
  id: string;
  competition: Competition;
  homeTeam: Team;
  awayTeam: Team;
  score: MatchScore;
  status: MatchStatus;
  minute?: number;
  matchDate: string;
  venue?: string;
}

export interface StandingRow {
  position: number;
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: Array<"W" | "D" | "L">;
}
