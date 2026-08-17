import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { PersonalizedFeedService } from "@/lib/personalization/personalized-feed.service";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 30);

    const feed = await PersonalizedFeedService.getPersonalizedFeed(user.id, limit);

    return NextResponse.json({
      success: true,
      ...feed,
    });
  } catch (error) {
    console.error("[Personalized Feed GET Error]:", error);
    return NextResponse.json({ error: "Failed to retrieve personalized feed." }, { status: 500 });
  }
}
