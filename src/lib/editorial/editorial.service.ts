import { prisma } from "@/lib/db";
import {
  ArticleStatus,
  ReviewDecision,
  SubmissionStatus,
  NotificationType,
} from "@prisma/client";

export interface ReviewQueueFilters {
  status?: ArticleStatus;
  category?: string;
  page?: number;
  limit?: number;
}

export class EditorialService {
  private static instance: EditorialService;

  private constructor() {}

  public static getInstance(): EditorialService {
    if (!EditorialService.instance) {
      EditorialService.instance = new EditorialService();
    }
    return EditorialService.instance;
  }

  /**
   * Get editorial queue of submitted / in-review articles
   */
  public async getReviewQueue(filters?: ReviewQueueFilters) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    } else {
      // Default to articles needing editorial attention
      where.status = {
        in: [
          ArticleStatus.SUBMITTED,
          ArticleStatus.IN_REVIEW,
          ArticleStatus.REVISION_REQUIRED,
          ArticleStatus.APPROVED,
          ArticleStatus.REJECTED,
        ],
      };
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    const [total, articles] = await Promise.all([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
            },
          },
          contributorProfile: {
            select: {
              id: true,
              displayName: true,
              slug: true,
              overallTrustScore: true,
            },
          },
          sources: true,
          submissions: {
            orderBy: { submittedAt: "desc" },
            take: 1,
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

  /**
   * Get comprehensive article review detail for staff
   */
  public async getReviewDetail(articleId: string) {
    return await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
        contributorProfile: true,
        sources: true,
        revisions: {
          orderBy: { revisionNumber: "desc" },
        },
        submissions: {
          orderBy: { submittedAt: "desc" },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          include: {
            reviewer: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
        competition: { select: { id: true, name: true, code: true } },
        team: { select: { id: true, name: true, tla: true } },
        player: { select: { id: true, name: true, position: true } },
      },
    });
  }

  /**
   * Approve an article in review
   */
  public async approveArticle(
    reviewerId: string,
    articleId: string,
    internalNotes?: string
  ) {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        submissions: {
          where: { status: { in: [SubmissionStatus.PENDING, SubmissionStatus.IN_REVIEW] } },
          orderBy: { submittedAt: "desc" },
          take: 1,
        },
      },
    });

    if (!article) throw new Error("Article not found.");

    // Contributor cannot self-approve
    if (article.authorId === reviewerId) {
      throw new Error("Security Violation: Contributors cannot approve their own articles.");
    }

    const latestSubmission = article.submissions[0];

    // Update submission status if exists
    if (latestSubmission) {
      await prisma.articleSubmission.update({
        where: { id: latestSubmission.id },
        data: { status: SubmissionStatus.APPROVED, reviewedAt: new Date() },
      });
    }

    // Record editorial review
    const review = await prisma.editorialReview.create({
      data: {
        articleId,
        submissionId: latestSubmission?.id || null,
        reviewerId,
        decision: ReviewDecision.APPROVE,
        internalNotes: internalNotes?.trim() || null,
        contributorFeedback: "Article approved for publication by Editorial Desk.",
      },
    });

    // Update article state to APPROVED
    const updated = await prisma.article.update({
      where: { id: articleId },
      data: {
        status: ArticleStatus.APPROVED,
      },
    });

    // Notify contributor
    await prisma.contributorNotification.create({
      data: {
        userId: article.authorId,
        type: NotificationType.ARTICLE_APPROVED,
        title: "Article Approved",
        message: `Your article "${article.title}" has been approved by the Editorial Desk.`,
        linkUrl: `/contributor/articles/${article.id}/edit`,
      },
    });

    return { review, article: updated };
  }

  /**
   * Request revisions from contributor
   */
  public async requestRevision(
    reviewerId: string,
    articleId: string,
    feedback: string,
    internalNotes?: string
  ) {
    if (!feedback || feedback.trim().length < 5) {
      throw new Error("Contributor revision feedback is required when requesting changes.");
    }

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        submissions: {
          where: { status: { in: [SubmissionStatus.PENDING, SubmissionStatus.IN_REVIEW] } },
          orderBy: { submittedAt: "desc" },
          take: 1,
        },
      },
    });

    if (!article) throw new Error("Article not found.");

    // Contributor cannot review own article
    if (article.authorId === reviewerId) {
      throw new Error("Security Violation: Contributors cannot review their own articles.");
    }

    const latestSubmission = article.submissions[0];

    if (latestSubmission) {
      await prisma.articleSubmission.update({
        where: { id: latestSubmission.id },
        data: { status: SubmissionStatus.REVISION_REQUIRED, reviewedAt: new Date() },
      });
    }

    const review = await prisma.editorialReview.create({
      data: {
        articleId,
        submissionId: latestSubmission?.id || null,
        reviewerId,
        decision: ReviewDecision.REQUEST_REVISION,
        internalNotes: internalNotes?.trim() || null,
        contributorFeedback: feedback.trim(),
      },
    });

    const updated = await prisma.article.update({
      where: { id: articleId },
      data: {
        status: ArticleStatus.REVISION_REQUIRED,
      },
    });

    await prisma.contributorNotification.create({
      data: {
        userId: article.authorId,
        type: NotificationType.REVISION_REQUESTED,
        title: "Revision Requested on Your Article",
        message: `The Editorial Desk requested revisions on "${article.title}": ${feedback.slice(0, 100)}...`,
        linkUrl: `/contributor/articles/${article.id}/edit`,
      },
    });

    return { review, article: updated };
  }

  /**
   * Reject an article
   */
  public async rejectArticle(
    reviewerId: string,
    articleId: string,
    feedback?: string,
    internalNotes?: string
  ) {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        submissions: {
          where: { status: { in: [SubmissionStatus.PENDING, SubmissionStatus.IN_REVIEW] } },
          orderBy: { submittedAt: "desc" },
          take: 1,
        },
      },
    });

    if (!article) throw new Error("Article not found.");

    if (article.authorId === reviewerId) {
      throw new Error("Security Violation: Contributors cannot review their own articles.");
    }

    const latestSubmission = article.submissions[0];

    if (latestSubmission) {
      await prisma.articleSubmission.update({
        where: { id: latestSubmission.id },
        data: { status: SubmissionStatus.REJECTED, reviewedAt: new Date() },
      });
    }

    const review = await prisma.editorialReview.create({
      data: {
        articleId,
        submissionId: latestSubmission?.id || null,
        reviewerId,
        decision: ReviewDecision.REJECT,
        internalNotes: internalNotes?.trim() || null,
        contributorFeedback: feedback?.trim() || "Article rejected by Editorial Desk.",
      },
    });

    const updated = await prisma.article.update({
      where: { id: articleId },
      data: {
        status: ArticleStatus.REJECTED,
      },
    });

    await prisma.contributorNotification.create({
      data: {
        userId: article.authorId,
        type: NotificationType.ARTICLE_REJECTED,
        title: "Article Not Accepted",
        message: `Your article "${article.title}" was not accepted for publication.`,
        linkUrl: `/contributor/articles/${article.id}/edit`,
      },
    });

    return { review, article: updated };
  }

  /**
   * Publish an approved article
   */
  public async publishArticle(reviewerId: string, articleId: string) {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) throw new Error("Article not found.");

    if (article.status !== ArticleStatus.APPROVED && article.status !== ArticleStatus.DRAFT) {
      throw new Error(`Cannot publish article in "${article.status}" state.`);
    }

    const updated = await prisma.article.update({
      where: { id: articleId },
      data: {
        status: ArticleStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    await prisma.contributorNotification.create({
      data: {
        userId: article.authorId,
        type: NotificationType.ARTICLE_PUBLISHED,
        title: "Article Published Live!",
        message: `Your article "${article.title}" is now published and live on the network.`,
        linkUrl: `/news/${article.slug}`,
      },
    });

    return updated;
  }
}

export const editorialService = EditorialService.getInstance();
