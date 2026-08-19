import React from "react";
import Link from "next/link";
import { PageContainer } from "./PageContainer";
import { LogIn, ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-pitch-950 border-t border-pitch-800 text-slate-400 text-xs font-sans mt-20 pt-12 pb-8">
      <PageContainer>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-pitch-850">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 overflow-hidden rounded-lg bg-black border border-pitch-800 flex items-center justify-center shrink-0">
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

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm font-normal">
              Global sports media and football intelligence. Live match tracking, tactical analysis, transfer insights, and open platform for football writers.
            </p>

            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Telemetry & Match Data Online</span>
            </div>
          </div>

          {/* Coverage */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] font-mono">
              Coverage
            </h4>
            <ul className="space-y-2 text-xs">
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
                <Link href="/news?category=tactics" className="hover:text-[#c3ff00] transition-colors">
                  Tactical Analysis
                </Link>
              </li>
              <li>
                <Link href="/matches" className="hover:text-[#c3ff00] transition-colors">
                  Scores & Fixtures
                </Link>
              </li>
            </ul>
          </div>

          {/* Competitions */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] font-mono">
              Competitions
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/competitions" className="hover:text-[#c3ff00] transition-colors">
                  Champions League
                </Link>
              </li>
              <li>
                <Link href="/competitions" className="hover:text-[#c3ff00] transition-colors">
                  Premier League
                </Link>
              </li>
              <li>
                <Link href="/competitions" className="hover:text-[#c3ff00] transition-colors">
                  La Liga
                </Link>
              </li>
              <li>
                <Link href="/competitions" className="hover:text-[#c3ff00] transition-colors">
                  Serie A
                </Link>
              </li>
            </ul>
          </div>

          {/* Contributors & Account */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] font-mono">
              Writers & Portal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/contributor/apply"
                  className="hover:text-[#c3ff00] transition-colors text-slate-300 font-semibold"
                >
                  Become a Contributor
                </Link>
              </li>
              <li>
                <Link
                  href="/contributor"
                  className="hover:text-[#c3ff00] transition-colors"
                >
                  Contributor Desk
                </Link>
              </li>
              <li className="pt-1">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pitch-900 hover:bg-pitch-850 border border-pitch-750 hover:border-[#c3ff00] text-slate-200 hover:text-[#c3ff00] text-xs font-bold font-mono transition-all shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#c3ff00]" />
                  <span>Sign In</span>
                  <ArrowRight className="w-3 h-3 ml-0.5" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Rights */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 font-mono">
          <p>© 2026 FUTIQ FOOTBALL. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/editorial-guidelines" className="hover:text-[#c3ff00] transition-colors">
              Editorial Guidelines
            </Link>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
