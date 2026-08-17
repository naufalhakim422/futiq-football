import React from "react";
import { ArticleSummary } from "@/types/article";
import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
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
          "group block border-b border-pitch-800 pb-3 mb-3 last:border-0 last:mb-0",
          className
        )}
      >
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-brand-green mb-1">
          <span>{article.category.name}</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 font-mono font-normal">
            {article.readTimeMinutes} min read
          </span>
        </div>
        <Link href={`/news/${article.slug}`}>
          <h3 className="text-sm font-semibold text-slate-100 group-hover:text-brand-green transition-colors leading-snug font-sans">
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
          "group grid grid-cols-1 sm:grid-cols-12 gap-4 bg-pitch-900 hover:bg-pitch-850 border border-pitch-800 hover:border-pitch-700 p-4 transition-all",
          className
        )}
      >
        <div className="sm:col-span-4 aspect-[16/10] bg-pitch-800 overflow-hidden relative">
          <Image
            src={article.coverImageUrl}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="sm:col-span-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-green mb-1.5">
              <span>{article.category.name}</span>
              {article.isBreaking && (
                <span className="bg-brand-red text-white text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                  BREAKING
                </span>
              )}
            </div>
            <Link href={`/news/${article.slug}`}>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-brand-green transition-colors leading-snug font-sans">
                {article.title}
              </h3>
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 line-clamp-2 leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 mt-3 pt-3 border-t border-pitch-800">
            <span className="font-medium text-slate-300">
              {article.author.fullName}
            </span>
            <span className="flex items-center gap-1 font-mono text-[11px]">
              <Clock className="w-3 h-3" />
              <span>{article.readTimeMinutes} min</span>
            </span>
            <span className="text-[11px] text-slate-500">
              {article.publishedAt}
            </span>
          </div>
        </div>
      </article>
    );
  }

  // Standard vertical card
  return (
    <article
      className={cn(
        "group flex flex-col bg-pitch-900 hover:bg-pitch-850 border border-pitch-800 hover:border-pitch-700 overflow-hidden transition-all",
        className
      )}
    >
      <div className="aspect-[16/10] bg-pitch-800 overflow-hidden relative">
        <Image
          src={article.coverImageUrl}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2 flex gap-1 z-10">
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-pitch-950/80 backdrop-blur-sm text-brand-green border border-pitch-800">
            {article.category.name}
          </span>
          {article.isBreaking && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-brand-red text-white">
              BREAKING
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/news/${article.slug}`}>
            <h3 className="text-base font-bold text-slate-100 group-hover:text-brand-green transition-colors leading-snug font-sans">
              {article.title}
            </h3>
          </Link>
          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 mt-4 pt-3 border-t border-pitch-800">
          <span className="text-slate-300 font-medium truncate max-w-[130px]">
            {article.author.fullName}
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            {article.readTimeMinutes} min read
          </span>
        </div>
      </div>
    </article>
  );
}
