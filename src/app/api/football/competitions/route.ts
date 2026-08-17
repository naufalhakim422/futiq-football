import { NextResponse } from "next/server";
import { footballService } from "@/lib/football/football.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const competitions = await footballService.getCompetitions();
    return NextResponse.json({
      success: true,
      count: competitions.length,
      data: competitions,
    });
  } catch (error) {
    console.error("[API GET /api/football/competitions Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch competitions" },
      { status: 500 }
    );
  }
}
