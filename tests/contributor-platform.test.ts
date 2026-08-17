import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { ContributorService } from "../src/lib/contributor/contributor.service";
import { EditorialService } from "../src/lib/editorial/editorial.service";
import { sanitizeRichText, calculateReadTime } from "../src/lib/security/sanitizer";
import {
  ArticleStatus,
  ImageRightsStatus,
  SourceType,
  ApplicationStatus,
  SubmissionStatus,
  ReviewDecision,
  NotificationType,
} from "@prisma/client";
import { prisma } from "../src/lib/db";

// In-Memory Test State for deterministic offline unit/integration testing
const inMemoryDb = {
  applications: new Map<string, any>(),
  profiles: new Map<string, any>(),
  articles: new Map<string, any>(),
  sources: new Map<string, any>(),
  revisions: new Map<string, any[]>(),
  submissions: new Map<string, any>(),
  reviews: new Map<string, any>(),
  notifications: new Map<string, any[]>(),
  gateRuns: new Map<string, any[]>(),
  overrideLogs: new Map<string, any[]>(),
  users: new Map<string, any>([
    ["user-a", { id: "user-a", email: "author-a@example.com", fullName: "Author Alpha", roles: [] }],
    ["user-b", { id: "user-b", email: "author-b@example.com", fullName: "Author Beta", roles: [] }],
    ["user-editor", { id: "user-editor", email: "editor@example.com", fullName: "Chief Editor", roles: [] }],
  ]),
};

