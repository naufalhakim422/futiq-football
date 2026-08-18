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
} from "lucide-react";
import Link from "next/link";

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
      setError("Kata sandi minimal 6 karakter.");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok dengan kata sandi.");
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
              Pendaftaran Anda telah berhasil dicatat ke Meja Redaksi FUTIQ FOOTBALL.
              Setelah pendaftaran disetujui (ACC), Anda dapat langsung masuk ke <strong>Meja Kontributor</strong> menggunakan email dan kata sandi yang baru saja Anda buat.
            </p>

            <div className="p-4 bg-pitch-950 border border-pitch-800 text-left text-xs font-mono space-y-1.5 text-slate-400">
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Pendaftar:</span>
                <span className="text-slate-200 font-semibold">{formData.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email Akun:</span>
                <span className="text-brand-green font-semibold">{formData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Sesi:</span>
                <span className="text-amber-400 font-semibold">Menunggu Persetujuan Redaksi</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-[#c3ff00] hover:bg-[#b0e600] rounded-lg transition-colors shadow-lg"
              >
                <span>Halaman Masuk (Login)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 rounded-lg transition-colors"
              >
                <span>Kembali ke Beranda</span>
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
          title="Contributor Accreditation Application"
          subtitle="Apply for verified editorial bylines, tactical publishing credentials, and newsroom desk access"
          badgeText="Accreditation Desk"
        />

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Trust & Quality Banner */}
          <div className="p-4 bg-pitch-900 border border-pitch-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3 text-xs text-slate-300">
              <ShieldCheck className="w-5 h-5 text-brand-green shrink-0 mt-0.5 sm:mt-0" />
              <p className="leading-relaxed">
                All submissions undergo editorial verification, source citation audits, and intellectual property clearance.
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest shrink-0 self-end sm:self-auto">
              Standards v1.0
            </span>
          </div>

          {error && (
            <div className="p-4 bg-brand-red/10 border border-brand-red/30 flex items-center gap-3 text-xs text-brand-red font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-pitch-900 border border-pitch-800 p-6 sm:p-8 space-y-8 text-xs">
            {/* Section 01: Identification */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-pitch-800">
                <span className="w-5 h-5 bg-pitch-800 text-brand-green font-mono text-[11px] font-bold flex items-center justify-center">
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
                    className="w-full bg-pitch-950 border border-pitch-750 px-3.5 py-2.5 text-slate-100 focus:border-brand-green focus:ring-1 focus:ring-brand-green/30 outline-none font-sans transition-all"
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
                    className="w-full bg-pitch-950 border border-pitch-750 px-3.5 py-2.5 text-slate-100 focus:border-brand-green focus:ring-1 focus:ring-brand-green/30 outline-none font-sans transition-all"
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
                    className="w-full bg-pitch-950 border border-pitch-750 px-3.5 py-2.5 text-slate-100 focus:border-brand-green focus:ring-1 focus:ring-brand-green/30 outline-none font-mono transition-all"
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
                    placeholder="e.g. Indonesia"
                    className="w-full bg-pitch-950 border border-pitch-750 px-3.5 py-2.5 text-slate-100 focus:border-brand-green focus:ring-1 focus:ring-brand-green/30 outline-none font-sans transition-all"
                  />
                </div>
              </div>

              {/* Password for Future Login */}
              <div className="p-4 bg-pitch-950 border border-pitch-800 rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-slate-200">
                  <Lock className="w-4 h-4 text-brand-green" />
                  <span className="font-bold font-mono text-[11px] uppercase tracking-wider">
                    Kata Sandi Akun Kontributor (Untuk Login)
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                  Buat kata sandi akun Anda. Kata sandi ini akan Anda gunakan untuk masuk ke Meja Kontributor setelah pendaftaran disetujui tim redaksi.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px] font-mono">
                      Kata Sandi Baru *
                    </label>
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimal 6 karakter"
                      className="w-full bg-pitch-900 border border-pitch-750 px-3.5 py-2 text-slate-100 focus:border-brand-green focus:ring-1 focus:ring-brand-green/30 outline-none font-mono transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px] font-mono">
                      Konfirmasi Kata Sandi *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Ulangi kata sandi"
                      className="w-full bg-pitch-900 border border-pitch-750 px-3.5 py-2 text-slate-100 focus:border-brand-green focus:ring-1 focus:ring-brand-green/30 outline-none font-mono transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 02: Coverage & Beat Specialization */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-pitch-800">
                <span className="w-5 h-5 bg-pitch-800 text-brand-green font-mono text-[11px] font-bold flex items-center justify-center">
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
                    className="w-full bg-pitch-950 border border-pitch-750 px-3.5 py-2.5 text-slate-100 focus:border-brand-green focus:ring-1 focus:ring-brand-green/30 outline-none font-sans transition-all"
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
                    className="w-full bg-pitch-950 border border-pitch-750 px-3.5 py-2.5 text-slate-100 focus:border-brand-green focus:ring-1 focus:ring-brand-green/30 outline-none font-sans transition-all"
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
                  className="w-full bg-pitch-950 border border-pitch-750 px-3.5 py-2.5 text-slate-100 focus:border-brand-green focus:ring-1 focus:ring-brand-green/30 outline-none font-sans transition-all"
                />
              </div>
            </div>

            {/* Section 03: Editorial Dossier */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-pitch-800">
                <span className="w-5 h-5 bg-pitch-800 text-brand-green font-mono text-[11px] font-bold flex items-center justify-center">
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
                  className="w-full bg-pitch-950 border border-pitch-750 p-3.5 text-slate-100 focus:border-brand-green focus:ring-1 focus:ring-brand-green/30 outline-none font-sans leading-relaxed"
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
                  className="w-full bg-pitch-950 border border-pitch-750 p-3.5 text-slate-100 focus:border-brand-green focus:ring-1 focus:ring-brand-green/30 outline-none font-sans leading-relaxed"
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
                    className="w-full bg-pitch-950 border border-pitch-750 px-3.5 py-2 text-slate-100 focus:border-brand-green focus:ring-1 focus:ring-brand-green/30 outline-none font-mono"
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
                    className="w-full bg-pitch-950 border border-pitch-750 px-3.5 py-2 text-slate-100 focus:border-brand-green focus:ring-1 focus:ring-brand-green/30 outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section 04: Legal & Standards Declarations */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-pitch-800">
                <span className="w-5 h-5 bg-pitch-800 text-brand-green font-mono text-[11px] font-bold flex items-center justify-center">
                  04
                </span>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans">
                  Editorial Integrity & Copyright Declarations
                </h3>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 bg-pitch-950 border border-pitch-800 hover:border-pitch-700 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreementAccepted"
                    checked={formData.agreementAccepted}
                    onChange={handleChange}
                    required
                    className="mt-0.5 rounded-none border-pitch-700 bg-pitch-900 text-brand-green focus:ring-0 w-4 h-4"
                  />
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-200 block text-[11px]">
                      Contributor Code of Conduct & Editorial Guidelines
                    </span>
                    <p className="text-slate-400 text-[10px] leading-relaxed">
                      I agree to maintain factual precision, professional sports journalism standards, and editorial independence.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-pitch-950 border border-pitch-800 hover:border-pitch-700 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    name="originalityDeclared"
                    checked={formData.originalityDeclared}
                    onChange={handleChange}
                    required
                    className="mt-0.5 rounded-none border-pitch-700 bg-pitch-900 text-brand-green focus:ring-0 w-4 h-4"
                  />
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-200 block text-[11px]">
                      Declaration of Original Authorship
                    </span>
                    <p className="text-slate-400 text-[10px] leading-relaxed">
                      I affirm that all submitted articles will be 100% original work with verifiable citations and primary sources.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-pitch-950 border border-pitch-800 hover:border-pitch-700 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    name="copyrightDeclared"
                    checked={formData.copyrightDeclared}
                    onChange={handleChange}
                    required
                    className="mt-0.5 rounded-none border-pitch-700 bg-pitch-900 text-brand-green focus:ring-0 w-4 h-4"
                  />
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-200 block text-[11px]">
                      Intellectual Property & Image Rights Compliance
                    </span>
                    <p className="text-slate-400 text-[10px] leading-relaxed">
                      I will strictly utilize authorized media (Owned, Licensed, Official Press Kits, or Public Domain) with proper attribution.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Action Group */}
            <div className="pt-4 border-t border-pitch-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono">
                <Lock className="w-3.5 h-3.5 text-brand-green shrink-0" />
                <span>SSL Encrypted • Direct Editorial Routing</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 bg-brand-green hover:bg-brand-green-hover disabled:opacity-50 transition-all shadow-lg active:scale-[0.99]"
              >
                {loading ? "Submitting Dossier..." : "Submit Contributor Application"}
              </button>
            </div>
          </form>
        </div>
      </PageContainer>
    </div>
  );
}
