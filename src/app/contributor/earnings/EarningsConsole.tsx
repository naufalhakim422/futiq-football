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
  ArrowRight,
  CreditCard,
  Check,
  Info,
  ShieldAlert,
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

const DESTINATION_PRESETS = {
  ID: {
    region: "Indonesia (IDR)",
    flag: "🇮🇩",
    currency: "IDR" as SupportedCurrency,
    options: [
      "BCA (Bank Central Asia)",
      "Bank Mandiri",
      "BRI (Bank Rakyat Indonesia)",
      "BNI (Bank Negara Indonesia)",
      "Bank Syariah Indonesia (BSI)",
      "CIMB Niaga",
      "Bank Jago / Neo Commerce",
      "GoPay (E-Wallet)",
      "DANA (E-Wallet)",
      "OVO (E-Wallet)",
      "ShopeePay",
    ],
    accountLabel: "Bank Account Number / E-Wallet Mobile Number",
    accountPlaceholder: "e.g. 1234567890 (BCA) or 081234567890 (GoPay/DANA)",
  },
  MY: {
    region: "Malaysia (MYR)",
    flag: "🇲🇾",
    currency: "MYR" as SupportedCurrency,
    options: ["Maybank", "CIMB Bank", "Public Bank", "RHB Bank", "DuitNow ID"],
    accountLabel: "Bank Account Number / DuitNow ID",
    accountPlaceholder: "e.g. 164012345678 or +60123456789",
  },
  EU: {
    region: "Europe (EUR)",
    flag: "🇪🇺",
    currency: "EUR" as SupportedCurrency,
    options: ["SEPA / IBAN Bank Transfer", "Revolut", "Wise Multi-Currency", "Monzo"],
    accountLabel: "IBAN / SEPA Account Number / PayPal Email",
    accountPlaceholder: "e.g. DE89 3704 0044 0532 0130 00 or author@email.com",
  },
  GLOBAL: {
    region: "Global / US (USD)",
    flag: "🌍",
    currency: "USD" as SupportedCurrency,
    options: ["PayPal", "Wise Transfer", "Direct USD Wire / ACH", "Stripe Connect"],
    accountLabel: "PayPal Email / Wire Account Number",
    accountPlaceholder: "e.g. author.payments@gmail.com",
  },
};

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

  // Form States - Withdrawal
  const [withdrawAmountUSD, setWithdrawAmountUSD] = useState("50.00");
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState("");

  // Form States - Account
  const [selectedRegion, setSelectedRegion] = useState<"ID" | "MY" | "EU" | "GLOBAL">("ID");
  const [bankName, setBankName] = useState(wallet?.payoutAccount?.bankName || "BCA (Bank Central Asia)");
  const [customBankName, setCustomBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("0812-3456-7890");
  const [accountHolderName, setAccountHolderName] = useState(
    wallet?.payoutAccount?.accountHolderName || "Naufal (Developer & Contributor)"
  );
  const [isSubmittingAccount, setIsSubmittingAccount] = useState(false);
  const [accountError, setAccountError] = useState("");
  const [accountSuccess, setAccountSuccess] = useState("");

  // Format Helper using active currency
  const formatVal = (minorUSD: number) => formatMoney(minorUSD, activeCurrency);

  // Calculation helpers for real-time live preview
  const numUSD = parseFloat(withdrawAmountUSD) || 0;
  const minorAmount = Math.round(numUSD * 100);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError("");
    setWithdrawSuccess("");

    if (isNaN(numUSD) || numUSD < 10) {
      setWithdrawError("Minimum withdrawal threshold is $10.00 USD (≈ Rp 160.000 / RM 45.00 / €9.20)");
      return;
    }

    if (minorAmount > wallet.availableBalanceMinor) {
      setWithdrawError("Requested amount exceeds available wallet balance.");
      return;
    }

    setIsSubmittingWithdraw(true);
    try {
      const res = await fetch("/api/contributor/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountMinor: minorAmount }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Withdrawal request failed");
      }

      // Local State Optimistic Update
      const newHeld = (wallet.heldBalanceMinor || 0) + minorAmount;
      const newAvailable = Math.max(0, (wallet.availableBalanceMinor || 0) - minorAmount);
      
      const newWithdrawalRecord = {
        id: `with_${Date.now()}`,
        bankName: wallet?.payoutAccount?.bankName || bankName,
        accountNumberMasked: wallet?.payoutAccount?.accountNumberMasked || "•••• 8821",
        accountHolderName: wallet?.payoutAccount?.accountHolderName || accountHolderName,
        amountMinor: minorAmount,
        status: "PENDING_REVIEW",
        createdAt: new Date(),
        targetCurrency: DESTINATION_PRESETS[selectedRegion].currency,
        targetAmountFormatted: formatMoney(minorAmount, DESTINATION_PRESETS[selectedRegion].currency),
      };

      const newLedgerRecord = {
        id: `ledg_${Date.now()}`,
        type: "WITHDRAWAL_HOLD",
        reason: `Disbursement Queue: ${newWithdrawalRecord.bankName} (${newWithdrawalRecord.targetAmountFormatted})`,
        amountMinor: minorAmount,
        balanceAfterMinor: newAvailable,
        createdAt: new Date(),
      };

      setWallet({
        ...wallet,
        availableBalanceMinor: newAvailable,
        heldBalanceMinor: newHeld,
      });

      setWithdrawals([newWithdrawalRecord, ...withdrawals]);
      setLedger([newLedgerRecord, ...ledger]);

      setWithdrawSuccess(
        `Withdrawal requested successfully! Disbursing ${newWithdrawalRecord.targetAmountFormatted} to ${newWithdrawalRecord.bankName}.`
      );

      setTimeout(() => {
        setShowWithdrawModal(false);
        setWithdrawSuccess("");
        setActiveTab("withdrawals");
      }, 2000);
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

    const finalBankName = bankName === "Other" ? customBankName.trim() : bankName.trim();
    const finalAccountNumber = accountNumber.trim();
    const finalAccountHolder = accountHolderName.trim();

    if (!finalBankName) {
      setAccountError("Please select or enter a valid bank/provider name.");
      return;
    }

    if (!finalAccountNumber) {
      setAccountError("Account number / E-Wallet phone number is required.");
      return;
    }

    if (!finalAccountHolder) {
      setAccountError("Account holder full legal name is strictly required.");
      return;
    }

    setIsSubmittingAccount(true);
    try {
      const res = await fetch("/api/contributor/wallet/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankName: finalBankName,
          accountNumber: finalAccountNumber,
          accountHolderName: finalAccountHolder,
        }),
      });

      const masked = finalAccountNumber.length > 4 ? `•••• ${finalAccountNumber.slice(-4)}` : finalAccountNumber;

      setWallet({
        ...wallet,
        payoutAccount: {
          isConfigured: true,
          bankName: finalBankName,
          accountNumberMasked: masked,
          accountHolderName: finalAccountHolder,
          isUnderCooldown: false,
        },
      });

      setAccountSuccess(`Payout destination updated to ${finalBankName} (${DESTINATION_PRESETS[selectedRegion].currency}).`);

      setTimeout(() => {
        setShowAccountModal(false);
        setAccountSuccess("");
      }, 1500);
    } catch (err: any) {
      setAccountError(err.message || "Failed to update payout destination");
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
                "px-3.5 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 uppercase text-[11px] tracking-wider",
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
          <p className="pt-2 text-[11px] text-slate-400 border-t border-pitch-800 font-mono">
            Bi-weekly settlement (5th & 20th)
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
          <p className="pt-2 text-[11px] text-slate-400 border-t border-pitch-800 font-mono">
            Cumulative 70% reader share
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
          <p className="pt-2 text-[11px] text-slate-400 border-t border-pitch-800 font-mono">
            Successfully paid to bank/PayPal
          </p>
        </div>
      </div>

      {/* OFFICIAL CONTRIBUTOR NOTICE & PAYOUT POLICY (IMPORTANT NOTICE BANNER) */}
      <div className="bg-pitch-900 border border-pitch-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
          <Info className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Official Contributor Policy & Settlement Guidelines</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-pitch-950 border border-pitch-800 rounded-xl space-y-1">
            <div className="font-bold text-emerald-500 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" /> 70% Revenue Share
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Earn 70% of verified ad revenue based on server-validated Qualified Reader Views.
            </p>
          </div>

          <div className="p-3.5 bg-pitch-950 border border-pitch-800 rounded-xl space-y-1">
            <div className="font-bold text-amber-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Bi-Weekly Settlement
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Payouts are disbursed twice monthly on the <strong className="text-slate-200">5th and 20th</strong> following ad partner verification.
            </p>
          </div>

          <div className="p-3.5 bg-pitch-950 border border-pitch-800 rounded-xl space-y-1">
            <div className="font-bold text-blue-400 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" /> $10.00 USD Minimum
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Low withdrawal threshold (≈ Rp 160.000 / RM 45.00 / €9.20) direct to Bank/PayPal.
            </p>
          </div>

          <div className="p-3.5 bg-pitch-950 border border-pitch-800 rounded-xl space-y-1">
            <div className="font-bold text-purple-400 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" /> Strict Integrity Policy
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Zero plagiarism and authentic traffic only. AI Gate disqualifies bot views and unverified images.
            </p>
          </div>
        </div>
      </div>

      {/* Payout Destination Banner */}
      <div className="bg-pitch-900 border border-pitch-800 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-pitch-850 border border-pitch-750 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2 font-sans">
              Registered Payout Destination
              {wallet?.payoutAccount?.isConfigured ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3" /> Ready for Transfer
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase bg-amber-500/15 text-amber-500 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                  <AlertTriangle className="w-3 h-3" /> Not Configured
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-300 mt-1 font-sans">
              {wallet?.payoutAccount?.isConfigured
                ? `${wallet.payoutAccount.bankName} • ${wallet.payoutAccount.accountNumberMasked} (${wallet.payoutAccount.accountHolderName})`
                : "Add your bank account (BCA, Mandiri, BRI), E-Wallet (GoPay, DANA), or PayPal to receive disbursements."}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAccountModal(true)}
          className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-pitch-850 hover:bg-pitch-800 text-slate-200 border border-pitch-750 transition-colors shadow-sm shrink-0"
        >
          {wallet?.payoutAccount?.isConfigured ? "Change Destination" : "Configure Destination"}
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
                  <div className="space-y-1">
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
                    <p className="text-[11px] text-slate-400 font-mono">
                      Beneficiary: {w.accountHolderName} • Requested:{" "}
                      {new Date(w.createdAt).toLocaleString()}
                    </p>
                    {/* Live Multi-Currency Conversion Breakdown */}
                    <div className="pt-1 flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-400">
                      <span>Disbursement Value:</span>
                      <span className="text-emerald-500 font-bold">
                        {formatMoney(w.amountMinor, "IDR")}
                      </span>
                      <span>•</span>
                      <span className="text-blue-400">{formatMoney(w.amountMinor, "MYR")}</span>
                      <span>•</span>
                      <span className="text-purple-400">{formatMoney(w.amountMinor, "EUR")}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-extrabold text-slate-100">
                      {formatMoney(w.amountMinor, "USD", true)}
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

      {/* WITHDRAWAL MODAL WITH MULTI-CURRENCY CONVERTER */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-pitch-900 border border-pitch-800 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-pitch-800">
              <div>
                <h3 className="font-extrabold text-slate-100 text-base font-sans flex items-center gap-2">
                  <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                  <span>Request Earnings Withdrawal</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Available Balance: {formatMoney(wallet?.availableBalanceMinor || 0, "USD", true)}
                </p>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-slate-400 hover:text-white text-sm p-1.5 rounded-lg hover:bg-pitch-800"
              >
                ✕
              </button>
            </div>

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
                <label className="text-xs font-bold text-slate-300 block mb-1 font-sans">
                  Withdrawal Amount (in USD $) <span className="text-emerald-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold font-mono">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="10"
                    max={(wallet?.availableBalanceMinor || 0) / 100}
                    placeholder="10.00"
                    value={withdrawAmountUSD}
                    onChange={(e) => setWithdrawAmountUSD(e.target.value)}
                    className="w-full bg-pitch-950 border border-pitch-800 rounded-xl pl-9 pr-4 py-2.5 text-base font-bold text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                </div>
              </div>

              {/* AUTOMATIC LIVE MULTI-CURRENCY CONVERSION MATRIX */}
              <div className="bg-pitch-950 border border-pitch-800 rounded-xl p-3.5 space-y-2 font-mono text-xs">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Live Exchange Conversion Breakdown</span>
                  <span className="text-emerald-500 font-bold">Real-time</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 rounded-lg bg-pitch-900 border border-pitch-800">
                    <span className="text-[10px] text-slate-400 block font-sans">🇺🇸 USD (Base Standard)</span>
                    <span className="text-sm font-extrabold text-slate-100">{formatMoney(minorAmount, "USD")}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-pitch-900 border border-pitch-800">
                    <span className="text-[10px] text-slate-400 block font-sans">🇮🇩 IDR (Indonesian Rupiah)</span>
                    <span className="text-sm font-extrabold text-emerald-500">{formatMoney(minorAmount, "IDR")}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-pitch-900 border border-pitch-800">
                    <span className="text-[10px] text-slate-400 block font-sans">🇲🇾 MYR (Malaysian Ringgit)</span>
                    <span className="text-sm font-extrabold text-blue-400">{formatMoney(minorAmount, "MYR")}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-pitch-900 border border-pitch-800">
                    <span className="text-[10px] text-slate-400 block font-sans">🇪🇺 EUR (Eurozone Euro)</span>
                    <span className="text-sm font-extrabold text-purple-400">{formatMoney(minorAmount, "EUR")}</span>
                  </div>
                </div>

                {/* Destination Confirmation Notice */}
                <div className="pt-2 border-t border-pitch-800 text-[11px] text-slate-300 font-sans flex items-start gap-2">
                  <Building className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400">Funds will be disbursed to registered destination:</span>
                    <div className="font-bold text-slate-100 font-mono mt-0.5">
                      {wallet?.payoutAccount?.bankName || "BCA"} ({wallet?.payoutAccount?.accountNumberMasked || "•••• 8821"}) • {wallet?.payoutAccount?.accountHolderName || "Naufal"}
                    </div>
                  </div>
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
                  disabled={isSubmittingWithdraw || minorAmount < 1000}
                  className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors shadow-md flex items-center gap-1.5"
                >
                  {isSubmittingWithdraw ? "Processing..." : "Confirm Withdrawal"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACCOUNT CONFIGURATION MODAL (100% ENGLISH & STRICT VALIDATION) */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-pitch-900 border border-pitch-800 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-pitch-800">
              <div>
                <h3 className="font-extrabold text-slate-100 text-base font-sans flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                  <span>Configure Payout Destination</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                  Select your region and enter verified banking or payment details.
                </p>
              </div>
              <button
                onClick={() => setShowAccountModal(false)}
                className="text-slate-400 hover:text-white text-sm p-1.5 rounded-lg hover:bg-pitch-800"
              >
                ✕
              </button>
            </div>

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

            <form onSubmit={handleUpdateAccount} className="space-y-4 text-xs">
              {/* Region / Currency Presets Selector */}
              <div>
                <label className="font-bold text-slate-300 block mb-1.5 font-sans">
                  Payout Region & Disbursement Currency
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono text-[11px]">
                  {(["ID", "MY", "EU", "GLOBAL"] as Array<"ID" | "MY" | "EU" | "GLOBAL">).map((reg) => (
                    <button
                      key={reg}
                      type="button"
                      onClick={() => {
                        setSelectedRegion(reg);
                        setBankName(DESTINATION_PRESETS[reg].options[0]);
                      }}
                      className={cn(
                        "p-2.5 rounded-xl border text-center font-bold transition-all flex flex-col items-center justify-center gap-1",
                        selectedRegion === reg
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                          : "bg-pitch-950 border-pitch-800 text-slate-400 hover:text-slate-200 hover:border-pitch-750"
                      )}
                    >
                      <span className="text-base">{DESTINATION_PRESETS[reg].flag}</span>
                      <span className="text-[10px] tracking-tight">{DESTINATION_PRESETS[reg].region}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Institution / Bank Select */}
              <div>
                <label className="font-bold text-slate-300 block mb-1 font-sans">
                  Payment Method / Banking Institution ({DESTINATION_PRESETS[selectedRegion].currency})
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-pitch-950 border border-pitch-800 rounded-xl px-3.5 py-2.5 text-slate-100 font-sans focus:outline-none focus:border-emerald-500"
                >
                  {DESTINATION_PRESETS[selectedRegion].options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                  <option value="Other">Other Bank / Custom Provider...</option>
                </select>
              </div>

              {bankName === "Other" && (
                <div>
                  <label className="font-bold text-slate-300 block mb-1 font-sans">
                    Custom Bank / Institution Name <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter full bank or provider name"
                    value={customBankName}
                    onChange={(e) => setCustomBankName(e.target.value)}
                    className="w-full bg-pitch-950 border border-pitch-800 rounded-xl px-3.5 py-2.5 text-slate-100 font-sans focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              )}

              {/* Account Number / Phone */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-300 font-sans">
                    {DESTINATION_PRESETS[selectedRegion].accountLabel}
                  </label>
                  <span className="text-[10px] font-bold text-red-400 font-mono">* Required</span>
                </div>
                <input
                  type="text"
                  placeholder={DESTINATION_PRESETS[selectedRegion].accountPlaceholder}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full bg-pitch-950 border border-pitch-800 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Account Holder Name */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-300 font-sans">
                    Account Holder Full Legal Name
                  </label>
                  <span className="text-[10px] font-bold text-red-400 font-mono">* Required</span>
                </div>
                <input
                  type="text"
                  placeholder="Must match government ID / bank passbook exactly"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  className="w-full bg-pitch-950 border border-pitch-800 rounded-xl px-3.5 py-2.5 text-slate-100 font-sans focus:outline-none focus:border-emerald-500"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1 font-sans">
                  Payouts with mismatched beneficiary names will be held for manual compliance review.
                </p>
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
                  className="px-6 py-2.5 font-bold uppercase tracking-wider text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors shadow-md"
                >
                  {isSubmittingAccount ? "Saving..." : "Save Payout Destination"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
