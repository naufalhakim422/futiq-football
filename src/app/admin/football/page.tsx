import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { footballSyncService } from "@/lib/football/sync.service";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Shield, RefreshCw, CheckCircle2, AlertTriangle, Layers, Database, ArrowLeft } from "lucide-react";
import { SyncTriggerButton } from "./SyncTriggerButton";
import Link from "next/link";

export default async function AdminFootballPage() {
  const user = await getCurrentUser();
  const isSuperAdmin = user?.roles.includes("SUPER_ADMIN");
  const status = footballSyncService.getStatus();

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
            title="Sinkronisasi & Operasi Mesin Sepak Bola"
            subtitle="Telemetri penyedia data, status sinkronisasi database, manajemen partisi cache Redis, dan live feed"
            badgeText="Admin Desk"
          />
        </div>

        <div className="bg-pitch-900 border border-pitch-800 p-6 space-y-6 shadow-xl">
          {/* Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-pitch-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono uppercase text-slate-400">
                  Mesin Provider Aktif:
                </span>
                <span className="px-2 py-0.5 text-xs font-bold font-mono bg-pitch-800 text-[#c3ff00] border border-pitch-700">
                  {status.providerName}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pipeline data mengambil data dari provider resmi, menyimpan ke PostgreSQL, dan menyegarkan cache partisi Redis L2.
              </p>
            </div>

            <SyncTriggerButton isSuperAdmin={!!isSuperAdmin} />
          </div>

          {/* Sync Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
            <div className="bg-pitch-850 border border-pitch-750 p-3 text-center">
              <span className="text-[10px] text-slate-500 uppercase">Kompetisi</span>
              <div className="text-base font-bold text-slate-200 mt-1">
                {status.recordsSynced.competitions}
              </div>
            </div>

            <div className="bg-pitch-850 border border-pitch-750 p-3 text-center">
              <span className="text-[10px] text-slate-500 uppercase">Klub / Tim</span>
              <div className="text-base font-bold text-slate-200 mt-1">
                {status.recordsSynced.teams}
              </div>
            </div>

            <div className="bg-pitch-850 border border-pitch-750 p-3 text-center">
              <span className="text-[10px] text-slate-500 uppercase">Pemain</span>
              <div className="text-base font-bold text-slate-200 mt-1">
                {status.recordsSynced.players}
              </div>
            </div>

            <div className="bg-pitch-850 border border-pitch-750 p-3 text-center">
              <span className="text-[10px] text-slate-500 uppercase">Jadwal & Laga</span>
              <div className="text-base font-bold text-slate-200 mt-1">
                {status.recordsSynced.matches}
              </div>
            </div>

            <div className="bg-pitch-850 border border-pitch-750 p-3 text-center">
              <span className="text-[10px] text-slate-500 uppercase">Klasemen</span>
              <div className="text-base font-bold text-slate-200 mt-1">
                {status.recordsSynced.standings}
              </div>
            </div>

            <div className="bg-pitch-850 border border-pitch-750 p-3 text-center">
              <span className="text-[10px] text-slate-500 uppercase">Bursa Transfer</span>
              <div className="text-base font-bold text-slate-200 mt-1">
                {status.recordsSynced.transfers}
              </div>
            </div>
          </div>

          {/* Sync Diagnostics */}
          <div className="p-4 bg-pitch-950 border border-pitch-800 text-xs font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {status.status === "FAILED" ? (
                <AlertTriangle className="w-5 h-5 text-brand-red" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-brand-green" />
              )}
              <div>
                <span className="text-slate-200 font-bold">
                  Status: {status.status}
                </span>
                <p className="text-[11px] text-slate-500">
                  Waktu Sinkronisasi Terakhir: {status.lastSyncAt ? new Date(status.lastSyncAt).toLocaleString() : "Belum pernah (Kondisi awal)"}
                </p>
              </div>
            </div>

            {status.lastError && (
              <span className="text-brand-red text-[11px]">
                Error: {status.lastError}
              </span>
            )}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
