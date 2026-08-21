import { footballService } from "../src/lib/football/football.service";
import { playerIdentityResolver } from "../src/lib/football/player-identity.resolver";

async function inspectTopMatches() {
  const matches = ["match_ina_aus", "match_eng_fra", "match_fnb_lyo", "match_arg_bra"];

  for (const fId of matches) {
    console.log(`\n=== INSPECTING MATCH ${fId} ===`);
    const match = await footballService.getMatchDetail(fId);
    if (!match) {
      console.log(`Match ${fId} not found!`);
      continue;
    }

    console.log("Match Title:", `${match.homeTeam.name} vs ${match.awayTeam.name}`);
    console.log("Home Starters Count:", match.lineups.home?.starters?.length);
    
    console.log("--- Home Starters Sample (First 3) ---");
    match.lineups.home?.starters?.slice(0, 3).forEach((p, idx) => {
      const resolved = playerIdentityResolver.resolvePlayerPhoto(p.playerId, p.photoUrl);
      console.log(`  #${idx + 1}: ${p.name} (ID: ${p.playerId}) -> Photo: ${resolved}`);
    });

    console.log("--- Away Starters Sample (First 3) ---");
    match.lineups.away?.starters?.slice(0, 3).forEach((p, idx) => {
      const resolved = playerIdentityResolver.resolvePlayerPhoto(p.playerId, p.photoUrl);
      console.log(`  #${idx + 1}: ${p.name} (ID: ${p.playerId}) -> Photo: ${resolved}`);
    });
  }
}

inspectTopMatches().catch(console.error);
