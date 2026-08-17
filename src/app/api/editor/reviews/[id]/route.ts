import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { editorialService } from "@/lib/editorial/editorial.service";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const { id } = await context.params;
    const article = await editorialService.getReviewDetail(id);

    if (!article) {
      return NextResponse.json(
        { success: false, error: "Article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: article,
    });
  } catch (error: any) {
    console.error("[API GET /api/editor/reviews/:id Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch review detail" },
      { status: 500 }
    );
  }
}
