"use client";

import React, { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  ShieldAlert,
  FileText,
  Sliders,
  RefreshCw,
  Eye,
  Lock,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FinanceConsoleProps {
  initialOverview: any;
  initialWithdrawals: any[];
  initialPayouts: any[];
  initialFraudSignals: any[];
  initialAuditLogs: any[];
}

export function FinanceConsole({
  initialOverview,
  initialWithdrawals,
  initialPayouts,
  initialFraudSignals,
  initialAuditLogs,
}: FinanceConsoleProps) {
  const [overview, setOverview] = useState(initialOverview);
  const [withdrawals, setWithdrawals] = useState(initialWithdrawals);
  const [payouts, setPayouts] = useState(initialPayouts);
  const [fraudSignals, setFraudSignals] = useState(initialFraudSignals);
  const [auditLogs, setAuditLogs] = useState(initialAuditLogs);

  const [activeTab, setActiveTab] = useState<
    "withdrawals" | "payouts" | "fraud" | "audit" | "adjustments"
  >("withdrawals");

  // Rejection Modal
  const [rejectingWithdrawalId, setRejectingWithdrawalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Approval Loading State
  const [processingWithdrawalId, setProcessingWithdrawalId] = useState<string | null>(null);
  const [processingPayoutId, setProcessingPayoutId] = useState<string | null>(null);

  // Fraud Resolution Modal
  const [resolvingSignalId, setResolvingSignalId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isResolvingSignal, setIsResolvingSignal] = useState(false);

  // Adjustment Modal
  const [adjustmentWalletId, setAdjustmentWalletId] = useState("");
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<"CREDIT" | "DEBIT" | "ADJUSTMENT" | "REVERSAL">("ADJUSTMENT");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [isSubmittingAdjustment, setIsSubmittingAdjustment] = useState(false);

  // Helpers
  const formatMYR = (minor: number) => {
    return `RM ${(minor / 100).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const refreshData = async () => {
    try {
      const [overRes, withRes, payRes, fraudRes, logRes] = await Promise.all([
        fetch("/api/admin/finance/overview").then((r) => r.json()),
        fetch("/api/admin/finance/withdrawals").then((r) => r.json()),
        fetch("/api/admin/finance/withdrawals?status=APPROVED").then((r) => r.json()),
        fetch("/api/admin/finance/fraud-signals").then((r) => r.json()),
        fetch("/api/admin/finance/audit-logs").then((r) => r.json()),
      ]);

      if (overRes.overview) setOverview(overRes.overview);
      if (withRes.withdrawals) setWithdrawals(withRes.withdrawals);
      if (payRes.withdrawals) setPayouts(payRes.withdrawals);
      if (fraudRes.signals) setFraudSignals(fraudRes.signals);
      if (logRes.logs) setAuditLogs(logRes.logs);
    } catch (err) {
      console.warn("Failed to refresh finance console:", err);
    }
  };

  const handleApproveWithdrawal = async (id: string) => {
    setActionError("");
    setActionSuccess("");
    setProcessingWithdrawalId(id);

    try {
      const res = await fetch(`/api/admin/finance/withdrawals/${id}/approve`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Approval failed");

      setActionSuccess("Withdrawal approved and queued for disbursement.");
      await refreshData();
    } catch (err: any) {
      setActionError(err.message || "Failed to approve withdrawal");
    } finally {
      setProcessingWithdrawalId(null);
    }
  };

  const handleRejectWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingWithdrawalId || !rejectReason.trim()) return;

    setActionError("");
    setActionSuccess("");
    setIsRejecting(true);

    try {
      const res = await fetch(`/api/admin/finance/withdrawals/${rejectingWithdrawalId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rejection failed");

      setActionSuccess("Withdrawal rejected. Funds released back to contributor.");
      setRejectingWithdrawalId(null);
      setRejectReason("");
      await refreshData();
    } catch (err: any) {
      setActionError(err.message || "Failed to reject withdrawal");
    } finally {
      setIsRejecting(false);
    }
  };

  const handleProcessPayout = async (payoutId: string) => {
    setActionError("");
    setActionSuccess("");
    setProcessingPayoutId(payoutId);

    try {
      const res = await fetch(`/api/admin/finance/payouts/${payoutId}/process`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payout disbursement failed");

      setActionSuccess("Payout disbursed successfully via provider.");
      await refreshData();
    } catch (err: any) {
      setActionError(err.message || "Disbursement failed");
    } finally {
      setProcessingPayoutId(null);
    }
  };

  const handleResolveSignal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingSignalId || !resolutionNotes.trim()) return;

    setActionError("");
    setActionSuccess("");
    setIsResolvingSignal(true);

    try {
      const res = await fetch("/api/admin/finance/fraud-signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signalId: resolvingSignalId,
          resolutionNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resolve signal");

      setActionSuccess("Fraud signal marked resolved.");
      setResolvingSignalId(null);
      setResolutionNotes("");
      await refreshData();
    } catch (err: any) {
      setActionError(err.message || "Failed to resolve signal");
    } finally {
      setIsResolvingSignal(false);
    }
  };

  const handleAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError("");
    setActionSuccess("");

    const amountFloat = parseFloat(adjustmentAmount);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      setActionError("Please specify a valid positive amount.");
      return;
    }

    if (!adjustmentWalletId.trim() || !adjustmentReason.trim() || adjustmentReason.length < 10) {
      setActionError("Wallet ID and a minimum 10-character reason are required.");
      return;
    }

    setIsSubmittingAdjustment(true);
    try {
      const res = await fetch("/api/admin/finance/adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletId: adjustmentWalletId.trim(),
          amountMinor: Math.round(amountFloat * 100),
          type: adjustmentType,
          reason: adjustmentReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Adjustment failed");

      setActionSuccess("Adjustment applied and logged successfully.");
      setAdjustmentAmount("");
      setAdjustmentReason("");
      setAdjustmentWalletId("");
      await refreshData();
    } catch (err: any) {
      setActionError(err.message || "Failed to apply adjustment");
    } finally {
      setIsSubmittingAdjustment(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-pitch-surface/90 border border-pitch-border rounded-xl p-4">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
            Total Rewards Finalized
          </span>
          <div className="text-xl font-extrabold text-foreground mt-1">
            {formatMYR(overview?.totalFinalizedRewardsMinor || 0)}
          </div>
          <span className="text-[10px] text-muted-foreground block mt-1">
            {overview?.totalFinalizedRewardsCount || 0} articles
          </span>
        </div>

        <div className="bg-pitch-surface/90 border border-pitch-border rounded-xl p-4">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
            Wallet Liabilities
          </span>
          <div className="text-xl font-extrabold text-amber-400 mt-1">
            {formatMYR(overview?.totalWalletLiabilityMinor || 0)}
          </div>
          <span className="text-[10px] text-muted-foreground block mt-1">
            Available: {formatMYR(overview?.totalAvailableLiabilityMinor || 0)}
          </span>
        </div>

        <div className="bg-pitch-surface/90 border border-pitch-border rounded-xl p-4">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
            Pending Withdrawals
          </span>
          <div className="text-xl font-extrabold text-blue-400 mt-1">
            {overview?.pendingWithdrawalsCount || 0}
          </div>
          <span className="text-[10px] text-muted-foreground block mt-1">
            {formatMYR(overview?.pendingWithdrawalsAmountMinor || 0)}
          </span>
        </div>

        <div className="bg-pitch-surface/90 border border-pitch-border rounded-xl p-4">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
            Processing Payouts
          </span>
          <div className="text-xl font-extrabold text-purple-400 mt-1">
            {overview?.processingPayoutsCount || 0}
          </div>
          <span className="text-[10px] text-muted-foreground block mt-1">In flight at provider</span>
        </div>

        <div className="bg-pitch-surface/90 border border-pitch-border rounded-xl p-4">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
            Total Disbursed
          </span>
          <div className="text-xl font-extrabold text-emerald-400 mt-1">
            {formatMYR(overview?.totalPaidOutMinor || 0)}
          </div>
          <span className="text-[10px] text-muted-foreground block mt-1">
            {overview?.totalPaidOutCount || 0} payouts completed
          </span>
        </div>

        <div className="bg-pitch-surface/90 border border-pitch-border rounded-xl p-4">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
            Active Fraud Alerts
          </span>
          <div
            className={cn(
              "text-xl font-extrabold mt-1",
              (overview?.activeFraudSignalsCount || 0) > 0 ? "text-red-400" : "text-muted-foreground"
            )}
          >
            {overview?.activeFraudSignalsCount || 0}
          </div>
          <span className="text-[10px] text-muted-foreground block mt-1">Signals flagged</span>
        </div>
      </div>

      {/* Global Alerts */}
      {actionError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-400 flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError("")} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
      )}

      {actionSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-xs text-emerald-400 flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess("")} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-pitch-border gap-6">
        <button
          onClick={() => setActiveTab("withdrawals")}
          className={cn(
            "pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-2",
            activeTab === "withdrawals"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Clock className="w-4 h-4" />
          Withdrawal Requests ({withdrawals.length})
        </button>
        <button
          onClick={() => setActiveTab("fraud")}
          className={cn(
            "pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-2",
            activeTab === "fraud"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <ShieldAlert className="w-4 h-4" />
          Fraud & Risk Monitor ({fraudSignals.length})
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={cn(
            "pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-2",
            activeTab === "audit"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <FileText className="w-4 h-4" />
          Financial Audit Trail ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab("adjustments")}
          className={cn(
            "pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-2",
            activeTab === "adjustments"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Sliders className="w-4 h-4" />
          Manual Adjustments
        </button>
      </div>

      {/* TAB 1: WITHDRAWALS & PAYOUTS */}
      {activeTab === "withdrawals" && (
        <div className="space-y-4">
          {withdrawals.length === 0 ? (
            <div className="bg-pitch-surface border border-pitch-border rounded-xl p-8 text-center text-muted-foreground text-sm">
              No withdrawal requests recorded.
            </div>
          ) : (
            <div className="overflow-x-auto border border-pitch-border rounded-xl bg-pitch-surface">
              <table className="w-full text-left text-xs">
                <thead className="bg-pitch-border/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-pitch-border">
                  <tr>
                    <th className="p-3.5">Contributor</th>
                    <th className="p-3.5">Bank Details</th>
                    <th className="p-3.5">Requested At</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Amount</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pitch-border/60">
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-pitch-border/20 transition-colors">
                      <td className="p-3.5">
                        <div className="font-semibold text-foreground">
                          {w.contributorProfile?.displayName || "Unknown Author"}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {w.contributorProfile?.user?.email}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-medium text-foreground">
                          {w.bankName} • {w.accountNumberMasked}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {w.accountHolderName}
                        </div>
                      </td>
                      <td className="p-3.5 text-muted-foreground whitespace-nowrap">
                        {new Date(w.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                            w.status === "PAID"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : w.status === "APPROVED" || w.status === "PROCESSING"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                              : w.status === "REJECTED"
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          )}
                        >
                          {w.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-extrabold text-foreground whitespace-nowrap">
                        {formatMYR(w.amountMinor)}
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        {w.status === "PENDING_REVIEW" && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApproveWithdrawal(w.id)}
                              disabled={processingWithdrawalId === w.id}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-[11px] transition-colors flex items-center gap-1"
                            >
                              {processingWithdrawalId === w.id && (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectingWithdrawalId(w.id)}
                              className="px-3 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded font-medium text-[11px] transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        {w.status === "APPROVED" && w.payout && (
                          <button
                            onClick={() => handleProcessPayout(w.payout.id)}
                            disabled={processingPayoutId === w.payout.id}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded font-medium text-[11px] transition-colors flex items-center gap-1"
                          >
                            {processingPayoutId === w.payout.id && (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            )}
                            Disburse Funds
                          </button>
                        )}

                        {w.status === "PAID" && (
                          <span className="text-[11px] text-emerald-400 font-medium">Disbursed</span>
                        )}

                        {w.status === "REJECTED" && (
                          <span className="text-[11px] text-red-400 font-medium">Rejected</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FRAUD SIGNALS & RISK MONITOR */}
      {activeTab === "fraud" && (
        <div className="space-y-4">
          {fraudSignals.length === 0 ? (
            <div className="bg-pitch-surface border border-pitch-border rounded-xl p-8 text-center text-muted-foreground text-sm">
              Zero active fraud signals. All contributor view velocity and accounts are normal.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {fraudSignals.map((sig) => (
                <div
                  key={sig.id}
                  className="bg-pitch-surface border border-pitch-border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">
                        {sig.contributorProfile?.displayName}
                      </span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                          sig.severity === "CRITICAL"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : sig.severity === "HIGH"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-blue-500/20 text-blue-400"
                        )}
                      >
                        {sig.severity} (Score: {sig.riskScore})
                      </span>
                      <span className="text-[11px] text-muted-foreground uppercase font-mono">
                        {sig.signalType}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground">Evidence: {sig.evidence}</p>
                    <p className="text-[10px] text-slate-500">
                      Logged at {new Date(sig.createdAt).toLocaleString()}
                      {sig.isResolved && ` • Resolved: ${sig.resolutionNotes}`}
                    </p>
                  </div>

                  <div>
                    {!sig.isResolved ? (
                      <button
                        onClick={() => setResolvingSignalId(sig.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-pitch-border hover:bg-pitch-border/80 text-xs font-semibold text-foreground transition-colors"
                      >
                        Resolve Signal
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Resolved
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FINANCIAL AUDIT TRAIL */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          <div className="overflow-x-auto border border-pitch-border rounded-xl bg-pitch-surface">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-pitch-border/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-pitch-border">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Entity</th>
                  <th className="p-3">Actor</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Reason / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pitch-border/60">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-pitch-border/20 transition-colors">
                    <td className="p-3 whitespace-nowrap text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded bg-pitch-border/50 text-[10px] font-bold text-foreground">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap text-slate-300">
                      {log.entityType} ({log.entityId.slice(0, 8)}...)
                    </td>
                    <td className="p-3 whitespace-nowrap text-muted-foreground">
                      {log.actorId ? `${log.actorId.slice(0, 8)}...` : "SYSTEM"}
                    </td>
                    <td className="p-3 whitespace-nowrap font-bold text-emerald-400">
                      {log.amountMinor ? formatMYR(log.amountMinor) : "-"}
                    </td>
                    <td className="p-3 text-muted-foreground max-w-sm truncate">
                      {log.reason || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: MANUAL ADJUSTMENTS */}
      {activeTab === "adjustments" && (
        <div className="max-w-xl bg-pitch-surface border border-pitch-border rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="font-bold text-foreground text-sm">Administrative Wallet Adjustment</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Apply a controlled balance adjustment. Every transaction creates an immutable double-entry ledger record and audit log.
            </p>
          </div>

          <form onSubmit={handleAdjustmentSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Target Wallet ID
              </label>
              <input
                type="text"
                value={adjustmentWalletId}
                onChange={(e) => setAdjustmentWalletId(e.target.value)}
                placeholder="e.g. clxxxxx..."
                required
                className="w-full bg-pitch-border/40 border border-pitch-border rounded-lg px-3 py-2 text-xs text-foreground font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Type
                </label>
                <select
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value as any)}
                  className="w-full bg-pitch-border/40 border border-pitch-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-emerald-500"
                >
                  <option value="ADJUSTMENT">ADJUSTMENT (Credit)</option>
                  <option value="DEBIT">DEBIT (Deduction)</option>
                  <option value="REVERSAL">REVERSAL</option>
                  <option value="CREDIT">DIRECT CREDIT</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Amount (MYR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(e.target.value)}
                  placeholder="10.00"
                  required
                  className="w-full bg-pitch-border/40 border border-pitch-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Administrative Justification (Min 10 chars)
              </label>
              <textarea
                rows={3}
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                placeholder="Provide specific business justification for this balance adjustment..."
                required
                className="w-full bg-pitch-border/40 border border-pitch-border rounded-lg p-3 text-xs text-foreground focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmittingAdjustment}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                {isSubmittingAdjustment && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Apply & Record Adjustment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectingWithdrawalId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-pitch-surface border border-pitch-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-foreground text-sm">Reject Withdrawal Request</h3>
            <p className="text-xs text-muted-foreground">
              Rejecting this request will immediately release all held funds back to the contributor&apos;s available wallet balance.
            </p>

            <form onSubmit={handleRejectWithdrawal} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Rejection Justification (Min 5 chars)
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Account name mismatch, suspicious activity flagged..."
                  required
                  className="w-full bg-pitch-border/40 border border-pitch-border rounded-lg p-3 text-xs text-foreground focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingWithdrawalId(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-pitch-border/60 hover:bg-pitch-border text-muted-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRejecting}
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors flex items-center gap-1.5"
                >
                  {isRejecting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Confirm Rejection & Release Funds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESOLVE FRAUD SIGNAL MODAL */}
      {resolvingSignalId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-pitch-surface border border-pitch-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-foreground text-sm">Resolve Fraud Signal</h3>
            <p className="text-xs text-muted-foreground">
              Provide resolution notes to confirm verification and unfreeze contributor risk restrictions.
            </p>

            <form onSubmit={handleResolveSignal} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Resolution Notes (Min 5 chars)
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Traffic logs inspected and verified as authentic social media referral..."
                  required
                  className="w-full bg-pitch-border/40 border border-pitch-border rounded-lg p-3 text-xs text-foreground focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResolvingSignalId(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-pitch-border/60 hover:bg-pitch-border text-muted-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResolvingSignal}
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5"
                >
                  {isResolvingSignal && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
