import React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface TeamBadgeProps {
  name: string;
  tla: string;
  logoUrl?: string;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
}

export function TeamBadge({
  name,
  tla,
  logoUrl,
  size = "md",
  showName = true,
  className,
}: TeamBadgeProps) {
  const sizeMap = {
    sm: "w-5 h-5 text-[10px]",
    md: "w-7 h-7 text-xs",
    lg: "w-10 h-10 text-sm",
  };

  const pixelMap = {
    sm: 20,
    md: 28,
    lg: 40,
  };

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div
        className={cn(
          "rounded-full bg-pitch-800 border border-pitch-700 flex items-center justify-center font-mono font-bold text-slate-300 shrink-0 relative overflow-hidden",
          sizeMap[size]
        )}
        title={name}
      >
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={name}
            width={pixelMap[size]}
            height={pixelMap[size]}
            className="object-contain rounded-full"
          />
        ) : (
          <span>{tla.substring(0, 3).toUpperCase()}</span>
        )}
      </div>
      {showName && (
        <span className="font-semibold text-slate-200 text-sm tracking-tight truncate">
          {name}
        </span>
      )}
    </div>
  );
}
