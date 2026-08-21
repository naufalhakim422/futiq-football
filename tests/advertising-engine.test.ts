import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { AdProviderRegistry } from "../src/lib/ads/ad-provider-registry";
import { AdsterraProvider } from "../src/lib/ads/adsterra.provider";
import { DirectSponsorProvider } from "../src/lib/ads/direct-sponsor.provider";
import { HouseAdProvider } from "../src/lib/ads/house-ad.provider";
import { MockAdProvider } from "../src/lib/ads/mock-ad.provider";
import { PopunderPolicyService } from "../src/lib/ads/popunder-policy.service";
import { CampaignService } from "../src/lib/ads/campaign.service";
import { SponsorService } from "../src/lib/ads/sponsor.service";
import { AdPlacementService } from "../src/lib/ads/ad-placement.service";
import { AdAuditService } from "../src/lib/ads/ad-audit.service";
import { AdPlacementPosition } from "@prisma/client";

describe("Sprint 6 — Upgraded Advertising Engine & Sponsor Platform Suite", () => {
  const campaignService = CampaignService.getInstance();
  const sponsorService = SponsorService.getInstance();
  let testCampaignId = "";
  let testSponsorId = "";

  before(async () => {
    const spon = await sponsorService.createSponsor({
      companyName: "Nike Football Global",
      contactName: "Marcus Vance",
      email: "marcus.vance@nike.com",
    });
    testSponsorId = spon.id;

    const camp = await campaignService.createCampaign({
      campaignName: "Nike Football Boots — August Campaign",
      sponsorId: spon.id,
      providerId: "sponsor-direct",
      type: "DIRECT_SPONSOR",
      pricingModel: "FLAT_RATE",
      agreedPriceMinor: 500000,
      currency: "MYR",
      startAt: "2026-01-01T00:00:00Z",
      endAt: "2026-12-31T23:59:59Z",
      priority: 100,
      targetCategory: "Tactical Analysis",
      targetCompetition: "Premier League",
      creatives: [
        {
          id: "crt_nike_test_01",
          campaignId: "",
          name: "Nike Elite Boots Leaderboard",
          format: "BANNER",
          title: "Nike Football Performance Collection 2026",
          description: "Engineered for lethal accuracy",
          imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
          mobileImageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
          targetUrl: "https://www.nike.com/football",
          status: "ACTIVE",
          approvalState: "APPROVED",
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        },
      ],
    });
    testCampaignId = camp.id;
  });

  after(async () => {
    if (testCampaignId) {
      await campaignService.deleteCampaign(testCampaignId);
    }
    if (testSponsorId) {
      await sponsorService.deleteSponsor(testSponsorId);
    }
  });

  /* =========================================================
     1. PROVIDER ABSTRACTION & CAPABILITIES
     ========================================================= */
  describe("1. Provider Abstraction & Capabilities", () => {
    const registry = AdProviderRegistry.getInstance();
    const adsterra = new AdsterraProvider();
    const directSponsor = new DirectSponsorProvider();
    const houseAd = new HouseAdProvider();
    const mockAd = new MockAdProvider();

    it("registers and resolves all provider adapters dynamically", () => {
      assert.ok(registry.getProvider("adsterra"));
      assert.ok(registry.getProvider("sponsor-direct"));
      assert.ok(registry.getProvider("house-ad"));
      assert.ok(registry.getProvider("mock-ad-provider"));
      assert.equal(registry.listProviders().length >= 4, true);
    });

    it("declares exact capabilities for Adsterra network", () => {
      assert.equal(adsterra.supportsFormat("BANNER"), true);
      assert.equal(adsterra.supportsFormat("NATIVE"), true);
      assert.equal(adsterra.supportsFormat("SOCIAL_BAR"), true);
      assert.equal(adsterra.supportsFormat("POPUNDER"), true);
      assert.equal(adsterra.supportsFormat("SMARTLINK"), true);
      assert.equal(adsterra.supportsFormat("SPONSORED_ARTICLE"), false);
    });

    it("declares exact capabilities for Direct Sponsor platform", () => {
      assert.equal(directSponsor.supportsFormat("BANNER"), true);
      assert.equal(directSponsor.supportsFormat("IMAGE_LINK"), true);
      assert.equal(directSponsor.supportsFormat("NATIVE"), true);
      assert.equal(directSponsor.supportsFormat("SPONSORED_CARD"), true);
      assert.equal(directSponsor.supportsFormat("VIDEO"), true);
      assert.equal(directSponsor.supportsFormat("CUSTOM_SAFE"), true);
    });

    it("declares exact capabilities for FUTIQ House Ad engine", () => {
      assert.equal(houseAd.supportsFormat("BANNER"), true);
      assert.equal(houseAd.supportsFormat("NATIVE"), true);
      assert.equal(houseAd.supportsFormat("SPONSORED_CARD"), true);
      assert.equal(houseAd.supportsFormat("TEXT_LINK"), true);
    });
  });

  /* =========================================================
     2. TARGETING, PRIORITY SCORING & CONTEXT BONUS
     ========================================================= */
  describe("2. Targeting, Priority Scoring & Context Matching", () => {
    it("prioritizes Direct Sponsor (P100) over Adsterra (P50) and House Ad (P10)", async () => {
      const creative = await campaignService.resolveMatchingCreative(
        { position: AdPlacementPosition.ARTICLE_TOP, device: "DESKTOP" },
        "slot_article_top"
      );

      assert.ok(creative);
      assert.equal(creative.providerType, "DIRECT_SPONSOR");
      assert.equal(creative.priority, 100);
      assert.match(creative.title, /Nike/i);
    });

    it("applies contextual bonus for Premier League and Tactical Analysis", async () => {
      const creative = await campaignService.resolveMatchingCreative(
        {
          position: AdPlacementPosition.ARTICLE_TOP,
          competitionCode: "Premier League",
          category: "Tactical Analysis",
        },
        "slot_article_top"
      );

      assert.ok(creative);
      assert.equal(creative.sponsorName, "Nike Football Global");
    });

    it("delivers mobile-specific image asset when device is MOBILE", async () => {
      const creative = await campaignService.resolveMatchingCreative(
        { position: AdPlacementPosition.HOME_TOP, device: "MOBILE" },
        "slot_home_top"
      );

      assert.ok(creative);
      assert.ok(creative.imageUrl);
    });
  });

  /* =========================================================
     3. DYNAMIC FALLBACK SYSTEM
     ========================================================= */
  describe("3. Dynamic Fallback System", () => {
    const adPlacementService = AdPlacementService.getInstance();

    it("resolves graceful fallback creative without throwing errors", async () => {
      const creative = await adPlacementService.getAdForPlacement({
        position: AdPlacementPosition.HOME_TOP,
        device: "DESKTOP",
      });

      assert.ok(creative);
      assert.ok(creative.title);
      assert.ok(creative.targetUrl || creative.clickUrl);
      assert.equal(creative.isSandboxed, true);
    });
  });

  /* =========================================================
     4. POPUNDER POLICY & ANTI-ABUSE CONTROLS
     ========================================================= */
  describe("4. Popunder Policy & Anti-Abuse Controls", () => {
    const policyService = PopunderPolicyService.getInstance();

    it("blocks popunder when globally disabled", () => {
      const trigger = policyService.evaluateTrigger({
        route: "/news/match-preview",
        device: "DESKTOP",
      });

      assert.equal(trigger.allowed, false);
      assert.match(trigger.reason || "", /globally disabled/i);
    });

    it("strictly blocks popunders on administrative and authentication routes", async () => {
      // Temporarily enable policy
      await policyService.updatePolicy({ enabled: true, mobileEnabled: true });

      const adminCheck = policyService.evaluateTrigger({ route: "/admin/advertising", device: "DESKTOP" });
      assert.equal(adminCheck.allowed, false);
      assert.match(adminCheck.reason || "", /blacklisted/i);

      const authCheck = policyService.evaluateTrigger({ route: "/auth/login", device: "DESKTOP" });
      assert.equal(authCheck.allowed, false);

      const contributorCheck = policyService.evaluateTrigger({ route: "/contributor/earnings", device: "DESKTOP" });
      assert.equal(contributorCheck.allowed, false);
    });

    it("enforces session frequency cap and cooldown intervals", () => {
      const capCheck = policyService.evaluateTrigger({
        route: "/news/arsenal",
        device: "DESKTOP",
        sessionImpressionsCount: 2, // Max allowed is 1
      });
      assert.equal(capCheck.allowed, false);
      assert.match(capCheck.reason || "", /cap reached/i);

      const cooldownCheck = policyService.evaluateTrigger({
        route: "/news/arsenal",
        device: "DESKTOP",
        lastTriggeredTimestamp: Date.now() - 60000, // 1 minute ago (cooldown is 1800s)
      });
      assert.equal(cooldownCheck.allowed, false);
      assert.match(cooldownCheck.reason || "", /cooldown active/i);
    });
  });

  /* =========================================================
     5. SMARTLINK & CLICK SECURITY
     ========================================================= */
  describe("5. SmartLink & Click Security", () => {
    const adService = AdPlacementService.getInstance();

    it("strictly rejects dangerous script tags and event handlers in custom markup", () => {
      const badScript = '<script>document.location="http://attacker.com"</script>';
      assert.throws(() => adService.sanitizeCustomMarkup(badScript), /dangerous scripts/i);

      const badHandler = '<img src="valid.jpg" onerror="stealSession()"/>';
      assert.throws(() => adService.sanitizeCustomMarkup(badHandler), /dangerous scripts/i);

      const badIframe = '<iframe src="http://evil.com"></iframe>';
      assert.throws(() => adService.sanitizeCustomMarkup(badIframe), /dangerous scripts/i);
    });

    it("strictly rejects javascript: and data: URI schemes", () => {
      const badJsUri = 'javascript:alert("XSS")';
      assert.throws(() => adService.sanitizeCustomMarkup(badJsUri), /dangerous scripts/i);

      const badDataUri = 'data:text/html,<script>alert(1)</script>';
      assert.throws(() => adService.sanitizeCustomMarkup(badDataUri), /dangerous scripts/i);
    });

    it("accepts safe HTTPS image URLs and plain text", () => {
      const safeImg = "https://images.unsplash.com/photo-1542291026-7eec264c27ff";
      const result = adService.sanitizeCustomMarkup(safeImg);
      assert.equal(result, safeImg);
    });
  });

  /* =========================================================
     6. DIRECT SPONSOR CRM & AUDIT TRAIL
     ========================================================= */
  describe("6. Direct Sponsor CRM & Operations Audit Trail", () => {
    const sponsorService = SponsorService.getInstance();
    const auditService = AdAuditService.getInstance();

    it("creates, retrieves, and updates direct sponsors", async () => {
      const sponsor = await sponsorService.createSponsor({
        companyName: "Puma Football Hub",
        contactName: "Hans Richter",
        email: "hans@puma.com",
        website: "https://puma.com/football",
        status: "ACTIVE",
      });

      assert.ok(sponsor.id);
      assert.equal(sponsor.companyName, "Puma Football Hub");

      const fetched = await sponsorService.getSponsorById(sponsor.id);
      assert.ok(fetched);
      assert.equal(fetched.contactName, "Hans Richter");
    });

    it("records immutable audit log entries for advertising operations", async () => {
      const log = await auditService.logAction({
        actorId: "superadmin_01",
        actorEmail: "admin@futiq.com",
        action: "CREATE_CAMPAIGN",
        entityType: "CAMPAIGN",
        entityId: "camp_test_99",
        details: "Created test campaign for Puma Football",
        ipAddress: "192.168.1.100",
      });

      assert.ok(log.id);
      assert.equal(log.action, "CREATE_CAMPAIGN");
      assert.ok(log.ipHash); // IP must be hashed for privacy

      const logs = await auditService.listLogs(10);
      assert.ok(logs.length > 0);
    });
  });
});
