"use client";

import React, { useState } from "react";
import { MatchCardData, MatchCard } from "@/components/football/MatchCard";
import {
  Trophy,
  Globe2,
  Sparkles,
  Zap,
  Activity,
  Calendar,
  Filter,
  Flame,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchCenterConsoleProps {
  liveMatches: MatchCardData[];
  allFixtures: MatchCardData[];
}

interface LeagueGroup {
  id: string;
  name: string;
  category: "INTERNATIONAL" | "UCL" | "PREMIER_LEAGUE" | "LA_LIGA" | "SERIE_A" | "OTHER";
  country: string;
  icon: string;
  matches: MatchCardData[];
}

export function MatchCenterConsole({ liveMatches, allFixtures }: MatchCenterConsoleProps) {
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  // Combine and deduplicate
  const allMatchesMap = new Map<string, MatchCardData>();
  [...liveMatches, ...allFixtures].forEach((m) => {
    allMatchesMap.set(m.id, m);
  });
  const allMatches = Array.from(allMatchesMap.values());

  // Helper to categorize tournament
  const getCategory = (compName: string, code?: string): LeagueGroup["category"] => {
    const n = (compName || "").toLowerCase();
    const c = (code || "").toUpperCase();

    if (
      n.includes("world cup") ||
      n.includes("nations league") ||
      n.includes("asean") ||
      n.includes("euro") ||
      n.includes("afc") ||
      n.includes("conmebol") ||
      c === "WCQ" ||
      c === "UNL"
    ) {
      return "INTERNATIONAL";
    }
    if (n.includes("champions") || c === "UCL") return "UCL";
    if (n.includes("premier league") || c === "PL") return "PREMIER_LEAGUE";
    if (n.includes("la liga") || n.includes("primera") || c === "LL") return "LA_LIGA";
    if (n.includes("serie a") || c === "SA") return "SERIE_A";
    return "OTHER";
  };

  // Human-readable friendly league titles
  const getFriendlyTitle = (compName: string): { title: string; country: string } => {
    const n = compName || "Football Tournament";
    if (n.toLowerCase().includes("world cup")) return { title: "FIFA World Cup 2026 Qualifiers", country: "🌍 International / National Teams" };
    if (n.toLowerCase().includes("nations league")) return { title: "UEFA Nations League", country: "🇪🇺 Europe / National Teams" };
    if (n.toLowerCase().includes("asean")) return { title: "AFF Championship / ASEAN Cup", country: "🌏 Southeast Asia" };
    if (n.toLowerCase().includes("champions")) return { title: "UEFA Champions League", country: "🇪🇺 European Elite Club Tournament" };
    if (n.toLowerCase().includes("premier league")) return { title: "Premier League", country: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 English Top Flight" };
    if (n.toLowerCase().includes("la liga")) return { title: "La Liga", country: "🇪🇸 Spanish Top Flight" };
    if (n.toLowerCase().includes("serie a")) return { title: "Serie A", country: "🇮🇹 Italian Top Flight" };
    if (n.toLowerCase().includes("iii liga")) return { title: "III Liga (Polish 3rd Tier)", country: "🇵🇱 Poland" };
    if (n.toLowerCase().includes("ligi kuu bara")) return { title: "Tanzania Premier League", country: "🇹🇿 Tanzania" };
    if (n.toLowerCase().includes("super league") && !n.toLowerCase().includes("premier")) return { title: "Uzbekistan Super League", country: "🇺🇿 Uzbekistan" };
    if (n.toLowerCase().includes("premier soccer league")) return { title: "Zimbabwe Premier Soccer League", country: "🇿🇼 Zimbabwe" };
    if (n.toLowerCase().includes("cup")) return { title: n, country: "🏆 Cup Tournament" };
    return { title: n, country: "⚽ Domestic League" };
  };

  // Group matches by friendly competition
  const groupsMap = new Map<string, LeagueGroup>();

  allMatches.forEach((m) => {
    const rawName = m.competition.name || "Competition";
    const category = getCategory(rawName, m.competition.code);
    const { title, country } = getFriendlyTitle(rawName);

    if (!groupsMap.has(title)) {
      groupsMap.set(title, {
        id: title,
        name: title,
        category,
        country,
        icon: country.split(" ")[0],
        matches: [],
      });
    }

    groupsMap.get(title)!.matches.push(m);
  });

  // Sort groups: International & Top 5 leagues first, obscure leagues at bottom
  const priorityOrder = ["INTERNATIONAL", "UCL", "PREMIER_LEAGUE", "LA_LIGA", "SERIE_A", "OTHER"];
  const sortedGroups = Array.from(groupsMap.values()).sort((a, b) => {
    const pA = priorityOrder.indexOf(a.category);
    const pB = priorityOrder.indexOf(b.category);
    return pA - pB;
  });

  // Filtered groups
  const filteredGroups = sortedGroups.filter((g) => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "LIVE") return g.matches.some((m) => m.status.toString().includes("LIVE") || m.status === "HT");
    return g.category === activeFilter;
  });

  const liveTotalCount = allMatches.filter(
    (m) => m.status.toString().includes("LIVE") || m.status === "HT"
  ).length;

  return (
    <div className="space-y-8 font-sans">
      {/* Category Filter Navigation Bar */}
      <div className="bg-pitch-900 border border-pitch-800 p-3 sm:p-4 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold">
          <button
            onClick={() => setActiveFilter("ALL")}
            className={cn(
              "px-4 py-2 rounded-xl transition-all",
              activeFilter === "ALL"
                ? "bg-[#c3ff00] text-slate-950 shadow-md"
                : "bg-pitch-950 text-slate-300 hover:text-white border border-pitch-800"
            )}
          >
            All Matches ({allMatches.length})
          </button>

          <button
            onClick={() => setActiveFilter("LIVE")}
            className={cn(
              "px-4 py-2 rounded-xl transition-all flex items-center gap-1.5",
              activeFilter === "LIVE"
                ? "bg-brand-red text-white shadow-md"
                : "bg-pitch-950 text-slate-300 hover:text-white border border-pitch-800"
            )}
          >
            <span className="w-2 h-2 rounded-full bg-brand-red animate-ping" />
            <span>Live Now ({liveTotalCount})</span>
          </button>

          <button
            onClick={() => setActiveFilter("INTERNATIONAL")}
            className={cn(
              "px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5",
              activeFilter === "INTERNATIONAL"
                ? "bg-[#c3ff00] text-slate-950 shadow-md"
                : "bg-pitch-950 text-slate-300 hover:text-white border border-pitch-800"
            )}
          >
            <span>🌍 National Teams & World Cup</span>
          </button>

          <button
            onClick={() => setActiveFilter("PREMIER_LEAGUE")}
            className={cn(
              "px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5",
              activeFilter === "PREMIER_LEAGUE"
                ? "bg-[#c3ff00] text-slate-950 shadow-md"
                : "bg-pitch-950 text-slate-300 hover:text-white border border-pitch-800"
            )}
          >
            <span>🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League</span>
          </button>

          <button
            onClick={() => setActiveFilter("LA_LIGA")}
            className={cn(
              "px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5",
              activeFilter === "LA_LIGA"
                ? "bg-[#c3ff00] text-slate-950 shadow-md"
                : "bg-pitch-950 text-slate-300 hover:text-white border border-pitch-800"
            )}
          >
            <span>🇪🇸 La Liga</span>
          </button>

          <button
            onClick={() => setActiveFilter("OTHER")}
            className={cn(
              "px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5",
              activeFilter === "OTHER"
                ? "bg-[#c3ff00] text-slate-950 shadow-md"
                : "bg-pitch-950 text-slate-300 hover:text-white border border-pitch-800"
            )}
          >
            <span>⚽ Other Leagues</span>
          </button>
        </div>
      </div>

      {/* Grouped Matches by Clear Tournament Headings */}
      {filteredGroups.length === 0 ? (
        <div className="p-12 text-center bg-pitch-900 border border-pitch-800 rounded-2xl text-slate-500 font-mono">
          No matches found in this category.
        </div>
      ) : (
        <div className="space-y-10">
          {filteredGroups.map((group) => {
            const matchesToDisplay =
              activeFilter === "LIVE"
                ? group.matches.filter((m) => m.status.toString().includes("LIVE") || m.status === "HT")
                : group.matches;

            if (matchesToDisplay.length === 0) return null;

            return (
              <section key={group.id} className="space-y-4">
                {/* Clear, Recognizable League Section Header */}
                <div className="flex items-center justify-between pb-3 border-b border-pitch-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-pitch-950 border border-pitch-750 flex items-center justify-center text-base shadow-sm">
                      {group.icon || "⚽"}
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-slate-100 uppercase tracking-tight font-sans">
                        {group.name}
                      </h2>
                      <span className="text-[11px] font-mono text-[#c3ff00] font-semibold">
                        {group.country}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-slate-400 bg-pitch-900 px-3 py-1 rounded-full border border-pitch-800">
                    {matchesToDisplay.length} Matches
                  </span>
                </div>

                {/* Match Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {matchesToDisplay.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
