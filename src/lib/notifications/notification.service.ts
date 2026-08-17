import { prisma } from "@/lib/db";
import { NotificationProvider, NotificationPayload, NotificationChannel } from "./notification-provider.interface";
import { MockNotificationProvider } from "./mock-notification.provider";
import { NotificationType } from "@prisma/client";

export class NotificationService {
  private static instance: NotificationService;
  private provider: NotificationProvider;

  private constructor() {
    this.provider = new MockNotificationProvider();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Retrieves or creates default notification preferences for a user
   */
  public async getPreferences(userId: string) {
    return await prisma.notificationPreference.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  /**
   * Updates user notification preferences
   */
  public async updatePreferences(userId: string, data: Partial<{
    breakingNews: boolean;
    transfers: boolean;
    matchResults: boolean;
    favoriteClubs: boolean;
    articlePublished: boolean;
    financialPayouts: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    inAppNotifications: boolean;
  }>) {
    return await prisma.notificationPreference.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }

  /**
   * Dispatches a notification respecting user channel preferences and subscription categories
   */
  public async dispatch(payload: NotificationPayload) {
    const prefs = await this.getPreferences(payload.userId);

    // Evaluate preference eligibility
    if (payload.type === "BREAKING_NEWS" && !prefs.breakingNews) return { delivered: false, reason: "Muted by user" };
    if (payload.type === "TRANSFER" && !prefs.transfers) return { delivered: false, reason: "Muted by user" };
    if (payload.type === "MATCH_RESULT" && !prefs.matchResults) return { delivered: false, reason: "Muted by user" };

    const enabledChannels: NotificationChannel[] = [];
    if (prefs.inAppNotifications) enabledChannels.push("IN_APP");
    if (prefs.emailNotifications) enabledChannels.push("EMAIL");
    if (prefs.pushNotifications) enabledChannels.push("PUSH");

    if (enabledChannels.length === 0) {
      return { delivered: false, reason: "All notification channels disabled" };
    }

    // Persist in-app notification record if IN_APP channel is active
    if (enabledChannels.includes("IN_APP")) {
      try {
        await prisma.contributorNotification.create({
          data: {
            userId: payload.userId,
            type: (payload.type as NotificationType) || NotificationType.ARTICLE_PUBLISHED,
            title: payload.title,
            message: payload.message,
            linkUrl: payload.linkUrl,
          },
        });
      } catch (err) {
        console.warn("Failed to create in-app notification record:", err);
      }
    }

    // Dispatch via Provider
    return await this.provider.send({
      ...payload,
      channels: enabledChannels,
    });
  }
}

export const notificationService = NotificationService.getInstance();
