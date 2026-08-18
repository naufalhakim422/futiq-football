import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createSessionToken, verifySessionToken, getSessionCookieOptions } from "../src/lib/auth/session";
import { SessionUser, RoleType } from "../src/types/auth";

describe("Sprint Auth & Session Management Suite", () => {
  const mockAdminUser: SessionUser = {
    id: "usr_admin_001",
    email: "admin@futiq.com",
    fullName: "Chief Administrator",
    roles: ["SUPER_ADMIN", "EDITOR_IN_CHIEF"],
    permissions: ["*"],
  };

  const mockContributorUser: SessionUser = {
    id: "usr_contributor_001",
    email: "contributor@futiq.com",
    fullName: "Taufik Hidayat",
    roles: ["CONTRIBUTOR"],
    permissions: ["article:read", "article:write", "wallet:manage"],
  };

  /* =========================================================
     1. JWT SESSION TOKEN CREATION & VERIFICATION
     ========================================================= */
  describe("1. JWT Session Signing & Verification", () => {
    it("should generate a valid HS256 JWT session token", async () => {
      const token = await createSessionToken(mockAdminUser);
      assert.ok(typeof token === "string");
      assert.ok(token.split(".").length === 3, "JWT must contain 3 segments");
    });

    it("should correctly decode payload with roles and user details", async () => {
      const token = await createSessionToken(mockAdminUser);
      const payload = await verifySessionToken(token);

      assert.ok(payload);
      assert.equal(payload.sub, "usr_admin_001");
      assert.equal(payload.email, "admin@futiq.com");
      assert.equal(payload.fullName, "Chief Administrator");
      assert.deepEqual(payload.roles, ["SUPER_ADMIN", "EDITOR_IN_CHIEF"]);
      assert.deepEqual(payload.permissions, ["*"]);
    });

    it("should verify contributor user session with proper scoping", async () => {
      const token = await createSessionToken(mockContributorUser);
      const payload = await verifySessionToken(token);

      assert.ok(payload);
      assert.equal(payload.sub, "usr_contributor_001");
      assert.deepEqual(payload.roles, ["CONTRIBUTOR"]);
      assert.ok(payload.permissions.includes("wallet:manage"));
    });

    it("should return null for tampered or invalid token string", async () => {
      const invalidToken = "ey.invalid.signature";
      const payload = await verifySessionToken(invalidToken);
      assert.equal(payload, null);
    });
  });

  /* =========================================================
     2. COOKIE CONFIGURATION & SECURITY INVARIANTS
     ========================================================= */
  describe("2. Cookie Security Invariants", () => {
    it("should produce HTTP-only and SameSite=Lax cookie options", () => {
      const options = getSessionCookieOptions();
      assert.equal(options.name, "fmp_session_token");
      assert.equal(options.httpOnly, true);
      assert.equal(options.sameSite, "lax");
      assert.equal(options.path, "/");
      assert.equal(options.maxAge, 7 * 24 * 60 * 60); // 7 days
    });
  });
});
