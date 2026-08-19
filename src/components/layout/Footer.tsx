import React from "react";
import Link from "next/link";
import { PageContainer } from "./PageContainer";
import {
  PenTool,
  ArrowUpRight,
  Shield,
  Coins,
  FileText,
  Activity,
  Trophy,
  Globe,
  Radio,
  Sparkles,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-pitch-950 border-t border-pitch-800 text-slate-400 text-xs font-sans mt-24">
      {/* Top Strip: Creator & Contributor Gateway */}
      <div className="bg-gradient-to-r from-pitch-950 via-pitch-900 to-pitch-950 border-b border-pitch-800/80 py-8">
        <PageContainer>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center justify-between">
            <div className="md:col-span-8 space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-pitch-950 border border-pitch-750 text-[#c3ff00] text-[10px] font-mono font-bold uppercase tracking-widest rounded-full">
                <PenTool className="w-3 h-3 text-[#c3ff00]" />
                <span>Meja Penulis Kontributor</span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-100 tracking-tight font-sans">
                Punya Analisis atau Berita Sepak Bola? Terbitkan di FUTIQ
              </h3>
              <p className="text-xs text-slate-400 max-w-xl font-normal leading-relaxed">
                Salurkan wawasan taktik dan laporan pertandingan Anda. Raih royalti transparan dengan penarikan instan ke rekening bank mulai dari RM 85,00.
              </p>
            </div>

            <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col lg:flex-row items-center md:items-end justify-center md:justify-end gap-2.5">
              <Link
                href="/contributor/apply"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold text-slate-950 bg-[#c3ff00] hover:bg-[#b0e600] rounded-xl transition-all shadow-[0_0_15px_rgba(195,255,0,0.2)] active:scale-[0.98]"
              >
                <span>Daftar Kontributor</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              
              <Link
                href="/contributor"
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-pitch-900 hover:bg-pitch-850 border border-pitch-750 rounded-xl transition-colors"
              >
                <span>Masuk Meja Kerja</span>
              </Link>
            </div>
          </div>
        </PageContainer>
      </div>

      {/* Main Multi-Column Directory */}
      <div className="py-14">
        <PageContainer>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-pitch-850">
            {/* Brand & Editorial Mission */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 overflow-hidden rounded-lg bg-black border border-pitch-800 flex items-center justify-center shrink-0 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo.png"
                    alt="FUTIQ FOOTBALL"
                    className="w-full h-full object-contain p-0.5"
                  />
                </div>
                <div>
                  <span className="font-black text-slate-100 uppercase tracking-tight text-lg font-sans flex items-center leading-none">
                    FUTIQ<span className="text-[#c3ff00] ml-1 font-extrabold">FOOTBALL</span>
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-slate-400 font-mono">
                    Global Sports Intelligence
                  </span>
                </div>
              </div>

              <p className="text-slate-400 text-xs leading-relaxed max-w-sm font-sans font-normal">
                Platform intelijen dan jurnalisme sepak bola global terdepan. Menggabungkan telemetri pertandingan real-time, dekonstruksi taktis mendalam, dan jaringan jurnalis kontributor independen.
              </p>

              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 pt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Sistem Redaksi & Live Telemetry Online</span>
              </div>
            </div>

            {/* Editorial Desks */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-200 uppercase tracking-wider text-xs font-mono">
                Liputan & Berita
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/news" className="hover:text-[#c3ff00] transition-colors">
                    Berita Terkini
                  </Link>
                </li>
                <li>
                  <Link href="/transfers" className="hover:text-[#c3ff00] transition-colors">
                    Transfer Center
                  </Link>
                </li>
                <li>
                  <Link href="/news?category=tactics" className="hover:text-[#c3ff00] transition-colors">
                    Analisis Taktik
                  </Link>
                </li>
                <li>
                  <Link href="/news?category=deep-dive" className="hover:text-[#c3ff00] transition-colors">
                    Investigasi & Finansial
                  </Link>
                </li>
                <li>
                  <Link href="/matches" className="hover:text-[#c3ff00] transition-colors">
                    Pusat Skor & Jadwal
                  </Link>
                </li>
              </ul>
            </div>

            {/* Competitions */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-200 uppercase tracking-wider text-xs font-mono">
                Kompetisi
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/competitions" className="hover:text-[#c3ff00] transition-colors">
                    UEFA Champions League
                  </Link>
                </li>
                <li>
                  <Link href="/competitions" className="hover:text-[#c3ff00] transition-colors">
                    Premier League
                  </Link>
                </li>
                <li>
                  <Link href="/competitions" className="hover:text-[#c3ff00] transition-colors">
                    La Liga Spanyol
                  </Link>
                </li>
                <li>
                  <Link href="/competitions" className="hover:text-[#c3ff00] transition-colors">
                    Serie A Italia
                  </Link>
                </li>
                <li>
                  <Link href="/competitions" className="hover:text-[#c3ff00] transition-colors">
                    Bundesliga & Ligue 1
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contributor Ecosystem & Portal */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-200 uppercase tracking-wider text-xs font-mono">
                Portal Penulis
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/contributor/apply" className="hover:text-[#c3ff00] text-[#c3ff00] font-semibold transition-colors flex items-center gap-1">
                    <span>Daftar Kontributor</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </li>
                <li>
                  <Link href="/contributor" className="hover:text-[#c3ff00] transition-colors">
                    Meja Kerja & Draf Naskah
                  </Link>
                </li>
                <li>
                  <Link href="/contributor/articles/new" className="hover:text-[#c3ff00] transition-colors">
                    Studio Tulis Naskah
                  </Link>
                </li>
                <li>
                  <Link href="/contributor/earnings" className="hover:text-[#c3ff00] transition-colors">
                    Dompet & Penarikan (RM 85+)
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-slate-200 transition-colors">
                    Gerbang Masuk Akun
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Compliance */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
            <p>© 2026 FUTIQ FOOTBALL. Seluruh hak cipta dilindungi undang-undang.</p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
              <Link href="/news" className="hover:text-[#c3ff00] transition-colors">
                Pedoman Editorial
              </Link>
              <span>•</span>
              <span className="hover:text-slate-200 cursor-pointer">
                Kebijakan Privasi
              </span>
              <span>•</span>
              <span className="hover:text-slate-200 cursor-pointer">
                Syarat & Ketentuan
              </span>
              <span>•</span>
              <span className="text-[#c3ff00] font-bold">
                MYR / Multi-Currency
              </span>
            </div>
          </div>
        </PageContainer>
      </div>
    </footer>
  );
}
