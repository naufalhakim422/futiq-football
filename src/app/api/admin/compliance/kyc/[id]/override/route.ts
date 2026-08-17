import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { kycService } from "@/lib/kyc/kyc.service";
import { KycStatus } from "@prisma/client";
import { z } from "zod";

const overrideSchema = z.object({
  newStatus: z.nativeEnum(KycStatus),
  reason: z.string().min(10, "Minimum 10-character justification required."),
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
    const parsed = overrideSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid override payload.", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "";

    const updated = await kycService.overrideKycStatus({
      kycVerificationId: id,
      newStatus: parsed.data.newStatus,
      officerUserId: user.id,
      reason: parsed.data.reason,
      ipAddress: ip,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: `KYC status manually overridden to ${parsed.data.newStatus}.`,
      verification: updated,
    });
  } catch (error: any) {
    console.error("[Compliance KYC Override Error]:", error);
    return NextResponse.json({ error: error?.message || "Failed to override KYC status." }, { status: 400 });
  }
}
