import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

export function EmptyState({
  title = "No Data Found",
  description = "There are no records available for this section at the moment.",
  actionLabel,
  actionHref,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "bg-pitch-900 border border-pitch-800 rounded p-8 text-center flex flex-col items-center justify-center my-4",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-pitch-800 flex items-center justify-center text-slate-400 mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-100 tracking-wide mb-1">
        {title}
      </h3>
      <p className="text-sm text-slate-400 max-w-md mb-4">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-950 bg-brand-green hover:bg-brand-green-hover rounded transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
