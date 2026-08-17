import React from "react";
import { ArticleSummary } from "@/types/article";
import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroArticleProps {
  article: ArticleSummary;
  className?: string;
}

export function HeroArticle({ article, className }: HeroArticleProps) {
  return (
    <article
      className={cn(
        "group relative bg-pitch-900 border border-pitch-800 hover:border-pitch-700 overflow-hidden transition-all grid grid-cols-1 lg:grid-cols-12",
        className
      )}
    >
      <div className="lg:col-span-7 aspect-[16/10] lg:aspect-auto bg-pitch-800 overflow-hidden relative min-h-[280px] lg:min-h-[380px]">
        <Image
          src={article.coverImageUrl}
          alt={article.title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-pitch-950 via-transparent to-transparent lg:hidden" />
      </div>

      <div className="lg:col-span-5 p-5 sm:p-6 lg:p-8 flex flex-col justify-between bg-pitch-900">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-pitch-800 text-brand-green border border-pitch-700">
              {article.category.name}
            </span>
            {article.isBreaking && (
              <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-brand-red text-white">
                BREAKING
              </span>
            )}
            <span className="text-xs text-slate-500 font-mono">
              {article.publishedAt}
            </span>
          </div>

          <Link href={`/news/${article.slug}`}>
            <h1 className="text-2xl sm:text-3xl lg:text-3xl font-extrabold text-slate-100 group-hover:text-brand-green transition-colors leading-tight font-editorial mb-3">
              {article.title}
            </h1>
          </Link>

          <p className="text-sm text-slate-300 leading-relaxed line-clamp-4 font-sans">
            {article.excerpt}
          </p>
        </div>

        <div className="flex items-center justify-between pt-5 mt-5 border-t border-pitch-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-pitch-800 border border-pitch-700 flex items-center justify-center font-bold text-xs text-brand-green">
              {article.author.fullName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">
                {article.author.fullName}
              </p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                {article.author.tier} Writer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>{article.readTimeMinutes} min read</span>
          </div>
        </div>
      </div>
    </article>
  );
}
