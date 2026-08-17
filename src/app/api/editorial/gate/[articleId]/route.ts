import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { editorialGateService } from "@/lib/editorial/ai-gate/editorial-gate.service";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ articleId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const { articleId } = await context.params;
    const latestRun = await editorialGateService.getLatestGateRun(articleId);

    if (!latestRun) {
      return NextResponse.json({
        success: true,
        data: null,
        message: "No AI Editorial Gate analysis found for this article.",
      });
    }

    return NextResponse.json({
      success: true,
      data: latestRun,
    });
  } catch (error: any) {
    console.error("[API GET /api/editorial/gate/:articleId Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to retrieve gate run." },
      { status: 500 }
    );
  }
}
