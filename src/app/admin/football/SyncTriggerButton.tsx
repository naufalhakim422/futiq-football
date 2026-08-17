"use client";

import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export function SyncTriggerButton({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSync = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/football/admin/sync", {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        setMessage("Sync completed successfully!");
        router.refresh();
      } else {
        setMessage(data.error || "Sync failed.");
      }
    } catch (err: any) {
      setMessage("Network error during sync execution.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        onClick={handleSync}
        disabled={loading || !isSuperAdmin}
        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 bg-brand-green hover:bg-brand-green-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        <span>{loading ? "Synchronizing..." : "Trigger Manual Sync"}</span>
      </button>
      {message && (
        <span className="text-[11px] font-mono text-brand-green">{message}</span>
      )}
      {!isSuperAdmin && (
        <span className="text-[10px] text-slate-500 font-mono">
          Super Admin authorization required
        </span>
      )}
    </div>
  );
}