// Mock Prisma client operations for deterministic standalone test execution
function mockPrisma() {
  (prisma as any).contributorApplication = {
    findFirst: async ({ where }: any) => {
      for (const app of Array.from(inMemoryDb.applications.values())) {
        if (app.email === where.email) return app;
      }
      return null;
    },
    create: async ({ data }: any) => {
      const id = `app_${Date.now()}_${Math.random()}`;
      const record = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
      inMemoryDb.applications.set(id, record);
      return record;
    },
  };

  (prisma as any).contributorProfile = {
    findUnique: async ({ where }: any) => {
      if (where.userId) {
        for (const p of Array.from(inMemoryDb.profiles.values())) {
          if (p.userId === where.userId) return p;
        }
      }
      if (where.id) return inMemoryDb.profiles.get(where.id) || null;
      return null;
    },
    create: async ({ data }: any) => {
      const id = `prof_${Date.now()}_${Math.random()}`;
      const record = {
        id,
        ...data,
        overallTrustScore: data.overallTrustScore || 100.0,
        accuracyScore: data.accuracyScore || 100.0,
        originalityScore: data.originalityScore || 100.0,
        reliabilityScore: data.reliabilityScore || 100.0,
        copyrightScore: data.copyrightScore || 100.0,
        qualityScore: data.qualityScore || 100.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryDb.profiles.set(id, record);
      return record;
    },
    update: async ({ where, data }: any) => {
      const existing = inMemoryDb.profiles.get(where.id);
      const updated = { ...existing, ...data, updatedAt: new Date() };
      inMemoryDb.profiles.set(where.id, updated);
      return updated;
    },
  };

  (prisma as any).user = {
    findUnique: async ({ where }: any) => {
      return inMemoryDb.users.get(where.id) || null;
    },
  };

  (prisma as any).article = {
    findUnique: async ({ where, include }: any) => {
      const art = inMemoryDb.articles.get(where.id) || inMemoryDb.articles.get(where.slug);
      if (!art) return null;

      const sources = Array.from(inMemoryDb.sources.values()).filter((s) => s.articleId === art.id);
      const revisions = (inMemoryDb.revisions.get(art.id) || []).sort(
        (a, b) => b.revisionNumber - a.revisionNumber
      );
      const submissions = Array.from(inMemoryDb.submissions.values()).filter((s) => s.articleId === art.id);
      const reviews = Array.from(inMemoryDb.reviews.values())
        .filter((r) => r.articleId === art.id)
        .map((r) => {
          if (include?.reviews?.select) {
            const selected: any = {};
            for (const key of Object.keys(include.reviews.select)) {
              if (include.reviews.select[key]) selected[key] = r[key];
            }
            return selected;
          }
          return r;
        });

      return {
        ...art,
        sources: include?.sources ? sources : undefined,
        revisions: include?.revisions ? revisions : undefined,
        submissions: include?.submissions ? submissions : undefined,
        reviews: include?.reviews ? reviews : undefined,
        gateRuns: inMemoryDb.gateRuns.get(art.id) || [],
        overrideLogs: inMemoryDb.overrideLogs.get(art.id) || [],
        author: inMemoryDb.users.get(art.authorId) || { id: art.authorId, fullName: "Author", email: "author@fmp.com" },
      };
    },
    create: async ({ data, include }: any) => {
      const id = `art_${Date.now()}_${Math.random().toString().slice(2, 6)}`;
      const record = {
        id,
        gateStatus: "NOT_RUN",
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryDb.articles.set(id, record);

      if (data.sources?.create) {
        for (const s of data.sources.create) {
          const sId = `src_${Date.now()}_${Math.random()}`;
          inMemoryDb.sources.set(sId, { id: sId, articleId: id, ...s });
        }
      }

      const sources = Array.from(inMemoryDb.sources.values()).filter((s) => s.articleId === id);
      return { ...record, sources: include?.sources ? sources : undefined };
    },
    update: async ({ where, data, include }: any) => {
      const existing = inMemoryDb.articles.get(where.id);
      const updated = { ...existing, ...data, updatedAt: new Date() };
      inMemoryDb.articles.set(where.id, updated);
      const sources = Array.from(inMemoryDb.sources.values()).filter((s) => s.articleId === where.id);
      return { ...updated, sources: include?.sources ? sources : undefined };
    },
    delete: async ({ where }: any) => {
      inMemoryDb.articles.delete(where.id);
      return { id: where.id };
    },
    count: async () => inMemoryDb.articles.size,
    findMany: async ({ where }: any) => {
      let list = Array.from(inMemoryDb.articles.values());
      if (where?.authorId) list = list.filter((a) => a.authorId === where.authorId);
      if (where?.status) {
        if (typeof where.status === "object" && where.status.in) {
          list = list.filter((a) => where.status.in.includes(a.status));
        } else {
          list = list.filter((a) => a.status === where.status);
        }
      }
      return list.map((art) => ({
        ...art,
        sources: Array.from(inMemoryDb.sources.values()).filter((s) => s.articleId === art.id),
        author: inMemoryDb.users.get(art.authorId) || { id: art.authorId, fullName: "Author", email: "author@fmp.com" },
        contributorProfile: inMemoryDb.profiles.get(art.contributorProfileId) || null,
        submissions: Array.from(inMemoryDb.submissions.values()).filter((s) => s.articleId === art.id),
        reviews: Array.from(inMemoryDb.reviews.values()).filter((r) => r.articleId === art.id),
      }));
    },
  };

  (prisma as any).articleSource = {
    createMany: async ({ data }: any) => {
      for (const s of data) {
        const id = `src_${Date.now()}_${Math.random()}`;
        inMemoryDb.sources.set(id, { id, ...s });
      }
    },
    deleteMany: async ({ where }: any) => {
      for (const [id, s] of Array.from(inMemoryDb.sources.entries())) {
        if (s.articleId === where.articleId) inMemoryDb.sources.delete(id);
      }
    },
  };

  (prisma as any).articleRevision = {
    create: async ({ data }: any) => {
      const id = `rev_${Date.now()}_${Math.random()}`;
      const rev = { id, ...data, createdAt: new Date() };
      const list = inMemoryDb.revisions.get(data.articleId) || [];
      list.push(rev);
      inMemoryDb.revisions.set(data.articleId, list);
      return rev;
    },
    findMany: async ({ where }: any) => inMemoryDb.revisions.get(where.articleId) || [],
  };

  (prisma as any).articleSubmission = {
    create: async ({ data }: any) => {
      const id = `sub_${Date.now()}_${Math.random()}`;
      const record = { id, ...data, submittedAt: new Date() };
      inMemoryDb.submissions.set(id, record);
      return record;
    },
    update: async ({ where, data }: any) => {
      const existing = inMemoryDb.submissions.get(where.id);
      const updated = { ...existing, ...data };
      inMemoryDb.submissions.set(where.id, updated);
      return updated;
    },
    updateMany: async ({ where, data }: any) => {
      for (const [id, s] of Array.from(inMemoryDb.submissions.entries())) {
        if (s.articleId === where.articleId) inMemoryDb.submissions.set(id, { ...s, ...data });
      }
    },
  };

  (prisma as any).editorialReview = {
    create: async ({ data }: any) => {
      const id = `revw_${Date.now()}_${Math.random()}`;
      const record = { id, ...data, createdAt: new Date() };
      inMemoryDb.reviews.set(id, record);
      return record;
    },
  };

  (prisma as any).contributorNotification = {
    create: async ({ data }: any) => {
      const list = inMemoryDb.notifications.get(data.userId) || [];
      inMemoryDb.notifications.set(data.userId, [data, ...list]);
      return data;
    },
    findMany: async ({ where }: any) => inMemoryDb.notifications.get(where.userId) || [],
    findUnique: async ({ where }: any) => {
      for (const list of Array.from(inMemoryDb.notifications.values())) {
        const found = list.find((n: any) => n.id === where.id);
        if (found) return found;
      }
      return null;
    },
    update: async ({ where, data }: any) => {
      for (const list of Array.from(inMemoryDb.notifications.values())) {
        const idx = list.findIndex((n: any) => n.id === where.id);
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...data };
          return list[idx];
        }
      }
      return null;
    },
  };

  (prisma as any).editorialGateRun = {
    create: async ({ data }: any) => {
      const id = `gr_${Date.now()}`;
      const record = { id, ...data, createdAt: new Date() };
      const list = inMemoryDb.gateRuns.get(data.articleId) || [];
      inMemoryDb.gateRuns.set(data.articleId, [record, ...list]);
      return record;
    },
    findFirst: async ({ where }: any) => {
      const list = inMemoryDb.gateRuns.get(where.articleId) || [];
      return list[0] || null;
    },
  };

  (prisma as any).editorialOverrideLog = {
    create: async ({ data }: any) => {
      const id = `ovr_${Date.now()}`;
      const record = { id, ...data, createdAt: new Date() };
      const list = inMemoryDb.overrideLogs.get(data.articleId) || [];
      inMemoryDb.overrideLogs.set(data.articleId, [record, ...list]);
      return record;
    },
  };
}

