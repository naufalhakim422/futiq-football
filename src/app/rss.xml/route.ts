import { NextResponse } from "next/server";
import { RssService } from "@/lib/seo/rss.service";

export async function GET() {
  try {
    const xml = await RssService.generateRssFeed({ limit: 50 });
    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
      },
    });
  } catch (error) {
    console.error("[Global RSS Feed Error]:", error);
    return new NextResponse("<rss></rss>", { status: 500, headers: { "Content-Type": "application/xml" } });
  }
}
