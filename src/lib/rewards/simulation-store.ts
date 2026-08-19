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
  public availableBalanceMinor: number = 3000; // $30.00 USD remaining after $20 withdrawal
  public heldBalanceMinor: number = 2000; // $20.00 USD held in withdrawal
  public lifetimeEarningsMinor: number = 5000; // $50.00 USD
  public lifetimeWithdrawnMinor: number = 0;

  public withdrawals: SimulatedWithdrawal[] = [
    {
      id: "with_sim_20usd",
      contributorProfileId: "prof_naufal_dev",
      amountMinor: 2000, // $20.00 USD
      bankName: "BCA (Bank Central Asia)",
      accountNumberMasked: "•••• 8821",
      accountHolderName: "Naufal (Developer & Contributor)",
      status: "PENDING_REVIEW",
      createdAt: new Date(),
      targetCurrency: "IDR",
      targetAmountFormatted: "Rp 320.000",
      contributorProfile: {
        penName: "Naufal (Developer & Contributor)",
        displayName: "Naufal (Developer & Contributor)",
        user: {
          email: "dev.contributor@futiq.com",
          fullName: "Naufal (Developer & Contributor)",
        },
      },
    },
  ];

  public payouts: any[] = [];
  public fraudSignals: any[] = [];
  public auditLogs: any[] = [
    {
      id: "audit_sim_01",
      action: "WITHDRAWAL_REQUESTED",
      entityType: "WithdrawalRequest",
      reason: "Contributor requested $20.00 USD payout to BCA •••• 8821",
      amountMinor: 2000,
      createdAt: new Date(),
    },
  ];

  public addWithdrawal(amountMinor: number, bankName: string, accountMasked: string, holderName: string) {
    this.heldBalanceMinor += amountMinor;
    this.availableBalanceMinor = Math.max(0, this.availableBalanceMinor - amountMinor);

    const newW: SimulatedWithdrawal = {
      id: `with_sim_${Date.now()}`,
      contributorProfileId: "prof_naufal_dev",
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
          email: "dev.contributor@futiq.com",
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
