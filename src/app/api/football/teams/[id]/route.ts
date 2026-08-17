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
        { success: false, error: "Team ID or slug is required" },
        { status: 400 }
      );
    }

    const team = await footballService.getTeamDetail(id);
    if (!team) {
      return NextResponse.json(
        { success: false, error: "Team not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: team,
    });
  } catch (error) {
    console.error(`[API GET /api/football/teams/:id Error]:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch team detail" },
      { status: 500 }
    );
  }
}
