import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { EditorialGateService } from "../src/lib/editorial/ai-gate/editorial-gate.service";
import { EditorialService } from "../src/lib/editorial/editorial.service";
import { EditorialAIProvider } from "../src/lib/editorial/ai-gate/ai-provider.interface";
import {
  GateStatus,
  FindingSeverity,
  FindingCategory,
  ImageRightsStatus,
  SourceType,
  ArticleStatus,
  ReviewDecision,
} from "@prisma/client";
import { prisma } from "../src/lib/db";

// In-Memory Test State
const inMemoryGateDb = {
  articles: new Map<string, any>(),
  gateRuns: new Map<string, any[]>(),
  findings: new Map<string, any[]>(),
  overrideLogs: new Map<string, any[]>(),
  submissions: new Map<string, any[]>(),
  reviews: new Map<string, any[]>(),
  notifications: new Map<string, any[]>(),
};

function setupMockPrisma() {
  (prisma as any).article = {
    findUnique: async ({ where }: any) => {
      const art = inMemoryGateDb.articles.get(where.id);
      if (!art) return null;
      return {
        ...art,
        sources: art.sources || [],
        author: { id: art.authorId, fullName: "Test Author", email: "author@test.com" },
        submissions: inMemoryGateDb.submissions.get(art.id) || [],
        gateRuns: inMemoryGateDb.gateRuns.get(art.id) || [],
        overrideLogs: inMemoryGateDb.overrideLogs.get(art.id) || [],
      };
    },
    findFirst: async ({ where }: any) => {
      for (const art of Array.from(inMemoryGateDb.articles.values())) {
        if (where.id?.not && art.id === where.id.not) continue;
        if (where.featuredImageUrl && art.featuredImageUrl === where.featuredImageUrl) {
          if (where.authorId?.not && art.authorId === where.authorId.not) return art;
        }
      }
      return null;
    },
    findMany: async ({ where }: any) => {
      const results: any[] = [];
      for (const art of Array.from(inMemoryGateDb.articles.values())) {
        if (where?.id?.not && art.id === where.id.not) continue;
        if (where?.authorId?.not && art.authorId === where.authorId.not) continue;
        results.push({
          ...art,
          author: { fullName: "Other Author" },
        });
      }
      return results;
    },
    update: async ({ where, data }: any) => {
      const art = inMemoryGateDb.articles.get(where.id);
      if (!art) throw new Error("Article not found");
      const updated = { ...art, ...data, updatedAt: new Date() };
      inMemoryGateDb.articles.set(where.id, updated);
      return updated;
    },
  };

  (prisma as any).editorialGateRun = {
    create: async ({ data }: any) => {
      const id = `gr_${Date.now()}_${Math.random()}`;
      const record = {
        id,
        ...data,
        createdAt: new Date(),
        findings: data.findings?.create || [],
      };
      const existing = inMemoryGateDb.gateRuns.get(data.articleId) || [];
      inMemoryGateDb.gateRuns.set(data.articleId, [record, ...existing]);
      inMemoryGateDb.findings.set(id, data.findings?.create || []);
      return record;
    },
    findFirst: async ({ where }: any) => {
      const runs = inMemoryGateDb.gateRuns.get(where.articleId) || [];
      if (runs.length === 0) return null;
      const latest = runs[0];
      return {
        ...latest,
        findings: inMemoryGateDb.findings.get(latest.id) || [],
      };
    },
  };

  (prisma as any).editorialOverrideLog = {
    create: async ({ data }: any) => {
      const id = `ovr_${Date.now()}_${Math.random()}`;
      const record = { id, ...data, createdAt: new Date() };
      const existing = inMemoryGateDb.overrideLogs.get(data.articleId) || [];
      inMemoryGateDb.overrideLogs.set(data.articleId, [record, ...existing]);
      return record;
    },
  };

  (prisma as any).editorialReview = {
    create: async ({ data }: any) => {
      const id = `rev_${Date.now()}_${Math.random()}`;
      const record = { id, ...data, createdAt: new Date() };
      const list = inMemoryGateDb.reviews.get(data.articleId) || [];
      inMemoryGateDb.reviews.set(data.articleId, [record, ...list]);
      return record;
    },
  };

  (prisma as any).articleSubmission = {
    update: async ({ where, data }: any) => {
      return { id: where.id, ...data };
    },
  };

  (prisma as any).contributorNotification = {
    create: async ({ data }: any) => {
      const list = inMemoryGateDb.notifications.get(data.userId) || [];
      inMemoryGateDb.notifications.set(data.userId, [data, ...list]);
      return data;
    },
  };
}

