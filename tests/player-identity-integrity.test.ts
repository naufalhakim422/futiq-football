import test, { describe } from "node:test";
import assert from "node:assert";
import { playerIdentityResolver } from "../src/lib/football/player-identity.resolver";

describe("Sprint Player Identity & Canonical Photo Integrity Suite", () => {
  describe("1. Canonical providerPlayerId Integrity & Normalization", () => {
    test("should extract pure numeric canonical providerPlayerId", () => {
      assert.strictEqual(playerIdentityResolver.cleanPlayerId("ply_278"), "278");
      assert.strictEqual(playerIdentityResolver.cleanPlayerId("player_154"), "154");
      assert.strictEqual(playerIdentityResolver.cleanPlayerId("ext_ply_37127"), "37127");
      assert.strictEqual(playerIdentityResolver.cleanPlayerId("104193"), "104193");
      assert.strictEqual(playerIdentityResolver.cleanPlayerId(328004), "328004");
      assert.strictEqual(playerIdentityResolver.cleanPlayerId(""), null);
      assert.strictEqual(playerIdentityResolver.cleanPlayerId(null), null);
    });

    test("should resolve canonical player records by providerPlayerId", () => {
      const mbappe = playerIdentityResolver.resolvePlayer("278");
      assert.strictEqual(mbappe.name, "Kylian Mbappé");
      assert.strictEqual(mbappe.providerPlayerId, "278");
      assert.strictEqual(mbappe.photoUrl, "https://media.api-sports.io/football/players/278.png");
      assert.strictEqual(mbappe.nationality, "France");

      const paes = playerIdentityResolver.resolvePlayer("37127");
      assert.strictEqual(paes.name, "Maarten Paes");
      assert.strictEqual(paes.providerPlayerId, "37127");
      assert.strictEqual(paes.photoUrl, "https://media.api-sports.io/football/players/37127.png");
      assert.strictEqual(paes.nationality, "Indonesia");
    });
  });

  describe("2. Photo Domain Security & Anti-Spoofing Rules", () => {
    test("should accept official API-Sports media domains matching player ID", () => {
      assert.strictEqual(
        playerIdentityResolver.validatePhotoUrl("https://media.api-sports.io/football/players/278.png", "278"),
        true
      );
      assert.strictEqual(
        playerIdentityResolver.validatePhotoUrl("https://media-4.api-sports.io/football/players/154.png", "154"),
        true
      );
      assert.strictEqual(
        playerIdentityResolver.validatePhotoUrl("/api/football/player-image?id=37127", "37127"),
        true
      );
    });

    test("should reject mismatched photo ownership where photo ID differs from player ID", () => {
      // Player 278 (Mbappé) with photo of player 154 (Messi) -> REJECTED
      assert.strictEqual(
        playerIdentityResolver.validatePhotoUrl("https://media.api-sports.io/football/players/154.png", "278"),
        false
      );
    });

    test("should strictly reject Unsplash, random CDNs, scraping, data:, and javascript: URLs", () => {
      assert.strictEqual(
        playerIdentityResolver.validatePhotoUrl("https://images.unsplash.com/photo-1507003211169?w=250", "278"),
        false
      );
      assert.strictEqual(
        playerIdentityResolver.validatePhotoUrl("https://fotmob.com/images/player.png", "278"),
        false
      );
      assert.strictEqual(
        playerIdentityResolver.validatePhotoUrl("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA", "278"),
        false
      );
      assert.strictEqual(
        playerIdentityResolver.validatePhotoUrl("javascript:alert(1)", "278"),
        false
      );
      assert.strictEqual(
        playerIdentityResolver.validatePhotoUrl("http://media.api-sports.io/football/players/278.png", "278"),
        false // Non-HTTPS rejected
      );
    });
  });

  describe("3. National Team & Club Identity Continuity", () => {
    test("should maintain identical canonical identity & photo across Club and National Team", () => {
      // Club: Real Madrid
      const clubMbappePhoto = playerIdentityResolver.resolvePlayerPhoto("278", null, "team_real_madrid");
      // National Team: France
      const nationalMbappePhoto = playerIdentityResolver.resolvePlayerPhoto("278", null, "team_france");

      assert.strictEqual(clubMbappePhoto, "https://media.api-sports.io/football/players/278.png");
      assert.strictEqual(nationalMbappePhoto, "https://media.api-sports.io/football/players/278.png");
      assert.strictEqual(clubMbappePhoto, nationalMbappePhoto);

      // Lionel Messi (Inter Miami vs Argentina)
      const clubMessiPhoto = playerIdentityResolver.resolvePlayerPhoto("154", null, "team_inter_miami");
      const nationalMessiPhoto = playerIdentityResolver.resolvePlayerPhoto("154", null, "team_argentina");

      assert.strictEqual(clubMessiPhoto, "https://media.api-sports.io/football/players/154.png");
      assert.strictEqual(nationalMessiPhoto, "https://media.api-sports.io/football/players/154.png");
      assert.strictEqual(clubMessiPhoto, nationalMessiPhoto);
    });
  });

  describe("4. Zero Fake Data & Neutral Fallback Invariant", () => {
    test("should return NULL for players without verified provider photo (clean SVG jersey trigger)", () => {
      // Unknown or unverified player
      const unverifiedPhoto = playerIdentityResolver.resolvePlayerPhoto("unknown_9999", null);
      assert.strictEqual(unverifiedPhoto, null, "Must return null so neutral SVG jersey is rendered");

      const nullPlayerPhoto = playerIdentityResolver.resolvePlayerPhoto(null, null);
      assert.strictEqual(nullPlayerPhoto, null);
    });

    test("should correctly audit a player roster and report 0 foreign/mismatched photos", () => {
      const roster = [
        { playerId: "278", photoUrl: "https://media.api-sports.io/football/players/278.png", name: "Mbappé" },
        { playerId: "154", photoUrl: "https://media.api-sports.io/football/players/154.png", name: "Messi" },
        { playerId: "99999", photoUrl: undefined, name: "Unregistered Rookie" },
        { playerId: "1466", photoUrl: "https://images.unsplash.com/photo-fake", name: "Saka" }, // Foreign photo
      ];

      const audit = playerIdentityResolver.auditPlayerPhotos(roster);
      assert.strictEqual(audit.total, 4);
      assert.strictEqual(audit.validPhotos, 2);
      assert.strictEqual(audit.missingPhotos, 1);
      assert.strictEqual(audit.rejectedForeignPhotos, 1);
    });
  });
});
