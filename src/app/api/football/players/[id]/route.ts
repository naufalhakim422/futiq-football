import { NextRequest, NextResponse } from "next/server";
import { footballService } from "@/lib/football/football.service";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Player ID or slug is required" },
        { status: 400 }
      );
    }

    const player = await footballService.getPlayerDetail(id);
    if (!player) {
      return NextResponse.json(
        { success: false, error: "Player not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: player,
    });
  } catch (error) {
    console.error(`[API GET /api/football/players/:id Error]:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch player detail" },
      { status: 500 }
    );
  }
}
