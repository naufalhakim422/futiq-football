import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { footballSyncService } from "@/lib/football/sync.service";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Database,
  ArrowLeft,
  Activity,
  Zap,
  Clock,
  KeyRound,
  Server,
} from "lucide-react";
import { SyncTriggerButton } from "./SyncTriggerButton";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { redis } from "@/lib/redis";

export default async function AdminFootballPage() {
  const user = await getCurrentUser();
  const isSuperAdmin = user?.roles.includes("SUPER_ADMIN");
  const status = footballSyncService.getStatus();

  // Test Redis connection status
  let redisHealthy = false;
  try {
    if (redis) {
      await redis.ping();
      redisHealthy = true;
    }
  } catch {
    redisHealthy = false;
  }

  // Test DB connection status
  let dbHealthy = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbHealthy = true;
  } catch {
    dbHealthy = false;
  }

  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Pusat Admin
          </Link>
          <SectionHeader
            title="Integrasi & Operasi API Sepak Bola"
            subtitle="Konfigurasi API-Football v3 (Paket FREE), pengawal kuota 100 req/hari, status cache L2 Redis, dan telemetri data live"
            badgeText="Admin Desk"
          />
        </div>

        {/* API Plan & Quota Guard Status Card */}
        <div className="bg-pitch-900 border border-pitch-800 p-6 space-y-6 shadow-xl rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-pitch-800">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono uppercase text-slate-400">
                  Penyedia Data Aktif:
                </span>
                <span className="px-2.5 py-0.5 text-xs font-bold font-mono bg-pitch-800 text-[#c3ff00] border border-pitch-700 rounded">
                  {status.providerName}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold font-mono bg-blue-950 text-blue-400 border border-blue-800 rounded">
                  PAKET {status.quota.plan}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Data pipeline mengambil feeds resmi melalui layer isolasi server-side, divalidasi oleh Quota Guard (100 req/hari), dan di-cache pada Redis.
              </p>
            </div>

            <SyncTriggerButton isSuperAdmin={!!isSuperAdmin} />
          </div>

          {/* Quota & Infrastructure Telemetry Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
            <div className="bg-pitch-950 border border-pitch-800 p-3.5 rounded-lg">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase">
                <Activity className="w-3 h-3 text-[#c3ff00]" />
                <span>Kuota Hari Ini</span>
              </div>
              <div className="text-lg font-bold text-slate-100 mt-1">
                {status.quota.requestsToday} <span className="text-xs text-slate-500 font-normal">/ {status.quota.dailyLimit}</span>
              </div>
              <span className="text-[10px] text-emerald-400 block mt-0.5">
                Sisa: {status.quota.requestsRemaining} req
              </span>
            </div>

            <div className="bg-pitch-950 border border-pitch-800 p-3.5 rounded-lg">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Limit Per Menit</span>
              </div>
              <div className="text-lg font-bold text-slate-100 mt-1">
                {status.quota.requestsThisMinute} <span className="text-xs text-slate-500 font-normal">/ {status.quota.perMinuteLimit}</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">Sliding window 60s</span>
            </div>

            <div className="bg-pitch-950 border border-pitch-800 p-3.5 rounded-lg">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase">
                <KeyRound className="w-3 h-3 text-purple-400" />
                <span>Kunci API</span>
              </div>
              <div className="text-xs font-bold text-slate-200 mt-2">
                {status.isConfigured ? "Terkonfigurasi" : "Mode Simulasi"}
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {status.isConfigured ? "Server-side Secret" : "Mock Fallback Aktif"}
              </span>
            </div>

            <div className="bg-pitch-950 border border-pitch-800 p-3.5 rounded-lg">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase">
                <Zap className="w-3 h-3 text-red-400" />
                <span>Rate Limit 429</span>
              </div>
              <div className="text-lg font-bold text-slate-200 mt-1">
                {status.quota.rateLimit429Count}
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {status.quota.isRateLimited ? "Pending Backoff" : "Normal"}
              </span>
            </div>

            <div className="bg-pitch-950 border border-pitch-800 p-3.5 rounded-lg">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase">
                <Server className="w-3 h-3 text-cyan-400" />
                <span>Cache Redis</span>
              </div>
              <div className="text-xs font-bold mt-2">
                <span className={redisHealthy ? "text-emerald-400" : "text-amber-400"}>
                  {redisHealthy ? "● Redis Aktif" : "○ Memory Fallback"}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">TTL: 60s Live / 24h Meta</span>
            </div>

            <div className="bg-pitch-950 border border-pitch-800 p-3.5 rounded-lg">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase">
                <Database className="w-3 h-3 text-blue-400" />
                <span>Database</span>
              </div>
              <div className="text-xs font-bold mt-2">
                <span className={dbHealthy ? "text-emerald-400" : "text-amber-400"}>
                  {dbHealthy ? "● PostgreSQL OK" : "○ Fallback Mode"}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">Transactional Storage</span>
            </div>
          </div>

          {/* Sync Telemetry Grid */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 font-sans">
              Data Entitas Tersinkronisasi
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
              <div className="bg-pitch-850 border border-pitch-750 p-3 text-center rounded">
                <span className="text-[10px] text-slate-500 uppercase">Kompetisi</span>
                <div className="text-base font-bold text-slate-200 mt-1">
                  {status.recordsSynced.competitions}
                </div>
              </div>

              <div className="bg-pitch-850 border border-pitch-750 p-3 text-center rounded">
                <span className="text-[10px] text-slate-500 uppercase">Klub / Tim</span>
                <div className="text-base font-bold text-slate-200 mt-1">
                  {status.recordsSynced.teams}
                </div>
              </div>

              <div className="bg-pitch-850 border border-pitch-750 p-3 text-center rounded">
                <span className="text-[10px] text-slate-500 uppercase">Pemain</span>
                <div className="text-base font-bold text-slate-200 mt-1">
                  {status.recordsSynced.players}
                </div>
              </div>

              <div className="bg-pitch-850 border border-pitch-750 p-3 text-center rounded">
                <span className="text-[10px] text-slate-500 uppercase">Jadwal & Laga</span>
                <div className="text-base font-bold text-slate-200 mt-1">
                  {status.recordsSynced.matches}
                </div>
              </div>

              <div className="bg-pitch-850 border border-pitch-750 p-3 text-center rounded">
                <span className="text-[10px] text-slate-500 uppercase">Klasemen</span>
                <div className="text-base font-bold text-slate-200 mt-1">
                  {status.recordsSynced.standings}
                </div>
              </div>

              <div className="bg-pitch-850 border border-pitch-750 p-3 text-center rounded">
                <span className="text-[10px] text-slate-500 uppercase">Bursa Transfer</span>
                <div className="text-base font-bold text-slate-200 mt-1">
                  {status.recordsSynced.transfers}
                </div>
              </div>
            </div>
          </div>

          {/* Sync Diagnostics & Status Banner */}
          <div className="p-4 bg-pitch-950 border border-pitch-800 text-xs font-mono rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {status.status === "FAILED" ? (
                <AlertTriangle className="w-5 h-5 text-brand-red" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-brand-green" />
              )}
              <div>
                <span className="text-slate-200 font-bold">
                  Status Operasional: {status.status}
                </span>
                <p className="text-[11px] text-slate-500">
                  Sinkronisasi Terakhir: {status.lastSyncAt ? new Date(status.lastSyncAt).toLocaleString() : "Belum pernah (Kondisi awal)"}
                </p>
              </div>
            </div>

            {status.lastError && (
              <span className="text-brand-red text-[11px]">
                Error Terakhir: {status.lastError}
              </span>
            )}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
