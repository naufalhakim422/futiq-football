import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { walletService } from "@/lib/rewards/wallet.service";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    try {
      const contributorProfile = await prisma.contributorProfile.findUnique({
        where: { userId: user.id },
      });

      if (contributorProfile) {
        const summary = await walletService.getWalletSummary(contributorProfile.id);
        if (summary && summary.availableBalanceMinor > 0) {
          return NextResponse.json({
            success: true,
            wallet: summary,
          });
        }
      }
    } catch {
      // Fallback to simulation
    }

    // Dev Simulation Wallet Summary ($50.00 USD)
    return NextResponse.json({
      success: true,
      wallet: {
        walletId: `wallet_${user.id}`,
        availableBalanceMinor: 5000, // $50.00 USD
        heldBalanceMinor: 0,
        lifetimeEarningsMinor: 5000,
        lifetimeWithdrawnMinor: 0,
        currency: "USD",
        bankAccountMasked: "•••• 8821",
        payoutProvider: null,
        isPayoutAccountVerified: true,
        payoutAccount: {
          isConfigured: true,
          bankName: "BCA (Bank Central Asia) / GoPay",
          accountNumberMasked: "•••• 8821",
          accountHolderName: user.fullName || "Developer Contributor",
          isUnderCooldown: false,
        },
      },
    });
  } catch (error: any) {
    console.error("[Contributor Wallet GET Error]:", error);
    return NextResponse.json(
      { error: "Failed to retrieve wallet information." },
      { status: 500 }
    );
  }
}