describe("Contributor Platform & Editorial Workflow Test Suite", () => {
  mockPrisma();

  const contributorService = ContributorService.getInstance();
  const editorialService = EditorialService.getInstance();

  const userA = "user-a";
  const userB = "user-b";
  const editorUser = "user-editor";

  describe("1. Security, Rich Text Sanitization & Reading Calculations", () => {
    it("should strip malicious script tags, iframes, and inline event handlers from rich text", () => {
      const maliciousHtml = `<p>Arsenal dominated the first half.</p><script>alert('XSS')</script><iframe src="malicious.html"></iframe><img src="x" onerror="stealCookies()"><a href="javascript:alert(1)">Click</a>`;
      const clean = sanitizeRichText(maliciousHtml);

      assert.ok(!clean.includes("<script>"));
      assert.ok(!clean.includes("<iframe>"));
      assert.ok(!clean.includes("onerror="));
      assert.ok(!clean.includes("javascript:"));
      assert.ok(clean.includes("Arsenal dominated the first half."));
    });

    it("should calculate reading time and word count correctly", () => {
      const sampleText = "The high pressing evolution under Mikel Arteta showcases inverted fullbacks and central dominance. ".repeat(
        25
      );
      const { wordCount, readTimeMinutes } = calculateReadTime(sampleText);
      assert.ok(wordCount >= 200);
      assert.ok(readTimeMinutes >= 1);
    });
  });

  describe("2. Contributor Application Workflow", () => {
    it("should validate and create contributor application", async () => {
      const email = `contributor-${Date.now()}@example.com`;
      const app = await contributorService.applyContributor({
        fullName: "Marcus Cole",
        displayName: "Marcus Cole",
        email,
        country: "England",
        preferredLanguage: "en",
        footballInterests: "Premier League, Arsenal FC",
        preferredCategories: "Tactical Analysis",
        shortBio: "Sports writer with 5 years experience covering London derbies.",
        writingExperience: "Freelance contributor to local football magazines.",
        portfolioUrl: "https://example.com/portfolio",
        agreementAccepted: true,
        originalityDeclared: true,
        copyrightDeclared: true,
      });

      assert.ok(app.id);
      assert.equal(app.email, email);
      assert.equal(app.status, ApplicationStatus.PENDING);
    });

    it("should reject duplicate pending applications for same email", async () => {
      const email = `dup-contributor-${Date.now()}@example.com`;
      await contributorService.applyContributor({
        fullName: "Duplicate User",
        displayName: "Dup",
        email,
        country: "Spain",
        footballInterests: "La Liga",
        preferredCategories: "Transfers",
        shortBio: "Football enthusiast and scout.",
        writingExperience: "Blogger for 3 years.",
        agreementAccepted: true,
        originalityDeclared: true,
        copyrightDeclared: true,
      });

      await assert.rejects(
        async () => {
          await contributorService.applyContributor({
            fullName: "Duplicate User",
            displayName: "Dup",
            email,
            country: "Spain",
            footballInterests: "La Liga",
            preferredCategories: "Transfers",
            shortBio: "Football enthusiast and scout.",
            writingExperience: "Blogger for 3 years.",
            agreementAccepted: true,
            originalityDeclared: true,
            copyrightDeclared: true,
          });
        },
        /already under review/i
      );
    });
  });

  describe("3. Draft Creation, Revisions & IDOR Prevention", () => {
    let articleAId: string;

    it("should create article draft owned strictly by Author A", async () => {
      const draft = await contributorService.createArticleDraft(userA, {
        title: "Arteta's Tactical Geometry: How Arsenal Stifled Transition Threats",
        subtitle: "A deep dive into rest defense and territorial containment",
        excerpt: "Analyzing Arsenal's off-ball positioning and pressing triggers.",
        body: "<p>" + "Mikel Arteta restructured his midfield shape to prioritize rest defense. ".repeat(15) + "</p>",
        category: "Tactical Analysis",
        imageRightsStatus: ImageRightsStatus.OWNED,
        seoTitle: "Arteta Tactical Breakdown - Arsenal Rest Defense",
        seoDescription: "An in-depth analysis of Arsenal's tactical rest defense structures.",
        sources: [
          {
            sourceName: "Opta Match Telemetry",
            sourceUrl: "https://opta.com/match-data",
            sourceType: SourceType.FOOTBALL_DATA,
          },
        ],
      });

      assert.ok(draft.id);
      assert.equal(draft.authorId, userA);
      assert.equal(draft.status, ArticleStatus.DRAFT);
      articleAId = draft.id;
    });

    it("should strictly deny User B from accessing Author A's article (IDOR Prevention)", async () => {
      const article = await contributorService.getArticleDetail(userB, articleAId);
      assert.equal(article, null);
    });

    it("should strictly deny User B from updating Author A's article (IDOR Prevention)", async () => {
      await assert.rejects(
        async () => {
          await contributorService.updateArticleDraft(userB, articleAId, {
            title: "Malicious Tampering Attempt",
          });
        },
        /unauthorized access/i
      );
    });

    it("should allow Author A to update draft and automatically create revision snapshot", async () => {
      const updated = await contributorService.updateArticleDraft(userA, articleAId, {
        subtitle: "Updated subtitle after editorial review reflection",
        changeSummary: "Added secondary midfield analysis paragraph",
      });

      assert.equal(updated.subtitle, "Updated subtitle after editorial review reflection");

      const detail = await contributorService.getArticleDetail(userA, articleAId);
      assert.ok(detail);
      assert.ok(detail.revisions.length >= 2);
    });
  });

  describe("4. Submission Gate, Source Validation & Image Rights Enforcement", () => {
    it("should reject submission if image rights are UNKNOWN", async () => {
      const draft = await contributorService.createArticleDraft(userA, {
        title: "Incomplete Draft With Unknown Image Rights",
        body: "<p>" + "Sample tactical content with sufficient words for testing validation gate. ".repeat(10) + "</p>",
        category: "Tactical Analysis",
        imageRightsStatus: ImageRightsStatus.UNKNOWN, // Blocks submission
        seoTitle: "Valid SEO Title",
        seoDescription: "Valid SEO Description for discovery",
        sources: [
          {
            sourceName: "Official Press",
            sourceUrl: "https://example.com",
            sourceType: SourceType.OFFICIAL,
          },
        ],
      });

      await assert.rejects(
        async () => {
          await contributorService.submitArticle(userA, draft.id);
        },
        /Image rights status cannot be UNKNOWN/i
      );
    });

    it("should reject submission if sources are missing", async () => {
      const draft = await contributorService.createArticleDraft(userA, {
        title: "Draft Without Any Sources Attached",
        body: "<p>" + "Sample tactical content with sufficient words for testing validation gate. ".repeat(10) + "</p>",
        category: "Tactical Analysis",
        imageRightsStatus: ImageRightsStatus.LICENSED,
        seoTitle: "Valid SEO Title",
        seoDescription: "Valid SEO Description for discovery",
        sources: [], // Missing sources
      });

      await assert.rejects(
        async () => {
          await contributorService.submitArticle(userA, draft.id);
        },
        /source reference is required/i
      );
    });

    it("should successfully submit fully compliant article to Editorial Review", async () => {
      const draft = await contributorService.createArticleDraft(userA, {
        title: "Complete Verified Match Report: Arsenal vs Chelsea Derby",
        subtitle: "Tactical duel at Emirates Stadium analyzed in depth",
        excerpt: "Full breakdown of match events and territorial dominance.",
        body: "<p>" + "Arsenal maintained superior territorial control through rapid counter-pressing. ".repeat(12) + "</p>",
        category: "Match Reports",
        imageRightsStatus: ImageRightsStatus.LICENSED,
        seoTitle: "Arsenal vs Chelsea Match Analysis",
        seoDescription: "Comprehensive tactical review of Arsenal vs Chelsea.",
        sources: [
          {
            sourceName: "Premier League Official",
            sourceUrl: "https://premierleague.com/match",
            sourceType: SourceType.OFFICIAL,
          },
        ],
      });

      const { submission, article } = await contributorService.submitArticle(userA, draft.id);
      assert.equal(article.status, ArticleStatus.SUBMITTED);
      assert.equal(submission.contributorId, userA);

      // Check in-app notification created for author
      const notifications = await contributorService.getNotifications(userA);
      assert.ok(notifications.some((n) => n.type === "ARTICLE_SUBMITTED"));
    });
  });

  describe("5. Editorial Decision Machine & Anti-Self-Approval", () => {
    let articleForReviewId: string;

    it("should prevent contributor from approving their own article (Anti-Self-Approval)", async () => {
      const draft = await contributorService.createArticleDraft(userA, {
        title: "Self Approval Security Test Article",
        body: "<p>" + "Valid body content for self approval test case. ".repeat(15) + "</p>",
        category: "Tactical Analysis",
        imageRightsStatus: ImageRightsStatus.LICENSED,
        seoTitle: "SEO Title Test",
        seoDescription: "SEO Description Test",
        sources: [
          {
            sourceName: "Source 1",
            sourceUrl: "https://source.com",
            sourceType: SourceType.NEWS_REPORT,
          },
        ],
      });

      await contributorService.submitArticle(userA, draft.id);
      articleForReviewId = draft.id;

      // Author attempting to approve own article
      await assert.rejects(
        async () => {
          await editorialService.approveArticle(userA, articleForReviewId, "Self approve attempt");
        },
        /Contributors cannot approve their own articles/i
      );
    });

    it("should allow Editor to request revision with mandatory contributor feedback", async () => {
      const { review, article } = await editorialService.requestRevision(
        editorUser,
        articleForReviewId,
        "Please provide deeper stats on second half duel win rates.",
        "Internal staff note: Good draft, just needs stats polish."
      );

      assert.equal(article.status, ArticleStatus.REVISION_REQUIRED);
      assert.equal(review.decision, "REQUEST_REVISION");

      // Verify internalNotes is hidden from contributor detail query
      const contributorView = await contributorService.getArticleDetail(userA, articleForReviewId);
      assert.ok(contributorView);
      assert.ok(!("internalNotes" in (contributorView.reviews[0] || {})));
      assert.equal(
        contributorView.reviews[0].contributorFeedback,
        "Please provide deeper stats on second half duel win rates."
      );
    });

    it("should allow Author to edit revised draft and resubmit", async () => {
      await contributorService.updateArticleDraft(userA, articleForReviewId, {
        body: "<p>" + "Updated draft with duel win rates added to paragraph 4. ".repeat(12) + "</p>",
        changeSummary: "Added duel win metrics as requested by editor",
      });

      const { article } = await contributorService.submitArticle(userA, articleForReviewId);
      assert.equal(article.status, ArticleStatus.SUBMITTED);
    });

    it("should allow Editor to approve resubmitted article", async () => {
      const { article } = await editorialService.approveArticle(
        editorUser,
        articleForReviewId,
        "Verified and cleared."
      );

      assert.equal(article.status, ArticleStatus.APPROVED);

      // Verify notification sent to author
      const notifs = await contributorService.getNotifications(userA);
      assert.ok(notifs.some((n) => n.type === "ARTICLE_APPROVED"));
    });

    it("should allow Editor to publish approved article", async () => {
      const published = await editorialService.publishArticle(editorUser, articleForReviewId);
      assert.equal(published.status, ArticleStatus.PUBLISHED);
      assert.ok(published.publishedAt);
    });
  });
});
