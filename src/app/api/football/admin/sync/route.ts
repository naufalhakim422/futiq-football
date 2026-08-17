import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { footballSyncService } from "@/lib/football/sync.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/football/admin/sync - Check sync status (Authorized Admins/Editors)
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    const isAuthorized =
      user?.roles.includes("SUPER_ADMIN") ||
      user?.roles.includes("EDITOR_IN_CHIEF") ||
      user?.roles.includes("SENIOR_EDITOR");

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const status = footballSyncService.getStatus();
    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error("[API GET /api/football/admin/sync Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve sync status" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/football/admin/sync - Trigger manual sync cycle (Super Admin only)
 */
export async function POST() {
  try {
    const user = await getCurrentUser();
    const isSuperAdmin = user?.roles.includes("SUPER_ADMIN");

    if (!isSuperAdmin) {
      return NextResponse.json(
        { success: false, error: "Super Admin privileges required to trigger manual sync" },
        { status: 403 }
      );
    }

    const result = await footballSyncService.syncAll();
    return NextResponse.json({
      success: true,
      message: "Sync cycle completed successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("[API POST /api/football/admin/sync Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Sync execution failed" },
      { status: 500 }
    );
  }
}
