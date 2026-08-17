import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { ArticleStatus, GateStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const isAuthorized = user.roles.some((r) =>
      ["SUPER_ADMIN", "EDITOR_IN_CHIEF", "SENIOR_EDITOR"].includes(r)
    );
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden: Editorial or Admin role required." }, { status: 403 });
    }

    let totalArticles = 0;
    let indexableArticles = 0;
    let breakingArticles = 0;
    let totalRedirects = 0;
    let settings: any = null;

    try {
      const results = await Promise.all([
        prisma.article.count(),
        prisma.article.count({
          where: {
            status: ArticleStatus.PUBLISHED,
            gateStatus: { not: GateStatus.REJECTED },
          },
        }),
        prisma.article.count({ where: { isBreaking: true } }),
        prisma.urlRedirect.count(),
        prisma.seoGlobalSetting.findFirst(),
      ]);

      totalArticles = results[0];
      indexableArticles = results[1];
      breakingArticles = results[2];
      totalRedirects = results[3];
      settings = results[4];
    } catch (dbErr) {
      console.warn("[Admin SEO API DB fallback]:", dbErr);
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalArticles,
        indexableArticles,
        breakingArticles,
        totalRedirects,
        sitemapUrl: "/sitemap.xml",
        newsSitemapUrl: "/news-sitemap.xml",
        rssUrl: "/rss.xml",
        robotsUrl: "/robots.txt",
      },
      settings: settings || {
        siteName: "FUTIQ FOOTBALL",
        defaultTitle: "FUTIQ FOOTBALL | Live Scores, News & Tactical Analysis",
        canonicalDomain: "https://football.example.com",
        isDiscoverOptimized: true,
      },
    });
  } catch (error) {
    console.error("[SEO Overview Error]:", error);
    return NextResponse.json({ error: "Failed to load SEO overview." }, { status: 500 });
  }
}
