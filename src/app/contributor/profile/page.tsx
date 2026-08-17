import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { contributorService } from "@/lib/contributor/contributor.service";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import {
  ShieldCheck,
  Award,
  Star,
  User,
  Globe,
  CheckCircle2,
  ExternalLink,
  ArrowLeft,
  BookOpen,
} from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ContributorProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/contributor");
  }

  let profile: any = null;
  try {
    profile = await contributorService.getContributorProfile(user.id);
  } catch (error) {
    // Database fallback
  }

  const trustScore = Number(profile?.overallTrustScore || 100);
  const originalityScore = Number(profile?.originalityScore || 100);
  const accuracyScore = Number(profile?.accuracyScore || 100);
  const copyrightScore = Number(profile?.copyrightScore || 100);
  const qualityScore = Number(profile?.qualityScore || 100);

  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        <div className="flex items-center justify-between">
          <Link
            href="/contributor"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Contributor Desk</span>
          </Link>
        </div>

        <SectionHeader
          title="Contributor Profile & Editorial Dossier"
          subtitle="Manage your public editorial bylines, beat specializations, and verified trust telemetry"
          badgeText="Author Dossier"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Author Bio & Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-pitch-900 border border-pitch-800 p-6 sm:p-7 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-pitch-800">
                <div className="w-16 h-16 bg-pitch-800 border border-pitch-700 flex items-center justify-center font-bold text-2xl text-brand-green font-mono shrink-0">
                  {profile?.displayName?.substring(0, 2)?.toUpperCase() || "AU"}
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-pitch-850 text-brand-green border border-pitch-750">
                      {profile?.status || "ACTIVE"}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {profile?.country || "Global"}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-100 font-sans tracking-tight">
                    {profile?.displayName || user.fullName}
                  </h1>
                  <p className="text-xs text-slate-400 font-mono">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="bg-pitch-950 border border-pitch-800 p-4 space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">
                    Editorial Biography
                  </span>
                  <p className="text-slate-300 font-sans text-xs leading-relaxed">
                    {profile?.bio || "No biography registered yet. Detail your analytical perspective and football journalism background."}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
                  <div className="bg-pitch-950 border border-pitch-800 p-3.5 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Primary Language</span>
                    <span className="text-slate-200 font-bold uppercase">{profile?.preferredLanguage || "en"} (Global)</span>
                  </div>

                  <div className="bg-pitch-950 border border-pitch-800 p-3.5 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Accreditation Tier</span>
                    <span className="text-brand-green font-bold uppercase">VERIFIED WRITER</span>
                  </div>
                </div>

                {profile?.portfolioUrl && (
                  <div className="bg-pitch-950 border border-pitch-800 p-4 space-y-1.5 font-mono">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Portfolio / Clips</span>
                    <a
                      href={profile.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-green hover:underline flex items-center gap-1.5 truncate"
                    >
                      <span className="truncate">{profile.portfolioUrl}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Editorial Guidelines Checklist */}
            <div className="bg-pitch-900 border border-pitch-800 p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 pb-2 border-b border-pitch-800">
                <BookOpen className="w-4 h-4 text-brand-green" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans">
                  Editorial Quality Checklist
                </h3>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                  <span>All tactical and statistical claims cite Opta, FBref, or official club press releases.</span>
                </div>
                <div className="flex items-start gap-2.5 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                  <span>Images strictly maintain clear copyright clearance status (Owned or Licensed).</span>
                </div>
                <div className="flex items-start gap-2.5 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                  <span>Revisions requested by editors must be addressed prior to final review approval.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Multi-Dimensional Trust Score Telemetry */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-pitch-900 border border-pitch-800 p-6 sm:p-7 space-y-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-pitch-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-brand-green" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-sans">
                    Reputation Telemetry
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Automated Audit</span>
              </div>

              <div className="p-5 bg-pitch-950 border border-pitch-800 text-center space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">
                  Overall Contributor Trust Score
                </span>
                <div className="text-4xl font-extrabold font-mono text-brand-green flex items-center justify-center gap-2">
                  <Star className="w-6 h-6 fill-brand-green text-brand-green" />
                  <span>{trustScore.toFixed(1)}%</span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-brand-green/10 text-brand-green border border-brand-green/20 inline-block">
                  TIER 1 • ELITE CONTRIBUTOR
                </span>
              </div>

              {/* Progress Bars for Multi-Dimensional Metrics */}
              <div className="space-y-4 text-xs font-mono">
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Originality Metric</span>
                    <span className="text-slate-200 font-bold">{originalityScore.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-pitch-950 border border-pitch-800">
                    <div className="h-full bg-brand-green" style={{ width: `${Math.min(100, originalityScore)}%` }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Source Accuracy</span>
                    <span className="text-slate-200 font-bold">{accuracyScore.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-pitch-950 border border-pitch-800">
                    <div className="h-full bg-brand-green" style={{ width: `${Math.min(100, accuracyScore)}%` }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Copyright Compliance</span>
                    <span className="text-slate-200 font-bold">{copyrightScore.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-pitch-950 border border-pitch-800">
                    <div className="h-full bg-brand-green" style={{ width: `${Math.min(100, copyrightScore)}%` }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Editorial Quality</span>
                    <span className="text-slate-200 font-bold">{qualityScore.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-pitch-950 border border-pitch-800">
                    <div className="h-full bg-brand-green" style={{ width: `${Math.min(100, qualityScore)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
