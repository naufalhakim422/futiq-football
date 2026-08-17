import { NextRequest, NextResponse } from "next/server";
import { adPlacementService } from "@/lib/ads/ad-placement.service";
import { AdPlacementPosition } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const position = (searchParams.get("position") || "HOME_TOP") as AdPlacementPosition;
    const device = (searchParams.get("device") || "ALL") as "DESKTOP" | "MOBILE" | "ALL";
    const category = searchParams.get("category") || undefined;
    const teamSlug = searchParams.get("team") || undefined;
    const competitionCode = searchParams.get("competition") || undefined;

    const creative = await adPlacementService.getAdForPlacement({
      position,
      device,
      category,
      teamSlug,
      competitionCode,
    });

    return NextResponse.json({
      success: true,
      creative,
    });
  } catch (error: any) {
    console.error("[Ads Slot Delivery Error]:", error);
    return NextResponse.json({ error: "Failed to deliver ad creative." }, { status: 500 });
  }
}
