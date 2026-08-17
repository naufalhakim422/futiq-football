import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { redirect } from "next/navigation";
import { adPlacementService } from "@/lib/ads/ad-placement.service";
import { adProviderRegistry } from "@/lib/ads/ad-provider-registry";
import { sponsorService } from "@/lib/ads/sponsor.service";
import { campaignService } from "@/lib/ads/campaign.service";
import { popunderPolicyService } from "@/lib/ads/popunder-policy.service";
import { adAuditService } from "@/lib/ads/ad-audit.service";
import { AdConsole } from "./AdConsole";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAdvertisingPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin");
  }

  const isAuthorized = user.roles.some((r) =>
    ["SUPER_ADMIN", "SENIOR_EDITOR", "FINANCE"].includes(r)
  );
  if (!isAuthorized) {
    redirect("/admin");
  }

  let placements: any[] = [];
  let providers: any[] = [];
  let sponsors: any[] = [];
  let campaigns: any[] = [];
  let popunderPolicy: any = null;
  let auditLogs: any[] = [];

  try {
    const results = await Promise.all([
      adPlacementService.listPlacements(),
      sponsorService.listSponsors(),
      campaignService.listCampaigns(),
      adAuditService.listLogs(50),
    ]);

    placements = results[0];
    sponsors = results[1];
    campaigns = results[2];
    auditLogs = results[3];
    providers = adProviderRegistry.listProviders().map((p) => p.getProviderConfig());
    popunderPolicy = popunderPolicyService.getPolicy();
  } catch (err) {
    console.warn("[Admin Advertising DB offline fallback]:", err);
    providers = adProviderRegistry.listProviders().map((p) => p.getProviderConfig());
    popunderPolicy = popunderPolicyService.getPolicy();
    sponsors = await sponsorService.listSponsors();
    campaigns = await campaignService.listCampaigns();
    auditLogs = await adAuditService.listLogs(50);
  }

  return (
    <PageContainer className="py-8 space-y-8">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Admin Central
        </Link>
        <SectionHeader
          title="FUTIQ Advertising & Sponsorship Center"
          subtitle="Provider-agnostic ad network integration, direct sponsor campaigns, placement routing, and revenue telemetry"
        />
      </div>

      <AdConsole
        initialPlacements={placements}
        initialProviders={providers}
        initialSponsors={sponsors}
        initialCampaigns={campaigns}
        initialPopunderPolicy={popunderPolicy}
        initialAuditLogs={auditLogs}
      />
    </PageContainer>
  );
}
