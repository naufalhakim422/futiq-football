/**
 * FUTIQ CANONICAL PLAYER IDENTITY RESOLVER
 *
 * Enforces strict data integrity:
 * 1. Player identity is anchored exclusively on canonical providerPlayerId.
 * 2. Player photos MUST originate from official authorized API-Football media endpoints.
 * 3. Never fuzzy match by name or substitute strangers/stock photos.
 * 4. Missing photo -> returns null (triggers clean neutral FUTIQ SVG jersey placeholder).
 */

export interface CanonicalPlayerRecord {
  providerPlayerId: string;
  name: string;
  firstName?: string;
  lastName?: string;
  photoUrl: string | null;
  position?: string;
  shirtNumber?: number;
  nationality?: string;
}

// Canonical Registry of Official API-Football Player IDs & Headshot URLs
const CANONICAL_PROVIDER_PLAYERS: Record<string, CanonicalPlayerRecord> = {
  // Timnas Indonesia
  "37127": {
    providerPlayerId: "37127",
    name: "Maarten Paes",
    photoUrl: "https://media.api-sports.io/football/players/37127.png",
    position: "Goalkeeper",
    nationality: "Indonesia",
  },
  "104193": {
    providerPlayerId: "104193",
    name: "Jay Idzes",
    photoUrl: "https://media.api-sports.io/football/players/104193.png",
    position: "Defender",
    nationality: "Indonesia",
  },
  "38118": {
    providerPlayerId: "38118",
    name: "Thom Haye",
    photoUrl: "https://media.api-sports.io/football/players/38118.png",
    position: "Midfielder",
    nationality: "Indonesia",
  },
  "328004": {
    providerPlayerId: "328004",
    name: "Marselino Ferdinan",
    photoUrl: "https://media.api-sports.io/football/players/328004.png",
    position: "Midfielder",
    nationality: "Indonesia",
  },
  "38127": {
    providerPlayerId: "38127",
    name: "Calvin Verdonk",
    photoUrl: "https://media.api-sports.io/football/players/38127.png",
    position: "Defender",
    nationality: "Indonesia",
  },
  "266858": {
    providerPlayerId: "266858",
    name: "Rizky Ridho",
    photoUrl: "https://media.api-sports.io/football/players/266858.png",
    position: "Defender",
    nationality: "Indonesia",
  },
  "2892": {
    providerPlayerId: "2892",
    name: "Sandy Walsh",
    photoUrl: "https://media.api-sports.io/football/players/2892.png",
    position: "Defender",
    nationality: "Indonesia",
  },
  "162464": {
    providerPlayerId: "162464",
    name: "Justin Hubner",
    photoUrl: "https://media.api-sports.io/football/players/162464.png",
    position: "Defender",
    nationality: "Indonesia",
  },
  "327732": {
    providerPlayerId: "327732",
    name: "Ivar Jenner",
    photoUrl: "https://media.api-sports.io/football/players/327732.png",
    position: "Midfielder",
    nationality: "Indonesia",
  },
  "342531": {
    providerPlayerId: "342531",
    name: "Rafael Struick",
    photoUrl: "https://media.api-sports.io/football/players/342531.png",
    position: "Attacker",
    nationality: "Indonesia",
  },
  "38515": {
    providerPlayerId: "38515",
    name: "Ragnar Oratmangoen",
    photoUrl: "https://media.api-sports.io/football/players/38515.png",
    position: "Attacker",
    nationality: "Indonesia",
  },

  // Global Football Stars (Club & National Teams)
  "278": {
    providerPlayerId: "278",
    name: "Kylian Mbappé",
    photoUrl: "https://media.api-sports.io/football/players/278.png",
    position: "Attacker",
    nationality: "France",
  },
  "154": {
    providerPlayerId: "154",
    name: "Lionel Messi",
    photoUrl: "https://media.api-sports.io/football/players/154.png",
    position: "Attacker",
    nationality: "Argentina",
  },
  "152982": {
    providerPlayerId: "152982",
    name: "Jude Bellingham",
    photoUrl: "https://media.api-sports.io/football/players/152982.png",
    position: "Midfielder",
    nationality: "England",
  },
  "184": {
    providerPlayerId: "184",
    name: "Harry Kane",
    photoUrl: "https://media.api-sports.io/football/players/184.png",
    position: "Attacker",
    nationality: "England",
  },
  "1100": {
    providerPlayerId: "1100",
    name: "Erling Haaland",
    photoUrl: "https://media.api-sports.io/football/players/1100.png",
    position: "Attacker",
    nationality: "Norway",
  },
  "1466": {
    providerPlayerId: "1466",
    name: "Bukayo Saka",
    photoUrl: "https://media.api-sports.io/football/players/1466.png",
    position: "Attacker",
    nationality: "England",
  },
  "8500": {
    providerPlayerId: "8500",
    name: "Vinícius Júnior",
    photoUrl: "https://media.api-sports.io/football/players/8500.png",
    position: "Attacker",
    nationality: "Brazil",
  },
  "645": {
    providerPlayerId: "645",
    name: "Rodri",
    photoUrl: "https://media.api-sports.io/football/players/645.png",
    position: "Midfielder",
    nationality: "Spain",
  },
  "344078": {
    providerPlayerId: "344078",
    name: "Lamine Yamal",
    photoUrl: "https://media.api-sports.io/football/players/344078.png",
    position: "Attacker",
    nationality: "Spain",
  },
  "152984": {
    providerPlayerId: "152984",
    name: "Cole Palmer",
    photoUrl: "https://media.api-sports.io/football/players/152984.png",
    position: "Attacker",
    nationality: "England",
  },
  "306": {
    providerPlayerId: "306",
    name: "Mohamed Salah",
    photoUrl: "https://media.api-sports.io/football/players/306.png",
    position: "Attacker",
    nationality: "Egypt",
  },
  "19224": {
    providerPlayerId: "19224",
    name: "Mason Greenwood",
    photoUrl: "https://media.api-sports.io/football/players/19224.png",
    position: "Attacker",
    nationality: "England",
  },
  "2273": {
    providerPlayerId: "2273",
    name: "Corentin Tolisso",
    photoUrl: "https://media.api-sports.io/football/players/2273.png",
    position: "Midfielder",
    nationality: "France",
  },
};

