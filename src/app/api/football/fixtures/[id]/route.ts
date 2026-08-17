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
        { success: false, error: "Match ID is required" },
        { status: 400 }
      );
    }

    const match = await footballService.getMatchDetail(id);
    if (!match) {
      return NextResponse.json(
        { success: false, error: "Match not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: match,
    });
  } catch (error) {
    console.error(`[API GET /api/football/fixtures/:id Error]:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch match detail" },
      { status: 500 }
    );
  }
}
