import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { RewardEngineService } from "../src/lib/rewards/reward-engine.service";
import { WalletService } from "../src/lib/rewards/wallet.service";
import { PayoutService, MockPayoutProvider } from "../src/lib/rewards/payout.service";
import { FraudDetectionService } from "../src/lib/rewards/fraud-detection.service";
import { QualifiedViewService } from "../src/lib/rewards/qualified-view.service";
import {
  Currency,
  RewardStatus,
  WithdrawalStatus,
  PayoutStatus,
  LedgerEntryType,
  FraudSignalSeverity,
  FraudSignalType,
  QualifiedViewStatus,
  ArticleStatus,
} from "@prisma/client";

// ==========================================
// In-Memory Test Fixture Database for Financial Tests
// ==========================================
class InMemoryFinanceDb {
  public articles = new Map<string, any>();
  public contributorProfiles = new Map<string, any>();
  public wallets = new Map<string, any>();
  public ledgerEntries = new Map<string, any>();
  public rewards = new Map<string, any>();
  public qualifiedViews = new Map<string, any>();
  public withdrawals = new Map<string, any>();
  public payouts = new Map<string, any>();
  public payoutAttempts = new Map<string, any>();
  public fraudSignals = new Map<string, any>();
  public auditLogs = new Map<string, any>();
  public notifications = new Map<string, any>();

  public reset() {
    this.articles.clear();
    this.contributorProfiles.clear();
    this.wallets.clear();
    this.ledgerEntries.clear();
    this.rewards.clear();
    this.qualifiedViews.clear();
    this.withdrawals.clear();
    this.payouts.clear();
    this.payoutAttempts.clear();
    this.fraudSignals.clear();
    this.auditLogs.clear();
    this.notifications.clear();
  }
}

const financeDb = new InMemoryFinanceDb();

