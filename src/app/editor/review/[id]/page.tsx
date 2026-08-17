import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { editorialService } from "@/lib/editorial/editorial.service";
import { PageContainer } from "@/components/layout/PageContainer";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Clock,
  User,
  Star,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ExternalLink,
  Link2,
  Lock,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ReviewActionPanel } from "./ReviewActionPanel";

export const dynamic = "force-dynamic";

interface ArticleReviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function ArticleReviewDetailPage({ params }: ArticleReviewPageProps) {
  const user = await getCurrentUser();
  const isStaff =
    user?.roles.includes("EDITOR_IN_CHIEF") ||
    user?.roles.includes("SENIOR_EDITOR") ||
    user?.roles.includes("SUPER_ADMIN");

  if (!isStaff) {
    redirect("/editor");
  }

  const { id } = await params;
  let article: any = null;

  try {
    article = await editorialService.getReviewDetail(id);
  } catch (error) {
    // Database fallback
  }

  if (!article) {
    notFound();
  }

  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        {/* Navigation & Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-pitch-800">
          <Link
            href="/editor/review"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Review Docket</span>
          </Link>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-500 uppercase">Docket Status:</span>
            <span
              className={cn(
                "px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
                article.status === "SUBMITTED" && "bg-brand-gold/15 text-brand-gold border-brand-gold/30 font-bold",
                article.status === "IN_REVIEW" && "bg-brand-gold/15 text-brand-gold border-brand-gold/30 font-bold",
                article.status === "REVISION_REQUIRED" && "bg-brand-red/15 text-brand-red border-brand-red/30 font-bold",
                article.status === "APPROVED" && "bg-brand-green/15 text-brand-green border-brand-green/30 font-bold",
                article.status === "REJECTED" && "bg-slate-800 text-slate-400 border-slate-700"
              )}
            >
              {article.status}
            </span>
          </div>
        </div>

        {/* Dual-Column Side-by-Side Review Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Full Manuscript & Citation Verification */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-pitch-900 border border-pitch-800 p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="space-y-3 pb-6 border-b border-pitch-800">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-pitch-850 text-brand-green border border-pitch-750 font-mono">
                    {article.category}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {article.wordCount} words • ~{article.readTimeMinutes} min read
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-sans tracking-tight leading-tight">
                  {article.title}
                </h1>

                {article.subtitle && (
                  <p className="text-base text-slate-300 font-sans font-medium leading-relaxed">
                    {article.subtitle}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-2 border-t border-pitch-850">
                  <span>Author: <strong className="text-slate-200">{article.author.fullName}</strong> ({article.author.email})</span>
                  <span>• Last Updated: {new Date(article.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {article.excerpt && (
                <div className="p-4 bg-pitch-950 border-l-2 border-brand-green border-pitch-800 text-xs text-slate-300 font-sans italic leading-relaxed">
                  &ldquo;{article.excerpt}&rdquo;
                </div>
              )}

              {/* Manuscript Body Text */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Full Manuscript
                </h3>
                <div className="prose prose-invert max-w-none text-slate-200 text-xs leading-relaxed whitespace-pre-line font-sans p-4 bg-pitch-950 border border-pitch-800">
                  {article.body}
                </div>
              </div>

              {/* Verified Citations & Primary Sources */}
              <div className="space-y-3 pt-4 border-t border-pitch-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-brand-green" />
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans">
                      Verified Citations & Sources ({article.sources?.length || 0})
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Click to verify links</span>
                </div>

                {(!article.sources || article.sources.length === 0) ? (
                  <div className="p-4 bg-brand-red/10 border border-brand-red/30 text-xs font-mono text-brand-red">
                    Editorial Violation: Zero source citations attached to this submission.
                  </div>
                ) : (
                  <div className="divide-y divide-pitch-800 border border-pitch-800">
                    {article.sources.map((s: any) => (
                      <div key={s.id} className="p-3.5 bg-pitch-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-200">{s.sourceName}</span>
                          <span className="text-slate-500 ml-2">[{s.sourceType}]</span>
                        </div>
                        <a
                          href={s.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-green hover:underline flex items-center gap-1 text-[11px] self-start sm:self-auto"
                        >
                          <span>Verify Source</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Decision Action Console & Intelligence */}
          <div className="lg:col-span-4 space-y-6">
            {/* Decision Action Console */}
            <ReviewActionPanel articleId={article.id} currentStatus={article.status} />

            {/* AI Editorial Gate (Sprint 4 Placeholder) */}
            <div className="bg-pitch-900 border border-pitch-800 p-5 space-y-4 shadow-xl font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-pitch-800">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-brand-green" />
                  <span className="font-bold text-slate-200 uppercase tracking-wider">
                    AI Editorial Gate
                  </span>
                </div>
                <span className="px-2 py-0.5 text-[9px] font-bold bg-pitch-950 text-slate-400 border border-pitch-800">
                  STATUS: NOT_RUN
                </span>
              </div>

              <div className="space-y-2 text-[11px] text-slate-400">
                <div className="flex justify-between py-1.5 border-b border-pitch-850">
                  <span>Plagiarism Similarity:</span>
                  <span className="text-slate-500 font-bold">— (Sprint 4 Gate)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-pitch-850">
                  <span>Image Duplication Audit:</span>
                  <span className="text-slate-500 font-bold">— (Sprint 4 Gate)</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span>Source Verification Feed:</span>
                  <span className="text-slate-500 font-bold">— (Sprint 4 Gate)</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 italic leading-relaxed pt-1">
                Automated AI vector similarity, OCR verification, and copyright checks will be integrated in Sprint 4.
              </p>
            </div>

            {/* Author Credibility Dossier */}
            <div className="bg-pitch-900 border border-pitch-800 p-5 space-y-4 shadow-xl font-mono text-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-pitch-800">
                <User className="w-4 h-4 text-brand-green" />
                <span className="font-bold text-slate-200 uppercase tracking-wider">
                  Author Intelligence
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Author Name:</span>
                  <span className="text-slate-200 font-bold font-sans">{article.author.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="text-slate-300">{article.author.email}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-pitch-850">
                  <span className="text-slate-400">Trust Score:</span>
                  <span className="text-brand-green font-bold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-brand-green" />
                    <span>{Number(article.contributorProfile?.overallTrustScore || 100).toFixed(1)}%</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Image Rights Clearance Box */}
            <div className="bg-pitch-900 border border-pitch-800 p-5 space-y-4 shadow-xl font-mono text-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-pitch-800">
                <Shield className="w-4 h-4 text-brand-green" />
                <span className="font-bold text-slate-200 uppercase tracking-wider">
                  Media Rights Status
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Clearance:</span>
                  <span
                    className={cn(
                      "font-bold px-2 py-0.5 text-[10px] border",
                      article.imageRightsStatus === "UNKNOWN"
                        ? "bg-brand-red/15 text-brand-red border-brand-red/30"
                        : "bg-brand-green/15 text-brand-green border-brand-green/30"
                    )}
                  >
                    {article.imageRightsStatus}
                  </span>
                </div>

                {article.imageRightsStatus === "UNKNOWN" && (
                  <p className="text-[10px] text-brand-red bg-brand-red/10 border border-brand-red/20 p-2.5 leading-relaxed">
                    Warning: Media status is UNKNOWN. Publication cannot proceed without clear intellectual property rights.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
