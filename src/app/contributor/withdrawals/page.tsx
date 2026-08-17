import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { redirect } from "next/navigation";
import { walletService } from "@/lib/rewards/wallet.service";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle, AlertTriangle, Building, ArrowUpRight, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ContributorWithdrawalsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?unauthorized=true");
  }

  const contributorProfile = await prisma.contributorProfile.findUnique({
    where: { userId: user.id },
  });

  if (!contributorProfile) {
    redirect("/contributor/apply");
  }

  const walletSummary = await walletService.getWalletSummary(contributorProfile.id);

  const withdrawals = await prisma.withdrawalRequest.findMany({
    where: { contributorProfileId: contributorProfile.id },
    include: { payout: { select: { id: true, status: true, paidAt: true, provider: true } } },
    orderBy: { createdAt: "desc" },
  });

  const formatMYR = (minor: number) => {
    return `RM ${(minor / 100).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <PageContainer className="py-8 space-y-8">
      <div>
        <Link
          href="/contributor/earnings"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Earnings Console
        </Link>
        <SectionHeader
          title="Withdrawal & Disbursement History"
          subtitle="Real-time payout processing status, automatic approval tracking, and bank settlement history"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-pitch-surface border border-pitch-border rounded-xl p-5">
          <span className="text-xs uppercase font-semibold text-muted-foreground block">
            Available Balance
          </span>
          <div className="text-2xl font-extrabold text-foreground mt-2">
            {formatMYR(walletSummary.availableBalanceMinor)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Ready for automatic withdrawal</p>
        </div>

        <div className="bg-pitch-surface border border-pitch-border rounded-xl p-5">
          <span className="text-xs uppercase font-semibold text-muted-foreground block">
            Held in Withdrawal
          </span>
          <div className="text-2xl font-extrabold text-amber-400 mt-2">
            {formatMYR(walletSummary.heldBalanceMinor)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">In flight or awaiting disbursement</p>
        </div>

        <div className="bg-pitch-surface border border-pitch-border rounded-xl p-5">
          <span className="text-xs uppercase font-semibold text-muted-foreground block">
            Total Disbursed
          </span>
          <div className="text-2xl font-extrabold text-emerald-400 mt-2">
            {formatMYR(walletSummary.lifetimeWithdrawnMinor)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Settled to bank account</p>
        </div>
      </div>

      {/* Withdrawals List */}
      <div className="space-y-4">
        <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-pitch-gold" />
          All Withdrawal Requests ({withdrawals.length})
        </h3>

        {withdrawals.length === 0 ? (
          <div className="bg-pitch-surface border border-pitch-border rounded-xl p-8 text-center text-muted-foreground text-sm">
            No withdrawal requests recorded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {withdrawals.map((w) => (
              <div
                key={w.id}
                className="bg-pitch-surface border border-pitch-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-sm text-foreground">
                      {w.bankName} • {w.accountNumberMasked}
                    </span>
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                        w.status === "PAID"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : w.status === "AUTO_APPROVED" || w.status === "APPROVED" || w.status === "PROCESSING"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : w.status === "REJECTED" || w.status === "FAILED"
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      )}
                    >
                      {w.status}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground mt-1">
                    Beneficiary: {w.accountHolderName} • Requested: {new Date(w.createdAt).toLocaleString()}
                  </p>

                  {w.rejectionReason && (
                    <p className="text-xs text-red-400 mt-1.5">Note: {w.rejectionReason}</p>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-xl font-extrabold text-foreground">
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
    </PageContainer>
  );
}
