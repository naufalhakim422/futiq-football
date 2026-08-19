"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Trophy, Shuffle, Activity, Globe2, Shield, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "all", label: "All Stories", icon: Sparkles, href: "/news" },
  { id: "tactics", label: "Tactical Analysis", icon: Activity, href: "/news?category=tactics" },
  { id: "transfers", label: "Transfer Center", icon: Shuffle, href: "/news?category=transfers" },
  { id: "ucl", label: "Champions League", icon: Trophy, href: "/news?category=ucl" },
  { id: "premier-league", label: "Premier League", icon: Globe2, href: "/news?category=premier-league" },
  { id: "deep-dive", label: "Deep Dive & Finance", icon: Shield, href: "/news?category=deep-dive" },
];

export function CategoryPillsBar() {
  const [active, setActive] = useState("all");

  return (
    <div className="py-2 border-b border-pitch-800/80 mb-6">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = active === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-sans font-bold whitespace-nowrap transition-all duration-200 border",
                isActive
                  ? "bg-[#c3ff00] text-slate-950 border-[#c3ff00] shadow-[0_0_15px_rgba(195,255,0,0.25)]"
                  : "bg-pitch-900 text-slate-300 border-pitch-750 hover:border-slate-500 hover:text-white hover:bg-pitch-850"
              )}
            >
              <Icon className={cn("w-3.5 h-3.5", isActive ? "text-slate-950" : "text-[#c3ff00]")} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
