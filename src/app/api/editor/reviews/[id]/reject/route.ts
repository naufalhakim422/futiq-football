import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { editorialService } from "@/lib/editorial/editorial.service";
import { z } from "zod";

const rejectSchema = z.object({
  feedback: z.string().optional(),
  internalNotes: z.string().optional(),
});

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
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // body is optional
    }

    const parsed = rejectSchema.safeParse(body);
    const feedback = parsed.success ? parsed.data.feedback : undefined;
    const internalNotes = parsed.success ? parsed.data.internalNotes : undefined;

    const result = await editorialService.rejectArticle(
      user.id,
      id,
      feedback,
      internalNotes
    );

    return NextResponse.json({
      success: true,
      message: "Article rejected",
      data: result,
    });
  } catch (error: any) {
    console.error("[API POST /api/editor/reviews/:id/reject Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to reject article" },
      { status: 400 }
    );
  }
}
