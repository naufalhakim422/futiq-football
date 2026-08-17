import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { editorialService } from "@/lib/editorial/editorial.service";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import {
  ShieldCheck,
  FileCheck2,
  Cpu,
  AlertTriangle,
  ArrowRight,
  User,
  Star,
  Layers,
  Sparkles,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EditorDeskPage() {
  const user = await getCurrentUser();
  const isEditor =
    user?.roles.includes("EDITOR_IN_CHIEF") ||
    user?.roles.includes("SENIOR_EDITOR") ||
    user?.roles.includes("SUPER_ADMIN");

  // ============================================================================
  // 1. UNAUTHENTICATED / PRIVATE EDITORIAL GATEWAY VIEW
  // ============================================================================
  if (!user || !isEditor) {
    return (
      <div className="py-12 md:py-16">
        <PageContainer>
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-gold/10 border border-brand-gold/30 text-[10px] font-mono font-bold uppercase tracking-widest text-brand-gold">
                <Lock className="w-3.5 h-3.5" />
                <span>Editorial Staff Terminal • Accredited Access Only</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 font-sans tracking-tight">
                Editorial Review & AI Gate Desk
              </h1>
              <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                This internal review station is restricted to licensed editors, fact-checkers, and senior editorial staff to audit manuscripts, review AI Gate findings, and approve public broadcasts.
              </p>
            </div>

            <div className="bg-pitch-900 border border-pitch-800 p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-start gap-4 pb-6 border-b border-pitch-800">
                <div className="w-12 h-12 bg-pitch-850 border border-pitch-750 text-brand-gold flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-100 font-sans">
                    Editorial Staff Authentication Required
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    To access manuscript queues and AI fact-checking reports, please authenticate with an authorized Editorial account.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 bg-pitch-950 border border-pitch-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">AI Inspection</span>
                  <div className="text-sm font-bold text-brand-green">ACTIVE</div>
                </div>
                <div className="p-3 bg-pitch-950 border border-pitch-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">Plagiarism Scan</span>
                  <div className="text-sm font-bold text-brand-gold">MANDATORY</div>
                </div>
                <div className="p-3 bg-pitch-950 border border-pitch-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">Sourced Citations</span>
                  <div className="text-sm font-bold text-slate-200">VERIFIED</div>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="/api/auth/dev-session?role=SENIOR_EDITOR&redirect=/editor"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 bg-brand-gold hover:bg-amber-400 transition-colors shadow-md active:scale-[0.99]"
                >
                  <span>Aktifkan Sesi Editor (Buka Meja Redaksi)</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-pitch-800">
                <Link
                  href="/"
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  ← Return to Public Site
                </Link>
                <Link
                  href="/contributor/apply"
                  className="text-xs text-brand-green hover:underline font-semibold"
                >
                  Apply as Contributor →
                </Link>
              </div>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  // ============================================================================
  // 2. AUTHENTICATED EDITORIAL DESK
  // ============================================================================
  let queue = { articles: [] as any[], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } };
  try {
    queue = await editorialService.getReviewQueue({ limit: 10 });
  } catch (error) {
    // Database fallback
  }

  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        <SectionHeader
          title="Editorial Review Desk"
          subtitle="Verification queue, citation validation, AI Gate inspection, and publication decisions"
          badgeText="Staff Access"
        />

        {/* Command Center Panel */}
        <div className="bg-pitch-900 border border-pitch-800 p-6 sm:p-7 space-y-6 shadow-xl">
          <div className="p-4 sm:p-5 bg-pitch-950 border border-pitch-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-brand-green shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <h4 className="text-sm font-bold text-slate-100 font-sans">
                  Staff Editorial Authority & Review Pipeline
                </h4>
                <p className="text-xs text-brand-green font-mono mt-0.5">
                  Staff: {user.fullName} ({user.roles.join(", ")})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <a
                href="/api/auth/dev-session?action=logout&redirect=/editor"
                className="px-3.5 py-2 text-xs font-semibold text-slate-300 bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 transition-colors"
              >
                Keluar Sesi
              </a>
              <Link
                href="/editor/review"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-brand-green hover:bg-brand-green-hover transition-colors shadow-md active:scale-[0.99]"
              >
                <span>Open Review Queue</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="bg-pitch-950 border border-pitch-800 p-4 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">Awaiting Decision</span>
                <FileCheck2 className="w-4 h-4 text-brand-green" />
              </div>
              <div className="text-3xl font-bold text-slate-100 mt-1">{queue.pagination.total}</div>
              <p className="text-[10px] text-slate-500 font-sans">Submissions in active editorial queue</p>
            </div>

            <div className="bg-pitch-950 border border-pitch-800 p-4 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">AI Gate State</span>
                <Cpu className="w-4 h-4 text-brand-green" />
              </div>
              <div className="text-3xl font-bold text-brand-green mt-1">ACTIVE</div>
              <p className="text-[10px] text-slate-500 font-sans">Plagiarism & Copyright verification live</p>
            </div>

            <div className="bg-pitch-950 border border-pitch-800 p-4 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">Active Policy</span>
                <Star className="w-4 h-4 text-brand-gold" />
              </div>
              <div className="text-3xl font-bold text-slate-100 mt-1">PASS/REV/REJ</div>
              <p className="text-[10px] text-slate-500 font-sans">Double verification editorial ruleset</p>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
