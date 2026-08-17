import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { financialAuditService } from "@/lib/rewards/financial-audit.service";
import { FinancialAuditAction } from "@prisma/client";

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
    const actionParam = searchParams.get("action") as FinancialAuditAction | null;
    const entityType = searchParams.get("entityType") || undefined;
    const entityId = searchParams.get("entityId") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const logs = await financialAuditService.getAuditLogs({
      action: actionParam && Object.values(FinancialAuditAction).includes(actionParam) ? actionParam : undefined,
      entityType,
      entityId,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      ...logs,
    });
  } catch (error: any) {
    console.error("[Admin Finance Audit Logs Error]:", error);
    return NextResponse.json(
      { error: "Failed to retrieve financial audit logs." },
      { status: 500 }
    );
  }
}
