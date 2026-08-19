"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { SessionUser } from "@/types/auth";
import {
  User,
  Users,
  Shield,
  PenTool,
  Coins,
  FileText,
  LogOut,
  ChevronDown,
  Sparkles,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserNavProps {
  user: SessionUser | null;
}

export function UserNav({ user }: UserNavProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) {
    return (
      <Link
        href="/login"
        className="px-3.5 py-1.5 rounded bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 hover:border-[#c3ff00]/60 text-slate-200 hover:text-[#c3ff00] text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5 transition-all shadow-sm"
      >
        <User className="w-3.5 h-3.5 text-[#c3ff00]" />
        <span>Masuk</span>
      </Link>
    );
  }

  const isAdmin = user.roles.some((r) =>
    ["SUPER_ADMIN", "EDITOR_IN_CHIEF", "FINANCE"].includes(r)
  );
  const isContributor = user.roles.some((r) =>
    ["CONTRIBUTOR", "SUPER_ADMIN", "SENIOR_EDITOR"].includes(r)
  );

  const primaryRole = user.roles[0] || "READER";
  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-lg border transition-all font-sans",
          open
            ? "bg-pitch-850 border-[#c3ff00]"
            : "bg-pitch-900 border-pitch-800 hover:border-pitch-700"
        )}
      >
        <div className="w-6 h-6 rounded-full bg-[#c3ff00]/15 border border-[#c3ff00] text-[#c3ff00] flex items-center justify-center text-[10px] font-bold font-mono">
          {initials}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-xs font-bold text-slate-200 leading-tight truncate max-w-[100px]">
            {user.fullName.split(" ")[0]}
          </div>
          <div className="text-[9px] text-[#c3ff00] font-mono leading-none">
            {primaryRole}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-slate-400 transition-transform duration-200",
            open && "rotate-180 text-white"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-pitch-900 border border-pitch-750 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 font-sans text-xs">
          {/* Header Info */}
          <div className="p-3.5 bg-pitch-950/80 border-b border-pitch-800">
            <div className="text-slate-100 font-bold truncate">
              {user.fullName}
            </div>
            <div className="text-slate-400 text-[11px] font-mono truncate">
              {user.email}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {user.roles.map((r) => (
                <span
                  key={r}
                  className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#c3ff00]/10 text-[#c3ff00] border border-[#c3ff00]/30"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>

          {/* Nav Links */}
          <div className="p-1.5 space-y-0.5">
            {isAdmin && (
              <>
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-pitch-800 transition-colors"
                >
                  <Shield className="w-4 h-4 text-[#c3ff00]" />
                  <span className="font-semibold">Pusat Admin Portal</span>
                </Link>

                <Link
                  href="/admin/contributors"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-pitch-800 transition-colors"
                >
                  <Users className="w-4 h-4 text-red-400" />
                  <span>Moderasi Kontributor</span>
                </Link>
              </>
            )}

            {isContributor && (
              <>
                <Link
                  href="/contributor"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-pitch-800 transition-colors"
                >
                  <PenTool className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold">Meja Kontributor</span>
                </Link>

                <Link
                  href="/contributor/articles/new"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-pitch-800 transition-colors"
                >
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Tulis Artikel Baru</span>
                </Link>

                <Link
                  href="/contributor/earnings"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-pitch-800 transition-colors"
                >
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>Dompet & Penghasilan</span>
                </Link>

                <Link
                  href="/contributor/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-pitch-800 transition-colors"
                >
                  <Settings className="w-4 h-4 text-purple-400" />
                  <span>Profil & Pengaturan Akun</span>
                </Link>
              </>
            )}
          </div>

          {/* Footer Action */}
          <div className="p-1.5 bg-pitch-950/50 border-t border-pitch-800">
            <a
              href="/api/auth/logout"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar (Logout)</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
