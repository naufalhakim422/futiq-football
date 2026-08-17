import { prisma } from "@/lib/db";
import { FavoritesService } from "./favorites.service";
import { ArticleStatus, GateStatus } from "@prisma/client";

export class PersonalizedFeedService {
  /**
   * Generates a deterministic personalized article feed tailored to followed clubs, players, and leagues
   */
  public static async getPersonalizedFeed(userId: string, limit: number = 10) {
    const favorites = await FavoritesService.getUserFavorites(userId);

    const teamIds = favorites.teams.map((t) => t.id);
    const playerIds = favorites.players.map((p) => p.id);
    const competitionIds = favorites.competitions.map((c) => c.id);

    const orConditions: any[] = [];
    if (teamIds.length > 0) orConditions.push({ teamId: { in: teamIds } });
    if (playerIds.length > 0) orConditions.push({ playerId: { in: playerIds } });
    if (competitionIds.length > 0) orConditions.push({ competitionId: { in: competitionIds } });

    const where: any = {
      status: ArticleStatus.PUBLISHED,
      gateStatus: { not: GateStatus.REJECTED },
    };

    if (orConditions.length > 0) {
      where.OR = orConditions;
    }

    const articles = await prisma.article.findMany({
      where,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        featuredImageUrl: true,
        category: true,
        isBreaking: true,
        publishedAt: true,
        team: { select: { id: true, name: true, slug: true } },
        player: { select: { id: true, name: true, slug: true } },
        competition: { select: { id: true, name: true, slug: true } },
        author: { select: { fullName: true } },
        contributorProfile: { select: { displayName: true } },
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
    });

    return {
      personalized: orConditions.length > 0,
      followedEntitiesCount: teamIds.length + playerIds.length + competitionIds.length,
      articles,
    };
  }
}
