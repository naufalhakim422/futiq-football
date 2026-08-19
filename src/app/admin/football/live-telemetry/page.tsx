import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { liveMatchEngine } from "@/lib/football/live-engine/live-match.engine";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import {
  Activity,
  Zap,
  Server,
  Database,
  Radio,
  Clock,
  Shield,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminLiveTelemetryPage() {
  const user = await getCurrentUser();
  if (!user || (!user.roles.includes("SUPER_ADMIN") && !user.roles.includes("EDITOR_IN_CHIEF"))) {
    redirect("/login");
  }

  const telemetry = await liveMatchEngine.getLiveTelemetry();

  return (
    <div className="py-8 space-y-8 font-sans">
      <PageContainer>
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/admin/football"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Operasi Sepak Bola
          </Link>
          <SectionHeader
            title="Telemetri Live Match Engine 2.0 & Real-Time Sync"
            subtitle="Monitoring status background worker 15s, circuit breaker, kuota API-Football, distributed locks Redis, dan telemetri inspeksi per-pertandingan"
            badgeText="Live Telemetry Desk"
          />
        </div>

        {/* 1. System & Worker Status Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          {/* Worker Heartbeat */}
          <div className="bg-pitch-900 border border-pitch-800 p-5 rounded-2xl shadow-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 uppercase text-[10px]">Worker Status</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {telemetry.system.workerStatus}
              </span>
            </div>
            <div className="text-xl font-black text-slate-100">
              {telemetry.system.activeLiveMatchesCount} <span className="text-xs font-normal text-slate-400">Laga Live Aktif</span>
            </div>
            <span className="text-[10px] text-slate-500 block truncate">
              Heartbeat: {new Date(telemetry.system.workerHeartbeat).toLocaleTimeString()} WIB
            </span>
          </div>

          {/* Circuit Breaker */}
          <div className="bg-pitch-900 border border-pitch-800 p-5 rounded-2xl shadow-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 uppercase text-[10px]">Circuit Breaker</span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                  telemetry.system.circuitBreakerState === "CLOSED"
                    ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                    : telemetry.system.circuitBreakerState === "HALF_OPEN"
                    ? "bg-amber-950 text-amber-400 border-amber-800"
                    : "bg-rose-950 text-rose-400 border-rose-800"
                )}
              >
                {telemetry.system.circuitBreakerState}
              </span>
            </div>
            <div className="text-xl font-black text-slate-100">
              {telemetry.system.staleMatchesCount} <span className="text-xs font-normal text-slate-400">Data Stale/Delayed</span>
            </div>
            <span className="text-[10px] text-slate-500 block">
              Gagal: {telemetry.system.failedMatchesCount} | Antrean: {telemetry.system.queuedMatchesCount}
            </span>
          </div>

          {/* API Quota & Latency */}
          <div className="bg-pitch-900 border border-pitch-800 p-5 rounded-2xl shadow-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 uppercase text-[10px]">Kuota API-Football</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-400 border border-blue-800">
                {telemetry.api.remainingDailyQuota} Sisa
              </span>
            </div>
            <div className="text-xl font-black text-slate-100">
              {telemetry.api.requestsToday} <span className="text-xs font-normal text-slate-400">/ 100 req/hari</span>
            </div>
            <span className="text-[10px] text-slate-500 block">
              Latency: {telemetry.api.providerAverageLatencyMs}ms | 429s: {telemetry.api.rateLimit429Errors}
            </span>
          </div>

          {/* Cache & DB Health */}
          <div className="bg-pitch-900 border border-pitch-800 p-5 rounded-2xl shadow-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 uppercase text-[10px]">Redis Cache L2</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                Hit Rate: {telemetry.cache.cacheHitRatePercent}%
              </span>
            </div>
            <div className="text-xl font-black text-slate-100">
              {telemetry.cache.cacheHits} <span className="text-xs font-normal text-slate-400">Hits / {telemetry.cache.cacheMisses} Miss</span>
            </div>
            <span className="text-[10px] text-slate-500 block">
              DB Latency: {telemetry.database.queryLatencyMs}ms ({telemetry.database.postgresHealth})
            </span>
          </div>
        </div>

        {/* 2. Per-Fixture Telemetry Inspection Table */}
        <div className="bg-pitch-900 border border-pitch-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-pitch-800">
            <div className="flex items-center gap-2.5">
              <Radio className="w-4 h-4 text-[#c3ff00]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono">
                Inspeksi Status Per-Pertandingan (Live Synchronization Matrix)
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span>Interval Sync Live: <strong className="text-[#c3ff00]">15 Detik</strong></span>
            </div>
          </div>

          {telemetry.liveData.activeFixtures.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Clock className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-mono text-slate-400">
                Tidak ada entri pertandingan aktif dalam matrix polling saat ini.
              </p>
              <span className="text-[11px] text-slate-500 font-sans block">
                Matrix akan otomatis terisi saat pengguna membuka Match Center atau saat laga live disinkronisasi.
              </span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-pitch-800 text-slate-400 uppercase font-mono text-[10px]">
                    <th className="py-3 px-3">Fixture ID</th>
                    <th className="py-3 px-3">Pertandingan</th>
                    <th className="py-3 px-2 text-center">Status</th>
                    <th className="py-3 px-2 text-center">Menit</th>
                    <th className="py-3 px-2 text-center">Freshness</th>
                    <th className="py-3 px-3">Sync Terakhir Provider</th>
                    <th className="py-3 px-3">Jadwal Sync Berikut</th>
                    <th className="py-3 px-2 text-center">Cache</th>
                    <th className="py-3 px-2 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pitch-850 font-mono">
                  {telemetry.liveData.activeFixtures.map((f) => (
                    <tr key={f.fixtureId} className="hover:bg-pitch-850/60 transition-colors">
                      <td className="py-3 px-3 text-[#c3ff00] font-bold truncate max-w-[120px]">
                        {f.fixtureId}
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <div className="font-bold text-slate-200">
                          {f.homeTeam} vs {f.awayTeam}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {f.competition}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pitch-950 border border-pitch-800 text-slate-300">
                          {f.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-slate-200">
                        {f.currentMinute ? `${f.currentMinute}'` : "—"}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-bold",
                            f.dataFreshness === "FRESH"
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                              : f.dataFreshness === "DELAYED"
                              ? "bg-amber-950 text-amber-400 border border-amber-800"
                              : "bg-rose-950 text-rose-400 border border-rose-800"
                          )}
                        >
                          {f.dataFreshness}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {f.lastProviderSyncAt
                          ? new Date(f.lastProviderSyncAt).toLocaleTimeString() + " WIB"
                          : "Belum sync"}
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {f.nextScheduledSyncAt
                          ? new Date(f.nextScheduledSyncAt).toLocaleTimeString() + " WIB"
                          : "Selesai (Off)"}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="text-[10px] text-slate-400">
                          {f.cacheStatus} ({f.syncCount}x)
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center font-sans">
                        <Link
                          href={`/matches/${f.fixtureId}`}
                          className="px-2.5 py-1 rounded-lg bg-pitch-800 hover:bg-pitch-700 text-[#c3ff00] text-[11px] font-bold transition-colors inline-block"
                        >
                          Lihat
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
