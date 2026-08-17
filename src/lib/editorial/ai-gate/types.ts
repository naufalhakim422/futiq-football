import { GateStatus, FindingSeverity, FindingCategory, ImageRightsStatus, SourceType } from "@prisma/client";

export interface EditorialFindingDto {
  category: FindingCategory;
  severity: FindingSeverity;
  finding: string;
  evidence?: string;
  sourceUrl?: string;
  sourceTitle?: string;
  matchedText?: string;
  recommendation?: string;
}

export interface GateScores {
  overallScore: number;
  originalityScore: number;
  sourceScore: number;
  factScore: number;
  qualityScore: number;
  clickbaitScore: number;
  plagiarismRisk: FindingSeverity;
  imageRisk: FindingSeverity;
}

export interface EditorialGateResult {
  gateRunId?: string;
  articleId: string;
  status: GateStatus;
  scores: GateScores;
  findings: EditorialFindingDto[];
  provider: string;
  model?: string;
  summary: string;
  startedAt: Date;
  completedAt: Date;
}

export interface ArticleAnalysisInput {
  id: string;
  title: string;
  subtitle?: string | null;
  excerpt?: string | null;
  body: string;
  category: string;
  featuredImageUrl?: string | null;
  featuredImageCaption?: string | null;
  imageRightsStatus: ImageRightsStatus;
  imageAttribution?: string | null;
  imageSource?: string | null;
  sources: Array<{
    id?: string;
    sourceName: string;
    sourceUrl: string;
    sourceType: SourceType;
    notes?: string | null;
  }>;
  authorId: string;
  competitionId?: string | null;
  teamId?: string | null;
  playerId?: string | null;
}

export interface OriginalityAnalysisResult {
  score: number;
  risk: FindingSeverity;
  findings: EditorialFindingDto[];
}

export interface FactAnalysisResult {
  score: number;
  risk: FindingSeverity;
  findings: EditorialFindingDto[];
}

export interface ClickbaitAnalysisResult {
  score: number;
  risk: FindingSeverity;
  findings: EditorialFindingDto[];
}

export interface QualityAnalysisResult {
  score: number;
  risk: FindingSeverity;
  findings: EditorialFindingDto[];
}

export interface StructureAnalysisResult {
  score: number;
  risk: FindingSeverity;
  findings: EditorialFindingDto[];
}

export interface ImageAnalysisResult {
  score: number;
  risk: FindingSeverity;
  findings: EditorialFindingDto[];
}

export interface ExternalMatch {
  sourceUrl: string;
  sourceTitle: string;
  matchedPhrase: string;
  matchPercentage: number;
  risk: FindingSeverity;
  checkedAt: Date;
}
