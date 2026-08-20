"use client";

import React, { useState, useMemo } from "react";
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
  Search,
  X,
  Clock,
  Radio,
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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<"ALL" | "YESTERDAY" | "TODAY" | "TOMORROW">("ALL");

  // Helper to check live match status
  const isLiveState = (status?: string | number) => {
    if (!status) return false;
    const s = String(status);
    return s.includes("LIVE") || s === "HT" || s === "ET" || s === "PENALTY" || s === "1H" || s === "2H";
  };

  // Combine and deduplicate
  const allMatchesMap = new Map<string, MatchCardData>();
  [...liveMatches, ...allFixtures].forEach((m) => {
    allMatchesMap.set(m.id, m);
  });
  const allMatches = Array.from(allMatchesMap.values());

  // Real-time authoritative live count
  const liveTotalCount = allMatches.filter((m) => isLiveState(m.status)).length;

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
      n.includes("friendly") ||
      c === "WCQ" ||
      c === "UNL" ||
      c === "FRIENDLY"
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
    if (n.toLowerCase().includes("friendly")) return { title: "International Friendlies", country: "🤝 Exhibition Match" };
    if (n.toLowerCase().includes("cup")) return { title: n, country: "🏆 Cup Tournament" };
    return { title: n, country: "⚽ Domestic League" };
  };

  // Filter matches by Search & Date
  const searchedMatches = useMemo(() => {
    return allMatches.filter((m) => {
      // 1. Search Query Filter (Google-like team/competition search)
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const home = (m.homeTeam.name || "").toLowerCase();
        const away = (m.awayTeam.name || "").toLowerCase();
        const comp = (m.competition.name || "").toLowerCase();
        const venue = (m.venue?.name || "").toLowerCase();
        const matchesSearch = home.includes(q) || away.includes(q) || comp.includes(q) || venue.includes(q);
        if (!matchesSearch) return false;
      }

      // 2. Date Quick Filter
      if (dateFilter !== "ALL") {
        const matchDate = new Date(m.matchDate);
        const today = new Date();
        const isToday = matchDate.toDateString() === today.toDateString();

        const yest = new Date();
        yest.setDate(today.getDate() - 1);
        const isYesterday = matchDate.toDateString() === yest.toDateString();

        const tom = new Date();
        tom.setDate(today.getDate() + 1);
        const isTomorrow = matchDate.toDateString() === tom.toDateString();

        if (dateFilter === "TODAY" && !isToday && !isLiveState(m.status)) return false;
        if (dateFilter === "YESTERDAY" && !isYesterday && m.status !== "FINISHED") return false;
        if (dateFilter === "TOMORROW" && !isTomorrow && m.status !== "SCHEDULED") return false;
      }

      return true;
    });
  }, [allMatches, searchQuery, dateFilter]);

  // Group matches by friendly competition
  const groupsMap = new Map<string, LeagueGroup>();

  searchedMatches.forEach((m) => {
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

  // Filtered groups by category tab (with strict match-level filtering for LIVE)
  const filteredGroups = useMemo(() => {
    return sortedGroups
      .map((g) => {
        if (activeFilter === "LIVE") {
          return {
            ...g,
            matches: g.matches.filter((m) => isLiveState(m.status)),
          };
        }
        return g;
      })
      .filter((g) => {
        if (activeFilter === "ALL") return g.matches.length > 0;
        if (activeFilter === "LIVE") return g.matches.length > 0;
        return g.category === activeFilter && g.matches.length > 0;
      });
  }, [sortedGroups, activeFilter]);

  return (
    <div className="space-y-6 font-sans">
      {/* GOOGLE-LIKE INSTANT FIXTURE SEARCH BAR */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search fixtures, national teams (Indonesia, Brazil), clubs (Arsenal, Real Madrid), or competitions..."
          className="w-full pl-11 pr-10 py-3.5 bg-pitch-900 border border-pitch-800 focus:border-[#c3ff00] focus:ring-1 focus:ring-[#c3ff00] rounded-2xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 font-mono transition-all outline-none shadow-xl"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-full bg-pitch-950 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* CATEGORY & DATE FILTER CONTROLS */}
      <div className="bg-pitch-900 border border-pitch-800 p-3 sm:p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Main Competition Filters */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs font-mono font-bold">
          <button
            onClick={() => setActiveFilter("ALL")}
            className={cn(
              "px-3.5 py-2 rounded-xl transition-all",
              activeFilter === "ALL"
                ? "bg-[#c3ff00] text-slate-950 shadow-md"
                : "bg-pitch-950 text-slate-300 hover:text-white border border-pitch-800"
            )}
          >
            All ({allMatches.length})
          </button>

          <button
            onClick={() => setActiveFilter("LIVE")}
            className={cn(
              "px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5",
              activeFilter === "LIVE"
                ? "bg-brand-red text-white shadow-md"
                : "bg-pitch-950 text-slate-300 hover:text-white border border-pitch-800"
            )}
          >
            <span className={cn("w-2 h-2 rounded-full", activeFilter === "LIVE" ? "bg-white animate-ping" : "bg-brand-red")} />
            <span>Live ({liveTotalCount})</span>
          </button>

          <button
            onClick={() => setActiveFilter("INTERNATIONAL")}
            className={cn(
              "px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5",
              activeFilter === "INTERNATIONAL"
                ? "bg-cyan-400 text-slate-950 shadow-md"
                : "bg-pitch-950 text-slate-300 hover:text-white border border-pitch-800"
            )}
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>National Teams</span>
          </button>

          <button
            onClick={() => setActiveFilter("UCL")}
            className={cn(
              "px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5",
              activeFilter === "UCL"
                ? "bg-purple-400 text-slate-950 shadow-md"
                : "bg-pitch-950 text-slate-300 hover:text-white border border-pitch-800"
            )}
          >
            <span>Champions League</span>
          </button>

          <button
            onClick={() => setActiveFilter("PREMIER_LEAGUE")}
            className={cn(
              "px-3.5 py-2 rounded-xl transition-all",
              activeFilter === "PREMIER_LEAGUE"
                ? "bg-emerald-400 text-slate-950 shadow-md"
                : "bg-pitch-950 text-slate-300 hover:text-white border border-pitch-800"
            )}
          >
            Premier League
          </button>

          <button
            onClick={() => setActiveFilter("LA_LIGA")}
            className={cn(
              "px-3.5 py-2 rounded-xl transition-all",
              activeFilter === "LA_LIGA"
                ? "bg-amber-400 text-slate-950 shadow-md"
                : "bg-pitch-950 text-slate-300 hover:text-white border border-pitch-800"
            )}
          >
            La Liga
          </button>

          <button
            onClick={() => setActiveFilter("SERIE_A")}
            className={cn(
              "px-3.5 py-2 rounded-xl transition-all",
              activeFilter === "SERIE_A"
                ? "bg-blue-400 text-slate-950 shadow-md"
                : "bg-pitch-950 text-slate-300 hover:text-white border border-pitch-800"
            )}
          >
            Serie A
          </button>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-pitch-950 border border-pitch-800 rounded-xl text-xs font-mono font-semibold self-end md:self-auto">
          <button
            onClick={() => setDateFilter("YESTERDAY")}
            className={cn(
              "px-2.5 py-1 rounded-lg transition-colors",
              dateFilter === "YESTERDAY" ? "bg-[#c3ff00] text-slate-950 shadow" : "text-slate-400 hover:text-white"
            )}
          >
            Yesterday
          </button>
          <button
            onClick={() => setDateFilter("TODAY")}
            className={cn(
              "px-2.5 py-1 rounded-lg transition-colors",
              dateFilter === "TODAY" ? "bg-[#c3ff00] text-slate-950 shadow" : "text-slate-400 hover:text-white"
            )}
          >
            Today
          </button>
          <button
            onClick={() => setDateFilter("TOMORROW")}
            className={cn(
              "px-2.5 py-1 rounded-lg transition-colors",
              dateFilter === "TOMORROW" ? "bg-cyan-400 text-slate-950 shadow" : "text-slate-400 hover:text-white"
            )}
          >
            Tomorrow
          </button>
          <button
            onClick={() => setDateFilter("ALL")}
            className={cn(
              "px-2.5 py-1 rounded-lg transition-colors",
              dateFilter === "ALL" ? "bg-pitch-800 text-slate-200" : "text-slate-400 hover:text-white"
            )}
          >
            All Dates
          </button>
        </div>
      </div>

      {/* MATCH GROUPS LIST OR EMPTY STATE */}
      {filteredGroups.length === 0 ? (
        activeFilter === "LIVE" ? (
          <div className="bg-pitch-900 border border-pitch-800 rounded-3xl p-12 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-brand-red/10 border border-brand-red/30 flex items-center justify-center mx-auto">
              <Radio className="w-6 h-6 text-brand-red animate-pulse" />
            </div>
            <h3 className="text-base font-bold uppercase tracking-wider text-slate-200 font-mono">
              No Live Matches Right Now
            </h3>
            <p className="text-xs text-slate-400 font-sans max-w-md mx-auto">
              There are currently 0 live football matches in progress worldwide from the official API-Football feed. Live scores will appear automatically when kickoffs begin.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setActiveFilter("ALL")}
                className="px-4 py-2 bg-[#c3ff00] text-slate-950 font-bold font-mono text-xs rounded-xl hover:bg-[#b2eb00] transition-colors"
              >
                View All Fixtures ({allMatches.length})
              </button>
              <button
                onClick={() => {
                  setActiveFilter("ALL");
                  setDateFilter("TODAY");
                }}
                className="px-4 py-2 bg-pitch-950 border border-pitch-800 text-slate-200 font-bold font-mono text-xs rounded-xl hover:bg-pitch-800 transition-colors"
              >
                Today&apos;s Schedule
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-pitch-900 border border-pitch-800 rounded-3xl p-12 text-center space-y-3 shadow-xl">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono">
              No Fixtures Found
            </h3>
            <p className="text-xs text-slate-500 font-sans max-w-sm mx-auto">
              {searchQuery
                ? `No matches matched your search "${searchQuery}". Try searching for another team or league.`
                : "No fixtures currently active under this filter category."}
            </p>
          </div>
        )
      ) : (
        <div className="space-y-8">
          {filteredGroups.map((group) => (
            <div key={group.id} className="space-y-4">
              {/* Competition Header Badge */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{group.icon}</span>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-100 uppercase tracking-tight font-sans">
                      {group.name}
                    </h2>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {group.country}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-slate-400 px-2.5 py-1 rounded-lg bg-pitch-900 border border-pitch-800">
                  {group.matches.length} Matches
                </span>
              </div>

              {/* Fixture Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {group.matches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
