import {
  Currency,
  QualifiedViewStatus,
  RewardStatus,
  LedgerEntryType,
  WithdrawalStatus,
  PayoutStatus,
  PayoutAttemptStatus,
  FraudSignalSeverity,
  FraudSignalType,
  FinancialAuditAction,
} from "@prisma/client";

export interface ViewEventPayload {
  articleId: string;
  sessionFingerprint: string;
  readTimeSeconds?: number;
  scrollDepthPercent?: number;
  userAgent?: string;
  ipAddress?: string;
}

export interface QualifiedViewResult {
  status: QualifiedViewStatus;
  isQualified: boolean;
  rejectionReason?: string;
  fingerprintHash: string;
}

export interface RewardCalculationResult {
  articleId: string;
  contributorProfileId: string;
  baseRewardMinor: number;
  viewBonusMinor: number;
  qualityBonusMinor: number;
  breakingBonusMinor: number;
  totalRewardMinor: number;
  qualifiedViewsCount: number;
  qualityScore: number;
  currency: Currency;
  calculationVersion: string;
  metadata: Record<string, any>;
}

export interface PayoutAccountInput {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
}

export interface WithdrawalRequestInput {
  amountMinor: number;
  idempotencyKey?: string;
}

export interface AdminAdjustmentInput {
  walletId: string;
  amountMinor: number;
  type: "CREDIT" | "DEBIT" | "ADJUSTMENT" | "REVERSAL";
  reason: string;
}

export interface FinancialAuditEntry {
  action: FinancialAuditAction;
  actorId?: string;
  contributorProfileId?: string;
  entityType: "REWARD" | "WALLET" | "WITHDRAWAL" | "PAYOUT" | "ADJUSTMENT" | "FRAUD";
  entityId: string;
  amountMinor?: number;
  currency?: Currency;
  previousState?: Record<string, any>;
  newState?: Record<string, any>;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface PayoutRecipientDetails {
  bankName: string;
  accountNumberMasked: string;
  accountHolderName: string;
}

export interface PayoutProviderResponse {
  success: boolean;
  providerReference?: string;
  errorCode?: string;
  errorMessage?: string;
  status: PayoutAttemptStatus;
}
