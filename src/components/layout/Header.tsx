import React from "react";
import Link from "next/link";
import { LiveTicker } from "@/components/football/LiveTicker";
import { Navigation } from "./Navigation";
import { MobileNav } from "./MobileNav";
import { Search, Globe } from "lucide-react";
import { footballService } from "@/lib/football/football.service";

export async function Header() {
  const liveMatches = await footballService.getLiveMatches();
  const tickerMatches =
    liveMatches && liveMatches.length > 0
      ? liveMatches
      : await footballService.getFixtures({ limit: 6 });

  return (
    <header className="sticky top-0 z-40 w-full bg-pitch-900 border-b border-pitch-800 shadow-md">
      {/* Live Matchday Broadcast Ticker */}
      <LiveTicker matches={tickerMatches as any} />

      {/* Primary Editorial Masthead */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Brand Masthead */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 overflow-hidden rounded-lg bg-black border border-pitch-800 flex items-center justify-center shadow-md shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="FUTIQ FOOTBALL"
                className="w-full h-full object-contain p-0.5 group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <div>
              <span className="font-black tracking-tight text-xl sm:text-2xl text-slate-100 uppercase font-sans flex items-center leading-none">
                FUTIQ<span className="text-[#c3ff00] ml-1.5 font-extrabold">FOOTBALL</span>
              </span>
              <span className="hidden sm:block text-[9px] uppercase tracking-widest text-slate-400 font-mono mt-0.5">
                Global Sports Intelligence
              </span>
            </div>
          </Link>
        </div>

        {/* Right Action Icons & Contributor Application CTA */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Link
              href="/contributor/apply"
              className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#c3ff00] bg-pitch-850 hover:bg-pitch-800 border border-[#c3ff00]/30 hover:border-[#c3ff00] flex items-center gap-1.5 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Write for Us</span>
            </Link>
          </div>

          <Link
            href="/search"
            aria-label="Search football content"
            className="p-2 text-slate-400 hover:text-white bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 rounded transition-colors"
          >
            <Search className="w-4 h-4" />
          </Link>

          <MobileNav />
        </div>
      </div>

      {/* Global Navigation Bar */}
      <Navigation />
    </header>
  );
}
