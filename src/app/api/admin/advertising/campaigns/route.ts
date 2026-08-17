import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { campaignService } from "@/lib/ads/campaign.service";
import { z } from "zod";

const createCampaignSchema = z.object({
  campaignName: z.string().min(2).max(100),
  sponsorId: z.string().optional(),
  providerId: z.string().default("sponsor-direct"),
  type: z.enum(["NETWORK", "DIRECT_SPONSOR", "HOUSE_AD"]).default("DIRECT_SPONSOR"),
  objective: z.string().optional(),
  pricingModel: z.enum(["FLAT_RATE", "CPM", "CPC", "CPA", "FREE", "CUSTOM"]).default("FLAT_RATE"),
  agreedPriceMinor: z.number().int().min(0).default(0),
  currency: z.string().default("MYR"),
  startAt: z.string(),
  endAt: z.string().optional(),
  priority: z.number().int().min(1).max(100).optional(),
  frequencyCap: z.number().int().optional(),
  impressionCap: z.number().int().optional(),
  clickCap: z.number().int().optional(),
  targetDevice: z.enum(["ALL", "DESKTOP", "MOBILE", "TABLET"]).default("ALL"),
  targetCountry: z.string().optional(),
  targetCategory: z.string().optional(),
  targetCompetition: z.string().optional(),
  targetTeam: z.string().optional(),
  notes: z.string().optional(),
  creative: z
    .object({
      name: z.string().min(2),
      format: z.enum([
        "BANNER",
        "NATIVE",
        "SOCIAL_BAR",
        "POPUNDER",
        "SMARTLINK",
        "IMAGE_LINK",
        "TEXT_LINK",
        "SPONSORED_CARD",
        "SPONSORED_ARTICLE",
        "VIDEO",
        "CUSTOM_SAFE",
      ]),
      title: z.string().min(2),
      description: z.string().optional(),
      imageUrl: z.string().url().optional(),
      mobileImageUrl: z.string().url().optional(),
      targetUrl: z.string().url(),
      ctaText: z.string().optional(),
      customMarkupSafe: z.string().optional(),
    })
    .optional(),
});

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

    const campaigns = await campaignService.listCampaigns();
    return NextResponse.json({ success: true, campaigns });
  } catch (error: any) {
    console.error("[Admin Campaigns GET Error]:", error);
    return NextResponse.json({ error: "Failed to retrieve campaigns." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const parsed = createCampaignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid campaign payload.", details: parsed.error.issues }, { status: 400 });
    }

    const { creative, ...campaignData } = parsed.data;
    const now = new Date().toISOString();

    const creativesList = creative
      ? [
          {
            id: `crt_${Date.now()}`,
            campaignId: "",
            name: creative.name,
            format: creative.format,
            title: creative.title,
            description: creative.description,
            imageUrl: creative.imageUrl,
            mobileImageUrl: creative.mobileImageUrl,
            targetUrl: creative.targetUrl,
            ctaText: creative.ctaText,
            customMarkupSafe: creative.customMarkupSafe,
            status: "ACTIVE" as const,
            approvalState: "APPROVED" as const,
            createdAt: now,
            updatedAt: now,
          },
        ]
      : [];

    const campaign = await campaignService.createCampaign(
      {
        ...campaignData,
        creatives: creativesList,
      },
      user.id
    );

    return NextResponse.json({ success: true, campaign }, { status: 201 });
  } catch (error: any) {
    console.error("[Admin Campaigns POST Error]:", error);
    return NextResponse.json({ error: "Failed to create campaign." }, { status: 500 });
  }
}