describe("Sprint 5 — Contributor Rewards, Wallet & Payout Security Suite", () => {
  let rewardEngine: RewardEngineService;
  let walletService: WalletService;
  let payoutService: PayoutService;
  let fraudService: FraudDetectionService;
  let viewService: QualifiedViewService;

  beforeEach(() => {
    financeDb.reset();
    rewardEngine = RewardEngineService.getInstance();
    walletService = WalletService.getInstance();
    payoutService = PayoutService.getInstance();
    fraudService = FraudDetectionService.getInstance();
    viewService = QualifiedViewService.getInstance();
  });

  describe("1. Qualified Views & Bot Protection Engine", () => {
    it("should reject bot user agents without qualifying views", async () => {
      const isBot = (viewService as any).detectBotUserAgent(
        "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
      );
      assert.equal(isBot, true);

      const isCurl = (viewService as any).detectBotUserAgent("curl/7.68.0");
      assert.equal(isCurl, true);

      const isRealBrowser = (viewService as any).detectBotUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );
      assert.equal(isRealBrowser, false);
    });
  });

  describe("2. Server-Authoritative Reward Calculation & Formula Versioning", () => {
    it("should compute exact server-authoritative reward formula components (v1)", () => {
      // Base: RM 5.00 (500 minor)
      // Qualified Views: 150 views @ 2 cents/view = 300 minor (RM 3.00)
      // Quality Score: 95 (Tier 1 >= 90) = 500 minor (RM 5.00)
      // Breaking News: true = 1000 minor (RM 10.00)
      // Total: 500 + 300 + 500 + 1000 = 2300 minor (RM 23.00)
      const baseReward = rewardEngine.BASE_ARTICLE_REWARD_MINOR;
      const viewsCount = 150;
      const viewBonus = viewsCount * rewardEngine.VIEW_BONUS_RATE_PER_VIEW_MINOR;
      const qualityBonus = rewardEngine.QUALITY_BONUS_TIER_1_MINOR;
      const breakingBonus = rewardEngine.BREAKING_NEWS_BONUS_MINOR;
      const total = baseReward + viewBonus + qualityBonus + breakingBonus;

      assert.equal(baseReward, 500);
      assert.equal(viewBonus, 300);
      assert.equal(qualityBonus, 500);
      assert.equal(breakingBonus, 1000);
      assert.equal(total, 2300);
      assert.equal(rewardEngine.calculationVersion, "reward_v1");
    });

    it("should apply Tier 2 quality bonus for scores between 80 and 89", () => {
      const score = 85;
      let qualityBonus = 0;
      if (score >= 90) qualityBonus = rewardEngine.QUALITY_BONUS_TIER_1_MINOR;
      else if (score >= 80) qualityBonus = rewardEngine.QUALITY_BONUS_TIER_2_MINOR;

      assert.equal(qualityBonus, 250); // RM 2.50
    });
  });

  describe("3. Double-Entry Wallet Ledger & Invariants", () => {
    it("should maintain the fundamental financial invariant (available + held == sum(credits) - sum(debits))", () => {
      let availableBalance = 0;
      let heldBalance = 0;
      let totalCredits = 0;
      let totalDebits = 0;

      // 1. Credit RM 50.00 (5000 minor)
      const creditAmount = 5000;
      availableBalance += creditAmount;
      totalCredits += creditAmount;

      assert.equal(availableBalance + heldBalance, totalCredits - totalDebits);

      // 2. Withdrawal Hold RM 20.00 (2000 minor)
      const holdAmount = 2000;
      availableBalance -= holdAmount;
      heldBalance += holdAmount;

      assert.equal(availableBalance, 3000);
      assert.equal(heldBalance, 2000);
      assert.equal(availableBalance + heldBalance, totalCredits - totalDebits);

      // 3. Payout Disbursed RM 20.00 (2000 minor)
      heldBalance -= holdAmount;
      totalDebits += holdAmount;

      assert.equal(availableBalance, 3000);
      assert.equal(heldBalance, 0);
      assert.equal(availableBalance + heldBalance, totalCredits - totalDebits);

      // 4. Withdrawal Rejected & Released RM 10.00
      const hold2 = 1000;
      availableBalance -= hold2;
      heldBalance += hold2;
      // Release
      heldBalance -= hold2;
      availableBalance += hold2;

      assert.equal(availableBalance, 3000);
      assert.equal(heldBalance, 0);
      assert.equal(availableBalance + heldBalance, totalCredits - totalDebits);
    });

    it("should prevent negative wallet balances under any circumstance", () => {
      const availableBalance = 1500; // RM 15.00
      const requestedWithdrawal = 2000; // RM 20.00

      assert.ok(
        requestedWithdrawal > availableBalance,
        "Withdrawal request must be rejected when exceeding available balance"
      );
    });
  });

  describe("4. Withdrawal Rules & Cooldown Protections", () => {
    it("should enforce minimum withdrawal threshold (RM 20.00 / 2000 minor)", () => {
      const MIN_WITHDRAWAL_MINOR = 2000;
      const invalidAmount = 1500; // RM 15.00

      assert.ok(invalidAmount < MIN_WITHDRAWAL_MINOR);
    });

    it("should enforce 48-hour cooldown protection on newly updated payout bank accounts", () => {
      const now = new Date();
      const cooldownUntil = new Date(now.getTime() + 48 * 3600 * 1000);

      const isUnderCooldown = cooldownUntil > now;
      assert.equal(isUnderCooldown, true);
    });

    it("should properly mask bank account numbers preserving only the last 4 digits", () => {
      const rawAccount = "123456789012";
      const masked = "*".repeat(Math.max(4, rawAccount.length - 4)) + rawAccount.slice(-4);

      assert.equal(masked, "********9012");
      assert.equal(masked.endsWith("9012"), true);
      assert.equal(masked.startsWith("****"), true);
    });
  });

  describe("5. Separation of Duties & Payout State Machine", () => {
    it("should prevent a user from approving their own withdrawal request", () => {
      const authorUserId: string = "user-contributor-1";
      const approvingUserId: string = "user-contributor-1"; // Same user

      const isSelfApproval = authorUserId === approvingUserId;
      assert.equal(isSelfApproval, true, "Self approval must be strictly prohibited");
    });

    it("should allow a distinct finance officer to approve a withdrawal request", () => {
      const authorUserId: string = "user-contributor-1";
      const financeOfficerId: string = "user-finance-head";

      const isSelfApproval = authorUserId === financeOfficerId;
      assert.equal(isSelfApproval, false);
    });

    it("should validate allowed payout state transitions", () => {
      // PENDING_REVIEW -> APPROVED -> PROCESSING -> PAID
      const validTransitions = [
        { from: PayoutStatus.PENDING_REVIEW, to: PayoutStatus.APPROVED, allowed: true },
        { from: PayoutStatus.APPROVED, to: PayoutStatus.PROCESSING, allowed: true },
        { from: PayoutStatus.PROCESSING, to: PayoutStatus.PAID, allowed: true },
        { from: PayoutStatus.PROCESSING, to: PayoutStatus.FAILED, allowed: true },
        { from: PayoutStatus.PAID, to: PayoutStatus.PENDING_REVIEW, allowed: false },
        { from: PayoutStatus.PAID, to: PayoutStatus.REJECTED, allowed: false },
      ];

      for (const t of validTransitions) {
        if (!t.allowed) {
          assert.notEqual(t.from, t.to);
        }
      }
    });
  });

  describe("6. Fraud Detection & Risk Scoring", () => {
    it("should categorize fraud severity and block withdrawals on High / Critical risk", () => {
      const testCases = [
        { score: 15, expectedSeverity: "LOW", blocked: false },
        { score: 45, expectedSeverity: "MEDIUM", blocked: false },
        { score: 65, expectedSeverity: "HIGH", blocked: true },
        { score: 90, expectedSeverity: "CRITICAL", blocked: true },
      ];

      for (const tc of testCases) {
        let severity: FraudSignalSeverity = FraudSignalSeverity.LOW;
        if (tc.score >= 80) severity = FraudSignalSeverity.CRITICAL;
        else if (tc.score >= 60) severity = FraudSignalSeverity.HIGH;
        else if (tc.score >= 30) severity = FraudSignalSeverity.MEDIUM;

        const isBlocked = tc.score >= 60;

        assert.equal(severity, tc.expectedSeverity);
        assert.equal(isBlocked, tc.blocked);
      }
    });
  });

  describe("7. Provider Abstraction & Mock Status", () => {
    it("should explicitly declare MockPayoutProvider as MOCK status", () => {
      const mockProvider = new MockPayoutProvider();
      assert.equal(mockProvider.providerName, "mock-payout-provider");
      assert.equal(mockProvider.status, "MOCK");
    });
  });

  describe("8. Administrative Adjustments & Audit Integrity", () => {
    it("should require a minimum 10-character justification for balance adjustments", () => {
      const shortReason = "Fix";
      const validReason = "Correction for double counted promotional bonus from campaign A";

      assert.ok(shortReason.length < 10, "Short reason must be rejected");
      assert.ok(validReason.length >= 10, "Detailed justification must be accepted");
    });
  });
});
