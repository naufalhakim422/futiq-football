import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { editorialService } from "@/lib/editorial/editorial.service";
import { ReviewDecision } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ articleId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const isAuthorized =
      user?.roles.includes("SUPER_ADMIN") ||
      user?.roles.includes("SENIOR_EDITOR") ||
      user?.roles.includes("EDITOR_IN_CHIEF");

    if (!isAuthorized || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Super Admin or Senior Editor credentials required for AI Gate override." },
        { status: 403 }
      );
    }

    const { articleId } = await context.params;
    const body = await request.json();
    const { decision, reason } = body;

    if (!reason || typeof reason !== "string" || reason.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "Administrative override mandates a comprehensive justification reason (minimum 10 characters)." },
        { status: 400 }
      );
    }

    const validDecision = decision === "REJECT" ? ReviewDecision.REJECT : ReviewDecision.APPROVE;

    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined;

    const result = await editorialService.overrideGate(
      user.id,
      articleId,
      validDecision,
      reason,
      ipAddress
    );

    return NextResponse.json({
      success: true,
      message: "Administrative override recorded with immutable audit log.",
      data: result,
    });
  } catch (error: any) {
    console.error("[API POST /api/editorial/gate/:articleId/override Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to execute administrative override." },
      { status: 400 }
    );
  }
}
