import {
  ArticleAnalysisInput,
  OriginalityAnalysisResult,
  FactAnalysisResult,
  ClickbaitAnalysisResult,
  QualityAnalysisResult,
  StructureAnalysisResult,
  ImageAnalysisResult,
} from "./types";

export interface EditorialAIProvider {
  readonly name: string;
  readonly modelName: string;

  /**
   * Analyze originality, semantic phrasing, and plagiarism indicators
   */
  analyzeOriginality(input: ArticleAnalysisInput): Promise<OriginalityAnalysisResult>;

  /**
   * Cross-examine factual statements, player statistics, and match claims
   */
  analyzeFacts(input: ArticleAnalysisInput): Promise<FactAnalysisResult>;

  /**
   * Detect sensational headlines, exaggerated claims, and deceptive framing
   */
  analyzeClickbait(input: ArticleAnalysisInput): Promise<ClickbaitAnalysisResult>;

  /**
   * Assess grammar, coherence, spam patterns, keyword stuffing, and formatting quality
   */
  analyzeQuality(input: ArticleAnalysisInput): Promise<QualityAnalysisResult>;

  /**
   * Analyze paragraph rhythm, transition organization, and syntactic depth
   */
  analyzeStructure(input: ArticleAnalysisInput): Promise<StructureAnalysisResult>;

  /**
   * Validate image metadata, visible watermarks, OCR screenshot heuristics, and rights
   */
  analyzeImage(input: ArticleAnalysisInput): Promise<ImageAnalysisResult>;
}
