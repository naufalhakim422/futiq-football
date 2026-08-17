import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { contributorService } from "@/lib/contributor/contributor.service";

export const dynamic = "force-dynamic";

export async function POST(
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
    const article = await contributorService.withdrawArticle(user.id, id);

    return NextResponse.json({
      success: true,
      message: "Article withdrawn back to draft status.",
      data: article,
    });
  } catch (error: any) {
    console.error("[API POST /api/contributor/articles/:id/withdraw Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to withdraw article" },
      { status: 400 }
    );
  }
}
