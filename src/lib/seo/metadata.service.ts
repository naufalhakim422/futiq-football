import { Metadata } from "next";
import { CanonicalService } from "./canonical.service";
import { RobotsService } from "./robots.service";
import { OpenGraphService } from "./open-graph.service";

export class MetadataService {
  private static readonly BRAND_NAME = "Football Media Platform";
  private static readonly DEFAULT_DESC =
    "In-depth football journalism, real-time live scores, tactical breakdowns, transfer rumors, and statistics across world football.";

  public static getHomeMetadata(): Metadata {
    const title = `Live Football Scores, Breaking News & Tactical Analysis | ${this.BRAND_NAME}`;
    const description = this.DEFAULT_DESC;
    const url = CanonicalService.getCanonicalUrl("/");
    const robots = RobotsService.getRobotsDirectives(true);
    const { openGraph, twitter } = OpenGraphService.buildMetadata({
      title,
      description,
      url,
      type: "website",
    });

    return {
      title,
      description,
      alternates: { canonical: url },
      robots,
      openGraph,
      twitter,
    };
  }

  public static getArticleMetadata(article: {
    title: string;
    excerpt: string;
    slug: string;
    featuredImageUrl?: string | null;
    status: string;
    gateStatus: string;
    category?: string;
    tags?: string[];
    authorName?: string;
    publishedAt?: Date | string | null;
    updatedAt?: Date | string | null;
  }): Metadata {
    const title = `${article.title} | ${this.BRAND_NAME}`;
    const description = article.excerpt || this.DEFAULT_DESC;
    const url = CanonicalService.getCanonicalUrl(`/news/${article.slug}`);
    const isIndexable = RobotsService.isIndexable({
      type: "article",
      status: article.status,
      gateStatus: article.gateStatus,
    });
    const robots = RobotsService.getRobotsDirectives(isIndexable);

    const { openGraph, twitter } = OpenGraphService.buildMetadata({
      title,
      description,
      url,
      type: "article",
      image: article.featuredImageUrl ? { url: article.featuredImageUrl, alt: article.title } : undefined,
      publishedTime: article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined,
      modifiedTime: article.updatedAt ? new Date(article.updatedAt).toISOString() : undefined,
      authors: article.authorName ? [article.authorName] : undefined,
      section: article.category,
      tags: article.tags,
    });

    return {
      title,
      description,
      alternates: { canonical: url },
      robots,
      openGraph,
      twitter,
    };
  }

  public static getTeamMetadata(team: { name: string; slug: string; logoUrl?: string | null; country?: string }): Metadata {
    const title = `${team.name} — News, Fixtures, Results & Squad | ${this.BRAND_NAME}`;
    const description = `Latest ${team.name} football news, live match results, upcoming fixtures, squad stats, and transfer rumors.`;
    const url = CanonicalService.getCanonicalUrl(`/teams/${team.slug}`);
    const robots = RobotsService.getRobotsDirectives(true);

    const { openGraph, twitter } = OpenGraphService.buildMetadata({
      title,
      description,
      url,
      image: team.logoUrl ? { url: team.logoUrl, alt: `${team.name} Logo` } : undefined,
    });

    return {
      title,
      description,
      alternates: { canonical: url },
      robots,
      openGraph,
      twitter,
    };
  }

  public static getPlayerMetadata(player: { name: string; slug: string; photoUrl?: string | null; nationality?: string }): Metadata {
    const title = `${player.name} — Profile, Stats & News | ${this.BRAND_NAME}`;
    const description = `Explore ${player.name}'s football career statistics, match ratings, transfer history, and latest player news.`;
    const url = CanonicalService.getCanonicalUrl(`/players/${player.slug}`);
    const robots = RobotsService.getRobotsDirectives(true);

    const { openGraph, twitter } = OpenGraphService.buildMetadata({
      title,
      description,
      url,
      image: player.photoUrl ? { url: player.photoUrl, alt: player.name } : undefined,
    });

    return {
      title,
      description,
      alternates: { canonical: url },
      robots,
      openGraph,
      twitter,
    };
  }

  public static getCompetitionMetadata(comp: { name: string; slug: string; logoUrl?: string | null }): Metadata {
    const title = `${comp.name} — Fixtures, Results, Table & News | ${this.BRAND_NAME}`;
    const description = `Comprehensive ${comp.name} coverage: live league table, latest scores, upcoming fixtures, and top scorer statistics.`;
    const url = CanonicalService.getCanonicalUrl(`/competitions/${comp.slug}`);
    const robots = RobotsService.getRobotsDirectives(true);

    const { openGraph, twitter } = OpenGraphService.buildMetadata({
      title,
      description,
      url,
      image: comp.logoUrl ? { url: comp.logoUrl, alt: `${comp.name} Emblem` } : undefined,
    });

    return {
      title,
      description,
      alternates: { canonical: url },
      robots,
      openGraph,
      twitter,
    };
  }

  public static getMatchMetadata(match: { homeTeamName: string; awayTeamName: string; id: string }): Metadata {
    const title = `${match.homeTeamName} vs ${match.awayTeamName} — Live Score, Result & Stats | ${this.BRAND_NAME}`;
    const description = `Live score updates, real-time commentary, starting lineups, and match stats for ${match.homeTeamName} vs ${match.awayTeamName}.`;
    const url = CanonicalService.getCanonicalUrl(`/matches/${match.id}`);
    const robots = RobotsService.getRobotsDirectives(true);

    const { openGraph, twitter } = OpenGraphService.buildMetadata({
      title,
      description,
      url,
    });

    return {
      title,
      description,
      alternates: { canonical: url },
      robots,
      openGraph,
      twitter,
    };
  }

  public static getTransfersMetadata(): Metadata {
    const title = `Football Transfer News, Rumors & Completed Deals | ${this.BRAND_NAME}`;
    const description = "Latest confirmed transfer deals, loan agreements, fee values, and rumors across global football leagues.";
    const url = CanonicalService.getCanonicalUrl("/transfers");
    const robots = RobotsService.getRobotsDirectives(true);

    const { openGraph, twitter } = OpenGraphService.buildMetadata({
      title,
      description,
      url,
    });

    return {
      title,
      description,
      alternates: { canonical: url },
      robots,
      openGraph,
      twitter,
    };
  }

  public static getSearchMetadata(query?: string): Metadata {
    const title = query
      ? `Search results for "${query}" | ${this.BRAND_NAME}`
      : `Search Football News, Teams & Matches | ${this.BRAND_NAME}`;
    const description = "Search across articles, teams, players, competitions, and transfer records.";
    const url = CanonicalService.getCanonicalUrl(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
    const robots = RobotsService.getRobotsDirectives(false); // Noindex search results

    return {
      title,
      description,
      alternates: { canonical: url },
      robots,
    };
  }
}