describe("Sprint 4 — AI Editorial Gate & Copyright Protection Suite", () => {
  let gateService: EditorialGateService;
  let editorialService: EditorialService;

  beforeEach(() => {
    inMemoryGateDb.articles.clear();
    inMemoryGateDb.gateRuns.clear();
    inMemoryGateDb.findings.clear();
    inMemoryGateDb.overrideLogs.clear();
    inMemoryGateDb.submissions.clear();
    inMemoryGateDb.reviews.clear();
    inMemoryGateDb.notifications.clear();

    setupMockPrisma();
    gateService = EditorialGateService.getInstance();
    editorialService = EditorialService.getInstance();
  });

  describe("1. Clean Article Flow & Originality Tolerance", () => {
    it("should pass a clean, fully cited tactical analysis (Verdict: PASSED)", async () => {
      const cleanArticle = {
        id: "art-clean-1",
        title: "Tactical Deep Dive: Mikel Arteta's Midfield Box Pivot Mechanics",
        subtitle: "Analyzing spatial occupation against high pressing defensive blocks across ninety minutes of play.",
        excerpt: "An in-depth analysis of double pivot rotations and progressive passing lanes in transitional phases.",
        body: "During the latest Premier League fixture, the tactical setup demonstrated how midfield box rotations create consistent numerical overloads in the half-spaces. The double pivot operated with positional fluid mechanics, bypassing the opposition's first line of pressing while maintaining rest defense stability across ninety minutes of competitive action. Furthermore, the full-backs inverted dynamically to control transition counter-attacks effectively and sustain territory throughout the second half.",
        category: "Tactical Analysis",
        featuredImageUrl: "https://images.unsplash.com/photo-1508098682722",
        imageRightsStatus: ImageRightsStatus.LICENSED,
        imageAttribution: "Getty Images / Licensed",
        status: ArticleStatus.SUBMITTED,
        gateStatus: GateStatus.NOT_RUN,
        authorId: "user-alpha",
        sources: [
          {
            sourceName: "Opta Match Telemetry",
            sourceUrl: "https://theanalyst.com/match-review",
            sourceType: SourceType.FOOTBALL_DATA,
          },
        ],
      };
      inMemoryGateDb.articles.set(cleanArticle.id, cleanArticle);

      const result = await gateService.runGate(cleanArticle.id);

      assert.equal(result.status, GateStatus.PASSED);
      assert.ok(result.scores.overallScore >= 80);
      assert.equal(result.scores.plagiarismRisk, FindingSeverity.PASS);
      assert.equal(result.scores.imageRisk, FindingSeverity.PASS);
    });

    it("should tolerate common football phrases without triggering false plagiarism (Verdict: PASSED)", async () => {
      const factualArticle = {
        id: "art-factual-common",
        title: "Match Summary: Premier League Weekend Review",
        subtitle: "Key results across the top flight matches and tactical takeaways for European qualification.",
        excerpt: "Manchester United won 2-1 against Arsenal in a dramatic contest at Old Trafford.",
        body: "In the marquee clash of Matchday 28, Manchester United won 2-1 against Arsenal. Real Madrid secured three points in their domestic league while maintaining a clean sheet with counter attacking football. The match featured excellent defensive organization, rapid transition phases, and decisive tactical substitution choices in the final quarter of play that ultimately dictated the outcome.",
        category: "Match Reports",
        featuredImageUrl: "https://images.unsplash.com/photo-1508098682722",
        imageRightsStatus: ImageRightsStatus.OWNED,
        imageAttribution: "Author Original",
        status: ArticleStatus.SUBMITTED,
        gateStatus: GateStatus.NOT_RUN,
        authorId: "user-alpha",
        sources: [{ sourceName: "Official Match Report", sourceUrl: "https://premierleague.com", sourceType: SourceType.OFFICIAL }],
      };
      inMemoryGateDb.articles.set(factualArticle.id, factualArticle);

      const result = await gateService.runGate(factualArticle.id);

      assert.equal(result.status, GateStatus.PASSED);
      assert.equal(result.scores.plagiarismRisk, FindingSeverity.PASS);
    });
  });

  describe("2. Plagiarism, Duplicate & Similarity Detection", () => {
    it("should reject an exact duplicate article matching existing platform content (Verdict: REJECTED)", async () => {
      const existingArticle = {
        id: "art-existing-beta",
        title: "Real Madrid Scouting Breakdown",
        body: "This is a comprehensive analytical report examining defensive line height, central pressing triggers, and progressive passing networks across European tournament fixtures.",
        authorId: "user-beta",
      };
      inMemoryGateDb.articles.set(existingArticle.id, existingArticle);

      const copiedArticle = {
        id: "art-copied-alpha",
        title: "Exact Duplicate: Real Madrid Scouting Breakdown",
        excerpt: "Copied excerpt text.",
        body: "mock_exact_duplicate: This is a comprehensive analytical report examining defensive line height, central pressing triggers, and progressive passing networks across European tournament fixtures. The full analysis details player positioning and defensive actions.",
        category: "Tactical Analysis",
        imageRightsStatus: ImageRightsStatus.OWNED,
        status: ArticleStatus.SUBMITTED,
        gateStatus: GateStatus.NOT_RUN,
        authorId: "user-alpha",
        sources: [{ sourceName: "Wire", sourceUrl: "https://example.com", sourceType: SourceType.NEWS_REPORT }],
      };
      inMemoryGateDb.articles.set(copiedArticle.id, copiedArticle);

      const result = await gateService.runGate(copiedArticle.id);

      assert.equal(result.status, GateStatus.REJECTED);
      assert.equal(result.scores.plagiarismRisk, FindingSeverity.CRITICAL);
      assert.ok(result.findings.some((f) => f.severity === FindingSeverity.CRITICAL));
    });

    it("should reject high-confidence external plagiarism (Verdict: REJECTED)", async () => {
      const plagiarizedArticle = {
        id: "art-plagiarized",
        title: "High Plagiarism: Stolen Wire Release",
        excerpt: "Stolen lead.",
        body: "mock_plagiarism: copied word for word from the athletic archives without authorization or rewording. The entire analytical prose, structural breakdown, and specific player rating commentary was directly reproduced across ninety minutes of tactical analysis.",
        category: "Tactical Analysis",
        imageRightsStatus: ImageRightsStatus.OWNED,
        status: ArticleStatus.SUBMITTED,
        gateStatus: GateStatus.NOT_RUN,
        authorId: "user-alpha",
        sources: [{ sourceName: "Wire", sourceUrl: "https://example.com", sourceType: SourceType.NEWS_REPORT }],
      };
      inMemoryGateDb.articles.set(plagiarizedArticle.id, plagiarizedArticle);

      const result = await gateService.runGate(plagiarizedArticle.id);

      assert.equal(result.status, GateStatus.REJECTED);
      assert.equal(result.scores.plagiarismRisk, FindingSeverity.CRITICAL);
    });

    it("should flag medium stylistic similarity for human editorial review (Verdict: REVIEW)", async () => {
      const mediumSimArticle = {
        id: "art-medium-sim",
        title: "Medium Similarity: Secondary Match Summary",
        excerpt: "Summary notes.",
        body: "mock_medium_similarity: Sentence rhythm and paragraph sequence mirrors wire releases closely. The tactical assessment follows identical progression patterns and phrasing sequences as agency reports across both halves of the encounter.",
        category: "Match Reports",
        imageRightsStatus: ImageRightsStatus.OWNED,
        status: ArticleStatus.SUBMITTED,
        gateStatus: GateStatus.NOT_RUN,
        authorId: "user-alpha",
        sources: [{ sourceName: "Agency", sourceUrl: "https://example.com", sourceType: SourceType.NEWS_REPORT }],
      };
      inMemoryGateDb.articles.set(mediumSimArticle.id, mediumSimArticle);

      const result = await gateService.runGate(mediumSimArticle.id);

      assert.equal(result.status, GateStatus.REVIEW);
    });
  });

  describe("3. Factual Consistency & Conflict Checking", () => {
    it("should flag major factual score conflicts for manual editorial review (Verdict: REVIEW)", async () => {
      const factConflictArticle = {
        id: "art-fact-conflict",
        title: "Match Analysis: Arsenal Defeated Chelsea 4-0",
        excerpt: "Score review.",
        body: "mock_fact_conflict: In yesterday's London derby, Arsenal defeated Chelsea 4-0 in dominant fashion. The scoreline reflected total control across both halves of the encounter with clinical finishing and organized pressing.",
        category: "Match Reports",
        imageRightsStatus: ImageRightsStatus.OWNED,
        status: ArticleStatus.SUBMITTED,
        gateStatus: GateStatus.NOT_RUN,
        authorId: "user-alpha",
        sources: [{ sourceName: "Match Report", sourceUrl: "https://example.com", sourceType: SourceType.NEWS_REPORT }],
      };
      inMemoryGateDb.articles.set(factConflictArticle.id, factConflictArticle);

      const result = await gateService.runGate(factConflictArticle.id);

      assert.equal(result.status, GateStatus.REVIEW);
      assert.ok(result.findings.some((f) => f.category === FindingCategory.FACT_CHECK && f.severity === FindingSeverity.HIGH));
    });
  });

  describe("4. Image Copyright & Duplicate Rights Gate", () => {
    it("should REJECT articles with UNKNOWN image rights clearance (Verdict: REJECTED)", async () => {
      const unknownRightsArticle = {
        id: "art-unknown-img",
        title: "Tactical Preview: Champions League Quarter Final",
        excerpt: "Preview.",
        body: "A comprehensive tactical preview analyzing lineup selections and pressing structures across ninety minutes of European football action in the knockout tournament phase.",
        category: "European Football",
        featuredImageUrl: "https://images.unsplash.com/photo-1508098682722",
        imageRightsStatus: ImageRightsStatus.UNKNOWN,
        status: ArticleStatus.SUBMITTED,
        gateStatus: GateStatus.NOT_RUN,
        authorId: "user-alpha",
        sources: [{ sourceName: "Official", sourceUrl: "https://uefa.com", sourceType: SourceType.OFFICIAL }],
      };
      inMemoryGateDb.articles.set(unknownRightsArticle.id, unknownRightsArticle);

      const result = await gateService.runGate(unknownRightsArticle.id);

      assert.equal(result.status, GateStatus.REJECTED);
      assert.equal(result.scores.imageRisk, FindingSeverity.CRITICAL);
      assert.ok(result.findings.some((f) => f.category === FindingCategory.IMAGE_RIGHTS && f.severity === FindingSeverity.CRITICAL));
    });

    it("should PASS articles with properly declared and attributed image rights", async () => {
      const validRightsArticle = {
        id: "art-valid-img",
        title: "European Championship Tactical Retrospective",
        excerpt: "Retrospective overview of continental football tournament performance.",
        body: "Examining transitional efficiency and passing networks across the tournament knockout stages. The tactical setup emphasized structured rest defense, rapid counter-pressing triggers, and disciplined positional spacing throughout ninety minutes of competitive European tournament action. Player positioning created numerical superiority in central zones, generating high probability scoring opportunities while minimizing transitional risks.",
        category: "European Football",
        featuredImageUrl: "https://images.unsplash.com/photo-1508098682722",
        imageRightsStatus: ImageRightsStatus.OFFICIAL_PRESS,
        imageAttribution: "Official UEFA Press Kit",
        status: ArticleStatus.SUBMITTED,
        gateStatus: GateStatus.NOT_RUN,
        authorId: "user-alpha",
        sources: [{ sourceName: "UEFA", sourceUrl: "https://uefa.com", sourceType: SourceType.OFFICIAL }],
      };
      inMemoryGateDb.articles.set(validRightsArticle.id, validRightsArticle);

      const result = await gateService.runGate(validRightsArticle.id);

      assert.equal(result.status, GateStatus.PASSED);
      assert.equal(result.scores.imageRisk, FindingSeverity.PASS);
    });

    it("should REJECT duplicate image assets detected on another contributor's article", async () => {
      const originalImageArticle = {
        id: "art-orig-img",
        title: "Original Post",
        featuredImageUrl: "https://images.unsplash.com/photo-shared-12345",
        authorId: "user-beta",
      };
      inMemoryGateDb.articles.set(originalImageArticle.id, originalImageArticle);

      const duplicateImageArticle = {
        id: "art-dup-img",
        title: "Duplicate Image: Scouting Analysis",
        excerpt: "Scouting.",
        body: "mock_duplicate_image: Scouting report detailing youth academy prospects, acceleration metrics, and progressive carrying indicators across youth tournament fixtures and competitive match play.",
        category: "Scouting Radar",
        featuredImageUrl: "https://images.unsplash.com/photo-shared-12345",
        imageRightsStatus: ImageRightsStatus.OWNED,
        status: ArticleStatus.SUBMITTED,
        gateStatus: GateStatus.NOT_RUN,
        authorId: "user-alpha",
        sources: [{ sourceName: "Academy", sourceUrl: "https://example.com", sourceType: SourceType.OFFICIAL }],
      };
      inMemoryGateDb.articles.set(duplicateImageArticle.id, duplicateImageArticle);

      const result = await gateService.runGate(duplicateImageArticle.id);

      assert.equal(result.status, GateStatus.REJECTED);
      assert.equal(result.scores.imageRisk, FindingSeverity.CRITICAL);
    });
  });

  describe("5. Clickbait, Quality & Source Enforcement", () => {
    it("should flag sensationalized clickbait headlines for review (Verdict: REVIEW)", async () => {
      const clickbaitArticle = {
        id: "art-clickbait",
        title: "You Won't Believe What This Star Player Did in Training!",
        subtitle: "Fans are furious over secret leaked footage.",
        excerpt: "Sensational news.",
        body: "mock_clickbait: A player completed routine conditioning drills under manager guidance during morning practice. The tactical session lasted sixty minutes without any unexpected incidents or disruptions across the training grounds.",
        category: "Club Features",
        imageRightsStatus: ImageRightsStatus.OWNED,
        status: ArticleStatus.SUBMITTED,
        gateStatus: GateStatus.NOT_RUN,
        authorId: "user-alpha",
        sources: [{ sourceName: "Club", sourceUrl: "https://example.com", sourceType: SourceType.OFFICIAL }],
      };
      inMemoryGateDb.articles.set(clickbaitArticle.id, clickbaitArticle);

      const result = await gateService.runGate(clickbaitArticle.id);

      assert.equal(result.status, GateStatus.REVIEW);
      assert.ok(result.findings.some((f) => f.category === FindingCategory.CLICKBAIT));
    });

    it("should flag articles with zero sources citations", async () => {
      const noSourceArticle = {
        id: "art-no-source",
        title: "Midfield Passing Structures in European Knockouts",
        excerpt: "Analysis.",
        body: "A tactical breakdown analyzing passing angles and build-up mechanics in modern European football across ninety minutes of competitive action and tactical adjustments.",
        category: "Tactical Analysis",
        imageRightsStatus: ImageRightsStatus.OWNED,
        status: ArticleStatus.SUBMITTED,
        gateStatus: GateStatus.NOT_RUN,
        authorId: "user-alpha",
        sources: [], // ZERO SOURCES
      };
      inMemoryGateDb.articles.set(noSourceArticle.id, noSourceArticle);

      const result = await gateService.runGate(noSourceArticle.id);

      assert.equal(result.status, GateStatus.REVIEW);
      assert.ok(result.findings.some((f) => f.finding.includes("Zero source citations")));
    });
  });

  describe("6. Publish Gate Enforcement & Server-Side Rules", () => {
    it("should prevent editor approval if AI Gate is NOT_RUN", async () => {
      const unanalyzedArticle = {
        id: "art-unanalyzed",
        title: "Unchecked Draft",
        status: ArticleStatus.SUBMITTED,
        gateStatus: GateStatus.NOT_RUN,
        authorId: "user-alpha",
      };
      inMemoryGateDb.articles.set(unanalyzedArticle.id, unanalyzedArticle);

      await assert.rejects(
        async () => {
          await editorialService.approveArticle("editor-1", unanalyzedArticle.id);
        },
        /Publish Gate Blocked: AI Editorial Gate has not completed analysis/
      );
    });

    it("should prevent editor approval if AI Gate is CHECKING", async () => {
      const checkingArticle = {
        id: "art-checking-gate",
        title: "In-Flight Analysis Draft",
        status: ArticleStatus.SUBMITTED,
        gateStatus: GateStatus.CHECKING,
        authorId: "user-alpha",
      };
      inMemoryGateDb.articles.set(checkingArticle.id, checkingArticle);

      await assert.rejects(
        async () => {
          await editorialService.approveArticle("editor-1", checkingArticle.id);
        },
        /Publish Gate Blocked: AI Editorial Gate has not completed analysis/
      );
    });

    it("should prevent editor approval if AI Gate is REJECTED", async () => {
      const rejectedGateArticle = {
        id: "art-gate-rejected",
        title: "Plagiarized Article",
        status: ArticleStatus.SUBMITTED,
        gateStatus: GateStatus.REJECTED,
        authorId: "user-alpha",
      };
      inMemoryGateDb.articles.set(rejectedGateArticle.id, rejectedGateArticle);

      await assert.rejects(
        async () => {
          await editorialService.approveArticle("editor-1", rejectedGateArticle.id);
        },
        /Publish Gate Blocked: Article was REJECTED by the AI Editorial Gate/
      );
    });

    it("should block direct publication if article is not APPROVED", async () => {
      const unapprovedArticle = {
        id: "art-unapproved-direct",
        slug: "unapproved-draft",
        title: "Unapproved Direct Attempt",
        status: ArticleStatus.SUBMITTED,
        gateStatus: GateStatus.PASSED,
        authorId: "user-alpha",
      };
      inMemoryGateDb.articles.set(unapprovedArticle.id, unapprovedArticle);

      await assert.rejects(
        async () => {
          await editorialService.publishArticle("editor-1", unapprovedArticle.id);
        },
        /Cannot publish article in "SUBMITTED" state. Article must be APPROVED./
      );
    });

    it("should allow editor approval when AI Gate is PASSED", async () => {
      const passedArticle = {
        id: "art-gate-passed",
        title: "Verified Original Analysis",
        status: ArticleStatus.SUBMITTED,
        gateStatus: GateStatus.PASSED,
        authorId: "user-alpha",
      };
      inMemoryGateDb.articles.set(passedArticle.id, passedArticle);

      const result = await editorialService.approveArticle("editor-1", passedArticle.id, "High quality piece.");

      assert.equal(result.article.status, ArticleStatus.APPROVED);
    });

    it("should publish an approved article that cleared the gate", async () => {
      const approvedArticle = {
        id: "art-approved-ready",
        slug: "verified-original-analysis",
        title: "Verified Original Analysis",
        status: ArticleStatus.APPROVED,
        gateStatus: GateStatus.PASSED,
        authorId: "user-alpha",
      };
      inMemoryGateDb.articles.set(approvedArticle.id, approvedArticle);

      const published = await editorialService.publishArticle("editor-1", approvedArticle.id);

      assert.equal(published.status, ArticleStatus.PUBLISHED);
    });
  });

  describe("7. Super Admin Override & Audit Logging", () => {
    it("should reject administrative override if justification reason is missing or too short", async () => {
      const rejectedArticle = {
        id: "art-override-fail",
        title: "Rejected Article",
        status: ArticleStatus.SUBMITTED,
        gateStatus: GateStatus.REJECTED,
        authorId: "user-alpha",
      };
      inMemoryGateDb.articles.set(rejectedArticle.id, rejectedArticle);

      await assert.rejects(
        async () => {
          await editorialService.overrideGate("super-admin-1", rejectedArticle.id, ReviewDecision.APPROVE, "short");
        },
        /Administrative override requires a comprehensive justification reason/
      );
    });

    it("should successfully record administrative override with immutable audit log", async () => {
      const rejectedArticle = {
        id: "art-override-success",
        title: "Rejected Article with Valid License",
        status: ArticleStatus.SUBMITTED,
        gateStatus: GateStatus.REJECTED,
        authorId: "user-alpha",
      };
      inMemoryGateDb.articles.set(rejectedArticle.id, rejectedArticle);

      const overrideResult = await editorialService.overrideGate(
        "super-admin-1",
        rejectedArticle.id,
        ReviewDecision.APPROVE,
        "Verified editorial license certificate directly with Getty Images account manager.",
        "192.168.1.100"
      );

      assert.ok(overrideResult.overrideLog);
      assert.equal(overrideResult.overrideLog.previousGateStatus, GateStatus.REJECTED);
      assert.equal(overrideResult.overrideLog.newDecision, ReviewDecision.APPROVE);
      assert.equal(overrideResult.article.gateStatus, GateStatus.PASSED);

      // Now article can be approved
      const approval = await editorialService.approveArticle("editor-1", rejectedArticle.id);
      assert.equal(approval.article.status, ArticleStatus.APPROVED);
    });
  });

  describe("8. Information Isolation & Contributor Role Protection", () => {
    it("should filter out sensitive internal detection formulas when retrieved by contributor", async () => {
      const article = {
        id: "art-isolated-1",
        title: "Tactical Overview",
        body: "mock_medium_similarity: Tactical prose with overlapping wire structure across ninety minutes of match analysis and tactical deconstruction.",
        imageRightsStatus: ImageRightsStatus.OWNED,
        authorId: "user-contributor",
        status: ArticleStatus.SUBMITTED,
        gateStatus: GateStatus.REVIEW,
        sources: [{ sourceName: "Source", sourceUrl: "https://example.com", sourceType: SourceType.OFFICIAL }],
      };
      inMemoryGateDb.articles.set(article.id, article);

      // Run gate to populate findings
      await gateService.runGate(article.id);

      // Contributor views findings
      const contributorFindings: any = await gateService.getFindingsForUser(article.id, {
        id: "user-contributor",
        roles: ["CONTRIBUTOR"],
      });

      assert.ok(contributorFindings);
      assert.equal(contributorFindings.status, GateStatus.REVIEW);

      // Contributor findings should NOT expose raw internal evidence matrices or source match URLs
      for (const finding of contributorFindings.findings) {
        assert.equal(finding.evidence, undefined);
        assert.equal(finding.sourceUrl, undefined);
        assert.ok(finding.recommendation); // Contributor sees actionable fix advice
      }

      // Staff views findings
      const staffFindings: any = await gateService.getFindingsForUser(article.id, {
        id: "user-editor",
        roles: ["SENIOR_EDITOR"],
      });

      assert.ok(staffFindings.findings.length > 0);
      assert.ok(staffFindings.overallScore !== undefined);
    });
  });

  describe("9. Fail-Safe AI Execution & Idempotency", () => {
    it("should NEVER fail-open if the AI Provider throws an unhandled error (Verdict: REVIEW)", async () => {
      const errorArticle = {
        id: "art-ai-err-1",
        title: "Analytical Review During Outage",
        body: "Comprehensive analysis examining progressive passing volume, central overloads, and high block pressing across ninety minutes.",
        category: "Tactical Analysis",
        imageRightsStatus: ImageRightsStatus.OWNED,
        status: ArticleStatus.SUBMITTED,
        gateStatus: GateStatus.NOT_RUN,
        authorId: "user-alpha",
        sources: [{ sourceName: "Stats", sourceUrl: "https://stats.com", sourceType: SourceType.FOOTBALL_DATA }],
      };
      inMemoryGateDb.articles.set(errorArticle.id, errorArticle);

      // Create a faulty AI provider that throws an error
      const faultyAIProvider: EditorialAIProvider = {
        name: "faulty-provider",
        modelName: "faulty-v1",
        analyzeOriginality: async () => {
          throw new Error("External LLM Service Timeout / Outage 504");
        },
        analyzeFacts: async () => ({ score: 100, risk: FindingSeverity.PASS, findings: [] }),
        analyzeClickbait: async () => ({ score: 100, risk: FindingSeverity.PASS, findings: [] }),
        analyzeQuality: async () => ({ score: 100, risk: FindingSeverity.PASS, findings: [] }),
        analyzeStructure: async () => ({ score: 100, risk: FindingSeverity.PASS, findings: [] }),
        analyzeImage: async () => ({ score: 100, risk: FindingSeverity.PASS, findings: [] }),
      };

      gateService.setAIProvider(faultyAIProvider);

      const result = await gateService.runGate(errorArticle.id);

      // Must NOT fail open (must NOT be PASSED)
      assert.notEqual(result.status, GateStatus.PASSED);
      assert.equal(result.status, GateStatus.REVIEW);
      assert.ok(result.findings.some((f) => f.finding.includes("AI Provider analysis failure or timeout")));

      // Restore default mock provider
      gateService.setAIProvider(new (require("../src/lib/editorial/ai-gate/mock-ai.provider").MockEditorialAIProvider)());
    });

    it("should be idempotent across repeated gate runs without corrupting previous run history", async () => {
      const repeatableArticle = {
        id: "art-repeatable-1",
        title: "Idempotent Gate Analysis Piece",
        body: "A comprehensive tactical breakdown analyzing transitional passing and rest defense across ninety minutes of competitive action. Overloads in central areas created clear passing options throughout both halves, neutralizing opposition counters and sustaining territorial control in the final third. Wing-backs supported the wide progression channels with disciplined recovery runs to preserve defensive compactness.",
        category: "Tactical Analysis",
        imageRightsStatus: ImageRightsStatus.OWNED,
        status: ArticleStatus.SUBMITTED,
        gateStatus: GateStatus.NOT_RUN,
        authorId: "user-alpha",
        sources: [{ sourceName: "Official", sourceUrl: "https://league.com", sourceType: SourceType.OFFICIAL }],
      };
      inMemoryGateDb.articles.set(repeatableArticle.id, repeatableArticle);

      // Run 1
      const run1 = await gateService.runGate(repeatableArticle.id);
      assert.equal(run1.status, GateStatus.PASSED);

      // Run 2
      const run2 = await gateService.runGate(repeatableArticle.id);
      assert.equal(run2.status, GateStatus.PASSED);

      // Verify article state is consistent and latest run is preserved
      const latest = await gateService.getLatestGateRun(repeatableArticle.id);
      assert.ok(latest);
      assert.equal(latest.status, GateStatus.PASSED);
    });
  });
});
