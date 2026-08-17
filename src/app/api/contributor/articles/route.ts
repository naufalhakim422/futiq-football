import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { contributorService } from "@/lib/contributor/contributor.service";
import { z } from "zod";
import { ArticleStatus, ImageRightsStatus, SourceType } from "@prisma/client";

const sourceSchema = z.object({
  sourceName: z.string().min(1, "Source name is required"),
  sourceUrl: z.string().url("Valid source URL is required"),
  sourceType: z.nativeEnum(SourceType).default(SourceType.NEWS_REPORT),
  notes: z.string().optional(),
});

const createArticleSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  subtitle: z.string().optional(),
  excerpt: z.string().optional(),
  body: z.string().default(""),
  category: z.string().min(1, "Category is required"),
  featuredImageUrl: z.string().url().optional().or(z.literal("")),
  featuredImageCaption: z.string().optional(),
  imageRightsStatus: z.nativeEnum(ImageRightsStatus).default(ImageRightsStatus.UNKNOWN),
  imageAttribution: z.string().optional(),
  imageSource: z.string().optional(),
  competitionId: z.string().optional(),
  teamId: z.string().optional(),
  playerId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  sources: z.array(sourceSchema).optional(),
});

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status") as ArticleStatus | null;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const result = await contributorService.getContributorArticles(user.id, {
      status: statusParam || undefined,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: result.articles,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error("[API GET /api/contributor/articles Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = createArticleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const article = await contributorService.createArticleDraft(
      user.id,
      parsed.data
    );

    return NextResponse.json(
      {
        success: true,
        message: "Article draft created successfully",
        data: article,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[API POST /api/contributor/articles Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create draft" },
      { status: 400 }
    );
  }
}
