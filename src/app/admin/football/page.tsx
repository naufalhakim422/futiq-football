import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { footballSyncService } from "@/lib/football/sync.service";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Shield, RefreshCw, CheckCircle2, AlertTriangle, Layers, Database } from "lucide-react";
import { SyncTriggerButton } from "./SyncTriggerButton";

export default async function AdminFootballPage() {
  const user = await getCurrentUser();
  const isSuperAdmin = user?.roles.includes("SUPER_ADMIN");
  const status = footballSyncService.getStatus();

  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        <SectionHeader
          title="Football Engine Sync & Operations"
          subtitle="Provider telemetry, database sync status, cache partition management, and data feeds"
          badgeText="Admin Desk"
        />

        <div className="bg-pitch-900 border border-pitch-800 p-6 space-y-6">
          {/* Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-pitch-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono uppercase text-slate-400">
                  Active Provider Engine:
                </span>
                <span className="px-2 py-0.5 text-xs font-bold font-mono bg-pitch-800 text-brand-green border border-pitch-700">
                  {status.providerName}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Data pipeline ingests provider records, writes to PostgreSQL source of truth, and hydrates Redis L2 cache.
              </p>
            </div>

            <SyncTriggerButton isSuperAdmin={!!isSuperAdmin} />
          </div>

          {/* Sync Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
            <div className="bg-pitch-850 border border-pitch-750 p-3 text-center">
              <span className="text-[10px] text-slate-500 uppercase">Competitions</span>
              <div className="text-base font-bold text-slate-200 mt-1">
                {status.recordsSynced.competitions}
              </div>
            </div>

            <div className="bg-pitch-850 border border-pitch-750 p-3 text-center">
              <span className="text-[10px] text-slate-500 uppercase">Clubs / Teams</span>
              <div className="text-base font-bold text-slate-200 mt-1">
                {status.recordsSynced.teams}
              </div>
            </div>

            <div className="bg-pitch-850 border border-pitch-750 p-3 text-center">
              <span className="text-[10px] text-slate-500 uppercase">Players</span>
              <div className="text-base font-bold text-slate-200 mt-1">
                {status.recordsSynced.players}
              </div>
            </div>

            <div className="bg-pitch-850 border border-pitch-750 p-3 text-center">
              <span className="text-[10px] text-slate-500 uppercase">Fixtures/Matches</span>
              <div className="text-base font-bold text-slate-200 mt-1">
                {status.recordsSynced.matches}
              </div>
            </div>

            <div className="bg-pitch-850 border border-pitch-750 p-3 text-center">
              <span className="text-[10px] text-slate-500 uppercase">Standings Rows</span>
              <div className="text-base font-bold text-slate-200 mt-1">
                {status.recordsSynced.standings}
              </div>
            </div>

            <div className="bg-pitch-850 border border-pitch-750 p-3 text-center">
              <span className="text-[10px] text-slate-500 uppercase">Transfers</span>
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
                  Last Sync Timestamp: {status.lastSyncAt ? new Date(status.lastSyncAt).toLocaleString() : "Never (Initial state)"}
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
