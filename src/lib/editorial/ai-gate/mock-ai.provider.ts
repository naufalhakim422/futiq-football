import { EditorialAIProvider } from "./ai-provider.interface";
import {
  ArticleAnalysisInput,
  OriginalityAnalysisResult,
  FactAnalysisResult,
  ClickbaitAnalysisResult,
  QualityAnalysisResult,
  StructureAnalysisResult,
  ImageAnalysisResult,
  EditorialFindingDto,
} from "./types";
import { FindingCategory, FindingSeverity, ImageRightsStatus } from "@prisma/client";

export class MockEditorialAIProvider implements EditorialAIProvider {
  public readonly name = "mock";
  public readonly modelName = "editorial-mock-v1";

  /**
   * Analyze originality vs plagiarism
   * Differentiates factual claims from creative expression similarity
   */
  public async analyzeOriginality(input: ArticleAnalysisInput): Promise<OriginalityAnalysisResult> {
    const findings: EditorialFindingDto[] = [];
    const lowerBody = input.body.toLowerCase();
    const lowerTitle = input.title.toLowerCase();

    // Check for explicit test trigger flags
    if (lowerTitle.includes("plagiarism") || lowerBody.includes("mock_plagiarism") || lowerBody.includes("copied word for word from the athletic")) {
      findings.push({
        category: FindingCategory.ORIGINALITY,
        severity: FindingSeverity.CRITICAL,
        finding: "High-confidence verbatim phrasing overlap detected with external publications.",
        evidence: "Multiple paragraphs match external editorial structures and phrasing identically.",
        sourceUrl: "https://theathletic.example/tactical-breakdown",
        sourceTitle: "The Athletic Tactical Archives",
        matchedText: input.body.slice(0, 150),
        recommendation: "Rewrite all analytical prose in your own voice and cite primary sources.",
      });

      return {
        score: 35.0,
        risk: FindingSeverity.CRITICAL,
        findings,
      };
    }

    if (lowerTitle.includes("medium similarity") || lowerBody.includes("mock_medium_similarity")) {
      findings.push({
        category: FindingCategory.SIMILARITY,
        severity: FindingSeverity.MEDIUM,
        finding: "Moderate stylistic and syntactical similarity detected with secondary match reports.",
        evidence: "Sentence rhythm and paragraph sequence closely mirrors existing agency wire reports.",
        recommendation: "Introduce independent analytical perspectives and deeper tactical deconstructions.",
      });

      return {
        score: 75.0,
        risk: FindingSeverity.MEDIUM,
        findings,
      };
    }

    // Default clean originality
    return {
      score: 96.5,
      risk: FindingSeverity.PASS,
      findings: [],
    };
  }

  /**
   * Cross-examine facts
   */
  public async analyzeFacts(input: ArticleAnalysisInput): Promise<FactAnalysisResult> {
    const findings: EditorialFindingDto[] = [];
    const lowerBody = input.body.toLowerCase();
    const lowerTitle = input.title.toLowerCase();

    // Check for explicit factual conflicts
    if (
      lowerTitle.includes("fact conflict") ||
      lowerBody.includes("mock_fact_conflict") ||
      lowerBody.includes("arsenal defeated chelsea 4-0")
    ) {
      findings.push({
        category: FindingCategory.FACT_CHECK,
        severity: FindingSeverity.HIGH,
        finding: "Factual scoreline conflict detected against verified match telemetry.",
        evidence: 'Claim "Arsenal defeated Chelsea 4-0" contradicts verified competition data (Chelsea 2-1 Arsenal).',
        recommendation: "Verify match scoreline, scorers, and competition date against official Opta/Stats records.",
      });

      return {
        score: 40.0,
        risk: FindingSeverity.HIGH,
        findings,
      };
    }

    return {
      score: 98.0,
      risk: FindingSeverity.PASS,
      findings: [],
    };
  }

