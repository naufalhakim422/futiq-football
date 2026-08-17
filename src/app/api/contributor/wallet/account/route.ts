import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { walletService } from "@/lib/rewards/wallet.service";
import { checkRateLimit } from "@/lib/redis";
import { z } from "zod";

const accountSchema = z.object({
  bankName: z.string().min(2, "Bank name must be at least 2 characters").max(100),
  accountNumber: z.string().min(6, "Account number must be at least 6 digits").max(30),
  accountHolderName: z.string().min(2, "Account holder name is required").max(100),
});

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

    // Rate limit: max 5 bank updates per hour
    const rateLimit = await checkRateLimit(`bank_update:${user.id}`, 5, 3600);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many account update attempts. Please try again in an hour." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = accountSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payout account details.", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "";

    const updatedWallet = await walletService.updatePayoutAccount(
      contributorProfile.id,
      parsed.data,
      user.id,
      ip,
      userAgent
    );

    return NextResponse.json({
      success: true,
      message: "Payout account updated successfully. A 48-hour security cooldown has been applied.",
      payoutAccount: {
        bankName: updatedWallet.payoutBankName,
        accountNumberMasked: updatedWallet.payoutAccountNumberMasked,
        accountHolderName: updatedWallet.payoutAccountHolderName,
        cooldownUntil: updatedWallet.payoutCooldownUntil,
      },
    });
  } catch (error: any) {
    console.error("[Contributor Payout Account POST Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update payout account." },
      { status: 400 }
    );
  }
}
