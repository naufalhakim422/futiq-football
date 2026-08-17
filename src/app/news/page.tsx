import React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ArticleCard } from "@/components/article/ArticleCard";
import { ArticleSummary } from "@/types/article";

const NEWS_ARTICLES: ArticleSummary[] = [
  {
    id: "news-1",
    title: "UEFA Expands Financial Fair Play Thresholds: What the New Squad Cost Rules Mean for Top 5 Leagues",
    slug: "uefa-expands-financial-fair-play-thresholds",
    excerpt: "A comprehensive breakdown of revenue-to-wage ratios, amortisation restrictions, and potential penalty brackets starting in 2026/27.",
    coverImageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop",
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
    title: "National Team Watch: Emerging Youth Stars Ready to Break Into the World Cup 2026 Qualifying Squads",
    slug: "national-team-watch-emerging-youth-stars",
    excerpt: "Scouting reports on the teenage prodigies dominating domestic cup competitions and youth tournaments.",
    coverImageUrl: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=800&auto=format&fit=crop",
    category: { id: "cat-3", name: "Scouting", slug: "scouting" },
    author: { id: "auth-3", fullName: "Marcus Thorne", tier: "REGULAR" },
    readTimeMinutes: 6,
    publishedAt: "4h ago",
  },
];

export default function NewsPage() {
  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        <SectionHeader
          title="Editorial News & Analysis"
          subtitle="Real-time reporting, investigative football journalism, and tactical perspectives"
          badgeText="Live Feed"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {NEWS_ARTICLES.map((article) => (
            <ArticleCard key={article.id} article={article} variant="standard" />
          ))}
        </div>
      </PageContainer>
    </div>
  );
}
