"use client";

import React, { useState } from "react";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Building,
  CheckCircle,
  FileText,
  DollarSign,
  ChevronRight,
  RefreshCw,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EarningsConsoleProps {
  initialWallet: any;
  initialRewards: any[];
  initialWithdrawals: any[];
  initialLedger: any[];
}

export function EarningsConsole({
  initialWallet,
  initialRewards,
  initialWithdrawals,
  initialLedger,
}: EarningsConsoleProps) {
  const [wallet, setWallet] = useState(initialWallet);
  const [rewards, setRewards] = useState(initialRewards);
  const [withdrawals, setWithdrawals] = useState(initialWithdrawals);
  const [ledger, setLedger] = useState(initialLedger);

  const [activeTab, setActiveTab] = useState<"rewards" | "ledger" | "withdrawals">("rewards");

  // Modal States
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);

  // Form States
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState("");

  const [bankName, setBankName] = useState(wallet?.payoutAccount?.bankName || "");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState(
    wallet?.payoutAccount?.accountHolderName || ""
  );
  const [isSubmittingAccount, setIsSubmittingAccount] = useState(false);
  const [accountError, setAccountError] = useState("");
  const [accountSuccess, setAccountSuccess] = useState("");

  // Helpers
  const formatMYR = (minor: number) => {
    return `RM ${(minor / 100).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError("");
    setWithdrawSuccess("");

    const amountFloat = parseFloat(withdrawAmount);
    if (isNaN(amountFloat) || amountFloat < 85) {
      setWithdrawError("Minimum withdrawal amount is RM 85.00");
      return;
    }

    const amountMinor = Math.round(amountFloat * 100);
    if (amountMinor > wallet.availableBalanceMinor) {
      setWithdrawError("Requested amount exceeds available balance.");
      return;
    }

    setIsSubmittingWithdraw(true);
    try {
      const res = await fetch("/api/contributor/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountMinor }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Withdrawal request failed");
      }

      setWithdrawSuccess("Withdrawal request submitted successfully.");
      // Refresh wallet & withdrawals
      const [walletRes, withRes, ledgRes] = await Promise.all([
        fetch("/api/contributor/wallet").then((r) => r.json()),
        fetch("/api/contributor/withdrawals").then((r) => r.json()),
        fetch("/api/contributor/wallet/ledger").then((r) => r.json()),
      ]);

      if (walletRes.wallet) setWallet(walletRes.wallet);
      if (withRes.withdrawals) setWithdrawals(withRes.withdrawals);
      if (ledgRes.entries) setLedger(ledgRes.entries);

      setTimeout(() => {
        setShowWithdrawModal(false);
        setWithdrawAmount("");
        setWithdrawSuccess("");
      }, 1500);
    } catch (err: any) {
      setWithdrawError(err.message || "Failed to process withdrawal");
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountError("");
    setAccountSuccess("");

    if (!bankName || !accountNumber || !accountHolderName) {
      setAccountError("All bank account fields are required.");
      return;
    }

    setIsSubmittingAccount(true);
    try {
      const res = await fetch("/api/contributor/wallet/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankName,
          accountNumber,
          accountHolderName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update payout account");
      }

      setAccountSuccess("Payout account updated. A 48-hour security cooldown is now in effect.");

      const walletRes = await fetch("/api/contributor/wallet").then((r) => r.json());
      if (walletRes.wallet) setWallet(walletRes.wallet);

      setTimeout(() => {
        setShowAccountModal(false);
        setAccountNumber("");
        setAccountSuccess("");
      }, 1800);
    } catch (err: any) {
      setAccountError(err.message || "Failed to update account");
    } finally {
      setIsSubmittingAccount(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="bg-pitch-surface/90 border border-pitch-border rounded-xl p-5 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              Available Balance
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight">
              {formatMYR(wallet?.availableBalanceMinor || 0)}
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <button
              onClick={() => setShowWithdrawModal(true)}
              disabled={
                (wallet?.availableBalanceMinor || 0) < 2000 ||
                wallet?.payoutAccount?.isUnderCooldown ||
                wallet?.isWithdrawalBlocked
              }
              className={cn(
                "px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5",
                (wallet?.availableBalanceMinor || 0) >= 8500 &&
                  !wallet?.payoutAccount?.isUnderCooldown &&
                  !wallet?.isWithdrawalBlocked
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                  : "bg-pitch-border/50 text-muted-foreground cursor-not-allowed"
              )}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              Request Withdrawal
            </button>
            <span className="text-muted-foreground">Min RM 85.00</span>
          </div>
        </div>

        {/* Held in Withdrawal */}
        <div className="bg-pitch-surface/90 border border-pitch-border rounded-xl p-5 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              Held in Withdrawal
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight">
              {formatMYR(wallet?.heldBalanceMinor || 0)}
            </span>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Pending finance approval or payout processing</p>
        </div>

        {/* Lifetime Earnings */}
        <div className="bg-pitch-surface/90 border border-pitch-border rounded-xl p-5 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              Lifetime Earnings
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight">
              {formatMYR(wallet?.lifetimeEarningsMinor || 0)}
            </span>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Cumulative article rewards & bonuses earned</p>
        </div>

        {/* Lifetime Withdrawn */}
        <div className="bg-pitch-surface/90 border border-pitch-border rounded-xl p-5 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              Total Disbursed
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight">
              {formatMYR(wallet?.lifetimeWithdrawnMinor || 0)}
            </span>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Successfully paid out to your bank account</p>
        </div>
      </div>

      {/* Payout Account Status Banner */}
      <div className="bg-pitch-surface border border-pitch-border rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-pitch-border/60 flex items-center justify-center text-pitch-gold shrink-0 mt-0.5">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
              Bank Payout Account
              {wallet?.payoutAccount?.isConfigured ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3" /> Configured
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="w-3 h-3" /> Not Configured
                </span>
              )}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {wallet?.payoutAccount?.isConfigured
                ? `${wallet.payoutAccount.bankName} • ${wallet.payoutAccount.accountNumberMasked} (${wallet.payoutAccount.accountHolderName})`
                : "Add your bank account details to enable withdrawals."}
            </p>
            {wallet?.payoutAccount?.isUnderCooldown && (
              <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Security Cooldown active until{" "}
                {new Date(wallet.payoutAccount.cooldownUntil).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => setShowAccountModal(true)}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-pitch-border/70 hover:bg-pitch-border text-foreground transition-colors"
        >
          {wallet?.payoutAccount?.isConfigured ? "Update Bank Account" : "Configure Bank Account"}
        </button>
      </div>

      {/* KYC Compliance Status Banner */}
      <div className="bg-pitch-surface border border-pitch-border rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-pitch-border/60 flex items-center justify-center text-brand-green shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
              Identity Verification (KYC Compliance)
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                Independent Compliance Layer
              </span>
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Required for automated payouts and financial compliance. Documents are securely processed by an accredited KYC provider.
            </p>
          </div>
        </div>

        <button
          onClick={async () => {
            try {
              const res = await fetch("/api/contributor/kyc/initiate", { method: "POST" });
              const data = await res.json();
              if (data.session?.hostedVerificationUrl) {
                window.open(data.session.hostedVerificationUrl, "_blank");
              } else {
                alert("Verification initiated. Please complete the verification session.");
              }
            } catch {
              alert("Failed to initiate verification session.");
            }
          }}
          className="px-4 py-2 bg-pitch-gold text-slate-950 font-bold text-xs rounded-lg hover:bg-yellow-400 transition-colors shrink-0"
        >
          Verify Identity Now →
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-pitch-border gap-6">
        <button
          onClick={() => setActiveTab("rewards")}
          className={cn(
            "pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-2",
            activeTab === "rewards"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <FileText className="w-4 h-4" />
          Article Rewards ({rewards.length})
        </button>
        <button
          onClick={() => setActiveTab("ledger")}
          className={cn(
            "pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-2",
            activeTab === "ledger"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <TrendingUp className="w-4 h-4" />
          Transaction Ledger ({ledger.length})
        </button>
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
      </div>

      {/* TAB CONTENT: Article Rewards */}
      {activeTab === "rewards" && (
        <div className="space-y-4">
          {rewards.length === 0 ? (
            <div className="bg-pitch-surface/60 border border-pitch-border rounded-xl p-8 text-center text-muted-foreground text-sm">
              No rewards finalized yet. Once your submitted articles are approved and published, rewards will appear here.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {rewards.map((rew) => (
                <div
                  key={rew.id}
                  className="bg-pitch-surface/90 border border-pitch-border rounded-xl p-5 hover:border-pitch-gold/40 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-pitch-gold uppercase tracking-wider">
                          {rew.article?.category || "Article"}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          • {new Date(rew.createdAt).toLocaleDateString()}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {rew.status}
                        </span>
                      </div>
                      <h4 className="text-sm md:text-base font-bold text-foreground mt-1">
                        {rew.article?.title || "Untitled Article"}
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="text-xl font-extrabold text-emerald-400">
                        {formatMYR(rew.totalRewardMinor)}
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        {rew.qualifiedViewsCount} Qualified Views
                      </p>
                    </div>
                  </div>

                  {/* Reward Breakdown Chips */}
                  <div className="mt-4 pt-3 border-t border-pitch-border/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-pitch-border/30 rounded-lg p-2">
                      <span className="text-muted-foreground text-[11px] block">Base Reward</span>
                      <span className="font-semibold text-foreground">{formatMYR(rew.baseRewardMinor)}</span>
                    </div>
                    <div className="bg-pitch-border/30 rounded-lg p-2">
                      <span className="text-muted-foreground text-[11px] block">Qualified Views</span>
                      <span className="font-semibold text-foreground">{formatMYR(rew.viewBonusMinor)}</span>
                    </div>
                    <div className="bg-pitch-border/30 rounded-lg p-2">
                      <span className="text-muted-foreground text-[11px] block">Quality Bonus</span>
                      <span className="font-semibold text-foreground">{formatMYR(rew.qualityBonusMinor)}</span>
                    </div>
                    <div className="bg-pitch-border/30 rounded-lg p-2">
                      <span className="text-muted-foreground text-[11px] block">Breaking News</span>
                      <span className="font-semibold text-foreground">{formatMYR(rew.breakingBonusMinor)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Transaction Ledger */}
      {activeTab === "ledger" && (
        <div className="space-y-4">
          {ledger.length === 0 ? (
            <div className="bg-pitch-surface/60 border border-pitch-border rounded-xl p-8 text-center text-muted-foreground text-sm">
              No wallet ledger transactions recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto border border-pitch-border rounded-xl bg-pitch-surface">
              <table className="w-full text-left text-xs">
                <thead className="bg-pitch-border/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-pitch-border">
                  <tr>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Reason / Reference</th>
                    <th className="p-3.5 text-right">Amount</th>
                    <th className="p-3.5 text-right">Balance After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pitch-border/60">
                  {ledger.map((entry) => {
                    const isCredit =
                      entry.type === "CREDIT" ||
                      entry.type === "ADJUSTMENT" ||
                      entry.type === "WITHDRAWAL_RELEASE";
                    return (
                      <tr key={entry.id} className="hover:bg-pitch-border/20 transition-colors">
                        <td className="p-3.5 whitespace-nowrap text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleString()}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-bold",
                              entry.type === "CREDIT"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : entry.type === "WITHDRAWAL_HOLD"
                                ? "bg-amber-500/10 text-amber-400"
                                : entry.type === "PAYOUT"
                                ? "bg-purple-500/10 text-purple-400"
                                : "bg-blue-500/10 text-blue-400"
                            )}
                          >
                            {entry.type}
                          </span>
                        </td>
                        <td className="p-3.5 font-medium text-foreground max-w-xs truncate">
                          {entry.reason}
                        </td>
                        <td
                          className={cn(
                            "p-3.5 text-right font-bold whitespace-nowrap",
                            isCredit ? "text-emerald-400" : "text-amber-400"
                          )}
                        >
                          {isCredit ? "+" : "-"}
                          {formatMYR(entry.amountMinor)}
                        </td>
                        <td className="p-3.5 text-right font-semibold text-muted-foreground whitespace-nowrap">
                          {formatMYR(entry.balanceAfterMinor)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Withdrawal Requests */}
      {activeTab === "withdrawals" && (
        <div className="space-y-4">
          {withdrawals.length === 0 ? (
            <div className="bg-pitch-surface/60 border border-pitch-border rounded-xl p-8 text-center text-muted-foreground text-sm">
              No withdrawal requests recorded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {withdrawals.map((w) => (
                <div
                  key={w.id}
                  className="bg-pitch-surface border border-pitch-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">
                        {w.bankName} • {w.accountNumberMasked}
                      </span>
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
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Account: {w.accountHolderName} • Requested:{" "}
                      {new Date(w.createdAt).toLocaleString()}
                    </p>
                    {w.rejectionReason && (
                      <p className="text-xs text-red-400 mt-1">Reason: {w.rejectionReason}</p>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-extrabold text-foreground">
                      {formatMYR(w.amountMinor)}
                    </span>
                    {w.payout?.paidAt && (
                      <p className="text-[11px] text-emerald-400">
                        Disbursed on {new Date(w.payout.paidAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* WITHDRAWAL MODAL */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-pitch-900 border border-pitch-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-pitch-800">
              <h3 className="font-bold text-slate-100 text-base font-sans">Permohonan Penarikan Dana</h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-slate-400 hover:text-white text-sm p-1 rounded hover:bg-pitch-800"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Tarik saldo royalti langsung ke rekening bank terdaftar Anda (
              <span className="text-slate-200 font-semibold">{wallet?.payoutAccount?.bankName} • {wallet?.payoutAccount?.accountNumberMasked}</span>).
            </p>

            {withdrawError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-xs text-red-400 font-mono">
                {withdrawError}
              </div>
            )}

            {withdrawSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-xs text-emerald-400 font-mono">
                {withdrawSuccess}
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-4 font-sans">
              <div>
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                  Jumlah Penarikan (MYR) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400 font-mono">
                    RM
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="85"
                    max={(wallet?.availableBalanceMinor || 0) / 100}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="85.00"
                    required
                    className="w-full bg-pitch-950 border border-pitch-750 rounded-lg pl-11 pr-4 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-[#c3ff00] focus:ring-1 focus:ring-[#c3ff00]/30 transition-all placeholder:text-slate-600"
                  />
                </div>
                <span className="text-[11px] font-mono text-slate-400 mt-1.5 block">
                  Saldo Tersedia: <strong className="text-slate-200">{formatMYR(wallet?.availableBalanceMinor || 0)}</strong> (Minimal: <strong className="text-[#c3ff00]">RM 85.00</strong>)
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-pitch-850 hover:bg-pitch-800 text-slate-300 border border-pitch-750 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWithdraw}
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-[#c3ff00] hover:bg-[#b0e600] text-slate-950 transition-colors flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {isSubmittingWithdraw && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Ajukan Penarikan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BANK ACCOUNT MODAL */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-pitch-900 border border-pitch-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-pitch-800">
              <h3 className="font-bold text-slate-100 text-base font-sans">Konfigurasi Rekening Bank Pembayaran</h3>
              <button
                onClick={() => setShowAccountModal(false)}
                className="text-slate-400 hover:text-white text-sm p-1 rounded hover:bg-pitch-800"
              >
                ✕
              </button>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-300 flex items-start gap-2 font-sans">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <span>
                Pemberitahuan Keamanan: Mengubah data rekening bank menerapkan masa jeda (*cooldown*) keamanan wajib 48 jam untuk penarikan baru.
              </span>
            </div>

            {accountError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-xs text-red-400 font-mono">
                {accountError}
              </div>
            )}

            {accountSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-xs text-emerald-400 font-mono">
                {accountSuccess}
              </div>
            )}

            <form onSubmit={handleUpdateAccount} className="space-y-4 font-sans">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 block">
                  Nama Bank *
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Contoh: Maybank, CIMB, BCA, Mandiri, BRI"
                  required
                  className="w-full bg-pitch-950 border border-pitch-750 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 font-sans focus:outline-none focus:border-[#c3ff00] focus:ring-1 focus:ring-[#c3ff00]/30 transition-all placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 block">
                  Nomor Rekening Bank *
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Masukkan nomor rekening lengkap"
                  required
                  className="w-full bg-pitch-950 border border-pitch-750 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-[#c3ff00] focus:ring-1 focus:ring-[#c3ff00]/30 transition-all placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 block">
                  Nama Pemilik Rekening *
                </label>
                <input
                  type="text"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="Nama lengkap sesuai buku tabungan"
                  required
                  className="w-full bg-pitch-950 border border-pitch-750 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 font-sans focus:outline-none focus:border-[#c3ff00] focus:ring-1 focus:ring-[#c3ff00]/30 transition-all placeholder:text-slate-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-pitch-850 hover:bg-pitch-800 text-slate-300 border border-pitch-750 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAccount}
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-[#c3ff00] hover:bg-[#b0e600] text-slate-950 transition-colors flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {isSubmittingAccount && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan Rekening Bank</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
