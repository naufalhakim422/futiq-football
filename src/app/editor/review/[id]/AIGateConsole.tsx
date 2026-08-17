"use client";

import React, { useState } from "react";
import {
  Cpu,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Lock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface AIGateConsoleProps {
  articleId: string;
  gateStatus: string;
  initialGateRun?: any;
  userRoles: string[];
}

export function AIGateConsole({
  articleId,
  gateStatus: initialStatus,
  initialGateRun,
  userRoles,
}: AIGateConsoleProps) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [gateRun, setGateRun] = useState<any>(initialGateRun);
  const [gateStatus, setGateStatus] = useState<string>(initialStatus || "NOT_RUN");
  const [showOverride, setShowOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");
  const [overrideDecision, setOverrideDecision] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [overrideLoading, setOverrideLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canOverride =
    userRoles.includes("SUPER_ADMIN") ||
    userRoles.includes("SENIOR_EDITOR") ||
    userRoles.includes("EDITOR_IN_CHIEF");

  const handleRunGate = async () => {
    setRunning(true);
    setMessage(null);
    setError(null);
    setGateStatus("CHECKING");

    try {
      const res = await fetch(`/api/editorial/gate/${articleId}/run`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to execute AI Editorial Gate.");
      }

      setGateRun(data.data);
      setGateStatus(data.data.status);
      setMessage("AI Editorial Gate analysis finished successfully.");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred while running AI gate.");
      setGateStatus(initialStatus);
    } finally {
      setRunning(false);
    }
  };

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReason || overrideReason.trim().length < 10) {
      setError("Override justification must be at least 10 characters.");
      return;
    }

    setOverrideLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch(`/api/editorial/gate/${articleId}/override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: overrideDecision,
          reason: overrideReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to execute override.");
      }

      setMessage(`Administrative override logged successfully: Decision ${overrideDecision}.`);
      setGateStatus(overrideDecision === "APPROVE" ? "PASSED" : "REJECTED");
      setShowOverride(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Override failed.");
    } finally {
      setOverrideLoading(false);
    }
  };

  const scores = gateRun?.scores || {
    overallScore: gateRun?.overallScore ? Number(gateRun.overallScore) : 0,
    originalityScore: gateRun?.originalityScore ? Number(gateRun.originalityScore) : 0,
    factScore: gateRun?.factScore ? Number(gateRun.factScore) : 0,
    sourceScore: gateRun?.sourceScore ? Number(gateRun.sourceScore) : 0,
    qualityScore: gateRun?.qualityScore ? Number(gateRun.qualityScore) : 0,
    clickbaitScore: gateRun?.clickbaitScore ? Number(gateRun.clickbaitScore) : 0,
  };

  const findings = gateRun?.findings || [];

  return (
    <div className="bg-pitch-900 border border-pitch-800 p-5 sm:p-6 space-y-5 shadow-xl font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-pitch-800">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-brand-green shrink-0" />
          <div>
            <h3 className="font-bold text-slate-100 uppercase tracking-wider text-xs font-sans">
              AI Editorial Gate & Copyright Protection
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">
              Provider: {gateRun?.provider || "MOCK"} • Model: {gateRun?.model || "editorial-mock-v1"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border",
              gateStatus === "PASSED" && "bg-brand-green/15 text-brand-green border-brand-green/30",
              gateStatus === "REVIEW" && "bg-brand-gold/15 text-brand-gold border-brand-gold/30",
              gateStatus === "REJECTED" && "bg-brand-red/15 text-brand-red border-brand-red/30",
              gateStatus === "CHECKING" && "bg-blue-500/15 text-blue-400 border-blue-500/30",
              gateStatus === "NOT_RUN" && "bg-pitch-950 text-slate-400 border-pitch-800"
            )}
          >
            STATUS: {gateStatus}
          </span>

          <button
            type="button"
            onClick={handleRunGate}
            disabled={running}
            className="p-1.5 bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 text-slate-200 hover:text-brand-green transition-colors disabled:opacity-50"
            title="Execute / Re-run AI Gate"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", running && "animate-spin text-brand-green")} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-brand-red/10 border border-brand-red/30 text-brand-red flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {message && (
        <div className="p-3 bg-brand-green/10 border border-brand-green/30 text-brand-green flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {gateStatus === "NOT_RUN" && (
        <div className="p-4 bg-pitch-950 border border-pitch-800 text-center space-y-3">
          <p className="text-slate-400">
            This article has not undergone automated AI Editorial Gate verification.
          </p>
          <button
            type="button"
            onClick={handleRunGate}
            disabled={running}
            className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 bg-brand-green hover:bg-brand-green-hover disabled:opacity-50 transition-all shadow-md active:scale-[0.99]"
          >
            {running ? "Analyzing Manuscript..." : "Run AI Editorial Gate Now"}
          </button>
        </div>
      )}

      {gateStatus !== "NOT_RUN" && (
        <div className="space-y-4">
          {/* Composite Score Meter */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-3 bg-pitch-950 border border-pitch-800 space-y-0.5">
              <span className="text-[9px] text-slate-500 uppercase">Overall Quality</span>
              <div className="text-lg font-bold text-slate-100">{scores.overallScore.toFixed(1)}%</div>
            </div>
            <div className="p-3 bg-pitch-950 border border-pitch-800 space-y-0.5">
              <span className="text-[9px] text-slate-500 uppercase">Originality</span>
              <div className="text-lg font-bold text-brand-green">{scores.originalityScore.toFixed(1)}%</div>
            </div>
            <div className="p-3 bg-pitch-950 border border-pitch-800 space-y-0.5">
              <span className="text-[9px] text-slate-500 uppercase">Fact Accuracy</span>
              <div className="text-lg font-bold text-slate-200">{scores.factScore.toFixed(1)}%</div>
            </div>
            <div className="p-3 bg-pitch-950 border border-pitch-800 space-y-0.5">
              <span className="text-[9px] text-slate-500 uppercase">Source Integrity</span>
              <div className="text-lg font-bold text-slate-200">{scores.sourceScore.toFixed(1)}%</div>
            </div>
            <div className="p-3 bg-pitch-950 border border-pitch-800 space-y-0.5">
              <span className="text-[9px] text-slate-500 uppercase">Quality Index</span>
              <div className="text-lg font-bold text-slate-200">{scores.qualityScore.toFixed(1)}%</div>
            </div>
            <div className="p-3 bg-pitch-950 border border-pitch-800 space-y-0.5">
              <span className="text-[9px] text-slate-500 uppercase">Clickbait Score</span>
              <div className="text-lg font-bold text-slate-200">{scores.clickbaitScore.toFixed(1)}%</div>
            </div>
          </div>

          {/* Gate Summary Statement */}
          {gateRun?.summary && (
            <div className="p-3 bg-pitch-950 border-l-2 border-brand-green border-pitch-800 text-[11px] text-slate-300 font-sans leading-relaxed">
              {gateRun.summary}
            </div>
          )}

          {/* Structured Findings List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-pitch-800">
              <span className="font-bold text-slate-300 uppercase text-[10px]">
                Gate Findings & Evidence ({findings.length})
              </span>
              <span className="text-[9px] text-slate-500">Atomic Analysis Log</span>
            </div>

            {findings.length === 0 ? (
              <div className="p-3 bg-pitch-950 border border-pitch-800 text-slate-400 text-center text-[11px]">
                Zero compliance or quality issues flagged. Manuscript passed all gate standards.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {findings.map((f: any, idx: number) => (
                  <div
                    key={f.id || idx}
                    className={cn(
                      "p-3 bg-pitch-950 border space-y-1.5 text-[11px]",
                      f.severity === "CRITICAL" && "border-brand-red/40 bg-brand-red/5",
                      f.severity === "HIGH" && "border-brand-red/30",
                      f.severity === "MEDIUM" && "border-brand-gold/30",
                      f.severity === "LOW" && "border-pitch-800",
                      f.severity === "PASS" && "border-brand-green/30"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 font-sans">{f.finding}</span>
                      <span
                        className={cn(
                          "px-1.5 py-0.5 text-[9px] font-bold uppercase",
                          f.severity === "CRITICAL" && "bg-brand-red/20 text-brand-red",
                          f.severity === "HIGH" && "bg-brand-red/15 text-brand-red",
                          f.severity === "MEDIUM" && "bg-brand-gold/15 text-brand-gold",
                          f.severity === "LOW" && "bg-pitch-800 text-slate-400",
                          f.severity === "PASS" && "bg-brand-green/15 text-brand-green"
                        )}
                      >
                        {f.severity}
                      </span>
                    </div>

                    {f.evidence && (
                      <p className="text-slate-400 text-[10px] font-sans italic pl-2 border-l border-pitch-750">
                        Evidence: {f.evidence}
                      </p>
                    )}

                    {f.recommendation && (
                      <p className="text-slate-300 text-[10px] font-sans">
                        <strong className="text-brand-green">Fix:</strong> {f.recommendation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Super Admin Override Trigger */}
          {canOverride && (
            <div className="pt-2 border-t border-pitch-800">
              <button
                type="button"
                onClick={() => setShowOverride(!showOverride)}
                className="w-full py-2 bg-pitch-850 hover:bg-pitch-800 text-slate-300 border border-pitch-750 font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 text-[10px]"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>{showOverride ? "Close Admin Override Console" : "Open Super Admin Gate Override"}</span>
              </button>

              {showOverride && (
                <form onSubmit={handleOverrideSubmit} className="mt-3 p-4 bg-pitch-950 border border-pitch-750 space-y-3">
                  <div className="flex items-center gap-1.5 text-amber-400 text-[11px] font-bold">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Administrative Override (Audited Action)</span>
                  </div>

                  <p className="text-slate-400 text-[10px] leading-relaxed">
                    Executing an override bypasses automated AI Editorial Gate blocks. An immutable entry will be recorded in the editorial audit trail.
                  </p>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-300 uppercase">Override Decision *</label>
                    <select
                      value={overrideDecision}
                      onChange={(e) => setOverrideDecision(e.target.value as any)}
                      className="w-full bg-pitch-900 border border-pitch-750 p-2 text-slate-100 outline-none"
                    >
                      <option value="APPROVE">FORCE PASS / APPROVE GATE</option>
                      <option value="REJECT">FORCE REJECT GATE</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-300 uppercase">Audit Justification Reason *</label>
                    <textarea
                      rows={2}
                      required
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      placeholder="e.g. Verified license documentation directly with press agency..."
                      className="w-full bg-pitch-900 border border-pitch-750 p-2 text-slate-100 outline-none font-sans text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={overrideLoading}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold uppercase tracking-wider transition-all disabled:opacity-50 text-[10px]"
                  >
                    {overrideLoading ? "Recording Override..." : "Confirm & Record Administrative Override"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
