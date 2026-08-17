import { NextRequest, NextResponse } from "next/server";
import { payoutWebhookService } from "@/lib/rewards/payout-webhook.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const signature = req.headers.get("x-payout-signature") || req.headers.get("x-signature") || null;
    const rawPayload = await req.text();

    const result = await payoutWebhookService.processWebhook(provider, rawPayload, signature);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Webhook processing failed." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      received: true,
      duplicate: result.isDuplicate,
    });
  } catch (error: any) {
    console.error("[Payout Webhook Error]:", error);
    return NextResponse.json(
      { error: "Internal server error during webhook processing." },
      { status: 500 }
    );
  }
}
