import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { editorialService } from "@/lib/editorial/editorial.service";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ArticleStatus } from "@prisma/client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Filter, ArrowLeft, Layers, ShieldCheck, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

interface EditorReviewPageProps {
  searchParams: Promise<{ status?: string; category?: string; page?: string }>;
}

export default async function EditorReviewQueuePage({ searchParams }: EditorReviewPageProps) {
  const { status, category, page } = await searchParams;
  const statusFilter = status as ArticleStatus | undefined;
  const pageNum = parseInt(page || "1", 10);

  let queue = { articles: [] as any[], pagination: { total: 0, page: 1, limit: 20, totalPages: 1 } };
  try {
    queue = await editorialService.getReviewQueue({
      status: statusFilter,
      category,
      page: pageNum,
      limit: 20,
    });
  } catch (error) {
    // Database fallback
  }

  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        <div className="flex items-center justify-between">
          <Link
            href="/editor"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Editor Command Center</span>
          </Link>
        </div>

        <SectionHeader
          title="Editorial Review Pipeline & Docket"
          subtitle="Audit manuscript sources, verify rights declarations, review author credentials, and record publishing decisions"
          badgeText={`${queue.pagination.total} Submissions`}
        />

        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <Link
            href="/editor/review"
            className={cn(
              "px-3.5 py-1.5 border transition-all active:scale-[0.99]",
              !status
                ? "bg-brand-green text-slate-950 border-brand-green font-bold shadow-md"
                : "bg-pitch-900 border-pitch-800 text-slate-400 hover:text-slate-200 hover:border-pitch-700"
            )}
          >
            All Submissions
          </Link>
          <Link
            href="/editor/review?status=SUBMITTED"
            className={cn(
              "px-3.5 py-1.5 border transition-all active:scale-[0.99]",
              status === "SUBMITTED"
                ? "bg-brand-green text-slate-950 border-brand-green font-bold shadow-md"
                : "bg-pitch-900 border-pitch-800 text-slate-400 hover:text-slate-200 hover:border-pitch-700"
            )}
          >
            Pending Review
          </Link>
          <Link
            href="/editor/review?status=REVISION_REQUIRED"
            className={cn(
              "px-3.5 py-1.5 border transition-all active:scale-[0.99]",
              status === "REVISION_REQUIRED"
                ? "bg-brand-green text-slate-950 border-brand-green font-bold shadow-md"
                : "bg-pitch-900 border-pitch-800 text-slate-400 hover:text-slate-200 hover:border-pitch-700"
            )}
          >
            Revision Required
          </Link>
          <Link
            href="/editor/review?status=APPROVED"
            className={cn(
              "px-3.5 py-1.5 border transition-all active:scale-[0.99]",
              status === "APPROVED"
                ? "bg-brand-green text-slate-950 border-brand-green font-bold shadow-md"
                : "bg-pitch-900 border-pitch-800 text-slate-400 hover:text-slate-200 hover:border-pitch-700"
            )}
          >
            Approved
          </Link>
          <Link
            href="/editor/review?status=REJECTED"
            className={cn(
              "px-3.5 py-1.5 border transition-all active:scale-[0.99]",
              status === "REJECTED"
                ? "bg-brand-green text-slate-950 border-brand-green font-bold shadow-md"
                : "bg-pitch-900 border-pitch-800 text-slate-400 hover:text-slate-200 hover:border-pitch-700"
            )}
          >
            Not Accepted
          </Link>
        </div>

        {/* Queue List Table */}
        <div className="bg-pitch-900 border border-pitch-800 overflow-hidden shadow-xl">
          {queue.articles.length === 0 ? (
            <div className="py-16 px-6 text-center text-xs font-mono text-slate-500 space-y-2">
              <p>No matching submissions found for this filter criteria.</p>
              <Link href="/editor/review" className="text-brand-green hover:underline inline-block mt-2">
                Reset Filter
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-pitch-800">
              {queue.articles.map((art) => (
                <div
                  key={art.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-pitch-850/50 transition-colors"
                >
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider font-mono border",
                          art.status === "SUBMITTED" && "bg-brand-gold/15 text-brand-gold border-brand-gold/30 font-bold",
                          art.status === "IN_REVIEW" && "bg-brand-gold/15 text-brand-gold border-brand-gold/30 font-bold",
                          art.status === "REVISION_REQUIRED" && "bg-brand-red/15 text-brand-red border-brand-red/30 font-bold",
                          art.status === "APPROVED" && "bg-brand-green/15 text-brand-green border-brand-green/30 font-bold",
                          art.status === "REJECTED" && "bg-slate-800 text-slate-400 border-slate-700"
                        )}
                      >
                        {art.status}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-mono bg-pitch-950 text-slate-400 border border-pitch-800">
                        {art.category}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        • {art.wordCount || 0} words
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        • {art.sources?.length || 0} citations
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100 font-sans tracking-tight">
                      {art.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400">
                      <span>Author: <strong className="text-slate-300">{art.contributorProfile?.displayName || art.author.fullName}</strong></span>
                      <span>• Rights: <strong className={art.imageRightsStatus === "UNKNOWN" ? "text-brand-red" : "text-brand-green"}>{art.imageRightsStatus}</strong></span>
                      <span>• Updated: {new Date(art.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <Link
                    href={`/editor/review/${art.id}`}
                    className="self-end md:self-center px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-brand-green text-slate-950 hover:bg-brand-green-hover transition-all shadow-md active:scale-[0.99] shrink-0"
                  >
                    Inspect & Decide
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