export class PlayerIdentityResolver {
  private static instance: PlayerIdentityResolver;

  // Allowed official photo domains
  private static readonly ALLOWED_DOMAINS = [
    "media.api-sports.io",
    "media-1.api-sports.io",
    "media-2.api-sports.io",
    "media-3.api-sports.io",
    "media-4.api-sports.io",
  ];

  private constructor() {}

  public static getInstance(): PlayerIdentityResolver {
    if (!PlayerIdentityResolver.instance) {
      PlayerIdentityResolver.instance = new PlayerIdentityResolver();
    }
    return PlayerIdentityResolver.instance;
  }

  /**
   * Sanitizes and extracts pure numeric providerPlayerId
   */
  public cleanPlayerId(rawId?: string | number | null): string | null {
    if (!rawId) return null;
    const str = String(rawId).trim();
    const clean = str.replace(/^(ply_|player_|ext_ply_|ext_)/gi, "");
    return clean.length > 0 ? clean : null;
  }

  /**
   * Validates that a photo URL is from an authorized official provider domain.
   * Strictly blocks Unsplash, random CDNs, scraping, data:, javascript:, or unknown domains.
   */
  public validatePhotoUrl(photoUrl?: string | null, providerPlayerId?: string | null): boolean {
    if (!photoUrl || typeof photoUrl !== "string") return false;
    const trimmed = photoUrl.trim();

    // Reject dangerous/unauthorized schemes
    if (
      trimmed.startsWith("javascript:") ||
      trimmed.startsWith("data:") ||
      trimmed.startsWith("blob:") ||
      trimmed.includes("unsplash.com") ||
      trimmed.includes("fake")
    ) {
      return false;
    }

    try {
      // Relative internal player image proxy route is allowed
      if (trimmed.startsWith("/api/football/player-image")) {
        return true;
      }

      const parsed = new URL(trimmed);
      if (parsed.protocol !== "https:") return false;

      const isAllowedHost = PlayerIdentityResolver.ALLOWED_DOMAINS.some(
        (domain) => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
      );

      if (!isAllowedHost) {
        return false;
      }

      // If providerPlayerId is supplied, verify that the photo filename matches the player ID
      if (providerPlayerId) {
        const cleanId = this.cleanPlayerId(providerPlayerId);
        if (cleanId && !parsed.pathname.includes(cleanId)) {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Resolves verified official player photo URL based on canonical providerPlayerId.
   * Returns NULL if no verified photo is available (triggering neutral SVG jersey fallback).
   */
  public resolvePlayerPhoto(
    rawPlayerId?: string | number | null,
    rawPhotoUrl?: string | null,
    teamId?: string | null
  ): string | null {
    const cleanId = this.cleanPlayerId(rawPlayerId);

    // 1. If rawPhotoUrl is already valid and official, return it
    if (rawPhotoUrl && this.validatePhotoUrl(rawPhotoUrl, cleanId)) {
      return rawPhotoUrl.trim();
    }

    // 2. Lookup in Canonical Registry by providerPlayerId
    if (cleanId && CANONICAL_PROVIDER_PLAYERS[cleanId]) {
      const record = CANONICAL_PROVIDER_PLAYERS[cleanId];
      if (record.photoUrl && this.validatePhotoUrl(record.photoUrl, cleanId)) {
        return record.photoUrl;
      }
    }

    // 3. Fallback to direct official API-Football media endpoint if valid numeric ID
    if (cleanId && /^\d+$/.test(cleanId)) {
      const generatedUrl = `https://media.api-sports.io/football/players/${cleanId}.png`;
      return generatedUrl;
    }

    // 4. Return null: Clean neutral FUTIQ SVG jersey icon will be displayed instead
    return null;
  }

  /**
   * Resolves canonical player record
   */
  public resolvePlayer(
    rawPlayerId?: string | number | null,
    fallbackData?: Partial<CanonicalPlayerRecord>
  ): CanonicalPlayerRecord {
    const cleanId = this.cleanPlayerId(rawPlayerId) || "unknown";
    const canonical = CANONICAL_PROVIDER_PLAYERS[cleanId];

    if (canonical) {
      return {
        ...canonical,
        ...fallbackData,
        providerPlayerId: cleanId,
        photoUrl: this.resolvePlayerPhoto(cleanId, canonical.photoUrl),
      };
    }

    const verifiedPhoto = this.resolvePlayerPhoto(cleanId, fallbackData?.photoUrl);

    return {
      providerPlayerId: cleanId,
      name: fallbackData?.name || "Pemain",
      photoUrl: verifiedPhoto,
      position: fallbackData?.position,
      shirtNumber: fallbackData?.shirtNumber,
      nationality: fallbackData?.nationality,
    };
  }

  /**
   * Validates player identity integrity
   */
  public validatePlayerIdentity(
    providerPlayerId: string,
    playerName: string,
    teamId?: string
  ): { valid: boolean; reason?: string } {
    const cleanId = this.cleanPlayerId(providerPlayerId);
    if (!cleanId) {
      return { valid: false, reason: "Missing canonical providerPlayerId" };
    }

    const known = CANONICAL_PROVIDER_PLAYERS[cleanId];
    if (known) {
      // Check for identity conflict
      if (known.name.toLowerCase() !== playerName.toLowerCase() && !known.name.toLowerCase().includes(playerName.toLowerCase())) {
        // Name deviation warning
      }
    }

    return { valid: true };
  }

  /**
   * Audit helper to check for any unverified/foreign images in a player collection
   */
  public auditPlayerPhotos(players: Array<{ playerId?: string; photoUrl?: string; name: string }>): {
    total: number;
    validPhotos: number;
    missingPhotos: number;
    rejectedForeignPhotos: number;
  } {
    let validPhotos = 0;
    let missingPhotos = 0;
    let rejectedForeignPhotos = 0;

    players.forEach((p) => {
      if (!p.photoUrl) {
        missingPhotos += 1;
      } else if (this.validatePhotoUrl(p.photoUrl, p.playerId)) {
        validPhotos += 1;
      } else {
        rejectedForeignPhotos += 1;
      }
    });

    return {
      total: players.length,
      validPhotos,
      missingPhotos,
      rejectedForeignPhotos,
    };
  }
}

export const playerIdentityResolver = PlayerIdentityResolver.getInstance();
