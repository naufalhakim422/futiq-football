export class StructuredDataService {
  private static readonly DOMAIN = process.env.NEXT_PUBLIC_APP_URL || "https://football.example.com";
  private static readonly ORG_NAME = "FUTIQ FOOTBALL";
  private static readonly ORG_LOGO = "https://football.example.com/logo.png";

  /**
   * Organization JSON-LD
   */
  public static getOrganizationSchema() {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: this.ORG_NAME,
      url: this.DOMAIN,
      logo: this.ORG_LOGO,
      sameAs: [
        "https://twitter.com/futiqfootball",
        "https://instagram.com/futiqfootball",
      ],
    };
  }

  /**
   * WebSite & SearchAction JSON-LD
   */
  public static getWebSiteSchema() {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: this.ORG_NAME,
      url: this.DOMAIN,
      potentialAction: {
        "@type": "SearchAction",
        target: `${this.DOMAIN}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    };
  }

  /**
   * BreadcrumbList JSON-LD
   */
  public static getBreadcrumbSchema(items: { name: string; url: string }[]) {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url.startsWith("http") ? item.url : `${this.DOMAIN}${item.url.startsWith("/") ? item.url : `/${item.url}`}`,
      })),
    };
  }

  /**
   * NewsArticle / Article JSON-LD
   */
  public static getNewsArticleSchema(article: {
    headline: string;
    description: string;
    url: string;
    imageUrl?: string | null;
    datePublished: string;
    dateModified?: string | null;
    authorName: string;
    authorUrl?: string | null;
    category?: string;
    isNews?: boolean;
  }) {
    return {
      "@context": "https://schema.org",
      "@type": article.isNews ? "NewsArticle" : "Article",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": article.url,
      },
      headline: article.headline,
      description: article.description,
      image: article.imageUrl ? [article.imageUrl] : [`${this.DOMAIN}/images/og-default.jpg`],
      datePublished: article.datePublished,
      dateModified: article.dateModified || article.datePublished,
      articleSection: article.category || "Football News",
      author: {
        "@type": "Person",
        name: article.authorName,
        url: article.authorUrl || undefined,
      },
      publisher: {
        "@type": "Organization",
        name: this.ORG_NAME,
        logo: {
          "@type": "ImageObject",
          url: this.ORG_LOGO,
        },
      },
    };
  }

  /**
   * SportsTeam JSON-LD
   */
  public static getSportsTeamSchema(team: {
    name: string;
    url: string;
    logoUrl?: string | null;
    stadiumName?: string | null;
    leagueName?: string | null;
  }) {
    return {
      "@context": "https://schema.org",
      "@type": "SportsTeam",
      name: team.name,
      url: team.url,
      logo: team.logoUrl || undefined,
      location: team.stadiumName
        ? {
            "@type": "Place",
            name: team.stadiumName,
          }
        : undefined,
      memberOf: team.leagueName
        ? {
            "@type": "SportsOrganization",
            name: team.leagueName,
          }
        : undefined,
    };
  }

  /**
   * Person / Player JSON-LD
   */
  public static getPlayerSchema(player: {
    name: string;
    url: string;
    photoUrl?: string | null;
    nationality?: string | null;
    teamName?: string | null;
  }) {
    return {
      "@context": "https://schema.org",
      "@type": "Person",
      name: player.name,
      url: player.url,
      image: player.photoUrl || undefined,
      nationality: player.nationality
        ? {
            "@type": "Country",
            name: player.nationality,
          }
        : undefined,
      memberOf: player.teamName
        ? {
            "@type": "SportsTeam",
            name: player.teamName,
          }
        : undefined,
    };
  }

  /**
   * SportsEvent / Match JSON-LD
   */
  public static getSportsEventSchema(match: {
    homeTeamName: string;
    awayTeamName: string;
    startDate: string;
    url: string;
    venueName?: string | null;
    competitionName?: string | null;
    homeScore?: number | null;
    awayScore?: number | null;
  }) {
    return {
      "@context": "https://schema.org",
      "@type": "SportsEvent",
      name: `${match.homeTeamName} vs ${match.awayTeamName}`,
      startDate: match.startDate,
      url: match.url,
      competitor: [
        { "@type": "SportsTeam", name: match.homeTeamName },
        { "@type": "SportsTeam", name: match.awayTeamName },
      ],
      location: match.venueName
        ? {
            "@type": "Place",
            name: match.venueName,
          }
        : undefined,
    };
  }
}
