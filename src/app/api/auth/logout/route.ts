import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: "Sesi berhasil diakhiri.",
  });

  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const redirectUrl = searchParams.get("redirect") || "/";

  const response = NextResponse.redirect(new URL(redirectUrl, req.url));
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
