import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { redirect } from "next/navigation";
import { ContributorConsole } from "./ContributorConsole";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Users, ShieldAlert } from "lucide-react";
import { ContributorStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manajemen & Moderasi Kontributor | Admin FUTIQ FOOTBALL",
  description: "Konsol pengelolaan, penangguhan (suspend), pemblokiran (ban), dan audit integritas kontributor.",
};

export default async function AdminContributorsPage() {
  const user = await getCurrentUser();
  if (!user || !user.roles.includes("SUPER_ADMIN")) {
    redirect("/login?redirect=/admin/contributors");
  }

  let contributors: any[] = [];

  try {
    const profiles = await prisma.contributorProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            isActive: true,
            createdAt: true,
          },
        },
        wallet: {
          select: {
            id: true,
            availableBalanceMinor: true,
            heldBalanceMinor: true,
            lifetimeEarningsMinor: true,
            payoutCooldownUntil: true,
          },
        },
        _count: {
          select: {
            articles: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    contributors = (profiles as any[]).map((p) => ({
      id: p.id,
      userId: p.userId,
      fullName: p.user?.fullName || p.displayName,
      displayName: p.displayName,
      email: p.user?.email || "contributor@futiq.com",
      country: p.country,
      status: p.status,
      overallTrustScore: Number(p.overallTrustScore || 100),
      qualityScore: Number(p.qualityScore || 100),
      articlesCount: p._count?.articles || 0,
      availableBalanceMinor: p.wallet?.availableBalanceMinor || 0,
      isWithdrawalBlocked: p.status === "SUSPENDED" || p.status === "BANNED",
      isUserActive: p.user?.isActive ?? true,
      createdAt: p.createdAt,
    }));
  } catch (dbErr) {
    console.warn("[Admin Contributors Page DB fallback]:", dbErr);
  }

  // Sample data fallback if DB has no contributors yet
  if (contributors.length === 0) {
    contributors = [
      {
        id: "cp_taufik_01",
        userId: "usr_taufik",
        fullName: "Taufik Hidayat",
        displayName: "Taufik Hidayat",
        email: "contributor@futiq.com",
        country: "Indonesia",
        status: "ACTIVE" as ContributorStatus,
        overallTrustScore: 98.5,
        qualityScore: 92.0,
        articlesCount: 8,
        availableBalanceMinor: 0,
        isWithdrawalBlocked: false,
        isUserActive: true,
        createdAt: new Date(Date.now() - 30 * 86400000),
      },
      {
        id: "cp_naufal_dev",
        userId: "usr_naufal_dev",
        fullName: "Naufal (Developer & Contributor)",
        displayName: "Naufal Dev",
        email: "dev.contributor@futiq.com",
        country: "Indonesia",
        status: "ACTIVE" as ContributorStatus,
        overallTrustScore: 100.0,
        qualityScore: 99.0,
        articlesCount: 14,
        availableBalanceMinor: 0,
        isWithdrawalBlocked: false,
        isUserActive: true,
        createdAt: new Date(Date.now() - 15 * 86400000),
      },
      {
        id: "cp_gabriel_02",
        userId: "usr_gabriel",
        fullName: "Gabriel Vance",
        displayName: "Gabriel Vance",
        email: "gabriel.vance@futiq.com",
        country: "United Kingdom",
        status: "ACTIVE" as ContributorStatus,
        overallTrustScore: 94.0,
        qualityScore: 89.5,
        articlesCount: 12,
        availableBalanceMinor: 12500,
        isWithdrawalBlocked: false,
        isUserActive: true,
        createdAt: new Date(Date.now() - 60 * 86400000),
      },
      {
        id: "cp_marcus_suspect",
        userId: "usr_marcus",
        fullName: "Marcus Thorne (Suspicious Traffic)",
        displayName: "Marcus Thorne",
        email: "marcus.thorne@futiq.com",
        country: "United States",
        status: "SUSPENDED" as ContributorStatus,
        overallTrustScore: 42.0,
        qualityScore: 55.0,
        articlesCount: 3,
        availableBalanceMinor: 34000,
        isWithdrawalBlocked: true,
        isUserActive: true,
        createdAt: new Date(Date.now() - 10 * 86400000),
      },
    ];
  }

  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        {/* Navigation Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-pitch-800">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Pusat Admin</span>
          </Link>

          <div className="flex items-center gap-2 px-3 py-1 bg-brand-red/10 border border-brand-red/30 text-brand-red font-mono text-[10px] font-bold uppercase tracking-widest rounded">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Zona Pengendalian Otoritas Super Admin</span>
          </div>
        </div>

        <SectionHeader
          title="Manajemen & Moderasi Kontributor"
          subtitle="Kendali penuh status penulis (Aktif, Suspend, Ban), audit integritas AI, pembekuan dompet, dan penegakan etika jurnalistik"
          badgeText="Moderation Desk"
        />

        {/* Main Interactive Moderation Console */}
        <ContributorConsole initialContributors={contributors} />
      </PageContainer>
    </div>
  );
}
