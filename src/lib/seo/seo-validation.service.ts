export interface DiscoverReadinessReport {
  isReady: boolean;
  score: number; // 0 to 100
  checks: {
    name: string;
    passed: boolean;
    recommendation?: string;
  }[];
}

export class SeoValidationService {
  /**
   * Validates an article against Google Discover best-practice readiness checklist
   */
  public static auditArticleForDiscover(article: {
    title: string;
    excerpt: string;
    body: string;
    featuredImageUrl?: string | null;
    imageWidth?: number | null;
    authorName?: string | null;
    publishedAt?: Date | string | null;
  }): DiscoverReadinessReport {
    const checks = [];

    // 1. Title Quality & Length (Optimal: 40-80 chars)
    const titleLen = article.title?.trim().length || 0;
    const titlePassed = titleLen >= 30 && titleLen <= 90;
    checks.push({
      name: "Compelling & Descriptive Title Length",
      passed: titlePassed,
      recommendation: titlePassed
        ? undefined
        : `Current title length is ${titleLen} chars. Recommended: 30 to 90 chars without clickbait.`,
    });

    // 2. High-Resolution Featured Image (Google Discover requires min 1200px width)
    const hasImage = Boolean(article.featuredImageUrl);
    const hasHighRes = article.imageWidth ? article.imageWidth >= 1200 : true; // Assume true if not explicitly measured
    const imagePassed = hasImage && hasHighRes;
    checks.push({
      name: "High-Resolution Lead Image (>= 1200px width)",
      passed: imagePassed,
      recommendation: imagePassed
        ? undefined
        : "Lead image should be high quality and at least 1200px wide for Discover visual cards.",
    });

    // 3. Clear Excerpt / Summary (Optimal: 100-180 chars)
    const excerptLen = article.excerpt?.trim().length || 0;
    const excerptPassed = excerptLen >= 60 && excerptLen <= 250;
    checks.push({
      name: "Rich Excerpt & Meta Summary",
      passed: excerptPassed,
      recommendation: excerptPassed
        ? undefined
        : `Excerpt is ${excerptLen} chars. Recommended: 60 to 250 chars.`,
    });

    // 4. Content Substantiality & Word Count (Min 300 words)
    const words = article.body ? article.body.trim().split(/\s+/).length : 0;
    const wordsPassed = words >= 250;
    checks.push({
      name: "Substantial Body Depth (>= 250 words)",
      passed: wordsPassed,
      recommendation: wordsPassed
        ? undefined
        : `Word count is ${words}. Substantive journalistic reporting is prioritized.`,
    });

    // 5. Author Attribution
    const hasAuthor = Boolean(article.authorName && article.authorName.trim().length > 0);
    checks.push({
      name: "Transparent Author & Journalist Attribution",
      passed: hasAuthor,
      recommendation: hasAuthor ? undefined : "Article must clearly disclose the byline author.",
    });

    // 6. Publication Timestamp
    const hasTimestamp = Boolean(article.publishedAt);
    checks.push({
      name: "Verifiable Publication Date",
      passed: hasTimestamp,
      recommendation: hasTimestamp ? undefined : "Article must provide a machine-readable publication timestamp.",
    });

    const passedCount = checks.filter((c) => c.passed).length;
    const score = Math.round((passedCount / checks.length) * 100);
    const isReady = score >= 80;

    return {
      isReady,
      score,
      checks,
    };
  }
}
