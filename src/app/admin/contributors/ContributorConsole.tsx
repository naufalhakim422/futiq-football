"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  ShieldCheck,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Lock,
  Unlock,
  Coins,
  FileText,
  Clock,
  Sparkles,
  RefreshCw,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ContributorItem {
  id: string;
  userId: string;
  fullName: string;
  displayName: string;
  email: string;
  country: string;
  status: "ACTIVE" | "SUSPENDED" | "BANNED" | "REJECTED";
  overallTrustScore: number;
  qualityScore: number;
  articlesCount: number;
  availableBalanceMinor: number;
  isWithdrawalBlocked: boolean;
  isUserActive: boolean;
  createdAt: string | Date;
}

interface ContributorConsoleProps {
  initialContributors: ContributorItem[];
}

export function ContributorConsole({ initialContributors }: ContributorConsoleProps) {
  const [contributors, setContributors] = useState<ContributorItem[]>(initialContributors);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Moderation Modal State
  const [selectedContributor, setSelectedContributor] = useState<ContributorItem | null>(null);
  const [targetAction, setTargetAction] = useState<"ACTIVE" | "SUSPENDED" | "BANNED" | "FREEZE_WALLET" | "UNFREEZE_WALLET" | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const formatMYR = (minor: number) => {
    return `RM ${(minor / 100).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Filtered list
  const filtered = contributors.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.displayName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      c.status === statusFilter ||
      (statusFilter === "WALLET_FROZEN" && c.isWithdrawalBlocked);

    return matchesSearch && matchesStatus;
  });

  const activeCount = contributors.filter((c) => c.status === "ACTIVE").length;
  const suspendedCount = contributors.filter((c) => c.status === "SUSPENDED").length;
  const bannedCount = contributors.filter((c) => c.status === "BANNED").length;
  const frozenWalletCount = contributors.filter((c) => c.isWithdrawalBlocked).length;

  const openActionModal = (
    contributor: ContributorItem,
    action: "ACTIVE" | "SUSPENDED" | "BANNED" | "FREEZE_WALLET" | "UNFREEZE_WALLET"
  ) => {
    setSelectedContributor(contributor);
    setTargetAction(action);
    setActionReason(
      action === "SUSPENDED"
        ? "Pelanggaran pedoman redaksi / investigasi tayangan bot."
        : action === "BANNED"
        ? "Pelanggaran hak cipta berat atau penipuan finansial berulang."
        : action === "ACTIVE"
        ? "Verifikasi kepatuhan selesai, akun dipulihkan."
        : action === "FREEZE_WALLET"
        ? "Penahanan sementara pencairan dana untuk verifikasi audit."
        : "Pemeriksaan saldo selesai, dompet dibuka kembali."
    );
    setFeedbackMessage(null);
  };

  const handleConfirmAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContributor || !targetAction) return;

    setIsSubmitting(true);
    setFeedbackMessage(null);

    try {
      const payload: any = { reason: actionReason };
      if (["ACTIVE", "SUSPENDED", "BANNED"].includes(targetAction)) {
        payload.status = targetAction;
      }
      if (targetAction === "FREEZE_WALLET") {
        payload.isWithdrawalBlocked = true;
      }
      if (targetAction === "UNFREEZE_WALLET") {
        payload.isWithdrawalBlocked = false;
      }

      const res = await fetch(`/api/admin/contributors/${selectedContributor.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal memperbarui status kontributor.");
      }

      // Update local state smoothly
      setContributors((prev) =>
        prev.map((c) => {
          if (c.id === selectedContributor.id) {
            return {
              ...c,
              status: (payload.status as any) || c.status,
              isWithdrawalBlocked:
                typeof payload.isWithdrawalBlocked === "boolean"
                  ? payload.isWithdrawalBlocked
                  : c.isWithdrawalBlocked,
              isUserActive: payload.status === "BANNED" ? false : c.isUserActive,
            };
          }
          return c;
        })
      );

      setFeedbackMessage({
        type: "success",
        text: `Tindakan berhasil! Akun ${selectedContributor.fullName} telah diperbarui.`,
      });

      setTimeout(() => {
        setSelectedContributor(null);
        setTargetAction(null);
      }, 1200);
    } catch (err: any) {
      setFeedbackMessage({
        type: "error",
        text: err.message || "Terjadi kesalahan sistem saat memperbarui status.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Stat Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-pitch-900 border border-pitch-800 p-4 rounded-xl space-y-1 shadow-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Total Penulis</span>
            <Users className="w-4 h-4 text-brand-green" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-100">{contributors.length}</div>
          <p className="text-[10px] text-slate-500">Terdaftar di Meja Redaksi</p>
        </div>

        <div className="bg-pitch-900 border border-pitch-800 p-4 rounded-xl space-y-1 shadow-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Aktif (Normal)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-400">{activeCount}</div>
          <p className="text-[10px] text-slate-500">Akses menulis & royalti penuh</p>
        </div>

        <div className="bg-pitch-900 border border-pitch-800 p-4 rounded-xl space-y-1 shadow-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Ditangguhkan</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-400">{suspendedCount}</div>
          <p className="text-[10px] text-slate-500">Suspended sementara</p>
        </div>

        <div className="bg-pitch-900 border border-pitch-800 p-4 rounded-xl space-y-1 shadow-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Diblokir (Banned)</span>
            <Ban className="w-4 h-4 text-brand-red" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-brand-red">{bannedCount}</div>
          <p className="text-[10px] text-slate-500">Akses dicabut permanen</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-pitch-900 border border-pitch-800 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, email, atau byline..."
            className="w-full bg-pitch-950 border border-pitch-750 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#c3ff00] placeholder:text-slate-500 transition-all font-sans"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto font-mono text-[11px]">
          {[
            { id: "ALL", label: `Semua (${contributors.length})` },
            { id: "ACTIVE", label: `Aktif (${activeCount})` },
            { id: "SUSPENDED", label: `Suspended (${suspendedCount})` },
            { id: "BANNED", label: `Banned (${bannedCount})` },
            { id: "WALLET_FROZEN", label: `Dompet Beku (${frozenWalletCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-all",
                statusFilter === tab.id
                  ? "bg-[#c3ff00] text-slate-950 shadow-md"
                  : "bg-pitch-950 text-slate-400 hover:text-slate-200 border border-pitch-800"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contributors Table */}
      <div className="bg-pitch-900 border border-pitch-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-pitch-950/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-pitch-800">
              <tr>
                <th className="p-4">Kontributor & Penulis</th>
                <th className="p-4">Status Akun</th>
                <th className="p-4">Skor Integritas AI</th>
                <th className="p-4">Artikel</th>
                <th className="p-4">Saldo Dompet</th>
                <th className="p-4 text-right">Aksi Moderasi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pitch-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-mono">
                    Tidak ada kontributor yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const isSuspended = c.status === "SUSPENDED";
                  const isBanned = c.status === "BANNED";
                  const isActive = c.status === "ACTIVE";

                  return (
                    <tr key={c.id} className="hover:bg-pitch-850/40 transition-colors">
                      {/* Name & Identity */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-pitch-950 border border-pitch-750 flex items-center justify-center font-bold text-slate-200 font-mono text-xs">
                            {c.fullName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-100 font-sans flex items-center gap-1.5">
                              <span>{c.fullName}</span>
                              {c.displayName !== c.fullName && (
                                <span className="text-[10px] text-slate-400 font-normal">
                                  ({c.displayName})
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {c.email} • <span className="text-slate-500">{c.country}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Account Status Badge */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider",
                              isActive && "bg-emerald-950/80 text-emerald-400 border border-emerald-800/80",
                              isSuspended && "bg-amber-950/80 text-amber-400 border border-amber-800/80",
                              isBanned && "bg-red-950/80 text-red-400 border border-red-800/80"
                            )}
                          >
                            {isActive && <CheckCircle2 className="w-3 h-3" />}
                            {isSuspended && <AlertTriangle className="w-3 h-3" />}
                            {isBanned && <Ban className="w-3 h-3" />}
                            <span>{c.status}</span>
                          </span>

                          {c.isWithdrawalBlocked && (
                            <div className="text-[9px] font-mono text-amber-400 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              <span>Dompet Dibekukan</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Trust & Quality Score */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 font-mono text-[10px]">Trust:</span>
                            <span
                              className={cn(
                                "font-mono font-bold text-xs",
                                c.overallTrustScore >= 80 ? "text-emerald-400" : c.overallTrustScore >= 60 ? "text-amber-400" : "text-red-400"
                              )}
                            >
                              {c.overallTrustScore.toFixed(1)}/100
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500 font-mono text-[10px]">Quality:</span>
                            <span className="font-mono text-slate-300 text-xs">
                              {c.qualityScore.toFixed(1)}/100
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Articles Count */}
                      <td className="p-4 whitespace-nowrap font-mono">
                        <div className="flex items-center gap-1.5 text-slate-200">
                          <FileText className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="font-bold">{c.articlesCount}</span>
                          <span className="text-slate-500 text-[10px]">naskah</span>
                        </div>
                      </td>

                      {/* Wallet Balance */}
                      <td className="p-4 whitespace-nowrap font-mono">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-100">
                            {formatMYR(c.availableBalanceMinor)}
                          </span>
                          <span className="text-[10px] text-slate-500 block">Saldo Tersedia</span>
                        </div>
                      </td>

                      {/* Action Buttons (1-Click Moderation) */}
                      <td className="p-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {isActive && (
                            <>
                              <button
                                onClick={() => openActionModal(c, "SUSPENDED")}
                                className="px-2.5 py-1.5 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800/80 rounded text-[11px] font-bold font-mono inline-flex items-center gap-1 transition-colors"
                                title="Tangguhkan hak menulis sementara"
                              >
                                <AlertTriangle className="w-3 h-3" />
                                <span>Suspend</span>
                              </button>

                              <button
                                onClick={() => openActionModal(c, "BANNED")}
                                className="px-2.5 py-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/80 rounded text-[11px] font-bold font-mono inline-flex items-center gap-1 transition-colors"
                                title="Blokir permanen dari sistem"
                              >
                                <Ban className="w-3 h-3" />
                                <span>Ban</span>
                              </button>
                            </>
                          )}

                          {isSuspended && (
                            <>
                              <button
                                onClick={() => openActionModal(c, "ACTIVE")}
                                className="px-2.5 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/80 rounded text-[11px] font-bold font-mono inline-flex items-center gap-1 transition-colors"
                                title="Pulihkan kembali akun menjadi aktif"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Aktifkan</span>
                              </button>

                              <button
                                onClick={() => openActionModal(c, "BANNED")}
                                className="px-2.5 py-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/80 rounded text-[11px] font-bold font-mono inline-flex items-center gap-1 transition-colors"
                              >
                                <Ban className="w-3 h-3" />
                                <span>Ban</span>
                              </button>
                            </>
                          )}

                          {isBanned && (
                            <button
                              onClick={() => openActionModal(c, "ACTIVE")}
                              className="px-2.5 py-1.5 bg-pitch-850 hover:bg-pitch-800 text-slate-300 border border-pitch-750 rounded text-[11px] font-bold font-mono inline-flex items-center gap-1 transition-colors"
                              title="Buka blokir permanen (Unban)"
                            >
                              <Unlock className="w-3 h-3 text-[#c3ff00]" />
                              <span>Unban Akun</span>
                            </button>
                          )}

                          {/* Wallet Freeze Toggle */}
                          {c.isWithdrawalBlocked ? (
                            <button
                              onClick={() => openActionModal(c, "UNFREEZE_WALLET")}
                              className="p-1.5 bg-pitch-850 hover:bg-pitch-800 text-emerald-400 border border-pitch-750 rounded text-[11px]"
                              title="Buka Pembekuan Dompet"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => openActionModal(c, "FREEZE_WALLET")}
                              className="p-1.5 bg-pitch-850 hover:bg-pitch-800 text-slate-400 hover:text-amber-400 border border-pitch-750 rounded text-[11px]"
                              title="Bekukan Penarikan Dompet"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRMATION ACTION MODAL */}
      {selectedContributor && targetAction && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-pitch-900 border border-pitch-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-pitch-800">
              <div className="flex items-center gap-2">
                {targetAction === "SUSPENDED" && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                {targetAction === "BANNED" && <Ban className="w-5 h-5 text-brand-red" />}
                {targetAction === "ACTIVE" && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {targetAction === "FREEZE_WALLET" && <Lock className="w-5 h-5 text-amber-400" />}
                {targetAction === "UNFREEZE_WALLET" && <Unlock className="w-5 h-5 text-emerald-400" />}
                <h3 className="font-bold text-slate-100 text-sm font-sans">
                  Konfirmasi Tindakan Moderasi
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedContributor(null);
                  setTargetAction(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-pitch-800"
              >
                ✕
              </button>
            </div>

            {/* Target Contributor Card */}
            <div className="p-3 bg-pitch-950 border border-pitch-800 rounded-lg space-y-1">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Target Kontributor</span>
              <div className="font-bold text-slate-100 text-sm">{selectedContributor.fullName}</div>
              <div className="text-[11px] text-slate-400 font-mono">{selectedContributor.email}</div>
            </div>

            {/* Action Statement */}
            <div
              className={cn(
                "p-3 rounded-lg border font-sans text-xs leading-relaxed",
                targetAction === "SUSPENDED" && "bg-amber-950/20 border-amber-800/50 text-amber-200",
                targetAction === "BANNED" && "bg-red-950/20 border-red-800/50 text-red-200",
                targetAction === "ACTIVE" && "bg-emerald-950/20 border-emerald-800/50 text-emerald-200",
                (targetAction === "FREEZE_WALLET" || targetAction === "UNFREEZE_WALLET") &&
                  "bg-pitch-950 border-pitch-750 text-slate-300"
              )}
            >
              {targetAction === "SUSPENDED" &&
                "Menangguhkan kontributor akan memblokir hak membuat naskah baru dan menahan pencairan dana sementara waktu."}
              {targetAction === "BANNED" &&
                "Memblokir kontributor (BAN) akan menutup akses akun secara permanen, mencabut sesi login, dan membekukan seluruh saldo."}
              {targetAction === "ACTIVE" &&
                "Mengaktifkan kontributor akan memulihkan hak menulis artikel dan akses penuh ke Meja Kontributor."}
              {targetAction === "FREEZE_WALLET" &&
                "Membekukan dompet akan mencegah kontributor melakukan permohonan penarikan dana."}
              {targetAction === "UNFREEZE_WALLET" &&
                "Membuka kembali dompet agar kontributor dapat melakukan permohonan penarikan dana seperti biasa."}
            </div>

            {feedbackMessage && (
              <div
                className={cn(
                  "p-3 rounded-lg text-xs font-mono border",
                  feedbackMessage.type === "success"
                    ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                    : "bg-red-950/40 border-red-800 text-red-300"
                )}
              >
                {feedbackMessage.text}
              </div>
            )}

            {/* Form & Justification Input */}
            <form onSubmit={handleConfirmAction} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 block">
                  Alasan Tindakan (Dicatat ke Log Audit) *
                </label>
                <textarea
                  rows={3}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  required
                  placeholder="Tuliskan catatan alasan tindakan administratif..."
                  className="w-full bg-pitch-950 border border-pitch-750 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-[#c3ff00] text-xs font-sans placeholder:text-slate-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedContributor(null);
                    setTargetAction(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-pitch-850 hover:bg-pitch-800 text-slate-300 border border-pitch-750 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 shadow-lg disabled:opacity-50",
                    targetAction === "BANNED" && "bg-brand-red hover:bg-red-600 text-white",
                    targetAction === "SUSPENDED" && "bg-amber-500 hover:bg-amber-400 text-slate-950",
                    (targetAction === "ACTIVE" || targetAction === "UNFREEZE_WALLET") &&
                      "bg-[#c3ff00] hover:bg-[#b0e600] text-slate-950",
                    targetAction === "FREEZE_WALLET" && "bg-amber-500 hover:bg-amber-400 text-slate-950"
                  )}
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Eksekusi Tindakan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
