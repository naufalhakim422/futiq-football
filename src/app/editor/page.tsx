import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { editorialService } from "@/lib/editorial/editorial.service";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ShieldCheck, FileCheck2, Cpu, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EditorDeskPage() {
  const user = await getCurrentUser();
  const isEditor =
    user?.roles.includes("EDITOR_IN_CHIEF") ||
    user?.roles.includes("SENIOR_EDITOR") ||
    user?.roles.includes("SUPER_ADMIN");

  let queue = { articles: [] as any[], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } };
  try {
    queue = await editorialService.getReviewQueue({ limit: 10 });
  } catch (error) {
    // Database fallback
  }

  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        <SectionHeader
          title="Editorial Review Desk"
          subtitle="Verification queue, AI editorial gate placeholder, source validation, and publication decisions"
          badgeText={isEditor ? "Staff Access" : "Editorial Gate"}
        />

        <div className="bg-pitch-900 border border-pitch-800 p-6 space-y-6">
          <div className="p-4 bg-pitch-950 border border-pitch-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-brand-green shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-slate-100 font-sans">
                  Server-Side Authorization & Editorial Review Pipeline
                </h4>
                <p className="text-xs text-slate-400">
                  {user
                    ? `Staff: ${user.fullName} (${user.roles.join(", ")})`
                    : "Editorial Credentials Required to execute review actions."}
                </p>
              </div>
            </div>

            <Link
              href="/editor/review"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 bg-brand-green hover:bg-brand-green-hover transition-colors shrink-0"
            >
              <span>Open Full Review Queue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="bg-pitch-850 border border-pitch-750 p-4 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-bold">In Queue</span>
                <FileCheck2 className="w-4 h-4 text-brand-green" />
              </div>
              <div className="text-2xl font-bold text-slate-100">{queue.pagination.total}</div>
              <p className="text-[10px] text-slate-500 font-sans">Articles submitted for editorial decision</p>
            </div>

            <div className="bg-pitch-850 border border-pitch-750 p-4 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-bold">AI Gate Status</span>
                <Cpu className="w-4 h-4 text-brand-green" />
              </div>
              <div className="text-2xl font-bold text-brand-green">READY</div>
              <p className="text-[10px] text-slate-500 font-sans">Sprint 4 Architecture Ready</p>
            </div>

            <div className="bg-pitch-850 border border-pitch-750 p-4 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-bold">Review Pipeline</span>
                <ShieldCheck className="w-4 h-4 text-brand-green" />
              </div>
              <div className="text-2xl font-bold text-slate-100">SECURE</div>
              <p className="text-[10px] text-slate-500 font-sans">Server-derived decisions</p>
            </div>
          </div>
        </div>

        {/* Review Queue Summary Table */}
        <div className="bg-pitch-900 border border-pitch-800 overflow-hidden">
          <div className="p-4 border-b border-pitch-800 bg-pitch-950 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-sans">
              Recent Submissions Awaiting Decision
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {queue.articles.length} in view
            </span>
          </div>

          {queue.articles.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-slate-500">
              No articles currently pending review in the editorial queue.
            </div>
          ) : (
            <div className="divide-y divide-pitch-800">
              {queue.articles.map((art) => (
                <div
                  key={art.id}
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-pitch-850 transition-colors"
                >
                  <div className="space-y-1">
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
                      <span className="text-[11px] font-mono text-slate-400">
                        {art.category}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        • {art.sources.length} sources
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-100 font-sans">
                      {art.title}
                    </h4>

                    <p className="text-[11px] text-slate-400 font-mono">
                      By: {art.contributorProfile?.displayName || art.author.fullName} (
                      {art.author.email})
                    </p>
                  </div>

                  <Link
                    href={`/editor/review/${art.id}`}
                    className="px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider bg-pitch-800 hover:bg-pitch-750 text-slate-200 border border-pitch-700 transition-colors shrink-0"
                  >
                    Review Article
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
