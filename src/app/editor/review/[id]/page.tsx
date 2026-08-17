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
  const article = await editorialService.getReviewDetail(id);

  if (!article) {
    notFound();
  }

  return (
    <div className="py-8 space-y-6">
      <PageContainer>
        {/* Navigation */}
        <div className="flex items-center justify-between pb-4 border-b border-pitch-800">
          <Link
            href="/editor/review"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Review Queue</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Current Status:</span>
            <span
              className={cn(
                "px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider font-mono rounded",
                article.status === "SUBMITTED" && "bg-brand-gold/20 text-brand-gold font-bold",
                article.status === "IN_REVIEW" && "bg-brand-gold/20 text-brand-gold font-bold",
                article.status === "REVISION_REQUIRED" && "bg-brand-red/20 text-brand-red font-bold",
                article.status === "APPROVED" && "bg-brand-green/20 text-brand-green font-bold",
                article.status === "REJECTED" && "bg-slate-800 text-slate-400"
              )}
            >
              {article.status}
            </span>
          </div>
        </div>

        {/* Two-Column Side-by-Side Review Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (Main): Article Content, Citations, Body */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-pitch-900 border border-pitch-800 p-6 sm:p-8 space-y-6">
              <div className="space-y-2">
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-pitch-800 text-brand-green border border-pitch-700 font-mono">
                  {article.category}
                </span>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-sans tracking-tight">
                  {article.title}
                </h1>

                {article.subtitle && (
                  <p className="text-base text-slate-300 font-sans font-medium">
                    {article.subtitle}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-2 border-t border-pitch-850">
                  <span>Author: {article.author.fullName}</span>
                  <span>• {article.wordCount} words</span>
                  <span>• ~{article.readTimeMinutes} min read</span>
                </div>
              </div>

              {article.excerpt && (
                <div className="p-4 bg-pitch-950 border border-pitch-800 text-xs text-slate-300 font-sans italic leading-relaxed">
                  &ldquo;{article.excerpt}&rdquo;
                </div>
              )}

              {/* Body Content */}
              <div className="pt-4 border-t border-pitch-800 space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Article Body
                </h3>
                <div className="prose prose-invert max-w-none text-slate-200 text-xs leading-relaxed whitespace-pre-line font-sans">
                  {article.body}
                </div>
              </div>

              {/* Citations & Sources Table */}
              <div className="pt-6 border-t border-pitch-800 space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Verified Citations & Sources ({article.sources.length})
                </h3>

                {article.sources.length === 0 ? (
                  <p className="text-xs text-brand-red font-mono">
                    Warning: Zero citations attached to this article.
                  </p>
                ) : (
                  <div className="divide-y divide-pitch-800 border border-pitch-800">
                    {article.sources.map((s) => (
                      <div key={s.id} className="p-3 bg-pitch-950 flex items-center justify-between text-xs font-mono">
                        <div>
                          <span className="font-bold text-slate-200">{s.sourceName}</span>
                          <span className="text-slate-500 ml-2">({s.sourceType})</span>
                        </div>
                        <a
                          href={s.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-green hover:underline flex items-center gap-1"
                        >
                          <span>Verify Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (Sidebar): Metadata, Rights, AI Gate, Decision Panel */}
          <div className="lg:col-span-4 space-y-6">
            {/* Decision Action Console */}
            <ReviewActionPanel articleId={article.id} currentStatus={article.status} />

            {/* AI Editorial Checks Section (Sprint 4 Placeholder) */}
            <div className="bg-pitch-900 border border-pitch-800 p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-pitch-800">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-brand-green" />
                  <span className="font-bold text-slate-200 uppercase tracking-wider">
                    AI Editorial Gate
                  </span>
                </div>
                <span className="px-2 py-0.5 text-[9px] font-bold bg-pitch-800 text-slate-400 border border-pitch-700 rounded">
                  STATUS: NOT_RUN
                </span>
              </div>

              <div className="space-y-2 text-[11px] text-slate-400">
                <div className="flex justify-between py-1 border-b border-pitch-850">
                  <span>Plagiarism Similarity Score:</span>
                  <span className="text-slate-500 font-bold">— (Sprint 4)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-pitch-850">
                  <span>Image Duplication Check:</span>
                  <span className="text-slate-500 font-bold">— (Sprint 4)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Source Consistency:</span>
                  <span className="text-slate-500 font-bold">— (Sprint 4)</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 italic pt-1">
                Automated AI similarity and copyright inspection will be fully integrated in Sprint 4.
              </p>
            </div>

            {/* Author Information */}
            <div className="bg-pitch-900 border border-pitch-800 p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-pitch-800">
                <User className="w-4 h-4 text-brand-green" />
                <span className="font-bold text-slate-200 uppercase tracking-wider">
                  Author Intelligence
                </span>
              </div>

              <div className="space-y-1.5">
                <p className="text-slate-200 font-bold font-sans">{article.author.fullName}</p>
                <p className="text-slate-400 text-[11px]">{article.author.email}</p>
                <div className="flex items-center gap-2 text-brand-green pt-1">
                  <Star className="w-3.5 h-3.5 fill-brand-green" />
                  <span>Trust Score: {Number(article.contributorProfile?.overallTrustScore || 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Image Rights Metadata */}
            <div className="bg-pitch-900 border border-pitch-800 p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-pitch-800">
                <Shield className="w-4 h-4 text-brand-green" />
                <span className="font-bold text-slate-200 uppercase tracking-wider">
                  Image Rights Compliance
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Clearance Status:</span>
                  <span
                    className={cn(
                      "font-bold",
                      article.imageRightsStatus === "UNKNOWN"
                        ? "text-brand-red"
                        : "text-brand-green"
                    )}
                  >
                    {article.imageRightsStatus}
                  </span>
                </div>

                {article.imageRightsStatus === "UNKNOWN" && (
                  <p className="text-[10px] text-brand-red bg-brand-red/10 p-2 rounded">
                    Notice: Image clearance status is UNKNOWN. Article cannot be published without clear rights.
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
