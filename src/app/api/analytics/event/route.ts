import { NextRequest, NextResponse } from "next/server";
import { analyticsService } from "@/lib/analytics/analytics.service";
import { AnalyticsEventType } from "@/lib/analytics/types";
import { z } from "zod";

const analyticsEventSchema = z.object({
  eventType: z.enum([
    "PAGE_VIEW",
    "ARTICLE_VIEW",
    "ARTICLE_READ",
    "SCROLL_DEPTH",
    "SESSION_START",
    "AD_IMPRESSION",
    "AD_CLICK",
  ]),
  pageUrl: z.string().optional(),
  articleId: z.string().optional(),
  adPlacementId: z.string().optional(),
  sessionFingerprint: z.string().optional(),
  scrollDepthPercent: z.number().int().min(0).max(100).optional(),
  readTimeSeconds: z.number().int().min(0).max(86400).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = analyticsEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid analytics event.", details: parsed.error.issues }, { status: 400 });
    }

    const userAgent = req.headers.get("user-agent") || "";
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";

    const result = await analyticsService.trackEvent({
      ...parsed.data,
      userAgent,
      ipAddress: ip,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("[Analytics Event Error]:", error);
    return NextResponse.json({ error: "Failed to record event." }, { status: 500 });
  }
}
