import { NotificationProvider, NotificationPayload, NotificationChannel } from "./notification-provider.interface";

export class MockNotificationProvider implements NotificationProvider {
  public readonly providerName = "mock-notification-provider";
  public readonly status = "MOCK" as const;

  public async send(payload: NotificationPayload): Promise<{ success: boolean; deliveredChannels: NotificationChannel[] }> {
    const channels: NotificationChannel[] = payload.channels || ["IN_APP"];

    // Mock successful dispatch for configured channels
    return {
      success: true,
      deliveredChannels: channels,
    };
  }
}
