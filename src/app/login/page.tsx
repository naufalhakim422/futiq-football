import React, { Suspense } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { LoginForm } from "./LoginForm";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata = {
  title: "Sign In | FUTIQ FOOTBALL",
  description: "Official portal login for readers, contributors, and platform administrators.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();

  return (
    <div className="py-12 md:py-20 flex items-center justify-center min-h-[75vh]">
      <PageContainer>
        <div className="max-w-md mx-auto space-y-6">
          {/* Header Title */}
          <div className="text-center space-y-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 mb-2 transition-colors font-mono"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </Link>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-sans tracking-tight">
              Sign in to FUTIQ FOOTBALL
            </h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans leading-relaxed">
              Access exclusive news, tactical insights, contributor workspaces, and platform controls.
            </p>
          </div>

          {/* Active Session Notice if already logged in */}
          {user && (
            <div className="p-3.5 bg-pitch-900 border border-[#c3ff00]/40 rounded-xl flex items-center justify-between gap-3 font-sans text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#c3ff00]/20 border border-[#c3ff00] flex items-center justify-center text-[#c3ff00] font-bold font-mono text-xs">
                  {user.fullName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-slate-100 font-bold leading-tight">
                    {user.fullName}
                  </div>
                  <div className="text-slate-400 text-[10px] font-mono">
                    {user.roles.join(", ")}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Link
                  href={user.roles.includes("SUPER_ADMIN") ? "/admin" : "/contributor"}
                  className="px-2.5 py-1.5 rounded bg-[#c3ff00] text-slate-950 font-bold uppercase tracking-wider text-[10px] hover:bg-[#b0e600] transition-colors"
                >
                  Open
                </Link>
                <a
                  href="/api/auth/logout"
                  className="px-2.5 py-1.5 rounded bg-pitch-800 text-slate-300 font-bold uppercase tracking-wider text-[10px] hover:bg-pitch-700 transition-colors"
                >
                  Sign Out
                </a>
              </div>
            </div>
          )}

          {/* Form */}
          <Suspense fallback={<div className="p-8 text-center text-slate-400 font-mono text-xs">Loading form...</div>}>
            <LoginForm />
          </Suspense>

          {/* Discreet Footer Security Notice */}
          <div className="text-center pt-2">
            <div className="inline-flex items-center gap-1.5 text-slate-500 text-[11px] font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Encrypted SSL/TLS & JWT Cryptographic Session</span>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
