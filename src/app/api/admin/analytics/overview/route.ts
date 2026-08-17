import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { analyticsService } from "@/lib/analytics/analytics.service";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const isAuthorized = user.roles.some((r) => ["SUPER_ADMIN", "SENIOR_EDITOR", "FINANCE"].includes(r));
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "14", 10);

    const performance = await analyticsService.getRevenuePerformance(days);

    return NextResponse.json({ success: true, ...performance });
  } catch (error: any) {
    console.error("[Admin Analytics Overview Error]:", error);
    return NextResponse.json({ error: "Failed to retrieve analytics overview." }, { status: 500 });
  }
}
