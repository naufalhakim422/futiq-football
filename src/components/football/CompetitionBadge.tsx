import React from "react";
import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";

interface CompetitionBadgeProps {
  name: string;
  code: string;
  logoUrl?: string;
  className?: string;
}

export function CompetitionBadge({
  name,
  code,
  logoUrl,
  className,
}: CompetitionBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 bg-pitch-850 border border-pitch-750 text-slate-300 text-xs font-semibold uppercase tracking-wider",
        className
      )}
      title={name}
    >
      <Trophy className="w-3 h-3 text-brand-green" />
      <span>{code || name}</span>
    </div>
  );
}
