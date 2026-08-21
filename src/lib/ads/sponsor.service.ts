import fs from "fs";
import path from "path";
import { prisma } from "@/lib/db";
import { AdSponsorRecord, SponsorStatus } from "./types";
import { adAuditService } from "./ad-audit.service";

const SPONSORS_FILE_PATH = path.join(process.cwd(), "src", "data", "ads-sponsors.json");

function loadSponsorsFromDisk(): Map<string, AdSponsorRecord> {
  try {
    if (fs.existsSync(SPONSORS_FILE_PATH)) {
      const data = fs.readFileSync(SPONSORS_FILE_PATH, "utf-8");
      const list = JSON.parse(data);
      if (Array.isArray(list)) {
        const map = new Map<string, AdSponsorRecord>();
        list.forEach((s: AdSponsorRecord) => map.set(s.id, s));
        return map;
      }
    }
  } catch (err) {
    console.warn("[SponsorService] Error reading ads-sponsors.json:", err);
  }
  return new Map<string, AdSponsorRecord>();
}

function saveSponsorsToDisk(map: Map<string, AdSponsorRecord>) {
  try {
    const list = Array.from(map.values());
    const dir = path.dirname(SPONSORS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SPONSORS_FILE_PATH, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.warn("[SponsorService] Error saving ads-sponsors.json:", err);
  }
}

export class SponsorService {
  private static instance: SponsorService;
  private static mockSponsors: Map<string, AdSponsorRecord> = loadSponsorsFromDisk();

  private constructor() {}

  public static getInstance(): SponsorService {
    if (!SponsorService.instance) {
      SponsorService.instance = new SponsorService();
    }
    return SponsorService.instance;
  }

  public async listSponsors(): Promise<AdSponsorRecord[]> {
    SponsorService.mockSponsors = loadSponsorsFromDisk();
    return Array.from(SponsorService.mockSponsors.values());
  }

  public async getSponsorById(id: string): Promise<AdSponsorRecord | null> {
    SponsorService.mockSponsors = loadSponsorsFromDisk();
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
    saveSponsorsToDisk(SponsorService.mockSponsors);

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
    saveSponsorsToDisk(SponsorService.mockSponsors);

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
    saveSponsorsToDisk(SponsorService.mockSponsors);

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
