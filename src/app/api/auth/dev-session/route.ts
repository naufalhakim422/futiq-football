import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, getSessionCookieOptions, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { RoleType } from "@/types/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const role = (searchParams.get("role") || "CONTRIBUTOR") as RoleType;
  const redirectTo = searchParams.get("redirect") || "/contributor";

  if (searchParams.get("action") === "logout") {
    const response = NextResponse.redirect(new URL(redirectTo, request.url));
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  const isPureContributor = role === "CONTRIBUTOR";

  // Active session payload
  const sessionUser = {
    id: isPureContributor ? "usr_naufal_pure_contributor" : "admin_master_001",
    email: isPureContributor ? "naufal.contributor@futiq.com" : "superadmin@futiq.com",
    fullName: isPureContributor ? "Naufal (Pure Contributor)" : "Chief Administrator",
    roles: isPureContributor
      ? (["CONTRIBUTOR"] as RoleType[]) // PURE CONTRIBUTOR ONLY
      : (["SUPER_ADMIN", "FINANCE", "EDITOR_IN_CHIEF", "CONTRIBUTOR"] as RoleType[]),
    permissions: isPureContributor ? ["contributor:read", "contributor:write"] : ["*"],
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
    const role = (body.role || "CONTRIBUTOR") as RoleType;
    const isPureContributor = role === "CONTRIBUTOR";

    const sessionUser = {
      id: isPureContributor ? "usr_naufal_pure_contributor" : "admin_master_001",
      email: isPureContributor ? "naufal.contributor@futiq.com" : "superadmin@futiq.com",
      fullName: isPureContributor ? "Naufal (Pure Contributor)" : "Chief Administrator",
      roles: isPureContributor
        ? (["CONTRIBUTOR"] as RoleType[]) // PURE CONTRIBUTOR ONLY
        : (["SUPER_ADMIN", "FINANCE", "EDITOR_IN_CHIEF", "CONTRIBUTOR"] as RoleType[]),
      permissions: isPureContributor ? ["contributor:read", "contributor:write"] : ["*"],
    };

    const token = await createSessionToken(sessionUser);
    const cookieOptions = getSessionCookieOptions();

    const response = NextResponse.json({
      success: true,
      message: `Authenticated as ${sessionUser.fullName}`,
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
