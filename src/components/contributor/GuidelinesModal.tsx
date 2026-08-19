"use client";

import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  FileText,
  Copyright,
  Coins,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  BookOpen,
  Scale,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export type GuidelineSection = "code-of-conduct" | "originality" | "image-rights" | "rewards" | "all";

interface GuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: GuidelineSection;
}

export function GuidelinesModal({
  isOpen,
  onClose,
  initialSection = "all",
}: GuidelinesModalProps) {
  const [activeTab, setActiveTab] = useState<GuidelineSection>(initialSection);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-pitch-900 border border-pitch-750 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-pitch-950 border-b border-pitch-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pitch-900 border border-[#c3ff00]/40 flex items-center justify-center text-[#c3ff00]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100 font-sans">
                  FUTIQ Editorial Handbook & Contributor Terms
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#c3ff00]/10 text-[#c3ff00] border border-[#c3ff00]/30 uppercase">
                  Official Policy v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Official accreditation criteria, editorial code of conduct, and revenue share guidelines.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-pitch-850 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-2 bg-pitch-950/60 border-b border-pitch-800 overflow-x-auto text-xs font-mono shrink-0">
          <button
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg font-bold transition-colors shrink-0",
              activeTab === "all"
                ? "bg-[#c3ff00] text-slate-950 shadow"
                : "text-slate-400 hover:text-slate-200 hover:bg-pitch-850"
            )}
          >
            📋 Full Overview
          </button>
          <button
            onClick={() => setActiveTab("code-of-conduct")}
            className={cn(
              "px-3 py-1.5 rounded-lg font-bold transition-colors shrink-0 flex items-center gap-1.5",
              activeTab === "code-of-conduct"
                ? "bg-[#c3ff00] text-slate-950 shadow"
                : "text-slate-400 hover:text-slate-200 hover:bg-pitch-850"
            )}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Code of Conduct</span>
          </button>
          <button
            onClick={() => setActiveTab("originality")}
            className={cn(
              "px-3 py-1.5 rounded-lg font-bold transition-colors shrink-0 flex items-center gap-1.5",
              activeTab === "originality"
                ? "bg-[#c3ff00] text-slate-950 shadow"
                : "text-slate-400 hover:text-slate-200 hover:bg-pitch-850"
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Originality & Sources</span>
          </button>
          <button
            onClick={() => setActiveTab("image-rights")}
            className={cn(
              "px-3 py-1.5 rounded-lg font-bold transition-colors shrink-0 flex items-center gap-1.5",
              activeTab === "image-rights"
                ? "bg-[#c3ff00] text-slate-950 shadow"
                : "text-slate-400 hover:text-slate-200 hover:bg-pitch-850"
            )}
          >
            <Copyright className="w-3.5 h-3.5" />
            <span>Image Rights & IP</span>
          </button>
          <button
            onClick={() => setActiveTab("rewards")}
            className={cn(
              "px-3 py-1.5 rounded-lg font-bold transition-colors shrink-0 flex items-center gap-1.5",
              activeTab === "rewards"
                ? "bg-[#c3ff00] text-slate-950 shadow"
                : "text-slate-400 hover:text-slate-200 hover:bg-pitch-850"
            )}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Rewards & Payouts</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          {/* Section 1: Contributor Qualifications & Code of Conduct */}
          {(activeTab === "all" || activeTab === "code-of-conduct") && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-pitch-800">
                <ShieldCheck className="w-5 h-5 text-[#c3ff00]" />
                <h3 className="text-base font-bold text-slate-100 uppercase font-sans tracking-wide">
                  1. Contributor Code of Conduct & Editorial Guidelines
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="p-4 bg-pitch-950 border border-pitch-800 rounded-xl space-y-2">
                  <h4 className="font-bold text-slate-100 flex items-center gap-2 text-xs uppercase font-mono">
                    <CheckCircle2 className="w-4 h-4 text-[#c3ff00]" />
                    <span>Fact-Checking & Objectivity</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    All articles must be founded on verifiable facts, tactical match events, or confirmed club announcements. Pure rumors must be explicitly flagged with the &ldquo;Rumor&rdquo; tier and sourced with credible journalists.
                  </p>
                </div>

                <div className="p-4 bg-pitch-950 border border-pitch-800 rounded-xl space-y-2">
                  <h4 className="font-bold text-slate-100 flex items-center gap-2 text-xs uppercase font-mono">
                    <CheckCircle2 className="w-4 h-4 text-[#c3ff00]" />
                    <span>Analytical Depth Standards</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Manuscripts must offer actionable tactical breakdowns, statistical metrics (e.g. xG, passing networks, pressing triggers), or unique narrative perspectives rather than simple scoreline recaps.
                  </p>
                </div>

                <div className="p-4 bg-pitch-950 border border-pitch-800 rounded-xl space-y-2">
                  <h4 className="font-bold text-slate-100 flex items-center gap-2 text-xs uppercase font-mono">
                    <CheckCircle2 className="w-4 h-4 text-[#c3ff00]" />
                    <span>Zero Hate Speech & Neutral Tone</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Tribal insults, defamatory attacks against players/managers, discriminatory language, or incitement of violence result in immediate, permanent revocation of contributor credentials.
                  </p>
                </div>

                <div className="p-4 bg-pitch-950 border border-pitch-800 rounded-xl space-y-2">
                  <h4 className="font-bold text-slate-100 flex items-center gap-2 text-xs uppercase font-mono">
                    <CheckCircle2 className="w-4 h-4 text-[#c3ff00]" />
                    <span>Editorial Review Cycle</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Every submitted draft is evaluated through our AI Editorial Gate and Senior Editors before public release. Authors are expected to promptly address requested revisions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Declaration of Original Authorship & Citations */}
          {(activeTab === "all" || activeTab === "originality") && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-pitch-800">
                <FileText className="w-5 h-5 text-[#c3ff00]" />
                <h3 className="text-base font-bold text-slate-100 uppercase font-sans tracking-wide">
                  2. Declaration of Original Authorship & Citations
                </h3>
              </div>

              <div className="p-4 bg-pitch-950 border border-pitch-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-[#c3ff00] font-mono font-bold text-xs">
                  <Scale className="w-4 h-4" />
                  <span>Strict Plagiarism Invariant (0% Tolerated)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  All manuscripts must be authored directly by the accredited writer. Direct copying from other media outlets, uncredited translations of foreign articles, or automated scraper outputs will result in immediate disqualification and frozen balances.
                </p>
                <ul className="space-y-2 pt-1 text-xs text-slate-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#c3ff00] shrink-0 mt-0.5" />
                    <span><strong>Mandatory Source Citations:</strong> At least 1 verified primary source (press conference, official club website, Opta feed, or accredited broadcast) must be attached to the manuscript docket.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#c3ff00] shrink-0 mt-0.5" />
                    <span><strong>Quotes & Interviews:</strong> Quotes from players or managers must clearly specify the interviewer, press conference date, or broadcasting network.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#c3ff00] shrink-0 mt-0.5" />
                    <span><strong>AI Assistance Policy:</strong> AI tools may only be utilized for grammar refinement or research assistance. Pure automated synthetic generation without human editorial analysis will be rejected at the AI Editorial Gate.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Section 3: Intellectual Property & Image Rights Compliance */}
          {(activeTab === "all" || activeTab === "image-rights") && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-pitch-800">
                <Copyright className="w-5 h-5 text-[#c3ff00]" />
                <h3 className="text-base font-bold text-slate-100 uppercase font-sans tracking-wide">
                  3. Intellectual Property & Image Rights Compliance
                </h3>
              </div>

              <div className="p-4 bg-pitch-950 border border-pitch-800 rounded-xl space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed">
                  FUTIQ FOOTBALL strictly upholds international copyright treaties (Berne Convention & DMCA). All media embedded into articles must have verified rights status:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs font-mono">
                  <div className="p-3 bg-pitch-900 border border-pitch-800 rounded-lg">
                    <div className="text-emerald-400 font-bold text-xs uppercase">✅ Permitted Image Sources</div>
                    <ul className="space-y-1 mt-1 text-slate-400 text-[11px] font-sans">
                      <li>• Unsplash / Pexels licensed sports photography</li>
                      <li>• Official Club Media Kits & Press Releases</li>
                      <li>• Author-owned original tactical diagrams & charts</li>
                      <li>• Verified Public Domain imagery</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-pitch-900 border border-pitch-800 rounded-lg">
                    <div className="text-red-400 font-bold text-xs uppercase">❌ Prohibited Image Sources</div>
                    <ul className="space-y-1 mt-1 text-slate-400 text-[11px] font-sans">
                      <li>• Watermarked Getty / Reuters / AP images without license</li>
                      <li>• Screenshots of paywalled broadcasts (Sky, TNT, beIN)</li>
                      <li>• Uncredited social media scrapes (Twitter/IG photos)</li>
                      <li>• Random search engine thumbnail scrapes</li>
                    </ul>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 pt-1">
                  Every image must include an accurate caption and explicit attribution credit (e.g. <em>Photo: Unsplash / John Doe</em>).
                </p>
              </div>
            </div>
          )}

          {/* Section 4: Contributor Rewards, Qualified Views & Payout Rules */}
          {(activeTab === "all" || activeTab === "rewards") && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-pitch-800">
                <Coins className="w-5 h-5 text-[#c3ff00]" />
                <h3 className="text-base font-bold text-slate-100 uppercase font-sans tracking-wide">
                  4. Contributor Rewards, Revenue Share & Payout Policy
                </h3>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-center">
                  <div className="p-3 bg-pitch-950 border border-pitch-800 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase">Min. Payout Threshold</span>
                    <div className="text-lg font-bold text-[#c3ff00]">RM 85.00</div>
                    <span className="text-[9px] text-slate-500">8,500 minor units</span>
                  </div>
                  <div className="p-3 bg-pitch-950 border border-pitch-800 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase">Bank Cooldown</span>
                    <div className="text-lg font-bold text-cyan-400">48 Hours</div>
                    <span className="text-[9px] text-slate-500">Post account edit</span>
                  </div>
                  <div className="p-3 bg-pitch-950 border border-pitch-800 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase">Ledger Precision</span>
                    <div className="text-lg font-bold text-emerald-400">Server-Auth</div>
                    <span className="text-[9px] text-slate-500">Double-entry integer ledger</span>
                  </div>
                </div>

                <div className="p-4 bg-pitch-950 border border-pitch-800 rounded-xl space-y-2 text-xs">
                  <h4 className="font-bold text-slate-100 font-mono text-xs uppercase">
                    Qualified Views & Bot Defense:
                  </h4>
                  <p className="text-slate-400 leading-relaxed">
                    Rewards are calculated solely from <strong>Qualified Organic Views</strong> (readers maintaining real dwell time &gt; 30 seconds, non-bot user agents, verified IP diversity). Automated traffic, click farms, or artificial refresh schemes trigger immediate ledger holds and account ban.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 sm:p-5 bg-pitch-950 border-t border-pitch-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <Link
            href="/editorial-guidelines"
            target="_blank"
            className="text-xs font-mono text-[#c3ff00] hover:underline inline-flex items-center gap-1.5"
          >
            <span>Open Standalone Guidelines Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#c3ff00] hover:bg-[#b0e600] text-slate-950 font-bold uppercase tracking-wider text-xs transition-colors shadow-lg active:scale-[0.99]"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
}
