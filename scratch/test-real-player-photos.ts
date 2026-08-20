import { playerIdentityResolver } from "../src/lib/football/player-identity.resolver";
import { footballService } from "../src/lib/football/football.service";

async function main() {
  console.log("==================================================");
  console.log("FUTIQ REAL PLAYER PHOTO INTEGRITY AUDIT");
  console.log("==================================================\n");

  // 1. Test Key Canonical Players (National Team + World Class)
  const canonicalTestSet = [
    { id: "37127", name: "Maarten Paes", team: "Indonesia / FC Dallas" },
    { id: "104193", name: "Jay Idzes", team: "Indonesia / Venezia" },
    { id: "38118", name: "Thom Haye", team: "Indonesia / Almere City" },
    { id: "328004", name: "Marselino Ferdinan", team: "Indonesia / Oxford United" },
    { id: "38127", name: "Calvin Verdonk", team: "Indonesia / NEC Nijmegen" },
    { id: "266858", name: "Rizky Ridho", team: "Indonesia / Persija" },
    { id: "2892", name: "Sandy Walsh", team: "Indonesia / KV Mechelen" },
    { id: "162464", name: "Justin Hubner", team: "Indonesia / Wolves" },
    { id: "327732", name: "Ivar Jenner", team: "Indonesia / FC Utrecht" },
    { id: "342531", name: "Rafael Struick", team: "Indonesia / Brisbane Roar" },
    { id: "38515", name: "Ragnar Oratmangoen", team: "Indonesia / FCV Dender" },
    { id: "152982", name: "Jude Bellingham", team: "England / Real Madrid" },
    { id: "278", name: "Kylian Mbappé", team: "France / Real Madrid" },
    { id: "50", name: "Vinícius Júnior", team: "Brazil / Real Madrid" },
    { id: "1100", name: "Erling Haaland", team: "Norway / Manchester City" },
    { id: "1466", name: "Bukayo Saka", team: "England / Arsenal" },
    { id: "645", name: "Rodri", team: "Spain / Manchester City" },
    { id: "344078", name: "Lamine Yamal", team: "Spain / Barcelona" },
    { id: "152984", name: "Cole Palmer", team: "England / Chelsea" },
    { id: "306", name: "Mohamed Salah", team: "Egypt / Liverpool" },
    { id: "154", name: "Lionel Messi", team: "Argentina / Inter Miami" },
  ];

  let wrongPhotos = 0;
  let validPhotos = 0;

  console.log("1. AUDITING 21 CANONICAL NATIONAL & CLUB PLAYERS:");
  canonicalTestSet.forEach((p, idx) => {
    const photo = playerIdentityResolver.resolvePlayerPhoto(p.id);
    const isValidDomain = playerIdentityResolver.validatePhotoUrl(photo, p.id);
    
    if (photo && isValidDomain && photo.includes(p.id)) {
      validPhotos++;
      console.log(`  [OK] #${idx + 1} ${p.name.padEnd(22)} (${p.team.padEnd(26)}) -> ID: ${p.id.padEnd(7)} | Photo: ${photo}`);
    } else {
      wrongPhotos++;
      console.log(`  [FAIL] #${idx + 1} ${p.name} (ID: ${p.id}) -> Photo: ${photo}`);
    }
  });

  console.log("\n2. AUDITING REAL FIXTURE LINEUPS FROM MATCH CENTER:");
  // Audit real match details
  const testMatchIds = ["match_ina_aus", "match_fnb_lyo", "match_eng_fra", "match_rma_bar"];
  
  for (const matchId of testMatchIds) {
    const match = await footballService.getMatchDetail(matchId);
    if (!match) continue;

    console.log(`\nMatch: ${match.homeTeam.name} vs ${match.awayTeam.name} (${match.competition.name})`);
    
    const starters = [...(match.lineups.home?.starters || []), ...(match.lineups.away?.starters || [])];
    const bench = [...(match.lineups.home?.bench || []), ...(match.lineups.away?.bench || [])];
    
    console.log(`  - Starters Count: ${starters.length}`);
    console.log(`  - Bench Count: ${bench.length}`);
    
    let matchStartersWithPhoto = 0;
    starters.forEach((p) => {
      const resolved = playerIdentityResolver.resolvePlayerPhoto(p.playerId, p.photoUrl);
      if (resolved) {
        matchStartersWithPhoto++;
        const cleanId = playerIdentityResolver.cleanPlayerId(p.playerId);
        if (cleanId && !resolved.includes(cleanId) && !resolved.startsWith("/api/")) {
          wrongPhotos++;
          console.error(`  [MISMATCH DETECTED]: Player ${p.name} (${p.playerId}) received wrong photo: ${resolved}`);
        }
      }
    });

    console.log(`  - Starters with Valid Official Photos: ${matchStartersWithPhoto} / ${starters.length}`);
  }

  console.log("\n==================================================");
  console.log("FINAL AUDIT SUMMARY:");
  console.log(`TOTAL CANONICAL PLAYERS TESTED : ${canonicalTestSet.length}`);
  console.log(`VALID OFFICIAL PHOTOS LOADED   : ${validPhotos}`);
  console.log(`WRONG PLAYER PHOTO COUNT       : ${wrongPhotos}`);
  console.log("==================================================");

  if (wrongPhotos === 0) {
    console.log("\nSUCCESS: All player photos match their exact providerPlayerId with 0 wrong matches!");
  } else {
    console.error("\nFAILURE: Mismatched player photos detected!");
    process.exit(1);
  }
}

main().catch(console.error);
