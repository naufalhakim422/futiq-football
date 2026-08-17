import { NextRequest, NextResponse } from "next/server";
import { kycService } from "@/lib/kyc/kyc.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const signature = req.headers.get("x-kyc-signature") || req.headers.get("x-signature") || null;
    const rawPayload = await req.text();

    const result = await kycService.processWebhook(provider, rawPayload, signature);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "KYC webhook processing failed." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      received: true,
      duplicate: result.isDuplicate,
    });
  } catch (error: any) {
    console.error("[KYC Webhook Error]:", error);
    return NextResponse.json(
      { error: "Internal server error during KYC webhook processing." },
      { status: 500 }
    );
  }
}
