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
        { success: false, error: "Competition ID, code, or slug is required" },
        { status: 400 }
      );
    }

    const comp = await footballService.getCompetition(id);
    if (!comp) {
      return NextResponse.json(
        { success: false, error: "Competition not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: comp,
    });
  } catch (error) {
    console.error(`[API GET /api/football/competitions/:id Error]:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch competition detail" },
      { status: 500 }
    );
  }
}
