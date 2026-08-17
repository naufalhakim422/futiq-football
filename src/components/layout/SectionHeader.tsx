import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  viewAllHref?: string;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  badgeText,
  viewAllHref,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-pitch-800 pb-3 mb-6",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-5 bg-brand-green rounded-none" />
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-slate-100 font-sans">
              {title}
            </h2>
            {badgeText && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-pitch-800 text-brand-green border border-pitch-700">
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="group inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-brand-green transition-colors"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
}
