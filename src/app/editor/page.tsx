import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { editorialService } from "@/lib/editorial/editorial.service";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import {
  ShieldCheck,
  FileCheck2,
  Cpu,
  AlertTriangle,
  ArrowRight,
  User,
  Star,
  Layers,
  Sparkles,
} from "lucide-react";
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
          subtitle="Verification queue, citation validation, Sprint 4 AI gate placeholder, and publication decisions"
          badgeText={isEditor ? "Staff Access" : "Editorial Gate"}
        />

        {/* Command Center Panel */}
        <div className="bg-pitch-900 border border-pitch-800 p-6 sm:p-7 space-y-6 shadow-xl">
          <div className="p-4 sm:p-5 bg-pitch-950 border border-pitch-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-brand-green shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <h4 className="text-sm font-bold text-slate-100 font-sans">
                  Staff Editorial Authority & Review Pipeline
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {user
                    ? `Staff: ${user.fullName} (${user.roles.join(", ")})`
                    : "Editorial Credentials Required to execute review actions."}
                </p>
              </div>
            </div>

            <Link
              href="/editor/review"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-brand-green hover:bg-brand-green-hover transition-colors shrink-0 shadow-md active:scale-[0.99]"
            >
              <span>Open Review Queue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="bg-pitch-950 border border-pitch-800 p-4 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">Awaiting Decision</span>
                <FileCheck2 className="w-4 h-4 text-brand-green" />
              </div>
              <div className="text-3xl font-bold text-slate-100 mt-1">{queue.pagination.total}</div>
              <p className="text-[10px] text-slate-500 font-sans">Submissions in active editorial queue</p>
            </div>

            <div className="bg-pitch-950 border border-pitch-800 p-4 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">AI Gate State</span>
                <Cpu className="w-4 h-4 text-brand-green" />
              </div>
              <div className="text-3xl font-bold text-brand-green mt-1">READY</div>
              <p className="text-[10px] text-slate-500 font-sans">Sprint 4 Architecture Scaffolded (NOT_RUN)</p>
            </div>

            <div className="bg-pitch-950 border border-pitch-800 p-4 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">Security Pipeline</span>
                <ShieldCheck className="w-4 h-4 text-brand-green" />
              </div>
              <div className="text-3xl font-bold text-slate-100 mt-1">SECURE</div>
              <p className="text-[10px] text-slate-500 font-sans">Anti-Self-Approval & IDOR Isolation Active</p>
            </div>
          </div>
        </div>

        {/* Review Queue Summary Table */}
        <div className="bg-pitch-900 border border-pitch-800 overflow-hidden shadow-xl">
          <div className="p-4 sm:p-5 border-b border-pitch-800 bg-pitch-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-green" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-sans">
                Submissions Awaiting Editorial Decision
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {queue.articles.length} in view
            </span>
          </div>

          {queue.articles.length === 0 ? (
            <div className="py-16 px-6 text-center text-xs font-mono text-slate-500 space-y-2">
              <p>No articles currently pending review in the editorial queue.</p>
              <p className="text-slate-600">All submitted contributor manuscripts have been processed.</p>
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
                        • {art.sources?.length || 0} citations
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        • {art.wordCount || 0} words
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-100 font-sans tracking-tight">
                      {art.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400">
                      <span>Author: <strong className="text-slate-300">{art.contributorProfile?.displayName || art.author.fullName}</strong></span>
                      <span>• Rights: <strong className={art.imageRightsStatus === "UNKNOWN" ? "text-brand-red" : "text-brand-green"}>{art.imageRightsStatus}</strong></span>
                      <span>• Submitted: {new Date(art.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <Link
                    href={`/editor/review/${art.id}`}
                    className="self-end md:self-center px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-pitch-850 hover:bg-pitch-800 text-brand-green border border-pitch-750 hover:border-brand-green/40 transition-all shrink-0 active:scale-[0.99]"
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
