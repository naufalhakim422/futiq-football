"use client";

import React from "react";
import Link from "next/link";
import { Flame, ArrowRight, Radio, Sparkles } from "lucide-react";

interface TickerItem {
  id: string;
  tag: string;
  headline: string;
  slug: string;
  time: string;
}

const TICKER_ITEMS: TickerItem[] = [
  {
    id: "t1",
    tag: "TRANSFER",
    headline: "Real Madrid reached total oral agreement for Alphonso Davies summer transfer",
    slug: "transfer-intelligence-real-madrid-bayern-contract-terms",
    time: "12m ago",
  },
  {
    id: "t2",
    tag: "TACTICS",
    headline: "Arsenal deploy inverted box midfield in Champions League tactical rest-defense masterclass",
    slug: "inside-mikel-arteta-high-press-evolution-arsenal",
    time: "28m ago",
  },
  {
    id: "t3",
    tag: "SERIE A",
    headline: "Simone Inzaghi's 3-5-2 fluid transitions record highest attacking directness score in Europe",
    slug: "serie-a-title-race-inter-high-octane-wingbacks",
    time: "1h ago",
  },
  {
    id: "t4",
    tag: "ANALYTICS",
    headline: "Premier League expected goals (xG) delta reveals staggering structural midfield vulnerability",
    slug: "the-midfield-engine-room-rodri-absence-structural-gaps",
    time: "2h ago",
  },
];

export function BreakingTickerBar() {
  return (
    <div className="w-full bg-pitch-950/90 border-y border-pitch-800 backdrop-blur-md font-sans text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4 overflow-hidden">
        {/* Left Badge */}
        <div className="flex items-center gap-2 shrink-0 pr-3 border-r border-pitch-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-red"></span>
          </span>
          <span className="font-mono font-extrabold uppercase tracking-widest text-brand-red text-[11px] flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" />
            <span>BREAKING DISPATCH</span>
          </span>
        </div>

        {/* Scrolling Items */}
        <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-6 whitespace-nowrap">
          {TICKER_ITEMS.map((item, idx) => (
            <Link
              key={item.id}
              href={`/news/${item.slug}`}
              className="inline-flex items-center gap-2 group text-slate-300 hover:text-white transition-colors text-xs"
            >
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-pitch-900 border border-pitch-750 text-[#c3ff00] group-hover:border-[#c3ff00]/60 transition-colors">
                {item.tag}
              </span>
              <span className="font-medium group-hover:text-[#c3ff00] transition-colors truncate max-w-[320px] sm:max-w-[450px]">
                {item.headline}
              </span>
              <span className="text-[10px] font-mono text-slate-500">{item.time}</span>
              {idx < TICKER_ITEMS.length - 1 && (
                <span className="text-pitch-750 font-bold ml-2">•</span>
              )}
            </Link>
          ))}
        </div>

        {/* Right CTA */}
        <Link
          href="/news"
          className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#c3ff00] hover:underline uppercase shrink-0 pl-3 border-l border-pitch-800"
        >
          <span>Newsroom</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
