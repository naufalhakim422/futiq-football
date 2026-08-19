import React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { HeroArticle } from "@/components/article/HeroArticle";
import { ArticleCard } from "@/components/article/ArticleCard";
import { MatchCard } from "@/components/football/MatchCard";
import { ArticleSummary } from "@/types/article";
import { footballService } from "@/lib/football/football.service";
import Link from "next/link";
import { Flame, ArrowUpRight, Shield, Zap, Sparkles, Trophy, ChevronRight, PenTool, CheckCircle2 } from "lucide-react";
import { AdSlotBanner } from "@/components/ads/AdSlotBanner";
import { AdPlacementPosition } from "@prisma/client";
import { BreakingTickerBar } from "@/components/home/BreakingTickerBar";
import { CategoryPillsBar } from "@/components/home/CategoryPillsBar";
import { TacticalIntelligenceHub } from "@/components/home/TacticalIntelligenceHub";

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
    <div className="space-y-8 pb-16 font-sans">
      {/* 1. Live Breaking News Ticker Bar */}
      <BreakingTickerBar />

      {/* 2. Top Billboard Sponsor Placement */}
      <PageContainer>
        <AdSlotBanner position={AdPlacementPosition.HOME_TOP} />
      </PageContainer>

      {/* 3. Category Filter Navigation Bar */}
      <PageContainer>
        <CategoryPillsBar />
      </PageContainer>

      {/* 4. Editorial Lead Section (Hero Showcase + Sidebar) */}
      <PageContainer>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Hero Story + Sub-featured Card */}
          <div className="lg:col-span-8 space-y-6">
            <HeroArticle article={HERO_STORY} />

            {/* Sub-featured Horizontal Card */}
            <ArticleCard
              article={FEATURED_STORIES[0]}
              variant="horizontal"
            />
          </div>

          {/* Right Editorial Sidebar / Trending Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Live Matchday Quick Board */}
            <div className="bg-pitch-900 border border-pitch-800 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-pitch-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-red animate-ping" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-mono">
                    Match Center Live
                  </h3>
                </div>
                <Link
                  href="/matches"
                  className="text-[11px] font-bold text-[#c3ff00] hover:underline uppercase font-mono flex items-center gap-1"
                >
                  <span>Lihat Semua</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-3">
                {displayMatches.slice(0, 3).map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </div>

            {/* Trending Breaking Dispatch List */}
            <div className="bg-pitch-900 border border-pitch-800 rounded-2xl p-5 shadow-2xl space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-pitch-800">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-brand-red" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-mono">
                    Trending Dispatch
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Live 24h</span>
              </div>

              <div className="divide-y divide-pitch-800/80">
                <ArticleCard article={FEATURED_STORIES[1]} variant="compact" />
                <ArticleCard article={FEATURED_STORIES[2]} variant="compact" />
                <ArticleCard article={HERO_STORY} variant="compact" />
              </div>
            </div>
          </div>
        </div>
      </PageContainer>

      {/* 5. Tactical & Data Intelligence Hub */}
      <PageContainer>
        <TacticalIntelligenceHub />
      </PageContainer>

      {/* 6. Mid-Feed Sponsor Placement */}
      <PageContainer>
        <AdSlotBanner position={AdPlacementPosition.HOME_MIDDLE} />
      </PageContainer>

      {/* 7. Primary Grid: Tactical Intelligence & Long-Form Reports */}
      <PageContainer>
        <SectionHeader
          title="Analisis Taktik & Laporan Mendalam"
          subtitle="Jurnalisme sepak bola investigatif, analitik data taktis, dan profil klub terkini"
          badgeText="Editorial Desk"
          viewAllHref="/news"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {FEATURED_STORIES.map((article) => (
            <ArticleCard key={article.id} article={article} variant="standard" />
          ))}
        </div>
      </PageContainer>

      {/* 8. Contributor VIP Creator Studio Callout Banner */}
      <PageContainer>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pitch-950 via-pitch-900 to-pitch-950 border border-[#c3ff00]/40 p-8 sm:p-10 shadow-2xl">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-[#c3ff00]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#c3ff00]/10 text-[#c3ff00] text-[10px] font-mono font-bold uppercase tracking-widest border border-[#c3ff00]/30 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Program Jurnalis & Kontributor FUTIQ</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight font-sans">
                Tulis Berita Sepak Bola & Dapatkan Royalti Nyata
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                Bergabunglah dengan meja redaksi independen terbesar. Publikasikan artikel analisis taktik, investigasi transfer, dan laporan pertandingan. Dapatkan royalti transparan dengan penarikan instan mulai dari <strong>RM 85,00</strong>.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1 text-xs font-mono text-slate-300">
                <div className="flex items-center gap-1.5 text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-[#c3ff00]" />
                  <span>Editor Blok Modular</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-[#c3ff00]" />
                  <span>Penarikan Bank Lokal (RM 85+)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-[#c3ff00]" />
                  <span>Audit Integritas AI Otomatis</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <Link
                href="/contributor/apply"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-950 bg-[#c3ff00] hover:bg-[#b0e600] rounded-xl transition-all shadow-[0_0_20px_rgba(195,255,0,0.3)] active:scale-[0.99]"
              >
                <PenTool className="w-4 h-4 text-slate-950" />
                <span>Daftar Menjadi Penulis</span>
              </Link>
              
              <Link
                href="/contributor"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 text-xs font-bold text-slate-300 hover:text-white bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 rounded-xl transition-colors"
              >
                <span>Masuk Meja Kerja</span>
              </Link>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
