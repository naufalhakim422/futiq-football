import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { kycService } from "@/lib/kyc/kyc.service";

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
      return NextResponse.json({ error: "Contributor profile not found." }, { status: 404 });
    }

    const summary = await kycService.getContributorKycSummary(contributorProfile.id);

    return NextResponse.json({
      success: true,
      kyc: summary,
    });
  } catch (error: any) {
    console.error("[Contributor KYC GET Error]:", error);
    return NextResponse.json({ error: "Failed to retrieve KYC status." }, { status: 500 });
  }
}
