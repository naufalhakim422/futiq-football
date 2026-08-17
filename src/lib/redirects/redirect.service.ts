import { prisma } from "@/lib/db";

export class RedirectService {
  /**
   * Sanitizes and validates internal target path to prevent open redirect vulnerabilities
   */
  public static isValidInternalPath(targetPath: string): boolean {
    if (!targetPath || typeof targetPath !== "string") return false;

    const trimmed = targetPath.trim();

    // Must start with '/' and not with '//' (protocol-relative URL)
    if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return false;

    // Disallow dangerous schemes or javascript pseudo-protocols
    const lower = trimmed.toLowerCase();
    if (
      lower.includes("javascript:") ||
      lower.includes("data:") ||
      lower.includes("vbscript:") ||
      lower.includes("http:") ||
      lower.includes("https:")
    ) {
      return false;
    }

    return true;
  }

  /**
   * Resolves whether an active redirect exists for a given requested path
   */
  public static async resolveRedirect(sourcePath: string) {
    const normalized = sourcePath.toLowerCase().trim();

    const redirect = await prisma.urlRedirect.findFirst({
      where: { sourcePath: normalized, isActive: true },
    });

    if (redirect) {
      // Async increment hit count
      prisma.urlRedirect
        .update({
          where: { id: redirect.id },
          data: { hitCount: { increment: 1 }, lastHitAt: new Date() },
        })
        .catch(() => {});
    }

    return redirect;
  }

  /**
   * Creates or updates a redirect record
   */
  public static async createRedirect(data: {
    sourcePath: string;
    targetPath: string;
    statusCode?: number;
    createdByUserId?: string;
  }) {
    const { sourcePath, targetPath, statusCode = 301, createdByUserId } = data;

    if (!this.isValidInternalPath(sourcePath) || !this.isValidInternalPath(targetPath)) {
      throw new Error("Invalid redirect path. Must be a safe relative internal route starting with '/'.");
    }

    if (sourcePath === targetPath) {
      throw new Error("Source path and target path cannot be identical.");
    }

    return await prisma.urlRedirect.upsert({
      where: { sourcePath: sourcePath.toLowerCase().trim() },
      create: {
        sourcePath: sourcePath.toLowerCase().trim(),
        targetPath: targetPath.trim(),
        statusCode,
        createdByUserId: createdByUserId || null,
      },
      update: {
        targetPath: targetPath.trim(),
        statusCode,
        isActive: true,
      },
    });
  }
}
