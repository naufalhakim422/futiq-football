"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Shield,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  Sparkles,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  PenTool,
  Coins,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    description: "Akses penuh Portal Admin, Keuangan, Iklan, Telemetri API Sepak Bola & SEO",
    defaultRedirect: "/admin",
  },
  {
    id: "contributor",
    name: "Jurnalis & Kontributor",
    role: "CONTRIBUTOR",
    email: "contributor@futiq.com",
    badgeColor: "bg-emerald-500 text-slate-950 font-bold",
    icon: PenTool,
    description: "Tulis artikel, kirim ke AI Editorial Gate, kelola saldo & penarikan dana",
    defaultRedirect: "/contributor",
  },
  {
    id: "editor",
    name: "Senior Editor Berita",
    role: "SENIOR_EDITOR",
    email: "editor@futiq.com",
    badgeColor: "bg-blue-500 text-white font-bold",
    icon: FileCheck,
    description: "Review manuskrip jurnalis, evaluasi AI gate, dan publikasi berita resmi",
    defaultRedirect: "/editor",
  },
  {
    id: "finance",
    name: "Manajer Keuangan",
    role: "FINANCE",
    email: "finance@futiq.com",
    badgeColor: "bg-amber-500 text-slate-950 font-bold",
    icon: Coins,
    description: "Persetujuan pencairan saldo kontributor, rekonsiliasi & ledger keuangan",
    defaultRedirect: "/admin/finance",
  },
];

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const [email, setEmail] = useState("admin@futiq.com");
  const [password, setPassword] = useState("••••••••");
  const [selectedRole, setSelectedRole] = useState<string>("SUPER_ADMIN");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSelectQuickRole = (r: QuickRole) => {
    setEmail(r.email);
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
          email,
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
        const found = QUICK_ROLES.find((r) => r.role === selectedRole);
        target = found?.defaultRedirect || "/";
      }

      setTimeout(() => {
        router.push(target!);
        router.refresh();
      }, 700);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan pada sesi login");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Quick Role Fast-Selection Strip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#c3ff00]" />
            <span>Pilih Peran Akun Cepat</span>
          </span>
          <span className="text-[11px] text-slate-500 font-mono">1-Klik Otomatis</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QUICK_ROLES.map((r) => {
            const Icon = r.icon;
            const isSelected = email.toLowerCase() === r.email.toLowerCase();

            return (
              <button
                key={r.id}
                type="button"
                onClick={() => handleSelectQuickRole(r)}
                className={cn(
                  "p-3.5 text-left border rounded-lg transition-all relative flex flex-col justify-between group",
                  isSelected
                    ? "bg-pitch-900 border-[#c3ff00] shadow-[0_0_15px_rgba(195,255,0,0.12)]"
                    : "bg-pitch-950/80 border-pitch-800 hover:border-pitch-700 hover:bg-pitch-900"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-8 h-8 rounded flex items-center justify-center border",
                        isSelected
                          ? "bg-[#c3ff00]/10 border-[#c3ff00] text-[#c3ff00]"
                          : "bg-pitch-850 border-pitch-750 text-slate-400 group-hover:text-slate-200"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200 font-sans">
                        {r.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {r.email}
                      </div>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider",
                      r.badgeColor
                    )}
                  >
                    {r.role}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  {r.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Login Form Box */}
      <form onSubmit={handleSubmit} className="bg-pitch-900 border border-pitch-800 p-6 sm:p-8 rounded-xl shadow-2xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-pitch-800">
          <div className="w-10 h-10 rounded bg-[#c3ff00]/10 border border-[#c3ff00]/30 flex items-center justify-center text-[#c3ff00]">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 font-sans">
              Kredensial Sesi Kriptografis
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Token JWT aman HTTP-only berdurasi 7 hari akan dipasang ke browser Anda.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-lg text-xs text-red-300 flex items-start gap-2.5 font-sans">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Gagal Masuk: </span>
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-lg text-xs text-emerald-300 flex items-start gap-2.5 font-sans">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>{success}</div>
          </div>
        )}

        <div className="space-y-4 font-sans text-xs">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#c3ff00]" />
              <span>Alamat Email Terdaftar</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@futiq.com"
              className="w-full px-4 py-3 bg-pitch-950 border border-pitch-800 focus:border-[#c3ff00] focus:ring-1 focus:ring-[#c3ff00] text-slate-100 text-sm rounded outline-none font-mono transition-all"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-bold uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#c3ff00]" />
                <span>Kata Sandi / Passphrase</span>
              </label>
              <span className="text-[10px] text-slate-500 font-mono">Enkripsi SHA-256</span>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 bg-pitch-950 border border-pitch-800 focus:border-[#c3ff00] focus:ring-1 focus:ring-[#c3ff00] text-slate-100 text-sm rounded outline-none font-mono transition-all"
            />
          </div>
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded bg-[#c3ff00] hover:bg-[#b0e600] disabled:opacity-50 text-slate-950 font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.99]"
        >
          {loading ? (
            <span>Memvalidasi Sesi Kriptografis...</span>
          ) : (
            <>
              <UserCheck className="w-4 h-4 text-slate-950" />
              <span>Masuk & Aktifkan Sesi {selectedRole}</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </>
          )}
        </button>

        {redirectParam && (
          <div className="text-center pt-1 border-t border-pitch-800/80">
            <span className="text-[11px] text-slate-500 font-mono">
              Tujuan setelah login: <code className="text-slate-300">{redirectParam}</code>
            </span>
          </div>
        )}
      </form>
    </div>
  );
}
