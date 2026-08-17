import React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { HeroArticle } from "@/components/article/HeroArticle";
import { ArticleCard } from "@/components/article/ArticleCard";
import { MatchCard } from "@/components/football/MatchCard";
import { ArticleSummary } from "@/types/article";
import { footballService } from "@/lib/football/football.service";
import Link from "next/link";
import { Flame, ArrowUpRight, Shield, Zap } from "lucide-react";
import { AdSlotBanner } from "@/components/ads/AdSlotBanner";
import { AdPlacementPosition } from "@prisma/client";

export const revalidate = 60; // 1 minute ISR

const HERO_STORY: ArticleSummary = {
  id: "art-1",
  title: "Inside Mikel Arteta's High-Press Evolution: How Arsenal Re-Engineered Their Rest Defense for Europe",
  slug: "inside-mikel-arteta-high-press-evolution-arsenal",
  excerpt:
    "An in-depth tactical deconstruction of Arsenal's inverted fullback rotations, territorial control metrics, and how physical dominance in transition phases is reshaping their Champions League campaign.",
  coverImageUrl:
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop",
  category: { id: "cat-1", name: "Tactical Analysis", slug: "tactical-analysis" },
  author: {
    id: "auth-1",
    fullName: "Gabriel Vance",
    tier: "EXPERT",
  },
  readTimeMinutes: 7,
  publishedAt: "25m ago",
  isFeatured: true,
};

const FEATURED_STORIES: ArticleSummary[] = [
  {
    id: "art-2",
    title: "Transfer Intelligence: Real Madrid Finalize Contract Terms with Bayern's Left-Back Ahead of Summer Window",
    slug: "transfer-intelligence-real-madrid-bayern-contract-terms",
    excerpt: "Exclusive details on valuation agreements, wage structures, and the buyout clause mechanisms being drafted in Madrid.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop",
    category: { id: "cat-2", name: "Transfer Center", slug: "transfers" },
    author: { id: "auth-2", fullName: "Elena Rostova", tier: "SENIOR" },
    readTimeMinutes: 4,
    publishedAt: "1h ago",
    isBreaking: true,
  },
  {
    id: "art-3",
    title: "The Midfield Engine Room: Why Rodri's Absence Exposes Crucial Structural Gaps in Title Races",
    slug: "the-midfield-engine-room-rodri-absence-structural-gaps",
    excerpt: "Data-driven statistical analysis showing the stark difference in expected goals conceded when defensive midfield pivots break down.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=800&auto=format&fit=crop",
    category: { id: "cat-3", name: "Deep Dive", slug: "deep-dive" },
    author: { id: "auth-3", fullName: "Marcus Thorne", tier: "REGULAR" },
    readTimeMinutes: 6,
    publishedAt: "2h ago",
  },
  {
    id: "art-4",
    title: "Serie A Title Race: Inter's High-Octane Wingback Blueprint Crushes Rival Press Schemes",
    slug: "serie-a-title-race-inter-high-octane-wingbacks",
    excerpt: "Simone Inzaghi's tactical flexibility has turned the Nerazzurri into the most fluid attacking transition machine on the continent.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800&auto=format&fit=crop",
    category: { id: "cat-4", name: "European Football", slug: "european-football" },
    author: { id: "auth-4", fullName: "Dario Fontana", tier: "EXPERT" },
    readTimeMinutes: 5,
    publishedAt: "4h ago",
  },
];

export default async function HomePage() {
  const [liveMatches, fixtures] = await Promise.all([
    footballService.getLiveMatches(),
    footballService.getFixtures({ limit: 4 }),
  ]);

  const displayMatches = liveMatches.length > 0 ? liveMatches : fixtures;

  return (
    <div className="space-y-10 py-6">
      {/* Top Billboard Sponsor Placement */}
      <PageContainer>
        <AdSlotBanner position={AdPlacementPosition.HOME_TOP} className="mb-6" />
      </PageContainer>

      {/* Editorial Lead Section */}
      <PageContainer>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Hero Story */}
          <div className="lg:col-span-8 space-y-6">
            <HeroArticle article={HERO_STORY} />

            {/* Sub-featured Horizontal Card */}
            <div className="grid grid-cols-1 gap-4 pt-2">
              <ArticleCard
                article={FEATURED_STORIES[0]}
                variant="horizontal"
              />
            </div>
          </div>

          {/* Right Editorial Sidebar / Trending Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Live Matchday Quick Board */}
            <div className="bg-pitch-900 border border-pitch-800 p-4">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-pitch-850">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-brand-green" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-sans">
                    Match Center Live
                  </h3>
                </div>
                <Link
                  href="/matches"
                  className="text-[11px] font-semibold text-brand-green hover:underline uppercase font-mono"
                >
                  All Matches
                </Link>
              </div>

              <div className="space-y-2.5">
                {displayMatches.slice(0, 3).map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </div>

            {/* Trending News Dispatch List */}
            <div className="bg-pitch-900 border border-pitch-800 p-4">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-pitch-850">
                <Flame className="w-4 h-4 text-brand-red" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-sans">
                  Breaking Dispatch
                </h3>
              </div>

              <div className="divide-y divide-pitch-850">
                <ArticleCard article={FEATURED_STORIES[1]} variant="compact" />
                <ArticleCard article={FEATURED_STORIES[2]} variant="compact" />
                <ArticleCard article={HERO_STORY} variant="compact" />
              </div>
            </div>
          </div>
        </div>
      </PageContainer>

      {/* Mid-Feed In-Stream Ad Placement */}
      <PageContainer>
        <AdSlotBanner position={AdPlacementPosition.HOME_MIDDLE} />
      </PageContainer>

      {/* Primary Content Grid */}
      <PageContainer>
        <SectionHeader
          title="Tactical Intelligence & Reports"
          subtitle="Long-form journalism, match analytics, and tactical breakdowns"
          badgeText="Editorial Desk"
          viewAllHref="/news"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURED_STORIES.map((article) => (
            <ArticleCard key={article.id} article={article} variant="standard" />
          ))}
        </div>
      </PageContainer>

      {/* Contributor Platform Callout Strip */}
      <PageContainer>
        <div className="bg-gradient-to-r from-pitch-900 to-pitch-850 border border-pitch-750 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-pitch-800 text-brand-green text-[10px] font-bold uppercase tracking-wider border border-pitch-700">
              <Shield className="w-3 h-3" />
              <span>Independent Football Writers</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-100 font-sans">
              Write for FUTIQ FOOTBALL
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Publish original sports journalism, tactical analysis, and local club reports. Earn transparent revenue rewards backed by genuine readership engagement metrics.
            </p>
          </div>

          <Link
            href="/contributor"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-brand-green hover:bg-brand-green-hover transition-colors"
          >
            <span>Apply as Contributor</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </PageContainer>
    </div>
  );
}
