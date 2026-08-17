"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, FileText, Shield, Users, Trophy, ArrowRight, Loader2 } from "lucide-react";
import { SearchResultItem } from "@/lib/search/search.service";

interface SearchClientProps {
  initialQuery: string;
}

export function SearchClient({ initialQuery }: SearchClientProps) {
  const [query, setQuery] = useState(initialQuery);
  const [items, setItems] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) {
      setItems([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
      }
    } catch (err) {
      console.warn("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ARTICLE":
        return <FileText className="w-4 h-4 text-emerald-400" />;
      case "TEAM":
        return <Shield className="w-4 h-4 text-blue-400" />;
      case "PLAYER":
        return <Users className="w-4 h-4 text-purple-400" />;
      case "COMPETITION":
        return <Trophy className="w-4 h-4 text-pitch-gold" />;
      default:
        return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-pitch-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Football Search Engine
          </h1>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Discover in-depth analysis, live club records, player profiles, and official league standings.
          </p>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by article title, club name (e.g. Arsenal), player, or league..."
              className="w-full bg-pitch-900 border border-pitch-800 rounded-xl pl-12 pr-28 py-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-green shadow-xl transition-all"
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 px-5 py-2.5 bg-brand-green text-slate-950 font-bold text-xs rounded-lg hover:bg-brand-green-hover transition-colors flex items-center gap-1.5"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Search"}
            </button>
          </div>
        </form>

        {/* Results Container */}
        <div className="space-y-4">
          {isLoading && (
            <div className="p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-green" /> Searching football database...
            </div>
          )}

          {!isLoading && hasSearched && items.length === 0 && (
            <div className="p-12 text-center border border-pitch-800 rounded-2xl bg-pitch-900/50 space-y-2">
              <p className="text-base font-semibold text-slate-200">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-400">
                Try searching with different keywords, team names (e.g. Arsenal, Real Madrid), or player names.
              </p>
            </div>
          )}

          {!isLoading && items.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Found {items.length} relevant results</span>
                <span>Sorted by relevance</span>
              </div>

              <div className="divide-y divide-pitch-800/60 border border-pitch-800 rounded-2xl bg-pitch-900 overflow-hidden">
                {items.map((item) => (
                  <Link
                    key={`${item.type}-${item.id}`}
                    href={item.url}
                    className="p-4 flex items-center justify-between hover:bg-pitch-850/60 transition-colors group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-pitch-950 border border-pitch-800 flex items-center justify-center shrink-0">
                        {getTypeIcon(item.type)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-100 group-hover:text-brand-green transition-colors">
                          {item.title}
                        </div>
                        {item.subtitle && (
                          <div className="text-xs text-slate-400 mt-0.5">{item.subtitle}</div>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
