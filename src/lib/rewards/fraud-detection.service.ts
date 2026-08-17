import { prisma } from "@/lib/db";
import { FraudSignalSeverity, FraudSignalType, FinancialAuditAction } from "@prisma/client";
import { financialAuditService } from "./financial-audit.service";

export class FraudDetectionService {
  private static instance: FraudDetectionService;

  private constructor() {}

  public static getInstance(): FraudDetectionService {
    if (!FraudDetectionService.instance) {
      FraudDetectionService.instance = new FraudDetectionService();
    }
    return FraudDetectionService.instance;
  }

  /**
   * Evaluate cumulative contributor fraud risk score (0 to 100)
   */
  public async evaluateContributorRisk(contributorProfileId: string): Promise<{
    riskScore: number;
    severity: FraudSignalSeverity;
    activeSignalsCount: number;
    isBlockedForPayout: boolean;
  }> {
    try {
      const activeSignals = await prisma.fraudSignal.findMany({
        where: {
          contributorProfileId,
          isResolved: false,
        },
      });

      if (activeSignals.length === 0) {
        return {
          riskScore: 0,
          severity: FraudSignalSeverity.LOW,
          activeSignalsCount: 0,
          isBlockedForPayout: false,
        };
      }

      // Compute aggregate risk score capped at 100
      let totalScore = activeSignals.reduce((acc, sig) => acc + sig.riskScore, 0);
      totalScore = Math.min(100, Math.max(0, totalScore));

      let severity: FraudSignalSeverity = FraudSignalSeverity.LOW;
      if (totalScore >= 80) severity = FraudSignalSeverity.CRITICAL;
      else if (totalScore >= 60) severity = FraudSignalSeverity.HIGH;
      else if (totalScore >= 30) severity = FraudSignalSeverity.MEDIUM;

      return {
        riskScore: totalScore,
        severity,
        activeSignalsCount: activeSignals.length,
        isBlockedForPayout: totalScore >= 60, // Payout hold on High or Critical risk
      };
    } catch {
      return {
        riskScore: 0,
        severity: FraudSignalSeverity.LOW,
        activeSignalsCount: 0,
        isBlockedForPayout: false,
      };
    }
  }

  /**
   * Record a new fraud signal
   */
  public async recordFraudSignal(data: {
    contributorProfileId: string;
    articleId?: string;
    signalType: FraudSignalType;
    severity: FraudSignalSeverity;
    riskScore: number;
    evidence: string;
    metadata?: Record<string, any>;
  }) {
    try {
      const signal = await prisma.fraudSignal.create({
        data: {
          contributorProfileId: data.contributorProfileId,
          articleId: data.articleId || null,
          signalType: data.signalType,
          severity: data.severity,
          riskScore: data.riskScore,
          evidence: data.evidence,
          metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : null,
        },
      });

      await financialAuditService.logEvent({
        action: FinancialAuditAction.FRAUD_FLAGGED,
        contributorProfileId: data.contributorProfileId,
        entityType: "FRAUD",
        entityId: signal.id,
        reason: `${data.signalType}: ${data.evidence}`,
        newState: { signalType: data.signalType, severity: data.severity, riskScore: data.riskScore },
      });

      return signal;
    } catch (err) {
      console.warn("[FraudDetectionService warning]: Failed to record fraud signal", err);
      return null;
    }
  }

  /**
   * Resolve an existing fraud signal with mandatory justification notes
   */
  public async resolveFraudSignal(
    signalId: string,
    adminUserId: string,
    resolutionNotes: string
  ) {
    if (!resolutionNotes || resolutionNotes.trim().length < 5) {
      throw new Error("Resolution justification notes required (minimum 5 characters).");
    }

    const signal = await prisma.fraudSignal.findUnique({
      where: { id: signalId },
    });

    if (!signal) throw new Error("Fraud signal not found.");

    const updated = await prisma.fraudSignal.update({
      where: { id: signalId },
      data: {
        isResolved: true,
        resolvedByUserId: adminUserId,
        resolutionNotes: resolutionNotes.trim(),
      },
    });

    await financialAuditService.logEvent({
      action: FinancialAuditAction.FRAUD_FLAGGED,
      actorId: adminUserId,
      contributorProfileId: signal.contributorProfileId,
      entityType: "FRAUD",
      entityId: signal.id,
      reason: `Fraud Signal Resolved: ${resolutionNotes.trim()}`,
      previousState: { isResolved: false },
      newState: { isResolved: true, resolutionNotes: resolutionNotes.trim() },
    });

    return updated;
  }

  /**
   * List all active or resolved fraud signals
   */
  public async listSignals(options?: { isResolved?: boolean; severity?: FraudSignalSeverity }) {
    const where: any = {};
    if (options?.isResolved !== undefined) where.isResolved = options.isResolved;
    if (options?.severity) where.severity = options.severity;

    return await prisma.fraudSignal.findMany({
      where,
      include: {
        contributorProfile: {
          select: { id: true, displayName: true, user: { select: { email: true } } },
        },
        article: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const fraudDetectionService = FraudDetectionService.getInstance();
