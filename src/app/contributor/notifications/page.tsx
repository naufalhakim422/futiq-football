import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { contributorService } from "@/lib/contributor/contributor.service";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Clock,
  ArrowLeft,
  FileCheck2,
  Send,
  XCircle,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";

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
        <div className="flex items-center justify-between">
          <Link
            href="/contributor"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Contributor Desk</span>
          </Link>
        </div>

        <SectionHeader
          title="Editorial Alerts & Dispatch Center"
          subtitle="Real-time lifecycle telemetry on your article submissions, review decisions, and revision memoranda"
          badgeText={`${notifications.length} Alerts`}
        />

        <div className="bg-pitch-900 border border-pitch-800 overflow-hidden shadow-xl">
          <div className="p-4 sm:p-5 bg-pitch-950 border-b border-pitch-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-brand-green" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-sans">
                In-App Editorial Notifications
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {notifications.length} Total Dispatches
            </span>
          </div>

          {notifications.length === 0 ? (
            <div className="py-16 px-6 text-center space-y-3 max-w-sm mx-auto">
              <div className="w-12 h-12 bg-pitch-850 border border-pitch-750 flex items-center justify-center mx-auto text-slate-400">
                <Bell className="w-5 h-5 text-brand-green" />
              </div>
              <h4 className="text-sm font-bold text-slate-200 font-sans">No Dispatches Yet</h4>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                You will receive real-time notifications here when your manuscripts are submitted, reviewed, or approved.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-pitch-800">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-pitch-850/50 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={cn(
                        "w-8 h-8 flex items-center justify-center shrink-0 mt-0.5 border",
                        notif.type === "ARTICLE_APPROVED" && "bg-brand-green/10 text-brand-green border-brand-green/30",
                        notif.type === "REVISION_REQUESTED" && "bg-brand-red/10 text-brand-red border-brand-red/30",
                        notif.type === "ARTICLE_SUBMITTED" && "bg-brand-gold/10 text-brand-gold border-brand-gold/30",
                        notif.type === "ARTICLE_REJECTED" && "bg-slate-800 text-slate-400 border-slate-700",
                        !["ARTICLE_APPROVED", "REVISION_REQUESTED", "ARTICLE_SUBMITTED", "ARTICLE_REJECTED"].includes(notif.type) &&
                          "bg-pitch-850 text-slate-300 border-pitch-750"
                      )}
                    >
                      {notif.type === "ARTICLE_APPROVED" && <CheckCircle2 className="w-4 h-4" />}
                      {notif.type === "REVISION_REQUESTED" && <AlertCircle className="w-4 h-4" />}
                      {notif.type === "ARTICLE_SUBMITTED" && <Send className="w-4 h-4" />}
                      {notif.type === "ARTICLE_REJECTED" && <XCircle className="w-4 h-4" />}
                      {!["ARTICLE_APPROVED", "REVISION_REQUESTED", "ARTICLE_SUBMITTED", "ARTICLE_REJECTED"].includes(notif.type) && (
                        <FileCheck2 className="w-4 h-4" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-100 font-sans">
                          {notif.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          • {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-sans leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </div>

                  {notif.linkUrl && (
                    <Link
                      href={notif.linkUrl}
                      className="self-end sm:self-center px-4 py-1.5 text-xs font-semibold bg-pitch-850 hover:bg-pitch-800 text-slate-200 border border-pitch-750 shrink-0 transition-colors active:scale-[0.99]"
                    >
                      Open Link
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
