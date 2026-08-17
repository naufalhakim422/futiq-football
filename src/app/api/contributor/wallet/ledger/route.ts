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
        { error: "Contributor profile not found." },
        { status: 404 }
      );
    }

    const wallet = await walletService.getOrCreateWallet(contributorProfile.id);

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const history = await walletService.getLedgerHistory(wallet.id, limit, offset);

    return NextResponse.json({
      success: true,
      ...history,
    });
  } catch (error: any) {
    console.error("[Contributor Ledger GET Error]:", error);
    return NextResponse.json(
      { error: "Failed to retrieve wallet ledger history." },
      { status: 500 }
    );
  }
}
