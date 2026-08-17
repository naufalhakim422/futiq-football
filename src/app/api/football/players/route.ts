import { NextRequest, NextResponse } from "next/server";
import { footballService } from "@/lib/football/football.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId") || undefined;

    const players = await footballService.getPlayers(teamId);
    return NextResponse.json({
      success: true,
      count: players.length,
      data: players,
    });
  } catch (error) {
    console.error("[API GET /api/football/players Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch players" },
      { status: 500 }
    );
  }
}
