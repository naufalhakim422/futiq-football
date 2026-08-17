import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { redirect } from "next/navigation";
import { analyticsService } from "@/lib/analytics/analytics.service";
import { AnalyticsConsole } from "./AnalyticsConsole";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin");
  }

  const isAuthorized = user.roles.some((r) => ["SUPER_ADMIN", "SENIOR_EDITOR", "FINANCE"].includes(r));
  if (!isAuthorized) {
    redirect("/admin");
  }

  let performance: any = {
    totals: {
      totalPageViews: 0,
      totalReads: 0,
      totalAdImpressions: 0,
      totalAdClicks: 0,
      totalEstimatedRevenueMinor: 0,
      overallCtrPercent: 0,
      overallRpmMinor: 0,
      revenueStatus: "ESTIMATED",
    },
    daily: [],
  };

  try {
    performance = await analyticsService.getRevenuePerformance(14);
  } catch (err) {
    console.warn("[Admin Analytics DB offline fallback]:", err);
  }

  return (
    <PageContainer className="py-8 space-y-8">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali ke Pusat Admin
        </Link>
        <SectionHeader
          title="Analitik Trafik Platform & Pendapatan Komersial"
          subtitle="Telemetri berbasis privasi, keterlibatan pembaca, rasio klik iklan (CTR), dan estimasi performa RPM"
        />
      </div>

      <AnalyticsConsole initialPerformance={performance} />
    </PageContainer>
  );
}
