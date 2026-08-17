import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { payoutReconciliationService } from "@/lib/rewards/payout-reconciliation.service";

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
    const isMatchedParam = searchParams.get("isMatched");
    const isMatched = isMatchedParam !== null ? isMatchedParam === "true" : undefined;

    const records = await payoutReconciliationService.listReconciliations({ isMatched });

    return NextResponse.json({ success: true, reconciliations: records });
  } catch (error: any) {
    console.error("[Reconciliation GET Error]:", error);
    return NextResponse.json({ error: "Failed to retrieve reconciliations." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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

    const result = await payoutReconciliationService.runReconciliationSweep(user.id);

    return NextResponse.json({
      success: true,
      message: `Reconciliation sweep completed. Scanned: ${result.scannedCount}, Matched: ${result.matchedCount}, Discrepancies: ${result.discrepancyCount}`,
      ...result,
    });
  } catch (error: any) {
    console.error("[Reconciliation POST Sweep Error]:", error);
    return NextResponse.json({ error: "Failed to run reconciliation sweep." }, { status: 500 });
  }
}
