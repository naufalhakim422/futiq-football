import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { rewardEngineService } from "@/lib/rewards/reward-engine.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  try {
    const { articleId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const isAuthorized = user.roles.some((r) =>
      ["SUPER_ADMIN", "FINANCE", "EDITOR_IN_CHIEF", "SENIOR_EDITOR"].includes(r)
    );
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Forbidden: Finance, Senior Editor, or Super Admin role required." },
        { status: 403 }
      );
    }

    const result = await rewardEngineService.finalizeReward(articleId, user.id);

    return NextResponse.json({
      success: true,
      message: result.isIdempotentReplay
        ? "Existing finalized reward returned (Idempotent replay)."
        : "Article reward finalized and credited to contributor wallet.",
      reward: result.reward,
    });
  } catch (error: any) {
    console.error("[Admin Reward Finalize Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to finalize article reward." },
      { status: 400 }
    );
  }
}
