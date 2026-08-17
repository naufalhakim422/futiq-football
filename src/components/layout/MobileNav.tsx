"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, Globe, ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "News", href: "/news" },
  { label: "Transfers", href: "/transfers" },
  { label: "Matches", href: "/matches" },
  { label: "Standings", href: "/competitions" },
  { label: "Teams", href: "/teams" },
  { label: "Players", href: "/players" },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation menu"
        className="p-2 text-slate-300 hover:text-white bg-pitch-850 border border-pitch-750 rounded"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div className="fixed inset-x-0 top-[110px] z-50 bg-pitch-950/95 backdrop-blur-md border-b border-pitch-800 p-5 shadow-2xl">
          <nav className="flex flex-col space-y-3">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "px-3 py-2 text-sm font-semibold uppercase tracking-wider rounded transition-colors",
                    isActive
                      ? "bg-brand-green/10 text-brand-green border-l-2 border-brand-green"
                      : "text-slate-300 hover:bg-pitch-900 hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-4 mt-2 border-t border-pitch-800 flex flex-col gap-2">
              <Link
                href="/contributor/apply"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-brand-green hover:text-white bg-pitch-900 border border-brand-green/30 flex items-center justify-between"
              >
                <span>Write for Us (Apply)</span>
                <Globe className="w-3.5 h-3.5 text-brand-green" />
              </Link>
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white bg-pitch-900 border border-pitch-750 flex items-center justify-between"
              >
                <span>Admin & Editorial</span>
                <ShieldCheck className="w-3.5 h-3.5 text-brand-red" />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
