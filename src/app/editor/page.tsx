import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ShieldCheck, FileCheck2, Cpu, AlertTriangle } from "lucide-react";

export default async function EditorDeskPage() {
  const user = await getCurrentUser();
  const isEditor =
    user?.roles.includes("EDITOR_IN_CHIEF") ||
    user?.roles.includes("SENIOR_EDITOR") ||
    user?.roles.includes("SUPER_ADMIN");

  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        <SectionHeader
          title="Editorial Review Desk"
          subtitle="Verification queue, AI plagiarism inspection scores, source validation, and publication approvals"
          badgeText={isEditor ? "Staff Access" : "Editorial Gate"}
        />

        <div className="bg-pitch-900 border border-pitch-800 p-6 space-y-6">
          <div className="p-4 bg-pitch-950 border border-pitch-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-brand-green" />
              <div>
                <h4 className="text-sm font-bold text-slate-100 font-sans">
                  Server-Side Authorization & Editorial Review Pipeline
                </h4>
                <p className="text-xs text-slate-400">
                  {user
                    ? `Authenticated as: ${user.fullName} (${user.roles.join(", ")})`
                    : "Protected Workspace — Editorial Staff credentials required to approve drafts."}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-pitch-850 border border-pitch-750 p-4 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase">Pending Reviews</span>
                <FileCheck2 className="w-4 h-4 text-brand-green" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-100">0</div>
              <p className="text-[10px] text-slate-500">Drafts awaiting editor sign-off</p>
            </div>

            <div className="bg-pitch-850 border border-pitch-750 p-4 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase">AI Gate Status</span>
                <Cpu className="w-4 h-4 text-brand-green" />
              </div>
              <div className="text-2xl font-bold font-mono text-brand-green">READY</div>
              <p className="text-[10px] text-slate-500">Plagiarism & Copyright scans</p>
            </div>

            <div className="bg-pitch-850 border border-pitch-750 p-4 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase">Flagged Items</span>
                <AlertTriangle className="w-4 h-4 text-brand-red" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-100">0</div>
              <p className="text-[10px] text-slate-500">Missing sources or duplicate images</p>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
