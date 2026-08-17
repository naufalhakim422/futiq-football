import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { notificationService } from "@/lib/notifications/notification.service";
import { z } from "zod";

const updatePrefsSchema = z.object({
  breakingNews: z.boolean().optional(),
  transfers: z.boolean().optional(),
  matchResults: z.boolean().optional(),
  favoriteClubs: z.boolean().optional(),
  articlePublished: z.boolean().optional(),
  financialPayouts: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  inAppNotifications: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const preferences = await notificationService.getPreferences(user.id);
    return NextResponse.json({ success: true, preferences });
  } catch (error) {
    console.error("[Notification Prefs GET Error]:", error);
    return NextResponse.json({ error: "Failed to load preferences." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updatePrefsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload.", details: parsed.error.issues }, { status: 400 });
    }

    const updated = await notificationService.updatePreferences(user.id, parsed.data);
    return NextResponse.json({ success: true, preferences: updated });
  } catch (error) {
    console.error("[Notification Prefs POST Error]:", error);
    return NextResponse.json({ error: "Failed to update preferences." }, { status: 500 });
  }
}
