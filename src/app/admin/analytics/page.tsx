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
    dailyStats: [],
    totals: {
      pageViews: 0,
      qualifiedViews: 0,
      totalReadTimeMinutes: 0,
      avgScrollDepthPct: 0,
      uniqueSessions: 0,
      adImpressions: 0,
      adClicks: 0,
      estimatedAdRevenueMinor: 0,
    },
    topArticles: [],
    adPlacements: [],
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
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Admin Central
        </Link>
        <SectionHeader
          title="Platform Traffic & Commercial Revenue Analytics"
          subtitle="Privacy-first telemetry, reader engagement metrics, ad click-through yields, and estimated RPM performance"
        />
      </div>

      <AnalyticsConsole initialPerformance={performance} />
    </PageContainer>
  );
}
