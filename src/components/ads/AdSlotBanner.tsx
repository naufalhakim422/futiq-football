"use client";

import React, { useEffect, useState } from "react";
import { AdPlacementPosition } from "@prisma/client";
import { AdCreativeOutput } from "@/lib/ads/types";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdSlotBannerProps {
  position: AdPlacementPosition;
  device?: "DESKTOP" | "MOBILE" | "ALL";
  category?: string;
  teamSlug?: string;
  competitionCode?: string;
  className?: string;
}

export function AdSlotBanner({
  position,
  device = "ALL",
  category,
  teamSlug,
  competitionCode,
  className,
}: AdSlotBannerProps) {
  const [creative, setCreative] = useState<AdCreativeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchCreative() {
      try {
        const query = new URLSearchParams({
          position,
          device,
          ...(category ? { category } : {}),
          ...(teamSlug ? { team: teamSlug } : {}),
          ...(competitionCode ? { competition: competitionCode } : {}),
        });

        const res = await fetch(`/api/ads/slots?${query.toString()}`);
        if (!res.ok) return;

        const data = await res.json();
        if (isMounted && data.creative) {
          setCreative(data.creative);

          // Track Impression
          fetch("/api/ads/event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              slotKey: data.creative.slotKey,
              eventType: "IMPRESSION",
            }),
          }).catch(() => {});
        }
      } catch {
        // Non-blocking fallback
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchCreative();
    return () => {
      isMounted = false;
    };
  }, [position, device, category, teamSlug, competitionCode]);

  if (isLoading || !creative) {
    return null;
  }

  const handleClick = () => {
    if (creative.slotKey) {
      fetch("/api/ads/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotKey: creative.slotKey,
          eventType: "CLICK",
        }),
      }).catch(() => {});
    }
  };

  return (
    <div
      className={cn(
        "my-6 mx-auto w-full max-w-4xl bg-pitch-900 border border-pitch-800 rounded-xl overflow-hidden shadow-lg transition-all",
        className
      )}
    >
      <div className="px-3.5 py-1.5 bg-pitch-950/80 border-b border-pitch-800 flex items-center justify-between text-[10px] text-slate-400">
        <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-3 h-3 text-brand-green" />
          {creative.sponsorBadgeText || "Promoted Sponsor"}
        </span>
        <span className="text-slate-500 font-mono text-[9px]">{creative.providerName}</span>
      </div>

      <a
        href={creative.targetUrl || "#"}
        target="_blank"
        rel="noopener noreferrer nofollow"
        onClick={handleClick}
        className="block p-4 group hover:bg-pitch-850/50 transition-colors"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-pitch-gold transition-colors flex items-center justify-center sm:justify-start gap-1.5">
              {creative.title}
              <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
            </h4>
            <p className="text-xs text-slate-400">
              Official commercial partnership & matchday coverage support.
            </p>
          </div>

          <div className="shrink-0">
            <span className="px-4 py-2 bg-pitch-gold text-slate-950 font-bold text-xs rounded-lg hover:bg-yellow-400 transition-colors shadow">
              Explore →
            </span>
          </div>
        </div>
      </a>
    </div>
  );
}
