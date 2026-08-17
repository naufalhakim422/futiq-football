"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertCircle, XCircle, Send } from "lucide-react";
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
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      let endpoint = `/api/editor/reviews/${articleId}/${decision}`;
      let body: any = { internalNotes };

      if (decision === "revision" || decision === "reject") {
        body.feedback = feedback;
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

      setMessage(`Decision "${decision.toUpperCase()}" recorded successfully.`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to process review action");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 bg-pitch-950 border border-pitch-800 p-4 rounded text-xs font-mono">
      <div className="flex items-center justify-between pb-2 border-b border-pitch-800">
        <span className="font-bold text-slate-200 uppercase tracking-wider">
          Editorial Decision Console
        </span>
        <span className="text-[10px] text-slate-400 font-normal">
          Staff Action
        </span>
      </div>

      {error && (
        <div className="p-2.5 bg-brand-red/10 border border-brand-red/30 text-brand-red rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="p-2.5 bg-brand-green/10 border border-brand-green/30 text-brand-green rounded flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="space-y-1">
        <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
          Internal Notes (Staff Only — Not seen by author)
        </label>
        <textarea
          rows={2}
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          placeholder="e.g. Sources verified against Opta feed. Clear for publish."
          className="w-full bg-pitch-900 border border-pitch-750 p-2 text-slate-100 rounded outline-none font-sans text-xs"
        />
      </div>

      <div className="space-y-1">
        <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
          Contributor Feedback (Visible to author upon revision/rejection)
        </label>
        <textarea
          rows={3}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="e.g. Please add an additional citation for the player wage clause and revise paragraph 3."
          className="w-full bg-pitch-900 border border-pitch-750 p-2 text-slate-100 rounded outline-none font-sans text-xs"
        />
      </div>

      <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => handleDecision("approve")}
          className="py-2 px-3 bg-brand-green text-slate-950 font-bold uppercase tracking-wider hover:bg-brand-green-hover disabled:opacity-50 transition-colors flex items-center justify-center gap-1 text-[11px]"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Approve</span>
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => handleDecision("revision")}
          className="py-2 px-3 bg-pitch-850 hover:bg-pitch-800 text-brand-gold border border-pitch-700 font-bold uppercase tracking-wider disabled:opacity-50 transition-colors flex items-center justify-center gap-1 text-[11px]"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Req. Revision</span>
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => handleDecision("reject")}
          className="py-2 px-3 bg-pitch-850 hover:bg-pitch-800 text-brand-red border border-pitch-700 font-bold uppercase tracking-wider disabled:opacity-50 transition-colors flex items-center justify-center gap-1 text-[11px]"
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Reject</span>
        </button>
      </div>
    </div>
  );
}
