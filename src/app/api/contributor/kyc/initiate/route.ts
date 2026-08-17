import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { kycService } from "@/lib/kyc/kyc.service";

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
      return NextResponse.json({ error: "Contributor profile not found." }, { status: 404 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "";

    const session = await kycService.initiateVerification(contributorProfile.id, ip, userAgent);

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (error: any) {
    console.error("[Contributor KYC Initiate Error]:", error);
    return NextResponse.json({ error: error?.message || "Failed to initiate KYC verification." }, { status: 400 });
  }
}
