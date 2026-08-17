import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PayoutPolicyService } from "../src/lib/rewards/payout-policy.service";
import { PayoutStateMachine } from "../src/lib/rewards/payout-state-machine";
import { PayoutWebhookService } from "../src/lib/rewards/payout-webhook.service";
import { PayoutProviderRouter } from "../src/lib/rewards/payout-router";
import { AdPlacementService } from "../src/lib/ads/ad-placement.service";
import { MockAdProvider } from "../src/lib/ads/mock-ad.provider";
import { AnalyticsService } from "../src/lib/analytics/analytics.service";
import { WithdrawalStatus, PayoutStatus, Currency, AdPlacementPosition } from "@prisma/client";
import crypto from "crypto";

const AnalyticsEventTypeEnum = {
  PAGE_VIEW: "PAGE_VIEW" as const,
  ARTICLE_VIEW: "ARTICLE_VIEW" as const,
  ARTICLE_READ: "ARTICLE_READ" as const,
  SCROLL_DEPTH: "SCROLL_DEPTH" as const,
  SESSION_START: "SESSION_START" as const,
  AD_IMPRESSION: "AD_IMPRESSION" as const,
  AD_CLICK: "AD_CLICK" as const,
};

describe("Sprint 6 — Production Automatic Payout, Advertising & Analytics Suite", () => {
  /* =========================================================
     1. PAYOUT STATE MACHINE TESTS
     ========================================================= */
  describe("1. Payout State Machine Invariants", () => {
    it("allows valid normal withdrawal transitions: PENDING -> RISK_CHECKING -> AUTO_APPROVED -> PROCESSING -> PAID", () => {
      assert.equal(PayoutStateMachine.canTransitionWithdrawal(WithdrawalStatus.PENDING_REVIEW, WithdrawalStatus.RISK_CHECKING), true);
      assert.equal(PayoutStateMachine.canTransitionWithdrawal(WithdrawalStatus.RISK_CHECKING, WithdrawalStatus.AUTO_APPROVED), true);
      assert.equal(PayoutStateMachine.canTransitionWithdrawal(WithdrawalStatus.AUTO_APPROVED, WithdrawalStatus.PROCESSING), true);
      assert.equal(PayoutStateMachine.canTransitionWithdrawal(WithdrawalStatus.PROCESSING, WithdrawalStatus.PAID), true);
    });

    it("allows manual review transition flow: PENDING -> MANUAL_REVIEW -> APPROVED -> PROCESSING -> PAID", () => {
      assert.equal(PayoutStateMachine.canTransitionWithdrawal(WithdrawalStatus.PENDING_REVIEW, WithdrawalStatus.MANUAL_REVIEW), true);
      assert.equal(PayoutStateMachine.canTransitionWithdrawal(WithdrawalStatus.MANUAL_REVIEW, WithdrawalStatus.APPROVED), true);
      assert.equal(PayoutStateMachine.canTransitionWithdrawal(WithdrawalStatus.APPROVED, WithdrawalStatus.PROCESSING), true);
      assert.equal(PayoutStateMachine.canTransitionWithdrawal(WithdrawalStatus.PROCESSING, WithdrawalStatus.PAID), true);
    });

    it("allows failed payout retry flow: PROCESSING -> FAILED -> RETRY_PENDING -> PROCESSING -> PAID", () => {
      assert.equal(PayoutStateMachine.canTransitionWithdrawal(WithdrawalStatus.PROCESSING, WithdrawalStatus.FAILED), true);
      assert.equal(PayoutStateMachine.canTransitionWithdrawal(WithdrawalStatus.FAILED, WithdrawalStatus.RETRY_PENDING), true);
      assert.equal(PayoutStateMachine.canTransitionWithdrawal(WithdrawalStatus.RETRY_PENDING, WithdrawalStatus.PROCESSING), true);
    });

    it("rejects illegal transitions (e.g. PAID -> PENDING_REVIEW or REJECTED -> PAID)", () => {
      assert.equal(PayoutStateMachine.canTransitionWithdrawal(WithdrawalStatus.PAID, WithdrawalStatus.PENDING_REVIEW), false);
      assert.equal(PayoutStateMachine.canTransitionWithdrawal(WithdrawalStatus.REJECTED, WithdrawalStatus.PAID), false);
      assert.equal(PayoutStateMachine.canTransitionPayout(PayoutStatus.PAID, PayoutStatus.PROCESSING), false);
    });
  });

  /* =========================================================
     2. PAYOUT POLICY & SECURITY BOUNDS
     ========================================================= */
  describe("2. Payout Policy & Hard Financial Bounds", () => {
    it("enforces hard security lower bound on minimum withdrawal", () => {
      assert.equal(PayoutPolicyService.HARD_MINIMUM_WITHDRAWAL_MINOR, 1000); // RM 10.00
      assert.equal(PayoutPolicyService.HARD_MAX_AUTOMATIC_LIMIT_MINOR, 200000); // RM 2,000.00
      assert.equal(PayoutPolicyService.HARD_MAX_RISK_SCORE_FOR_AUTO, 40);
    });
  });

  /* =========================================================
     3. PAYOUT WEBHOOK SECURITY & SIGNATURE VALIDATION
     ========================================================= */
  describe("3. Payout Webhook HMAC Signature & Idempotency", () => {
    const webhookService = PayoutWebhookService.getInstance();
    const secret = "mock-webhook-secret-key-123456";

    it("verifies valid HMAC-SHA256 signature correctly", () => {
      const payload = JSON.stringify({
        eventId: "evt_123456",
        eventType: "PAYOUT_COMPLETED",
        payoutId: "pay_test_01",
        status: "SUCCESS",
        amountMinor: 5000,
      });

      const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
      const isValid = webhookService.verifySignature(payload, signature);
      assert.equal(isValid, true);
    });

    it("rejects invalid or tampered HMAC signature", () => {
      const payload = JSON.stringify({ eventId: "evt_tampered", amountMinor: 999999 });
      const badSignature = "0000000000000000000000000000000000000000000000000000000000000000";

      const isValid = webhookService.verifySignature(payload, badSignature);
      assert.equal(isValid, false);
    });

    it("rejects missing signature", () => {
      const payload = JSON.stringify({ eventId: "evt_no_sig" });
      const isValid = webhookService.verifySignature(payload, null);
      assert.equal(isValid, false);
    });
  });

  /* =========================================================
     4. PROVIDER ROUTING LAYER
     ========================================================= */
  describe("4. Provider Router Abstraction", () => {
    const router = PayoutProviderRouter.getInstance();

    it("resolves default provider adapter for MYR bank payout", () => {
      const route = router.resolveProvider({
        country: "MY",
        currency: Currency.MYR,
        payoutMethod: "BANK",
        amountMinor: 5000,
      });

      assert.ok(route.provider);
      assert.equal(route.provider.providerName, "mock-payout-provider");
      assert.equal(route.routeKey, "MY_MYR_BANK");
      assert.equal(route.capabilities.supportsWebhooks, true);
    });
  });

  /* =========================================================
     5. ADVERTISING SYSTEM & XSS SANITIZATION
     ========================================================= */
  describe("5. Advertising System & XSS Sanitization", () => {
    const adService = AdPlacementService.getInstance();
    const mockProvider = new MockAdProvider();

    it("returns sandboxed mock creative without executable script tags", async () => {
      const creative = await mockProvider.getCreative(
        { position: AdPlacementPosition.HOME_TOP },
        "slot_home_top"
      );

      assert.ok(creative);
      assert.equal(creative.isSandboxed, true);
      assert.match(creative.title, /Official Matchday Experience/);
      assert.ok(creative.imageUrl);
    });

    it("strictly rejects arbitrary script tags in custom markup", () => {
      const dangerousScript = '<script>alert("XSS")</script><img src="banner.jpg"/>';
      assert.throws(
        () => adService.sanitizeCustomMarkup(dangerousScript),
        /dangerous scripts or event handlers/i
      );
    });

    it("strictly rejects javascript: URI schemes and onerror attributes", () => {
      const dangerousUri = '<a href="javascript:stealCookie()">Click</a>';
      const dangerousAttr = '<img src="x" onerror="stealSession()"/>';

      assert.throws(() => adService.sanitizeCustomMarkup(dangerousUri));
      assert.throws(() => adService.sanitizeCustomMarkup(dangerousAttr));
    });

    it("accepts safe image banners and links", () => {
      const safeContent = "https://images.unsplash.com/photo-sponsor.jpg";
      const sanitized = adService.sanitizeCustomMarkup(safeContent);
      assert.equal(sanitized, safeContent);
    });
  });

  /* =========================================================
     6. PRIVACY-AWARE ANALYTICS FOUNDATION
     ========================================================= */
  describe("6. Privacy-Aware Analytics", () => {
    const analytics = AnalyticsService.getInstance();

    it("filters bot traffic from analytics ingestion", async () => {
      const result = await analytics.trackEvent({
        eventType: AnalyticsEventTypeEnum.PAGE_VIEW,
        userAgent: "Googlebot/2.1 (+http://www.google.com/bot.html)",
        ipAddress: "66.249.66.1",
      });

      assert.equal(result.recorded, false);
      assert.match(result.reason || "", /Bot event ignored/i);
    });

    it("ingests human reader event with anonymized telemetry", async () => {
      const result = await analytics.trackEvent({
        eventType: AnalyticsEventTypeEnum.ARTICLE_READ,
        articleId: "test_art_01",
        sessionFingerprint: `sess_${Date.now()}_${Math.random()}`,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        scrollDepthPercent: 75,
        readTimeSeconds: 45,
      });

      assert.equal(result.recorded, true);
    });
  });
});
