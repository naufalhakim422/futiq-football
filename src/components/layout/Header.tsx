import React from "react";
import Link from "next/link";
import { LiveTicker } from "@/components/football/LiveTicker";
import { Navigation } from "./Navigation";
import { MobileNav } from "./MobileNav";
import { UserNav } from "./UserNav";
import { Search, Globe, PenTool } from "lucide-react";
import { footballService } from "@/lib/football/football.service";
import { getCurrentUser } from "@/lib/auth/session";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export async function Header() {
  const [liveMatches, user] = await Promise.all([
    footballService.getLiveMatches(),
    getCurrentUser(),
  ]);

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
              <span className="hidden sm:block text-[10px] tracking-wide text-slate-400 font-sans mt-0.5">
                Football Media & Match Center
              </span>
            </div>
          </Link>
        </div>

        {/* Right Action Icons, Theme Toggle & User Session */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Light / Dark Mode Switcher */}
          <ThemeToggle />

          <Link
            href="/search"
            aria-label="Search football content"
            className="p-2 text-slate-400 hover:text-white bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 hover:border-[#c3ff00]/40 rounded-lg transition-all"
          >
            <Search className="w-4 h-4" />
          </Link>

          {/* User Session Nav Button & Dropdown */}
          <UserNav user={user} />

          <MobileNav />
        </div>
      </div>

      {/* Global Navigation Bar */}
      <Navigation />
    </header>
  );
}
