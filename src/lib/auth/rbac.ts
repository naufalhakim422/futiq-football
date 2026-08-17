import { getCurrentUser } from "./session";
import { RoleType, SessionUser } from "@/types/auth";
import { redirect } from "next/navigation";

/**
 * Server-side RBAC verification helper
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?unauthorized=true");
  }
  return user;
}

/**
 * Require at least one of the allowed roles
 */
export async function requireRole(allowedRoles: RoleType[]): Promise<SessionUser> {
  const user = await requireAuth();

  const hasRole = user.roles.some((r) => allowedRoles.includes(r));
  if (!hasRole) {
    redirect("/unauthorized");
  }

  return user;
}

/**
 * Check if a user has a specific permission code
 */
export async function requirePermission(permissionCode: string): Promise<SessionUser> {
  const user = await requireAuth();

  if (user.roles.includes("SUPER_ADMIN")) {
    return user; // Super Admin has universal access
  }

  const hasPermission = user.permissions.includes(permissionCode);
  if (!hasPermission) {
    redirect("/unauthorized");
  }

  return user;
}
