import { prisma } from "@/lib/db";
import { ArticleStatus, GateStatus } from "@prisma/client";

export class RelatedArticlesService {
  /**
   * Retrieves high-relevance related articles based on category, team, player, competition, and tag overlap
   */
  public static async getRelatedArticles(params: {
    currentArticleId: string;
    category?: string;
    teamId?: string | null;
    playerId?: string | null;
    competitionId?: string | null;
    tags?: string[];
    limit?: number;
  }) {
    const { currentArticleId, category, teamId, playerId, competitionId, limit = 4 } = params;

    // Build multi-factor OR conditions
    const orConditions: any[] = [];

    if (teamId) {
      orConditions.push({ teamId });
    }
    if (playerId) {
      orConditions.push({ playerId });
    }
    if (competitionId) {
      orConditions.push({ competitionId });
    }
    if (category) {
      orConditions.push({ category });
    }

    const where: any = {
      id: { not: currentArticleId },
      status: ArticleStatus.PUBLISHED,
      gateStatus: { not: GateStatus.REJECTED },
    };

    if (orConditions.length > 0) {
      where.OR = orConditions;
    }

    const candidates = await prisma.article.findMany({
      where,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        featuredImageUrl: true,
        category: true,
        publishedAt: true,
        teamId: true,
        playerId: true,
        competitionId: true,
        author: { select: { fullName: true } },
        contributorProfile: { select: { displayName: true } },
      },
      orderBy: { publishedAt: "desc" },
      take: limit * 3, // Fetch buffer to score relevance
    });

    // Score candidates by match quality
    const scored = candidates.map((art) => {
      let score = 0;
      if (teamId && art.teamId === teamId) score += 35;
      if (playerId && art.playerId === playerId) score += 30;
      if (competitionId && art.competitionId === competitionId) score += 20;
      if (category && art.category === category) score += 15;

      return { ...art, relevanceScore: score };
    });

    // Sort by relevance score, then recency
    scored.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return scored.slice(0, limit);
  }
}
