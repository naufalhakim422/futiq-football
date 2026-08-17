import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ShieldAlert, Users, Database, Layers, Lock } from "lucide-react";

export default async function AdminPortalPage() {
  const user = await getCurrentUser();
  const isAdmin = user?.roles.includes("SUPER_ADMIN");

  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        <SectionHeader
          title="Platform Administration & Security Operations"
          subtitle="System configuration, RBAC management, audit trails, and infrastructure telemetry"
          badgeText="Protected Root"
        />

        <div className="bg-pitch-900 border border-pitch-800 p-6 space-y-6">
          <div className="flex items-center gap-3 p-4 bg-pitch-950 border border-pitch-800">
            <Lock className="w-5 h-5 text-brand-red" />
            <div>
              <h4 className="text-sm font-bold text-slate-100 font-sans">
                RBAC Security Zone & Server Authorization
              </h4>
              <p className="text-xs text-slate-400">
                {isAdmin
                  ? `Authenticated as SUPER_ADMIN: ${user?.email}`
                  : "Restricted Area — Requires SUPER_ADMIN privileges verified via server-side session cookies."}
              </p>
            </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <a
              href="/admin/finance"
              className="p-5 bg-pitch-950 border border-pitch-800 hover:border-emerald-500/50 transition-colors block group"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  Finance & Payout Command Center →
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Manage contributor rewards, verify double-entry wallet liabilities, review withdrawal requests, and disburse payouts.
              </p>
            </a>

            <a
              href="/admin/football"
              className="p-5 bg-pitch-950 border border-pitch-800 hover:border-pitch-gold/50 transition-colors block group"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 group-hover:text-pitch-gold transition-colors">
                  Football Sync & Telemetry Engine →
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Trigger full data synchronization, inspect provider health, and manage competition cache invalidation.
              </p>
            </a>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
