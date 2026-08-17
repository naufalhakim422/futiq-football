import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { contributorService } from "@/lib/contributor/contributor.service";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ShieldCheck, Award, Star, User, Globe } from "lucide-react";
import { redirect } from "next/navigation";

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

  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        <SectionHeader
          title="Contributor Profile & Reputation"
          subtitle="Manage your public editorial bylines, coverage interests, and trust telemetry"
          badgeText="Author Dossier"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Author Bio & Details */}
          <div className="lg:col-span-7 bg-pitch-900 border border-pitch-800 p-6 space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-pitch-800">
              <div className="w-16 h-16 rounded-full bg-pitch-800 border border-pitch-700 flex items-center justify-center font-bold text-xl text-brand-green font-mono">
                {profile?.displayName.substring(0, 2).toUpperCase() || "AU"}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-pitch-800 text-brand-green border border-pitch-700 font-mono">
                    {profile?.status || "ACTIVE"}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {profile?.country}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-slate-100 font-sans">
                  {profile?.displayName}
                </h1>
                <p className="text-xs text-slate-400 font-mono">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="bg-pitch-850 border border-pitch-750 p-4 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase">Editorial Bio</span>
                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                  {profile?.bio || "No biography provided yet. Update your profile to share your football journalism background."}
                </p>
              </div>

              <div className="bg-pitch-850 border border-pitch-750 p-4 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase">Preferred Language</span>
                <p className="text-slate-200 uppercase font-bold">
                  {profile?.preferredLanguage}
                </p>
              </div>

              {profile?.portfolioUrl && (
                <div className="bg-pitch-850 border border-pitch-750 p-4 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase">Portfolio / Clips</span>
                  <a
                    href={profile.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-green hover:underline truncate block"
                  >
                    {profile.portfolioUrl}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Trust Score & Quality Gate Telemetry */}
          <div className="lg:col-span-5 bg-pitch-900 border border-pitch-800 p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-pitch-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-green" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Trust Score Metrics
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Baseline Score</span>
            </div>

            <div className="p-4 bg-pitch-950 border border-pitch-800 text-center space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">
                Overall Contributor Trust Score
              </span>
              <div className="text-3xl font-extrabold font-mono text-brand-green flex items-center justify-center gap-1">
                <Star className="w-5 h-5 fill-brand-green text-brand-green" />
                <span>{Number(profile?.overallTrustScore || 100).toFixed(1)}%</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                Derived from editorial approvals, source validity, and revision requests
              </p>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between p-2.5 bg-pitch-850 border border-pitch-750">
                <span className="text-slate-400">Originality Metric</span>
                <span className="text-slate-200 font-bold">{Number(profile?.originalityScore || 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between p-2.5 bg-pitch-850 border border-pitch-750">
                <span className="text-slate-400">Accuracy & Sources</span>
                <span className="text-slate-200 font-bold">{Number(profile?.accuracyScore || 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between p-2.5 bg-pitch-850 border border-pitch-750">
                <span className="text-slate-400">Copyright Compliance</span>
                <span className="text-slate-200 font-bold">{Number(profile?.copyrightScore || 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between p-2.5 bg-pitch-850 border border-pitch-750">
                <span className="text-slate-400">Editorial Quality</span>
                <span className="text-slate-200 font-bold">{Number(profile?.qualityScore || 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
