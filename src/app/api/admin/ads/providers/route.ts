import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const isAuthorized = user.roles.some((r) => ["SUPER_ADMIN", "SENIOR_EDITOR", "FINANCE"].includes(r));
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    let providers = await prisma.adProvider.findMany({
      orderBy: { name: "asc" },
    });

    if (providers.length === 0) {
      // Seed default providers
      await prisma.adProvider.createMany({
        data: [
          {
            name: "Direct Sponsor / Partner",
            slug: "direct-sponsor",
            adapterKey: "direct-sponsor",
            isActive: true,
          },
          {
            name: "Internal Mock Ad Engine",
            slug: "mock-ad-engine",
            adapterKey: "mock-ad-provider",
            isActive: true,
          },
        ],
      });
      providers = await prisma.adProvider.findMany({ orderBy: { name: "asc" } });
    }

    return NextResponse.json({ success: true, providers });
  } catch (error: any) {
    console.error("[Admin Ad Providers GET Error]:", error);
    return NextResponse.json({ error: "Failed to retrieve ad providers." }, { status: 500 });
  }
}
