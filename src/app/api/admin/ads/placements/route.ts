import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { adPlacementService } from "@/lib/ads/ad-placement.service";
import { AdPlacementPosition, AdSlotStatus } from "@prisma/client";
import { z } from "zod";

const placementSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2).max(100),
  slotKey: z.string().min(2).max(64),
  position: z.nativeEnum(AdPlacementPosition),
  providerId: z.string().min(1),
  status: z.nativeEnum(AdSlotStatus).default(AdSlotStatus.ACTIVE),
  device: z.enum(["ALL", "DESKTOP", "MOBILE"]).default("ALL"),
  targetCategory: z.string().optional(),
  targetTeamSlug: z.string().optional(),
  targetCompetitionCode: z.string().optional(),
  priority: z.number().int().min(1).max(100).default(1),
  customMarkupSafe: z.string().max(5000).optional(),
  targetUrl: z.string().url().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const isAuthorized = user.roles.some((r) => ["SUPER_ADMIN", "SENIOR_EDITOR", "FINANCE"].includes(r));
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const placements = await adPlacementService.listPlacements();
    return NextResponse.json({ success: true, placements });
  } catch (error: any) {
    console.error("[Admin Ad Placements GET Error]:", error);
    return NextResponse.json({ error: "Failed to retrieve ad placements." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const isAuthorized = user.roles.some((r) => ["SUPER_ADMIN", "SENIOR_EDITOR", "FINANCE"].includes(r));
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const body = await req.json();
    const parsed = placementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid placement payload.", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const result = await adPlacementService.upsertPlacement(parsed.data);

    return NextResponse.json({
      success: true,
      message: "Ad placement saved successfully.",
      placement: result,
    });
  } catch (error: any) {
    console.error("[Admin Ad Placement Save Error]:", error);
    return NextResponse.json({ error: error?.message || "Failed to save ad placement." }, { status: 400 });
  }
}
