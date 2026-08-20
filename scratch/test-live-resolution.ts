import { footballService } from "../src/lib/football/football.service";
import { liveMatchEngine } from "../src/lib/football/live-engine/live-match.engine";

async function main() {
  console.log("=== Testing Real Football Live Resolution ===");
  const live = await footballService.getLiveMatches();
  console.log("Live matches count:", live.length);
  live.forEach((m, idx) => {
    console.log(
      `[${idx + 1}] ID: ${m.id} | ${m.homeTeam.name} (${m.homeScore}) vs ${m.awayTeam.name} (${m.awayScore}) | Status: ${m.status} ${m.minute || 0}' | League: ${m.competition.name}`
    );
  });
}

main().catch(console.error);
