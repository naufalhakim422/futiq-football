import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ready: true, status: "READY" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { ready: false, status: "NOT_READY", reason: "Database connection failed" },
      { status: 503 }
    );
  }
}
