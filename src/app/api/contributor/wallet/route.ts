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

    const contributorProfile = await prisma.contributorProfile.findUnique({
      where: { userId: user.id },
    });

    if (!contributorProfile) {
      return NextResponse.json(
        { error: "Contributor profile not found. Please apply to become a contributor." },
        { status: 404 }
      );
    }

    // Load server-authoritative wallet summary
    const summary = await walletService.getWalletSummary(contributorProfile.id);

    return NextResponse.json({
      success: true,
      wallet: summary,
    });
  } catch (error: any) {
    console.error("[Contributor Wallet GET Error]:", error);
    return NextResponse.json(
      { error: "Failed to retrieve wallet information." },
      { status: 500 }
    );
  }
}
