import { GateStatus, FindingSeverity, FindingCategory } from "@prisma/client";
import { EditorialFindingDto, GateScores } from "./types";

export class DeterministicRulesEngine {
  private static instance: DeterministicRulesEngine;

  private constructor() {}

  public static getInstance(): DeterministicRulesEngine {
    if (!DeterministicRulesEngine.instance) {
      DeterministicRulesEngine.instance = new DeterministicRulesEngine();
    }
    return DeterministicRulesEngine.instance;
  }

  /**
   * Evaluate all findings and raw scores to produce the final GateStatus and composite scores
   */
  public evaluate(
    findings: EditorialFindingDto[],
    rawScores: {
      originality: number;
      facts: number;
      source: number;
      quality: number;
      clickbait: number;
      image: number;
    }
  ): { status: GateStatus; scores: GateScores; summary: string } {
    const hasCritical = findings.some((f) => f.severity === FindingSeverity.CRITICAL);
    const highFindings = findings.filter((f) => f.severity === FindingSeverity.HIGH);
    const mediumFindings = findings.filter((f) => f.severity === FindingSeverity.MEDIUM);

    // Compute Plagiarism Risk
    let plagiarismRisk: FindingSeverity = FindingSeverity.PASS;
    const origFindings = findings.filter(
      (f) =>
        f.category === FindingCategory.ORIGINALITY ||
        f.category === FindingCategory.SIMILARITY ||
        f.category === FindingCategory.EXACT_PHRASE
    );
    if (origFindings.some((f) => f.severity === FindingSeverity.CRITICAL)) {
      plagiarismRisk = FindingSeverity.CRITICAL;
    } else if (origFindings.some((f) => f.severity === FindingSeverity.HIGH)) {
      plagiarismRisk = FindingSeverity.HIGH;
    } else if (origFindings.some((f) => f.severity === FindingSeverity.MEDIUM)) {
      plagiarismRisk = FindingSeverity.MEDIUM;
    }

    // Compute Image Risk
    let imageRisk: FindingSeverity = FindingSeverity.PASS;
    const imgFindings = findings.filter(
      (f) =>
        f.category === FindingCategory.IMAGE_RIGHTS ||
        f.category === FindingCategory.IMAGE_DUPLICATE ||
        f.category === FindingCategory.IMAGE_OCR
    );
    if (imgFindings.some((f) => f.severity === FindingSeverity.CRITICAL)) {
      imageRisk = FindingSeverity.CRITICAL;
    } else if (imgFindings.some((f) => f.severity === FindingSeverity.HIGH)) {
      imageRisk = FindingSeverity.HIGH;
    } else if (imgFindings.some((f) => f.severity === FindingSeverity.MEDIUM)) {
      imageRisk = FindingSeverity.MEDIUM;
    }

    // Composite Overall Score (Weighted: Originality 30%, Facts 20%, Image 20%, Source 15%, Quality 15%)
    let overallScore =
      rawScores.originality * 0.3 +
      rawScores.facts * 0.2 +
      rawScores.image * 0.2 +
      rawScores.source * 0.15 +
      rawScores.quality * 0.15;

    // Cap score if critical violations exist
    if (hasCritical) {
      overallScore = Math.min(overallScore, 40.0);
    } else if (highFindings.length > 0) {
      overallScore = Math.min(overallScore, 65.0);
    } else if (mediumFindings.length > 0) {
      overallScore = Math.min(overallScore, 79.0);
    }

    overallScore = Math.max(0, Math.min(100, Math.round(overallScore * 10) / 10));

    // Decision Logic
    let status: GateStatus;
    let summary: string;

    if (hasCritical) {
      status = GateStatus.REJECTED;
      const criticalItem = findings.find((f) => f.severity === FindingSeverity.CRITICAL);
      summary = `Gate Rejected: Critical compliance issue detected — ${criticalItem?.finding || "Severe policy violation."}`;
    } else if (highFindings.length > 0 || mediumFindings.length > 0) {
      status = GateStatus.REVIEW;
      if (highFindings.length > 0) {
        summary = `Manual Review Required: High-priority items flagged (${highFindings.map((f) => f.category).join(", ")}).`;
      } else {
        summary = `Manual Review Required: Notice items flagged (${mediumFindings.map((f) => f.category).join(", ")}).`;
      }
    } else {
      status = GateStatus.PASSED;
      summary = "AI Editorial Gate Passed: All originality, factual, source, quality, and image compliance checks cleared.";
    }

    const scores: GateScores = {
      overallScore,
      originalityScore: Math.round(rawScores.originality * 10) / 10,
      sourceScore: Math.round(rawScores.source * 10) / 10,
      factScore: Math.round(rawScores.facts * 10) / 10,
      qualityScore: Math.round(rawScores.quality * 10) / 10,
      clickbaitScore: Math.round(rawScores.clickbait * 10) / 10,
      plagiarismRisk,
      imageRisk,
    };

    return { status, scores, summary };
  }
}

export const deterministicRulesEngine = DeterministicRulesEngine.getInstance();
