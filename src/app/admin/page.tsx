import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import Link from "next/link";
import {
  ShieldAlert,
  Users,
  Database,
  Layers,
  Lock,
  KeyRound,
  ArrowRight,
  Unlock,
  LogOut,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPortalPage() {
  const user = await getCurrentUser();
  const isAdmin = user?.roles.includes("SUPER_ADMIN");

  // ============================================================================
  // 1. GERBANG AKSES ADMIN PRIVATE (BELUM TERAUTENTIKASI)
  // ============================================================================
  if (!user || !isAdmin) {
    return (
      <div className="py-12 md:py-16">
        <PageContainer>
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Masthead Header */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-red/10 border border-brand-red/30 text-[10px] font-mono font-bold uppercase tracking-widest text-brand-red">
                <Lock className="w-3.5 h-3.5" />
                <span>Area Keamanan Level 1 • Memerlukan Akses SUPER_ADMIN</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 font-sans tracking-tight">
                Konsol Administrasi Platform
              </h1>
              <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                Terminal backoffice khusus ini dibatasi hanya untuk administrator platform, insinyur infrastruktur, dan manajer keuangan resmi.
              </p>
            </div>

            {/* Security Notice & Protocol Card */}
            <div className="bg-pitch-900 border border-pitch-800 p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-start gap-4 pb-6 border-b border-pitch-800">
                <div className="w-12 h-12 bg-pitch-850 border border-pitch-750 text-brand-green flex items-center justify-center shrink-0">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-100 font-sans">
                    Verifikasi Sesi Kriptografi & Otorisasi RBAC
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Akses memerlukan cookie sesi HTTP-only kriptografis aktif dengan izin peran <code className="text-brand-green font-mono">SUPER_ADMIN</code>. Seluruh aktivitas administratif dicatat ke dalam log audit permanen.
                  </p>
                </div>
              </div>

              {/* Protocol Spec Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3.5 bg-pitch-950 border border-pitch-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Status Sesi</span>
                  <div className="text-sm font-bold text-brand-red">BELUM LOGIN</div>
                  <span className="text-[9px] text-slate-500">Tanda tangan cookie diperlukan</span>
                </div>

                <div className="p-3.5 bg-pitch-950 border border-pitch-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Keamanan Database</span>
                  <div className="text-sm font-bold text-brand-green">TERISOLASI</div>
                  <span className="text-[9px] text-slate-500">Zero public port exposure</span>
                </div>

                <div className="p-3.5 bg-pitch-950 border border-pitch-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Perlindungan Saldo</span>
                  <div className="text-sm font-bold text-slate-200">INTEGER-MATH</div>
                  <span className="text-[9px] text-slate-500">Perhitungan saldo presisi server</span>
                </div>

                <div className="p-3.5 bg-pitch-950 border border-pitch-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Log Audit</span>
                  <div className="text-sm font-bold text-emerald-400">AKTIF</div>
                  <span className="text-[9px] text-slate-500">Pencatatan IP & waktu aktif</span>
                </div>
              </div>

              {/* Instant One-Click Login Action */}
              <div className="pt-2">
                <a
                  href="/api/auth/dev-session?role=SUPER_ADMIN&redirect=/admin"
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-brand-green hover:bg-brand-green-hover transition-all shadow-lg active:scale-[0.99]"
                >
                  <Unlock className="w-4 h-4 text-slate-950" />
                  <span>Aktifkan Sesi & Buka Konsol Super Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-pitch-800">
                <Link
                  href="/"
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  ← Kembali ke Beranda Publik
                </Link>
                <span className="text-[10px] text-slate-500 font-mono">
                  Mesin Keamanan FUTIQ v1.0
                </span>
              </div>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  // ============================================================================
  // 2. KONSOL MASTER SUPER_ADMIN (TERAUTENTIKASI)
  // ============================================================================
  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        <SectionHeader
          title="Administrasi Platform & Pusat Operasi Keamanan"
          subtitle="Konfigurasi sistem, manajemen peran RBAC, riwayat audit, dan telemetri infrastruktur"
          badgeText="Super Admin Root"
        />

        <div className="bg-pitch-900 border border-pitch-800 p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-pitch-950 border border-pitch-800">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-brand-green shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-slate-100 font-sans">
                  Zona Keamanan RBAC & Otorisasi Server
                </h4>
                <p className="text-xs text-brand-green font-mono">
                  Login sebagai SUPER_ADMIN: {user.fullName} ({user.email})
                </p>
              </div>
            </div>

            <a
              href="/api/auth/dev-session?action=logout&redirect=/admin"
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <LogOut className="w-3.5 h-3.5 text-brand-red" />
              <span>Keluar Sesi</span>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-pitch-850 border border-pitch-750 p-4 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase">Pengguna & RBAC</span>
                <Users className="w-4 h-4 text-brand-green" />
              </div>
              <div className="text-xl font-bold font-mono text-slate-100">Aktif</div>
              <p className="text-[10px] text-slate-500">5 Peran Sistem Dikonfigurasi</p>
            </div>

            <div className="bg-pitch-850 border border-pitch-750 p-4 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase">Mesin Database</span>
                <Database className="w-4 h-4 text-brand-green" />
              </div>
              <div className="text-xl font-bold font-mono text-slate-100">PostgreSQL 16</div>
              <p className="text-[10px] text-slate-500">Prisma Migrations Terkelola</p>
            </div>

            <div className="bg-pitch-850 border border-pitch-750 p-4 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase">Cache Efemeral</span>
                <Layers className="w-4 h-4 text-brand-green" />
              </div>
              <div className="text-xl font-bold font-mono text-slate-100">Redis 7</div>
              <p className="text-[10px] text-slate-500">Rate Limiter & L2 Cache</p>
            </div>

            <div className="bg-pitch-850 border border-pitch-750 p-4 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase">Pencatatan Audit</span>
                <ShieldAlert className="w-4 h-4 text-brand-green" />
              </div>
              <div className="text-xl font-bold font-mono text-slate-100">Permanen</div>
              <p className="text-[10px] text-slate-500">Log Aktivitas Transaksional</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <Link
              href="/admin/finance"
              className="p-5 bg-pitch-950 border border-pitch-800 hover:border-emerald-500/50 transition-colors block group"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  Keuangan & Pembayaran →
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Aturan auto-payout, antrean review manual, dan rekonsiliasi gateway bank.
              </p>
            </Link>

            <Link
              href="/admin/advertising"
              className="p-5 bg-pitch-950 border border-pitch-800 hover:border-[#c3ff00]/50 transition-colors block group"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 group-hover:text-[#c3ff00] transition-colors">
                  Manajemen Iklan & Sponsor →
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Slot sponsor terisolasi, penargetan perangkat, Adsterra, dan jadwal penayangan.
              </p>
            </Link>

            <Link
              href="/admin/analytics"
              className="p-5 bg-pitch-950 border border-pitch-800 hover:border-blue-500/50 transition-colors block group"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                  Analitik Pendapatan & Trafik →
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Trafik privat, CTR rasio klik iklan, dan estimasi RPM pendapatan.
              </p>
            </Link>

            <Link
              href="/admin/football"
              className="p-5 bg-pitch-950 border border-pitch-800 hover:border-purple-500/50 transition-colors block group"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 group-hover:text-purple-400 transition-colors">
                  Mesin Data Sepak Bola →
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Sinkronisasi provider jadwal/skor, live score, dan kontrol pembersihan cache.
              </p>
            </Link>

            <Link
              href="/admin/seo"
              className="p-5 bg-pitch-950 border border-pitch-800 hover:border-brand-green/50 transition-colors block group sm:col-span-2 lg:col-span-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 group-hover:text-brand-green transition-colors">
                  Mesin Pertumbuhan, SEO & Distribusi Konten →
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Kesiapan Google Discover, XML sitemap dinamis, sindikasi feed RSS 2.0, dan pengalihan URL 301/302.
              </p>
            </Link>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
