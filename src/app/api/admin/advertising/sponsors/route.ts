import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { sponsorService } from "@/lib/ads/sponsor.service";
import { z } from "zod";

const createSponsorSchema = z.object({
  companyName: z.string().min(2).max(100),
  contactName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  billingEmail: z.string().email().optional(),
  notes: z.string().optional(),
  status: z.enum(["LEAD", "ACTIVE", "PAUSED", "COMPLETED", "BLOCKED"]).default("ACTIVE"),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const isAuthorized = user.roles.some((r) =>
      ["SUPER_ADMIN", "SENIOR_EDITOR", "FINANCE"].includes(r)
    );
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const sponsors = await sponsorService.listSponsors();
    return NextResponse.json({ success: true, sponsors });
  } catch (error: any) {
    console.error("[Admin Sponsors GET Error]:", error);
    return NextResponse.json({ error: "Failed to retrieve sponsors." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const isAuthorized = user.roles.some((r) =>
      ["SUPER_ADMIN", "SENIOR_EDITOR", "FINANCE"].includes(r)
    );
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createSponsorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid sponsor payload.", details: parsed.error.issues }, { status: 400 });
    }

    const sponsor = await sponsorService.createSponsor(parsed.data, user.id);
    return NextResponse.json({ success: true, sponsor }, { status: 201 });
  } catch (error: any) {
    console.error("[Admin Sponsors POST Error]:", error);
    return NextResponse.json({ error: "Failed to create sponsor." }, { status: 500 });
  }
}
