import { NextRequest, NextResponse } from "next/server";
import { footballService } from "@/lib/football/football.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const competition = searchParams.get("competition") || "PL";
    const season = searchParams.get("season") || undefined;

    const standings = await footballService.getStandings(competition, season);
    return NextResponse.json({
      success: true,
      competition,
      count: standings.length,
      data: standings,
    });
  } catch (error) {
    console.error("[API GET /api/football/standings Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch standings" },
      { status: 500 }
    );
  }
}
