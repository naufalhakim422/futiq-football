import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { redirect } from "next/navigation";
import { adPlacementService } from "@/lib/ads/ad-placement.service";
import { prisma } from "@/lib/db";
import { AdConsole } from "./AdConsole";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAdvertisingPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin");
  }

  const isAuthorized = user.roles.some((r) => ["SUPER_ADMIN", "SENIOR_EDITOR", "FINANCE"].includes(r));
  if (!isAuthorized) {
    redirect("/admin");
  }

  let placements: any[] = [];
  let providers: any[] = [];

  try {
    const results = await Promise.all([
      adPlacementService.listPlacements(),
      prisma.adProvider.findMany({ orderBy: { name: "asc" } }),
    ]);
    placements = results[0];
    providers = results[1];
  } catch (err) {
    console.warn("[Admin Advertising DB offline fallback]:", err);
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
          title="Commercial Advertising & Ad Placement Engine"
          subtitle="Sandboxed slot placements, device/category targeting, priority routing, and sponsor performance"
        />
      </div>

      <AdConsole initialPlacements={placements} initialProviders={providers} />
    </PageContainer>
  );
}
