import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { WithdrawalStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status") as WithdrawalStatus | null;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const where: any = {};
    if (statusParam && Object.values(WithdrawalStatus).includes(statusParam)) {
      where.status = statusParam;
    }

    const [total, withdrawals] = await Promise.all([
      prisma.withdrawalRequest.count({ where }),
      prisma.withdrawalRequest.findMany({
        where,
        include: {
          contributorProfile: {
            select: {
              id: true,
              displayName: true,
              country: true,
              user: { select: { id: true, email: true, fullName: true } },
            },
          },
          payout: { select: { id: true, status: true, provider: true, paidAt: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
    ]);

    return NextResponse.json({
      success: true,
      total,
      withdrawals,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error("[Admin Withdrawals GET Error]:", error);
    return NextResponse.json(
      { error: "Failed to retrieve withdrawal requests." },
      { status: 500 }
    );
  }
}
