import { prisma } from "@/lib/db";
import { AdSponsorRecord, SponsorStatus } from "./types";
import { adAuditService } from "./ad-audit.service";

export class SponsorService {
  private static instance: SponsorService;

  // In-memory persistent fallback cache for development & offline environments
  private static mockSponsors: Map<string, AdSponsorRecord> = new Map([
    [
      "spon_nike_01",
      {
        id: "spon_nike_01",
        companyName: "Nike Football Global",
        contactName: "Marcus Vance",
        email: "marcus.vance@nike.com",
        phone: "+44 20 7946 0912",
        website: "https://nike.com/football",
        logoUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop",
        billingEmail: "finance-emea@nike.com",
        notes: "Direct seasonal sponsorship package for 2026/27 European Football coverage.",
        status: "ACTIVE",
        createdAt: "2026-08-01T00:00:00Z",
        updatedAt: "2026-08-17T00:00:00Z",
      },
    ],
    [
      "spon_adidas_02",
      {
        id: "spon_adidas_02",
        companyName: "Adidas Football",
        contactName: "Klara Hoffman",
        email: "klara.hoffman@adidas.com",
        website: "https://adidas.com/football",
        status: "ACTIVE",
        createdAt: "2026-08-05T00:00:00Z",
        updatedAt: "2026-08-17T00:00:00Z",
      },
    ],
  ]);

  private constructor() {}

  public static getInstance(): SponsorService {
    if (!SponsorService.instance) {
      SponsorService.instance = new SponsorService();
    }
    return SponsorService.instance;
  }

  public async listSponsors(): Promise<AdSponsorRecord[]> {
    return Array.from(SponsorService.mockSponsors.values());
  }

  public async getSponsorById(id: string): Promise<AdSponsorRecord | null> {
    return SponsorService.mockSponsors.get(id) || null;
  }

  public async createSponsor(
    data: {
      companyName: string;
      contactName?: string;
      email?: string;
      phone?: string;
      website?: string;
      logoUrl?: string;
      billingEmail?: string;
      notes?: string;
      status?: SponsorStatus;
    },
    actorId = "admin"
  ): Promise<AdSponsorRecord> {
    const id = `spon_${Date.now()}`;
    const now = new Date().toISOString();

    const record: AdSponsorRecord = {
      id,
      companyName: data.companyName,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone,
      website: data.website,
      logoUrl: data.logoUrl,
      billingEmail: data.billingEmail,
      notes: data.notes,
      status: data.status || "ACTIVE",
      createdAt: now,
      updatedAt: now,
    };

    SponsorService.mockSponsors.set(id, record);

    await adAuditService.logAction({
      actorId,
      action: "SPONSOR_CREATED",
      entityType: "SPONSOR",
      entityId: id,
      details: `Created sponsor ${data.companyName} (${record.status})`,
    });

    return record;
  }

  public async updateSponsor(
    id: string,
    data: Partial<AdSponsorRecord>,
    actorId = "admin"
  ): Promise<AdSponsorRecord | null> {
    const existing = SponsorService.mockSponsors.get(id);
    if (!existing) return null;

    const updated: AdSponsorRecord = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    SponsorService.mockSponsors.set(id, updated);

    await adAuditService.logAction({
      actorId,
      action: "SPONSOR_UPDATED",
      entityType: "SPONSOR",
      entityId: id,
      details: `Updated sponsor ${updated.companyName}`,
    });

    return updated;
  }

  public async deleteSponsor(id: string, actorId = "admin"): Promise<boolean> {
    const exists = SponsorService.mockSponsors.has(id);
    if (!exists) return false;

    SponsorService.mockSponsors.delete(id);

    await adAuditService.logAction({
      actorId,
      action: "SPONSOR_DELETED",
      entityType: "SPONSOR",
      entityId: id,
      details: `Deleted sponsor ID ${id}`,
    });

    return true;
  }
}

export const sponsorService = SponsorService.getInstance();
