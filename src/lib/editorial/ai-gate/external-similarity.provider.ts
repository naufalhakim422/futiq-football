import { FindingCategory, FindingSeverity } from "@prisma/client";
import { ArticleAnalysisInput, EditorialFindingDto, ExternalMatch } from "./types";

export interface ExternalSimilarityProvider {
  checkExternalSources(input: ArticleAnalysisInput): Promise<{
    score: number;
    risk: FindingSeverity;
    matches: ExternalMatch[];
    findings: EditorialFindingDto[];
  }>;
}

export class MockExternalSimilarityProvider implements ExternalSimilarityProvider {
  public async checkExternalSources(input: ArticleAnalysisInput): Promise<{
    score: number;
    risk: FindingSeverity;
    matches: ExternalMatch[];
    findings: EditorialFindingDto[];
  }> {
    const findings: EditorialFindingDto[] = [];
    const matches: ExternalMatch[] = [];
    const lowerBody = input.body.toLowerCase();

    // Check for explicit external plagiarism trigger
    if (lowerBody.includes("mock_external_plagiarism") || lowerBody.includes("reuters wire release")) {
      const match: ExternalMatch = {
        sourceUrl: "https://reuters.example/sports/football-review",
        sourceTitle: "Global Football Wire Report",
        matchedPhrase: input.body.slice(0, 120),
        matchPercentage: 92.5,
        risk: FindingSeverity.CRITICAL,
        checkedAt: new Date(),
      };
      matches.push(match);

      findings.push({
        category: FindingCategory.SIMILARITY,
        severity: FindingSeverity.CRITICAL,
        finding: "High-confidence external wire similarity detected.",
        evidence: `Matches "${match.sourceTitle}" (${match.matchPercentage}% overlap).`,
        sourceUrl: match.sourceUrl,
        sourceTitle: match.sourceTitle,
        matchedText: match.matchedPhrase,
        recommendation: "Rewrite in original commentary form and attribute external sources.",
      });

      return {
        score: 30.0,
        risk: FindingSeverity.CRITICAL,
        matches,
        findings,
      };
    }

    return {
      score: 100.0,
      risk: FindingSeverity.PASS,
      matches: [],
      findings: [],
    };
  }
}

export const externalSimilarityProvider: ExternalSimilarityProvider = new MockExternalSimilarityProvider();
