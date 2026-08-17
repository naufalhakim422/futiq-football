import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageContainer } from "@/components/layout/PageContainer";
import { ExternalLink, User, Clock, ShieldCheck, Share2 } from "lucide-react";
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

  if (!article) {
    notFound();
  }

  const authorName = article.contributorProfile?.displayName || article.author.fullName;

  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        <article className="max-w-3xl mx-auto space-y-8">
          {/* Header & Meta */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-pitch-900 text-brand-green border border-pitch-800 font-mono rounded">
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
              <p className="text-lg text-slate-300 font-sans font-medium leading-relaxed">
                {article.subtitle}
              </p>
            )}

            {/* Author Byline */}
            <div className="flex items-center justify-between pt-4 border-t border-pitch-800 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-pitch-800 border border-pitch-700 flex items-center justify-center font-bold text-brand-green">
                  {authorName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <span className="font-sans font-bold text-slate-200 block">
                    {authorName}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Verified Contributor
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span>{article.wordCount || 500} words</span>
                <span>• ~{article.readTimeMinutes || 5} min read</span>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          {article.featuredImageUrl && (
            <div className="space-y-2">
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-pitch-900 border border-pitch-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.featuredImageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {article.featuredImageCaption && (
                <p className="text-[11px] text-slate-500 font-sans italic">
                  {article.featuredImageCaption}
                  {article.imageAttribution && ` • Credit: ${article.imageAttribution}`}
                </p>
              )}
            </div>
          )}

          {/* Excerpt Lead */}
          {article.excerpt && (
            <div className="p-4 bg-pitch-900 border-l-2 border-brand-green text-sm text-slate-200 font-sans italic leading-relaxed">
              {article.excerpt}
            </div>
          )}

          {/* Main Body */}
          <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-line font-sans">
            {article.body}
          </div>

          {/* Sources Section */}
          {article.sources && article.sources.length > 0 && (
            <div className="pt-8 border-t border-pitch-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-brand-green" />
                <span>Editorial Sources & Verified References</span>
              </div>

              <div className="divide-y divide-pitch-850 border border-pitch-800 bg-pitch-900 text-xs font-mono">
                {article.sources.map((s: any) => (
                  <div key={s.id} className="p-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-200">{s.sourceName}</span>
                      <span className="text-slate-500 ml-2">({s.sourceType})</span>
                    </div>
                    <a
                      href={s.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-green hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <span>Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </PageContainer>
    </div>
  );
}
