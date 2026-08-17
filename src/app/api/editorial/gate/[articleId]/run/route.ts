import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { editorialGateService } from "@/lib/editorial/ai-gate/editorial-gate.service";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ articleId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const isStaff =
      user?.roles.includes("EDITOR_IN_CHIEF") ||
      user?.roles.includes("SENIOR_EDITOR") ||
      user?.roles.includes("SUPER_ADMIN");

    if (!isStaff || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access. Editorial credentials required to execute gate runs." },
        { status: 403 }
      );
    }

    const { articleId } = await context.params;

    // Rate Limiting: 10 gate executions per minute per user/article
    const rateLimit = await checkRateLimit(`gate_run:${user.id}:${articleId}`, 10, 60);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Too many AI Editorial Gate executions. Please wait before retrying.",
          resetAt: rateLimit.resetAt,
        },
        { status: 429 }
      );
    }

    // Verify Article Exists
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, status: true },
    });

    if (!article) {
      return NextResponse.json(
        { success: false, error: "Article not found." },
        { status: 404 }
      );
    }

    const result = await editorialGateService.runGate(articleId);

    return NextResponse.json({
      success: true,
      message: "AI Editorial Gate analysis completed successfully.",
      data: result,
    });
  } catch (error: any) {
    console.error("[API POST /api/editorial/gate/:articleId/run Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to execute AI Editorial Gate." },
      { status: 400 }
    );
  }
}
