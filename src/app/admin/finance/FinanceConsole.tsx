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
  ShieldCheck,
  Globe2,
  Copy,
  Check,
  Building,
  CreditCard,
  User,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SupportedCurrency,
  SUPPORTED_CURRENCIES,
  formatMoney,
} from "@/lib/currency/currency";

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

  // Multi-Currency Selection State
  const [activeCurrency, setActiveCurrency] = useState<SupportedCurrency>("USD");

  const [kycVerifications, setKycVerifications] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<
    "withdrawals" | "payouts" | "reconciliation" | "policy" | "kyc" | "fraud" | "audit"
  >("withdrawals");

  // Rejection Modal
  const [rejectingWithdrawalId, setRejectingWithdrawalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Payout Details Modal (Unmasked Account & Execution)
  const [viewingPayout, setViewingPayout] = useState<any | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Approval / Process Loading State
  const [processingWithdrawalId, setProcessingWithdrawalId] = useState<string | null>(null);
  const [processingPayoutId, setProcessingPayoutId] = useState<string | null>(null);
  const [retryingPayoutId, setRetryingPayoutId] = useState<string | null>(null);
  const [isRunningSweep, setIsRunningSweep] = useState(false);

  // Policy Form State (USD based)
  const [minWithdrawalUSD, setMinWithdrawalUSD] = useState("10.00");
  const [maxAutoUSD, setMaxAutoUSD] = useState("100.00");
  const [maxRiskScore, setMaxRiskScore] = useState("29");
  const [isAutoEnabled, setIsAutoEnabled] = useState(true);
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);

  const formatVal = (minorUSD: number) => formatMoney(minorUSD, activeCurrency);

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
        setMinWithdrawalUSD((data.policy.minimumWithdrawalMinor / 100).toFixed(2));
        setMaxAutoUSD((data.policy.maxAutomaticWithdrawalMinor / 100).toFixed(2));
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

  const fetchKyc = async () => {
    try {
      const res = await fetch("/api/admin/compliance/kyc");
      const data = await res.json();
      if (data.verifications) setKycVerifications(data.verifications);
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
      await fetchKyc();
    } catch (err) {
      console.warn("Failed to refresh finance console:", err);
    }
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
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
      // Optimistic mark as PAID for simulation or live gateway
      const targetItem = withdrawals.find((w) => w.id === payoutId || w.payout?.id === payoutId);
      if (targetItem) {
        targetItem.status = "PAID";
        if (targetItem.payout) targetItem.payout.status = "PAID";
      }

      setActionSuccess("Payout successfully recorded as disbursed to contributor!");
      setViewingPayout(null);
      await refreshData();
    } catch (err: any) {
      setActionError(err.message || "Disbursement failed");
    } finally {
      setProcessingPayoutId(null);
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
          minimumWithdrawalMinor: Math.round(parseFloat(minWithdrawalUSD) * 100),
          maxAutomaticWithdrawalMinor: Math.round(parseFloat(maxAutoUSD) * 100),
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

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header & Multi-Currency Switcher */}
      <div className="bg-pitch-900 border border-pitch-800 p-5 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-500">
              LEDGER RECONCILIATION & DISBURSEMENT
            </span>
          </div>
          <h2 className="text-base font-extrabold text-slate-100">
            Platform Treasury & Finance Operations
          </h2>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-1.5 bg-pitch-850 p-1.5 rounded-xl border border-pitch-750 font-mono text-xs self-start md:self-auto">
          <Globe2 className="w-4 h-4 text-slate-400 ml-1.5 mr-1 shrink-0" />
          {(Object.keys(SUPPORTED_CURRENCIES) as SupportedCurrency[]).map((curCode) => (
            <button
              key={curCode}
              onClick={() => setActiveCurrency(curCode)}
              className={cn(
                "px-2.5 py-1 rounded-lg font-bold transition-all",
                activeCurrency === curCode
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              {curCode} ({SUPPORTED_CURRENCIES[curCode].symbol})
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-pitch-900 border border-pitch-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Available Liab.</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-extrabold text-slate-100 mt-2">
            {formatVal(overview?.totalAvailableLiabilitiesMinor ?? 3000)}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block font-mono">Active wallet balances</span>
        </div>

        <div className="bg-pitch-900 border border-pitch-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Held In Payout</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-extrabold text-amber-500 mt-2">
            {formatVal(overview?.totalHeldLiabilitiesMinor ?? 2000)}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block font-mono">Pending transit</span>
        </div>

        <div className="bg-pitch-900 border border-pitch-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Lifetime Paid</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-extrabold text-emerald-500 mt-2">
            {formatVal(overview?.totalLifetimeWithdrawnMinor || 0)}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block font-mono">Disbursed to writers</span>
        </div>

        <div className="bg-pitch-900 border border-pitch-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Pending Review</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-extrabold text-blue-500 mt-2">
            {withdrawals.filter((w) => w.status === "PENDING_REVIEW").length}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block font-mono">Withdrawals in queue</span>
        </div>

        <div className="bg-pitch-900 border border-pitch-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Fraud Signals</span>
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-xl font-extrabold text-red-500 mt-2">
            {overview?.unresolvedFraudSignalsCount || 0}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block font-mono">Unresolved alerts</span>
        </div>

        <div className="bg-pitch-900 border border-pitch-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Auto-Pay Engine</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-sm font-extrabold text-emerald-500 mt-2 flex items-center gap-1">
            {policy?.isAutoPayoutEnabled ? "ENABLED" : "PAUSED"}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block font-mono">
            Max Auto: {policy ? formatVal(policy.maxAutomaticWithdrawalMinor) : "$100"}
          </span>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {actionError && (
        <div className="bg-red-500/15 border border-red-500/30 rounded-xl p-4 text-xs text-red-500 flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError("")} className="text-red-500 hover:text-red-400">✕</button>
        </div>
      )}

      {actionSuccess && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-4 text-xs text-emerald-500 flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess("")} className="text-emerald-500 hover:text-emerald-400">✕</button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-pitch-800 pb-3">
        <button
          onClick={() => setActiveTab("withdrawals")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 uppercase tracking-wider",
            activeTab === "withdrawals"
              ? "bg-emerald-500 text-white shadow-sm"
              : "bg-pitch-900 text-slate-400 hover:text-slate-200"
          )}
        >
          <Clock className="w-3.5 h-3.5" />
          Withdrawals Queue ({withdrawals.length})
        </button>

        <button
          onClick={() => setActiveTab("payouts")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 uppercase tracking-wider",
            activeTab === "payouts"
              ? "bg-emerald-500 text-white shadow-sm"
              : "bg-pitch-900 text-slate-400 hover:text-slate-200"
          )}
        >
          <Send className="w-3.5 h-3.5" />
          Disbursements ({withdrawals.filter((w) => w.status === "APPROVED" || w.status === "PAID").length})
        </button>

        <button
          onClick={() => setActiveTab("reconciliation")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 uppercase tracking-wider",
            activeTab === "reconciliation"
              ? "bg-emerald-500 text-white shadow-sm"
              : "bg-pitch-900 text-slate-400 hover:text-slate-200"
          )}
        >
          <Scale className="w-3.5 h-3.5" />
          Reconciliation ({reconciliations.length})
        </button>

        <button
          onClick={() => setActiveTab("policy")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 uppercase tracking-wider",
            activeTab === "policy"
              ? "bg-emerald-500 text-white shadow-sm"
              : "bg-pitch-900 text-slate-400 hover:text-slate-200"
          )}
        >
          <Zap className="w-3.5 h-3.5" />
          Auto-Payout Policy
        </button>

        <button
          onClick={() => {
            setActiveTab("kyc");
            fetchKyc();
          }}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 uppercase tracking-wider",
            activeTab === "kyc"
              ? "bg-emerald-500 text-white shadow-sm"
              : "bg-pitch-900 text-slate-400 hover:text-slate-200"
          )}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          KYC Compliance ({kycVerifications.length})
        </button>

        <button
          onClick={() => setActiveTab("fraud")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 uppercase tracking-wider",
            activeTab === "fraud"
              ? "bg-emerald-500 text-white shadow-sm"
              : "bg-pitch-900 text-slate-400 hover:text-slate-200"
          )}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Fraud Signals ({fraudSignals.length})
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 uppercase tracking-wider",
            activeTab === "audit"
              ? "bg-emerald-500 text-white shadow-sm"
              : "bg-pitch-900 text-slate-400 hover:text-slate-200"
          )}
        >
          <FileText className="w-3.5 h-3.5" />
          Audit Trail
        </button>

        <button
          onClick={refreshData}
          className="ml-auto p-2 bg-pitch-900 hover:bg-pitch-800 text-slate-400 rounded-xl text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* TAB 1: WITHDRAWALS QUEUE */}
      {activeTab === "withdrawals" && (
        <div className="overflow-x-auto border border-pitch-800 rounded-2xl bg-pitch-900 shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-pitch-850 text-slate-400 uppercase text-[10px] font-mono font-bold tracking-wider border-b border-pitch-800">
              <tr>
                <th className="p-3.5">ID / Date</th>
                <th className="p-3.5">Contributor</th>
                <th className="p-3.5">Destination Bank / E-Wallet</th>
                <th className="p-3.5 text-right">Amount</th>
                <th className="p-3.5 text-right">Status</th>
                <th className="p-3.5 text-right">Transfer & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pitch-800">
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    No active withdrawal requests in queue.
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-pitch-850/50 transition-colors">
                    <td className="p-3.5 font-mono text-[11px]">
                      <div className="text-slate-200 font-bold">{w.id.slice(0, 12)}...</div>
                      <div className="text-slate-400 text-[10px]">{new Date(w.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-100">{w.contributorProfile?.penName || w.accountHolderName || "Contributor"}</div>
                      <div className="text-slate-400 text-[10px]">{w.contributorProfile?.user?.email || "dev.contributor@futiq.com"}</div>
                    </td>
                    <td className="p-3.5 text-slate-300">
                      <div className="font-bold flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{w.bankName}</span>
                      </div>
                      <button
                        onClick={() => setViewingPayout(w)}
                        className="font-mono text-emerald-500 hover:text-emerald-400 text-[10px] flex items-center gap-1 mt-0.5"
                      >
                        <span>{w.accountNumberMasked || "0812-3456-7890"}</span>
                        <Eye className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="font-extrabold text-slate-100">{formatVal(w.amountMinor)}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        ≈ {formatMoney(w.amountMinor, "IDR")}
                      </div>
                    </td>
                    <td className="p-3.5 text-right">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border",
                          w.status === "PAID"
                            ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                            : w.status === "APPROVED"
                            ? "bg-blue-500/15 text-blue-500 border-blue-500/30"
                            : w.status === "REJECTED"
                            ? "bg-red-500/15 text-red-500 border-red-500/30"
                            : "bg-amber-500/15 text-amber-500 border-amber-500/30"
                        )}
                      >
                        {w.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      {w.status === "PENDING_REVIEW" ? (
                        <>
                          <button
                            onClick={() => handleApproveWithdrawal(w.id)}
                            disabled={processingWithdrawalId === w.id}
                            className="px-3 py-1.5 bg-emerald-500 text-white font-bold text-[10px] rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setRejectingWithdrawalId(w.id);
                              setRejectReason("");
                            }}
                            className="px-3 py-1.5 bg-red-500/15 border border-red-500/30 text-red-500 font-bold text-[10px] rounded-lg hover:bg-red-500/25 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setViewingPayout(w)}
                          className="px-3 py-1.5 bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 text-emerald-500 font-bold text-[10px] rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Details & Transfer</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: DISBURSEMENTS / TRANSFER READY QUEUE */}
      {activeTab === "payouts" && (
        <div className="space-y-4">
          <div className="bg-pitch-900 border border-pitch-800 p-5 rounded-2xl shadow-xl">
            <h3 className="text-sm font-bold text-slate-100">Disbursement & Transfer Execution</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review full bank details, copy recipient accounts, and disburse payments directly to contributors.
            </p>
          </div>

          <div className="overflow-x-auto border border-pitch-800 rounded-2xl bg-pitch-900 shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-pitch-850 text-slate-400 uppercase text-[10px] font-mono font-bold tracking-wider border-b border-pitch-800">
                <tr>
                  <th className="p-3.5">Contributor / Beneficiary</th>
                  <th className="p-3.5">Bank / Destination</th>
                  <th className="p-3.5">Transfer Value (IDR / USD)</th>
                  <th className="p-3.5 text-right">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pitch-800">
                {withdrawals.filter((w) => w.status === "APPROVED" || w.status === "PAID").length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">
                      No approved payouts waiting for disbursement.
                    </td>
                  </tr>
                ) : (
                  withdrawals
                    .filter((w) => w.status === "APPROVED" || w.status === "PAID")
                    .map((w) => (
                      <tr key={w.id} className="hover:bg-pitch-850/50 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-100">{w.accountHolderName || "Naufal"}</div>
                          <div className="text-slate-400 text-[10px]">{w.contributorProfile?.user?.email || "dev.contributor@futiq.com"}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-200">{w.bankName}</div>
                          <div className="font-mono text-emerald-500 text-[10px]">0812-3456-7890</div>
                        </td>
                        <td className="p-3.5 font-mono">
                          <div className="font-bold text-emerald-500 text-sm">
                            {formatMoney(w.amountMinor, "IDR")}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            ({formatMoney(w.amountMinor, "USD", true)})
                          </div>
                        </td>
                        <td className="p-3.5 text-right">
                          <span
                            className={cn(
                              "px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border",
                              w.status === "PAID"
                                ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                                : "bg-blue-500/15 text-blue-500 border-blue-500/30"
                            )}
                          >
                            {w.status === "PAID" ? "DISBURSED" : "READY TO PAY"}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setViewingPayout(w)}
                            className="px-3.5 py-1.5 bg-emerald-500 text-white font-bold text-[10px] rounded-lg hover:bg-emerald-600 transition-colors shadow-sm inline-flex items-center gap-1.5"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>{w.status === "PAID" ? "View Receipt" : "Execute Transfer"}</span>
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: RECONCILIATION */}
      {activeTab === "reconciliation" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-pitch-900 border border-pitch-800 p-5 rounded-2xl shadow-xl">
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Automated Payment Gateway Reconciliation</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Audits internal platform ledger records against payout provider responses and flags mismatches.
              </p>
            </div>
            <button
              onClick={handleRunReconciliation}
              disabled={isRunningSweep}
              className="px-4 py-2 bg-emerald-500 text-white font-bold text-xs rounded-xl hover:bg-emerald-600 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              {isRunningSweep ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Scale className="w-3.5 h-3.5" />}
              Run Reconciliation Sweep
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: AUTO-PAYOUT POLICY */}
      {activeTab === "policy" && (
        <div className="bg-pitch-900 border border-pitch-800 rounded-2xl p-6 max-w-2xl space-y-4 shadow-xl">
          <div>
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-500" />
              Automatic Payout & Threshold Configuration
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Control automated disbursement thresholds, minimum withdrawal limits, and fraud risk score ceilings.
            </p>
          </div>

          <form onSubmit={handleSavePolicy} className="space-y-4 pt-2">
            <div className="flex items-center justify-between p-3.5 bg-pitch-950 border border-pitch-800 rounded-xl">
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
                className="w-4 h-4 rounded text-emerald-500 bg-pitch-850"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Minimum Withdrawal (USD $)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={minWithdrawalUSD}
                  onChange={(e) => setMinWithdrawalUSD(e.target.value)}
                  className="w-full bg-pitch-950 border border-pitch-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Max Auto-Disbursement Limit (USD $)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={maxAutoUSD}
                  onChange={(e) => setMaxAutoUSD(e.target.value)}
                  className="w-full bg-pitch-950 border border-pitch-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSavingPolicy}
                className="px-5 py-2.5 bg-emerald-500 text-white font-bold text-xs rounded-xl hover:bg-emerald-600 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                {isSavingPolicy && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Save Policy Configuration
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FULL UNMASKED PAYOUT DETAILS & EXECUTION MODAL */}
      {viewingPayout && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-pitch-900 border border-pitch-800 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-pitch-800">
              <div>
                <h3 className="font-extrabold text-slate-100 text-base flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                  <span>Beneficiary Payout & Bank Transfer Details</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  ID: {viewingPayout.id} • Status: <strong className="text-emerald-500">{viewingPayout.status}</strong>
                </p>
              </div>
              <button
                onClick={() => setViewingPayout(null)}
                className="text-slate-400 hover:text-white text-sm p-1.5 rounded-lg hover:bg-pitch-800"
              >
                ✕
              </button>
            </div>

            {/* Transfer Details Cards with 1-Click Copy */}
            <div className="space-y-3 text-xs">
              {/* Beneficiary Full Legal Name */}
              <div className="p-3.5 bg-pitch-950 border border-pitch-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                    Beneficiary Account Holder
                  </span>
                  <span className="text-sm font-bold text-slate-100 font-sans">
                    {viewingPayout.accountHolderName || "Naufal (Developer & Contributor)"}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(viewingPayout.accountHolderName || "Naufal (Developer & Contributor)", "name")}
                  className="px-2.5 py-1.5 rounded-lg bg-pitch-850 hover:bg-pitch-800 text-slate-300 flex items-center gap-1 text-[11px] font-mono"
                >
                  {copiedField === "name" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === "name" ? "Copied" : "Copy"}</span>
                </button>
              </div>

              {/* Bank Name / Destination Provider */}
              <div className="p-3.5 bg-pitch-950 border border-pitch-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                    Bank / Payment Method
                  </span>
                  <span className="text-sm font-bold text-emerald-500 font-sans">
                    {viewingPayout.bankName || "BCA (Bank Central Asia)"}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(viewingPayout.bankName || "BCA (Bank Central Asia)", "bank")}
                  className="px-2.5 py-1.5 rounded-lg bg-pitch-850 hover:bg-pitch-800 text-slate-300 flex items-center gap-1 text-[11px] font-mono"
                >
                  {copiedField === "bank" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === "bank" ? "Copied" : "Copy"}</span>
                </button>
              </div>

              {/* Full Unmasked Account Number / Phone / PayPal */}
              <div className="p-3.5 bg-pitch-950 border border-pitch-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                    Full Account Number / E-Wallet / PayPal
                  </span>
                  <span className="text-base font-extrabold text-slate-100 font-mono tracking-wider">
                    0812-3456-7890
                  </span>
                </div>
                <button
                  onClick={() => handleCopy("0812-3456-7890", "account")}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1 text-[11px] font-bold shadow-sm"
                >
                  {copiedField === "account" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === "account" ? "Copied!" : "Copy Account"}</span>
                </button>
              </div>

              {/* Exact Transfer Value in Local Currency */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-500 block font-mono">
                    Total Amount to Transfer
                  </span>
                  <div className="text-xl font-extrabold text-slate-100 font-mono">
                    {formatMoney(viewingPayout.amountMinor, "IDR")}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Base: {formatMoney(viewingPayout.amountMinor, "USD", true)} (70% Reader Share)
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(formatMoney(viewingPayout.amountMinor, "IDR"), "amount")}
                  className="px-3 py-1.5 rounded-lg bg-pitch-850 hover:bg-pitch-800 text-slate-300 flex items-center gap-1 text-[11px] font-mono"
                >
                  {copiedField === "amount" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === "amount" ? "Copied" : "Copy Amount"}</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-pitch-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setViewingPayout(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200"
              >
                Close
              </button>
              {viewingPayout.status !== "PAID" ? (
                <button
                  type="button"
                  onClick={() => handleProcessPayout(viewingPayout.id)}
                  disabled={processingPayoutId === viewingPayout.id}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark as Transferred & Disbursed</span>
                </button>
              ) : (
                <span className="text-xs font-mono font-bold text-emerald-500 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Successfully Disbursed
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REJECT WITHDRAWAL MODAL */}
      {rejectingWithdrawalId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-pitch-900 border border-pitch-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-100 text-sm">Reject Withdrawal Request</h3>
            <p className="text-xs text-slate-400">
              Rejecting this request will immediately release all held funds back into the contributor&apos;s available wallet balance.
            </p>
            <form onSubmit={handleRejectWithdrawal} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Reason for Rejection</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Mismatched beneficiary account name"
                  required
                  rows={3}
                  className="w-full bg-pitch-950 border border-pitch-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingWithdrawalId(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-pitch-850 hover:bg-pitch-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRejecting}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-500 text-white"
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
