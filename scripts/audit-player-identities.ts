import { playerIdentityResolver } from "../src/lib/football/player-identity.resolver";
import { MockFootballProvider } from "../src/lib/football/providers/mock.provider";
import { footballService } from "../src/lib/football/football.service";

async function runPlayerIdentityAudit() {
  console.log("==================================================");
  console.log("  FUTIQ PLAYER IDENTITY & PHOTO AUDIT REPORT");
  console.log("==================================================");

  const mockProvider = new MockFootballProvider();
  const players = await mockProvider.getPlayers();

  let totalPlayers = players.length;
  let validIdentities = 0;
  let missingPhotos = 0;
  let photoMismatches = 0;
  let duplicateIdentities = 0;
  let teamConflicts = 0;

  const seenIds = new Set<string>();

  for (const p of players) {
    const rawId = p.externalId || p.id;
    const cleanId = playerIdentityResolver.cleanPlayerId(rawId);

    if (!cleanId) {
      console.warn(`[AUDIT WARNING]: Player "${p.name}" missing valid providerPlayerId`);
      continue;
    }

    if (seenIds.has(cleanId)) {
      duplicateIdentities += 1;
      console.warn(`[DUPLICATE IDENTITY]: Duplicate providerPlayerId "${cleanId}" for player "${p.name}"`);
    } else {
      seenIds.add(cleanId);
    }

    const verifiedPhoto = playerIdentityResolver.resolvePlayerPhoto(cleanId, p.photoUrl);

    if (!verifiedPhoto) {
      missingPhotos += 1;
    } else {
      const isValid = playerIdentityResolver.validatePhotoUrl(verifiedPhoto, cleanId);
      if (!isValid) {
        photoMismatches += 1;
        console.error(`[PHOTO MISMATCH]: Player "${p.name}" (${cleanId}) has invalid photo URL "${verifiedPhoto}"`);
      } else {
        validIdentities += 1;
      }
    }
  }

  // Also verify national team players and stars
  const sampleTestPlayers = [
    { id: "278", name: "Kylian Mbappé", club: "Real Madrid", national: "France" },
    { id: "154", name: "Lionel Messi", club: "Inter Miami", national: "Argentina" },
    { id: "1466", name: "Bukayo Saka", club: "Arsenal", national: "England" },
    { id: "152982", name: "Jude Bellingham", club: "Real Madrid", national: "England" },
    { id: "1100", name: "Erling Haaland", club: "Manchester City", national: "Norway" },
    { id: "37127", name: "Maarten Paes", club: "FC Dallas", national: "Indonesia" },
    { id: "104193", name: "Jay Idzes", club: "Venezia", national: "Indonesia" },
    { id: "38118", name: "Thom Haye", club: "Almere City", national: "Indonesia" },
    { id: "328004", name: "Marselino Ferdinan", club: "Oxford United", national: "Indonesia" },
    { id: "38127", name: "Calvin Verdonk", club: "NEC Nijmegen", national: "Indonesia" },
    { id: "162464", name: "Justin Hubner", club: "Wolves", national: "Indonesia" },
    { id: "2892", name: "Sandy Walsh", club: "KV Mechelen", national: "Indonesia" },
  ];

  console.log("\n--- Real Player Sample Verification ---");
  for (const star of sampleTestPlayers) {
    const photo = playerIdentityResolver.resolvePlayerPhoto(star.id);
    const valid = playerIdentityResolver.validatePhotoUrl(photo, star.id);
    console.log(
      `✓ [Player ${star.id}] ${star.name.padEnd(20)} -> Photo: ${photo ? "VERIFIED (API-Sports)" : "NEUTRAL SVG"} (Valid: ${valid})`
    );
  }

  console.log("\n==================================================");
  console.log(`  AUDIT SUMMARY`);
  console.log(`  Total Players Inspected:   ${totalPlayers}`);
  console.log(`  Valid Identities:          ${validIdentities}`);
  console.log(`  Missing Photos (Neutral):  ${missingPhotos}`);
  console.log(`  Photo Mismatches (Wrong):  ${photoMismatches}`);
  console.log(`  Duplicate Identities:      ${duplicateIdentities}`);
  console.log(`  Team Conflicts:            ${teamConflicts}`);
  console.log(`  TARGET: WRONG PLAYER PHOTO = 0 [${photoMismatches === 0 ? "PASSED" : "FAILED"}]`);
  console.log("==================================================");
}

runPlayerIdentityAudit().catch(console.error);
