import { NextRequest, NextResponse } from "next/server";
import { popunderPolicyService } from "@/lib/ads/popunder-policy.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const route = body.route || "/";
    const device = body.device || "DESKTOP";
    const lastTriggeredTimestamp = body.lastTriggeredTimestamp;
    const sessionImpressionsCount = body.sessionImpressionsCount || 0;

    const evaluation = popunderPolicyService.evaluateTrigger({
      route,
      device,
      lastTriggeredTimestamp,
      sessionImpressionsCount,
    });

    return NextResponse.json(evaluation);
  } catch (error: any) {
    console.error("[Popunder Trigger API Error]:", error);
    return NextResponse.json({ allowed: false, reason: "Internal error" });
  }
}
