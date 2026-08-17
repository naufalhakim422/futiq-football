import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { payoutService } from "@/lib/rewards/payout.service";

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

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "";

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
  } catch (error: any) {
    console.error("[Admin Withdrawal Approve Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to approve withdrawal." },
      { status: 400 }
    );
  }
}
