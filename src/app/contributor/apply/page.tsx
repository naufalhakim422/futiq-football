"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ContributorApplyPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    displayName: "",
    email: "",
    country: "",
    preferredLanguage: "en",
    footballInterests: "",
    preferredCategories: "Tactical Analysis",
    shortBio: "",
    writingExperience: "",
    portfolioUrl: "",
    socialUrl: "",
    agreementAccepted: false,
    originalityDeclared: false,
    copyrightDeclared: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/contributor/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit application");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An error occurred while submitting your application.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="py-12">
        <PageContainer>
          <div className="max-w-xl mx-auto bg-pitch-900 border border-pitch-800 p-8 text-center space-y-4">
            <div className="w-12 h-12 bg-brand-green/20 text-brand-green rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-100 font-sans">
              Application Submitted Successfully
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your contributor application is now in the editorial review queue.
              Our desk will review your writing credentials, coverage areas, and declaration of original reporting.
            </p>
            <div className="pt-4">
              <Link
                href="/contributor"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-brand-green hover:bg-brand-green-hover transition-colors"
              >
                <span>Return to Contributor Desk</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        <SectionHeader
          title="Join the Contributor Network"
          subtitle="Apply as an independent football writer, tactical analyst, or club correspondent"
          badgeText="Application Desk"
        />

        <div className="max-w-2xl mx-auto bg-pitch-900 border border-pitch-800 p-6 sm:p-8 space-y-6">
          <div className="p-4 bg-pitch-950 border border-pitch-800 flex items-center gap-3 text-xs text-slate-300">
            <ShieldCheck className="w-5 h-5 text-brand-green shrink-0" />
            <p>
              All published articles undergo strict editorial verification, source tracking, and originality validation.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-brand-red/10 border border-brand-red/30 flex items-center gap-3 text-xs text-brand-red">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Elena Rostova"
                  className="w-full bg-pitch-950 border border-pitch-750 px-3 py-2 text-slate-100 rounded focus:border-brand-green outline-none font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Editorial Bylines Display Name *
                </label>
                <input
                  type="text"
                  name="displayName"
                  required
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="e.g. Elena Rostova"
                  className="w-full bg-pitch-950 border border-pitch-750 px-3 py-2 text-slate-100 rounded focus:border-brand-green outline-none font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contributor@example.com"
                  className="w-full bg-pitch-950 border border-pitch-750 px-3 py-2 text-slate-100 rounded focus:border-brand-green outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Country of Residence *
                </label>
                <input
                  type="text"
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="e.g. United Kingdom"
                  className="w-full bg-pitch-950 border border-pitch-750 px-3 py-2 text-slate-100 rounded focus:border-brand-green outline-none font-sans"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Football Leagues & Clubs of Expertise *
              </label>
              <input
                type="text"
                name="footballInterests"
                required
                value={formData.footballInterests}
                onChange={handleChange}
                placeholder="e.g. Premier League (Arsenal & Brighton), Serie A tactical setups"
                className="w-full bg-pitch-950 border border-pitch-750 px-3 py-2 text-slate-100 rounded focus:border-brand-green outline-none font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Primary Coverage Category *
              </label>
              <select
                name="preferredCategories"
                value={formData.preferredCategories}
                onChange={handleChange}
                className="w-full bg-pitch-950 border border-pitch-750 px-3 py-2 text-slate-100 rounded focus:border-brand-green outline-none font-sans"
              >
                <option value="Tactical Analysis">Tactical Analysis & Deep Dives</option>
                <option value="Match Reports">Match Reports & Player Ratings</option>
                <option value="Transfer Intelligence">Transfer Intelligence & Market Radar</option>
                <option value="European Football">European Competitions (UCL/UEL)</option>
                <option value="Club Features">Club Culture & Long-Form Features</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Short Editorial Bio *
              </label>
              <textarea
                name="shortBio"
                required
                rows={3}
                value={formData.shortBio}
                onChange={handleChange}
                placeholder="Provide a brief summary of your writing background and analytical perspective..."
                className="w-full bg-pitch-950 border border-pitch-750 px-3 py-2 text-slate-100 rounded focus:border-brand-green outline-none font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Writing & Journalism Experience *
              </label>
              <textarea
                name="writingExperience"
                required
                rows={3}
                value={formData.writingExperience}
                onChange={handleChange}
                placeholder="Detail any previous publications, blogs, newsletters, or sports reporting projects..."
                className="w-full bg-pitch-950 border border-pitch-750 px-3 py-2 text-slate-100 rounded focus:border-brand-green outline-none font-sans"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Portfolio / Samples URL (Optional)
                </label>
                <input
                  type="url"
                  name="portfolioUrl"
                  value={formData.portfolioUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full bg-pitch-950 border border-pitch-750 px-3 py-2 text-slate-100 rounded focus:border-brand-green outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Social / Profile URL (Optional)
                </label>
                <input
                  type="url"
                  name="socialUrl"
                  value={formData.socialUrl}
                  onChange={handleChange}
                  placeholder="https://x.com/..."
                  className="w-full bg-pitch-950 border border-pitch-750 px-3 py-2 text-slate-100 rounded focus:border-brand-green outline-none font-mono"
                />
              </div>
            </div>

            {/* Declarations */}
            <div className="pt-4 border-t border-pitch-800 space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreementAccepted"
                  checked={formData.agreementAccepted}
                  onChange={handleChange}
                  required
                  className="mt-0.5 rounded border-pitch-700 bg-pitch-950 text-brand-green focus:ring-0"
                />
                <span className="text-slate-300 text-[11px]">
                  I agree to the Contributor Guidelines and Terms of Service.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="originalityDeclared"
                  checked={formData.originalityDeclared}
                  onChange={handleChange}
                  required
                  className="mt-0.5 rounded border-pitch-700 bg-pitch-950 text-brand-green focus:ring-0"
                />
                <span className="text-slate-300 text-[11px]">
                  I declare that all submitted articles will be 100% original editorial work with verifiable sources.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="copyrightDeclared"
                  checked={formData.copyrightDeclared}
                  onChange={handleChange}
                  required
                  className="mt-0.5 rounded border-pitch-700 bg-pitch-950 text-brand-green focus:ring-0"
                />
                <span className="text-slate-300 text-[11px]">
                  I declare that any media or images used will comply with intellectual property and copyright status requirements.
                </span>
              </label>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-xs font-bold uppercase tracking-wider text-slate-950 bg-brand-green hover:bg-brand-green-hover disabled:opacity-50 transition-colors"
              >
                {loading ? "Submitting Application..." : "Submit Contributor Application"}
              </button>
            </div>
          </form>
        </div>
      </PageContainer>
    </div>
  );
}
