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
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Layers,
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
    try {
      metrics = await contributorService.getDashboardMetrics(user.id);
      const articlesRes = await contributorService.getContributorArticles(user.id, { limit: 10 });
      articles = articlesRes.articles;
    } catch (error) {
      // Database fallback
    }
  }

  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        <SectionHeader
          title="Contributor Newsroom Desk"
          subtitle="Author tactical analysis, track editorial review lifecycles, and publish verified football journalism"
          badgeText={isContributor ? "Accredited Writer" : "Writer Desk"}
        />

        {/* Top Newsroom Control Panel */}
        <div className="bg-pitch-900 border border-pitch-800 p-6 sm:p-7 space-y-6 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-pitch-800">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-pitch-850 text-brand-green border border-pitch-750">
                  {user ? "AUTHENTICATED AUTHOR" : "GUEST MODE"}
                </span>
                {user && (
                  <span className="text-xs font-mono text-slate-300 font-semibold">
                    {user.fullName} <span className="text-slate-500 font-normal">({user.email})</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-sans max-w-xl">
                Server-side verified authorship. Articles are tracked with immutable revision snapshots, citation audits, and rights tracking.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                href="/contributor/notifications"
                className="px-3.5 py-2 text-xs font-semibold text-slate-300 bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 flex items-center gap-2 transition-colors active:scale-[0.99]"
              >
                <Bell className="w-3.5 h-3.5 text-brand-green" />
                <span>Alerts</span>
              </Link>
              <Link
                href="/contributor/profile"
                className="px-3.5 py-2 text-xs font-semibold text-slate-300 bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 flex items-center gap-2 transition-colors active:scale-[0.99]"
              >
                <User className="w-3.5 h-3.5 text-brand-green" />
                <span>Author Dossier</span>
              </Link>
              <Link
                href="/contributor/articles/new"
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 bg-brand-green hover:bg-brand-green-hover transition-colors shadow-lg active:scale-[0.99]"
              >
                <Plus className="w-4 h-4" />
                <span>New Manuscript</span>
              </Link>
            </div>
          </div>

          {/* Genuine Telemetry Grid (Zero Fake Numbers) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
            <div className="bg-pitch-950 border border-pitch-800 p-3.5 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Total Articles</span>
              <div className="text-2xl font-bold text-slate-100">{metrics.total}</div>
              <span className="text-[9px] text-slate-500 block">All-time count</span>
            </div>

            <div className="bg-pitch-950 border border-pitch-800 p-3.5 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Active Drafts</span>
              <div className="text-2xl font-bold text-slate-200">{metrics.drafts}</div>
              <span className="text-[9px] text-slate-500 block">In progress</span>
            </div>

            <div className="bg-pitch-950 border border-pitch-800 p-3.5 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">In Review</span>
              <div className="text-2xl font-bold text-brand-gold">{metrics.submitted}</div>
              <span className="text-[9px] text-slate-500 block">Editorial Queue</span>
            </div>

            <div className="bg-pitch-950 border border-pitch-800 p-3.5 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Revisions Req.</span>
              <div className="text-2xl font-bold text-brand-red">{metrics.revisionRequired}</div>
              <span className="text-[9px] text-slate-500 block">Needs changes</span>
            </div>

            <div className="bg-pitch-950 border border-pitch-800 p-3.5 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Published</span>
              <div className="text-2xl font-bold text-brand-green">{metrics.published}</div>
              <span className="text-[9px] text-slate-500 block">Live on newsfeed</span>
            </div>

            <div className="bg-pitch-950 border border-pitch-800 p-3.5 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Not Accepted</span>
              <div className="text-2xl font-bold text-slate-400">{metrics.rejected}</div>
              <span className="text-[9px] text-slate-500 block">Closed</span>
            </div>
          </div>
        </div>

        {/* Articles List / Workspace */}
        <div className="bg-pitch-900 border border-pitch-800 overflow-hidden shadow-xl">
          <div className="p-4 sm:p-5 border-b border-pitch-800 bg-pitch-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-brand-green" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-sans">
                Manuscripts & Editorial Submissions
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {articles.length} Registered Records
            </span>
          </div>

          {articles.length === 0 ? (
            <div className="py-14 px-6 text-center space-y-4 max-w-md mx-auto">
              <div className="w-12 h-12 bg-pitch-850 border border-pitch-750 flex items-center justify-center mx-auto text-slate-400">
                <PenTool className="w-5 h-5 text-brand-green" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-200 font-sans">No Articles Yet</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  You have not created any draft manuscripts yet. Begin drafting tactical reports, team deep dives, or player scouting analysis.
                </p>
              </div>
              <Link
                href="/contributor/articles/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-brand-green hover:bg-brand-green-hover transition-colors shadow-md active:scale-[0.99]"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Manuscript</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-pitch-800">
              {articles.map((art) => (
                <div
                  key={art.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-pitch-850/60 transition-colors"
                >
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider font-mono border",
                          art.status === "DRAFT" && "bg-pitch-800 text-slate-300 border-pitch-700",
                          art.status === "SUBMITTED" && "bg-brand-gold/15 text-brand-gold border-brand-gold/30",
                          art.status === "IN_REVIEW" && "bg-brand-gold/15 text-brand-gold border-brand-gold/30",
                          art.status === "REVISION_REQUIRED" && "bg-brand-red/15 text-brand-red border-brand-red/30 font-bold",
                          art.status === "APPROVED" && "bg-brand-green/15 text-brand-green border-brand-green/30",
                          art.status === "PUBLISHED" && "bg-brand-green/25 text-brand-green border-brand-green/40 font-bold",
                          art.status === "REJECTED" && "bg-slate-800 text-slate-400 border-slate-700"
                        )}
                      >
                        {art.status}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-mono bg-pitch-950 text-slate-400 border border-pitch-800">
                        {art.category}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {art.wordCount || 0} words • ~{art.readTimeMinutes || 1} min read
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-100 font-sans tracking-tight">
                      {art.title}
                    </h4>

                    {art.status === "REVISION_REQUIRED" && art.reviews?.[0]?.contributorFeedback && (
                      <div className="p-3 bg-brand-red/10 border border-brand-red/25 space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-brand-red flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Editor Revision Request:</span>
                        </span>
                        <p className="text-xs text-slate-200 font-sans leading-relaxed">
                          {art.reviews[0].contributorFeedback}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                    <span className="text-[11px] font-mono text-slate-500">
                      {new Date(art.updatedAt).toLocaleDateString()}
                    </span>
                    <Link
                      href={`/contributor/articles/${art.id}/edit`}
                      className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-pitch-800 hover:bg-pitch-750 text-slate-200 border border-pitch-700 transition-colors flex items-center gap-1.5 active:scale-[0.99]"
                    >
                      <span>{art.status === "DRAFT" || art.status === "REVISION_REQUIRED" ? "Edit Manuscript" : "Inspect"}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
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
