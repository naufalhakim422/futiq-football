"use client";

import React from "react";
import {
  X,
  ShieldCheck,
  FileText,
  Copyright,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  BookOpen,
  Scale,
  Sparkles,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] bg-pitch-900 border border-pitch-750 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-pitch-950 border-b border-pitch-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pitch-900 border border-[#c3ff00]/40 flex items-center justify-center text-[#c3ff00]">
              {section === "code-of-conduct" && <ShieldCheck className="w-5 h-5" />}
              {section === "originality" && <FileText className="w-5 h-5" />}
              {section === "image-rights" && <Copyright className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100 font-sans">
                  {section === "code-of-conduct" && "Contributor Code of Conduct & Guidelines"}
                  {section === "originality" && "Declaration of Original Authorship & Citations"}
                  {section === "image-rights" && "Intellectual Property & Image Rights Compliance"}
                </h2>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                FUTIQ Official Contributor Terms • Mandatory Accreditation Requirement
              </span>
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

        {/* Scrollable Single Focused Document */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          {/* SECTION 1: CODE OF CONDUCT ONLY */}
          {section === "code-of-conduct" && (
            <div className="space-y-4">
              <div className="p-3.5 bg-pitch-950 border border-pitch-800 rounded-xl text-xs space-y-1">
                <span className="font-mono font-bold text-[#c3ff00] uppercase text-[11px]">
                  📌 Overview:
                </span>
                <p className="text-slate-300">
                  Every contributor represents the editorial integrity of FUTIQ FOOTBALL. All published articles must maintain strict professional objectivity, tactical depth, and zero harassment.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-pitch-950 border border-pitch-800 rounded-xl space-y-1.5">
                  <h4 className="font-bold text-slate-100 flex items-center gap-2 text-xs uppercase font-mono">
                    <CheckCircle2 className="w-4 h-4 text-[#c3ff00]" />
                    <span>1. Fact-Checking & Factual Precision</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    All reports, statistics, and tactical statements must be grounded in verified match events, official announcements, or reputable sports journalism outlets. Unverified gossip or fabricated quotes will result in instant rejection.
                  </p>
                </div>

                <div className="p-4 bg-pitch-950 border border-pitch-800 rounded-xl space-y-1.5">
                  <h4 className="font-bold text-slate-100 flex items-center gap-2 text-xs uppercase font-mono">
                    <CheckCircle2 className="w-4 h-4 text-[#c3ff00]" />
                    <span>2. Tactical Analytical Depth</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    FUTIQ readers expect insightful deconstructions (pressing schemes, xG delta, passing networks, positional rotations) rather than simple superficial scoreline summaries.
                  </p>
                </div>

                <div className="p-4 bg-pitch-950 border border-pitch-800 rounded-xl space-y-1.5">
                  <h4 className="font-bold text-slate-100 flex items-center gap-2 text-xs uppercase font-mono">
                    <CheckCircle2 className="w-4 h-4 text-[#c3ff00]" />
                    <span>3. Respectful & Neutral Editorial Tone</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Constructive criticism of tactical systems, manager setups, and player performance is encouraged. However, abusive remarks, personal defamation, tribal hatred, and discrimination are strictly prohibited.
                  </p>
                </div>

                <div className="p-4 bg-pitch-950 border border-pitch-800 rounded-xl space-y-1.5">
                  <h4 className="font-bold text-slate-100 flex items-center gap-2 text-xs uppercase font-mono">
                    <CheckCircle2 className="w-4 h-4 text-[#c3ff00]" />
                    <span>4. Editorial Review & Revisions</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Submitted manuscripts pass through Senior Editors and our automated AI Editorial Gate. Contributors agree to cooperate with editorial revision notes when requested.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: ORIGINALITY & CITATIONS ONLY */}
          {section === "originality" && (
            <div className="space-y-4">
              <div className="p-3.5 bg-pitch-950 border border-pitch-800 rounded-xl text-xs space-y-1">
                <span className="font-mono font-bold text-[#c3ff00] uppercase text-[11px]">
                  📌 Overview:
                </span>
                <p className="text-slate-300">
                  FUTIQ FOOTBALL maintains a zero-tolerance policy against plagiarism and AI content generation without human analysis.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-pitch-950 border border-pitch-800 rounded-xl space-y-1.5">
                  <h4 className="font-bold text-slate-100 flex items-center gap-2 text-xs uppercase font-mono">
                    <CheckCircle2 className="w-4 h-4 text-[#c3ff00]" />
                    <span>1. 100% Original Authorship</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    You affirm that every article submitted under your byline is your own original creative and analytical work. Copy-pasting, unauthorized translations, or scraping other sports publications leads to immediate account ban.
                  </p>
                </div>

                <div className="p-4 bg-pitch-950 border border-pitch-800 rounded-xl space-y-1.5">
                  <h4 className="font-bold text-slate-100 flex items-center gap-2 text-xs uppercase font-mono">
                    <CheckCircle2 className="w-4 h-4 text-[#c3ff00]" />
                    <span>2. Mandatory Primary Source Citations</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Every article draft must include at least 1 verified primary source URL (e.g. official press conference, Opta/FotMob statistical log, club press release, or accredited broadcast interview) in the editor&apos;s source manager.
                  </p>
                </div>

                <div className="p-4 bg-pitch-950 border border-pitch-800 rounded-xl space-y-1.5">
                  <h4 className="font-bold text-slate-100 flex items-center gap-2 text-xs uppercase font-mono">
                    <CheckCircle2 className="w-4 h-4 text-[#c3ff00]" />
                    <span>3. AI Tool Usage Policy</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    AI may only be used as a research assistant or grammar checker. Pure synthetic AI generation without human editorial expertise will be flagged and rejected by the AI Editorial Gate.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: IMAGE RIGHTS & IP ONLY */}
          {section === "image-rights" && (
            <div className="space-y-4">
              <div className="p-3.5 bg-pitch-950 border border-pitch-800 rounded-xl text-xs space-y-1">
                <span className="font-mono font-bold text-[#c3ff00] uppercase text-[11px]">
                  📌 Overview:
                </span>
                <p className="text-slate-300">
                  To protect writers and the platform against legal copyright infringements, all images embedded into articles must adhere strictly to verified media licensing.
                </p>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-pitch-950 border border-emerald-800/50 rounded-xl space-y-1">
                    <span className="font-bold text-emerald-400 uppercase font-mono text-[11px]">
                      ✅ Permitted Image Assets:
                    </span>
                    <ul className="space-y-1 text-slate-300 text-[11px]">
                      <li>• Unsplash / Pexels licensed photography</li>
                      <li>• Official Club Press Kits & Releases</li>
                      <li>• Original diagrams / charts created by you</li>
                      <li>• Public domain sports imagery</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-pitch-950 border border-red-800/50 rounded-xl space-y-1">
                    <span className="font-bold text-red-400 uppercase font-mono text-[11px]">
                      ❌ Strictly Prohibited:
                    </span>
                    <ul className="space-y-1 text-slate-300 text-[11px]">
                      <li>• Watermarked Getty / Reuters / AP photos</li>
                      <li>• TV broadcast screen captures (Sky, beIN)</li>
                      <li>• Uncredited social media photos</li>
                      <li>• Google / Bing image search scraping</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-pitch-950 border border-pitch-800 rounded-xl space-y-1.5">
                  <h4 className="font-bold text-slate-100 flex items-center gap-2 text-xs uppercase font-mono">
                    <CheckCircle2 className="w-4 h-4 text-[#c3ff00]" />
                    <span>Mandatory Caption & Photo Credit</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Every image must include an accurate caption describing the moment and a clear attribution credit (e.g. <em>Photo: Unsplash / John Doe</em>).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Single Action Button */}
        <div className="p-4 sm:p-5 bg-pitch-950 border-t border-pitch-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <Link
            href="/editorial-guidelines"
            target="_blank"
            className="text-xs font-mono text-slate-400 hover:text-[#c3ff00] hover:underline inline-flex items-center gap-1.5"
          >
            <span>Read Complete Handbook Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleAccept}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#c3ff00] hover:bg-[#b0e600] text-slate-950 font-bold uppercase tracking-wider text-xs transition-colors shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            <span>I Have Read & Accept This Policy</span>
          </button>
        </div>
      </div>
    </div>
  );
}
