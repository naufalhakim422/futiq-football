import { prisma } from "@/lib/db";
import { ArticleStatus, GateStatus } from "@prisma/client";
import { CanonicalService } from "./canonical.service";

export interface RssItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  author?: string;
  category?: string;
  guid?: string;
}

export class RssService {
  private static readonly DOMAIN = process.env.NEXT_PUBLIC_APP_URL || "https://football.example.com";
  private static readonly SITE_TITLE = "Football Media Platform";
  private static readonly SITE_DESC = "In-depth football journalism, real-time news, tactical analysis and transfer updates.";

  public static async generateRssFeed(options?: { category?: string; limit?: number }): Promise<string> {
    const where: any = {
      status: ArticleStatus.PUBLISHED,
      gateStatus: { not: GateStatus.REJECTED },
    };

    if (options?.category) {
      where.category = options.category;
    }

    let articles: any[] = [];
    try {
      articles = await prisma.article.findMany({
        where,
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          category: true,
          publishedAt: true,
          author: { select: { fullName: true } },
          contributorProfile: { select: { displayName: true } },
        },
        orderBy: { publishedAt: "desc" },
        take: options?.limit || 50,
      });
    } catch (err) {
      console.warn("[RSS feed generation fallback]:", err);
    }

    const itemsXml = articles
      .map((a) => {
        const link = CanonicalService.getCanonicalUrl(`/news/${a.slug}`);
        const author = a.contributorProfile?.displayName || a.author?.fullName || "Football Media Platform";
        const date = (a.publishedAt || new Date()).toUTCString();

        return `    <item>
      <title>${this.escapeCdata(a.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${this.escapeCdata(a.excerpt)}</description>
      <category>${this.escapeXml(a.category)}</category>
      <author>${this.escapeXml(author)}</author>
      <pubDate>${date}</pubDate>
    </item>`;
      })
      .join("\n");

    const channelTitle = options?.category
      ? `${this.SITE_TITLE} — ${options.category}`
      : this.SITE_TITLE;

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${this.escapeXml(channelTitle)}</title>
    <link>${this.DOMAIN}</link>
    <description>${this.escapeXml(this.SITE_DESC)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${this.DOMAIN}/rss.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;
  }

  private static escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case "&":
          return "&amp;";
        case "'":
          return "&apos;";
        case '"':
          return "&quot;";
        default:
          return c;
      }
    });
  }

  private static escapeCdata(str: string): string {
    return `<![CDATA[${str.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
  }
}
