import { footballService } from "../src/lib/football/football.service";
import { playerIdentityResolver } from "../src/lib/football/player-identity.resolver";

async function inspectMatch() {
  console.log("=== INSPECTING MATCH match_1541374 ===");
  const match = await footballService.getMatchDetail("match_1541374");
  if (!match) {
    console.log("Match match_1541374 not found! Trying without prefix...");
    const match2 = await footballService.getMatchDetail("1541374");
    console.log("Match 1541374:", match2 ? "FOUND" : "NOT FOUND");
    return;
  }

  console.log("Match Title:", `${match.homeTeam.name} vs ${match.awayTeam.name}`);
  console.log("Competition:", match.competition.name);
  console.log("Home Lineup Formation:", match.lineups.home?.formation);
  console.log("Home Lineup Starters Count:", match.lineups.home?.starters?.length);
  
  console.log("\n--- Home Starters Sample (First 5) ---");
  match.lineups.home?.starters?.slice(0, 5).forEach((p, idx) => {
    console.log(`[Starter #${idx + 1}]`);
    console.log("  name:", p.name);
    console.log("  playerId:", p.playerId);
    console.log("  photoUrl:", p.photoUrl);
    console.log("  resolvedPhoto:", playerIdentityResolver.resolvePlayerPhoto(p.playerId, p.photoUrl));
  });

  console.log("\n--- Away Starters Sample (First 5) ---");
  match.lineups.away?.starters?.slice(0, 5).forEach((p, idx) => {
    console.log(`[Starter #${idx + 1}]`);
    console.log("  name:", p.name);
    console.log("  playerId:", p.playerId);
    console.log("  photoUrl:", p.photoUrl);
    console.log("  resolvedPhoto:", playerIdentityResolver.resolvePlayerPhoto(p.playerId, p.photoUrl));
  });
}

inspectMatch().catch(console.error);
