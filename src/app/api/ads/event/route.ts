import { NextRequest, NextResponse } from "next/server";
import { adPlacementService } from "@/lib/ads/ad-placement.service";
import { analyticsService } from "@/lib/analytics/analytics.service";
import { AnalyticsEventType } from "@/lib/analytics/types";
import { z } from "zod";

const adEventSchema = z.object({
  slotKey: z.string().min(1),
  eventType: z.enum(["IMPRESSION", "CLICK"]),
  sessionFingerprint: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = adEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid ad event payload." }, { status: 400 });
    }

    const { slotKey, eventType, sessionFingerprint } = parsed.data;
    const userAgent = req.headers.get("user-agent") || "";
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";

    if (eventType === "IMPRESSION") {
      await adPlacementService.recordImpression(slotKey);
      await analyticsService.trackEvent({
        eventType: AnalyticsEventType.AD_IMPRESSION,
        adPlacementId: slotKey,
        sessionFingerprint,
        userAgent,
        ipAddress: ip,
      });
    } else if (eventType === "CLICK") {
      await adPlacementService.recordClick(slotKey);
      await analyticsService.trackEvent({
        eventType: AnalyticsEventType.AD_CLICK,
        adPlacementId: slotKey,
        sessionFingerprint,
        userAgent,
        ipAddress: ip,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Ad Event Track Error]:", error);
    return NextResponse.json({ error: "Failed to record ad event." }, { status: 500 });
  }
}
