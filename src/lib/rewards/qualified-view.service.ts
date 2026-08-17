import { prisma } from "@/lib/db";
import { QualifiedViewStatus, FraudSignalType, FraudSignalSeverity } from "@prisma/client";
import { ViewEventPayload, QualifiedViewResult } from "./types";
import { getCachedData, setCachedData, checkRateLimit } from "@/lib/redis";
import crypto from "crypto";

export class QualifiedViewService {
  private static instance: QualifiedViewService;

  private constructor() {}

  public static getInstance(): QualifiedViewService {
    if (!QualifiedViewService.instance) {
      QualifiedViewService.instance = new QualifiedViewService();
    }
    return QualifiedViewService.instance;
  }

  /**
   * Ingest and validate a raw pageview event to determine if it meets qualification criteria
   */
  public async ingestViewEvent(payload: ViewEventPayload): Promise<QualifiedViewResult> {
    const {
      articleId,
      sessionFingerprint,
      readTimeSeconds = 0,
      scrollDepthPercent = 0,
      userAgent = "",
      ipAddress = "",
    } = payload;

    // 1. Verify Article Exists and has an Author Profile
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, contributorProfileId: true, authorId: true, status: true },
    });

    if (!article || !article.contributorProfileId) {
      return {
        status: QualifiedViewStatus.REJECTED,
        isQualified: false,
        rejectionReason: "Article not found or not linked to a contributor profile.",
        fingerprintHash: "unknown",
      };
    }

    // 2. Compute Privacy-Preserving Hashes
    const ipHash = ipAddress ? crypto.createHash("sha256").update(ipAddress).digest("hex") : null;
    const userAgentHash = userAgent ? crypto.createHash("sha256").update(userAgent).digest("hex") : null;
    const deduplicationKey = `view_dedup:${articleId}:${sessionFingerprint || ipHash || "anon"}`;

    // 3. Bot Detection
    const isBot = this.detectBotUserAgent(userAgent);
    if (isBot) {
      await this.persistViewRecord({
        articleId: article.id,
        contributorProfileId: article.contributorProfileId,
        sessionFingerprint: sessionFingerprint || "bot_session",
        ipHash,
        userAgentHash,
        status: QualifiedViewStatus.REJECTED,
        rejectionReason: "Automated scraper or crawler user-agent detected.",
        readTimeSeconds,
        scrollDepthPercent,
        isBot: true,
      });

      return {
        status: QualifiedViewStatus.REJECTED,
        isQualified: false,
        rejectionReason: "Bot traffic is not eligible for rewards.",
        fingerprintHash: sessionFingerprint,
      };
    }

    // 4. Deduplication: Check if session viewed this article in the last 30 minutes (1800s)
    const existingView = await getCachedData<boolean>(deduplicationKey);
    if (existingView) {
      return {
        status: QualifiedViewStatus.REJECTED,
        isQualified: false,
        rejectionReason: "Duplicate view within the deduplication window.",
        fingerprintHash: sessionFingerprint,
      };
    }

    // 5. Velocity / Refresh Spike Check (Rate limit: max 60 views per minute per article from same IP)
    const velocityCheck = await checkRateLimit(`view_rate:${articleId}:${ipHash || "global"}`, 60, 60);
    const isSuspiciousVelocity = !velocityCheck.success;

    // 6. Quality & Dwell Criteria: Minimum 15 seconds dwell time OR 30% scroll depth
    const meetsDwellCriteria = readTimeSeconds >= 15 || scrollDepthPercent >= 30;

    let finalStatus: QualifiedViewStatus;
    let rejectionReason: string | undefined;

    if (isSuspiciousVelocity) {
      finalStatus = QualifiedViewStatus.SUSPICIOUS;
      rejectionReason = "High view velocity / burst rate detected.";
    } else if (!meetsDwellCriteria) {
      finalStatus = QualifiedViewStatus.REJECTED;
      rejectionReason = "Dwell time or scroll depth below minimum threshold (15s / 30%).";
    } else {
      finalStatus = QualifiedViewStatus.QUALIFIED;
    }

    // Mark deduplication cache for 30 minutes
    await setCachedData(deduplicationKey, true, 1800);

    // Persist Qualified View Record
    await this.persistViewRecord({
      articleId: article.id,
      contributorProfileId: article.contributorProfileId,
      sessionFingerprint: sessionFingerprint || "anon_session",
      ipHash,
      userAgentHash,
      status: finalStatus,
      rejectionReason,
      readTimeSeconds,
      scrollDepthPercent,
      isBot: false,
    });

    return {
      status: finalStatus,
      isQualified: finalStatus === QualifiedViewStatus.QUALIFIED,
      rejectionReason,
      fingerprintHash: sessionFingerprint,
    };
  }

  /**
   * Get total qualified views count for an article
   */
  public async getQualifiedViewsCount(articleId: string): Promise<number> {
    try {
      return await prisma.qualifiedView.count({
        where: {
          articleId,
          status: QualifiedViewStatus.QUALIFIED,
        },
      });
    } catch {
      return 0;
    }
  }

  /**
   * Detect bot, scraper, or headless browser patterns
   */
  private detectBotUserAgent(userAgent: string): boolean {
    if (!userAgent) return false;
    const botPattern = /bot|crawler|spider|crawling|headless|puppeteer|selenium|phantom|curl|wget|python-requests|axios|httpclient/i;
    return botPattern.test(userAgent);
  }

  private async persistViewRecord(data: {
    articleId: string;
    contributorProfileId: string;
    sessionFingerprint: string;
    ipHash: string | null;
    userAgentHash: string | null;
    status: QualifiedViewStatus;
    rejectionReason?: string;
    readTimeSeconds: number;
    scrollDepthPercent: number;
    isBot: boolean;
  }) {
    try {
      await prisma.qualifiedView.create({
        data: {
          articleId: data.articleId,
          contributorProfileId: data.contributorProfileId,
          sessionFingerprint: data.sessionFingerprint,
          ipHash: data.ipHash,
          userAgentHash: data.userAgentHash,
          status: data.status,
          rejectionReason: data.rejectionReason || null,
          readTimeSeconds: data.readTimeSeconds,
          scrollDepthPercent: data.scrollDepthPercent,
          isBot: data.isBot,
        },
      });
    } catch (err) {
      // In-memory or logging fallback
      console.warn("[QualifiedViewService persist warning]:", err);
    }
  }
}

export const qualifiedViewService = QualifiedViewService.getInstance();
