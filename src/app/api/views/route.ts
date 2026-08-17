import { NextRequest, NextResponse } from "next/server";
import { qualifiedViewService } from "@/lib/rewards/qualified-view.service";
import { checkRateLimit } from "@/lib/redis";
import { z } from "zod";

const viewSchema = z.object({
  articleId: z.string().min(1, "Article ID is required"),
  sessionFingerprint: z.string().min(1, "Session fingerprint is required"),
  readTimeSeconds: z.number().int().min(0).max(86400).optional().default(0),
  scrollDepthPercent: z.number().int().min(0).max(100).optional().default(0),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "";

    // Sliding window rate limit: max 60 view posts per minute per IP
    const rateLimit = await checkRateLimit(`view_ingest:${ip}`, 60, 60);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = viewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid view payload.", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const result = await qualifiedViewService.ingestViewEvent({
      articleId: parsed.data.articleId,
      sessionFingerprint: parsed.data.sessionFingerprint,
      readTimeSeconds: parsed.data.readTimeSeconds,
      scrollDepthPercent: parsed.data.scrollDepthPercent,
      userAgent,
      ipAddress: ip,
    });

    return NextResponse.json({
      success: true,
      status: result.status,
      isQualified: result.isQualified,
    });
  } catch (error: any) {
    console.error("[View Ingest Route Error]:", error);
    return NextResponse.json(
      { error: "Internal server error processing view." },
      { status: 500 }
    );
  }
}
