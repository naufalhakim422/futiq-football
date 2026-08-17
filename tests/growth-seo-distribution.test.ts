import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CanonicalService } from "../src/lib/seo/canonical.service";
import { RobotsService } from "../src/lib/seo/robots.service";
import { StructuredDataService } from "../src/lib/seo/structured-data.service";
import { SeoValidationService } from "../src/lib/seo/seo-validation.service";
import { TrendingService } from "../src/lib/discovery/trending.service";
import { BreakingNewsService } from "../src/lib/news/breaking-news.service";
import { RedirectService } from "../src/lib/redirects/redirect.service";
import { ArticleStatus, GateStatus } from "@prisma/client";

describe("Sprint 7 — Growth, SEO & Content Distribution Engine Suite", () => {
  /* =========================================================
     1. CANONICAL URL NORMALIZATION TESTS
     ========================================================= */
  describe("1. Canonical URL Engine", () => {
    it("strips marketing & tracking parameters (utm_*, ref, fbclid, gclid)", () => {
      const dirtyUrl = "https://football.example.com/news/arsenal-title?utm_source=twitter&utm_medium=social&ref=discovery&fbclid=IwAR123";
      const canonical = CanonicalService.getCanonicalUrl(dirtyUrl);
      assert.equal(canonical, "https://football.example.com/news/arsenal-title");
    });

    it("strips pagination and sorting query parameters to prevent duplicate indexing", () => {
      const searchUrl = "/teams/arsenal?sort=date&page=2&order=desc";
      const canonical = CanonicalService.getCanonicalUrl(searchUrl, "https://football.example.com");
      assert.equal(canonical, "https://football.example.com/teams/arsenal");
    });

    it("normalizes trailing slashes and multiple consecutive slashes", () => {
      const messyUrl = "/competitions///premier-league/";
      const canonical = CanonicalService.getCanonicalUrl(messyUrl, "https://football.example.com");
      assert.equal(canonical, "https://football.example.com/competitions/premier-league");
    });
  });

  /* =========================================================
     2. ROBOTS & INDEXABILITY SAFETY TESTS
     ========================================================= */
  describe("2. Robots & Indexing Safety", () => {
    it("permits indexing ONLY for published articles with passed AI editorial gate", () => {
      const canIndexPublished = RobotsService.isIndexable({
        type: "article",
        status: ArticleStatus.PUBLISHED,
        gateStatus: GateStatus.PASSED,
      });
      assert.equal(canIndexPublished, true);

      const canIndexDraft = RobotsService.isIndexable({
        type: "article",
        status: ArticleStatus.DRAFT,
        gateStatus: GateStatus.NOT_RUN,
      });
      assert.equal(canIndexDraft, false);

      const canIndexRejected = RobotsService.isIndexable({
        type: "article",
        status: ArticleStatus.REJECTED,
        gateStatus: GateStatus.REJECTED,
      });
      assert.equal(canIndexRejected, false);
    });

    it("strictly forbids search indexing for private management panels and search query pages", () => {
      assert.equal(RobotsService.isIndexable({ type: "admin" }), false);
      assert.equal(RobotsService.isIndexable({ type: "editor" }), false);
      assert.equal(RobotsService.isIndexable({ type: "contributor" }), false);
      assert.equal(RobotsService.isIndexable({ type: "api" }), false);
      assert.equal(RobotsService.isIndexable({ type: "search" }), false);
    });

    it("returns correct noindex robots directive for non-indexable surfaces", () => {
      const directives = RobotsService.getRobotsDirectives(false);
      assert.equal(directives.index, false);
      assert.equal(directives.follow, false);
      assert.equal(directives.nocache, true);
    });
  });

  /* =========================================================
     3. STRUCTURED DATA (JSON-LD) SCHEMA TESTS
     ========================================================= */
  describe("3. Structured Data JSON-LD Schema", () => {
    it("generates valid NewsArticle schema with verified publisher and author", () => {
      const schema = StructuredDataService.getNewsArticleSchema({
        headline: "Arsenal Secure Tactical Triumph",
        description: "Tactical breakdown of the match.",
        url: "https://football.example.com/news/arsenal-triumph",
        datePublished: "2026-08-17T12:00:00Z",
        authorName: "John Analyst",
        category: "Tactical Analysis",
        isNews: true,
      });

      assert.equal(schema["@type"], "NewsArticle");
      assert.equal(schema.headline, "Arsenal Secure Tactical Triumph");
      assert.equal(schema.author.name, "John Analyst");
      assert.equal(schema.publisher.name, "FUTIQ FOOTBALL");
    });

    it("generates valid SportsTeam schema", () => {
      const schema = StructuredDataService.getSportsTeamSchema({
        name: "Arsenal FC",
        url: "https://football.example.com/teams/arsenal",
        stadiumName: "Emirates Stadium",
        leagueName: "Premier League",
      });

      assert.equal(schema["@type"], "SportsTeam");
      assert.equal(schema.name, "Arsenal FC");
      assert.equal(schema.location?.name, "Emirates Stadium");
    });

    it("generates valid BreadcrumbList schema with normalized URLs", () => {
      const schema = StructuredDataService.getBreadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Teams", url: "/teams" },
        { name: "Arsenal", url: "/teams/arsenal" },
      ]);

      assert.equal(schema["@type"], "BreadcrumbList");
      assert.equal(schema.itemListElement.length, 3);
      assert.equal(schema.itemListElement[2].name, "Arsenal");
    });
  });

  /* =========================================================
     4. GOOGLE DISCOVER READINESS VALIDATION TESTS
     ========================================================= */
  describe("4. Google Discover Readiness Validation", () => {
    it("evaluates article readiness checklist scoring high on compliant articles", () => {
      const report = SeoValidationService.auditArticleForDiscover({
        title: "Tactical Masterclass: How Arteta Overcame High Press",
        excerpt: "An in-depth tactical breakdown exploring the passing networks and pressing traps utilized in Sunday's derby.",
        body: "Detailed tactical analysis body spanning across multiple paragraphs with extensive journalistic reporting and statistical data points.".repeat(5),
        featuredImageUrl: "https://football.example.com/images/match.jpg",
        imageWidth: 1400,
        authorName: "Tactics Lead",
        publishedAt: new Date(),
      });

      assert.equal(report.isReady, true);
      assert.ok(report.score >= 80);
    });

    it("flags deficiencies when title is too short or lead image is missing", () => {
      const report = SeoValidationService.auditArticleForDiscover({
        title: "News",
        excerpt: "Short excerpt",
        body: "Short body text",
        featuredImageUrl: null,
        authorName: null,
        publishedAt: null,
      });

      assert.equal(report.isReady, false);
      assert.ok(report.score < 50);
    });
  });

  /* =========================================================
     5. TRENDING ENGINE & RECENCY DECAY TESTS
     ========================================================= */
  describe("5. Trending Engine & Recency Scoring", () => {
    it("gives higher score to recent high-engagement article over old article", () => {
      const now = new Date();
      const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 3600 * 1000);

      const recentScore = TrendingService.calculateTrendScore({
        publishedAt: now,
        viewsCount: 500,
        qualifiedReadsCount: 300,
        sharesCount: 50,
        isBreaking: false,
      });

      const oldScore = TrendingService.calculateTrendScore({
        publishedAt: fiveDaysAgo,
        viewsCount: 500,
        qualifiedReadsCount: 300,
        sharesCount: 50,
        isBreaking: false,
      });

      assert.ok(recentScore > oldScore * 2);
    });

    it("applies breaking news weight bonus to trending score", () => {
      const scoreNormal = TrendingService.calculateTrendScore({
        publishedAt: new Date(),
        viewsCount: 100,
        qualifiedReadsCount: 50,
        sharesCount: 10,
        isBreaking: false,
      });

      const scoreBreaking = TrendingService.calculateTrendScore({
        publishedAt: new Date(),
        viewsCount: 100,
        qualifiedReadsCount: 50,
        sharesCount: 10,
        isBreaking: true,
      });

      assert.ok(scoreBreaking > scoreNormal);
    });
  });

  /* =========================================================
     6. BREAKING NEWS CLASSIFIER TESTS
     ========================================================= */
  describe("6. Breaking News Priority Engine", () => {
    it("classifies manager sackings and huge transfers >= 50M EUR as BREAKING", () => {
      const managerResult = BreakingNewsService.evaluateEventUrgency({
        eventType: "MANAGER_DISMISSED",
      });
      assert.equal(managerResult, "BREAKING");

      const megaTransfer = BreakingNewsService.evaluateEventUrgency({
        eventType: "TRANSFER_COMPLETED",
        transferFeeEur: 75_000_000,
      });
      assert.equal(megaTransfer, "BREAKING");
    });

    it("classifies derby red cards and standard transfers as IMPORTANT", () => {
      const derbyRed = BreakingNewsService.evaluateEventUrgency({
        eventType: "RED_CARD",
        isFinalOrDerby: true,
      });
      assert.equal(derbyRed, "IMPORTANT");
    });
  });

  /* =========================================================
     7. REDIRECT SECURITY & OPEN REDIRECT DEFENSE TESTS
     ========================================================= */
  describe("7. Redirect Security & Sanitization", () => {
    it("accepts valid relative internal route paths starting with '/'", () => {
      assert.equal(RedirectService.isValidInternalPath("/news/old-slug"), true);
      assert.equal(RedirectService.isValidInternalPath("/teams/arsenal-fc"), true);
    });

    it("strictly blocks external open redirect targets", () => {
      assert.equal(RedirectService.isValidInternalPath("https://evil-phish.example.com"), false);
      assert.equal(RedirectService.isValidInternalPath("http://attacker.com/steal"), false);
    });

    it("strictly blocks protocol-relative URLs (//evil.com)", () => {
      assert.equal(RedirectService.isValidInternalPath("//evil.com/exploit"), false);
    });

    it("strictly blocks javascript pseudo-protocols and data URIs", () => {
      assert.equal(RedirectService.isValidInternalPath("javascript:alert(document.cookie)"), false);
      assert.equal(RedirectService.isValidInternalPath("data:text/html,<script>alert(1)</script>"), false);
    });
  });
});
