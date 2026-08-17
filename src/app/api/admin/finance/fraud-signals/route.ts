import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { fraudDetectionService } from "@/lib/rewards/fraud-detection.service";
import { FraudSignalSeverity } from "@prisma/client";
import { z } from "zod";

const resolveSchema = z.object({
  signalId: z.string().min(1, "Signal ID is required"),
  resolutionNotes: z.string().min(5, "Resolution notes must be at least 5 characters"),
});

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
    const resolvedParam = searchParams.get("isResolved");
    const severityParam = searchParams.get("severity") as FraudSignalSeverity | null;

    const isResolved = resolvedParam !== null ? resolvedParam === "true" : undefined;
    const severity = severityParam && Object.values(FraudSignalSeverity).includes(severityParam)
      ? severityParam
      : undefined;

    const signals = await fraudDetectionService.listSignals({ isResolved, severity });

    return NextResponse.json({
      success: true,
      signals,
    });
  } catch (error: any) {
    console.error("[Admin Fraud Signals GET Error]:", error);
    return NextResponse.json(
      { error: "Failed to retrieve fraud signals." },
      { status: 500 }
    );
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

    const body = await req.json();
    const parsed = resolveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input.", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const updated = await fraudDetectionService.resolveFraudSignal(
      parsed.data.signalId,
      user.id,
      parsed.data.resolutionNotes
    );

    return NextResponse.json({
      success: true,
      message: "Fraud signal resolved successfully.",
      signal: updated,
    });
  } catch (error: any) {
    console.error("[Admin Fraud Signal Resolve Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to resolve fraud signal." },
      { status: 400 }
    );
  }
}
