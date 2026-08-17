import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, getSessionCookieOptions, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { RoleType } from "@/types/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const role = (searchParams.get("role") || "SUPER_ADMIN") as RoleType;
  const redirectTo = searchParams.get("redirect") || "/admin";

  if (searchParams.get("action") === "logout") {
    const response = NextResponse.redirect(new URL(redirectTo, request.url));
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  // Create active session payload
  const sessionUser = {
    id: "admin_master_001",
    email: "superadmin@footballmedia.internal",
    fullName: "Chief Administrator",
    roles: [role, "EDITOR_IN_CHIEF", "CONTRIBUTOR"] as RoleType[],
    permissions: ["*"],
  };

  const token = await createSessionToken(sessionUser);
  const cookieOptions = getSessionCookieOptions();

  const response = NextResponse.redirect(new URL(redirectTo, request.url));
  response.cookies.set({
    name: cookieOptions.name,
    value: token,
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    path: cookieOptions.path,
    maxAge: cookieOptions.maxAge,
  });

  return response;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const role = (body.role || "SUPER_ADMIN") as RoleType;

    const sessionUser = {
      id: "admin_master_001",
      email: "superadmin@footballmedia.internal",
      fullName: "Chief Administrator",
      roles: [role, "EDITOR_IN_CHIEF", "CONTRIBUTOR"] as RoleType[],
      permissions: ["*"],
    };

    const token = await createSessionToken(sessionUser);
    const cookieOptions = getSessionCookieOptions();

    const response = NextResponse.json({
      success: true,
      message: `Authenticated as ${role}`,
      user: sessionUser,
    });

    response.cookies.set({
      name: cookieOptions.name,
      value: token,
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      path: cookieOptions.path,
      maxAge: cookieOptions.maxAge,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
