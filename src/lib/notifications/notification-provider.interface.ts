export type NotificationChannel = "IN_APP" | "EMAIL" | "PUSH";

export interface NotificationPayload {
  userId: string;
  type: string;
  title: string;
  message: string;
  linkUrl?: string;
  channels?: NotificationChannel[];
  metadata?: Record<string, any>;
}

export interface NotificationProvider {
  readonly providerName: string;
  readonly status: "MOCK" | "ACTIVE";
  send(payload: NotificationPayload): Promise<{ success: boolean; deliveredChannels: NotificationChannel[] }>;
}
