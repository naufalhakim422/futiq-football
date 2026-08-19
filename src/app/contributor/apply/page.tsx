"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  UserCheck,
  FileText,
  Lock,
  Globe,
  Award,
  BookOpen,
  ExternalLink,
  Info,
} from "lucide-react";
import Link from "next/link";
import { GuidelinesModal, GuidelineSection } from "@/components/contributor/GuidelinesModal";

export default function ContributorApplyPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
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

  // Guidelines Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSection, setModalSection] = useState<GuidelineSection>("all");

  const openGuidelines = (section: GuidelineSection = "all") => {
    setModalSection(section);
    setIsModalOpen(true);
  };

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

    if (formData.password && formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Password confirmation does not match password.");
      setLoading(false);
      return;
    }

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
      <div className="py-12 md:py-16">
        <PageContainer>
          <div className="max-w-xl mx-auto bg-pitch-900 border border-pitch-800 p-8 sm:p-10 shadow-2xl text-center space-y-5">
            <div className="w-14 h-14 bg-brand-green/10 border border-brand-green/30 text-brand-green flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest bg-pitch-850 text-brand-green border border-pitch-750">
                Application Received • Docket PENDING
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100 font-sans tracking-tight">
                Contributor Application Submitted
              </h2>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
              Your application has been successfully submitted to the FUTIQ FOOTBALL Editorial Desk.
              Once your accreditation is approved, you can log in directly to the <strong>Contributor Desk</strong> using the credentials you just created.
            </p>

            <div className="p-4 bg-pitch-950 border border-pitch-800 text-left text-xs font-mono space-y-1.5 text-slate-400">
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant Name:</span>
                <span className="text-slate-200 font-semibold">{formData.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account Email:</span>
                <span className="text-brand-green font-semibold">{formData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Docket Status:</span>
                <span className="text-amber-400 font-semibold">Awaiting Editorial Approval</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-[#c3ff00] hover:bg-[#b0e600] rounded-lg transition-colors shadow-lg"
              >
                <span>Sign In Page</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 rounded-lg transition-colors"
              >
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8">
      {/* Interactive Modal for Reading Guidelines & Standards */}
      <GuidelinesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialSection={modalSection}
      />

      <PageContainer>
        <SectionHeader
          title="Contributor Accreditation Application"
          subtitle="Apply for verified editorial bylines, tactical publishing credentials, and newsroom desk access"
          badgeText="Accreditation Desk"
        />

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Trust & Quality Banner with Read Guidelines Trigger */}
          <div className="p-4 bg-pitch-900 border border-pitch-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl">
            <div className="flex items-start sm:items-center gap-3 text-xs text-slate-300">
              <ShieldCheck className="w-5 h-5 text-[#c3ff00] shrink-0 mt-0.5 sm:mt-0" />
              <p className="leading-relaxed">
                All submissions undergo editorial verification, source citation audits, and intellectual property clearance.
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => openGuidelines("all")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 text-[#c3ff00] font-mono text-[11px] font-bold tracking-wider uppercase transition-colors shrink-0 self-start sm:self-auto"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Read Handbook</span>
            </button>
          </div>

          {error && (
            <div className="p-4 bg-brand-red/10 border border-brand-red/30 flex items-center gap-3 text-xs text-brand-red font-mono rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-pitch-900 border border-pitch-800 p-6 sm:p-8 space-y-8 text-xs rounded-2xl shadow-2xl">
            {/* Section 01: Identification */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-pitch-800">
                <span className="w-5 h-5 bg-pitch-800 text-[#c3ff00] font-mono text-[11px] font-bold flex items-center justify-center rounded">
                  01
                </span>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans">
                  Personal & Editorial Identification
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    Legal Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Elena Rostova"
                    className="w-full bg-pitch-950 border border-pitch-750 px-3.5 py-2.5 text-slate-100 focus:border-[#c3ff00] focus:ring-1 focus:ring-[#c3ff00]/30 outline-none font-sans rounded transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    Editorial Bylines Name *
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    required
                    value={formData.displayName}
                    onChange={handleChange}
                    placeholder="e.g. Elena Rostova"
                    className="w-full bg-pitch-950 border border-pitch-750 px-3.5 py-2.5 text-slate-100 focus:border-[#c3ff00] focus:ring-1 focus:ring-[#c3ff00]/30 outline-none font-sans rounded transition-all"
                  />
                  <p className="text-[10px] text-slate-500 font-mono">Public byline appearing on published articles</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
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
                    className="w-full bg-pitch-950 border border-pitch-750 px-3.5 py-2.5 text-slate-100 focus:border-[#c3ff00] focus:ring-1 focus:ring-[#c3ff00]/30 outline-none font-mono rounded transition-all"
                  />
                </div>

                <div className="space-y-1.5">
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
                    className="w-full bg-pitch-950 border border-pitch-750 px-3.5 py-2.5 text-slate-100 focus:border-[#c3ff00] focus:ring-1 focus:ring-[#c3ff00]/30 outline-none font-sans rounded transition-all"
                  />
                </div>
              </div>

              {/* Password for Future Login */}
              <div className="p-4 bg-pitch-950 border border-pitch-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-slate-200">
                  <Lock className="w-4 h-4 text-[#c3ff00]" />
                  <span className="font-bold font-mono text-[11px] uppercase tracking-wider">
                    Contributor Account Password (For Future Login)
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                  Create your account password. You will use this password to sign in to the Contributor Desk once your accreditation is approved.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px] font-mono">
                      New Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-pitch-900 border border-pitch-750 px-3.5 py-2 text-slate-100 focus:border-[#c3ff00] focus:ring-1 focus:ring-[#c3ff00]/30 outline-none font-mono rounded transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px] font-mono">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat password"
                      className="w-full bg-pitch-900 border border-pitch-750 px-3.5 py-2 text-slate-100 focus:border-[#c3ff00] focus:ring-1 focus:ring-[#c3ff00]/30 outline-none font-mono rounded transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 02: Coverage & Beat Specialization */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-pitch-800">
                <span className="w-5 h-5 bg-pitch-800 text-[#c3ff00] font-mono text-[11px] font-bold flex items-center justify-center rounded">
                  02
                </span>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans">
                  Beat Specialization & Competitions
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    Primary Coverage Beat *
                  </label>
                  <select
                    name="preferredCategories"
                    value={formData.preferredCategories}
                    onChange={handleChange}
                    className="w-full bg-pitch-950 border border-pitch-750 px-3.5 py-2.5 text-slate-100 focus:border-[#c3ff00] focus:ring-1 focus:ring-[#c3ff00]/30 outline-none font-sans rounded transition-all"
                  >
                    <option value="Tactical Analysis">Tactical Analysis & Deep Dives</option>
                    <option value="Match Reports">Match Reports & Player Ratings</option>
                    <option value="Transfer Intelligence">Transfer Intelligence & Market Radar</option>
                    <option value="European Football">European Competitions (UCL/UEL)</option>
                    <option value="Club Features">Club Culture & Long-Form Features</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    Preferred Language
                  </label>
                  <select
                    name="preferredLanguage"
                    value={formData.preferredLanguage}
                    onChange={handleChange}
                    className="w-full bg-pitch-950 border border-pitch-750 px-3.5 py-2.5 text-slate-100 focus:border-[#c3ff00] focus:ring-1 focus:ring-[#c3ff00]/30 outline-none font-sans rounded transition-all"
                  >
                    <option value="en">English (UK/Global)</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Leagues, Clubs & Tactical Focal Areas *
                </label>
                <input
                  type="text"
                  name="footballInterests"
                  required
                  value={formData.footballInterests}
                  onChange={handleChange}
                  placeholder="e.g. Premier League (Arsenal, Brighton), Serie A tactical setups, Champions League knockout analytics"
                  className="w-full bg-pitch-950 border border-pitch-750 px-3.5 py-2.5 text-slate-100 focus:border-[#c3ff00] focus:ring-1 focus:ring-[#c3ff00]/30 outline-none font-sans rounded transition-all"
                />
              </div>
            </div>

            {/* Section 03: Editorial Dossier */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-pitch-800">
                <span className="w-5 h-5 bg-pitch-800 text-[#c3ff00] font-mono text-[11px] font-bold flex items-center justify-center rounded">
                  03
                </span>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans">
                  Editorial Background & Writing Samples
                </h3>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Short Author Biography *
                </label>
                <textarea
                  name="shortBio"
                  required
                  rows={3}
                  value={formData.shortBio}
                  onChange={handleChange}
                  placeholder="Summarize your football journalism perspective, analytical focus, and publication voice..."
                  className="w-full bg-pitch-950 border border-pitch-750 p-3.5 text-slate-100 focus:border-[#c3ff00] focus:ring-1 focus:ring-[#c3ff00]/30 outline-none font-sans leading-relaxed rounded"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Writing & Journalism Experience *
                </label>
                <textarea
                  name="writingExperience"
                  required
                  rows={3}
                  value={formData.writingExperience}
                  onChange={handleChange}
                  placeholder="List relevant sports blogs, tactical newsletters, independent reporting, or accredited media outlets..."
                  className="w-full bg-pitch-950 border border-pitch-750 p-3.5 text-slate-100 focus:border-[#c3ff00] focus:ring-1 focus:ring-[#c3ff00]/30 outline-none font-sans leading-relaxed rounded"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    Portfolio / Writing Samples URL (Optional)
                  </label>
                  <input
                    type="url"
                    name="portfolioUrl"
                    value={formData.portfolioUrl}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full bg-pitch-950 border border-pitch-750 px-3.5 py-2 text-slate-100 focus:border-[#c3ff00] focus:ring-1 focus:ring-[#c3ff00]/30 outline-none font-mono rounded"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    Social / Profile URL (Optional)
                  </label>
                  <input
                    type="url"
                    name="socialUrl"
                    value={formData.socialUrl}
                    onChange={handleChange}
                    placeholder="https://x.com/..."
                    className="w-full bg-pitch-950 border border-pitch-750 px-3.5 py-2 text-slate-100 focus:border-[#c3ff00] focus:ring-1 focus:ring-[#c3ff00]/30 outline-none font-mono rounded"
                  />
                </div>
              </div>
            </div>

            {/* Section 04: Legal & Standards Declarations */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between pb-2 border-b border-pitch-800">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-pitch-800 text-[#c3ff00] font-mono text-[11px] font-bold flex items-center justify-center rounded">
                    04
                  </span>
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans">
                    Editorial Integrity & Copyright Declarations
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => openGuidelines("all")}
                  className="text-[11px] font-mono text-[#c3ff00] hover:underline flex items-center gap-1 font-bold"
                >
                  <span>Click to Read All Terms</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Checkbox 1 */}
                <div className="p-3.5 bg-pitch-950 border border-pitch-800 hover:border-pitch-700 rounded-xl transition-colors space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="agreementAccepted"
                      checked={formData.agreementAccepted}
                      onChange={handleChange}
                      required
                      className="mt-0.5 rounded border-pitch-700 bg-pitch-900 text-[#c3ff00] focus:ring-0 w-4 h-4 accent-[#c3ff00]"
                    />
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-100 block text-xs">
                          Contributor Code of Conduct & Editorial Guidelines
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            openGuidelines("code-of-conduct");
                          }}
                          className="text-[10px] font-mono text-[#c3ff00] hover:underline inline-flex items-center gap-1 font-bold bg-[#c3ff00]/10 px-2 py-0.5 rounded border border-[#c3ff00]/30"
                        >
                          <span>Read Guidelines</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        I agree to maintain factual precision, professional sports journalism standards, and editorial independence.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Checkbox 2 */}
                <div className="p-3.5 bg-pitch-950 border border-pitch-800 hover:border-pitch-700 rounded-xl transition-colors space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="originalityDeclared"
                      checked={formData.originalityDeclared}
                      onChange={handleChange}
                      required
                      className="mt-0.5 rounded border-pitch-700 bg-pitch-900 text-[#c3ff00] focus:ring-0 w-4 h-4 accent-[#c3ff00]"
                    />
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-100 block text-xs">
                          Declaration of Original Authorship
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            openGuidelines("originality");
                          }}
                          className="text-[10px] font-mono text-[#c3ff00] hover:underline inline-flex items-center gap-1 font-bold bg-[#c3ff00]/10 px-2 py-0.5 rounded border border-[#c3ff00]/30"
                        >
                          <span>Read Originality Rules</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        I affirm that all submitted articles will be 100% original work with verifiable citations and primary sources.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Checkbox 3 */}
                <div className="p-3.5 bg-pitch-950 border border-pitch-800 hover:border-pitch-700 rounded-xl transition-colors space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="copyrightDeclared"
                      checked={formData.copyrightDeclared}
                      onChange={handleChange}
                      required
                      className="mt-0.5 rounded border-pitch-700 bg-pitch-900 text-[#c3ff00] focus:ring-0 w-4 h-4 accent-[#c3ff00]"
                    />
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-100 block text-xs">
                          Intellectual Property & Image Rights Compliance
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            openGuidelines("image-rights");
                          }}
                          className="text-[10px] font-mono text-[#c3ff00] hover:underline inline-flex items-center gap-1 font-bold bg-[#c3ff00]/10 px-2 py-0.5 rounded border border-[#c3ff00]/30"
                        >
                          <span>Read IP & Image Policy</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        I will strictly utilize authorized media (Owned, Licensed, Official Press Kits, or Public Domain) with proper attribution.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Group */}
            <div className="pt-4 border-t border-pitch-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono">
                <Lock className="w-3.5 h-3.5 text-[#c3ff00] shrink-0" />
                <span>SSL Encrypted • Direct Editorial Routing</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-[#c3ff00] hover:bg-[#b0e600] disabled:opacity-50 transition-all rounded-xl shadow-lg active:scale-[0.99]"
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
