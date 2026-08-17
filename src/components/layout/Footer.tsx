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
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-brand-green flex items-center justify-center font-mono font-black text-slate-950 text-xs">
                FP
              </div>
              <span className="font-extrabold text-slate-100 uppercase tracking-tight text-base font-sans">
                FOOTBALL<span className="text-brand-green">MEDIA</span>
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
                <Link href="/news" className="hover:text-brand-green transition-colors">
                  Top Stories
                </Link>
              </li>
              <li>
                <Link href="/transfers" className="hover:text-brand-green transition-colors">
                  Transfer Center
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-brand-green transition-colors">
                  Tactical Analysis
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-brand-green transition-colors">
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
                <Link href="/competitions" className="hover:text-brand-green transition-colors">
                  Premier League
                </Link>
              </li>
              <li>
                <Link href="/competitions" className="hover:text-brand-green transition-colors">
                  UEFA Champions League
                </Link>
              </li>
              <li>
                <Link href="/competitions" className="hover:text-brand-green transition-colors">
                  La Liga
                </Link>
              </li>
              <li>
                <Link href="/competitions" className="hover:text-brand-green transition-colors">
                  Serie A
                </Link>
              </li>
            </ul>
          </div>

          {/* Workspaces & Platform */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-xs">
              Platform
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/contributor" className="hover:text-brand-green transition-colors">
                  Contributor Program
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-brand-green transition-colors">
                  Editorial Desk
                </Link>
              </li>
              <li>
                <Link href="/matches" className="hover:text-brand-green transition-colors">
                  Match Center
                </Link>
              </li>
              <li>
                <Link href="/teams" className="hover:text-brand-green transition-colors">
                  Club Index
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal & Rights */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
          <p>© 2026 Football Media Platform. All rights reserved.</p>
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
