import React, { Suspense } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { LoginForm } from "./LoginForm";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Masuk Akun & Portal | FUTIQ FOOTBALL",
  description: "Gerbang autentikasi sesi resmi untuk Admin Platform, Jurnalis Kontributor, dan Editor Berita FUTIQ FOOTBALL.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();

  // If already logged in and no specific redirect, allow navigating or re-authenticating
  return (
    <div className="py-12 md:py-16">
      <PageContainer>
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors font-mono"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke Beranda
            </Link>

            <SectionHeader
              title="Pusat Autentikasi & Masuk Portal"
              subtitle="Masuk ke sesi terenkripsi untuk mengelola Portal Admin, Meja Kontributor, Review Editor, dan Dompet Penghasilan"
              badgeText="Security Gate"
            />
          </div>

          {user && (
            <div className="p-4 bg-pitch-900 border border-[#c3ff00]/40 rounded-xl flex items-center justify-between gap-4 font-sans text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#c3ff00]/20 border border-[#c3ff00] flex items-center justify-center text-[#c3ff00] font-bold font-mono">
                  {user.fullName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-slate-100 font-bold">
                    Sesi Aktif: {user.fullName}
                  </div>
                  <div className="text-slate-400 text-[11px] font-mono">
                    Peran: {user.roles.join(", ")}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={user.roles.includes("SUPER_ADMIN") ? "/admin" : "/contributor"}
                  className="px-3 py-1.5 rounded bg-[#c3ff00] text-slate-950 font-bold uppercase tracking-wider text-[10px] hover:bg-[#b0e600] transition-colors"
                >
                  Buka Portal
                </Link>
                <a
                  href="/api/auth/logout"
                  className="px-3 py-1.5 rounded bg-pitch-800 text-slate-300 font-bold uppercase tracking-wider text-[10px] hover:bg-pitch-700 transition-colors"
                >
                  Keluar
                </a>
              </div>
            </div>
          )}

          <Suspense fallback={<div className="p-8 text-center text-slate-400 font-mono text-xs">Memuat formulir autentikasi...</div>}>
            <LoginForm />
          </Suspense>

          {/* Security Assurance Footer */}
          <div className="pt-6 border-t border-pitch-800 text-center space-y-2">
            <div className="inline-flex items-center gap-2 text-slate-400 text-xs font-mono">
              <ShieldCheck className="w-4 h-4 text-[#c3ff00]" />
              <span>Dilindungi Protokol Enkripsi JWT HS256 & Cookie HTTP-Only</span>
            </div>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              Sesi terisolasi di sisi server. Token otentikasi tidak pernah diekspos ke klien JavaScript pihak ketiga.
            </p>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
