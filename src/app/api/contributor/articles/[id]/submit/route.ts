import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { contributorService } from "@/lib/contributor/contributor.service";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
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
    let notes: string | undefined;

    try {
      const body = await request.json();
      notes = body.notes;
    } catch {
      // body is optional
    }

    const result = await contributorService.submitArticle(user.id, id, notes);

    return NextResponse.json({
      success: true,
      message: "Article submitted for editorial review successfully.",
      data: result,
    });
  } catch (error: any) {
    console.error("[API POST /api/contributor/articles/:id/submit Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to submit article" },
      { status: 400 }
    );
  }
}
