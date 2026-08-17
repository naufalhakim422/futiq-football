import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    // Check ownership
    const article = await prisma.article.findUnique({
      where: { id },
      select: { authorId: true },
    });

    const isStaff =
      user.roles.includes("EDITOR_IN_CHIEF") ||
      user.roles.includes("SENIOR_EDITOR") ||
      user.roles.includes("SUPER_ADMIN");

    if (!article || (!isStaff && article.authorId !== user.id)) {
      return NextResponse.json(
        { success: false, error: "Article not found or access denied" },
        { status: 404 }
      );
    }

    const revisions = await prisma.articleRevision.findMany({
      where: { articleId: id },
      orderBy: { revisionNumber: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: revisions,
    });
  } catch (error: any) {
    console.error("[API GET /api/contributor/articles/:id/revisions Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch revisions" },
      { status: 500 }
    );
  }
}
