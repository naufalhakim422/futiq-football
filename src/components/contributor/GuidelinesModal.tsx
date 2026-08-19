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
  AlertTriangle,
  FileCode,
  ShieldAlert,
  Info,
  Check,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-pitch-900 border border-pitch-750 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-pitch-950 border-b border-pitch-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-pitch-900 border border-[#c3ff00]/40 flex items-center justify-center text-[#c3ff00] shrink-0">
              {section === "code-of-conduct" && <ShieldCheck className="w-6 h-6" />}
              {section === "originality" && <FileText className="w-6 h-6" />}
              {section === "image-rights" && <Copyright className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100 font-sans leading-tight">
                  {section === "code-of-conduct" && "Contributor Code of Conduct & Editorial Guidelines"}
                  {section === "originality" && "Declaration of Original Authorship & Citations Policy"}
                  {section === "image-rights" && "Intellectual Property & Image Rights Compliance"}
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                FUTIQ Official Editorial Charter • Mandatory Contributor Agreement v2.0
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-pitch-850 transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Single Focused Document */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-7 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans divide-y divide-pitch-800/80">
          {/* ========================================================================= */}
          {/* SECTION 1: CODE OF CONDUCT (DETAILED, IN-DEPTH CHARTER) */}
          {/* ========================================================================= */}
          {section === "code-of-conduct" && (
            <div className="space-y-6">
              {/* Executive Preamble */}
              <div className="p-4 bg-pitch-950 border border-pitch-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-[#c3ff00] font-mono font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Preamble & Journalistic Charter</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  FUTIQ FOOTBALL is an international sports intelligence and tactical media platform. As an accredited contributor, you agree to adhere to the core principles of truthfulness, tactical rigor, editorial independence, and professional ethics. Every manuscript bearing your byline directly impacts the platform&apos;s credibility and global standing.
                </p>
              </div>

              {/* Clause 1: Truth & Fact-Checking */}
              <div className="space-y-2.5">
                <h4 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-pitch-800 text-[#c3ff00] font-mono text-xs flex items-center justify-center font-bold">1</span>
                  <span>Factual Precision & Mandatory Dual-Source Verification</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  All match reports, transfer negotiations, player valuations, and tactical statements must be anchored in verified reality. Writers are strictly prohibited from fabricating quotes, sensationalizing injuries, or publishing unconfirmed rumors as established facts.
                </p>
                <div className="p-3.5 bg-pitch-950/70 border border-pitch-800 rounded-lg space-y-1.5 text-xs text-slate-300">
                  <div className="font-bold text-[#c3ff00] font-mono text-[11px] uppercase">Mandatory Reporting Rules:</div>
                  <ul className="space-y-1 list-disc list-inside text-slate-400 text-[11px]">
                    <li><strong>Transfer Rumors:</strong> Must be explicitly categorized as &ldquo;Rumor&rdquo; or &ldquo;Transfer Center&rdquo; and cite credible tier-1 correspondents (e.g. Ornstein, Romano, club correspondents).</li>
                    <li><strong>Match Statistics:</strong> Expected Goals (xG), progressive carries, and pass completion percentages must correspond to official provider feeds (Opta, StatsBomb, API-Football).</li>
                    <li><strong>Direct Quotes:</strong> Quotations from managers, players, or sporting directors must state the exact venue, press conference date, or broadcasting interview source.</li>
                  </ul>
                </div>
              </div>

              {/* Clause 2: Analytical Depth */}
              <div className="space-y-2.5 pt-4">
                <h4 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-pitch-800 text-[#c3ff00] font-mono text-xs flex items-center justify-center font-bold">2</span>
                  <span>Tactical Depth & Deconstruction Standards</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  FUTIQ does not publish superficial match recaps or automated score summaries. Articles must provide value-additive analytical insight:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-pitch-950 border border-emerald-800/40 rounded-xl space-y-1">
                    <span className="font-bold text-emerald-400 font-mono text-[11px] uppercase">✅ What We Expect:</span>
                    <ul className="space-y-1 text-slate-300 text-[11px]">
                      <li>• Breakdown of in-possession vs out-of-possession structures</li>
                      <li>• Pressing triggers, counter-press efficiency, and rest defense</li>
                      <li>• Inverted fullback dynamics and half-space overload analysis</li>
                      <li>• Player heatmaps and positional network evolution</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-pitch-950 border border-red-800/40 rounded-xl space-y-1">
                    <span className="font-bold text-red-400 font-mono text-[11px] uppercase">❌ What Is Rejected:</span>
                    <ul className="space-y-1 text-slate-300 text-[11px]">
                      <li>• Pure minute-by-minute play-by-play transcription</li>
                      <li>• Clickbait titles with zero tactical substantiation</li>
                      <li>• Emotional ranting without footballing evidence</li>
                      <li>• Generalized gossip without tactical relevance</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Clause 3: Ethics & Objectivity */}
              <div className="space-y-2.5 pt-4">
                <h4 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-pitch-800 text-[#c3ff00] font-mono text-xs flex items-center justify-center font-bold">3</span>
                  <span>Neutral Tone, Anti-Defamation & Zero Toxicity</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  While passionate writing is embraced, tribalism, vulgarity, and personal animosity have no place on the platform. Contributors must maintain professional decorum:
                </p>
                <ul className="space-y-1.5 list-disc list-inside text-slate-400 text-xs">
                  <li><strong>Zero Tolerance for Abuse:</strong> Personal insults targeting players, match officials, or supporters based on nationality, race, religion, sexual orientation, or physical appearance will result in immediate permanent expulsion.</li>
                  <li><strong>Referee Decisions:</strong> Critique officiating objectively using IFAB Laws of the Game rather than alleging corruption or bias without official judicial proof.</li>
                  <li><strong>Conflict of Interest:</strong> Contributors must disclose any paid partnerships, club employment, or betting sponsorships that could compromise objectivity.</li>
                </ul>
              </div>

              {/* Clause 4: Editorial Gate & Disciplinary Ladder */}
              <div className="space-y-2.5 pt-4">
                <h4 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-pitch-800 text-[#c3ff00] font-mono text-xs flex items-center justify-center font-bold">4</span>
                  <span>Editorial Review & Progressive Disciplinary Ladder</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  All manuscripts pass through automated AI quality screening and human editorial review before being published on news feeds. Failure to comply with editorial standards triggers progressive action:
                </p>
                <div className="p-3.5 bg-pitch-950 border border-pitch-800 rounded-xl space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-amber-400 font-bold">Stage 1 (Editorial Revision):</span>
                    <span>Manuscript returned with specific revision memorandum</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-orange-400 font-bold">Stage 2 (Formal Warning):</span>
                    <span>Accreditation tier downgraded; mandatory peer-review</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-red-400 font-bold">Stage 3 (Permanent Revocation):</span>
                    <span>Byline revoked, article retracted, held balance forfeited</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 2: ORIGINALITY & CITATIONS (DETAILED, IN-DEPTH CHARTER) */}
          {/* ========================================================================= */}
          {section === "originality" && (
            <div className="space-y-6">
              {/* Executive Preamble */}
              <div className="p-4 bg-pitch-950 border border-pitch-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-[#c3ff00] font-mono font-bold text-xs uppercase tracking-wider">
                  <FileText className="w-4 h-4" />
                  <span>Declaration of Original Authorship & Research Integrity</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  FUTIQ FOOTBALL enforces an uncompromised standard of intellectual honesty. By submitting an article, you certify under penalty of account forfeiture that the manuscript is 100% your own original intellectual creation, fully backed by transparent primary citations.
                </p>
              </div>

              {/* Clause 1: Absolute Plagiarism Prohibition */}
              <div className="space-y-2.5">
                <h4 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-pitch-800 text-[#c3ff00] font-mono text-xs flex items-center justify-center font-bold">1</span>
                  <span>Zero-Tolerance Plagiarism & Scraping Invariant (0.00%)</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Plagiarism in any form is a severe breach of journalistic ethics. Our editorial ingestion pipeline conducts multi-layered syntactic and semantic fingerprint checks on every submission:
                </p>
                <div className="p-3.5 bg-pitch-950/70 border border-pitch-800 rounded-lg space-y-1.5 text-xs text-slate-300">
                  <div className="font-bold text-red-400 font-mono text-[11px] uppercase">Strictly Prohibited Practices:</div>
                  <ul className="space-y-1 list-disc list-inside text-slate-400 text-[11px]">
                    <li><strong>Direct Copy-Pasting:</strong> Lifting sentences or paragraphs from other outlets (e.g. The Athletic, BBC, Sky Sports, Marca) without attribution.</li>
                    <li><strong>Mosaic / Patchwriting:</strong> Paraphrasing text from other articles by merely substituting synonyms while preserving the exact sentence structure.</li>
                    <li><strong>Unauthorized Foreign Translations:</strong> Translating foreign sports articles (e.g. Spanish, French, Italian) and publishing them under your byline without explicit syndication agreements.</li>
                    <li><strong>Automated Content Scraping:</strong> Using bots to harvest RSS feeds or news bulletins for re-publication.</li>
                  </ul>
                </div>
              </div>

              {/* Clause 2: Mandatory Citations */}
              <div className="space-y-2.5 pt-4">
                <h4 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-pitch-800 text-[#c3ff00] font-mono text-xs flex items-center justify-center font-bold">2</span>
                  <span>Mandatory Primary Source Citations & References</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every claim, statistics cluster, or breaking development must be anchored by verifiable original source links. The manuscript editor includes a dedicated citation docket:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 bg-pitch-950 border border-pitch-800 rounded-xl space-y-1">
                    <span className="text-slate-200 font-bold text-[11px]">Minimum Citation Threshold:</span>
                    <p className="text-slate-400 text-[11px] font-sans">
                      A minimum of <strong>1 verified primary source URL</strong> is required before the &ldquo;Submit for Review&rdquo; button unlocks.
                    </p>
                  </div>
                  <div className="p-3 bg-pitch-950 border border-pitch-800 rounded-xl space-y-1">
                    <span className="text-slate-200 font-bold text-[11px]">Accepted Source Categories:</span>
                    <p className="text-slate-400 text-[11px] font-sans">
                      Official club statements, Opta/StatsBomb feeds, accredited press conferences, broadcast interviews (Sky/BBC/beIN).
                    </p>
                  </div>
                </div>
              </div>

              {/* Clause 3: Generative AI Boundaries */}
              <div className="space-y-2.5 pt-4">
                <h4 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-pitch-800 text-[#c3ff00] font-mono text-xs flex items-center justify-center font-bold">3</span>
                  <span>Artificial Intelligence (AI) Usage Boundaries</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  FUTIQ FOOTBALL champions authentic human analysis. While AI tools may assist workflow, pure automated content generation is forbidden:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-pitch-950 border border-emerald-800/40 rounded-xl space-y-1">
                    <span className="font-bold text-emerald-400 font-mono text-[11px] uppercase">✅ Permitted AI Assistance:</span>
                    <ul className="space-y-1 text-slate-300 text-[11px]">
                      <li>• Proofreading and grammatical corrections</li>
                      <li>• Formatting tactical data tables & bullet points</li>
                      <li>• Research summarization of official match records</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-pitch-950 border border-red-800/40 rounded-xl space-y-1">
                    <span className="font-bold text-red-400 font-mono text-[11px] uppercase">❌ Prohibited AI Usage:</span>
                    <ul className="space-y-1 text-slate-300 text-[11px]">
                      <li>• Generating whole articles from a single prompt</li>
                      <li>• Fabricated stats or hallucinated tactical narratives</li>
                      <li>• Publishing synthetic AI &ldquo;fluff&rdquo; without original analysis</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Clause 4: Financial Ledger Penalties */}
              <div className="space-y-2.5 pt-4">
                <h4 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-pitch-800 text-[#c3ff00] font-mono text-xs flex items-center justify-center font-bold">4</span>
                  <span>Plagiarism Consequences & Financial Ledger Sanctions</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Any article discovered to contain plagiarized text or unverified synthetic fabrications will be immediately retracted. The author&apos;s pending wallet balance for the article will be forfeited, and repeated infractions result in permanent blacklisting from the FUTIQ platform.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 3: IMAGE RIGHTS & IP (DETAILED, IN-DEPTH CHARTER) */}
          {/* ========================================================================= */}
          {section === "image-rights" && (
            <div className="space-y-6">
              {/* Executive Preamble */}
              <div className="p-4 bg-pitch-950 border border-pitch-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-[#c3ff00] font-mono font-bold text-xs uppercase tracking-wider">
                  <Copyright className="w-4 h-4" />
                  <span>Intellectual Property, Licensing & Media Rights Compliance</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  FUTIQ FOOTBALL adheres strictly to international copyright treaties, including the Berne Convention and the Digital Millennium Copyright Act (DMCA). All photography, visual assets, diagrams, and multimedia embedded in articles must satisfy verified licensing and attribution protocols.
                </p>
              </div>

              {/* Clause 1: Permitted Media */}
              <div className="space-y-2.5">
                <h4 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-pitch-800 text-[#c3ff00] font-mono text-xs flex items-center justify-center font-bold">1</span>
                  <span>Authorized Media Asset Classes</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Contributors may only embed imagery that falls squarely within authorized commercial editorial categories:
                </p>
                <div className="p-3.5 bg-pitch-950 border border-pitch-800 rounded-xl space-y-2 text-xs">
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>1. Licensed Open Editorial Repositories:</strong> High-resolution sports photography sourced from Unsplash, Pexels, or Wikimedia Commons (CC-BY / Public Domain) with proper attribution.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>2. Official Club Press Kits:</strong> Official media room releases distributed by clubs or tournament organizers for editorial press reporting.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>3. Original Author Photography & Diagrams:</strong> Tactical pitch diagrams, passing network charts, or original match photographs taken directly by the contributor.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>4. Canonical Platform API Media:</strong> Official team crests, competition logos, and player portraits provided directly by our API-Sports media integration.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Clause 2: Prohibited Media */}
              <div className="space-y-2.5 pt-4">
                <h4 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-pitch-800 text-[#c3ff00] font-mono text-xs flex items-center justify-center font-bold">2</span>
                  <span>Strictly Prohibited Media & Infringing Assets</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Using infringing assets exposes both the contributor and the publication to legal liability. The following are blacklisted across all submissions:
                </p>
                <div className="p-3.5 bg-pitch-950 border border-red-800/40 rounded-xl space-y-2 text-xs">
                  <ul className="space-y-1.5 list-disc list-inside text-slate-300 text-[11px]">
                    <li><strong>Watermarked Agency Photography:</strong> Images displaying Getty Images, Reuters, AP, AFP, or Shutterstock watermarks without an active license.</li>
                    <li><strong>Broadcast TV Screengrabs:</strong> Unedited freeze-frames captured from live commercial broadcasts (Sky Sports, TNT Sports, beIN SPORTS, DAZN, ESPN) with network bugs/logos.</li>
                    <li><strong>Uncredited Social Media Scraping:</strong> Copying photos directly from player/club Instagram, Twitter, or TikTok accounts without explicit written permission from the copyright owner.</li>
                    <li><strong>Google / Bing Image Search Scrapes:</strong> Inserting random search engine thumbnails without verifying rights ownership.</li>
                  </ul>
                </div>
              </div>

              {/* Clause 3: Attribution Standards */}
              <div className="space-y-2.5 pt-4">
                <h4 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-pitch-800 text-[#c3ff00] font-mono text-xs flex items-center justify-center font-bold">3</span>
                  <span>Mandatory Photo Caption & Attribution Standards</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every image must be accompanied by two mandatory metadata fields in the manuscript editor:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 bg-pitch-950 border border-pitch-800 rounded-xl space-y-1">
                    <span className="text-[#c3ff00] font-bold text-[11px]">1. Descriptive Caption:</span>
                    <p className="text-slate-400 text-[11px] font-sans">
                      Clear description of the match action, player, or tactical scenario (e.g. <em>Arsenal rest defense during transition vs Man City</em>).
                    </p>
                  </div>
                  <div className="p-3 bg-pitch-950 border border-pitch-800 rounded-xl space-y-1">
                    <span className="text-[#c3ff00] font-bold text-[11px]">2. Source Attribution Credit:</span>
                    <p className="text-slate-400 text-[11px] font-sans">
                      Explicit credit to the photographer/library (e.g. <em>Photo: Unsplash / Marcus Thorne / Official Press Kit</em>).
                    </p>
                  </div>
                </div>
              </div>

              {/* Clause 4: DMCA & Contributor Indemnification */}
              <div className="space-y-2.5 pt-4">
                <h4 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-pitch-800 text-[#c3ff00] font-mono text-xs flex items-center justify-center font-bold">4</span>
                  <span>DMCA Takedown Protocol & Author Indemnification</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  In the event of a copyright takedown notice under the DMCA, the infringing material will be removed immediately. If an author repeatedly submits unauthorized copyrighted assets, FUTIQ reserves the right to terminate accreditation and seek indemnification for statutory damages resulting from willful copyright infringement.
                </p>
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
            <span>Open Complete Handbook Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleAccept}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#c3ff00] hover:bg-[#b0e600] text-slate-950 font-bold uppercase tracking-wider text-xs transition-colors shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
            <span>I Have Read & Accept This Policy</span>
          </button>
        </div>
      </div>
    </div>
  );
}
