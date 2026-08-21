import { playerIdentityResolver } from "../src/lib/football/player-identity.resolver";
import { footballService } from "../src/lib/football/football.service";
import { footballQuotaGuard } from "../src/lib/football/quota-guard.service";

async function runPhotoAudit() {
  console.log("==================================================");
  console.log("FUTIQ TARGETED PLAYER PHOTO AUDIT & VERIFICATION");
  console.log("==================================================\n");

  const quotaBefore = footballQuotaGuard.getQuotaTelemetry();
  console.log(`Initial API Quota Usage: ${quotaBefore.requestsToday} / 100 requests`);

  // 1. Audit Canonical Players (Club & National Teams)
  const canonicalPlayers = [
    { id: "37127", name: "Maarten Paes", team: "Indonesia" },
    { id: "104193", name: "Jay Idzes", team: "Indonesia" },
    { id: "38118", name: "Thom Haye", team: "Indonesia" },
    { id: "328004", name: "Marselino Ferdinan", team: "Indonesia" },
    { id: "38127", name: "Calvin Verdonk", team: "Indonesia" },
    { id: "266858", name: "Rizky Ridho", team: "Indonesia" },
    { id: "2892", name: "Sandy Walsh", team: "Indonesia" },
    { id: "162464", name: "Justin Hubner", team: "Indonesia" },
    { id: "327732", name: "Ivar Jenner", team: "Indonesia" },
    { id: "342531", name: "Rafael Struick", team: "Indonesia" },
    { id: "38515", name: "Ragnar Oratmangoen", team: "Indonesia" },
    { id: "278", name: "Kylian Mbappé", team: "Real Madrid / France" },
    { id: "152982", name: "Jude Bellingham", team: "Real Madrid / England" },
    { id: "1100", name: "Erling Haaland", team: "Man City / Norway" },
    { id: "1466", name: "Bukayo Saka", team: "Arsenal / England" },
    { id: "8500", name: "Vinícius Júnior", team: "Real Madrid / Brazil" },
    { id: "645", name: "Rodri", team: "Man City / Spain" },
    { id: "344078", name: "Lamine Yamal", team: "Barcelona / Spain" },
    { id: "152984", name: "Cole Palmer", team: "Chelsea / England" },
    { id: "306", name: "Mohamed Salah", team: "Liverpool / Egypt" },
    { id: "154", name: "Lionel Messi", team: "Inter Miami / Argentina" },
  ];

  let correctPhotos = 0;
  let missingPhotos = 0;
  let wrongPhotos = 0;

  console.log("\n1. CANONICAL PLAYER REGISTRY & URL RESOLUTION AUDIT:");
  for (const player of canonicalPlayers) {
    const photo = playerIdentityResolver.resolvePlayerPhoto(player.id);
    const isValid = playerIdentityResolver.validatePhotoUrl(photo, player.id);

    if (photo && isValid && photo.includes(player.id)) {
      correctPhotos++;
      console.log(`  ✓ [MATCH] ID: ${player.id.padEnd(7)} | ${player.name.padEnd(20)} | Photo: ${photo}`);
    } else if (!photo) {
      missingPhotos++;
      console.log(`  - [PLACEHOLDER] ID: ${player.id} | ${player.name} -> Neutral Avatar Fallback`);
    } else {
      wrongPhotos++;
      console.error(`  ✗ [MISMATCH] ID: ${player.id} | ${player.name} -> WRONG PHOTO: ${photo}`);
    }
  }

  // 2. Audit Match Center Fixture Lineups (Starting XI + Bench + Timeline)
  console.log("\n2. MATCH CENTER FIXTURE LINEUP & TIMELINE AUDIT:");
  const testFixtures = ["match_ina_aus", "match_fnb_lyo", "match_eng_fra"];

  for (const fId of testFixtures) {
    const match = await footballService.getMatchDetail(fId);
    if (!match) continue;

    console.log(`\nMatch: ${match.homeTeam.name} vs ${match.awayTeam.name} (${match.competition.name})`);
    const starters = [...(match.lineups.home?.starters || []), ...(match.lineups.away?.starters || [])];
    const bench = [...(match.lineups.home?.bench || []), ...(match.lineups.away?.bench || [])];
    const events = match.events || [];

    console.log(`  - Total Lineup Starters: ${starters.length}`);
    console.log(`  - Total Lineup Bench   : ${bench.length}`);
    console.log(`  - Total Timeline Events: ${events.length}`);

    // Check Starters
    starters.slice(0, 5).forEach((p) => {
      const resolved = playerIdentityResolver.resolvePlayerPhoto(p.playerId, p.photoUrl);
      const cleanId = playerIdentityResolver.cleanPlayerId(p.playerId);
      if (resolved && cleanId && !resolved.includes(cleanId) && !resolved.startsWith("/api/")) {
        wrongPhotos++;
        console.error(`  [WRONG STARTER PHOTO]: ${p.name} (${p.playerId}) -> ${resolved}`);
      } else {
        console.log(`  ✓ Starter: #${p.number} ${p.name} (${p.playerId}) -> ${resolved || "Neutral Jersey"}`);
      }
    });

    // Check Bench
    bench.slice(0, 3).forEach((b) => {
      const resolved = playerIdentityResolver.resolvePlayerPhoto(b.playerId, b.photoUrl);
      const cleanId = playerIdentityResolver.cleanPlayerId(b.playerId);
      if (resolved && cleanId && !resolved.includes(cleanId) && !resolved.startsWith("/api/")) {
        wrongPhotos++;
        console.error(`  [WRONG BENCH PHOTO]: ${b.name} (${b.playerId}) -> ${resolved}`);
      } else {
        console.log(`  ✓ Bench: #${b.number} ${b.name} (${b.playerId}) -> ${resolved || "Neutral Jersey"}`);
      }
    });

    // Check Timeline Events
    events.slice(0, 2).forEach((e) => {
      const resolved = playerIdentityResolver.resolvePlayerPhoto(e.playerId);
      console.log(`  ✓ Event: ${e.minute}' ${e.type} - ${e.playerName} (${e.playerId}) -> ${resolved || "Neutral Jersey"}`);
    });
  }

  const quotaAfter = footballQuotaGuard.getQuotaTelemetry();
  const extraRequests = quotaAfter.requestsToday - quotaBefore.requestsToday;

  console.log("\n==================================================");
  console.log("FINAL AUDIT SUMMARY:");
  console.log(`PLAYER PHOTOS VERIFIED : ${canonicalPlayers.length}`);
  console.log(`CORRECT PHOTOS         : ${correctPhotos}`);
  console.log(`MISSING PROVIDER PHOTOS: ${missingPhotos}`);
  console.log(`WRONG PHOTOS           : ${wrongPhotos}`);
  console.log(`EXTRA API REQUESTS     : ${extraRequests}`);
  console.log("==================================================");

  if (wrongPhotos === 0 && extraRequests === 0) {
    console.log("\nSUCCESS: All player photos match canonical identity with 0 wrong photos and 0 extra API calls!");
  } else {
    console.error("\nFAILURE: Mismatch or extra requests detected!");
    process.exit(1);
  }
}

runPhotoAudit().catch(console.error);
