import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { FavoritesService } from "@/lib/personalization/favorites.service";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const favorites = await FavoritesService.getUserFavorites(user.id);
    return NextResponse.json({ success: true, favorites });
  } catch (error) {
    console.error("[User Favorites GET Error]:", error);
    return NextResponse.json({ error: "Failed to retrieve favorites." }, { status: 500 });
  }
}
