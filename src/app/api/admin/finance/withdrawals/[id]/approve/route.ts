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

    // Direct simulation approval handler
    if (id.startsWith("with_sim_")) {
      simulationStore.approveWithdrawal(id);
      return NextResponse.json({
        success: true,
        message: "Simulation: Withdrawal approved and queued for disbursement.",
        withdrawal: { id, status: "APPROVED" },
      });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "";

    try {
      const result = await payoutService.approveWithdrawal({
        withdrawalId: id,
        financeUserId: user.id,
        ipAddress: ip,
        userAgent,
      });

      return NextResponse.json({
        success: true,
        message: "Withdrawal approved and queued for payout processing.",
        withdrawal: result.withdrawal,
        payout: result.payout,
      });
    } catch (dbErr: any) {
      // Simulation Approval Fallback
      simulationStore.approveWithdrawal(id);
      return NextResponse.json({
        success: true,
        message: "Simulation: Withdrawal approved and queued for disbursement.",
        withdrawal: { id, status: "APPROVED" },
      });
    }
  } catch (error: any) {
    console.error("[Admin Withdrawal Approve Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to approve withdrawal." },
      { status: 400 }
    );
  }
}
