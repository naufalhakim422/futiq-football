import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { kycService } from "@/lib/kyc/kyc.service";
import { z } from "zod";

const holdSchema = z.object({
  hold: z.boolean(),
  holdReason: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const isAuthorized = user.roles.some((r) => ["SUPER_ADMIN", "FINANCE"].includes(r));
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden: Compliance or Super Admin role required." }, { status: 403 });
    }

    const body = await req.json();
    const parsed = holdSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid hold payload." }, { status: 400 });
    }

    const updated = await kycService.setComplianceHold({
      kycVerificationId: id,
      hold: parsed.data.hold,
      holdReason: parsed.data.holdReason,
      officerUserId: user.id,
    });

    return NextResponse.json({
      success: true,
      message: parsed.data.hold ? "Compliance hold applied." : "Compliance hold cleared.",
      verification: updated,
    });
  } catch (error: any) {
    console.error("[Compliance Hold Error]:", error);
    return NextResponse.json({ error: error?.message || "Failed to update compliance hold." }, { status: 400 });
  }
}
