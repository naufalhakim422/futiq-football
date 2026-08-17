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

    const result = await payoutService.processPayout({
      payoutId: id,
      financeUserId: user.id,
      ipAddress: ip,
      userAgent,
    });

    const errorMessage = !result.success && "error" in result ? result.error : "Unknown error";

    return NextResponse.json({
      success: result.success,
      message: result.success
        ? "Payout disbursed successfully."
        : `Payout disbursement failed: ${errorMessage}`,
      payout: result.payout,
    });
  } catch (error: any) {
    console.error("[Admin Payout Process Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process payout." },
      { status: 400 }
    );
  }
}
