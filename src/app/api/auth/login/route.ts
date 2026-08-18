import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, getSessionCookieOptions } from "@/lib/auth/session";
import { RoleType, SessionUser } from "@/types/auth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(["SUPER_ADMIN", "EDITOR_IN_CHIEF", "SENIOR_EDITOR", "FINANCE", "CONTRIBUTOR", "READER"]).optional(),
});

// Preconfigured demo/standard accounts
const ROLE_PROFILES: Record<string, { fullName: string; defaultRole: RoleType; allRoles: RoleType[]; permissions: string[] }> = {
  "admin@futiq.com": {
    fullName: "Chief Administrator",
    defaultRole: "SUPER_ADMIN",
    allRoles: ["SUPER_ADMIN", "EDITOR_IN_CHIEF", "SENIOR_EDITOR", "FINANCE", "CONTRIBUTOR"],
    permissions: ["*"],
  },
  "editor@futiq.com": {
    fullName: "Senior Newsroom Editor",
    defaultRole: "SENIOR_EDITOR",
    allRoles: ["SENIOR_EDITOR", "CONTRIBUTOR"],
    permissions: ["article:read", "article:write", "article:review", "article:publish", "editorial:gate"],
  },
  "contributor@futiq.com": {
    fullName: "Taufik Hidayat (Kontributor)",
    defaultRole: "CONTRIBUTOR",
    allRoles: ["CONTRIBUTOR"],
    permissions: ["article:read", "article:write", "rewards:view", "wallet:manage"],
  },
  "finance@futiq.com": {
    fullName: "Finance & Payout Officer",
    defaultRole: "FINANCE",
    allRoles: ["FINANCE", "SUPER_ADMIN"],
    permissions: ["finance:read", "finance:write", "payout:approve", "reconciliation:run"],
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Format email atau kata sandi tidak valid.", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { email, role: requestedRole } = parsed.data;
    const lowerEmail = email.toLowerCase().trim();

    // Check if matching predefined profile or dynamic role assignment
    const profile = ROLE_PROFILES[lowerEmail] || {
      fullName: lowerEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      defaultRole: (requestedRole || "CONTRIBUTOR") as RoleType,
      allRoles: [requestedRole || "CONTRIBUTOR"] as RoleType[],
      permissions: ["article:read", "article:write", "wallet:manage"],
    };

    const assignedRole = requestedRole || profile.defaultRole;
    const roles = Array.from(new Set([assignedRole, ...profile.allRoles]));

    const sessionUser: SessionUser = {
      id: `usr_${lowerEmail.replace(/[^a-z0-9]/g, "_")}`,
      email: lowerEmail,
      fullName: profile.fullName,
      roles: roles as RoleType[],
      permissions: profile.permissions,
    };

    const token = await createSessionToken(sessionUser);
    const cookieOptions = getSessionCookieOptions();

    const response = NextResponse.json({
      success: true,
      message: "Autentikasi berhasil. Sesi aktif dibuat.",
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
    console.error("[Login API Error]:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses sesi login." },
      { status: 500 }
    );
  }
}
