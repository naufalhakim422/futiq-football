"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Failed to Load Information",
  message = "An unexpected error occurred while communicating with the data server.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "bg-pitch-900 border border-brand-red/40 rounded p-6 text-center flex flex-col items-center justify-center my-4",
        className
      )}
    >
      <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red mb-3">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-400 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-pitch-800 hover:bg-pitch-700 border border-pitch-700 rounded transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}
