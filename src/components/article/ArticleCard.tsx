import React from "react";
import { ArticleSummary } from "@/types/article";
import Link from "next/link";
import Image from "next/image";
import { Clock, Flame, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArticleCardProps {
  article: ArticleSummary;
  variant?: "standard" | "compact" | "horizontal";
  className?: string;
}

export function ArticleCard({
  article,
  variant = "standard",
  className,
}: ArticleCardProps) {
  if (variant === "compact") {
    return (
      <article
        className={cn(
          "group block py-3.5 border-b border-pitch-800/80 last:border-0 last:pb-0 transition-colors",
          className
        )}
      >
        <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-wider text-[#c3ff00] mb-1.5">
          <span>{article.category.name}</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400 font-normal">
            {article.readTimeMinutes} min read
          </span>
          {article.isBreaking && (
            <span className="bg-brand-red text-white text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ml-auto">
              HOT
            </span>
          )}
        </div>
        <Link href={`/news/${article.slug}`}>
          <h3 className="text-sm font-bold text-slate-100 group-hover:text-[#c3ff00] transition-colors leading-snug font-sans line-clamp-2">
            {article.title}
          </h3>
        </Link>
      </article>
    );
  }

  if (variant === "horizontal") {
    return (
      <article
        className={cn(
          "group grid grid-cols-1 sm:grid-cols-12 gap-5 bg-pitch-900 hover:bg-pitch-850 border border-pitch-800 hover:border-[#c3ff00]/60 p-4 sm:p-5 rounded-2xl transition-all duration-300 shadow-xl",
          className
        )}
      >
        <div className="sm:col-span-4 aspect-[16/10] bg-pitch-950 rounded-xl overflow-hidden relative min-h-[140px]">
          <Image
            src={article.coverImageUrl}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {article.isBreaking && (
            <span className="absolute top-2 left-2 bg-brand-red text-white text-[9px] px-2 py-0.5 rounded font-mono font-bold shadow-md">
              BREAKING
            </span>
          )}
        </div>
        <div className="sm:col-span-8 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#c3ff00]">
              <span className="px-2 py-0.5 rounded bg-pitch-950 border border-pitch-750 text-[10px]">
                {article.category.name}
              </span>
              <span className="text-[10px] text-slate-500 font-normal">
                {article.publishedAt}
              </span>
            </div>
            <Link href={`/news/${article.slug}`}>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-[#c3ff00] transition-colors leading-snug font-sans">
                {article.title}
              </h3>
            </Link>
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 mt-4 pt-3 border-t border-pitch-800/80">
            <span className="font-semibold text-slate-200">
              {article.author.fullName}
            </span>
            <span className="flex items-center gap-1 font-mono text-[11px]">
              <Clock className="w-3 h-3 text-[#c3ff00]" />
              <span>{article.readTimeMinutes} min read</span>
            </span>
          </div>
        </div>
      </article>
    );
  }

  // Standard Vertical Card
  return (
    <article
      className={cn(
        "group flex flex-col bg-pitch-900 hover:bg-pitch-850 border border-pitch-800 hover:border-[#c3ff00]/60 rounded-2xl overflow-hidden transition-all duration-300 shadow-xl",
        className
      )}
    >
      <div className="aspect-[16/10] bg-pitch-950 overflow-hidden relative">
        <Image
          src={article.coverImageUrl}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-1.5 z-10">
          <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider bg-pitch-950/90 backdrop-blur-sm text-[#c3ff00] border border-pitch-800 rounded-lg shadow-md">
            {article.category.name}
          </span>
          {article.isBreaking && (
            <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider bg-brand-red text-white rounded-lg shadow-md animate-pulse">
              BREAKING
            </span>
          )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <Link href={`/news/${article.slug}`}>
            <h3 className="text-base font-bold text-slate-100 group-hover:text-[#c3ff00] transition-colors leading-snug font-sans line-clamp-2">
              {article.title}
            </h3>
          </Link>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans">
            {article.excerpt}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-pitch-800/80">
          <span className="text-slate-200 font-semibold truncate max-w-[130px]">
            {article.author.fullName}
          </span>
          <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#c3ff00]" />
            <span>{article.readTimeMinutes} min</span>
          </span>
        </div>
      </div>
    </article>
  );
}
