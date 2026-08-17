import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageContainer } from "@/components/layout/PageContainer";
import { ExternalLink, User, Clock, ShieldCheck, Share2, ArrowLeft, BookOpen, Layers } from "lucide-react";
import Link from "next/link";
import { ArticleStatus } from "@prisma/client";

interface ArticleDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export default async function NewsArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { slug } = await params;

  let article: any = null;

  try {
    article = await prisma.article.findUnique({
      where: { slug },
      include: {
        author: true,
        contributorProfile: true,
        sources: true,
      },
    });
  } catch (error) {
    // Database fallback
  }

  // Fallback for default mocked articles if not found in database
  if (!article) {
    if (slug === "uefa-expands-financial-fair-play-thresholds") {
      article = {
        title: "UEFA Expands Financial Fair Play Thresholds: What the New Squad Cost Rules Mean for Top 5 Leagues",
        subtitle: "A comprehensive breakdown of revenue-to-wage ratios, amortisation restrictions, and potential penalty brackets starting in 2026/27.",
        excerpt: "European football's governing body has finalized revisions to its Squad Cost Rule (SCR), lowering the maximum allowable wage-to-revenue ratio to 70% while introducing stricter penalties for multi-club ownership models.",
        body: `European football is entering a decisive regulatory cycle. As UEFA implements the finalized tier of its Financial Sustainability Regulations, clubs across the Premier League, La Liga, Serie A, Bundesliga, and Ligue 1 face stringent squad cost ceilings.

The core mechanism rests upon the 70% Squad Cost Rule (SCR). Under this provision, total expenditure on player and head coach wages, transfer fee amortisation, and intermediary commissions cannot exceed 70% of a club's defined football revenue plus net profit on player disposals.

Tactical and operational impacts are already visible across the transfer market:

1. Accelerated Amortisation Caps: Transfer fees can no longer be amortized over contracts exceeding five years for FFP accounting purposes, curtailing the long-term contract structures utilized in recent windows.

2. Multi-Club Cross-Transactions: UEFA has tightened independent fair market value assessments for intra-group player transfers, requiring audited third-party benchmarking before transactions can be registered on club balance sheets.

3. Structured Penalty Schedules: Repeat offenders face progressive sanction brackets, including squad registration size caps (reducing European squads from 25 to 21 players) and potential deduction of competition points in the expanded league phase.

As clubs adjust their wage structures and long-term financial modeling, squad depth management and academy graduate integration become essential competitive advantages.`,
        category: "Finance & Governance",
        featuredImageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop",
        featuredImageCaption: "UEFA headquarters in Nyon, Switzerland.",
        imageAttribution: "Official Press Photo",
        author: { fullName: "Gabriel Vance", email: "gabriel.vance@fmp.com" },
        contributorProfile: { displayName: "Gabriel Vance" },
        wordCount: 840,
        readTimeMinutes: 5,
        publishedAt: new Date(),
        sources: [
          {
            id: "s1",
            sourceName: "UEFA Financial Sustainability Regulations Handbook 2026",
            sourceUrl: "https://uefa.com",
            sourceType: "OFFICIAL",
          },
          {
            id: "s2",
            sourceName: "European Club Association (ECA) Governance Briefing",
            sourceUrl: "https://ecaeurope.com",
            sourceType: "PRESS_RELEASE",
          },
        ],
      };
    } else {
      notFound();
    }
  }

  const authorName = article.contributorProfile?.displayName || article.author.fullName;

  return (
    <div className="py-8 space-y-10">
      <PageContainer>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between pb-4 border-b border-pitch-800">
            <Link
              href="/news"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Newsroom</span>
            </Link>

            <span className="text-[11px] font-mono text-slate-500">
              Verified Editorial Dispatch
            </span>
          </div>

          {/* Article Header */}
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-pitch-900 text-brand-green border border-pitch-800 font-mono">
                {article.category}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : "Editorial Dispatch"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 font-sans tracking-tight leading-tight">
              {article.title}
            </h1>

            {article.subtitle && (
              <p className="text-base sm:text-lg text-slate-300 font-sans font-medium leading-relaxed">
                {article.subtitle}
              </p>
            )}

            {/* Author Byline & Metrics */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-pitch-800 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pitch-800 border border-pitch-700 flex items-center justify-center font-bold text-brand-green">
                  {authorName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <span className="font-sans font-bold text-slate-200 block text-sm">
                    {authorName}
                  </span>
                  <span className="text-[10px] text-brand-green font-mono">
                    Verified Editorial Contributor
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-slate-400">
                <span>{article.wordCount || 500} words</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-brand-green" />
                  <span>~{article.readTimeMinutes || 5} min read</span>
                </span>
              </div>
            </div>
          </header>

          {/* Hero Featured Image */}
          {article.featuredImageUrl && (
            <div className="space-y-2">
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-pitch-900 border border-pitch-800 shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.featuredImageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {article.featuredImageCaption && (
                <p className="text-[11px] text-slate-400 font-sans italic text-right">
                  {article.featuredImageCaption}
                  {article.imageAttribution && ` • Credit: ${article.imageAttribution}`}
                </p>
              )}
            </div>
          )}

          {/* Excerpt Lead */}
          {article.excerpt && (
            <div className="p-5 bg-pitch-900 border-l-4 border-brand-green border-pitch-800 text-sm sm:text-base text-slate-200 font-sans italic leading-relaxed shadow-md">
              &ldquo;{article.excerpt}&rdquo;
            </div>
          )}

          {/* Article Main Manuscript Body */}
          <div className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line font-sans space-y-4">
            {article.body}
          </div>

          {/* Editorial Sources & Verified References */}
          {article.sources && article.sources.length > 0 && (
            <div className="pt-8 border-t border-pitch-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-brand-green" />
                <span>Verified Editorial Citations & Primary Sources ({article.sources.length})</span>
              </div>

              <div className="divide-y divide-pitch-800 border border-pitch-800 bg-pitch-900 shadow-lg text-xs font-mono">
                {article.sources.map((s: any) => (
                  <div key={s.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-100">{s.sourceName}</span>
                      <span className="text-slate-500 ml-2">[{s.sourceType}]</span>
                    </div>
                    <a
                      href={s.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-green hover:underline flex items-center gap-1.5 text-[11px] self-start sm:self-auto shrink-0 font-semibold"
                    >
                      <span>Verify Primary Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
