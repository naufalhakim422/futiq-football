import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { editorialService } from "@/lib/editorial/editorial.service";
import { z } from "zod";

const revisionSchema = z.object({
  feedback: z.string().min(5, "Feedback to contributor must be at least 5 characters"),
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
    const body = await request.json();

    const parsed = revisionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const result = await editorialService.requestRevision(
      user.id,
      id,
      parsed.data.feedback,
      parsed.data.internalNotes
    );

    return NextResponse.json({
      success: true,
      message: "Revision requested successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("[API POST /api/editor/reviews/:id/revision Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to request revision" },
      { status: 400 }
    );
  }
}
