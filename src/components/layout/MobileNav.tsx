"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, Globe, ShieldCheck, User, PenTool } from "lucide-react";
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

            <div className="pt-4 mt-2 border-t border-pitch-800 flex flex-col gap-2 font-sans">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#c3ff00] bg-pitch-900 border border-[#c3ff00]/40 rounded flex items-center justify-between"
              >
                <span>Masuk Akun / Login</span>
                <User className="w-3.5 h-3.5 text-[#c3ff00]" />
              </Link>

              <Link
                href="/contributor"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-emerald-300 hover:text-white bg-pitch-900 border border-emerald-800/40 rounded flex items-center justify-between"
              >
                <span>Meja Kontributor</span>
                <PenTool className="w-3.5 h-3.5 text-emerald-400" />
              </Link>

              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white bg-pitch-900 border border-pitch-750 rounded flex items-center justify-between"
              >
                <span>Admin & Operasi</span>
                <ShieldCheck className="w-3.5 h-3.5 text-brand-red" />
              </Link>

              <Link
                href="/contributor/apply"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-200 bg-pitch-900/60 border border-pitch-800 rounded flex items-center justify-between"
              >
                <span>Daftar Jadi Penulis (Apply)</span>
                <Globe className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
