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

    // If contributor, check ownership
    if (!isStaff) {
      const article = await prisma.article.findUnique({
        where: { id: articleId },
        select: { authorId: true },
      });

      if (!article || article.authorId !== user.id) {
        return NextResponse.json(
          { success: false, error: "Forbidden. You can only view findings for your own articles." },
          { status: 403 }
        );
      }
    }

    const findingsData = await editorialGateService.getFindingsForUser(articleId, user);

    return NextResponse.json({
      success: true,
      data: findingsData,
    });
  } catch (error: any) {
    console.error("[API GET /api/editorial/gate/:articleId/findings Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to retrieve gate findings." },
      { status: 500 }
    );
  }
}
