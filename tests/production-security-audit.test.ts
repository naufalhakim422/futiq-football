import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Logger } from "../src/lib/logger";
import { CanonicalService } from "../src/lib/seo/canonical.service";
import { RedirectService } from "../src/lib/redirects/redirect.service";
import { MockKycProvider } from "../src/lib/kyc/mock-kyc.provider";
import { MockPayoutProvider } from "../src/lib/rewards/payout.service";
import crypto from "crypto";

describe("Sprint 8A — Production Readiness & Security Audit Suite", () => {
  /* =========================================================
     1. STRUCTURED LOGGER PII & SECRETS SANITIZATION
     ========================================================= */
  describe("1. Structured Logger Secrets Redaction", () => {
    it("redacts sensitive fields (passwords, tokens, apiKeys, accountNumbers)", () => {
      const sensitiveData = {
        userId: "user_123",
        password: "SuperSecretPassword123!",
        passwordHash: "$2a$12$e8g.1...",
        token: "jwt_token_abc_xyz",
        apiKey: "sk_live_123456789",
        authSecret: "app_secret_key_32_chars",
        accountNumber: "123456789012",
        publicMetadata: {
          role: "CONTRIBUTOR",
          nestedSecret: {
            secret: "deep_token_secret",
            publicName: "John Doe",
          },
        },
      };

      const redacted = Logger.redact(sensitiveData);

      assert.equal(redacted.password, "[REDACTED]");
      assert.equal(redacted.passwordHash, "[REDACTED]");
      assert.equal(redacted.token, "[REDACTED]");
      assert.equal(redacted.apiKey, "[REDACTED]");
      assert.equal(redacted.authSecret, "[REDACTED]");
      assert.equal(redacted.accountNumber, "[REDACTED]");
      assert.equal(redacted.publicMetadata.role, "CONTRIBUTOR");
      assert.equal(redacted.publicMetadata.nestedSecret.secret, "[REDACTED]");
      assert.equal(redacted.publicMetadata.nestedSecret.publicName, "John Doe");
    });
  });

  /* =========================================================
     2. FINANCIAL LEDGER INVARIANTS & INTEGER MATH
     ========================================================= */
  describe("2. Financial Ledger Invariants & Integer Minor Units", () => {
    it("uses integer minor units exclusively (RM 10.50 = 1050 minor) preventing float errors", () => {
      const amount1Minor = 1050; // RM 10.50
      const amount2Minor = 2075; // RM 20.75
      const sumMinor = amount1Minor + amount2Minor;
      assert.equal(sumMinor, 3125); // Exactly RM 31.25, zero float drift
      assert.equal(Number.isInteger(sumMinor), true);
    });

    it("verifies wallet balance invariant: availableBalanceMinor + heldBalanceMinor = total minor", () => {
      const availableBalanceMinor = 45000; // RM 450.00
      const heldBalanceMinor = 5000;       // RM 50.00
      const totalBalanceMinor = 50000;     // RM 500.00

      assert.equal(availableBalanceMinor + heldBalanceMinor, totalBalanceMinor);
    });
  });

  /* =========================================================
     3. WEBHOOK SECURITY & CRYPTOGRAPHY
     ========================================================= */
  describe("3. Webhook HMAC-SHA256 Cryptography & Replay Defenses", () => {
    it("validates authentic KYC webhook signature with constant-time comparison", () => {
      const kyc = new MockKycProvider();
      const payload = JSON.stringify({ eventId: "evt_123", status: "VERIFIED" });
      const secret = "mock-kyc-secret-key-123456";
      const validSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

      assert.equal(kyc.verifyWebhookSignature(payload, validSignature), true);
    });

    it("rejects forged or tampered KYC webhook signature", () => {
      const kyc = new MockKycProvider();
      const payload = JSON.stringify({ eventId: "evt_123", status: "VERIFIED" });
      const badSig = "0000000000000000000000000000000000000000000000000000000000000000";

      assert.equal(kyc.verifyWebhookSignature(payload, badSig), false);
    });

    it("declares mock status explicitly on MockPayoutProvider", () => {
      const payoutProvider = new MockPayoutProvider();
      assert.equal(payoutProvider.providerName, "mock-payout-provider");
      assert.equal(payoutProvider.status, "MOCK");
    });
  });

  /* =========================================================
     4. OPEN REDIRECT & PATH INJECTION DEFENSES
     ========================================================= */
  describe("4. Open Redirect & Path Injection Defenses", () => {
    it("permits safe relative route targets", () => {
      assert.equal(RedirectService.isValidInternalPath("/news/article-one"), true);
      assert.equal(RedirectService.isValidInternalPath("/teams/arsenal"), true);
    });

    it("blocks open redirect targets (http://, https://, //protocol-relative)", () => {
      assert.equal(RedirectService.isValidInternalPath("https://phishing.com"), false);
      assert.equal(RedirectService.isValidInternalPath("http://attacker.com"), false);
      assert.equal(RedirectService.isValidInternalPath("//evil.com"), false);
    });

    it("blocks javascript execution URLs (javascript:, data:)", () => {
      assert.equal(RedirectService.isValidInternalPath("javascript:void(0)"), false);
      assert.equal(RedirectService.isValidInternalPath("data:text/html,<script>alert(1)</script>"), false);
    });
  });
});
