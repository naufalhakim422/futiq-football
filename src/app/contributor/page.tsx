import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { PenTool, DollarSign, BarChart2, ShieldCheck, CheckCircle2 } from "lucide-react";

export default async function ContributorPage() {
  const user = await getCurrentUser();
  const isContributor =
    user?.roles.includes("CONTRIBUTOR") ||
    user?.roles.includes("SENIOR_EDITOR") ||
    user?.roles.includes("SUPER_ADMIN");

  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        <SectionHeader
          title="Contributor Portal"
          subtitle="Publish original sports journalism, track reader engagement, and manage revenue earnings"
          badgeText={isContributor ? "Active Workspace" : "Writer Network"}
        />

        {/* Server-Side Auth State Banner */}
        <div className="bg-pitch-900 border border-pitch-800 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-pitch-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono uppercase text-slate-400">
                  Authentication Status:
                </span>
                {user ? (
                  <span className="inline-flex items-center gap-1 text-brand-green text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Logged In ({user.email})</span>
                  </span>
                ) : (
                  <span className="text-slate-400 text-xs font-semibold font-mono">
                    Guest Session (Server Authorized Access Required for Publishing)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Server-side RBAC protects all submission and payout endpoints.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={!isContributor}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 bg-brand-green hover:bg-brand-green-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                + New Article Draft
              </button>
            </div>
          </div>

          {/* Metrics Preview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-pitch-850 border border-pitch-750 p-4 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase">Published Articles</span>
                <PenTool className="w-4 h-4 text-brand-green" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-100">0</div>
              <p className="text-[10px] text-slate-500">Subject to AI Editorial Gate</p>
            </div>

            <div className="bg-pitch-850 border border-pitch-750 p-4 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase">Validated Views</span>
                <BarChart2 className="w-4 h-4 text-brand-green" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-100">0</div>
              <p className="text-[10px] text-slate-500">Filtered for genuine engagement</p>
            </div>

            <div className="bg-pitch-850 border border-pitch-750 p-4 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase">Accrued Wallet</span>
                <DollarSign className="w-4 h-4 text-brand-green" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-100">$0.00</div>
              <p className="text-[10px] text-slate-500">Minimum withdrawal: $50.00</p>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
