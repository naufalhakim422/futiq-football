import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { RedirectService } from "@/lib/redirects/redirect.service";
import { z } from "zod";

const createRedirectSchema = z.object({
  sourcePath: z.string().min(2),
  targetPath: z.string().min(2),
  statusCode: z.number().int().min(301).max(308).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const isAuthorized = user.roles.some((r) =>
      ["SUPER_ADMIN", "EDITOR_IN_CHIEF", "SENIOR_EDITOR"].includes(r)
    );
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden: Admin or Editor role required." }, { status: 403 });
    }

    const redirects = await prisma.urlRedirect.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ success: true, redirects });
  } catch (error) {
    console.error("[Admin Redirects GET Error]:", error);
    return NextResponse.json({ error: "Failed to retrieve redirects." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const isAuthorized = user.roles.some((r) =>
      ["SUPER_ADMIN", "EDITOR_IN_CHIEF", "SENIOR_EDITOR"].includes(r)
    );
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden: Admin or Editor role required." }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createRedirectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload.", details: parsed.error.issues }, { status: 400 });
    }

    const redirect = await RedirectService.createRedirect({
      sourcePath: parsed.data.sourcePath,
      targetPath: parsed.data.targetPath,
      statusCode: parsed.data.statusCode || 301,
      createdByUserId: user.id,
    });

    return NextResponse.json({ success: true, redirect });
  } catch (error: any) {
    console.error("[Admin Redirects POST Error]:", error);
    return NextResponse.json({ error: error?.message || "Failed to create redirect." }, { status: 400 });
  }
}
