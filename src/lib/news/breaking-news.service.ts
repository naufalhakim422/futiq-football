import { prisma } from "@/lib/db";
import { ArticleStatus, GateStatus } from "@prisma/client";

export type NewsPriority = "NORMAL" | "IMPORTANT" | "BREAKING";

export interface BreakingAlert {
  id: string;
  headline: string;
  priority: NewsPriority;
  sourceType: "MATCH_EVENT" | "TRANSFER" | "EDITORIAL" | "SYSTEM";
  entityName?: string;
  timestamp: string;
  suggestedSlug?: string;
  isPublished: boolean;
}

export class BreakingNewsService {
  /**
   * Retrieves active published breaking news banner items for public frontend display
   */
  public static async getActiveBreakingNews(limit: number = 3) {
    const twelveHoursAgo = new Date(Date.now() - 12 * 3600 * 1000);

    return await prisma.article.findMany({
      where: {
        isBreaking: true,
        status: ArticleStatus.PUBLISHED,
        gateStatus: { not: GateStatus.REJECTED },
        publishedAt: { gte: twelveHoursAgo },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
    });
  }

  /**
   * Evaluates football match / transfer event urgency without auto-publishing unverified articles
   */
  public static evaluateEventUrgency(params: {
    eventType: string; // "RED_CARD" | "GOAL" | "TRANSFER_COMPLETED" | "MANAGER_DISMISSED"
    competitionName?: string;
    isFinalOrDerby?: boolean;
    transferFeeEur?: number;
  }): NewsPriority {
    const { eventType, isFinalOrDerby, transferFeeEur } = params;

    // High impact breaking triggers
    if (eventType === "MANAGER_DISMISSED") {
      return "BREAKING";
    }

    if (eventType === "TRANSFER_COMPLETED" && transferFeeEur && transferFeeEur >= 50_000_000) {
      return "BREAKING";
    }

    if (eventType === "RED_CARD" && isFinalOrDerby) {
      return "IMPORTANT";
    }

    if (eventType === "TRANSFER_COMPLETED") {
      return "IMPORTANT";
    }

    return "NORMAL";
  }
}
