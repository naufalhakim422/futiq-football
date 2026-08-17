"use client";

import React, { useState, useEffect } from "react";
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
  Zap,
  Scale,
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
  const [reconciliations, setReconciliations] = useState<any[]>([]);
  const [policy, setPolicy] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<
    "withdrawals" | "payouts" | "reconciliation" | "policy" | "fraud" | "audit" | "adjustments"
  >("withdrawals");

  // Rejection Modal
  const [rejectingWithdrawalId, setRejectingWithdrawalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Approval / Process Loading State
  const [processingWithdrawalId, setProcessingWithdrawalId] = useState<string | null>(null);
  const [processingPayoutId, setProcessingPayoutId] = useState<string | null>(null);
  const [retryingPayoutId, setRetryingPayoutId] = useState<string | null>(null);
  const [isRunningSweep, setIsRunningSweep] = useState(false);

  // Fraud Resolution Modal
  const [resolvingSignalId, setResolvingSignalId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isResolvingSignal, setIsResolvingSignal] = useState(false);

  // Policy Form State
  const [minWithdrawalMYR, setMinWithdrawalMYR] = useState("20.00");
  const [maxAutoMYR, setMaxAutoMYR] = useState("500.00");
  const [maxRiskScore, setMaxRiskScore] = useState("29");
  const [isAutoEnabled, setIsAutoEnabled] = useState(true);
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);

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

  useEffect(() => {
    fetchPolicy();
    fetchReconciliations();
  }, []);

  const fetchPolicy = async () => {
    try {
      const res = await fetch("/api/admin/finance/policy");
      const data = await res.json();
      if (data.policy) {
        setPolicy(data.policy);
        setMinWithdrawalMYR((data.policy.minimumWithdrawalMinor / 100).toFixed(2));
        setMaxAutoMYR((data.policy.maxAutomaticWithdrawalMinor / 100).toFixed(2));
        setMaxRiskScore(data.policy.autoPayoutMaxRiskScore.toString());
        setIsAutoEnabled(data.policy.isAutoPayoutEnabled);
      }
    } catch {}
  };

  const fetchReconciliations = async () => {
    try {
      const res = await fetch("/api/admin/finance/reconciliation");
      const data = await res.json();
      if (data.reconciliations) setReconciliations(data.reconciliations);
    } catch {}
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
      await fetchReconciliations();
      await fetchPolicy();
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

  const handleRetryPayout = async (payoutId: string) => {
    setActionError("");
    setActionSuccess("");
    setRetryingPayoutId(payoutId);

    try {
      const res = await fetch(`/api/admin/finance/payouts/${payoutId}/retry`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Retry failed");

      setActionSuccess("Payout retry processed successfully.");
      await refreshData();
    } catch (err: any) {
      setActionError(err.message || "Failed to retry payout");
    } finally {
      setRetryingPayoutId(null);
    }
  };

  const handleRunReconciliation = async () => {
    setActionError("");
    setActionSuccess("");
    setIsRunningSweep(true);

    try {
      const res = await fetch("/api/admin/finance/reconciliation", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reconciliation failed");

      setActionSuccess(data.message || "Reconciliation sweep finished.");
      await refreshData();
    } catch (err: any) {
      setActionError(err.message || "Failed to run reconciliation sweep");
    } finally {
      setIsRunningSweep(false);
    }
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError("");
    setActionSuccess("");
    setIsSavingPolicy(true);

    try {
      const res = await fetch("/api/admin/finance/policy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          minimumWithdrawalMinor: Math.round(parseFloat(minWithdrawalMYR) * 100),
          maxAutomaticWithdrawalMinor: Math.round(parseFloat(maxAutoMYR) * 100),
          autoPayoutMaxRiskScore: parseInt(maxRiskScore, 10),
          isAutoPayoutEnabled: isAutoEnabled,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update policy");

      setActionSuccess("Payout policy saved and active.");
      await fetchPolicy();
    } catch (err: any) {
      setActionError(err.message || "Failed to save policy");
    } finally {
      setIsSavingPolicy(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-pitch-900 border border-pitch-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Available Liab.</span>
            <DollarSign className="w-4 h-4 text-brand-green" />
          </div>
          <div className="text-xl font-extrabold text-slate-100 mt-2">
            {formatMYR(overview.totalAvailableLiabilitiesMinor)}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Active wallet balances</span>
        </div>

        <div className="bg-pitch-900 border border-pitch-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Held In Payout</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-amber-400 mt-2">
            {formatMYR(overview.totalHeldLiabilitiesMinor)}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Pending approval/transit</span>
        </div>

        <div className="bg-pitch-900 border border-pitch-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Lifetime Paid</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-emerald-400 mt-2">
            {formatMYR(overview.totalLifetimeWithdrawnMinor)}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Successfully disbursed</span>
        </div>

        <div className="bg-pitch-900 border border-pitch-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Pending Review</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-extrabold text-blue-400 mt-2">
            {overview.pendingWithdrawalsCount}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Withdrawals in queue</span>
        </div>

        <div className="bg-pitch-900 border border-pitch-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Fraud Signals</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-xl font-extrabold text-red-400 mt-2">
            {overview.unresolvedFraudSignalsCount}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Unresolved alerts</span>
        </div>

        <div className="bg-pitch-900 border border-pitch-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Auto-Pay Engine</span>
            <Zap className="w-4 h-4 text-pitch-gold" />
          </div>
          <div className="text-sm font-extrabold text-pitch-gold mt-2 flex items-center gap-1">
            {policy?.isAutoPayoutEnabled ? "ENABLED" : "PAUSED"}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Max Auto: {policy ? formatMYR(policy.maxAutomaticWithdrawalMinor) : "RM 500"}
          </span>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {actionError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-400 flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError("")} className="text-red-400 hover:text-red-300">✕</button>
        </div>
      )}

      {actionSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-xs text-emerald-400 flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess("")} className="text-emerald-400 hover:text-emerald-300">✕</button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-pitch-800 pb-3">
        <button
          onClick={() => setActiveTab("withdrawals")}
          className={cn(
            "px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5",
            activeTab === "withdrawals"
              ? "bg-brand-green text-slate-950"
              : "bg-pitch-900 text-slate-400 hover:text-slate-200"
          )}
        >
          <Clock className="w-3.5 h-3.5" />
          Withdrawals Queue ({withdrawals.length})
        </button>

        <button
          onClick={() => setActiveTab("payouts")}
          className={cn(
            "px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5",
            activeTab === "payouts"
              ? "bg-brand-green text-slate-950"
              : "bg-pitch-900 text-slate-400 hover:text-slate-200"
          )}
        >
          <Send className="w-3.5 h-3.5" />
          Disbursements & Retries
        </button>

        <button
          onClick={() => setActiveTab("reconciliation")}
          className={cn(
            "px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5",
            activeTab === "reconciliation"
              ? "bg-brand-green text-slate-950"
              : "bg-pitch-900 text-slate-400 hover:text-slate-200"
          )}
        >
          <Scale className="w-3.5 h-3.5" />
          Reconciliation ({reconciliations.length})
        </button>

        <button
          onClick={() => setActiveTab("policy")}
          className={cn(
            "px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5",
            activeTab === "policy"
              ? "bg-brand-green text-slate-950"
              : "bg-pitch-900 text-slate-400 hover:text-slate-200"
          )}
        >
          <Zap className="w-3.5 h-3.5" />
          Auto-Payout Policy
        </button>

        <button
          onClick={() => setActiveTab("fraud")}
          className={cn(
            "px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5",
            activeTab === "fraud"
              ? "bg-brand-green text-slate-950"
              : "bg-pitch-900 text-slate-400 hover:text-slate-200"
          )}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Fraud Signals ({fraudSignals.length})
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={cn(
            "px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5",
            activeTab === "audit"
              ? "bg-brand-green text-slate-950"
              : "bg-pitch-900 text-slate-400 hover:text-slate-200"
          )}
        >
          <FileText className="w-3.5 h-3.5" />
          Audit Trail
        </button>

        <button
          onClick={refreshData}
          className="ml-auto p-2 bg-pitch-900 hover:bg-pitch-800 text-slate-400 rounded-lg text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* TAB 1: WITHDRAWALS QUEUE */}
      {activeTab === "withdrawals" && (
        <div className="overflow-x-auto border border-pitch-800 rounded-xl bg-pitch-900">
          <table className="w-full text-left text-xs">
            <thead className="bg-pitch-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-pitch-800">
              <tr>
                <th className="p-3.5">ID / Date</th>
                <th className="p-3.5">Contributor</th>
                <th className="p-3.5">Bank / Account</th>
                <th className="p-3.5 text-right">Amount</th>
                <th className="p-3.5 text-right">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pitch-800/60">
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">
                    No active withdrawal requests in queue.
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-pitch-850/40 transition-colors">
                    <td className="p-3.5 font-mono text-[11px]">
                      <div className="text-slate-200 font-bold">{w.id.slice(0, 8)}...</div>
                      <div className="text-slate-500 text-[10px]">{new Date(w.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-100">{w.contributorProfile?.penName || "Contributor"}</div>
                      <div className="text-slate-500 text-[10px]">{w.contributorProfile?.user?.email}</div>
                    </td>
                    <td className="p-3.5 text-slate-300">
                      <div>{w.bankName}</div>
                      <div className="font-mono text-slate-500 text-[10px]">{w.accountNumberMasked}</div>
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-slate-100">{formatMYR(w.amountMinor)}</td>
                    <td className="p-3.5 text-right">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                          w.status === "PAID" || w.status === "AUTO_APPROVED"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : w.status === "MANUAL_REVIEW" || w.status === "PENDING_REVIEW"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        )}
                      >
                        {w.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      {w.status === "PENDING_REVIEW" || w.status === "MANUAL_REVIEW" ? (
                        <>
                          <button
                            onClick={() => handleApproveWithdrawal(w.id)}
                            disabled={processingWithdrawalId === w.id}
                            className="px-2.5 py-1 bg-brand-green text-slate-950 font-bold text-[10px] rounded hover:bg-brand-green-hover transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setRejectingWithdrawalId(w.id);
                              setRejectReason("");
                            }}
                            className="px-2.5 py-1 bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-[10px] rounded hover:bg-red-500/20 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: RECONCILIATION */}
      {activeTab === "reconciliation" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-pitch-900 border border-pitch-800 p-4 rounded-xl">
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Automated Payment Gateway Reconciliation</h3>
              <p className="text-xs text-slate-400">
                Audits internal platform ledger records against payout provider responses and flags mismatches.
              </p>
            </div>
            <button
              onClick={handleRunReconciliation}
              disabled={isRunningSweep}
              className="px-4 py-2 bg-pitch-gold text-slate-950 font-bold text-xs rounded-lg hover:bg-yellow-400 transition-colors flex items-center gap-1.5"
            >
              {isRunningSweep ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Scale className="w-3.5 h-3.5" />}
              Run Reconciliation Sweep
            </button>
          </div>

          <div className="overflow-x-auto border border-pitch-800 rounded-xl bg-pitch-900">
            <table className="w-full text-left text-xs">
              <thead className="bg-pitch-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-pitch-800">
                <tr>
                  <th className="p-3.5">Payout ID</th>
                  <th className="p-3.5">Provider</th>
                  <th className="p-3.5">Internal Status</th>
                  <th className="p-3.5">Provider Status</th>
                  <th className="p-3.5">Discrepancy Type</th>
                  <th className="p-3.5 text-right">Match Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pitch-800/60">
                {reconciliations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500">
                      All scanned transactions matched perfectly. No discrepancies detected.
                    </td>
                  </tr>
                ) : (
                  reconciliations.map((r) => (
                    <tr key={r.id} className="hover:bg-pitch-850/40 transition-colors">
                      <td className="p-3.5 font-mono text-slate-200">{r.payoutId?.slice(0, 10) || "N/A"}</td>
                      <td className="p-3.5 text-slate-400">{r.provider}</td>
                      <td className="p-3.5 font-mono font-bold text-slate-300">{r.internalStatus}</td>
                      <td className="p-3.5 font-mono text-slate-400">{r.providerStatus}</td>
                      <td className="p-3.5 text-amber-400">{r.discrepancyType || "None"}</td>
                      <td className="p-3.5 text-right">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                            r.isMatched ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                          )}
                        >
                          {r.isMatched ? "MATCHED" : "FLAGGED"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AUTO-PAYOUT POLICY */}
      {activeTab === "policy" && (
        <div className="bg-pitch-900 border border-pitch-800 rounded-xl p-6 max-w-2xl space-y-4">
          <div>
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-pitch-gold" />
              Automatic Payout & Threshold Configuration
            </h3>
            <p className="text-xs text-slate-400">
              Control automated disbursement thresholds, minimum withdrawal limits, and fraud risk score ceilings.
            </p>
          </div>

          <form onSubmit={handleSavePolicy} className="space-y-4 pt-2">
            <div className="flex items-center justify-between p-3 bg-pitch-950 border border-pitch-800 rounded-lg">
              <div>
                <span className="font-bold text-xs text-slate-200 block">Automatic Payout Engine</span>
                <span className="text-[11px] text-slate-400">
                  When enabled, verified low-risk withdrawals within the limit are paid instantly without manual intervention.
                </span>
              </div>
              <input
                type="checkbox"
                checked={isAutoEnabled}
                onChange={(e) => setIsAutoEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-brand-green bg-pitch-850"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Minimum Withdrawal (MYR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={minWithdrawalMYR}
                  onChange={(e) => setMinWithdrawalMYR(e.target.value)}
                  className="w-full bg-pitch-950 border border-pitch-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-green"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Max Auto-Disbursement Limit (MYR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={maxAutoMYR}
                  onChange={(e) => setMaxAutoMYR(e.target.value)}
                  className="w-full bg-pitch-950 border border-pitch-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-green"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                Max Allowed Risk Score for Auto-Pay (0–40)
              </label>
              <input
                type="number"
                min="0"
                max="40"
                value={maxRiskScore}
                onChange={(e) => setMaxRiskScore(e.target.value)}
                className="w-full bg-pitch-950 border border-pitch-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-green"
                required
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Withdrawals with risk scores above this threshold are automatically routed to Manual Finance Review.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSavingPolicy}
                className="px-5 py-2 bg-brand-green text-slate-950 font-bold text-xs rounded-lg hover:bg-brand-green-hover transition-colors flex items-center gap-1.5"
              >
                {isSavingPolicy && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Save Policy Configuration
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: FRAUD SIGNALS */}
      {activeTab === "fraud" && (
        <div className="overflow-x-auto border border-pitch-800 rounded-xl bg-pitch-900">
          <table className="w-full text-left text-xs">
            <thead className="bg-pitch-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-pitch-800">
              <tr>
                <th className="p-3.5">Contributor</th>
                <th className="p-3.5">Signal Type</th>
                <th className="p-3.5">Severity</th>
                <th className="p-3.5 text-right">Risk Score</th>
                <th className="p-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pitch-800/60">
              {fraudSignals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500">
                    No active fraud signals detected.
                  </td>
                </tr>
              ) : (
                fraudSignals.map((s) => (
                  <tr key={s.id} className="hover:bg-pitch-850/40 transition-colors">
                    <td className="p-3.5 font-bold text-slate-100">
                      {s.contributorProfile?.penName || s.contributorProfileId.slice(0, 8)}
                    </td>
                    <td className="p-3.5 text-slate-300 font-mono">{s.signalType}</td>
                    <td className="p-3.5">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                          s.severity === "CRITICAL" || s.severity === "HIGH"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-amber-500/10 text-amber-400"
                        )}
                      >
                        {s.severity}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-bold text-red-400">{s.riskScore}/100</td>
                    <td className="p-3.5 text-right">
                      <span className="text-slate-400 text-[11px]">{s.isResolved ? "Resolved" : "Active"}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 5: AUDIT TRAIL */}
      {activeTab === "audit" && (
        <div className="overflow-x-auto border border-pitch-800 rounded-xl bg-pitch-900">
          <table className="w-full text-left text-xs">
            <thead className="bg-pitch-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-pitch-800">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Entity</th>
                <th className="p-3.5">Reason / Note</th>
                <th className="p-3.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pitch-800/60">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-pitch-850/40 transition-colors">
                  <td className="p-3.5 font-mono text-[10px] text-slate-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3.5 font-mono font-bold text-slate-200">{log.action}</td>
                  <td className="p-3.5 text-slate-400">{log.entityType}</td>
                  <td className="p-3.5 text-slate-300">{log.reason || "N/A"}</td>
                  <td className="p-3.5 text-right font-mono font-bold text-slate-200">
                    {log.amountMinor ? formatMYR(log.amountMinor) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* REJECT WITHDRAWAL MODAL */}
      {rejectingWithdrawalId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-pitch-900 border border-pitch-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-100 text-sm">Reject Withdrawal Request</h3>
            <p className="text-xs text-slate-400">
              Rejecting this request will immediately release all held funds back into the contributor&apos;s available wallet balance.
            </p>
            <form onSubmit={handleRejectWithdrawal} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Reason for Rejection</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Mismatched beneficiary account name"
                  required
                  rows={3}
                  className="w-full bg-pitch-950 border border-pitch-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-brand-green"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingWithdrawalId(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-pitch-800 hover:bg-pitch-750 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRejecting}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-500 text-white"
                >
                  {isRejecting ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
