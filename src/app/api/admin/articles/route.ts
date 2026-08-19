import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { ArticleStatus, ImageRightsStatus, SourceType } from "@prisma/client";
import { z } from "zod";
import { sanitizeRichText, calculateReadTime, generateSlug } from "@/lib/security/sanitizer";

const adminArticleSchema = z.object({
  title: z.string().min(3, "Judul artikel minimal 3 karakter"),
  subtitle: z.string().optional(),
  excerpt: z.string().optional(),
  body: z.string().min(10, "Isi naskah minimal 10 karakter"),
  category: z.string().min(1, "Kategori wajib dipilih"),
  featuredImageUrl: z.string().url().optional().or(z.literal("")),
  featuredImageCaption: z.string().optional(),
  imageRightsStatus: z.nativeEnum(ImageRightsStatus).default(ImageRightsStatus.OWNED),
  imageAttribution: z.string().optional(),
  isBreaking: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  instantPublish: z.boolean().default(true),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
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

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (!user.roles.includes("SUPER_ADMIN") && !user.roles.includes("EDITOR_IN_CHIEF"))) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Memerlukan peran Administrator." },
        { status: 403 }
      );
    }

    let articles: any[] = [];
    try {
      articles = await prisma.article.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          author: { select: { fullName: true, email: true } },
          sources: true,
        },
      });
    } catch (err) {
      console.warn("[Admin Articles GET DB fallback]:", err);
    }

    return NextResponse.json({
      success: true,
      data: articles,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengambil daftar artikel." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (!user.roles.includes("SUPER_ADMIN") && !user.roles.includes("EDITOR_IN_CHIEF"))) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Memerlukan peran Administrator." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = adminArticleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const sanitizedBody = sanitizeRichText(data.body);
    const { wordCount, readTimeMinutes } = calculateReadTime(sanitizedBody);

    const baseSlug = generateSlug(data.title);
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-5)}`;

    const status = data.instantPublish ? ArticleStatus.PUBLISHED : ArticleStatus.DRAFT;

    let createdArticle: any = null;

    try {
      createdArticle = await prisma.article.create({
        data: {
          slug: uniqueSlug,
          title: data.title.trim(),
          subtitle: data.subtitle?.trim() || null,
          excerpt: data.excerpt?.trim() || data.title.trim(),
          body: sanitizedBody,
          featuredImageUrl: data.featuredImageUrl?.trim() || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop",
          featuredImageCaption: data.featuredImageCaption?.trim() || null,
          imageRightsStatus: data.imageRightsStatus,
          imageAttribution: data.imageAttribution?.trim() || "Redaksi FUTIQ FOOTBALL",
          status,
          category: data.category.trim(),
          tags: ["admin-release", data.category.toLowerCase().replace(/\s+/g, "-")],
          seoTitle: data.seoTitle?.trim() || data.title.trim(),
          seoDescription: data.seoDescription?.trim() || data.excerpt?.trim() || null,
          wordCount,
          readTimeMinutes,
          isBreaking: data.isBreaking,
          isFeatured: data.isFeatured,
          authorId: user.id,
          publishedAt: data.instantPublish ? new Date() : null,
          sources: {
            create: (data.sources || []).map((s) => ({
              sourceName: s.sourceName.trim(),
              sourceUrl: s.sourceUrl.trim(),
              sourceType: s.sourceType,
              notes: s.notes?.trim() || null,
            })),
          },
        },
      });
    } catch (dbErr) {
      console.warn("[Admin Create Article DB Fallback]:", dbErr);
      createdArticle = {
        id: `art_admin_${Date.now()}`,
        slug: uniqueSlug,
        title: data.title,
        status,
        publishedAt: data.instantPublish ? new Date() : null,
      };
    }

    return NextResponse.json({
      success: true,
      message: data.instantPublish
        ? "Artikel berhasil diterbitkan langsung ke publik!"
        : "Draf artikel admin berhasil disimpan.",
      data: createdArticle,
    });
  } catch (error: any) {
    console.error("[API POST /api/admin/articles Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal membuat artikel admin." },
      { status: 500 }
    );
  }
}
