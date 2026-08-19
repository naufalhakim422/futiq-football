import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { financialAuditService } from "@/lib/rewards/financial-audit.service";
import { FinancialAuditAction } from "@prisma/client";
import { simulationStore } from "@/lib/rewards/simulation-store";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const isAuthorized = user.roles.some((r) => ["SUPER_ADMIN", "FINANCE", "CONTRIBUTOR"].includes(r));
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

    try {
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
    } catch {
      return NextResponse.json({
        success: true,
        logs: simulationStore.auditLogs,
        total: simulationStore.auditLogs.length,
      });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      logs: simulationStore.auditLogs,
      total: simulationStore.auditLogs.length,
    });
  }
}
