"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertCircle, XCircle, Send, Lock, MessageSquare, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

interface ReviewActionPanelProps {
  articleId: string;
  currentStatus: string;
}

export function ReviewActionPanel({ articleId, currentStatus }: ReviewActionPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [internalNotes, setInternalNotes] = useState("");
  const [feedback, setFeedback] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDecision = async (decision: "approve" | "revision" | "reject") => {
    if ((decision === "revision") && (!feedback || feedback.trim().length < 5)) {
      setError("Please provide specific feedback to the contributor explaining the requested revisions (minimum 5 characters).");
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      let endpoint = `/api/editor/reviews/${articleId}/${decision}`;
      let body: any = { internalNotes: internalNotes.trim() || undefined };

      if (decision === "revision" || decision === "reject") {
        body.feedback = feedback.trim() || undefined;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Failed to execute ${decision}`);
      }

      setMessage(`Decision "${decision.toUpperCase()}" successfully recorded on editorial ledger.`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to process review action");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 bg-pitch-900 border border-pitch-800 p-5 sm:p-6 shadow-xl text-xs font-mono">
      <div className="flex items-center justify-between pb-3 border-b border-pitch-800">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand-green" />
          <span className="font-bold text-slate-100 uppercase tracking-wider">
            Editorial Decision Console
          </span>
        </div>
        <span className="text-[10px] text-brand-green bg-brand-green/10 border border-brand-green/20 px-2 py-0.5 font-bold uppercase">
          Staff Gate
        </span>
      </div>

      {error && (
        <div className="p-3 bg-brand-red/10 border border-brand-red/30 text-brand-red rounded-none flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {message && (
        <div className="p-3 bg-brand-green/10 border border-brand-green/30 text-brand-green rounded-none flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Internal Staff Notes (Staff Only) */}
      <div className="space-y-1.5 p-3.5 bg-pitch-950 border border-pitch-800">
        <div className="flex items-center justify-between">
          <label className="font-bold text-amber-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <Lock className="w-3 h-3" />
            <span>Internal Notes (Staff Only — Private)</span>
          </label>
          <span className="text-[9px] text-slate-500">Not visible to author</span>
        </div>
        <textarea
          rows={2}
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          placeholder="e.g. Verified Opta stats against match telemetry. Cleared for publication."
          className="w-full bg-pitch-900 border border-pitch-750 p-2.5 text-slate-100 focus:border-brand-green outline-none font-sans text-xs"
        />
      </div>

      {/* Contributor Feedback (Sent to Author) */}
      <div className="space-y-1.5 p-3.5 bg-pitch-950 border border-pitch-800">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-200 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <MessageSquare className="w-3 h-3 text-brand-green" />
            <span>Contributor Feedback (Visible upon Revision/Rejection)</span>
          </label>
          <span className="text-[9px] text-slate-500">Sent to author</span>
        </div>
        <textarea
          rows={3}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="e.g. Please add an additional citation for the second-half duel statistics and tighten the third paragraph."
          className="w-full bg-pitch-900 border border-pitch-750 p-2.5 text-slate-100 focus:border-brand-green outline-none font-sans text-xs leading-relaxed"
        />
      </div>

      {/* Action Buttons */}
      <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <button
          type="button"
          disabled={loading}
          onClick={() => handleDecision("approve")}
          className="py-2.5 px-3 bg-brand-green text-slate-950 font-bold uppercase tracking-wider hover:bg-brand-green-hover disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-1.5 text-[11px] active:scale-[0.99]"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Approve</span>
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => handleDecision("revision")}
          className="py-2.5 px-3 bg-pitch-850 hover:bg-pitch-800 text-brand-gold border border-pitch-700 font-bold uppercase tracking-wider disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-1.5 text-[11px] active:scale-[0.99]"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Req. Revision</span>
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => handleDecision("reject")}
          className="py-2.5 px-3 bg-pitch-850 hover:bg-pitch-800 text-brand-red border border-pitch-700 font-bold uppercase tracking-wider disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-1.5 text-[11px] active:scale-[0.99]"
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Reject</span>
        </button>
      </div>
    </div>
  );
}
