import { prisma } from "@/lib/db";
import { sanitizeRichText, generateSlug, calculateReadTime } from "@/lib/security/sanitizer";
import {
  ArticleStatus,
  ImageRightsStatus,
  SourceType,
  SubmissionStatus,
  NotificationType,
  ContributorStatus,
  ApplicationStatus,
} from "@prisma/client";
import { editorialGateService } from "@/lib/editorial/ai-gate/editorial-gate.service";

export interface CreateApplicationInput {
  fullName: string;
  displayName: string;
  email: string;
  password?: string;
  country: string;
  preferredLanguage?: string;
  footballInterests: string;
  preferredCategories: string;
  shortBio: string;
  writingExperience: string;
  portfolioUrl?: string;
  socialUrl?: string;
  agreementAccepted: boolean;
  originalityDeclared: boolean;
  copyrightDeclared: boolean;
}

export interface CreateArticleDraftInput {
  title: string;
  subtitle?: string;
  excerpt?: string;
  body: string;
  category: string;
  featuredImageUrl?: string;
  featuredImageCaption?: string;
  imageRightsStatus?: ImageRightsStatus;
  imageAttribution?: string;
  imageSource?: string;
  competitionId?: string;
  teamId?: string;
  playerId?: string;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  sources?: {
    sourceName: string;
    sourceUrl: string;
    sourceType: SourceType;
    notes?: string;
  }[];
}

export interface UpdateArticleDraftInput extends Partial<CreateArticleDraftInput> {
  changeSummary?: string;
}

export class ContributorService {
  private static instance: ContributorService;

  private constructor() {}

  public static getInstance(): ContributorService {
    if (!ContributorService.instance) {
      ContributorService.instance = new ContributorService();
    }
    return ContributorService.instance;
  }

  // ==========================================
  // 1. APPLICATION & ONBOARDING
  // ==========================================

  public async applyContributor(data: CreateApplicationInput, userId?: string) {
    // Check for existing pending application with same email
    const existing = await prisma.contributorApplication.findFirst({
      where: {
        email: data.email.toLowerCase().trim(),
        status: { in: [ApplicationStatus.PENDING, ApplicationStatus.UNDER_REVIEW] },
      },
    });

    if (existing) {
      throw new Error("An active application with this email address is already under review.");
    }

    return await prisma.contributorApplication.create({
      data: {
        userId: userId || null,
        fullName: data.fullName.trim(),
        displayName: data.displayName.trim(),
        email: data.email.toLowerCase().trim(),
        country: data.country.trim(),
        preferredLanguage: data.preferredLanguage || "en",
        footballInterests: data.footballInterests.trim(),
        preferredCategories: data.preferredCategories.trim(),
        shortBio: data.shortBio.trim(),
        writingExperience: data.writingExperience.trim(),
        portfolioUrl: data.portfolioUrl?.trim() || null,
        socialUrl: data.socialUrl?.trim() || null,
        agreementAccepted: data.agreementAccepted,
        originalityDeclared: data.originalityDeclared,
        copyrightDeclared: data.copyrightDeclared,
        status: ApplicationStatus.PENDING,
      },
    });
  }

  // ==========================================
  // 2. PROFILE & TRUST SCORE
  // ==========================================

