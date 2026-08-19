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
  PenTool,
  TrendingUp,
  Activity,
  DollarSign,
  Globe,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPortalPage() {
  const user = await getCurrentUser();
  const isAdmin = user?.roles.includes("SUPER_ADMIN");

  // ============================================================================
  // 1. PRIVATE ADMIN ACCESS GATEWAY (UNAUTHENTICATED)
  // ============================================================================
  if (!user || !isAdmin) {
    return (
      <div className="py-12 md:py-16">
        <PageContainer>
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Masthead Header */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 text-[10px] font-mono font-bold uppercase tracking-widest text-red-500 rounded-full">
                <Lock className="w-3.5 h-3.5" />
                <span>Security Zone Level 1 • SUPER_ADMIN Credentials Required</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 font-sans tracking-tight">
                Platform Administration Console
              </h1>
              <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                This private backoffice terminal is restricted exclusively to platform administrators, infrastructure engineers, and authorized finance managers.
              </p>
            </div>

            {/* Security Notice & Protocol Card */}
            <div className="bg-pitch-900 border border-pitch-800 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6">
              <div className="flex items-start gap-4 pb-6 border-b border-pitch-800">
                <div className="w-12 h-12 bg-pitch-850 border border-pitch-750 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-100 font-sans">
                    Cryptographic Session & RBAC Authorization
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Access requires an active cryptographic HTTP-only session cookie with <code className="text-emerald-500 font-mono font-bold">SUPER_ADMIN</code> role permissions. All administrative activities are immutably logged.
                  </p>
                </div>
              </div>

              {/* Protocol Spec Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3.5 bg-pitch-950 border border-pitch-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Session State</span>
                  <div className="text-sm font-bold text-red-500">UNAUTHENTICATED</div>
                  <span className="text-[10px] text-slate-400">Cryptographic signature required</span>
                </div>

                <div className="p-3.5 bg-pitch-950 border border-pitch-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Database Perimeter</span>
                  <div className="text-sm font-bold text-emerald-500">ISOLATED</div>
                  <span className="text-[10px] text-slate-400">Zero public port exposure</span>
                </div>

                <div className="p-3.5 bg-pitch-950 border border-pitch-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Ledger Integrity</span>
                  <div className="text-sm font-bold text-slate-200">INTEGER-MATH</div>
                  <span className="text-[10px] text-slate-400">Server-authoritative precision</span>
                </div>

                <div className="p-3.5 bg-pitch-950 border border-pitch-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Audit Telemetry</span>
                  <div className="text-sm font-bold text-emerald-500">ACTIVE</div>
                  <span className="text-[10px] text-slate-400">Immutable timestamping & IP logs</span>
                </div>
              </div>

              {/* Login Actions */}
              <div className="pt-2 space-y-2.5 font-sans">
                <Link
                  href="/login?redirect=/admin"
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-[#c3ff00] hover:bg-[#b0e600] rounded-xl transition-all shadow-lg active:scale-[0.99]"
                >
                  <KeyRound className="w-4 h-4 text-slate-950" />
                  <span>Open Official Sign In Page</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </Link>

                <a
                  href="/api/auth/dev-session?role=SUPER_ADMIN&redirect=/admin"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-300 hover:text-white bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 rounded-xl transition-colors font-mono"
                >
                  <Unlock className="w-3.5 h-3.5 text-slate-400" />
                  <span>1-Click Fast Dev Admin Access (SUPER_ADMIN)</span>
                </a>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-pitch-800">
                <Link
                  href="/"
                  className="text-xs text-slate-400 hover:text-[#c3ff00] transition-colors"
                >
                  ← Back to Public Homepage
                </Link>
                <span className="text-[10px] text-slate-400 font-mono">
                  FUTIQ Security Engine v2.0
                </span>
              </div>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  // ============================================================================
  // 2. SUPER_ADMIN MASTER CONSOLE (AUTHENTICATED)
  // ============================================================================
  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        <SectionHeader
          title="Platform Administration & Operations Security Center"
          subtitle="System configuration, RBAC permissions, financial reconciliation, and infrastructure telemetry"
          badgeText="Super Admin Root"
        />

        <div className="bg-pitch-900 border border-pitch-800 p-6 space-y-6 rounded-2xl shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-pitch-950 border border-pitch-800 rounded-xl">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-slate-100 font-sans">
                  RBAC Security Perimeter & Authorization Status
                </h4>
                <p className="text-xs text-emerald-500 font-mono">
                  Authenticated as SUPER_ADMIN: {user.fullName} ({user.email})
                </p>
              </div>
            </div>

            <a
              href="/api/auth/dev-session?action=logout&redirect=/admin"
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 rounded-lg flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <LogOut className="w-3.5 h-3.5 text-red-500" />
              <span>Sign Out</span>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-pitch-950 border border-pitch-800 p-4 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase">Users & RBAC</span>
                <Users className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl font-bold font-mono text-slate-100">ACTIVE</div>
              <p className="text-[10px] text-slate-400">5 System Roles Configured</p>
            </div>

            <div className="bg-pitch-950 border border-pitch-800 p-4 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase">Database Engine</span>
                <Database className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl font-bold font-mono text-slate-100">PostgreSQL 16</div>
              <p className="text-[10px] text-slate-400">Prisma Migrations Managed</p>
            </div>

            <div className="bg-pitch-950 border border-pitch-800 p-4 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase">Ephemeral Cache</span>
                <Layers className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl font-bold font-mono text-slate-100">Redis 7</div>
              <p className="text-[10px] text-slate-400">Rate Limiter & L2 Cache</p>
            </div>

            <div className="bg-pitch-950 border border-pitch-800 p-4 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase">Audit Logging</span>
                <ShieldAlert className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl font-bold font-mono text-slate-100">IMMUTABLE</div>
              <p className="text-[10px] text-slate-400">Transactional Activity Logs</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <Link
              href="/admin/articles/new"
              className="p-5 bg-pitch-950 border border-[#c3ff00]/50 hover:border-[#c3ff00] rounded-xl transition-all block group"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#c3ff00] group-hover:text-emerald-500 transition-colors">
                  ✍️ Newsroom Publishing Studio →
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Draft official editorial manuscripts, instant publication to homepage feeds, and configure Breaking/Featured news.
              </p>
            </Link>

            <Link
              href="/admin/contributors"
              className="p-5 bg-pitch-950 border border-pitch-800 hover:border-red-500/50 rounded-xl transition-colors block group"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 group-hover:text-red-400 transition-colors">
                  Contributor Management & Review →
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                1-click Suspend, Ban, compliance audits, AI integrity scores, and wallet holds.
              </p>
            </Link>

            <Link
              href="/admin/finance"
              className="p-5 bg-pitch-950 border border-pitch-800 hover:border-emerald-500/50 rounded-xl transition-colors block group"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  Finance & Payouts Console →
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Auto-payout rules, manual review queues, and bank gateway reconciliation.
              </p>
            </Link>

            <Link
              href="/admin/advertising"
              className="p-5 bg-pitch-950 border border-pitch-800 hover:border-[#c3ff00]/50 rounded-xl transition-colors block group"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 group-hover:text-[#c3ff00] transition-colors">
                  Advertising & Sponsorship Engine →
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Sponsor placements, geo-targeting, Adsterra integrations, and flight scheduling.
              </p>
            </Link>

            <Link
              href="/admin/analytics"
              className="p-5 bg-pitch-950 border border-pitch-800 hover:border-blue-500/50 rounded-xl transition-colors block group"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                  Traffic & Revenue Telemetry →
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Private traffic analytics, ad CTR performance metrics, and estimated RPM models.
              </p>
            </Link>

            <Link
              href="/admin/football"
              className="p-5 bg-pitch-950 border border-pitch-800 hover:border-purple-500/50 rounded-xl transition-colors block group"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 group-hover:text-purple-400 transition-colors">
                  Football Data Engine →
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Provider synchronization, live match fixtures, Opta telemetry, and Redis cache controls.
              </p>
            </Link>

            <Link
              href="/admin/seo"
              className="p-5 bg-pitch-950 border border-pitch-800 hover:border-emerald-500/50 rounded-xl transition-colors block group sm:col-span-2 lg:col-span-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  Growth, SEO & Content Distribution Engine →
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Google Discover readiness, dynamic XML sitemaps, RSS 2.0 feeds, and 301/302 URL redirects.
              </p>
            </Link>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
