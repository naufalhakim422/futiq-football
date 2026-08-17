import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { KycStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const isAuthorized = user.roles.some((r) => ["SUPER_ADMIN", "FINANCE"].includes(r));
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden: Compliance or Finance role required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status") as KycStatus | null;

    const where: any = {};
    if (statusParam && Object.values(KycStatus).includes(statusParam)) {
      where.status = statusParam;
    }

    const verifications = await prisma.kycVerification.findMany({
      where,
      include: {
        contributorProfile: {
          select: {
            id: true,
            displayName: true,
            country: true,
            user: { select: { email: true, fullName: true } },
          },
        },
        auditLogs: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      verifications,
    });
  } catch (error: any) {
    console.error("[Compliance KYC GET Error]:", error);
    return NextResponse.json({ error: "Failed to retrieve KYC verifications." }, { status: 500 });
  }
}
