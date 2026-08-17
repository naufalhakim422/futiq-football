import { NextResponse } from "next/server";
import { footballService } from "@/lib/football/football.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const liveMatches = await footballService.getLiveMatches();
    return NextResponse.json({
      success: true,
      count: liveMatches.length,
      data: liveMatches,
    });
  } catch (error) {
    console.error("[API GET /api/football/live Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch live matches" },
      { status: 500 }
    );
  }
}
