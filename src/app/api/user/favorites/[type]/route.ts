import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { FavoritesService } from "@/lib/personalization/favorites.service";
import { z } from "zod";

const toggleSchema = z.object({
  entityId: z.string().min(1, "Entity ID is required"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = toggleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid toggle body.", details: parsed.error.issues }, { status: 400 });
    }

    let result;
    if (type === "team") {
      result = await FavoritesService.toggleFavoriteTeam(user.id, parsed.data.entityId);
    } else if (type === "player") {
      result = await FavoritesService.toggleFavoritePlayer(user.id, parsed.data.entityId);
    } else if (type === "competition") {
      result = await FavoritesService.toggleFavoriteCompetition(user.id, parsed.data.entityId);
    } else {
      return NextResponse.json({ error: "Invalid favorite entity type." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("[User Favorites Toggle Error]:", error);
    return NextResponse.json({ error: "Failed to update favorite entity." }, { status: 500 });
  }
}
