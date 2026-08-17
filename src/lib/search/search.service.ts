import { prisma } from "@/lib/db";
import { ArticleStatus, GateStatus } from "@prisma/client";

export interface SearchResultItem {
  id: string;
  type: "ARTICLE" | "TEAM" | "PLAYER" | "COMPETITION" | "TRANSFER";
  title: string;
  subtitle?: string | null;
  url: string;
  imageUrl?: string | null;
  relevanceScore: number;
}

export interface SearchResponse {
  query: string;
  totalResults: number;
  items: SearchResultItem[];
}

export class SearchService {
  /**
   * Performs ranked multi-entity search across Articles, Teams, Players, Competitions, and Transfers
   */
  public static async executeSearch(rawQuery: string, limit: number = 20): Promise<SearchResponse> {
    const query = rawQuery.trim();
    if (!query || query.length < 2) {
      return { query, totalResults: 0, items: [] };
    }

    const cleanQuery = query.slice(0, 80); // Protect against huge query strings

    // Run parallel queries across indexable entities
    const [articles, teams, players, competitions] = await Promise.all([
      prisma.article.findMany({
        where: {
          status: ArticleStatus.PUBLISHED,
          gateStatus: { not: GateStatus.REJECTED },
          OR: [
            { title: { contains: cleanQuery, mode: "insensitive" } },
            { excerpt: { contains: cleanQuery, mode: "insensitive" } },
            { category: { contains: cleanQuery, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          featuredImageUrl: true,
          category: true,
        },
        take: limit,
      }),
      prisma.team.findMany({
        where: {
          OR: [
            { name: { contains: cleanQuery, mode: "insensitive" } },
            { shortName: { contains: cleanQuery, mode: "insensitive" } },
            { tla: { equals: cleanQuery, mode: "insensitive" } },
          ],
        },
        select: { id: true, slug: true, name: true, tla: true, logoUrl: true },
        take: 5,
      }),
      prisma.player.findMany({
        where: {
          OR: [
            { name: { contains: cleanQuery, mode: "insensitive" } },
            { nationality: { contains: cleanQuery, mode: "insensitive" } },
          ],
        },
        select: { id: true, slug: true, name: true, photoUrl: true, position: true },
        take: 5,
      }),
      prisma.competition.findMany({
        where: {
          OR: [
            { name: { contains: cleanQuery, mode: "insensitive" } },
            { code: { equals: cleanQuery, mode: "insensitive" } },
          ],
        },
        select: { id: true, slug: true, name: true, logoUrl: true },
        take: 5,
      }),
    ]);

    const results: SearchResultItem[] = [];

    // Map & score articles
    for (const art of articles) {
      let score = 50;
      const lowerTitle = art.title.toLowerCase();
      const lowerQ = cleanQuery.toLowerCase();
      if (lowerTitle === lowerQ) score += 100;
      else if (lowerTitle.startsWith(lowerQ)) score += 50;
      else if (lowerTitle.includes(lowerQ)) score += 25;

      results.push({
        id: art.id,
        type: "ARTICLE",
        title: art.title,
        subtitle: art.category,
        url: `/news/${art.slug}`,
        imageUrl: art.featuredImageUrl,
        relevanceScore: score,
      });
    }

    // Map & score teams
    for (const team of teams) {
      let score = 70;
      if (team.name.toLowerCase() === cleanQuery.toLowerCase() || team.tla.toLowerCase() === cleanQuery.toLowerCase()) {
        score += 100;
      }
      results.push({
        id: team.id,
        type: "TEAM",
        title: team.name,
        subtitle: `Team (${team.tla})`,
        url: `/teams/${team.slug}`,
        imageUrl: team.logoUrl,
        relevanceScore: score,
      });
    }

    // Map & score players
    for (const player of players) {
      let score = 65;
      if (player.name.toLowerCase() === cleanQuery.toLowerCase()) score += 100;
      results.push({
        id: player.id,
        type: "PLAYER",
        title: player.name,
        subtitle: `Player • ${player.position}`,
        url: `/players/${player.slug}`,
        imageUrl: player.photoUrl,
        relevanceScore: score,
      });
    }

    // Map & score competitions
    for (const comp of competitions) {
      let score = 75;
      if (comp.name.toLowerCase() === cleanQuery.toLowerCase()) score += 100;
      results.push({
        id: comp.id,
        type: "COMPETITION",
        title: comp.name,
        subtitle: "Competition",
        url: `/competitions/${comp.slug}`,
        imageUrl: comp.logoUrl,
        relevanceScore: score,
      });
    }

    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    const finalItems = results.slice(0, limit);

    return {
      query: cleanQuery,
      totalResults: results.length,
      items: finalItems,
    };
  }
}
