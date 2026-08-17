import { NextRequest, NextResponse } from "next/server";
import { footballService } from "@/lib/football/football.service";
import { z } from "zod";

const querySchema = z.object({
  competition: z.string().optional(),
  teamId: z.string().optional(),
  status: z.enum(["SCHEDULED", "LIVE_1H", "HT", "LIVE_2H", "ET", "PENALTY", "FINISHED", "POSTPONED", "CANCELLED"]).optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
});

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      competition: searchParams.get("competition") || undefined,
      teamId: searchParams.get("teamId") || undefined,
      status: searchParams.get("status") || undefined,
      limit: searchParams.get("limit") || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const fixtures = await footballService.getFixtures({
      competitionCode: parsed.data.competition,
      teamId: parsed.data.teamId,
      status: parsed.data.status,
      limit: parsed.data.limit,
    });

    return NextResponse.json({
      success: true,
      count: fixtures.length,
      data: fixtures,
    });
  } catch (error) {
    console.error("[API GET /api/football/fixtures Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch fixtures" },
      { status: 500 }
    );
  }
}
