import React from "react";
import { ArticleSummary } from "@/types/article";
import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowUpRight, Flame, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroArticleProps {
  article: ArticleSummary;
  className?: string;
}

export function HeroArticle({ article, className }: HeroArticleProps) {
  return (
    <article
      className={cn(
        "group relative bg-pitch-900 border border-pitch-800 hover:border-[#c3ff00]/60 overflow-hidden transition-all duration-300 rounded-2xl shadow-2xl grid grid-cols-1 lg:grid-cols-12",
        className
      )}
    >
      {/* Hero Image Container */}
      <div className="lg:col-span-7 aspect-[16/10] lg:aspect-auto bg-pitch-950 overflow-hidden relative min-h-[300px] lg:min-h-[420px]">
        <Image
          src={article.coverImageUrl}
          alt={article.title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-pitch-950 via-pitch-950/30 to-transparent lg:hidden" />
        
        {/* Floating Tags on Image */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
          <span className="px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider bg-pitch-950/90 backdrop-blur-md text-[#c3ff00] border border-[#c3ff00]/40 rounded-lg shadow-lg">
            ⭐ {article.category.name}
          </span>
          {article.isBreaking && (
            <span className="px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider bg-brand-red text-white rounded-lg shadow-lg flex items-center gap-1 animate-pulse">
              <Flame className="w-3.5 h-3.5" />
              <span>BREAKING</span>
            </span>
          )}
        </div>
      </div>

      {/* Editorial Content Column */}
      <div className="lg:col-span-5 p-6 sm:p-8 lg:p-8 flex flex-col justify-between bg-gradient-to-b from-pitch-900 to-pitch-950">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="text-[#c3ff00] font-bold">EDISI UTAMA</span>
            <span>•</span>
            <span>{article.publishedAt}</span>
          </div>

          <Link href={`/news/${article.slug}`} className="block group-hover:text-[#c3ff00] transition-colors">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 group-hover:text-[#c3ff00] transition-colors leading-tight font-sans tracking-tight">
              {article.title}
            </h1>
          </Link>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-4 font-sans font-normal">
            {article.excerpt}
          </p>
        </div>

        {/* Author Byline & Read Time Footer */}
        <div className="flex items-center justify-between pt-5 mt-6 border-t border-pitch-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-pitch-950 border border-[#c3ff00]/50 flex items-center justify-center font-bold text-xs text-[#c3ff00] font-mono shadow-sm">
              {article.author.fullName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">
                {article.author.fullName}
              </p>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                {article.author.tier} Writer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-[#c3ff00]" />
            <span>{article.readTimeMinutes} min read</span>
          </div>
        </div>
      </div>
    </article>
  );
}
