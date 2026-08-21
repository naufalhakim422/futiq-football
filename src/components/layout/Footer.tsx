"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PageContainer } from "./PageContainer";
import {
  Trophy,
  Flame,
  Activity,
  ArrowUpRight,
  Shield,
  FileText,
  Compass,
} from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  // If in Admin console, render a sleek, minimal admin footer instead of the consumer footer
  if (pathname?.startsWith("/admin")) {
    return (
      <footer className="border-t border-pitch-850/80 bg-pitch-950/60 py-4 mt-16 text-slate-400 text-xs font-sans">
        <PageContainer>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[11px] font-mono">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c3ff00]" />
              <span className="text-slate-300 font-semibold">FUTIQ Admin Console</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-400">Editorial & Football Data Engine</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <Link href="/" className="hover:text-[#c3ff00] transition-colors">
                ← Buka Beranda Publik
              </Link>
              <span>•</span>
              <Link href="/admin/articles/new" className="hover:text-[#c3ff00] transition-colors">
                Tulis Berita
              </Link>
              <span>•</span>
              <Link href="/admin/advertising" className="hover:text-[#c3ff00] transition-colors">
                Iklan & Sponsor
              </Link>
            </div>
          </div>
        </PageContainer>
      </footer>
    );
  }

  // Modern, Sleek Editorial Media Footer for Public Pages
  return (
    <footer className="border-t border-pitch-800/80 bg-pitch-950 text-slate-400 text-xs font-sans mt-24">
      {/* Top Brand & League Shortcut Bar */}
      <div className="border-b border-pitch-850/60 py-6 bg-pitch-900/30">
        <PageContainer>
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
              <span className="text-slate-400 text-[10px] font-mono uppercase tracking-wider mr-1">
                Leagues:
              </span>
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
                  className="px-2.5 py-1 rounded-lg bg-pitch-900 hover:bg-pitch-850 border border-pitch-800 hover:border-[#c3ff00]/40 text-slate-300 hover:text-[#c3ff00] transition-all"
                >
                  {league.name}
                </Link>
              ))}
            </div>
          </div>
        </PageContainer>
      </div>

      {/* Main Grid Columns */}
      <div className="py-12">
        <PageContainer>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            {/* Column 1: Editorial & News */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#c3ff00]" />
                <span>Berita & Cerita</span>
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/news" className="hover:text-[#c3ff00] transition-colors text-slate-300">
                    Berita Utama (Top Stories)
                  </Link>
                </li>
                <li>
                  <Link href="/transfers" className="hover:text-[#c3ff00] transition-colors text-slate-300">
                    Bursa Transfer Pemain
                  </Link>
                </li>
                <li>
                  <Link href="/news?category=tactics" className="hover:text-[#c3ff00] transition-colors text-slate-300">
                    Analisis Taktik Pertandingan
                  </Link>
                </li>
                <li>
                  <Link href="/news" className="hover:text-[#c3ff00] transition-colors text-slate-300">
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
                  <Link href="/matches" className="hover:text-[#c3ff00] transition-colors text-slate-300">
                    Jadwal & Skor Live Hari Ini
                  </Link>
                </li>
                <li>
                  <Link href="/competitions" className="hover:text-[#c3ff00] transition-colors text-slate-300">
                    Klasemen Resmi Liga
                  </Link>
                </li>
                <li>
                  <Link href="/teams" className="hover:text-[#c3ff00] transition-colors text-slate-300">
                    Profil Klub & Skuad
                  </Link>
                </li>
                <li>
                  <Link href="/players" className="hover:text-[#c3ff00] transition-colors text-slate-300">
                    Statistik Pemain
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Platform Information */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>Informasi & Kebijakan</span>
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/editorial-guidelines" className="hover:text-[#c3ff00] transition-colors text-slate-300">
                    Panduan Redaksi Editorial
                  </Link>
                </li>
                <li>
                  <span className="hover:text-[#c3ff00] transition-colors text-slate-300 cursor-pointer">
                    Kebijakan Privasi (Privacy Policy)
                  </span>
                </li>
                <li>
                  <span className="hover:text-[#c3ff00] transition-colors text-slate-300 cursor-pointer">
                    Ketentuan Layanan (Terms of Service)
                  </span>
                </li>
                <li>
                  <span className="hover:text-[#c3ff00] transition-colors text-slate-300 cursor-pointer">
                    Tentang FUTIQ Football
                  </span>
                </li>
              </ul>
            </div>

            {/* Column 4: Redaksi & Akses Admin */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Portal Redaksi</span>
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Pusat manajemen naskah, rilis berita cepat, data pertandingan langsung, dan sponsor.
              </p>
              <div className="pt-1 flex flex-col gap-2">
                <Link
                  href="/admin"
                  className="inline-flex items-center justify-between px-3 py-2 rounded-xl bg-pitch-900 hover:bg-pitch-850 border border-pitch-800 hover:border-[#c3ff00]/40 text-slate-200 hover:text-white transition-all text-xs font-semibold group shadow-sm"
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-[#c3ff00]" />
                    <span>Admin Console</span>
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#c3ff00] transition-colors" />
                </Link>
              </div>
            </div>
          </div>
        </PageContainer>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-pitch-850/80 py-5 bg-pitch-950">
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
