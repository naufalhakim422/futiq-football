import React from "react";
import Link from "next/link";
import { LiveTicker } from "@/components/football/LiveTicker";
import { Navigation } from "./Navigation";
import { MobileNav } from "./MobileNav";
import { Search, Globe, Shield } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-pitch-900 border-b border-pitch-800 shadow-md">
      {/* Live Matchday Broadcast Ticker */}
      <LiveTicker />

      {/* Primary Editorial Masthead */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Brand Masthead */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-brand-green flex items-center justify-center font-mono font-black text-slate-950 text-sm tracking-tighter">
              FP
            </div>
            <div>
              <span className="font-extrabold tracking-tighter text-lg sm:text-xl text-slate-100 uppercase font-sans">
                FOOTBALL<span className="text-brand-green">MEDIA</span>
              </span>
              <span className="hidden sm:block text-[9px] uppercase tracking-widest text-slate-400 font-mono -mt-1">
                Global Sports Intelligence
              </span>
            </div>
          </Link>
        </div>

        {/* Right Action Icons & Workspace Portals */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 border-r border-pitch-800 pr-3 mr-1">
            <Link
              href="/contributor"
              className="hover:text-brand-green transition-colors px-2 py-1 flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Contributor</span>
            </Link>
            <Link
              href="/admin"
              className="hover:text-slate-200 transition-colors px-2 py-1 flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span>Desk</span>
            </Link>
          </div>

          <button
            aria-label="Search football content"
            className="p-2 text-slate-400 hover:text-white bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 rounded transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>

          <MobileNav />
        </div>
      </div>

      {/* Main Desktop Navigation */}
      <Navigation />
    </header>
  );
}
