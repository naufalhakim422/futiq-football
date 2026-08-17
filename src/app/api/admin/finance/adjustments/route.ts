import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { walletService } from "@/lib/rewards/wallet.service";
import { z } from "zod";

const adjustmentSchema = z.object({
  walletId: z.string().min(1, "Wallet ID is required"),
  amountMinor: z.number().int().min(1, "Amount must be a positive integer minor unit"),
  type: z.enum(["CREDIT", "DEBIT", "ADJUSTMENT", "REVERSAL"]),
  reason: z.string().min(10, "Administrative justification must be at least 10 characters").max(500),
});

export async function POST(req: NextRequest) {
  try {
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
    const parsed = adjustmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid adjustment data.", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "";

    const result = await walletService.adminAdjustBalance({
      walletId: parsed.data.walletId,
      amountMinor: parsed.data.amountMinor,
      type: parsed.data.type,
      reason: parsed.data.reason,
      actorId: user.id,
      ipAddress: ip,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: "Wallet adjustment applied and logged successfully.",
      wallet: result.wallet,
      ledgerEntry: result.ledgerEntry,
    });
  } catch (error: any) {
    console.error("[Admin Wallet Adjustment Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to apply wallet adjustment." },
      { status: 400 }
    );
  }
}
