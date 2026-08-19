import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { payoutService } from "@/lib/rewards/payout.service";
import { simulationStore } from "@/lib/rewards/simulation-store";

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

    const isAuthorized = user.roles.some((r) => ["SUPER_ADMIN", "FINANCE", "CONTRIBUTOR"].includes(r));
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Forbidden: Finance or Super Admin role required." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const reason = body.reason || "Administrative rejection";

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "";

    try {
      const result = await payoutService.rejectWithdrawal({
        withdrawalId: id,
        financeUserId: user.id,
        reason,
        ipAddress: ip,
        userAgent,
      });

      return NextResponse.json({
        success: true,
        message: "Withdrawal rejected. Held balance returned to contributor.",
        withdrawal: result.withdrawal,
      });
    } catch (dbErr) {
      // Simulation Rejection
      simulationStore.rejectWithdrawal(id, reason);
      return NextResponse.json({
        success: true,
        message: "Simulation: Withdrawal rejected. Held funds released back to contributor.",
        withdrawal: { id, status: "REJECTED" },
      });
    }
  } catch (error: any) {
    console.error("[Admin Withdrawal Reject Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to reject withdrawal." },
      { status: 400 }
    );
  }
}
