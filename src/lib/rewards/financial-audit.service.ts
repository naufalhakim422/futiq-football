import { prisma } from "@/lib/db";
import { FinancialAuditEntry } from "./types";
import { Currency } from "@prisma/client";

export class FinancialAuditService {
  private static instance: FinancialAuditService;

  private constructor() {}

  public static getInstance(): FinancialAuditService {
    if (!FinancialAuditService.instance) {
      FinancialAuditService.instance = new FinancialAuditService();
    }
    return FinancialAuditService.instance;
  }

  /**
   * Log an immutable financial audit event
   */
  public async logEvent(entry: FinancialAuditEntry) {
    try {
      return await prisma.financialAuditLog.create({
        data: {
          action: entry.action,
          actorId: entry.actorId || null,
          contributorProfileId: entry.contributorProfileId || null,
          entityType: entry.entityType,
          entityId: entry.entityId,
          amountMinor: entry.amountMinor ?? null,
          currency: entry.currency || Currency.MYR,
          previousState: entry.previousState ? JSON.parse(JSON.stringify(entry.previousState)) : null,
          newState: entry.newState ? JSON.parse(JSON.stringify(entry.newState)) : null,
          reason: entry.reason ? entry.reason.slice(0, 500) : null,
          ipAddress: entry.ipAddress || null,
          userAgent: entry.userAgent ? entry.userAgent.slice(0, 255) : null,
        },
      });
    } catch (err) {
      console.error("[FinancialAuditService Error]: Failed to write audit log", err);
      return null;
    }
  }

  /**
   * Query recent audit logs with filtering
   */
  public async getAuditLogs(options?: {
    action?: any;
    entityType?: string;
    entityId?: string;
    contributorProfileId?: string;
    limit?: number;
    offset?: number;
  }) {
    const limit = Math.min(options?.limit || 50, 100);
    const offset = options?.offset || 0;

    const where: any = {};
    if (options?.action) where.action = options.action;
    if (options?.entityType) where.entityType = options.entityType;
    if (options?.entityId) where.entityId = options.entityId;
    if (options?.contributorProfileId) where.contributorProfileId = options.contributorProfileId;

    const [total, logs] = await Promise.all([
      prisma.financialAuditLog.count({ where }),
      prisma.financialAuditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
    ]);

    return { total, logs, limit, offset };
  }
}

export const financialAuditService = FinancialAuditService.getInstance();
