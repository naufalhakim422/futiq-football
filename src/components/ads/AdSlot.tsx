"use client";

import React, { useEffect, useState } from "react";
import { AdPlacementPosition } from "@prisma/client";
import { AdCreativeOutput, AdFormat } from "@/lib/ads/types";
import { ExternalLink, Sparkles, Shield, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AdSlotProps {
  placement: AdPlacementPosition | string;
  category?: string;
  competitionCode?: string;
  teamSlug?: string;
  className?: string;
  minHeight?: string;
}

export function AdSlot({
  placement,
  category,
  competitionCode,
  teamSlug,
  className,
  minHeight = "min-h-[100px]",
}: AdSlotProps) {
  const [creative, setCreative] = useState<AdCreativeOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [impressionLogged, setImpressionLogged] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSlot() {
      try {
        const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
        const params = new URLSearchParams({
          position: placement,
          device: isMobile ? "MOBILE" : "DESKTOP",
        });

        if (category) params.append("category", category);
        if (competitionCode) params.append("competition", competitionCode);
        if (teamSlug) params.append("team", teamSlug);

        const res = await fetch(`/api/ads/slots?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.creative) {
            setCreative(data.creative);
          }
        }
      } catch (err) {
        // Graceful silent fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSlot();

    return () => {
      isMounted = false;
    };
  }, [placement, category, competitionCode, teamSlug]);

  // Log Impression once creative is rendered
  useEffect(() => {
    if (creative && !impressionLogged) {
      setImpressionLogged(true);
      fetch("/api/ads/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotKey: creative.slotKey || `slot_${placement.toLowerCase()}`,
          eventType: "IMPRESSION",
        }),
      }).catch(() => {});
    }
  }, [creative, impressionLogged, placement]);

  if (loading) {
    return (
      <div
        className={cn(
          "w-full bg-pitch-900/40 border border-pitch-800/40 animate-pulse rounded flex items-center justify-center text-slate-600 text-xs font-mono",
          minHeight,
          className
        )}
      >
        <span className="opacity-40 uppercase tracking-widest text-[10px]">Commercial Placement</span>
      </div>
    );
  }

  if (!creative) {
    return null;
  }

  const badgeText = creative.sponsorBadgeText || (creative.providerType === "DIRECT_SPONSOR" ? "Official Sponsor" : "Promoted");
  const isDirect = creative.providerType === "DIRECT_SPONSOR";
  const clickHref = creative.clickUrl || creative.targetUrl || "#";

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden border transition-all duration-200",
        isDirect
          ? "bg-gradient-to-r from-pitch-900 via-pitch-850 to-pitch-900 border-[#c3ff00]/30 shadow-lg hover:border-[#c3ff00]/60"
          : "bg-pitch-900 border-pitch-800 shadow-sm hover:border-pitch-700",
        className
      )}
    >
      {/* Sponsorship Header Strip */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-pitch-950 border-b border-pitch-800 text-[10px] font-mono uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          {isDirect ? (
            <Sparkles className="w-3 h-3 text-[#c3ff00]" />
          ) : (
            <Shield className="w-3 h-3 text-slate-400" />
          )}
          <span className={isDirect ? "text-[#c3ff00] font-bold" : "text-slate-400"}>
            {badgeText}
          </span>
          {creative.sponsorName && (
            <span className="text-slate-500 hidden sm:inline">• {creative.sponsorName}</span>
          )}
        </div>
        <span className="text-slate-500 text-[9px] lowercase">ads.futiq.com</span>
      </div>

      {/* Creative Rendering by Format */}
      <a
        href={clickHref}
        target={clickHref.startsWith("http") ? "_blank" : undefined}
        rel="noopener noreferrer sponsored"
        className="block group"
      >
        {creative.imageUrl ? (
          <div className="relative w-full aspect-[21/9] sm:aspect-[32/9] max-h-[220px] overflow-hidden bg-pitch-950 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={creative.imageUrl}
              alt={creative.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-4 sm:p-5">
              <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-[#c3ff00] transition-colors leading-snug">
                {creative.title}
              </h4>
              {creative.description && (
                <p className="text-xs text-slate-300 line-clamp-1 mt-0.5 max-w-2xl hidden sm:block">
                  {creative.description}
                </p>
              )}
              {creative.ctaText && (
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#c3ff00] group-hover:translate-x-1 transition-transform">
                  <span>{creative.ctaText}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-100 group-hover:text-[#c3ff00] transition-colors">
                {creative.title}
              </h4>
              {creative.description && (
                <p className="text-xs text-slate-400 max-w-xl">{creative.description}</p>
              )}
            </div>
            <span className="shrink-0 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-950 bg-[#c3ff00] hover:bg-[#a6ff00] transition-colors flex items-center gap-1">
              <span>{creative.ctaText || "Explore"}</span>
              <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        )}
      </a>
    </div>
  );
}
