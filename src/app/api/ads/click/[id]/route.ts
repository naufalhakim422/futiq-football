import { NextRequest, NextResponse } from "next/server";
import { analyticsService } from "@/lib/analytics/analytics.service";
import { AnalyticsEventType } from "@/lib/analytics/types";
import { adPlacementService } from "@/lib/ads/ad-placement.service";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const creativeId = resolvedParams.id;
    const { searchParams } = new URL(req.url);
    const dest = searchParams.get("dest");

    if (!dest) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 1. Strict URL Protocol & Sanitization
    const trimmedDest = dest.trim();
    if (!/^https?:\/\//i.test(trimmedDest) && !trimmedDest.startsWith("/")) {
      console.warn(`[Security Alert: Dangerous Ad Redirect Blocked]: ${trimmedDest}`);
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Block javascript:, data:, and control characters
    if (/javascript:|data:|vbscript:/i.test(trimmedDest)) {
      console.warn(`[Security Alert: Script Injected Redirect Blocked]: ${trimmedDest}`);
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 2. Telemetry tracking
    const userAgent = req.headers.get("user-agent") || "";
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";

    try {
      await adPlacementService.recordClick(creativeId);
      await analyticsService.trackEvent({
        eventType: AnalyticsEventType.AD_CLICK,
        adPlacementId: creativeId,
        userAgent,
        ipAddress: ip,
      });
    } catch {
      // Non-blocking telemetry
    }

    // 3. Safe Redirect
    return NextResponse.redirect(trimmedDest);
  } catch (error: any) {
    console.error("[Ad Click Handler Error]:", error);
    return NextResponse.redirect(new URL("/", req.url));
  }
}
