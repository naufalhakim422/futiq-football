import React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import {
  ShieldCheck,
  FileText,
  Copyright,
  Coins,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Lock,
  Scale,
  Sparkles,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Editorial Guidelines & Contributor Standards | FUTIQ FOOTBALL",
  description: "Official editorial policies, fact-checking requirements, copyright protocols, and contributor revenue share terms for FUTIQ FOOTBALL.",
};

export default function EditorialGuidelinesPage() {
  return (
    <div className="py-10 space-y-10 font-sans">
      <PageContainer>
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-4 border-b border-pitch-800">
          <Link
            href="/contributor/apply"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Contributor Application</span>
          </Link>
          <span className="text-xs font-mono text-slate-500">
            Document Version: 2.0 • Updated August 2026
          </span>
        </div>

        {/* Header Masthead */}
        <div className="space-y-3 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-pitch-900 text-[#c3ff00] text-[10px] font-mono font-bold uppercase tracking-widest border border-pitch-750 rounded-full">
            <BookOpen className="w-3 h-3 text-[#c3ff00]" />
            <span>FUTIQ Journalism Standards</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 tracking-tight leading-tight">
            Editorial Guidelines & Contributor Terms of Accreditation
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            FUTIQ FOOTBALL is dedicated to world-class tactical journalism, uncompromising data integrity, and fair rewards for accredited writers. This handbook outlines the mandatory standards every contributor must uphold.
          </p>
        </div>

        {/* Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
          <div className="p-5 bg-pitch-900 border border-pitch-800 rounded-2xl space-y-2">
            <ShieldCheck className="w-6 h-6 text-[#c3ff00]" />
            <h3 className="font-bold text-slate-100 text-sm">1. Fact-Checked</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every tactical analysis, transfer insight, and match report must be verifiable against Opta feeds or primary sources.
            </p>
          </div>

          <div className="p-5 bg-pitch-900 border border-pitch-800 rounded-2xl space-y-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            <h3 className="font-bold text-slate-100 text-sm">2. 100% Original</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Zero tolerance for plagiarism, uncredited translations, automated scraping, or unverified AI hallucinations.
            </p>
          </div>

          <div className="p-5 bg-pitch-900 border border-pitch-800 rounded-2xl space-y-2">
            <Copyright className="w-6 h-6 text-purple-400" />
            <h3 className="font-bold text-slate-100 text-sm">3. IP & Media Rights</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strict adherence to copyright laws. Only licensed, press-kit, or author-owned photography is permitted.
            </p>
          </div>

          <div className="p-5 bg-pitch-900 border border-pitch-800 rounded-2xl space-y-2">
            <Coins className="w-6 h-6 text-amber-400" />
            <h3 className="font-bold text-slate-100 text-sm">4. Fair Monetization</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Server-authoritative earnings per qualified read with transparent withdrawals starting at RM 85.00.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 pt-4">
          {/* Section 1 */}
          <section className="bg-pitch-900 border border-pitch-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 pb-3 border-b border-pitch-800">
              <span className="w-7 h-7 rounded-lg bg-pitch-800 text-[#c3ff00] font-mono text-xs font-bold flex items-center justify-center">
                01
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-100">
                Code of Conduct & Professional Standards
              </h2>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <p>
                As an accredited FUTIQ Contributor, you represent the highest standard of sports journalism. All manuscripts must reflect objective, respectful, and factually sound coverage:
              </p>

              <ul className="space-y-2.5 pl-2">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#c3ff00] shrink-0 mt-0.5" />
                  <span><strong>Neutrality & Fair Analysis:</strong> Criticisms of players, tacticians, or referee decisions must be backed by tactical evidence, footage analysis, or statistical models (e.g. xG, PPDA, rest defense structure).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#c3ff00] shrink-0 mt-0.5" />
                  <span><strong>Zero Defamation or Tribal Abuse:</strong> Harassment, discriminatory slurs, abusive mockery, or defamatory statements against any football figure or supporter base are strictly prohibited.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#c3ff00] shrink-0 mt-0.5" />
                  <span><strong>Correction Protocol:</strong> If a factual error is identified after publication, contributors must immediately request an erratum revision through the editorial desk.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section className="bg-pitch-900 border border-pitch-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 pb-3 border-b border-pitch-800">
              <span className="w-7 h-7 rounded-lg bg-pitch-800 text-[#c3ff00] font-mono text-xs font-bold flex items-center justify-center">
                02
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-100">
                Original Authorship, Citations & AI Gate Policies
              </h2>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <p>
                Every article published under your byline must represent genuine original research:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="p-4 bg-pitch-950 border border-pitch-800 rounded-xl space-y-2">
                  <h4 className="font-bold text-slate-100 font-mono text-xs uppercase text-[#c3ff00]">
                    Primary Citations Required
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    At least one verifiable original citation (official press release, Opta data table, accredited interview transcript, or official team statement) must be logged in the manuscript reference table.
                  </p>
                </div>

                <div className="p-4 bg-pitch-950 border border-pitch-800 rounded-xl space-y-2">
                  <h4 className="font-bold text-slate-100 font-mono text-xs uppercase text-cyan-400">
                    AI Assistance Boundaries
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    AI grammar assistants are allowed. However, generating entire articles synthetically without human analytical expertise is strictly rejected by our automated AI Editorial Gate.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-pitch-900 border border-pitch-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 pb-3 border-b border-pitch-800">
              <span className="w-7 h-7 rounded-lg bg-pitch-800 text-[#c3ff00] font-mono text-xs font-bold flex items-center justify-center">
                03
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-100">
                Intellectual Property & Image Rights Clearance
              </h2>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <p>
                To protect both writers and FUTIQ FOOTBALL from copyright infringement liability, media assets must satisfy clear legal ownership criteria:
              </p>

              <div className="p-4 bg-pitch-950 border border-pitch-800 rounded-xl space-y-2 text-xs">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#c3ff00] shrink-0 mt-0.5" />
                    <span><strong>Licensed Photography:</strong> Use imagery from licensed libraries (Unsplash, Pexels, API-Sports media, or open press kits).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#c3ff00] shrink-0 mt-0.5" />
                    <span><strong>Accurate Attribution:</strong> All images must include an explicit photo credit line (e.g. <em>Photo: Unsplash / John Doe</em>).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
                    <span><strong>Prohibited Media:</strong> Watermarked images (Getty/Reuters/AFP), TV broadcast screen grabs with channel logos, or scraped social media photos without owner permission will be flagged and rejected.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-pitch-900 border border-pitch-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 pb-3 border-b border-pitch-800">
              <span className="w-7 h-7 rounded-lg bg-pitch-800 text-[#c3ff00] font-mono text-xs font-bold flex items-center justify-center">
                04
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-100">
                Contributor Rewards, Qualified Views & Wallet Payouts
              </h2>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <p>
                FUTIQ implements a transparent, double-entry financial ledger that credits contributors based on genuine reader engagement:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="p-4 bg-pitch-950 border border-pitch-800 rounded-xl space-y-1.5 text-center font-mono">
                  <span className="text-[10px] text-slate-500 uppercase">Min. Withdrawal</span>
                  <div className="text-xl font-extrabold text-[#c3ff00]">RM 85.00</div>
                  <span className="text-[10px] text-slate-400">Direct to registered bank</span>
                </div>

                <div className="p-4 bg-pitch-950 border border-pitch-800 rounded-xl space-y-1.5 text-center font-mono">
                  <span className="text-[10px] text-slate-500 uppercase">Fraud & Bot Shield</span>
                  <div className="text-xl font-extrabold text-cyan-400">Active Telemetry</div>
                  <span className="text-[10px] text-slate-400">Qualified real dwell time &gt;30s</span>
                </div>

                <div className="p-4 bg-pitch-950 border border-pitch-800 rounded-xl space-y-1.5 text-center font-mono">
                  <span className="text-[10px] text-slate-500 uppercase">Bank Edit Cooldown</span>
                  <div className="text-xl font-extrabold text-purple-400">48 Hours</div>
                  <span className="text-[10px] text-slate-400">Security protection against theft</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Bottom CTA */}
        <div className="p-8 rounded-3xl bg-pitch-900 border border-pitch-750 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold text-slate-100">
              Ready to Submit Your Accreditation Application?
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Join our global team of football analysts, tactical columnists, and investigative writers.
            </p>
          </div>

          <Link
            href="/contributor/apply"
            className="inline-flex items-center gap-2 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-[#c3ff00] hover:bg-[#b0e600] rounded-xl transition-all shadow-lg active:scale-[0.98] shrink-0"
          >
            <span>Proceed to Application</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </Link>
        </div>
      </PageContainer>
    </div>
  );
}
