import { prisma } from "@/lib/db";
import { PayoutStatus, FinancialAuditAction } from "@prisma/client";
import { financialAuditService } from "./financial-audit.service";
import { payoutRouter } from "./payout-router";

export class PayoutReconciliationService {
  private static instance: PayoutReconciliationService;

  private constructor() {}

  public static getInstance(): PayoutReconciliationService {
    if (!PayoutReconciliationService.instance) {
      PayoutReconciliationService.instance = new PayoutReconciliationService();
    }
    return PayoutReconciliationService.instance;
  }

  /**
   * Run full reconciliation sweep between database payouts and provider records
   */
  public async runReconciliationSweep(actorId?: string): Promise<{
    scannedCount: number;
    matchedCount: number;
    discrepancyCount: number;
    discrepancies: any[];
  }> {
    const activePayouts = await prisma.payout.findMany({
      where: {
        status: { in: [PayoutStatus.PROCESSING, PayoutStatus.PAID, PayoutStatus.FAILED] },
      },
      include: { withdrawalRequest: true },
      take: 100,
    });

    let matchedCount = 0;
    let discrepancyCount = 0;
    const discrepancies: any[] = [];

    for (const payout of activePayouts) {
      // In production, queries provider API; with MockPayoutProvider, uses reference
      const providerRef = payout.providerReference;
      const internalStatus = payout.status;
      const amount = payout.amountMinor;

      let isMatched = true;
      let discrepancyType: string | null = null;
      let notes: string | null = null;

      if (!providerRef && internalStatus === PayoutStatus.PAID) {
        isMatched = false;
        discrepancyType = "MISSING_PROVIDER_TX";
        notes = "Payout marked as PAID in internal database but lacks a verified provider transaction reference.";
      }

      if (isMatched) {
        matchedCount++;
      } else {
        discrepancyCount++;
        const record = await prisma.payoutReconciliation.create({
          data: {
            payoutId: payout.id,
            withdrawalRequestId: payout.withdrawalRequestId,
            provider: payout.provider,
            providerReference: providerRef || null,
            internalStatus: payout.status,
            providerStatus: "UNKNOWN",
            internalAmountMinor: amount,
            providerAmountMinor: amount,
            isMatched: false,
            discrepancyType,
            notes,
          },
        });
        discrepancies.push(record);
      }
    }

    if (discrepancyCount > 0) {
      await financialAuditService.logEvent({
        action: FinancialAuditAction.PAYOUT_RECONCILED,
        actorId: actorId || undefined,
        entityType: "RECONCILIATION",
        entityId: `sweep_${Date.now()}`,
        reason: `Reconciliation sweep identified ${discrepancyCount} discrepancy records.`,
      });
    }

    return {
      scannedCount: activePayouts.length,
      matchedCount,
      discrepancyCount,
      discrepancies,
    };
  }

  /**
   * List recent reconciliation records
   */
  public async listReconciliations(options?: { isMatched?: boolean; limit?: number }) {
    const where: any = {};
    if (options?.isMatched !== undefined) where.isMatched = options.isMatched;

    return await prisma.payoutReconciliation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: options?.limit || 50,
    });
  }

  /**
   * Resolve an identified reconciliation discrepancy
   */
  public async resolveDiscrepancy(
    reconciliationId: string,
    adminUserId: string,
    resolutionNotes: string
  ) {
    if (!resolutionNotes || resolutionNotes.trim().length < 5) {
      throw new Error("Resolution notes required (minimum 5 characters).");
    }

    return await prisma.payoutReconciliation.update({
      where: { id: reconciliationId },
      data: {
        isMatched: true,
        resolvedByUserId: adminUserId,
        resolvedAt: new Date(),
        notes: resolutionNotes.trim(),
      },
    });
  }
}

export const payoutReconciliationService = PayoutReconciliationService.getInstance();
