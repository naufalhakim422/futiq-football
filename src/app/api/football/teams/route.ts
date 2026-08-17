import { NextRequest, NextResponse } from "next/server";
import { footballService } from "@/lib/football/football.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const competition = searchParams.get("competition") || undefined;

    const teams = await footballService.getTeams(competition);
    return NextResponse.json({
      success: true,
      count: teams.length,
      data: teams,
    });
  } catch (error) {
    console.error("[API GET /api/football/teams Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}
