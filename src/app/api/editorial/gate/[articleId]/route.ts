import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { editorialGateService } from "@/lib/editorial/ai-gate/editorial-gate.service";
import { prisma } from "@/lib/db";

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

    const isStaff =
      user.roles.includes("EDITOR_IN_CHIEF") ||
      user.roles.includes("SENIOR_EDITOR") ||
      user.roles.includes("SUPER_ADMIN");

    // IDOR Protection: If not editorial staff, ensure user is the article author
    if (!isStaff) {
      const article = await prisma.article.findUnique({
        where: { id: articleId },
        select: { authorId: true },
      });

      if (!article || article.authorId !== user.id) {
        return NextResponse.json(
          { success: false, error: "Forbidden. You do not have permission to view gate data for this article." },
          { status: 403 }
        );
      }

      // Return sanitized contributor view
      const sanitized = await editorialGateService.getFindingsForUser(articleId, user);
      return NextResponse.json({
        success: true,
        data: sanitized,
      });
    }

    // Staff receives full telemetry
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
