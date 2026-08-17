import { NextRequest, NextResponse } from "next/server";
import { footballService } from "@/lib/football/football.service";
import { z } from "zod";

const querySchema = z.object({
  teamId: z.string().optional(),
  status: z.enum(["RUMOR", "ADVANCED", "COMPLETED"]).optional(),
  transferType: z.enum(["PERMANENT", "LOAN", "FREE_AGENT"]).optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
});

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      teamId: searchParams.get("teamId") || undefined,
      status: searchParams.get("status") || undefined,
      transferType: searchParams.get("transferType") || undefined,
      limit: searchParams.get("limit") || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const transfers = await footballService.getTransfers(parsed.data);
    return NextResponse.json({
      success: true,
      count: transfers.length,
      data: transfers,
    });
  } catch (error) {
    console.error("[API GET /api/football/transfers Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch transfers" },
      { status: 500 }
    );
  }
}
