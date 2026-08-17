import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { popunderPolicyService } from "@/lib/ads/popunder-policy.service";
import { z } from "zod";

const updatePopunderSchema = z.object({
  enabled: z.boolean().optional(),
  desktopEnabled: z.boolean().optional(),
  mobileEnabled: z.boolean().optional(),
  frequencyCapMinutes: z.number().int().min(1).max(1440).optional(),
  cooldownSeconds: z.number().int().min(0).max(86400).optional(),
  maxPerSession: z.number().int().min(1).max(20).optional(),
  maxPerDay: z.number().int().min(1).max(50).optional(),
  allowedRoutes: z.array(z.string()).optional(),
  excludedRoutes: z.array(z.string()).optional(),
  targetUrl: z.string().url().optional(),
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

    const policy = popunderPolicyService.getPolicy();
    return NextResponse.json({ success: true, policy });
  } catch (error: any) {
    console.error("[Admin Popunder GET Error]:", error);
    return NextResponse.json({ error: "Failed to retrieve popunder policy." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
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
    const parsed = updatePopunderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid popunder policy payload.", details: parsed.error.issues }, { status: 400 });
    }

    const updated = await popunderPolicyService.updatePolicy(parsed.data, user.id);
    return NextResponse.json({ success: true, policy: updated });
  } catch (error: any) {
    console.error("[Admin Popunder PUT Error]:", error);
    return NextResponse.json({ error: "Failed to update popunder policy." }, { status: 500 });
  }
}
