import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { liveMatchEngine } from "@/lib/football/live-engine/live-match.engine";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (!user.roles.includes("SUPER_ADMIN") && !user.roles.includes("EDITOR_IN_CHIEF"))) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access to live telemetry" },
        { status: 403 }
      );
    }

    const telemetry = await liveMatchEngine.getLiveTelemetry();

    return NextResponse.json({
      success: true,
      timestamp: Date.now(),
      data: telemetry,
    });
  } catch (error: any) {
    console.error("[API GET /api/admin/football/live-telemetry Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate live telemetry" },
      { status: 500 }
    );
  }
}
