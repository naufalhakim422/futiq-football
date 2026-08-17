"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Top Stories", href: "/" },
  { label: "Latest News", href: "/news" },
  { label: "Transfer Center", href: "/transfers" },
  { label: "Matches & Scores", href: "/matches" },
  { label: "Tables & Standings", href: "/competitions" },
  { label: "Clubs", href: "/teams" },
  { label: "Players", href: "/players" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-1 border-t border-pitch-800 bg-pitch-900 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-x-auto no-scrollbar">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors shrink-0 relative",
              isActive
                ? "text-brand-green"
                : "text-slate-300 hover:text-white"
            )}
          >
            {item.label}
            {isActive && (
              <span className="absolute bottom-0 inset-x-3 h-0.5 bg-brand-green" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
