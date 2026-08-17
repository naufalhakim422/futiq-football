import { NextRequest, NextResponse } from "next/server";
import { SearchService } from "@/lib/search/search.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);

    const results = await SearchService.executeSearch(q, limit);

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error("[Search API Error]:", error);
    return NextResponse.json({ error: "Failed to execute search." }, { status: 500 });
  }
}
