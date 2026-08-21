import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { PageContainer } from "@/components/layout/PageContainer";
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
  Radio,
  Newspaper,
  CheckCircle2,
  Sparkles,
  Zap,
  BarChart3,
  SlidersHorizontal,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPortalPage() {
  const user = await getCurrentUser();
  const isAdmin = user?.roles.includes("SUPER_ADMIN");

  // ============================================================================
  // 1. UNAUTHENTICATED STATE (Clean, Minimal, Trustworthy)
  // ============================================================================
  if (!user || !isAdmin) {
    return (
      <div className="py-16 md:py-24">
        <PageContainer>
          <div className="max-w-xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-400 rounded-full">
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Authentication Required</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 font-sans tracking-tight">
                FUTIQ Admin Console
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                Please sign in with an authorized Super Admin account to access editorial tools, finance, and system settings.
              </p>
            </div>

            <div className="bg-pitch-900/80 border border-pitch-800 p-6 sm:p-8 rounded-2xl shadow-xl backdrop-blur-sm space-y-5">
              <div className="space-y-3">
                <Link
                  href="/login?redirect=/admin"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-slate-950 bg-[#c3ff00] hover:bg-[#b0e600] rounded-xl transition-all shadow-md active:scale-[0.99]"
                >
                  <KeyRound className="w-4 h-4 text-slate-950" />
                  <span>Sign In to Admin Console</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </Link>

                <a
                  href="/api/auth/dev-session?role=SUPER_ADMIN&redirect=/admin"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 rounded-xl transition-colors font-mono"
                >
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>1-Click Dev Session (Super Admin)</span>
                </a>
              </div>

              <div className="pt-4 border-t border-pitch-800 flex items-center justify-between text-xs text-slate-500">
                <Link href="/" className="hover:text-slate-300 transition-colors">
                  ← Back to Home
                </Link>
                <span>FUTIQ Platform v2.0</span>
              </div>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  // ============================================================================
  // 2. AUTHENTICATED ADMIN DASHBOARD (Modern, Simple, Sleek)
  // ============================================================================
  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        {/* Top Header & User Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-pitch-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-slate-100 tracking-tight font-sans">
                Admin Console
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Super Admin
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Manage newsroom editorial, creator payouts, live football engine, and advertising.
            </p>
          </div>

          {/* User Session Pill */}
          <div className="flex items-center gap-3 bg-pitch-900/90 border border-pitch-800 px-3.5 py-2 rounded-xl self-start sm:self-auto shadow-sm">
            <div className="w-8 h-8 rounded-full bg-[#c3ff00]/15 text-[#c3ff00] font-bold font-mono text-xs flex items-center justify-center border border-[#c3ff00]/30">
              {user.fullName?.charAt(0) || "A"}
            </div>
            <div className="text-left pr-2">
              <div className="text-xs font-semibold text-slate-200 leading-none">
                {user.fullName}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5 leading-none truncate max-w-[140px]">
                {user.email}
              </div>
            </div>
            <a
              href="/api/auth/dev-session?action=logout&redirect=/admin"
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-red-400 bg-pitch-850 hover:bg-pitch-800 rounded-lg transition-colors border border-pitch-750"
            >
              <LogOut className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Quick Health & Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-pitch-900/70 border border-pitch-800 p-4 rounded-2xl space-y-2 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Platform Status</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-100 font-sans">Operational</span>
              <span className="text-[10px] text-emerald-400 font-mono">100%</span>
            </div>
            <p className="text-[11px] text-slate-500">PostgreSQL • Redis L2 Cache</p>
          </div>

          <div className="bg-pitch-900/70 border border-pitch-800 p-4 rounded-2xl space-y-2 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Newsroom Studio</span>
              <Newspaper className="w-4 h-4 text-[#c3ff00]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-100 font-sans">Publishing</span>
              <span className="text-[10px] text-[#c3ff00] font-mono">Ready</span>
            </div>
            <p className="text-[11px] text-slate-500">AI Editorial Gate v2.0</p>
          </div>

          <div className="bg-pitch-900/70 border border-pitch-800 p-4 rounded-2xl space-y-2 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Live Football Data</span>
              <Radio className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-100 font-sans">API-Football</span>
              <span className="text-[10px] text-cyan-400 font-mono">v3 Active</span>
            </div>
            <p className="text-[11px] text-slate-500">Quota Guard Protected</p>
          </div>

          <div className="bg-pitch-900/70 border border-pitch-800 p-4 rounded-2xl space-y-2 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Finance & Ledger</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-100 font-sans">Automated</span>
              <span className="text-[10px] text-emerald-400 font-mono">Integer Math</span>
            </div>
            <p className="text-[11px] text-slate-500">48h Withdrawal Cooldown</p>
          </div>
        </div>

        {/* Categorized Admin Action Modules */}
        <div className="space-y-6">
          {/* Section 1: Content & Newsroom */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
              <PenTool className="w-3.5 h-3.5 text-[#c3ff00]" />
              <span>Editorial & Newsroom Management</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/admin/articles/new"
                className="group p-5 bg-pitch-900/80 border border-[#c3ff00]/40 hover:border-[#c3ff00] rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg shadow-sm backdrop-blur-sm flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-[#c3ff00]/10 text-[#c3ff00] flex items-center justify-center shrink-0 border border-[#c3ff00]/20 group-hover:scale-105 transition-transform">
                  <PenTool className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-[#c3ff00] transition-colors">
                      Newsroom Publishing Studio
                    </h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#c3ff00]/15 text-[#c3ff00] font-bold">
                      Primary
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Write, edit, and publish official articles, breaking news banners, and featured cover stories directly to the homepage feed.
                  </p>
                </div>
              </Link>

              <Link
                href="/admin/contributors"
                className="group p-5 bg-pitch-900/80 border border-pitch-800 hover:border-pitch-700 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg shadow-sm backdrop-blur-sm flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20 group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                    Contributor Network & Reviews
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Manage writer applications, track quality scores, review submitted articles, and manage creator account permissions.
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Section 2: Football Live Engine */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>Football Data & Live Engine</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/admin/football"
                className="group p-5 bg-pitch-900/80 border border-pitch-800 hover:border-pitch-700 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg shadow-sm backdrop-blur-sm flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20 group-hover:scale-105 transition-transform">
                  <Radio className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
                    Live Football Engine Controls
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Manage real-time live match polling, provider synchronization, Opta telemetry feeds, and Redis cache purging.
                  </p>
                </div>
              </Link>

              <Link
                href="/admin/football/live-telemetry"
                className="group p-5 bg-pitch-900/80 border border-pitch-800 hover:border-pitch-700 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg shadow-sm backdrop-blur-sm flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20 group-hover:scale-105 transition-transform">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-purple-400 transition-colors">
                    API Quota Guard & Telemetry
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Inspect daily request usage (100 req/day limit), rate limit 429 backoff states, cache hit ratios, and latency logs.
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Section 3: Finance, Monetization & Growth */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Finance, Monetization & Platform Growth</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/admin/finance"
                className="group p-5 bg-pitch-900/80 border border-pitch-800 hover:border-pitch-700 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg shadow-sm backdrop-blur-sm space-y-2"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform">
                  <DollarSign className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  Finance & Payouts
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Approve author withdrawal requests, review financial ledgers, and manage bank gateway rules.
                </p>
              </Link>

              <Link
                href="/admin/advertising"
                className="group p-5 bg-pitch-900/80 border border-pitch-800 hover:border-pitch-700 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg shadow-sm backdrop-blur-sm space-y-2"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-105 transition-transform">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                  Ads & Sponsorships
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Configure sponsor banner slots, CPM popunders, brand campaigns, and partner integrations.
                </p>
              </Link>

              <Link
                href="/admin/analytics"
                className="group p-5 bg-pitch-900/80 border border-pitch-800 hover:border-pitch-700 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg shadow-sm backdrop-blur-sm space-y-2"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 group-hover:scale-105 transition-transform">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                  Traffic Analytics
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time pageviews, reader engagement, ad click-through rates, and estimated RPM earnings.
                </p>
              </Link>

              <Link
                href="/admin/seo"
                className="group p-5 bg-pitch-900/80 border border-pitch-800 hover:border-pitch-700 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg shadow-sm backdrop-blur-sm space-y-2"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform">
                  <Globe className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  SEO & Distribution
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Google Discover sitemaps, RSS 2.0 feeds, News Schema validator, and 301 URL redirect management.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
