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
  Check,
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
  const [modalSection, setModalSection] = useState<GuidelineSection>("code-of-conduct");

  const openGuidelines = (section: GuidelineSection) => {
    setModalSection(section);
    setIsModalOpen(true);
  };

  const handleModalAccept = (section: GuidelineSection) => {
    if (section === "code-of-conduct") {
      setFormData((prev) => ({ ...prev, agreementAccepted: true }));
    } else if (section === "originality") {
      setFormData((prev) => ({ ...prev, originalityDeclared: true }));
    } else if (section === "image-rights") {
      setFormData((prev) => ({ ...prev, copyrightDeclared: true }));
    }
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

    if (!formData.agreementAccepted) {
      setError("Please read and accept the Contributor Code of Conduct before proceeding.");
      openGuidelines("code-of-conduct");
      setLoading(false);
      return;
    }

    if (!formData.originalityDeclared) {
      setError("Please read and accept the Declaration of Original Authorship before proceeding.");
      openGuidelines("originality");
      setLoading(false);
      return;
    }

    if (!formData.copyrightDeclared) {
      setError("Please read and accept the Intellectual Property & Image Rights Compliance before proceeding.");
      openGuidelines("image-rights");
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
      {/* Interactive Modal for Reading Single Specific Guideline */}
      <GuidelinesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        section={modalSection}
        onAccept={handleModalAccept}
      />

      <PageContainer>
        <SectionHeader
          title="Contributor Accreditation Application"
          subtitle="Apply for verified editorial bylines, tactical publishing credentials, and newsroom desk access"
          badgeText="Accreditation Desk"
        />

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Trust & Quality Banner */}
          <div className="p-4 bg-pitch-900 border border-pitch-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl">
            <div className="flex items-start sm:items-center gap-3 text-xs text-slate-300">
              <ShieldCheck className="w-5 h-5 text-[#c3ff00] shrink-0 mt-0.5 sm:mt-0" />
              <p className="leading-relaxed">
                All submissions undergo editorial verification, source citation audits, and intellectual property clearance.
              </p>
            </div>
            
            <Link
              href="/editorial-guidelines"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 text-[#c3ff00] font-mono text-[11px] font-bold tracking-wider uppercase transition-colors shrink-0 self-start sm:self-auto"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Full Handbook ↗</span>
            </Link>
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

            {/* Section 04: Legal & Standards Declarations (1-to-1 Interactive Modal Policy Enforcement) */}
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

                <span className="text-[10px] font-mono text-slate-400">
                  (Must read and accept each policy before submitting)
                </span>
              </div>

              <div className="space-y-3">
                {/* 1. Code of Conduct */}
                <div
                  className={`p-4 bg-pitch-950 border rounded-xl transition-all ${
                    formData.agreementAccepted
                      ? "border-[#c3ff00]/50 bg-[#c3ff00]/5"
                      : "border-pitch-800 hover:border-slate-600"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => openGuidelines("code-of-conduct")}
                        className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${
                          formData.agreementAccepted
                            ? "bg-[#c3ff00] border-[#c3ff00] text-slate-950 font-bold"
                            : "bg-pitch-900 border-pitch-700 hover:border-[#c3ff00]"
                        }`}
                      >
                        {formData.agreementAccepted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-100 text-xs flex items-center gap-2">
                          <span>1. Contributor Code of Conduct & Editorial Guidelines</span>
                        </div>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          Factual precision, tactical objectivity, sports journalism standards, and neutral editorial tone.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openGuidelines("code-of-conduct")}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider shrink-0 transition-colors flex items-center gap-1.5 ${
                        formData.agreementAccepted
                          ? "bg-pitch-900 text-[#c3ff00] border border-[#c3ff00]/40 hover:bg-pitch-850"
                          : "bg-[#c3ff00] text-slate-950 hover:bg-[#b0e600] shadow-md animate-pulse"
                      }`}
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>{formData.agreementAccepted ? "Review Terms ✓" : "Read & Accept"}</span>
                    </button>
                  </div>
                </div>

                {/* 2. Originality */}
                <div
                  className={`p-4 bg-pitch-950 border rounded-xl transition-all ${
                    formData.originalityDeclared
                      ? "border-[#c3ff00]/50 bg-[#c3ff00]/5"
                      : "border-pitch-800 hover:border-slate-600"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => openGuidelines("originality")}
                        className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${
                          formData.originalityDeclared
                            ? "bg-[#c3ff00] border-[#c3ff00] text-slate-950 font-bold"
                            : "bg-pitch-900 border-pitch-700 hover:border-[#c3ff00]"
                        }`}
                      >
                        {formData.originalityDeclared && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-100 text-xs flex items-center gap-2">
                          <span>2. Declaration of Original Authorship & Citations</span>
                        </div>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          100% original human analysis, zero plagiarism, and mandatory primary source citations.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openGuidelines("originality")}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider shrink-0 transition-colors flex items-center gap-1.5 ${
                        formData.originalityDeclared
                          ? "bg-pitch-900 text-[#c3ff00] border border-[#c3ff00]/40 hover:bg-pitch-850"
                          : "bg-[#c3ff00] text-slate-950 hover:bg-[#b0e600] shadow-md animate-pulse"
                      }`}
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>{formData.originalityDeclared ? "Review Terms ✓" : "Read & Accept"}</span>
                    </button>
                  </div>
                </div>

                {/* 3. Image Rights */}
                <div
                  className={`p-4 bg-pitch-950 border rounded-xl transition-all ${
                    formData.copyrightDeclared
                      ? "border-[#c3ff00]/50 bg-[#c3ff00]/5"
                      : "border-pitch-800 hover:border-slate-600"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => openGuidelines("image-rights")}
                        className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${
                          formData.copyrightDeclared
                            ? "bg-[#c3ff00] border-[#c3ff00] text-slate-950 font-bold"
                            : "bg-pitch-900 border-pitch-700 hover:border-[#c3ff00]"
                        }`}
                      >
                        {formData.copyrightDeclared && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-100 text-xs flex items-center gap-2">
                          <span>3. Intellectual Property & Image Rights Compliance</span>
                        </div>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          Authorized media licensing (Unsplash, official press kits, owned photography), proper credit lines.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openGuidelines("image-rights")}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider shrink-0 transition-colors flex items-center gap-1.5 ${
                        formData.copyrightDeclared
                          ? "bg-pitch-900 text-[#c3ff00] border border-[#c3ff00]/40 hover:bg-pitch-850"
                          : "bg-[#c3ff00] text-slate-950 hover:bg-[#b0e600] shadow-md animate-pulse"
                      }`}
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>{formData.copyrightDeclared ? "Review Terms ✓" : "Read & Accept"}</span>
                    </button>
                  </div>
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
