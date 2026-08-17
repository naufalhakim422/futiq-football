import React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ArticleCard } from "@/components/article/ArticleCard";
import { ArticleSummary } from "@/types/article";
import { prisma } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";
import Link from "next/link";
import { Clock, User, ArrowRight, Sparkles, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

const DEFAULT_NEWS_ARTICLES: ArticleSummary[] = [
  {
    id: "news-1",
    title: "UEFA Expands Financial Fair Play Thresholds: What the New Squad Cost Rules Mean for Top 5 Leagues",
    slug: "uefa-expands-financial-fair-play-thresholds",
    excerpt: "A comprehensive breakdown of revenue-to-wage ratios, amortisation restrictions, and potential penalty brackets starting in 2026/27.",
    coverImageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop",
    category: { id: "cat-1", name: "Finance & Governance", slug: "finance" },
    author: { id: "auth-1", fullName: "Gabriel Vance", tier: "EXPERT" },
    readTimeMinutes: 5,
    publishedAt: "30m ago",
  },
  {
    id: "news-2",
    title: "Tactical Masterclass: How 3-2-4-1 Build-up Structures Dismantled Low-Block Counter Attacks",
    slug: "tactical-masterclass-3-2-4-1-buildup-structures",
    excerpt: "Analyzing heatmaps and passing network clusters from the weekend's marquee European clashes.",
    coverImageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop",
    category: { id: "cat-2", name: "Tactical Analysis", slug: "tactics" },
    author: { id: "auth-2", fullName: "Elena Rostova", tier: "SENIOR" },
    readTimeMinutes: 8,
    publishedAt: "2h ago",
  },
  {
    id: "news-3",
    title: "National Team Watch: Emerging Youth Stars Ready to Break Into World Cup 2026 Qualifying Squads",
    slug: "national-team-watch-emerging-youth-stars",
    excerpt: "Scouting reports on the teenage prodigies dominating domestic cup competitions and youth tournaments.",
    coverImageUrl: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=800&auto=format&fit=crop",
    category: { id: "cat-3", name: "Scouting Radar", slug: "scouting" },
    author: { id: "auth-3", fullName: "Marcus Thorne", tier: "REGULAR" },
    readTimeMinutes: 6,
    publishedAt: "4h ago",
  },
  {
    id: "news-4",
    title: "Champions League Tactical Review: High-Pressing Triggers in Transition Phases",
    slug: "champions-league-tactical-review-high-pressing",
    excerpt: "Examining how elite European clubs structured rest defense against transitional counter-attacks in Matchday 5.",
    coverImageUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=800&auto=format&fit=crop",
    category: { id: "cat-4", name: "European Football", slug: "european" },
    author: { id: "auth-4", fullName: "Gabriel Vance", tier: "EXPERT" },
    readTimeMinutes: 7,
    publishedAt: "6h ago",
  },
];

export default async function NewsPage() {
  let publishedDbArticles: any[] = [];
  try {
    publishedDbArticles = await prisma.article.findMany({
      where: { status: ArticleStatus.PUBLISHED },
      orderBy: { publishedAt: "desc" },
      take: 12,
      include: {
        author: true,
        contributorProfile: true,
      },
    });
  } catch (error) {
    // Database fallback
  }

  const mappedDbArticles: ArticleSummary[] = publishedDbArticles.map((art) => ({
    id: art.id,
    title: art.title,
    slug: art.slug,
    excerpt: art.excerpt,
    coverImageUrl:
      art.featuredImageUrl ||
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop",
    category: {
      id: `cat-${art.category.toLowerCase().replace(/\s+/g, "-")}`,
      name: art.category,
      slug: art.category.toLowerCase().replace(/\s+/g, "-"),
    },
    author: {
      id: art.authorId,
      fullName: art.contributorProfile?.displayName || art.author.fullName,
      tier: "SENIOR",
      avatarUrl: art.author.avatarUrl,
    },
    readTimeMinutes: art.readTimeMinutes || 5,
    publishedAt: art.publishedAt
      ? new Date(art.publishedAt).toLocaleDateString()
      : "Recently",
  }));

  const allArticles = [...mappedDbArticles, ...DEFAULT_NEWS_ARTICLES];
  const leadArticle = allArticles[0];
  const secondaryArticles = allArticles.slice(1);

  return (
    <div className="py-8 space-y-10">
      <PageContainer>
        <SectionHeader
          title="Editorial Newsroom & Tactical Analysis"
          subtitle="In-depth reporting, tactical deconstructions, governance insights, and investigative sports journalism"
          badgeText="Live Dispatch"
        />

        {/* Lead Featured Story (Hero Article) */}
        {leadArticle && (
          <div className="bg-pitch-900 border border-pitch-800 overflow-hidden shadow-2xl group">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-pitch-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={leadArticle.coverImageUrl}
                  alt={leadArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-pitch-950 via-pitch-950/20 to-transparent lg:hidden" />
              </div>

              <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-pitch-850 text-brand-green border border-pitch-750 font-mono">
                      {leadArticle.category.name}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Featured Investigation
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-100 font-sans tracking-tight leading-tight group-hover:text-brand-green transition-colors">
                    <Link href={`/news/${leadArticle.slug}`}>
                      {leadArticle.title}
                    </Link>
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                    {leadArticle.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-pitch-800 flex items-center justify-between text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-bold text-slate-200">{leadArticle.author.fullName}</span>
                    <span>• {leadArticle.readTimeMinutes} min read</span>
                  </div>

                  <Link
                    href={`/news/${leadArticle.slug}`}
                    className="inline-flex items-center gap-1.5 text-brand-green font-bold uppercase tracking-wider hover:underline"
                  >
                    <span>Read Story</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Secondary Articles Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-pitch-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-sans">
              Latest Dispatches & Analysis
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {secondaryArticles.length} Stories
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {secondaryArticles.map((article) => (
              <ArticleCard key={article.id} article={article} variant="standard" />
            ))}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
