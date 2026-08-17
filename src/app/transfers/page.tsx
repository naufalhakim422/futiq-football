import React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { footballService } from "@/lib/football/football.service";
import { ArrowRight, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import Link from "next/link";

export const revalidate = 600; // 10 minutes ISR

export default async function TransfersPage() {
  const transfers = await footballService.getTransfers();

  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        <SectionHeader
          title="Transfer Center"
          subtitle="Verified football transfers, contract extensions, and market intelligence"
          badgeText="Live Window"
        />

        <div className="bg-pitch-900 border border-pitch-800 overflow-hidden">
          <div className="p-4 border-b border-pitch-800 bg-pitch-950 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-sans">
              Latest Deal Sheet & Radar
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Verified by Editorial Desk
            </span>
          </div>

          <div className="divide-y divide-pitch-800">
            {transfers.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-pitch-850 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100 text-base font-sans">
                      {item.playerName}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      ({item.playerPosition})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                    <span className="text-slate-400">
                      {item.fromTeam?.name || "Unattached"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-brand-green" />
                    <span className="text-slate-100 font-semibold">
                      {item.toTeam?.name || "Target Club"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-right">
                    <div className="text-sm font-mono font-bold text-slate-100">
                      {item.feeDescription || "Undisclosed"}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {item.announcementDate}
                    </div>
                  </div>

                  {item.status === "COMPLETED" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-brand-green/10 text-brand-green border border-brand-green/30 rounded font-mono">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Official</span>
                    </span>
                  )}
                  {item.status === "ADVANCED" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-brand-gold/10 text-brand-gold border border-brand-gold/30 rounded font-mono">
                      <AlertCircle className="w-3 h-3" />
                      <span>Advanced</span>
                    </span>
                  )}
                  {item.status === "RUMOR" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-pitch-800 text-slate-400 border border-pitch-700 rounded font-mono">
                      <HelpCircle className="w-3 h-3" />
                      <span>Rumor</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
