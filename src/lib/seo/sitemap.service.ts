import { prisma } from "@/lib/db";
import { ArticleStatus, GateStatus } from "@prisma/client";
import { CanonicalService } from "./canonical.service";

export interface SitemapEntry {
  url: string;
  lastModified?: string;
  changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

export interface NewsSitemapEntry {
  url: string;
  title: string;
  publicationName: string;
  publicationLanguage: string;
  publicationDate: string;
  keywords?: string[];
}

export class SitemapService {
  private static readonly PUBLICATION_NAME = "FUTIQ FOOTBALL";
  private static readonly PUBLICATION_LANG = "en";

  /**
   * Generates standard XML sitemap entries for all public, indexable entities
   */
  public static async getGlobalSitemapEntries(): Promise<SitemapEntry[]> {
    const entries: SitemapEntry[] = [
      { url: CanonicalService.getCanonicalUrl("/"), changeFrequency: "hourly", priority: 1.0 },
      { url: CanonicalService.getCanonicalUrl("/transfers"), changeFrequency: "hourly", priority: 0.9 },
      { url: CanonicalService.getCanonicalUrl("/matches"), changeFrequency: "always", priority: 0.9 },
      { url: CanonicalService.getCanonicalUrl("/competitions"), changeFrequency: "daily", priority: 0.8 },
      { url: CanonicalService.getCanonicalUrl("/teams"), changeFrequency: "daily", priority: 0.8 },
      { url: CanonicalService.getCanonicalUrl("/players"), changeFrequency: "weekly", priority: 0.7 },
    ];

    try {
      // Fetch published indexable articles
      const articles = await prisma.article.findMany({
        where: {
          status: ArticleStatus.PUBLISHED,
          gateStatus: { not: GateStatus.REJECTED },
        },
        select: { slug: true, updatedAt: true, publishedAt: true },
        orderBy: { publishedAt: "desc" },
        take: 1000,
      });

      for (const art of articles) {
        entries.push({
          url: CanonicalService.getCanonicalUrl(`/news/${art.slug}`),
          lastModified: (art.updatedAt || art.publishedAt || new Date()).toISOString(),
          changeFrequency: "daily",
          priority: 0.8,
        });
      }

      // Fetch teams
      const teams = await prisma.team.findMany({
        select: { slug: true, updatedAt: true },
        take: 500,
      });
      for (const team of teams) {
        entries.push({
          url: CanonicalService.getCanonicalUrl(`/teams/${team.slug}`),
          lastModified: team.updatedAt.toISOString(),
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }

      // Fetch competitions
      const competitions = await prisma.competition.findMany({
        select: { slug: true, updatedAt: true },
        take: 100,
      });
      for (const comp of competitions) {
        entries.push({
          url: CanonicalService.getCanonicalUrl(`/competitions/${comp.slug}`),
          lastModified: comp.updatedAt.toISOString(),
          changeFrequency: "daily",
          priority: 0.8,
        });
      }
    } catch (err) {
      console.warn("[Sitemap generation fallback]:", err);
    }

    return entries;
  }

  /**
   * Generates Google News XML sitemap entries (articles published within the last 48 hours)
   */
  public static async getNewsSitemapEntries(): Promise<NewsSitemapEntry[]> {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 3600 * 1000);

    try {
      const newsArticles = await prisma.article.findMany({
        where: {
          status: ArticleStatus.PUBLISHED,
          gateStatus: { not: GateStatus.REJECTED },
          publishedAt: { gte: fortyEightHoursAgo },
        },
        select: {
          slug: true,
          title: true,
          publishedAt: true,
          tags: true,
          category: true,
        },
        orderBy: { publishedAt: "desc" },
        take: 250,
      });

      return newsArticles.map((art) => ({
        url: CanonicalService.getCanonicalUrl(`/news/${art.slug}`),
        title: art.title,
        publicationName: this.PUBLICATION_NAME,
        publicationLanguage: this.PUBLICATION_LANG,
        publicationDate: (art.publishedAt || new Date()).toISOString(),
        keywords: Array.isArray(art.tags) ? (art.tags as string[]) : [art.category],
      }));
    } catch (err) {
      console.warn("[News sitemap generation fallback]:", err);
      return [];
    }
  }
}
