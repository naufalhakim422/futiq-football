import { ArticleStatus, GateStatus } from "@prisma/client";

export interface IndexabilityCheckParams {
  type:
    | "homepage"
    | "article"
    | "team"
    | "player"
    | "competition"
    | "match"
    | "transfer"
    | "search"
    | "admin"
    | "editor"
    | "contributor"
    | "api"
    | "static";
  status?: string | null;
  gateStatus?: string | null;
  isPrivate?: boolean;
  hasNoIndexFlag?: boolean;
}

export class RobotsService {
  /**
   * Evaluates if a given resource or route is safe and permitted for search engine indexing
   */
  public static isIndexable(params: IndexabilityCheckParams): boolean {
    const { type, status, gateStatus, isPrivate, hasNoIndexFlag } = params;

    if (hasNoIndexFlag || isPrivate) return false;

    // Private operational panels are strictly noindex
    if (["admin", "editor", "contributor", "api"].includes(type)) {
      return false;
    }

    // Internal search pages are noindex by default to prevent crawl-space bloat & search spam
    if (type === "search") {
      return false;
    }

    // Public entity routes are indexable
    if (["homepage", "team", "player", "competition", "match", "transfer", "static"].includes(type)) {
      return true;
    }

    // Articles: Only PUBLISHED and non-rejected gate articles may be indexed
    if (type === "article") {
      const isPublished = status === ArticleStatus.PUBLISHED;
      const isGateCleared = gateStatus === GateStatus.PASSED || gateStatus === GateStatus.REVIEW;
      return isPublished && isGateCleared;
    }

    return false;
  }

  /**
   * Generates standard Next.js Metadata robots directive object
   */
  public static getRobotsDirectives(isIndexable: boolean) {
    if (!isIndexable) {
      return {
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
          index: false,
          follow: false,
          noimageindex: true,
          "max-video-preview": -1,
          "max-image-preview": "none" as const,
          "max-snippet": -1,
        },
      };
    }

    return {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large" as const,
        "max-snippet": -1,
      },
    };
  }
}
