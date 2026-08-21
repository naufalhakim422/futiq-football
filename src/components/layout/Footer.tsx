"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PageContainer } from "./PageContainer";
import {
  Flame,
  Activity,
  Compass,
} from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  // If in Admin console, completely hide the footer for a clean dashboard view
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // Modern, Sleek, Borderless Public Footer
  return (
    <footer className="bg-pitch-950 text-slate-400 text-xs font-sans mt-20 pb-10">
      {/* Top Brand & League Shortcut Bar */}
      <div className="py-6 bg-pitch-900/40 rounded-2xl mx-4 sm:mx-8 lg:mx-auto max-w-7xl px-6 sm:px-8 mb-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-xl bg-black border border-pitch-800 flex items-center justify-center shadow-md shrink-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="FUTIQ FOOTBALL"
                className="w-full h-full object-contain p-0.5"
              />
            </div>
            <div>
              <span className="font-extrabold text-slate-100 uppercase tracking-tight text-base font-sans">
                FUTIQ<span className="text-[#c3ff00] ml-1 font-black">FOOTBALL</span>
              </span>
              <p className="text-[11px] text-slate-400 font-normal">
                Football Media, Live Matchday Center & Tactical Intelligence
              </p>
            </div>
          </div>

          {/* Quick Competitions Badges */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            {[
              { name: "Premier League", href: "/competitions" },
              { name: "Champions League", href: "/competitions" },
              { name: "La Liga", href: "/competitions" },
              { name: "Serie A", href: "/competitions" },
              { name: "World Cup Qualifiers", href: "/matches" },
            ].map((league) => (
              <Link
                key={league.name}
                href={league.href}
                className="px-3 py-1 rounded-lg bg-pitch-900/80 hover:bg-pitch-850 text-slate-300 hover:text-[#c3ff00] transition-colors text-[11px]"
              >
                {league.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main 3-Column Clean Navigation */}
      <div className="py-6">
        <PageContainer>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12">
            {/* Column 1: Editorial & News */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#c3ff00]" />
                <span>Berita & Cerita</span>
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/news" className="hover:text-[#c3ff00] transition-colors text-slate-400 hover:text-slate-200">
                    Berita Utama (Top Stories)
                  </Link>
                </li>
                <li>
                  <Link href="/transfers" className="hover:text-[#c3ff00] transition-colors text-slate-400 hover:text-slate-200">
                    Bursa Transfer Pemain
                  </Link>
                </li>
                <li>
                  <Link href="/news?category=tactics" className="hover:text-[#c3ff00] transition-colors text-slate-400 hover:text-slate-200">
                    Analisis Taktik Pertandingan
                  </Link>
                </li>
                <li>
                  <Link href="/news" className="hover:text-[#c3ff00] transition-colors text-slate-400 hover:text-slate-200">
                    Laporan Laga Resmi
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Live Match Center */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Match Center & Skor</span>
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/matches" className="hover:text-[#c3ff00] transition-colors text-slate-400 hover:text-slate-200">
                    Jadwal & Skor Live Hari Ini
                  </Link>
                </li>
                <li>
                  <Link href="/competitions" className="hover:text-[#c3ff00] transition-colors text-slate-400 hover:text-slate-200">
                    Klasemen Resmi Liga
                  </Link>
                </li>
                <li>
                  <Link href="/teams" className="hover:text-[#c3ff00] transition-colors text-slate-400 hover:text-slate-200">
                    Profil Klub & Skuad
                  </Link>
                </li>
                <li>
                  <Link href="/players" className="hover:text-[#c3ff00] transition-colors text-slate-400 hover:text-slate-200">
                    Statistik Pemain
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Platform Information */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>Informasi & Legal</span>
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/editorial-guidelines" className="hover:text-[#c3ff00] transition-colors text-slate-400 hover:text-slate-200">
                    Panduan Redaksi Editorial
                  </Link>
                </li>
                <li>
                  <span className="hover:text-[#c3ff00] transition-colors text-slate-400 hover:text-slate-200 cursor-pointer">
                    Kebijakan Privasi (Privacy Policy)
                  </span>
                </li>
                <li>
                  <span className="hover:text-[#c3ff00] transition-colors text-slate-400 hover:text-slate-200 cursor-pointer">
                    Ketentuan Layanan (Terms of Service)
                  </span>
                </li>
                <li>
                  <span className="hover:text-[#c3ff00] transition-colors text-slate-400 hover:text-slate-200 cursor-pointer">
                    Tentang FUTIQ Football
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </PageContainer>
      </div>

      {/* Bottom Copyright Bar (Seamless & Borderless) */}
      <div className="pt-8 mt-4">
        <PageContainer>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <p>© 2026 FUTIQ FOOTBALL. Media sepak bola & pusat data pertandingan.</p>
            <div className="flex items-center gap-4 text-slate-400 text-[11px]">
              <span>Liputan Resmi & Independen</span>
              <span>•</span>
              <span className="text-[#c3ff00]/80 font-mono">FUTIQ Intelligence</span>
            </div>
          </div>
        </PageContainer>
      </div>
    </footer>
  );
}
