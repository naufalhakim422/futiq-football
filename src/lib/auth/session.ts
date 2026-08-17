import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { SessionPayload, SessionUser, RoleType } from "@/types/auth";

export const SESSION_COOKIE_NAME = "fmp_session_token";
const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 days

const getSecretKey = () => {
  const secret =
    process.env.AUTH_SECRET || "default_dev_secret_football_media_platform_2026";
  return new TextEncoder().encode(secret);
};

/**
 * Sign and create an encrypted session token
 */
export async function createSessionToken(user: SessionUser): Promise<string> {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expirationTime = issuedAt + SESSION_DURATION_SECONDS;

  const payload: SessionPayload = {
    sub: user.id,
    email: user.email,
    fullName: user.fullName,
    roles: user.roles,
    permissions: user.permissions,
    iat: issuedAt,
    exp: expirationTime,
  };

  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(issuedAt)
    .setExpirationTime(expirationTime)
    .sign(getSecretKey());
}

/**
 * Verify and decode session token
 */
export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Retrieve current user session from HTTP-only cookie on the server
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload || !payload.sub) return null;

    return {
      id: payload.sub,
      email: payload.email,
      fullName: payload.fullName,
      roles: payload.roles,
      permissions: payload.permissions,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Set HTTP-only, Secure, SameSite=Lax cookie
 */
export function getSessionCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  };
}
