import { AdAuditLogEntry } from "./types";
import crypto from "crypto";

export class AdAuditService {
  private static instance: AdAuditService;
  private static logs: AdAuditLogEntry[] = [
    {
      id: "log_init_01",
      actorId: "superadmin_01",
      actorEmail: "admin@futiq.internal",
      action: "PROVIDER_ACTIVATED",
      entityType: "PROVIDER",
      entityId: "adsterra",
      details: "Activated Adsterra Network provider with Banner and Native capabilities",
      createdAt: "2026-08-17T12:00:00Z",
    },
    {
      id: "log_init_02",
      actorId: "superadmin_01",
      actorEmail: "admin@futiq.internal",
      action: "CAMPAIGN_CREATED",
      entityType: "CAMPAIGN",
      entityId: "camp_nike_01",
      details: "Configured direct deal for Nike Football Boots (Fixed Rate: RM 5,000)",
      createdAt: "2026-08-17T13:00:00Z",
    },
  ];

  private constructor() {}

  public static getInstance(): AdAuditService {
    if (!AdAuditService.instance) {
      AdAuditService.instance = new AdAuditService();
    }
    return AdAuditService.instance;
  }

  public async logAction(entry: {
    actorId: string;
    actorEmail?: string;
    action: string;
    entityType: "CAMPAIGN" | "CREATIVE" | "PROVIDER" | "SPONSOR" | "PLACEMENT" | "POLICY";
    entityId: string;
    details: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AdAuditLogEntry> {
    const id = `ad_log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const ipHash = entry.ipAddress
      ? crypto.createHash("sha256").update(entry.ipAddress).digest("hex").substring(0, 16)
      : undefined;

    const log: AdAuditLogEntry = {
      id,
      actorId: entry.actorId,
      actorEmail: entry.actorEmail,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      details: entry.details,
      ipHash,
      userAgent: entry.userAgent,
      createdAt: new Date().toISOString(),
    };

    AdAuditService.logs.unshift(log);

    // Keep memory cap for audit logs
    if (AdAuditService.logs.length > 500) {
      AdAuditService.logs = AdAuditService.logs.slice(0, 500);
    }

    return log;
  }

  public async listLogs(limit = 50): Promise<AdAuditLogEntry[]> {
    return AdAuditService.logs.slice(0, limit);
  }
}

export const adAuditService = AdAuditService.getInstance();
