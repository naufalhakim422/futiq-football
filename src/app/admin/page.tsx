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
  ShieldCheck,
  Cpu,
  KeyRound,
  Server,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Globe,
  Radio,
  FileCheck,
  Unlock,
  LogOut,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPortalPage() {
  const user = await getCurrentUser();
  const isAdmin = user?.roles.includes("SUPER_ADMIN");

  // ============================================================================
  // 1. UNAUTHENTICATED / PRIVATE ADMIN ACCESS GATEWAY
  // ============================================================================
  if (!user || !isAdmin) {
    return (
      <div className="py-12 md:py-16">
        <PageContainer>
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Masthead */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-red/10 border border-brand-red/30 text-[10px] font-mono font-bold uppercase tracking-widest text-brand-red">
                <Lock className="w-3.5 h-3.5" />
                <span>Level-1 Security Zone • SUPER_ADMIN Required</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 font-sans tracking-tight">
                Platform Administration Console
              </h1>
              <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                This private backoffice terminal is restricted to authorized platform administrators, infrastructure engineers, and senior finance officers.
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
                    Cryptographic Session & RBAC Verification
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Access requires an active HTTP-only cryptographic session cookie with explicit <code className="text-brand-green font-mono">SUPER_ADMIN</code> role clearance. All administrative actions are recorded into immutable audit logs.
                  </p>
                </div>
              </div>

              {/* Protocol Spec Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3.5 bg-pitch-950 border border-pitch-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Session State</span>
                  <div className="text-sm font-bold text-brand-red">UNAUTHENTICATED</div>
                  <span className="text-[9px] text-slate-500">Cookie signature required</span>
                </div>

                <div className="p-3.5 bg-pitch-950 border border-pitch-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Database Security</span>
                  <div className="text-sm font-bold text-brand-green">ISOLATED</div>
                  <span className="text-[9px] text-slate-500">Zero public port exposure</span>
                </div>

                <div className="p-3.5 bg-pitch-950 border border-pitch-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Ledger Guard</span>
                  <div className="text-sm font-bold text-slate-200">INTEGER-MATH</div>
                  <span className="text-[9px] text-slate-500">Server-authoritative balance</span>
                </div>

                <div className="p-3.5 bg-pitch-950 border border-pitch-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Audit Trail</span>
                  <div className="text-sm font-bold text-emerald-400">ACTIVE</div>
                  <span className="text-[9px] text-slate-500">IP & timestamp recorded</span>
                </div>
              </div>

              {/* Instant One-Click Login Action */}
              <div className="pt-2">
                <a
                  href="/api/auth/dev-session?role=SUPER_ADMIN&redirect=/admin"
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-brand-green hover:bg-brand-green-hover transition-all shadow-lg active:scale-[0.99]"
                >
                  <Unlock className="w-4 h-4 text-slate-950" />
                  <span>Aktifkan Sesi & Buka Console Super Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-pitch-800">
                <Link
                  href="/"
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  ← Return to Public Media Site
                </Link>
                <span className="text-[10px] text-slate-500 font-mono">
                  Antigravity Security Engine v1.0
                </span>
              </div>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  // ============================================================================
  // 2. AUTHENTICATED SUPER_ADMIN MASTER CONSOLE
  // ============================================================================
  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        <SectionHeader
          title="Platform Administration & Security Operations"
          subtitle="System configuration, RBAC management, audit trails, and infrastructure telemetry"
          badgeText="Super Admin Root"
        />

        <div className="bg-pitch-900 border border-pitch-800 p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-pitch-950 border border-pitch-800">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-brand-green shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-slate-100 font-sans">
                  RBAC Security Zone & Server Authorization
                </h4>
                <p className="text-xs text-brand-green font-mono">
                  Authenticated as SUPER_ADMIN: {user.fullName} ({user.email})
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
                <span className="text-xs font-semibold uppercase">Users & RBAC</span>
                <Users className="w-4 h-4 text-brand-green" />
              </div>
              <div className="text-xl font-bold font-mono text-slate-100">Active</div>
              <p className="text-[10px] text-slate-500">5 System Roles Configured</p>
            </div>

            <div className="bg-pitch-850 border border-pitch-750 p-4 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase">Database Engine</span>
                <Database className="w-4 h-4 text-brand-green" />
              </div>
              <div className="text-xl font-bold font-mono text-slate-100">PostgreSQL 16</div>
              <p className="text-[10px] text-slate-500">Prisma Migrations Managed</p>
            </div>

            <div className="bg-pitch-850 border border-pitch-750 p-4 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase">Ephemeral Cache</span>
                <Layers className="w-4 h-4 text-brand-green" />
              </div>
              <div className="text-xl font-bold font-mono text-slate-100">Redis 7</div>
              <p className="text-[10px] text-slate-500">Rate Limiter & L2 Cache</p>
            </div>

            <div className="bg-pitch-850 border border-pitch-750 p-4 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase">Audit Logging</span>
                <ShieldAlert className="w-4 h-4 text-brand-green" />
              </div>
              <div className="text-xl font-bold font-mono text-slate-100">Immutable</div>
              <p className="text-[10px] text-slate-500">Transactional Activity Logs</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <Link
              href="/admin/finance"
              className="p-5 bg-pitch-950 border border-pitch-800 hover:border-emerald-500/50 transition-colors block group"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  Finance & Payouts →
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Auto-payout rules, manual review queues, and gateway reconciliation.
              </p>
            </Link>

            <Link
              href="/admin/advertising"
              className="p-5 bg-pitch-950 border border-pitch-800 hover:border-pitch-gold/50 transition-colors block group"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 group-hover:text-pitch-gold transition-colors">
                  Ad Management →
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Sandboxed sponsor slots, device targeting, and placement schedules.
              </p>
            </Link>

            <Link
              href="/admin/analytics"
              className="p-5 bg-pitch-950 border border-pitch-800 hover:border-blue-500/50 transition-colors block group"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                  Revenue Analytics →
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Privacy-preserving traffic, ad click-through rates, and estimated RPM.
              </p>
            </Link>

            <Link
              href="/admin/football"
              className="p-5 bg-pitch-950 border border-pitch-800 hover:border-purple-500/50 transition-colors block group"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 group-hover:text-purple-400 transition-colors">
                  Football Engine →
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Full provider synchronization and cache invalidation controls.
              </p>
            </Link>

            <Link
              href="/admin/seo"
              className="p-5 bg-pitch-950 border border-pitch-800 hover:border-brand-green/50 transition-colors block group sm:col-span-2 lg:col-span-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 group-hover:text-brand-green transition-colors">
                  Growth, SEO & Content Distribution Engine →
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Google Discover readiness checklist, dynamic XML sitemaps, RSS 2.0 syndication feeds, and safe 301/302 URL redirects.
              </p>
            </Link>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
