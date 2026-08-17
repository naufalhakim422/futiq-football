import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { editorialService } from "@/lib/editorial/editorial.service";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const isStaff =
      user?.roles.includes("EDITOR_IN_CHIEF") ||
      user?.roles.includes("SENIOR_EDITOR") ||
      user?.roles.includes("SUPER_ADMIN");

    if (!isStaff || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access. Editorial credentials required." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    let internalNotes: string | undefined;

    try {
      const body = await request.json();
      internalNotes = body.internalNotes;
    } catch {
      // body is optional
    }

    const result = await editorialService.approveArticle(user.id, id, internalNotes);

    return NextResponse.json({
      success: true,
      message: "Article approved successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("[API POST /api/editor/reviews/:id/approve Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to approve article" },
      { status: 400 }
    );
  }
}
