import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { walletService } from "@/lib/rewards/wallet.service";
import { checkRateLimit } from "@/lib/redis";
import { z } from "zod";

const withdrawalSchema = z.object({
  amountMinor: z.number().int().min(2000, "Minimum withdrawal is RM 20.00 (2000 minor units)").max(10000000),
  idempotencyKey: z.string().uuid().or(z.string().min(8).max(64)).optional(),
});

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

    const withdrawals = await prisma.withdrawalRequest.findMany({
      where: { contributorProfileId: contributorProfile.id },
      include: { payout: { select: { id: true, status: true, paidAt: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      withdrawals,
    });
  } catch (error: any) {
    console.error("[Contributor Withdrawals GET Error]:", error);
    return NextResponse.json(
      { error: "Failed to retrieve withdrawal history." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    // Rate limiting: max 3 withdrawal requests per hour per user
    const rateLimit = await checkRateLimit(`withdrawal_req:${user.id}`, 3, 3600);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many withdrawal requests. Maximum 3 requests per hour allowed." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = withdrawalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid withdrawal request.", details: parsed.error.issues },
        { status: 400 }
      );
    }

    // Header idempotency key takes priority over body
    const headerIdempotencyKey = req.headers.get("idempotency-key") || undefined;
    const finalIdempotencyKey = headerIdempotencyKey || parsed.data.idempotencyKey;

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "";

    const result = await walletService.requestWithdrawal({
      contributorProfileId: contributorProfile.id,
      amountMinor: parsed.data.amountMinor,
      idempotencyKey: finalIdempotencyKey,
      ipAddress: ip,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: result.isIdempotentReplay
        ? "Existing withdrawal request returned (Idempotent replay)."
        : "Withdrawal request submitted successfully.",
      withdrawal: result.withdrawalRequest,
    });
  } catch (error: any) {
    console.error("[Contributor Withdrawal POST Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process withdrawal request." },
      { status: 400 }
    );
  }
}
