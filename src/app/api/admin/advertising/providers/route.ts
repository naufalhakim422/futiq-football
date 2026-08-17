import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { adProviderRegistry } from "@/lib/ads/ad-provider-registry";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const isAuthorized = user.roles.some((r) =>
      ["SUPER_ADMIN", "SENIOR_EDITOR", "FINANCE"].includes(r)
    );
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden: Advertising access required." }, { status: 403 });
    }

    const providers = adProviderRegistry.listProviders().map((p) => p.getProviderConfig());
    return NextResponse.json({ success: true, providers });
  } catch (error: any) {
    console.error("[Admin Providers GET Error]:", error);
    return NextResponse.json({ error: "Failed to retrieve providers." }, { status: 500 });
  }
}
