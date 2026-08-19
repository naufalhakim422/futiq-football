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
  Globe2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SupportedCurrency,
  SUPPORTED_CURRENCIES,
  formatMoney,
  formatDualCurrency,
} from "@/lib/currency/currency";

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

  // Multi-Currency Selection State (Default: USD)
  const [activeCurrency, setActiveCurrency] = useState<SupportedCurrency>("USD");

  const [activeTab, setActiveTab] = useState<"rewards" | "ledger" | "withdrawals">("rewards");

  // Modal States
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);

  // Form States
  const [withdrawAmountUSD, setWithdrawAmountUSD] = useState("");
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState("");

  const [payoutMethod, setPayoutMethod] = useState("BANK_ID");
  const [bankName, setBankName] = useState(wallet?.payoutAccount?.bankName || "BCA");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState(
    wallet?.payoutAccount?.accountHolderName || ""
  );
  const [isSubmittingAccount, setIsSubmittingAccount] = useState(false);
  const [accountError, setAccountError] = useState("");
  const [accountSuccess, setAccountSuccess] = useState("");

  // Format Helper using active currency
  const formatVal = (minorUSD: number) => formatMoney(minorUSD, activeCurrency);
  const formatDual = (minorUSD: number) => formatDualCurrency(minorUSD, activeCurrency);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError("");
    setWithdrawSuccess("");

    const amountFloat = parseFloat(withdrawAmountUSD);
    if (isNaN(amountFloat) || amountFloat < 10) {
      setWithdrawError("Minimum withdrawal amount is $10.00 USD (≈ Rp 160.000 / RM 45.00)");
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
        setWithdrawAmountUSD("");
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
      setAccountError("All payment destination fields are required.");
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

      setAccountSuccess("Payout destination updated. A 48-hour security cooldown is now in effect.");

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
    <div className="space-y-8 font-sans">
      {/* Revenue-Share Banner & Multi-Currency Switcher */}
      <div className="bg-pitch-900 border border-pitch-800 p-5 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-500">
                70% CONTRIBUTOR REVENUE SHARE MODEL
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h2 className="text-base font-extrabold text-slate-100">
              Writer Rewards & Financial Settlement Center
            </h2>
          </div>
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

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="bg-pitch-900 border border-pitch-800 rounded-2xl p-5 relative overflow-hidden shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400 font-mono">
              Available Balance
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl lg:text-3xl font-extrabold text-slate-100 tracking-tight font-sans">
              {formatVal(wallet?.availableBalanceMinor || 0)}
            </div>
            {activeCurrency !== "USD" && (
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                ≈ {formatMoney(wallet?.availableBalanceMinor || 0, "USD", true)}
              </div>
            )}
          </div>
          <div className="pt-2 flex items-center justify-between text-xs border-t border-pitch-800">
            <button
              onClick={() => setShowWithdrawModal(true)}
              disabled={
                (wallet?.availableBalanceMinor || 0) < 1000 ||
                wallet?.payoutAccount?.isUnderCooldown ||
                wallet?.isWithdrawalBlocked
              }
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 uppercase text-[11px] tracking-wider",
                (wallet?.availableBalanceMinor || 0) >= 1000 &&
                  !wallet?.payoutAccount?.isUnderCooldown &&
                  !wallet?.isWithdrawalBlocked
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"
                  : "bg-pitch-800 text-slate-400 cursor-not-allowed"
              )}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              Request Withdrawal
            </button>
            <span className="text-[10px] font-mono text-slate-400">Min $10.00</span>
          </div>
        </div>

        {/* Held in Withdrawal */}
        <div className="bg-pitch-900 border border-pitch-800 rounded-2xl p-5 relative overflow-hidden shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400 font-mono">
              Held in Withdrawal
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl lg:text-3xl font-extrabold text-amber-500 tracking-tight font-sans">
              {formatVal(wallet?.heldBalanceMinor || 0)}
            </div>
            {activeCurrency !== "USD" && (
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                ≈ {formatMoney(wallet?.heldBalanceMinor || 0, "USD", true)}
              </div>
            )}
          </div>
          <p className="pt-2 text-[11px] text-slate-400 border-t border-pitch-800">
            Pending bi-weekly settlement (5th & 20th)
          </p>
        </div>

        {/* Lifetime Earnings */}
        <div className="bg-pitch-900 border border-pitch-800 rounded-2xl p-5 relative overflow-hidden shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400 font-mono">
              Lifetime Earnings
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl lg:text-3xl font-extrabold text-slate-100 tracking-tight font-sans">
              {formatVal(wallet?.lifetimeEarningsMinor || 0)}
            </div>
            {activeCurrency !== "USD" && (
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                ≈ {formatMoney(wallet?.lifetimeEarningsMinor || 0, "USD", true)}
              </div>
            )}
          </div>
          <p className="pt-2 text-[11px] text-slate-400 border-t border-pitch-800">
            Cumulative 70% reader revenue & bonuses
          </p>
        </div>

        {/* Lifetime Withdrawn */}
        <div className="bg-pitch-900 border border-pitch-800 rounded-2xl p-5 relative overflow-hidden shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400 font-mono">
              Total Disbursed
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl lg:text-3xl font-extrabold text-slate-100 tracking-tight font-sans">
              {formatVal(wallet?.lifetimeWithdrawnMinor || 0)}
            </div>
            {activeCurrency !== "USD" && (
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                ≈ {formatMoney(wallet?.lifetimeWithdrawnMinor || 0, "USD", true)}
              </div>
            )}
          </div>
          <p className="pt-2 text-[11px] text-slate-400 border-t border-pitch-800">
            Successfully paid out to your bank account
          </p>
        </div>
      </div>

      {/* Payout Account Status Banner */}
      <div className="bg-pitch-900 border border-pitch-800 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-pitch-850 border border-pitch-750 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2 font-sans">
              Payout Destination (Bank / E-Wallet / PayPal)
              {wallet?.payoutAccount?.isConfigured ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3" /> Configured
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase bg-amber-500/15 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="w-3 h-3" /> Not Configured
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              {wallet?.payoutAccount?.isConfigured
                ? `${wallet.payoutAccount.bankName} • ${wallet.payoutAccount.accountNumberMasked} (${wallet.payoutAccount.accountHolderName})`
                : "Add your local bank (BCA, Mandiri, BRI), E-Wallet (GoPay, DANA), or PayPal account to receive funds."}
            </p>
            {wallet?.payoutAccount?.isUnderCooldown && (
              <p className="text-[11px] text-amber-500 mt-1 font-mono flex items-center gap-1">
                <Lock className="w-3 h-3" /> Security Cooldown active until{" "}
                {new Date(wallet.payoutAccount.cooldownUntil).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => setShowAccountModal(true)}
          className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-pitch-850 hover:bg-pitch-800 text-slate-200 border border-pitch-750 transition-colors shadow-sm"
        >
          {wallet?.payoutAccount?.isConfigured ? "Update Destination" : "Configure Destination"}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-pitch-800 gap-6">
        <button
          onClick={() => setActiveTab("rewards")}
          className={cn(
            "pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px flex items-center gap-2",
            activeTab === "rewards"
              ? "border-emerald-500 text-emerald-500"
              : "border-transparent text-slate-400 hover:text-slate-200"
          )}
        >
          <FileText className="w-4 h-4" />
          Article Rewards ({rewards.length})
        </button>
        <button
          onClick={() => setActiveTab("ledger")}
          className={cn(
            "pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px flex items-center gap-2",
            activeTab === "ledger"
              ? "border-emerald-500 text-emerald-500"
              : "border-transparent text-slate-400 hover:text-slate-200"
          )}
        >
          <TrendingUp className="w-4 h-4" />
          Transaction Ledger ({ledger.length})
        </button>
        <button
          onClick={() => setActiveTab("withdrawals")}
          className={cn(
            "pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px flex items-center gap-2",
            activeTab === "withdrawals"
              ? "border-emerald-500 text-emerald-500"
              : "border-transparent text-slate-400 hover:text-slate-200"
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
            <div className="bg-pitch-900 border border-pitch-800 rounded-2xl p-10 text-center text-slate-400 text-xs shadow-xl">
              No rewards finalized yet. Once your submitted articles are approved and generate qualified reader views, rewards will appear here.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {rewards.map((rew) => (
                <div
                  key={rew.id}
                  className="bg-pitch-900 border border-pitch-800 rounded-2xl p-5 shadow-xl hover:border-emerald-500/40 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-500 uppercase tracking-wider">
                          {rew.article?.category || "ARTICLE"}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          • {new Date(rew.createdAt).toLocaleDateString()}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                          {rew.status}
                        </span>
                      </div>
                      <h4 className="text-sm md:text-base font-bold text-slate-100 mt-1 font-sans">
                        {rew.article?.title || "Untitled Article"}
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="text-xl font-extrabold text-emerald-500">
                        {formatVal(rew.totalRewardMinor)}
                      </span>
                      <p className="text-[11px] font-mono text-slate-400">
                        {rew.qualifiedViewsCount} Qualified Views (70% Share)
                      </p>
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
            <div className="bg-pitch-900 border border-pitch-800 rounded-2xl p-10 text-center text-slate-400 text-xs shadow-xl">
              No wallet ledger transactions recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto border border-pitch-800 rounded-2xl bg-pitch-900 shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-pitch-850 text-slate-400 uppercase text-[10px] font-mono font-bold tracking-wider border-b border-pitch-800">
                  <tr>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Reason / Reference</th>
                    <th className="p-3.5 text-right">Amount</th>
                    <th className="p-3.5 text-right">Balance After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pitch-800 font-mono">
                  {ledger.map((entry) => {
                    const isCredit =
                      entry.type === "CREDIT" ||
                      entry.type === "ADJUSTMENT" ||
                      entry.type === "WITHDRAWAL_RELEASE";
                    return (
                      <tr key={entry.id} className="hover:bg-pitch-850/50 transition-colors">
                        <td className="p-3.5 whitespace-nowrap text-slate-400">
                          {new Date(entry.createdAt).toLocaleString()}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-bold",
                              entry.type === "CREDIT"
                                ? "bg-emerald-500/15 text-emerald-500"
                                : entry.type === "WITHDRAWAL_HOLD"
                                ? "bg-amber-500/15 text-amber-500"
                                : entry.type === "PAYOUT"
                                ? "bg-purple-500/15 text-purple-500"
                                : "bg-blue-500/15 text-blue-500"
                            )}
                          >
                            {entry.type}
                          </span>
                        </td>
                        <td className="p-3.5 font-medium text-slate-200 max-w-xs truncate font-sans">
                          {entry.reason}
                        </td>
                        <td
                          className={cn(
                            "p-3.5 text-right font-bold whitespace-nowrap",
                            isCredit ? "text-emerald-500" : "text-amber-500"
                          )}
                        >
                          {isCredit ? "+" : "-"}
                          {formatVal(entry.amountMinor)}
                        </td>
                        <td className="p-3.5 text-right font-semibold text-slate-400 whitespace-nowrap">
                          {formatVal(entry.balanceAfterMinor)}
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
            <div className="bg-pitch-900 border border-pitch-800 rounded-2xl p-10 text-center text-slate-400 text-xs shadow-xl">
              No withdrawal requests recorded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {withdrawals.map((w) => (
                <div
                  key={w.id}
                  className="bg-pitch-900 border border-pitch-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100">
                        {w.bankName} • {w.accountNumberMasked}
                      </span>
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border",
                          w.status === "PAID"
                            ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                            : w.status === "APPROVED" || w.status === "PROCESSING"
                            ? "bg-blue-500/15 text-blue-500 border-blue-500/30"
                            : w.status === "REJECTED"
                            ? "bg-red-500/15 text-red-500 border-red-500/30"
                            : "bg-amber-500/15 text-amber-500 border-amber-500/30"
                        )}
                      >
                        {w.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 font-mono">
                      Account: {w.accountHolderName} • Requested:{" "}
                      {new Date(w.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-extrabold text-slate-100">
                      {formatVal(w.amountMinor)}
                    </span>
                    {w.payout?.paidAt && (
                      <p className="text-[11px] text-emerald-500 font-mono">
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
              <h3 className="font-bold text-slate-100 text-base font-sans">Request Earnings Withdrawal</h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-slate-400 hover:text-white text-sm p-1 rounded hover:bg-pitch-800"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Withdraw available editorial rewards directly to your registered destination (
              <span className="text-slate-200 font-bold">{wallet?.payoutAccount?.bankName} • {wallet?.payoutAccount?.accountNumberMasked}</span>).
            </p>

            {withdrawError && (
              <div className="p-3 bg-red-500/15 border border-red-500/30 text-red-500 rounded-xl text-xs font-medium">
                {withdrawError}
              </div>
            )}

            {withdrawSuccess && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 rounded-xl text-xs font-medium">
                {withdrawSuccess}
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Withdrawal Amount (in USD $)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="10"
                    placeholder="10.00"
                    value={withdrawAmountUSD}
                    onChange={(e) => setWithdrawAmountUSD(e.target.value)}
                    className="w-full bg-pitch-950 border border-pitch-800 rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400 font-mono">
                  <span>Min: $10.00 USD (≈ Rp 160.000 / RM 45.00)</span>
                  <span>Available: {formatMoney(wallet?.availableBalanceMinor || 0, "USD", true)}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWithdraw}
                  className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors shadow-md"
                >
                  {isSubmittingWithdraw ? "Processing..." : "Submit Withdrawal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACCOUNT MODAL */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-pitch-900 border border-pitch-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-pitch-800">
              <h3 className="font-bold text-slate-100 text-base font-sans">Configure Payout Destination</h3>
              <button
                onClick={() => setShowAccountModal(false)}
                className="text-slate-400 hover:text-white text-sm p-1 rounded hover:bg-pitch-800"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Select your payment method (Bank Transfer, E-Wallet, or PayPal). Changing your payout destination triggers a 48-hour security cooldown.
            </p>

            {accountError && (
              <div className="p-3 bg-red-500/15 border border-red-500/30 text-red-500 rounded-xl text-xs font-medium">
                {accountError}
              </div>
            )}

            {accountSuccess && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 rounded-xl text-xs font-medium">
                {accountSuccess}
              </div>
            )}

            <form onSubmit={handleUpdateAccount} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Payment Method / Institution Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. BCA, Mandiri, GoPay, DANA, Maybank, or PayPal"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-pitch-950 border border-pitch-800 rounded-xl px-3.5 py-2.5 text-slate-100 font-sans focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Account Number / E-Wallet Phone / PayPal Email
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1234567890 or 08123456789 or user@email.com"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full bg-pitch-950 border border-pitch-800 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Account Holder Full Legal Name
                </label>
                <input
                  type="text"
                  placeholder="Matches your identity documents exactly"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  className="w-full bg-pitch-950 border border-pitch-800 rounded-xl px-3.5 py-2.5 text-slate-100 font-sans focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="px-4 py-2 font-bold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAccount}
                  className="px-5 py-2.5 font-bold uppercase tracking-wider text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors shadow-md"
                >
                  {isSubmittingAccount ? "Saving..." : "Save Destination"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
