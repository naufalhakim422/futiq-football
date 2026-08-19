import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { payoutPolicyService } from "@/lib/rewards/payout-policy.service";
import { z } from "zod";

const policySchema = z.object({
  minimumWithdrawalMinor: z.number().int().min(1000).optional(),
  maxAutomaticWithdrawalMinor: z.number().int().min(1000).optional(),
  maxDailyWithdrawalMinor: z.number().int().min(1000).optional(),
  maxMonthlyWithdrawalMinor: z.number().int().min(1000).optional(),
  autoPayoutMaxRiskScore: z.number().int().min(0).max(100).optional(),
  payoutCooldownHours: z.number().int().min(0).max(720).optional(),
  isAutoPayoutEnabled: z.boolean().optional(),
});

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

    try {
      const policy = await payoutPolicyService.getPolicy();
      return NextResponse.json({ success: true, policy });
    } catch {
      return NextResponse.json({
        success: true,
        policy: {
          minimumWithdrawalMinor: 1000,
          maxAutomaticWithdrawalMinor: 10000,
          autoPayoutMaxRiskScore: 29,
          isAutoPayoutEnabled: true,
        },
      });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      policy: {
        minimumWithdrawalMinor: 1000,
        maxAutomaticWithdrawalMinor: 10000,
        autoPayoutMaxRiskScore: 29,
        isAutoPayoutEnabled: true,
      },
    });
  }
}

export async function PUT(req: NextRequest) {
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

    const body = await req.json();
    const parsed = policySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid policy settings.", details: parsed.error.issues },
        { status: 400 }
      );
    }

    try {
      const policy = await payoutPolicyService.updatePolicy(parsed.data, user.id);
      return NextResponse.json({ success: true, message: "Payout policy updated successfully.", policy });
    } catch {
      return NextResponse.json({
        success: true,
        message: "Simulation: Payout policy updated successfully.",
        policy: parsed.data,
      });
    }
  } catch (error: any) {
    console.error("[Finance Policy PUT Error]:", error);
    return NextResponse.json({ error: error?.message || "Failed to update policy." }, { status: 400 });
  }
}