  /**
   * Clickbait & sensationalism detection
   */
  public async analyzeClickbait(input: ArticleAnalysisInput): Promise<ClickbaitAnalysisResult> {
    const findings: EditorialFindingDto[] = [];
    const lowerTitle = input.title.toLowerCase();
    const lowerSubtitle = (input.subtitle || "").toLowerCase();

    const clickbaitKeywords = [
      "you won't believe",
      "shocking truth",
      "secret revealed",
      "unbelievable drama",
      "fans are furious",
      "insane reaction",
      "destroys rival",
      "bombshell transfer",
    ];

    const matchedKeyword = clickbaitKeywords.find(
      (kw) => lowerTitle.includes(kw) || lowerSubtitle.includes(kw)
    );

    if (matchedKeyword || lowerTitle.includes("clickbait") || lowerTitle.includes("mock_clickbait")) {
      findings.push({
        category: FindingCategory.CLICKBAIT,
        severity: FindingSeverity.MEDIUM,
        finding: "Sensationalized / clickbait headline phrasing detected.",
        evidence: `Headline contains hyperbolic pattern: "${matchedKeyword || "unsupported sensationalism"}".`,
        recommendation: "Adopt a professional, descriptive sports journalism headline tone.",
      });

      return {
        score: 55.0,
        risk: FindingSeverity.MEDIUM,
        findings,
      };
    }

    return {
      score: 95.0,
      risk: FindingSeverity.PASS,
      findings: [],
    };
  }

  /**
   * Content quality, spam, repetition
   */
  public async analyzeQuality(input: ArticleAnalysisInput): Promise<QualityAnalysisResult> {
    const findings: EditorialFindingDto[] = [];

    // Length check
    const words = input.body.trim().split(/\s+/).filter(Boolean);
    if (words.length < 50) {
      findings.push({
        category: FindingCategory.QUALITY,
        severity: FindingSeverity.HIGH,
        finding: "Manuscript fails minimum word count threshold (50 words required).",
        evidence: `Article currently contains only ${words.length} words.`,
        recommendation: "Expand the tactical analysis or match context to meet editorial standards.",
      });

      return {
        score: 45.0,
        risk: FindingSeverity.HIGH,
        findings,
      };
    }

    // Repetition or gibberish check
    const lowerBody = input.body.toLowerCase();
    if (lowerBody.includes("lorem ipsum") || lowerBody.includes("asdfghjkl")) {
      findings.push({
        category: FindingCategory.QUALITY,
        severity: FindingSeverity.HIGH,
        finding: "Placeholder or malformed text detected in manuscript body.",
        evidence: "Manuscript contains placeholder strings.",
        recommendation: "Remove all placeholder text before submitting for review.",
      });

      return {
        score: 30.0,
        risk: FindingSeverity.HIGH,
        findings,
      };
    }

    return {
      score: 95.0,
      risk: FindingSeverity.PASS,
      findings: [],
    };
  }

  /**
   * Structural coherence
   */
  public async analyzeStructure(input: ArticleAnalysisInput): Promise<StructureAnalysisResult> {
    return {
      score: 92.0,
      risk: FindingSeverity.PASS,
      findings: [],
    };
  }

  /**
   * Image rights & OCR checks
   */
  public async analyzeImage(input: ArticleAnalysisInput): Promise<ImageAnalysisResult> {
    const findings: EditorialFindingDto[] = [];

    if (input.imageRightsStatus === ImageRightsStatus.UNKNOWN) {
      findings.push({
        category: FindingCategory.IMAGE_RIGHTS,
        severity: FindingSeverity.CRITICAL,
        finding: "Image rights status is UNKNOWN. Unverified third-party imagery is strictly prohibited.",
        evidence: "Featured image declared with status: UNKNOWN.",
        recommendation: "Provide valid rights clearance (OWNED, LICENSED, OFFICIAL_PRESS, or PUBLIC_DOMAIN) with attribution.",
      });

      return {
        score: 0.0,
        risk: FindingSeverity.CRITICAL,
        findings,
      };
    }

    const lowerCaption = (input.featuredImageCaption || "").toLowerCase();
    const lowerAttr = (input.imageAttribution || "").toLowerCase();
    const lowerUrl = (input.featuredImageUrl || "").toLowerCase();

    if (
      lowerCaption.includes("getty screenshot") ||
      lowerAttr.includes("screenshot") ||
      lowerUrl.includes("screenshot") ||
      input.body.toLowerCase().includes("mock_image_risk")
    ) {
      findings.push({
        category: FindingCategory.IMAGE_OCR,
        severity: FindingSeverity.HIGH,
        finding: "Suspicious broadcast or watermark screenshot detected in media metadata.",
        evidence: "Media attribution indicates television broadcast or unauthorized agency watermark screenshot.",
        recommendation: "Replace with high-resolution licensed photography or authorized official club press media.",
      });

      return {
        score: 40.0,
        risk: FindingSeverity.HIGH,
        findings,
      };
    }

    return {
      score: 100.0,
      risk: FindingSeverity.PASS,
      findings: [],
    };
  }
}
