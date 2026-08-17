import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { payoutService } from "@/lib/rewards/payout.service";
import { z } from "zod";

const rejectSchema = z.object({
  reason: z.string().min(5, "Rejection justification must be at least 5 characters").max(500),
});

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

    const body = await req.json();
    const parsed = rejectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid rejection input.", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "";

    const result = await payoutService.rejectWithdrawal({
      withdrawalId: id,
      financeUserId: user.id,
      reason: parsed.data.reason,
      ipAddress: ip,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: "Withdrawal rejected and funds released back to contributor available balance.",
      withdrawal: result.withdrawal,
    });
  } catch (error: any) {
    console.error("[Admin Withdrawal Reject Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to reject withdrawal." },
      { status: 400 }
    );
  }
}
