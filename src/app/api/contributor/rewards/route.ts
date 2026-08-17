import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { rewardEngineService } from "@/lib/rewards/reward-engine.service";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const contributorProfile = await prisma.contributorProfile.findUnique({
      where: { userId: user.id },
    });

    if (!contributorProfile) {
      return NextResponse.json(
        { error: "Contributor profile not found." },
        { status: 404 }
      );
    }

    const rewards = await rewardEngineService.getContributorRewards(contributorProfile.id);

    return NextResponse.json({
      success: true,
      rewards,
    });
  } catch (error: any) {
    console.error("[Contributor Rewards GET Error]:", error);
    return NextResponse.json(
      { error: "Failed to retrieve contributor rewards." },
      { status: 500 }
    );
  }
}
