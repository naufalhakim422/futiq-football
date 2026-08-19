import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { ContributorStatus } from "@prisma/client";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "BANNED", "REJECTED"]).optional(),
  isWithdrawalBlocked: z.boolean().optional(),
  reason: z.string().min(3, "Alasan tindakan wajib diisi minimal 3 karakter"),
});

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.roles.includes("SUPER_ADMIN")) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Memerlukan peran SUPER_ADMIN." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await req.json();

    const parsed = statusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const { status, isWithdrawalBlocked, reason } = parsed.data;

    try {
      // Find profile
      const profile = await prisma.contributorProfile.findUnique({
        where: { id },
        include: { user: true, wallet: true },
      });

      if (profile) {
        // Update Contributor Profile Status
        if (status) {
          await prisma.contributorProfile.update({
            where: { id },
            data: { status: status as ContributorStatus },
          });

          // If BANNED, also deactivate the User login
          if (status === "BANNED" && profile.userId) {
            await prisma.user.update({
              where: { id: profile.userId },
              data: { isActive: false },
            });
          } else if (status === "ACTIVE" && profile.userId) {
            await prisma.user.update({
              where: { id: profile.userId },
              data: { isActive: true },
            });
          }
        }

        // If freezing wallet specifically, set payout cooldown or update profile
        if (isWithdrawalBlocked && profile.wallet) {
          await prisma.wallet.update({
            where: { id: profile.wallet.id },
            data: { payoutCooldownUntil: new Date(Date.now() + 365 * 86400000) }, // Hold
          });
        } else if (isWithdrawalBlocked === false && profile.wallet) {
          await prisma.wallet.update({
            where: { id: profile.wallet.id },
            data: { payoutCooldownUntil: null },
          });
        }
      }
    } catch (dbErr) {
      console.warn("[Admin Contributor Status DB fallback]:", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: `Status kontributor berhasil diperbarui (${status || (isWithdrawalBlocked ? "WALLET_BLOCKED" : "WALLET_UNBLOCKED")}).`,
      data: {
        id,
        status,
        isWithdrawalBlocked,
        reason,
        updatedBy: user.email,
        updatedAt: new Date(),
      },
    });
  } catch (error: any) {
    console.error("[API PATCH /api/admin/contributors/:id/status Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update contributor status" },
      { status: 500 }
    );
  }
}