  public async getContributorProfile(userId: string) {
    let profile = await prisma.contributorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
      },
    });

    // Auto-create contributor profile if user has CONTRIBUTOR or EDITOR role
    if (!profile) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { roles: { include: { role: true } } },
      });

      if (user) {
        const slug = `${generateSlug(user.fullName)}-${user.id.slice(-4)}`;
        profile = await prisma.contributorProfile.create({
          data: {
            userId: user.id,
            slug,
            displayName: user.fullName,
            country: "Global",
            status: ContributorStatus.ACTIVE,
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
                avatarUrl: true,
                createdAt: true,
              },
            },
          },
        });
      }
    }

    return profile;
  }

  public async updateContributorProfile(
    userId: string,
    data: {
      displayName?: string;
      bio?: string;
      country?: string;
      preferredLanguage?: string;
      footballInterests?: string[];
      portfolioUrl?: string;
      avatarUrl?: string;
    }
  ) {
    const profile = await this.getContributorProfile(userId);
    if (!profile) throw new Error("Contributor profile not found");

    return await prisma.contributorProfile.update({
      where: { id: profile.id },
      data: {
        displayName: data.displayName?.trim() || profile.displayName,
        bio: data.bio !== undefined ? data.bio?.trim() : profile.bio,
        country: data.country?.trim() || profile.country,
        preferredLanguage: data.preferredLanguage || profile.preferredLanguage,
        footballInterests: data.footballInterests !== undefined ? data.footballInterests : (profile.footballInterests as any),
        portfolioUrl: data.portfolioUrl !== undefined ? data.portfolioUrl?.trim() : profile.portfolioUrl,
        avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl?.trim() : profile.avatarUrl,
      },
    });
  }

  // ==========================================
  // 3. ARTICLE CREATION & DRAFT SYSTEM
  // ==========================================

  public async createArticleDraft(userId: string, data: CreateArticleDraftInput) {
    const profile = await this.getContributorProfile(userId);
    const sanitizedBody = sanitizeRichText(data.body || "");
    const { wordCount, readTimeMinutes } = calculateReadTime(sanitizedBody);

    const baseSlug = generateSlug(data.title);
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-6)}`;

    // Create article record
    const article = await prisma.article.create({
      data: {
        slug: uniqueSlug,
        title: data.title.trim(),
        subtitle: data.subtitle?.trim() || null,
        excerpt: data.excerpt?.trim() || data.title.trim(),
        body: sanitizedBody,
        featuredImageUrl: data.featuredImageUrl?.trim() || null,
        featuredImageCaption: data.featuredImageCaption?.trim() || null,
        imageRightsStatus: data.imageRightsStatus || ImageRightsStatus.UNKNOWN,
        imageAttribution: data.imageAttribution?.trim() || null,
        imageSource: data.imageSource?.trim() || null,
        status: ArticleStatus.DRAFT,
        category: data.category.trim(),
        tags: data.tags || [],
        seoTitle: data.seoTitle?.trim() || data.title.trim(),
        seoDescription: data.seoDescription?.trim() || data.excerpt?.trim() || null,
        wordCount,
        readTimeMinutes,
        authorId: userId,
        contributorProfileId: profile?.id || null,
        competitionId: data.competitionId || null,
        teamId: data.teamId || null,
        playerId: data.playerId || null,
        sources: {
          create: (data.sources || []).map((s) => ({
            sourceName: s.sourceName.trim(),
            sourceUrl: s.sourceUrl.trim(),
            sourceType: s.sourceType || SourceType.NEWS_REPORT,
            notes: s.notes?.trim() || null,
          })),
        },
      },
      include: {
        sources: true,
      },
    });

    // Record initial revision
    await prisma.articleRevision.create({
      data: {
        articleId: article.id,
        revisionNumber: 1,
        title: article.title,
        body: article.body,
        metadataSnapshot: {
          subtitle: article.subtitle,
          category: article.category,
          tags: article.tags,
          imageRightsStatus: article.imageRightsStatus,
          sources: article.sources,
        },
        changeSummary: "Initial draft created",
        createdByUserId: userId,
      },
    });

    return article;
  }

  public async getContributorArticles(
    userId: string,
    filter?: { status?: ArticleStatus; page?: number; limit?: number }
  ) {
    const page = filter?.page || 1;
    const limit = filter?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      authorId: userId, // STRICT SERVER-SIDE OWNERSHIP
    };

    if (filter?.status) {
      where.status = filter.status;
    }

    const [total, articles] = await Promise.all([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          sources: true,
          reviews: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              decision: true,
              contributorFeedback: true, // Only contributor feedback, NO internalNotes
              createdAt: true,
            },
          },
        },
      }),
    ]);

    return {
      articles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async getArticleDetail(userId: string, articleId: string) {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        sources: true,
        revisions: {
          orderBy: { revisionNumber: "desc" },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            decision: true,
            contributorFeedback: true, // STRICT: Hide internalNotes from contributor
            createdAt: true,
          },
        },
        competition: { select: { id: true, name: true, code: true } },
        team: { select: { id: true, name: true, tla: true } },
        player: { select: { id: true, name: true, position: true } },
      },
    });

    if (!article) return null;

    // STRICT IDOR CHECK: Contributor can only access their own article
    if (article.authorId !== userId) {
      return null;
    }

    return article;
  }

  public async updateArticleDraft(
    userId: string,
    articleId: string,
    data: UpdateArticleDraftInput
  ) {
    // 1. Fetch and verify ownership
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: { sources: true, revisions: true },
    });

    if (!article || article.authorId !== userId) {
      throw new Error("Article not found or unauthorized access.");
    }

    // 2. State verification: Can only edit DRAFT or REVISION_REQUIRED
    if (
      article.status !== ArticleStatus.DRAFT &&
      article.status !== ArticleStatus.REVISION_REQUIRED
    ) {
      throw new Error(
        `Cannot edit article in "${article.status}" status. Only DRAFT and REVISION_REQUIRED articles can be edited.`
      );
    }

    const sanitizedBody = data.body ? sanitizeRichText(data.body) : article.body;
    const { wordCount, readTimeMinutes } = calculateReadTime(sanitizedBody);

    // 3. Handle sources update if provided
    if (data.sources) {
      await prisma.articleSource.deleteMany({ where: { articleId } });
      await prisma.articleSource.createMany({
        data: data.sources.map((s) => ({
          articleId,
          sourceName: s.sourceName.trim(),
          sourceUrl: s.sourceUrl.trim(),
          sourceType: s.sourceType || SourceType.NEWS_REPORT,
          notes: s.notes?.trim() || null,
        })),
      });
    }

    // 4. Update Article
    const updated = await prisma.article.update({
      where: { id: articleId },
      data: {
        title: data.title !== undefined ? data.title.trim() : article.title,
        subtitle: data.subtitle !== undefined ? data.subtitle?.trim() : article.subtitle,
        excerpt: data.excerpt !== undefined ? data.excerpt?.trim() : article.excerpt,
        body: sanitizedBody,
        category: data.category !== undefined ? data.category.trim() : article.category,
        featuredImageUrl: data.featuredImageUrl !== undefined ? data.featuredImageUrl?.trim() : article.featuredImageUrl,
        featuredImageCaption: data.featuredImageCaption !== undefined ? data.featuredImageCaption?.trim() : article.featuredImageCaption,
        imageRightsStatus: data.imageRightsStatus !== undefined ? data.imageRightsStatus : article.imageRightsStatus,
        imageAttribution: data.imageAttribution !== undefined ? data.imageAttribution?.trim() : article.imageAttribution,
        imageSource: data.imageSource !== undefined ? data.imageSource?.trim() : article.imageSource,
        tags: data.tags !== undefined ? data.tags : (article.tags as any),
        seoTitle: data.seoTitle !== undefined ? data.seoTitle?.trim() : article.seoTitle,
        seoDescription: data.seoDescription !== undefined ? data.seoDescription?.trim() : article.seoDescription,
        wordCount,
        readTimeMinutes,
        competitionId: data.competitionId !== undefined ? data.competitionId : article.competitionId,
        teamId: data.teamId !== undefined ? data.teamId : article.teamId,
        playerId: data.playerId !== undefined ? data.playerId : article.playerId,
      },
      include: {
        sources: true,
      },
    });

    // 5. Create new revision snapshot
    const nextRevisionNumber = (article.revisions.length || 0) + 1;
    await prisma.articleRevision.create({
      data: {
        articleId,
        revisionNumber: nextRevisionNumber,
        title: updated.title,
        body: updated.body,
        metadataSnapshot: {
          subtitle: updated.subtitle,
          category: updated.category,
          tags: updated.tags as any,
          imageRightsStatus: updated.imageRightsStatus,
          sources: (updated as any).sources || [],
        },
        changeSummary: data.changeSummary || `Revision ${nextRevisionNumber} saved`,
        createdByUserId: userId,
      },
    });

    return updated;
  }

  public async deleteArticleDraft(userId: string, articleId: string) {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article || article.authorId !== userId) {
      throw new Error("Article not found or unauthorized.");
    }

    if (article.status !== ArticleStatus.DRAFT) {
      throw new Error("Only DRAFT articles can be deleted.");
    }

    await prisma.article.delete({ where: { id: articleId } });
    return { success: true };
  }

  // ==========================================
  // 4. SUBMISSION GATEWAY & VALIDATION
  // ==========================================

  public async submitArticle(userId: string, articleId: string, notes?: string) {
    // 1. Ownership & State check
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: { sources: true },
    });

    if (!article || article.authorId !== userId) {
      throw new Error("Article not found or unauthorized access.");
    }

    if (
      article.status !== ArticleStatus.DRAFT &&
      article.status !== ArticleStatus.REVISION_REQUIRED
    ) {
      throw new Error(`Cannot submit article in "${article.status}" state.`);
    }

    // 2. Submission Validation Rules
    const missingRequirements: string[] = [];

    if (!article.title || article.title.trim().length < 10) {
      missingRequirements.push("Title must be at least 10 characters.");
    }
    if (!article.body || article.wordCount < 50) {
      missingRequirements.push("Article body must be at least 50 words.");
    }
    if (!article.category) {
      missingRequirements.push("Category must be selected.");
    }
    if (!article.sources || article.sources.length === 0) {
      missingRequirements.push("At least one verified editorial source reference is required.");
    }
    if (article.imageRightsStatus === ImageRightsStatus.UNKNOWN) {
      missingRequirements.push(
        "Featured image rights status cannot be UNKNOWN. Specify OWNED, LICENSED, OFFICIAL_PRESS, PUBLIC_DOMAIN, or PERMISSION_GRANTED."
      );
    }
    if (!article.seoTitle || article.seoTitle.trim().length < 5) {
      missingRequirements.push("SEO Meta Title is required.");
    }
    if (!article.seoDescription || article.seoDescription.trim().length < 10) {
      missingRequirements.push("SEO Meta Description is required.");
    }

    if (missingRequirements.length > 0) {
      throw new Error(`Submission blocked by Editorial Gate:\n- ${missingRequirements.join("\n- ")}`);
    }

    // 3. Create Submission record and update status
    const submission = await prisma.articleSubmission.create({
      data: {
        articleId,
        contributorId: userId,
        status: SubmissionStatus.PENDING,
        notes: notes?.trim() || null,
      },
    });

    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: {
        status: ArticleStatus.SUBMITTED,
      },
    });

    // 4. Create Notification
    await prisma.contributorNotification.create({
      data: {
        userId,
        type: NotificationType.ARTICLE_SUBMITTED,
        title: "Article Submitted for Review",
        message: `Your article "${article.title}" was submitted to the Editorial Desk.`,
        linkUrl: `/contributor/articles/${article.id}/edit`,
      },
    });

    // 5. Trigger AI Editorial Gate Pipeline automatically
    try {
      await editorialGateService.runGate(articleId, submission.id);
    } catch (gateErr) {
      console.warn(`[AI Editorial Gate Warning on submit]:`, gateErr);
    }

    return { submission, article: updatedArticle };
  }

  public async withdrawArticle(userId: string, articleId: string) {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article || article.authorId !== userId) {
      throw new Error("Article not found or unauthorized.");
    }

    if (article.status !== ArticleStatus.SUBMITTED && article.status !== ArticleStatus.IN_REVIEW) {
      throw new Error("Only SUBMITTED or IN_REVIEW articles can be withdrawn.");
    }

    // Cancel active submissions
    await prisma.articleSubmission.updateMany({
      where: { articleId, status: { in: [SubmissionStatus.PENDING, SubmissionStatus.IN_REVIEW] } },
      data: { status: SubmissionStatus.CANCELLED },
    });

    return await prisma.article.update({
      where: { id: articleId },
      data: { status: ArticleStatus.DRAFT },
    });
  }

  // ==========================================
  // 5. NOTIFICATIONS & ANALYTICS
  // ==========================================

  public async getNotifications(userId: string) {
    return await prisma.contributorNotification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  public async markNotificationRead(userId: string, notificationId: string) {
    const notif = await prisma.contributorNotification.findUnique({
      where: { id: notificationId },
    });

    if (!notif || notif.userId !== userId) {
      throw new Error("Notification not found or unauthorized.");
    }

    return await prisma.contributorNotification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  public async getDashboardMetrics(userId: string) {
    const [total, drafts, submitted, inReview, revisionRequired, published, rejected] =
      await Promise.all([
        prisma.article.count({ where: { authorId: userId } }),
        prisma.article.count({ where: { authorId: userId, status: ArticleStatus.DRAFT } }),
        prisma.article.count({ where: { authorId: userId, status: ArticleStatus.SUBMITTED } }),
        prisma.article.count({ where: { authorId: userId, status: ArticleStatus.IN_REVIEW } }),
        prisma.article.count({ where: { authorId: userId, status: ArticleStatus.REVISION_REQUIRED } }),
        prisma.article.count({ where: { authorId: userId, status: ArticleStatus.PUBLISHED } }),
        prisma.article.count({ where: { authorId: userId, status: ArticleStatus.REJECTED } }),
      ]);

    const recentActivity = await prisma.article.findMany({
      where: { authorId: userId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        category: true,
        updatedAt: true,
      },
    });

    return {
      total,
      drafts,
      submitted: submitted + inReview,
      revisionRequired,
      published,
      rejected,
      recentActivity,
    };
  }
}

export const contributorService = ContributorService.getInstance();
