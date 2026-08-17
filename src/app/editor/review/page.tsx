import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { editorialService } from "@/lib/editorial/editorial.service";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ArticleStatus } from "@prisma/client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Filter, ArrowLeft } from "lucide-react";

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
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Editor Desk</span>
          </Link>
        </div>

        <SectionHeader
          title="Editorial Review Queue"
          subtitle="Inspect pending submissions, review citations, and issue editorial decisions"
          badgeText={`${queue.pagination.total} Submissions`}
        />

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <Link
            href="/editor/review"
            className={cn(
              "px-3 py-1.5 rounded border transition-colors",
              !status
                ? "bg-brand-green text-slate-950 border-brand-green font-bold"
                : "bg-pitch-900 border-pitch-800 text-slate-400 hover:text-slate-200"
            )}
          >
            All Submissions
          </Link>
          <Link
            href="/editor/review?status=SUBMITTED"
            className={cn(
              "px-3 py-1.5 rounded border transition-colors",
              status === "SUBMITTED"
                ? "bg-brand-green text-slate-950 border-brand-green font-bold"
                : "bg-pitch-900 border-pitch-800 text-slate-400 hover:text-slate-200"
            )}
          >
            Pending Review
          </Link>
          <Link
            href="/editor/review?status=REVISION_REQUIRED"
            className={cn(
              "px-3 py-1.5 rounded border transition-colors",
              status === "REVISION_REQUIRED"
                ? "bg-brand-green text-slate-950 border-brand-green font-bold"
                : "bg-pitch-900 border-pitch-800 text-slate-400 hover:text-slate-200"
            )}
          >
            Revision Required
          </Link>
          <Link
            href="/editor/review?status=APPROVED"
            className={cn(
              "px-3 py-1.5 rounded border transition-colors",
              status === "APPROVED"
                ? "bg-brand-green text-slate-950 border-brand-green font-bold"
                : "bg-pitch-900 border-pitch-800 text-slate-400 hover:text-slate-200"
            )}
          >
            Approved
          </Link>
          <Link
            href="/editor/review?status=REJECTED"
            className={cn(
              "px-3 py-1.5 rounded border transition-colors",
              status === "REJECTED"
                ? "bg-brand-green text-slate-950 border-brand-green font-bold"
                : "bg-pitch-900 border-pitch-800 text-slate-400 hover:text-slate-200"
            )}
          >
            Rejected
          </Link>
        </div>

        {/* Queue Table */}
        <div className="bg-pitch-900 border border-pitch-800 overflow-hidden">
          {queue.articles.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-slate-500">
              No matching articles found for this filter.
            </div>
          ) : (
            <div className="divide-y divide-pitch-800">
              {queue.articles.map((art) => (
                <div
                  key={art.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-pitch-850 transition-colors"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider font-mono rounded",
                          art.status === "SUBMITTED" && "bg-brand-gold/20 text-brand-gold font-bold",
                          art.status === "IN_REVIEW" && "bg-brand-gold/20 text-brand-gold font-bold",
                          art.status === "REVISION_REQUIRED" && "bg-brand-red/20 text-brand-red font-bold",
                          art.status === "APPROVED" && "bg-brand-green/20 text-brand-green font-bold",
                          art.status === "REJECTED" && "bg-slate-800 text-slate-400"
                        )}
                      >
                        {art.status}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {art.category}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        • {art.wordCount} words
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        • {art.sources.length} sources
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100 font-sans">
                      {art.title}
                    </h3>

                    <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                      <span>By: {art.contributorProfile?.displayName || art.author.fullName}</span>
                      <span>• Rights: {art.imageRightsStatus}</span>
                      <span>• Updated: {new Date(art.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <Link
                    href={`/editor/review/${art.id}`}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-brand-green text-slate-950 hover:bg-brand-green-hover transition-colors shrink-0"
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
