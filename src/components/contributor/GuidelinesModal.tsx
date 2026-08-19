"use client";

import React from "react";
import {
  X,
  ShieldCheck,
  FileText,
  Copyright,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Scale,
  Check,
} from "lucide-react";
import Link from "next/link";

export type GuidelineSection = "code-of-conduct" | "originality" | "image-rights";

interface GuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: GuidelineSection;
  onAccept?: (section: GuidelineSection) => void;
}

export function GuidelinesModal({
  isOpen,
  onClose,
  section,
  onAccept,
}: GuidelinesModalProps) {
  if (!isOpen) return null;

  const handleAccept = () => {
    if (onAccept) {
      onAccept(section);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] bg-pitch-900 border border-pitch-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Clean Editorial Document Header */}
        <div className="px-6 py-5 bg-pitch-950 border-b border-pitch-800 flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-semibold text-[#c3ff00] uppercase tracking-widest">
                Official Contributor Policy
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-[10px] font-mono text-slate-400">
                v2.0 • Updated August 2026
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 font-sans tracking-tight">
              {section === "code-of-conduct" && "Contributor Code of Conduct & Editorial Guidelines"}
              {section === "originality" && "Declaration of Original Authorship & Citations"}
              {section === "image-rights" && "Intellectual Property & Image Rights Compliance"}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-pitch-850 transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clean Document Reader Body (Clean editorial prose, no nested card soup) */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {/* ========================================================================= */}
          {/* SECTION 1: CODE OF CONDUCT */}
          {/* ========================================================================= */}
          {section === "code-of-conduct" && (
            <div className="space-y-5">
              <p className="text-slate-200 font-sans leading-relaxed border-l-2 border-[#c3ff00] pl-4 italic text-xs sm:text-sm">
                FUTIQ FOOTBALL is dedicated to world-class sports intelligence. As an accredited writer, you agree to maintain factual precision, tactical depth, and professional editorial independence in every manuscript published under your byline.
              </p>

              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2">
                    <span className="text-[#c3ff00] font-mono text-xs font-bold">1.0</span>
                    <span>Factual Accuracy & Dual-Source Verification</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed pl-5">
                    All reports, statistics, and tactical statements must be grounded in verified reality. Transfer rumors must be clearly labeled and cite tier-1 correspondents. Performance metrics (xG, passing networks, pressing data) must align with canonical provider feeds (Opta, StatsBomb, API-Football).
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2">
                    <span className="text-[#c3ff00] font-mono text-xs font-bold">2.0</span>
                    <span>Tactical Analytical Depth</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed pl-5">
                    Manuscripts must offer genuine tactical insights (in-possession structure, rest defense, pressing triggers, transitional rotations) rather than simple superficial match recaps or play-by-play summaries.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2">
                    <span className="text-[#c3ff00] font-mono text-xs font-bold">3.0</span>
                    <span>Neutral Tone & Zero Harassment</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed pl-5">
                    Constructive criticism of tactical systems and performances is encouraged. However, abusive remarks, personal defamation, tribal hatred, and discriminatory language result in immediate permanent expulsion from the contributor network.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2">
                    <span className="text-[#c3ff00] font-mono text-xs font-bold">4.0</span>
                    <span>Editorial Review & Revisions</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed pl-5">
                    Every manuscript is evaluated by Senior Editors and the AI Editorial Gate prior to publication. Authors agree to promptly address requested revisions or erratum corrections.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 2: ORIGINALITY & CITATIONS */}
          {/* ========================================================================= */}
          {section === "originality" && (
            <div className="space-y-5">
              <p className="text-slate-200 font-sans leading-relaxed border-l-2 border-[#c3ff00] pl-4 italic text-xs sm:text-sm">
                FUTIQ enforces a strict 0% plagiarism policy. By submitting articles, you certify under penalty of forfeiture that all manuscripts are 100% your own original intellectual analysis, backed by verifiable primary sources.
              </p>

              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2">
                    <span className="text-[#c3ff00] font-mono text-xs font-bold">1.0</span>
                    <span>Original Authorship & Plagiarism Prohibition</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed pl-5">
                    Copy-pasting from other sports outlets, unauthorized translations of foreign articles, or automated scraper outputs are strictly forbidden and will result in immediate disqualification and account ban.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2">
                    <span className="text-[#c3ff00] font-mono text-xs font-bold">2.0</span>
                    <span>Mandatory Primary Citations</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed pl-5">
                    Every article draft must include at least 1 verified primary source URL (official club statement, press conference recording, or accredited interview transcript) logged in the editor&apos;s source manager.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2">
                    <span className="text-[#c3ff00] font-mono text-xs font-bold">3.0</span>
                    <span>Artificial Intelligence (AI) Policy</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed pl-5">
                    AI tools are permitted strictly for spelling and grammar assistance. Generating whole synthetic articles without human research will be flagged and rejected by our automated AI Editorial Gate.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 3: IMAGE RIGHTS & IP */}
          {/* ========================================================================= */}
          {section === "image-rights" && (
            <div className="space-y-5">
              <p className="text-slate-200 font-sans leading-relaxed border-l-2 border-[#c3ff00] pl-4 italic text-xs sm:text-sm">
                FUTIQ strictly adheres to international copyright treaties (DMCA & Berne Convention). All visual assets, match photos, and diagrams embedded in manuscripts must satisfy authorized licensing and attribution criteria.
              </p>

              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2">
                    <span className="text-[#c3ff00] font-mono text-xs font-bold">1.0</span>
                    <span>Authorized Media Assets</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed pl-5">
                    You may embed open editorial stock photography (Unsplash, Pexels, Wikimedia Commons CC-BY), official club press kits, author-owned tactical diagrams, and official API provider badges.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2">
                    <span className="text-[#c3ff00] font-mono text-xs font-bold">2.0</span>
                    <span>Prohibited Media & Infringing Assets</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed pl-5">
                    Watermarked agency photos (Getty/Reuters/AP), TV broadcast screenshots with network logos (Sky/beIN), and uncredited social media photos are strictly prohibited.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2">
                    <span className="text-[#c3ff00] font-mono text-xs font-bold">3.0</span>
                    <span>Mandatory Caption & Photo Credit</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed pl-5">
                    Every image must include an accurate descriptive caption and explicit attribution credit (e.g. <em>Photo: Unsplash / John Doe</em>).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Clean Sticky Footer */}
        <div className="px-6 py-4 bg-pitch-950 border-t border-pitch-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <Link
            href="/editorial-guidelines"
            target="_blank"
            className="text-xs font-mono text-slate-400 hover:text-[#c3ff00] hover:underline inline-flex items-center gap-1.5"
          >
            <span>Open Handbook Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleAccept}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#c3ff00] hover:bg-[#b0e600] text-slate-950 font-bold uppercase tracking-wider text-xs transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
            <span>I Have Read & Accept This Policy</span>
          </button>
        </div>
      </div>
    </div>
  );
}
