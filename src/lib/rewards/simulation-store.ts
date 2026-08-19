// Shared in-memory simulation store for Developer Mode & DB fallback

export interface SimulatedWithdrawal {
  id: string;
  contributorProfileId: string;
  amountMinor: number;
  bankName: string;
  accountNumberMasked: string;
  accountHolderName: string;
  status: "PENDING_REVIEW" | "APPROVED" | "PAID" | "REJECTED";
  createdAt: string | Date;
  targetCurrency?: string;
  targetAmountFormatted?: string;
  contributorProfile?: {
    penName?: string;
    displayName?: string;
    user?: {
      email?: string;
      fullName?: string;
    };
  };
  payout?: {
    id: string;
    status: string;
    paidAt?: string | Date;
    provider?: string;
  };
}

class SimulationStore {
  public availableBalanceMinor: number = 10000; // $100.00 USD
  public heldBalanceMinor: number = 0;
  public lifetimeEarningsMinor: number = 10000; // $100.00 USD
  public lifetimeWithdrawnMinor: number = 0;

  public withdrawals: SimulatedWithdrawal[] = [];
  public payouts: any[] = [];
  public fraudSignals: any[] = [];
  public auditLogs: any[] = [];

  public addWithdrawal(amountMinor: number, bankName: string, accountMasked: string, holderName: string) {
    this.heldBalanceMinor += amountMinor;
    this.availableBalanceMinor = Math.max(0, this.availableBalanceMinor - amountMinor);

    const newW: SimulatedWithdrawal = {
      id: `with_sim_${Date.now()}`,
      contributorProfileId: "prof_naufal_pure_contributor",
      amountMinor,
      bankName,
      accountNumberMasked: accountMasked,
      accountHolderName: holderName,
      status: "PENDING_REVIEW",
      createdAt: new Date(),
      contributorProfile: {
        penName: holderName,
        displayName: holderName,
        user: {
          email: "naufal.contributor@futiq.com",
          fullName: holderName,
        },
      },
    };

    this.withdrawals.unshift(newW);
    return newW;
  }

  public approveWithdrawal(id: string) {
    const item = this.withdrawals.find((w) => w.id === id);
    if (item) {
      item.status = "APPROVED";
      item.payout = {
        id: `pay_${Date.now()}`,
        status: "PROCESSING",
        provider: "Hyperwallet / Manual Swift",
      };
      this.payouts.unshift(item);
    }
  }

  public rejectWithdrawal(id: string, reason: string) {
    const item = this.withdrawals.find((w) => w.id === id);
    if (item) {
      item.status = "REJECTED";
      this.availableBalanceMinor += item.amountMinor;
      this.heldBalanceMinor = Math.max(0, this.heldBalanceMinor - item.amountMinor);
      this.auditLogs.unshift({
        id: `audit_${Date.now()}`,
        action: "WITHDRAWAL_REJECTED",
        entityType: "WithdrawalRequest",
        reason: `Rejected: ${reason}`,
        amountMinor: item.amountMinor,
        createdAt: new Date(),
      });
    }
  }
}

// Global singleton
const globalForSim = global as unknown as { simulationStore?: SimulationStore };
export const simulationStore = globalForSim.simulationStore || new SimulationStore();
if (process.env.NODE_ENV !== "production") globalForSim.simulationStore = simulationStore;
