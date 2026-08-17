import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { campaignService } from "@/lib/ads/campaign.service";
import { sponsorService } from "@/lib/ads/sponsor.service";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const isAuthorized = user.roles.some((r) =>
      ["SUPER_ADMIN", "SENIOR_EDITOR", "FINANCE"].includes(r)
    );
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("campaignId");
    const format = searchParams.get("format"); // "csv" or "json"

    const campaigns = await campaignService.listCampaigns();
    const sponsors = await sponsorService.listSponsors();

    const selectedCampaigns = campaignId
      ? campaigns.filter((c) => c.id === campaignId)
      : campaigns;

    const reportRows = selectedCampaigns.map((camp) => {
      const ctr =
        camp.impressionsDelivered > 0
          ? ((camp.clicksDelivered / camp.impressionsDelivered) * 100).toFixed(2)
          : "0.00";

      return {
        campaignId: camp.id,
        campaignName: camp.campaignName,
        sponsorName: camp.sponsorName || "Internal / Network",
        type: camp.type,
        pricingModel: camp.pricingModel,
        agreedPrice: `${camp.currency} ${(camp.agreedPriceMinor / 100).toFixed(2)}`,
        impressions: camp.impressionsDelivered,
        clicks: camp.clicksDelivered,
        ctr: `${ctr}%`,
        status: camp.status,
        startAt: camp.startAt,
        endAt: camp.endAt || "Indefinite",
      };
    });

    if (format === "csv") {
      const headers = [
        "Campaign ID",
        "Campaign Name",
        "Sponsor",
        "Type",
        "Pricing Model",
        "Agreed Value",
        "Impressions",
        "Clicks",
        "CTR (%)",
        "Status",
        "Flight Start",
        "Flight End",
      ];

      const csvContent = [
        headers.join(","),
        ...reportRows.map((r) =>
          [
            `"${r.campaignId}"`,
            `"${r.campaignName.replace(/"/g, '""')}"`,
            `"${r.sponsorName.replace(/"/g, '""')}"`,
            r.type,
            r.pricingModel,
            `"${r.agreedPrice}"`,
            r.impressions,
            r.clicks,
            r.ctr,
            r.status,
            r.startAt,
            r.endAt,
          ].join(",")
        ),
      ].join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="futiq_sponsor_report_${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      generatedAt: new Date().toISOString(),
      totalCampaigns: reportRows.length,
      rows: reportRows,
    });
  } catch (error: any) {
    console.error("[Admin Advertising Report GET Error]:", error);
    return NextResponse.json({ error: "Failed to generate advertising report." }, { status: 500 });
  }
}
