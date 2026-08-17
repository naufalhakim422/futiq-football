import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { contributorService } from "@/lib/contributor/contributor.service";
import { z } from "zod";

const updateProfileSchema = z.object({
  displayName: z.string().min(2).optional(),
  bio: z.string().optional(),
  country: z.string().optional(),
  preferredLanguage: z.string().optional(),
  footballInterests: z.array(z.string()).optional(),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const profile = await contributorService.getContributorProfile(user.id);
    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Contributor profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    console.error("[API GET /api/contributor/profile Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to retrieve profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const updated = await contributorService.updateContributorProfile(
      user.id,
      parsed.data
    );

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error("[API PATCH /api/contributor/profile Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update profile" },
      { status: 400 }
    );
  }
}
