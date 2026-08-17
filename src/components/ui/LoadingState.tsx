import React from "react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  type?: "article" | "match" | "table" | "card";
  count?: number;
  className?: string;
}

export function LoadingState({
  type = "card",
  count = 3,
  className,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-label="Loading content..."
      className={cn("w-full space-y-4 animate-pulse", className)}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="w-full">
          {type === "article" && (
            <div className="bg-pitch-850 border border-pitch-800 rounded p-4 flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-48 h-32 bg-pitch-700 rounded" />
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-pitch-700 rounded w-1/4" />
                <div className="h-6 bg-pitch-700 rounded w-4/5" />
                <div className="h-4 bg-pitch-700 rounded w-full" />
                <div className="h-3 bg-pitch-700 rounded w-1/3" />
              </div>
            </div>
          )}

          {type === "match" && (
            <div className="bg-pitch-850 border border-pitch-800 rounded p-3 flex items-center justify-between">
              <div className="h-4 bg-pitch-700 rounded w-16" />
              <div className="flex items-center gap-4 flex-1 justify-center">
                <div className="h-4 bg-pitch-700 rounded w-20" />
                <div className="h-6 bg-pitch-700 rounded w-12" />
                <div className="h-4 bg-pitch-700 rounded w-20" />
              </div>
              <div className="h-4 bg-pitch-700 rounded w-12" />
            </div>
          )}

          {type === "table" && (
            <div className="bg-pitch-850 border border-pitch-800 rounded p-4 space-y-3">
              <div className="h-4 bg-pitch-700 rounded w-full" />
              <div className="h-4 bg-pitch-700 rounded w-full" />
              <div className="h-4 bg-pitch-700 rounded w-full" />
            </div>
          )}

          {type === "card" && (
            <div className="bg-pitch-850 border border-pitch-800 rounded p-5 space-y-3">
              <div className="h-5 bg-pitch-700 rounded w-1/3" />
              <div className="h-4 bg-pitch-700 rounded w-full" />
              <div className="h-4 bg-pitch-700 rounded w-2/3" />
            </div>
          )}
        </div>
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
