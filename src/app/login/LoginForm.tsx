"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Wrench,
  Shield,
  PenTool,
  FileCheck,
  Coins,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface QuickRole {
  id: string;
  name: string;
  role: string;
  email: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  defaultRedirect: string;
}

const QUICK_ROLES: QuickRole[] = [
  {
    id: "admin",
    name: "Super Administrator",
    role: "SUPER_ADMIN",
    email: "admin@futiq.com",
    badgeColor: "bg-[#c3ff00] text-slate-950 font-bold",
    icon: Shield,
    description: "Akses penuh Portal Admin, Keuangan, Iklan, Telemetri API & SEO",
    defaultRedirect: "/admin",
  },
  {
    id: "dev-contributor",
    name: "Developer Contributor",
    role: "CONTRIBUTOR",
    email: "dev.contributor@futiq.com",
    badgeColor: "bg-cyan-400 text-slate-950 font-bold",
    icon: PenTool,
    description: "Akses Pengembang Khusus Meja Kontributor, Draft Artikel & AI Gate",
    defaultRedirect: "/contributor",
  },
  {
    id: "contributor",
    name: "Jurnalis Kontributor (Standard)",
    role: "CONTRIBUTOR",
    email: "contributor@futiq.com",
    badgeColor: "bg-emerald-500 text-slate-950 font-bold",
    icon: PenTool,
    description: "Tulis artikel, evaluasi AI Editorial Gate & kelola saldo",
    defaultRedirect: "/contributor",
  },
  {
    id: "editor",
    name: "Senior Editor",
    role: "SENIOR_EDITOR",
    email: "editor@futiq.com",
    badgeColor: "bg-blue-500 text-white font-bold",
    icon: FileCheck,
    description: "Review manuskrip penulis dan publikasi berita",
    defaultRedirect: "/editor",
  },
  {
    id: "finance",
    name: "Manajer Keuangan",
    role: "FINANCE",
    email: "finance@futiq.com",
    badgeColor: "bg-amber-500 text-slate-950 font-bold",
    icon: Coins,
    description: "Persetujuan pencairan saldo & ledger",
    defaultRedirect: "/admin/finance",
  },
];

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("CONTRIBUTOR");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDevRoles, setShowDevRoles] = useState(false);

  const handleSelectQuickRole = (r: QuickRole) => {
    setEmail(r.email);
    setPassword("••••••••");
    setSelectedRole(r.role);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password || "demo_secure_pass_2026",
          role: selectedRole,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal melakukan autentikasi");
      }

      setSuccess(`Selamat datang kembali, ${data.user.fullName}! Mengalihkan...`);

      // Determine redirect destination
      let target = redirectParam;
      if (!target) {
        if (data.user.roles.includes("SUPER_ADMIN")) target = "/admin";
        else if (data.user.roles.includes("CONTRIBUTOR")) target = "/contributor";
        else if (data.user.roles.includes("SENIOR_EDITOR")) target = "/editor";
        else target = "/";
      }

      setTimeout(() => {
        router.push(target!);
        router.refresh();
      }, 600);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan pada sesi login");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Clean Primary Login Box */}
      <form
        onSubmit={handleSubmit}
        className="bg-pitch-900 border border-pitch-800 p-6 sm:p-8 rounded-xl shadow-2xl space-y-5"
      >
        {error && (
          <div className="p-3.5 bg-red-950/70 border border-red-800/80 rounded-lg text-xs text-red-300 flex items-start gap-2.5 font-sans">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Gagal Masuk: </span>
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-950/70 border border-emerald-800/80 rounded-lg text-xs text-emerald-300 flex items-start gap-2.5 font-sans">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>{success}</div>
          </div>
        )}

        <div className="space-y-4 font-sans text-xs">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#c3ff00]" />
              <span>Email</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full px-4 py-3 bg-pitch-950 border border-pitch-800 focus:border-[#c3ff00] focus:ring-1 focus:ring-[#c3ff00] text-slate-100 text-sm rounded outline-none font-mono transition-all placeholder:text-slate-600"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-bold uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#c3ff00]" />
                <span>Kata Sandi</span>
              </label>
              <span className="text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer">
                Lupa sandi?
              </span>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 bg-pitch-950 border border-pitch-800 focus:border-[#c3ff00] focus:ring-1 focus:ring-[#c3ff00] text-slate-100 text-sm rounded outline-none font-mono transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-lg bg-[#c3ff00] hover:bg-[#b0e600] disabled:opacity-50 text-slate-950 font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.99] mt-2"
        >
          {loading ? (
            <span>Memverifikasi Akun...</span>
          ) : (
            <>
              <UserCheck className="w-4 h-4 text-slate-950" />
              <span>Masuk ke Akun</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </>
          )}
        </button>

        {/* Bottom Contributor Link */}
        <div className="pt-4 border-t border-pitch-800/80 text-center">
          <p className="text-xs text-slate-400 font-sans">
            Ingin menulis artikel & analisis sepak bola?{" "}
            <Link
              href="/contributor/apply"
              className="text-[#c3ff00] hover:underline font-semibold font-mono ml-1"
            >
              Daftar Jadi Kontributor →
            </Link>
          </p>
        </div>
      </form>

      {/* Discreet Developer / Testing Quick-Role Toggle (Collapsed by default) */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowDevRoles(!showDevRoles)}
          className="w-full py-2 px-3 text-[11px] font-mono text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1.5 transition-colors border border-dashed border-pitch-800/60 rounded-lg hover:border-pitch-700"
        >
          <Wrench className="w-3 h-3 text-slate-500" />
          <span>{showDevRoles ? "Sembunyikan Akun Demo" : "🔧 Mode Pengujian / Akun Demo Cepat"}</span>
          <ChevronDown className={cn("w-3 h-3 transition-transform", showDevRoles && "rotate-180")} />
        </button>

        {showDevRoles && (
          <div className="mt-3 p-4 bg-pitch-950 border border-pitch-800 rounded-xl space-y-3 animate-in fade-in duration-200">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">
              Pilih Akun Demo 1-Klik:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {QUICK_ROLES.map((r) => {
                const Icon = r.icon;
                const isSelected = email === r.email;

                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleSelectQuickRole(r)}
                    className={cn(
                      "p-2.5 text-left border rounded-lg transition-all flex items-center justify-between gap-2 text-xs",
                      isSelected
                        ? "bg-pitch-900 border-[#c3ff00] text-slate-100"
                        : "bg-pitch-900/60 border-pitch-800 hover:border-pitch-700 text-slate-400 hover:text-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className="w-3.5 h-3.5 shrink-0 text-[#c3ff00]" />
                      <div className="truncate">
                        <div className="font-bold text-[11px] font-sans truncate">{r.name}</div>
                        <div className="text-[9px] text-slate-500 font-mono truncate">{r.email}</div>
                      </div>
                    </div>
                    <span className={cn("text-[8px] px-1 py-0.5 rounded font-mono uppercase tracking-wider shrink-0", r.badgeColor)}>
                      {r.role}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
