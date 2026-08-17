import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { contributorService } from "@/lib/contributor/contributor.service";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Bell, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ContributorNotificationsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/contributor");
  }

  let notifications: any[] = [];
  try {
    notifications = await contributorService.getNotifications(user.id);
  } catch (error) {
    // Database fallback
  }

  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        <SectionHeader
          title="Editorial Alerts & Lifecycle Notifications"
          subtitle="Updates on your submitted articles, review decisions, and revision requests"
          badgeText="Alerts"
        />

        <div className="bg-pitch-900 border border-pitch-800 overflow-hidden">
          <div className="p-4 bg-pitch-950 border-b border-pitch-800 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-sans">
              Recent In-App Notifications
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {notifications.length} Total
            </span>
          </div>

          {notifications.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-slate-500">
              No notifications yet. You will receive updates here when your articles are reviewed.
            </div>
          ) : (
            <div className="divide-y divide-pitch-800">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-4 flex items-start justify-between gap-4 hover:bg-pitch-850 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Bell className="w-4 h-4 text-brand-green mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-100 font-sans">
                          {notif.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-sans leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </div>

                  {notif.linkUrl && (
                    <Link
                      href={notif.linkUrl}
                      className="px-3 py-1 text-xs font-semibold bg-pitch-800 hover:bg-pitch-750 text-slate-200 border border-pitch-700 shrink-0"
                    >
                      View
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
