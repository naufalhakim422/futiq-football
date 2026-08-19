async function main() {
  const apiKey = "117bd3185cb0a725ab4f78c7881b18bf";
  console.log("1. Checking API-Football status and quota...");
  try {
    const statusRes = await fetch("https://v3.football.api-sports.io/status", {
      headers: { "x-apisports-key": apiKey },
    });
    const statusData = await statusRes.json();
    console.log("Account Status:", JSON.stringify(statusData, null, 2));

    console.log("\n2. Checking live matches (fixtures?live=all)...");
    const liveRes = await fetch("https://v3.football.api-sports.io/fixtures?live=all", {
      headers: { "x-apisports-key": apiKey },
    });
    const liveData = await liveRes.json();
    console.log("Live Results Count:", liveData.results);
    console.log("Live Errors:", JSON.stringify(liveData.errors));
    if (liveData.response && liveData.response.length > 0) {
      console.log(`Found ${liveData.response.length} live matches:`);
      liveData.response.slice(0, 10).forEach((m: any, idx: number) => {
        console.log(
          `  [${idx + 1}] ${m.league.name} (${m.league.country}): ${m.teams.home.name} ${m.goals.home ?? 0} - ${m.goals.away ?? 0} ${m.teams.away.name} (${m.fixture.status.elapsed}' - ${m.fixture.status.short})`
        );
      });
    } else {
      console.log("No matches currently playing live right now.");
    }

    console.log("\n3. Checking today's matches (fixtures?date=YYYY-MM-DD)...");
    const today = new Date().toISOString().split("T")[0];
    const todayRes = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}`, {
      headers: { "x-apisports-key": apiKey },
    });
    const todayData = await todayRes.json();
    console.log(`Today (${today}) Total Fixtures Count:`, todayData.results);
    if (todayData.response && todayData.response.length > 0) {
      todayData.response.slice(0, 10).forEach((m: any, idx: number) => {
        console.log(
          `  - ${m.league.name}: ${m.teams.home.name} vs ${m.teams.away.name} [Status: ${m.fixture.status.short}, Score: ${m.goals.home ?? 0}-${m.goals.away ?? 0}]`
        );
      });
    }
  } catch (err: any) {
    console.error("Fetch Error:", err?.message || err);
  }
}

main();
