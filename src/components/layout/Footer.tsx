import React from "react";
import Link from "next/link";
import { PageContainer } from "./PageContainer";

export function Footer() {
  return (
    <footer className="bg-pitch-950 border-t border-pitch-800 mt-20 pt-12 pb-8 text-slate-400 text-xs">
      <PageContainer>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-pitch-850">
          {/* Brand & Editorial Charter */}
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 overflow-hidden rounded bg-black border border-pitch-800 flex items-center justify-center shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="FUTIQ FOOTBALL"
                  className="w-full h-full object-contain p-0.5"
                />
              </div>
              <span className="font-black text-slate-100 uppercase tracking-tight text-lg font-sans">
                FUTIQ<span className="text-[#c3ff00] ml-1">FOOTBALL</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Global football destination combining live match telemetry, breaking transfer intelligence, tactical reporting, and a vetted contributor network.
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              Editorial Standards • Sourced Rights • Real-Time Stats
            </p>
          </div>

          {/* Editorial News */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-xs">
              Editorial
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/news" className="hover:text-[#c3ff00] transition-colors">
                  Top Stories
                </Link>
              </li>
              <li>
                <Link href="/transfers" className="hover:text-[#c3ff00] transition-colors">
                  Transfer Center
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-[#c3ff00] transition-colors">
                  Tactical Analysis
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-[#c3ff00] transition-colors">
                  Opinion & Columns
                </Link>
              </li>
            </ul>
          </div>

          {/* Competitions */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-xs">
              Competitions
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/competitions" className="hover:text-[#c3ff00] transition-colors">
                  Premier League
                </Link>
              </li>
              <li>
                <Link href="/competitions" className="hover:text-[#c3ff00] transition-colors">
                  UEFA Champions League
                </Link>
              </li>
              <li>
                <Link href="/competitions" className="hover:text-[#c3ff00] transition-colors">
                  La Liga
                </Link>
              </li>
              <li>
                <Link href="/competitions" className="hover:text-[#c3ff00] transition-colors">
                  Serie A & Bundesliga
                </Link>
              </li>
            </ul>
          </div>

          {/* Contributor Platform & Admin */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-xs">
              Platform
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/contributor/apply" className="hover:text-[#c3ff00] transition-colors text-brand-green font-semibold">
                  Join as Contributor →
                </Link>
              </li>
              <li>
                <Link href="/matches" className="hover:text-[#c3ff00] transition-colors">
                  Match Center
                </Link>
              </li>
              <li>
                <Link href="/teams" className="hover:text-[#c3ff00] transition-colors">
                  Club Index
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal & Rights */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
          <p>© 2026 FUTIQ FOOTBALL. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Editorial Guidelines</span>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
