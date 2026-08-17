import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { editorialService } from "@/lib/editorial/editorial.service";
import { ArticleStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const isStaff =
      user?.roles.includes("EDITOR_IN_CHIEF") ||
      user?.roles.includes("SENIOR_EDITOR") ||
      user?.roles.includes("SUPER_ADMIN");

    if (!isStaff) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access. Editorial credentials required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status") as ArticleStatus | null;
    const category = searchParams.get("category") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const result = await editorialService.getReviewQueue({
      status: statusParam || undefined,
      category,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: result.articles,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error("[API GET /api/editor/reviews Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch review queue" },
      { status: 500 }
    );
  }
}
