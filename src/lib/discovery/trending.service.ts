import { prisma } from "@/lib/db";
import { getCachedData, setCachedData } from "@/lib/redis";
import { ArticleStatus, GateStatus } from "@prisma/client";

export class TrendingService {
  private static readonly CACHE_KEY = "football:trending:articles:v1";
  private static readonly CACHE_TTL = 300; // 5 minutes

  /**
   * Computes deterministic trending score for an article based on recency, readership, engagement, and event importance
   */
  public static calculateTrendScore(params: {
    publishedAt: Date | string | null;
    viewsCount: number;
    qualifiedReadsCount: number;
    sharesCount: number;
    isBreaking: boolean;
  }): number {
    const pubDate = params.publishedAt ? new Date(params.publishedAt).getTime() : Date.now();
    const ageInHours = Math.max(0, (Date.now() - pubDate) / (1000 * 3600));

    // Exponential recency decay (72-hour half-life)
    const recencyMultiplier = Math.pow(0.5, ageInHours / 72);

    // Engagement components
    const viewPoints = params.viewsCount * 1.0;
    const qualifiedReadPoints = params.qualifiedReadsCount * 3.5; // High value on finished reads
    const sharePoints = params.sharesCount * 5.0; // High value on organic distribution
    const breakingBonus = params.isBreaking ? 50.0 : 0.0;

    const rawActivityScore = viewPoints + qualifiedReadPoints + sharePoints + breakingBonus;
    const finalScore = rawActivityScore * recencyMultiplier;

    return Math.round(finalScore * 100) / 100;
  }

  /**
   * Returns top trending articles with fast Redis caching fallback to database
   */
  public static async getTrendingArticles(limit: number = 6) {
    const cached = await getCachedData<any[]>(this.CACHE_KEY);
    if (cached && cached.length >= limit) {
      return cached.slice(0, limit);
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);

    const candidates = await prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        gateStatus: { not: GateStatus.REJECTED },
        publishedAt: { gte: sevenDaysAgo },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        featuredImageUrl: true,
        category: true,
        isBreaking: true,
        publishedAt: true,
        author: { select: { fullName: true } },
        contributorProfile: { select: { displayName: true } },
        articleAnalytics: {
          select: { viewsCount: true, readsCount: true },
        },
      },
      take: 100,
    });

    const scored = candidates.map((art) => {
      const totalViews = art.articleAnalytics.reduce((sum, a) => sum + a.viewsCount, 0);
      const totalReads = art.articleAnalytics.reduce((sum, a) => sum + a.readsCount, 0);

      const trendScore = this.calculateTrendScore({
        publishedAt: art.publishedAt,
        viewsCount: totalViews,
        qualifiedReadsCount: totalReads,
        sharesCount: 0,
        isBreaking: art.isBreaking,
      });

      return {
        id: art.id,
        slug: art.slug,
        title: art.title,
        excerpt: art.excerpt,
        featuredImageUrl: art.featuredImageUrl,
        category: art.category,
        isBreaking: art.isBreaking,
        publishedAt: art.publishedAt,
        authorName: art.contributorProfile?.displayName || art.author.fullName,
        views: totalViews,
        trendScore,
      };
    });

    scored.sort((a, b) => b.trendScore - a.trendScore);
    const results = scored.slice(0, limit);

    await setCachedData(this.CACHE_KEY, results, this.CACHE_TTL);
    return results;
  }
}
