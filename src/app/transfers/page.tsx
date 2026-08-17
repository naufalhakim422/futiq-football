import React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

interface TransferItem {
  id: string;
  playerName: string;
  position: string;
  fromTeam: string;
  toTeam: string;
  fee: string;
  status: "CONFIRMED" | "RUMOR" | "ADVANCED";
  date: string;
}

const TRANSFERS_DATA: TransferItem[] = [
  {
    id: "tr-1",
    playerName: "Kylian Mbappé",
    position: "Forward",
    fromTeam: "Paris Saint-Germain",
    toTeam: "Real Madrid",
    fee: "Free Transfer",
    status: "CONFIRMED",
    date: "Aug 17, 2026",
  },
  {
    id: "tr-2",
    playerName: "Joshua Kimmich",
    position: "Midfielder",
    fromTeam: "Bayern Munich",
    toTeam: "Manchester City",
    fee: "€55.0M",
    status: "ADVANCED",
    date: "Aug 17, 2026",
  },
  {
    id: "tr-3",
    playerName: "Victor Osimhen",
    position: "Striker",
    fromTeam: "Napoli",
    toTeam: "Chelsea",
    fee: "€95.0M",
    status: "RUMOR",
    date: "Aug 16, 2026",
  },
];

export default function TransfersPage() {
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
            {TRANSFERS_DATA.map((item) => (
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
                      ({item.position})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                    <span className="text-slate-400">{item.fromTeam}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-brand-green" />
                    <span className="text-slate-100 font-semibold">{item.toTeam}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-right">
                    <div className="text-sm font-mono font-bold text-slate-100">
                      {item.fee}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {item.date}
                    </div>
                  </div>

                  {item.status === "CONFIRMED" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-brand-green/10 text-brand-green border border-brand-green/30 rounded">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Official</span>
                    </span>
                  )}
                  {item.status === "ADVANCED" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-brand-gold/10 text-brand-gold border border-brand-gold/30 rounded">
                      <AlertCircle className="w-3 h-3" />
                      <span>Advanced</span>
                    </span>
                  )}
                  {item.status === "RUMOR" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-pitch-800 text-slate-400 border border-pitch-700 rounded">
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
