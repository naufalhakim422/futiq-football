import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const isAuthorized = user.roles.some((r) =>
      ["SUPER_ADMIN", "EDITOR_IN_CHIEF", "SENIOR_EDITOR"].includes(r)
    );
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden: Admin or Editor role required." }, { status: 403 });
    }

    await prisma.urlRedirect.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Redirect deleted." });
  } catch (error) {
    console.error("[Admin Redirect DELETE Error]:", error);
    return NextResponse.json({ error: "Failed to delete redirect." }, { status: 500 });
  }
}
