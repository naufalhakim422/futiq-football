import { WithdrawalStatus, PayoutStatus } from "@prisma/client";

export class PayoutStateMachine {
  /**
   * Allowed state transitions for WithdrawalRequest
   */
  private static readonly WITHDRAWAL_TRANSITIONS: Record<WithdrawalStatus, WithdrawalStatus[]> = {
    PENDING_REVIEW: [WithdrawalStatus.RISK_CHECKING, WithdrawalStatus.MANUAL_REVIEW, WithdrawalStatus.REJECTED, WithdrawalStatus.CANCELLED],
    RISK_CHECKING: [WithdrawalStatus.AUTO_APPROVED, WithdrawalStatus.MANUAL_REVIEW, WithdrawalStatus.REJECTED],
    AUTO_APPROVED: [WithdrawalStatus.PROCESSING, WithdrawalStatus.MANUAL_REVIEW, WithdrawalStatus.REJECTED],
    MANUAL_REVIEW: [WithdrawalStatus.APPROVED, WithdrawalStatus.REJECTED, WithdrawalStatus.CANCELLED],
    WITHDRAWAL_HOLD: [WithdrawalStatus.APPROVED, WithdrawalStatus.REJECTED],
    APPROVED: [WithdrawalStatus.PROCESSING, WithdrawalStatus.REJECTED],
    PROCESSING: [WithdrawalStatus.PAID, WithdrawalStatus.FAILED],
    FAILED: [WithdrawalStatus.RETRY_PENDING, WithdrawalStatus.REJECTED],
    RETRY_PENDING: [WithdrawalStatus.PROCESSING, WithdrawalStatus.REJECTED],
    PAID: [], // Terminal normal state (Reversal handled at ledger level)
    REJECTED: [], // Terminal rejected state
    CANCELLED: [], // Terminal cancelled state
  };

  /**
   * Allowed state transitions for Payout entity
   */
  private static readonly PAYOUT_TRANSITIONS: Record<PayoutStatus, PayoutStatus[]> = {
    PENDING_REVIEW: [PayoutStatus.APPROVED, PayoutStatus.REJECTED],
    APPROVED: [PayoutStatus.PROCESSING, PayoutStatus.REJECTED],
    PROCESSING: [PayoutStatus.PAID, PayoutStatus.FAILED, PayoutStatus.RECONCILIATION_REQUIRED],
    FAILED: [PayoutStatus.PROCESSING, PayoutStatus.REJECTED, PayoutStatus.RECONCILIATION_REQUIRED],
    PAID: [PayoutStatus.REVERSED], // Only allowable through audited reversal
    REJECTED: [],
    REVERSED: [],
    RECONCILIATION_REQUIRED: [PayoutStatus.PAID, PayoutStatus.FAILED, PayoutStatus.REJECTED],
  };

  /**
   * Validate if a withdrawal status transition is allowed
   */
  public static canTransitionWithdrawal(
    currentStatus: WithdrawalStatus,
    targetStatus: WithdrawalStatus
  ): boolean {
    if (currentStatus === targetStatus) return true;
    const allowed = this.WITHDRAWAL_TRANSITIONS[currentStatus] || [];
    return allowed.includes(targetStatus);
  }

  /**
   * Validate if a payout status transition is allowed
   */
  public static canTransitionPayout(
    currentStatus: PayoutStatus,
    targetStatus: PayoutStatus
  ): boolean {
    if (currentStatus === targetStatus) return true;
    const allowed = this.PAYOUT_TRANSITIONS[currentStatus] || [];
    return allowed.includes(targetStatus);
  }
}
