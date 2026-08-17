import { prisma } from "@/lib/db";

export class FavoritesService {
  /**
   * Toggles following/favoriting a football club
   */
  public static async toggleFavoriteTeam(userId: string, teamId: string) {
    const existing = await prisma.userFavoriteTeam.findUnique({
      where: { userId_teamId: { userId, teamId } },
    });

    if (existing) {
      await prisma.userFavoriteTeam.delete({ where: { id: existing.id } });
      return { favorited: false };
    }

    await prisma.userFavoriteTeam.create({
      data: { userId, teamId },
    });
    return { favorited: true };
  }

  /**
   * Toggles following/favoriting a player
   */
  public static async toggleFavoritePlayer(userId: string, playerId: string) {
    const existing = await prisma.userFavoritePlayer.findUnique({
      where: { userId_playerId: { userId, playerId } },
    });

    if (existing) {
      await prisma.userFavoritePlayer.delete({ where: { id: existing.id } });
      return { favorited: false };
    }

    await prisma.userFavoritePlayer.create({
      data: { userId, playerId },
    });
    return { favorited: true };
  }

  /**
   * Toggles following/favoriting a league or tournament
   */
  public static async toggleFavoriteCompetition(userId: string, competitionId: string) {
    const existing = await prisma.userFavoriteCompetition.findUnique({
      where: { userId_competitionId: { userId, competitionId } },
    });

    if (existing) {
      await prisma.userFavoriteCompetition.delete({ where: { id: existing.id } });
      return { favorited: false };
    }

    await prisma.userFavoriteCompetition.create({
      data: { userId, competitionId },
    });
    return { favorited: true };
  }

  /**
   * Retrieves all followed entities for a user
   */
  public static async getUserFavorites(userId: string) {
    const [teams, players, competitions] = await Promise.all([
      prisma.userFavoriteTeam.findMany({
        where: { userId },
        include: { team: { select: { id: true, slug: true, name: true, logoUrl: true, tla: true } } },
      }),
      prisma.userFavoritePlayer.findMany({
        where: { userId },
        include: { player: { select: { id: true, slug: true, name: true, photoUrl: true, position: true } } },
      }),
      prisma.userFavoriteCompetition.findMany({
        where: { userId },
        include: { competition: { select: { id: true, slug: true, name: true, logoUrl: true, code: true } } },
      }),
    ]);

    return {
      teams: teams.map((t) => t.team),
      players: players.map((p) => p.player),
      competitions: competitions.map((c) => c.competition),
    };
  }
}
