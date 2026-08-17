import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { autoPayoutService } from "@/lib/rewards/auto-payout.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const isAuthorized = user.roles.some((r) => ["SUPER_ADMIN", "FINANCE"].includes(r));
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Forbidden: Finance or Super Admin role required." },
        { status: 403 }
      );
    }

    const result = await autoPayoutService.retryFailedPayout(id, user.id);

    return NextResponse.json({
      message: result.success ? "Payout retry succeeded." : `Payout retry failed: ${result.error}`,
      ...result,
    });
  } catch (error: any) {
    console.error("[Payout Retry Error]:", error);
    return NextResponse.json({ error: error?.message || "Failed to retry payout." }, { status: 400 });
  }
}
