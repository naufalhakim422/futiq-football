import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { contributorService } from "@/lib/contributor/contributor.service";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import Link from "next/link";
import {
  PenTool,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Plus,
  ArrowRight,
  User,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ContributorDashboardPage() {
  const user = await getCurrentUser();

  const isContributor =
    user?.roles.includes("CONTRIBUTOR") ||
    user?.roles.includes("SENIOR_EDITOR") ||
    user?.roles.includes("SUPER_ADMIN");

  let metrics = {
    total: 0,
    drafts: 0,
    submitted: 0,
    revisionRequired: 0,
    published: 0,
    rejected: 0,
    recentActivity: [] as Array<{
      id: string;
      title: string;
      status: string;
      category: string;
      updatedAt: Date;
    }>,
  };

  let articles: any[] = [];

  if (user) {
    metrics = await contributorService.getDashboardMetrics(user.id);
    const articlesRes = await contributorService.getContributorArticles(user.id, { limit: 10 });
    articles = articlesRes.articles;
  }

  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        <SectionHeader
          title="Contributor Newsroom Desk"
          subtitle="Draft original tactical stories, track editorial review progress, and manage submissions"
          badgeText={isContributor ? "Active Writer" : "Writer Network"}
        />

        {/* Dashboard Navigation & Quick Action Bar */}
        <div className="bg-pitch-900 border border-pitch-800 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-pitch-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono uppercase text-slate-400">
                  Author Identity:
                </span>
                {user ? (
                  <span className="text-brand-green text-xs font-semibold font-mono">
                    {user.fullName} ({user.email})
                  </span>
                ) : (
                  <span className="text-slate-400 text-xs font-mono">
                    Not authenticated — Sign in to manage your drafts
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Server-side verified ownership. All submissions are protected against tampering.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/contributor/notifications"
                className="px-3 py-2 text-xs font-semibold text-slate-300 bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 flex items-center gap-1.5 transition-colors"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Alerts</span>
              </Link>
              <Link
                href="/contributor/profile"
                className="px-3 py-2 text-xs font-semibold text-slate-300 bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 flex items-center gap-1.5 transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>Profile</span>
              </Link>
              <Link
                href="/contributor/articles/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 bg-brand-green hover:bg-brand-green-hover transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Article</span>
              </Link>
            </div>
          </div>

          {/* Genuine Telemetry Grid (Zero Fake Numbers) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
            <div className="bg-pitch-850 border border-pitch-750 p-3 text-center">
              <span className="text-[10px] text-slate-500 uppercase">Total Articles</span>
              <div className="text-xl font-bold text-slate-100 mt-1">{metrics.total}</div>
            </div>

            <div className="bg-pitch-850 border border-pitch-750 p-3 text-center">
              <span className="text-[10px] text-slate-500 uppercase">Active Drafts</span>
              <div className="text-xl font-bold text-slate-300 mt-1">{metrics.drafts}</div>
            </div>

            <div className="bg-pitch-850 border border-pitch-750 p-3 text-center">
              <span className="text-[10px] text-slate-500 uppercase">In Review</span>
              <div className="text-xl font-bold text-brand-gold mt-1">{metrics.submitted}</div>
            </div>

            <div className="bg-pitch-850 border border-pitch-750 p-3 text-center">
              <span className="text-[10px] text-slate-500 uppercase">Revisions Req.</span>
              <div className="text-xl font-bold text-brand-red mt-1">{metrics.revisionRequired}</div>
            </div>

            <div className="bg-pitch-850 border border-pitch-750 p-3 text-center">
              <span className="text-[10px] text-slate-500 uppercase">Published</span>
              <div className="text-xl font-bold text-brand-green mt-1">{metrics.published}</div>
            </div>

            <div className="bg-pitch-850 border border-pitch-750 p-3 text-center">
              <span className="text-[10px] text-slate-500 uppercase">Not Accepted</span>
              <div className="text-xl font-bold text-slate-400 mt-1">{metrics.rejected}</div>
            </div>
          </div>
        </div>

        {/* Articles List / Workspace */}
        <div className="bg-pitch-900 border border-pitch-800 overflow-hidden">
          <div className="p-4 border-b border-pitch-800 bg-pitch-950 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-sans">
              Your Editorial Drafts & Submissions
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {articles.length} Recent Records
            </span>
          </div>

          {articles.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-xs text-slate-400 font-mono">
                You have not created any article drafts yet.
              </p>
              <Link
                href="/contributor/articles/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 bg-brand-green hover:bg-brand-green-hover transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Your First Draft</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-pitch-800">
              {articles.map((art) => (
                <div
                  key={art.id}
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-pitch-850 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider font-mono rounded",
                          art.status === "DRAFT" && "bg-pitch-800 text-slate-300",
                          art.status === "SUBMITTED" && "bg-brand-gold/15 text-brand-gold",
                          art.status === "IN_REVIEW" && "bg-brand-gold/15 text-brand-gold",
                          art.status === "REVISION_REQUIRED" && "bg-brand-red/15 text-brand-red font-bold",
                          art.status === "APPROVED" && "bg-brand-green/15 text-brand-green",
                          art.status === "PUBLISHED" && "bg-brand-green/20 text-brand-green font-bold",
                          art.status === "REJECTED" && "bg-slate-800 text-slate-400"
                        )}
                      >
                        {art.status}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {art.category}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-100 font-sans">
                      {art.title}
                    </h4>

                    {art.status === "REVISION_REQUIRED" && art.reviews?.[0]?.contributorFeedback && (
                      <p className="text-[11px] text-brand-red bg-brand-red/10 p-2 rounded border border-brand-red/20 font-mono mt-1">
                        <strong>Editor Feedback:</strong> {art.reviews[0].contributorFeedback}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(art.updatedAt).toLocaleDateString()}
                    </span>
                    <Link
                      href={`/contributor/articles/${art.id}/edit`}
                      className="px-3 py-1.5 text-xs font-semibold bg-pitch-800 hover:bg-pitch-750 text-slate-200 border border-pitch-700 transition-colors"
                    >
                      {art.status === "DRAFT" || art.status === "REVISION_REQUIRED" ? "Edit Draft" : "View"}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
