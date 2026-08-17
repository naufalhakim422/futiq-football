import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { contributorService } from "@/lib/contributor/contributor.service";
import { z } from "zod";
import { ImageRightsStatus, SourceType } from "@prisma/client";

const updateArticleSchema = z.object({
  title: z.string().min(3).optional(),
  subtitle: z.string().optional(),
  excerpt: z.string().optional(),
  body: z.string().optional(),
  category: z.string().optional(),
  featuredImageUrl: z.string().url().optional().or(z.literal("")),
  featuredImageCaption: z.string().optional(),
  imageRightsStatus: z.nativeEnum(ImageRightsStatus).optional(),
  imageAttribution: z.string().optional(),
  imageSource: z.string().optional(),
  competitionId: z.string().optional(),
  teamId: z.string().optional(),
  playerId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  changeSummary: z.string().optional(),
  sources: z
    .array(
      z.object({
        sourceName: z.string(),
        sourceUrl: z.string(),
        sourceType: z.nativeEnum(SourceType),
        notes: z.string().optional(),
      })
    )
    .optional(),
});

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const article = await contributorService.getArticleDetail(user.id, id);

    // STRICT IDOR: Returns 404/403 if article doesn't exist or doesn't belong to contributor
    if (!article) {
      return NextResponse.json(
        { success: false, error: "Article not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: article,
    });
  } catch (error: any) {
    console.error("[API GET /api/contributor/articles/:id Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to retrieve article" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    const parsed = updateArticleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const updated = await contributorService.updateArticleDraft(
      user.id,
      id,
      parsed.data
    );

    return NextResponse.json({
      success: true,
      message: "Article draft saved successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("[API PATCH /api/contributor/articles/:id Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update article draft" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    await contributorService.deleteArticleDraft(user.id, id);

    return NextResponse.json({
      success: true,
      message: "Article draft deleted successfully",
    });
  } catch (error: any) {
    console.error("[API DELETE /api/contributor/articles/:id Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete article draft" },
      { status: 400 }
    );
  }
}
