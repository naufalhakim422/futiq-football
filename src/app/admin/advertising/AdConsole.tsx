"use client";

import React, { useState } from "react";
import {
  Layers,
  Plus,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Sliders,
  Eye,
  MousePointer,
} from "lucide-react";
import { AdPlacementPosition, AdSlotStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

interface AdConsoleProps {
  initialPlacements: any[];
  initialProviders: any[];
}

export function AdConsole({ initialPlacements, initialProviders }: AdConsoleProps) {
  const [placements, setPlacements] = useState(initialPlacements);
  const [providers, setProviders] = useState(initialProviders);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [slotKey, setSlotKey] = useState("");
  const [position, setPosition] = useState<AdPlacementPosition>(AdPlacementPosition.HOME_TOP);
  const [providerId, setProviderId] = useState(providers[0]?.id || "");
  const [device, setDevice] = useState("ALL");
  const [targetCategory, setTargetCategory] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [customMarkupSafe, setCustomMarkupSafe] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const refreshPlacements = async () => {
    try {
      const res = await fetch("/api/admin/ads/placements");
      const data = await res.json();
      if (data.placements) setPlacements(data.placements);
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/ads/placements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slotKey,
          position,
          providerId,
          device,
          targetCategory: targetCategory || undefined,
          targetUrl: targetUrl || undefined,
          customMarkupSafe: customMarkupSafe || undefined,
          status: AdSlotStatus.ACTIVE,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create placement");

      setSuccessMsg("Ad placement configured successfully.");
      await refreshPlacements();
      setTimeout(() => {
        setShowModal(false);
        setTitle("");
        setSlotKey("");
        setCustomMarkupSafe("");
        setTargetUrl("");
        setSuccessMsg("");
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save placement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Ad Slots & Commercial Inventory</h2>
          <p className="text-xs text-slate-400">
            Manage sandboxed sponsor banners, programmatic slot keys, and device targeting rules.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-pitch-gold text-slate-950 font-bold text-xs rounded-lg hover:bg-yellow-400 transition-colors flex items-center gap-1.5 self-start"
        >
          <Plus className="w-4 h-4" />
          Create Placement Slot
        </button>
      </div>

      {/* Placements Table */}
      <div className="overflow-x-auto border border-pitch-800 rounded-xl bg-pitch-900">
        <table className="w-full text-left text-xs">
          <thead className="bg-pitch-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-pitch-800">
            <tr>
              <th className="p-3.5">Slot Title / Key</th>
              <th className="p-3.5">Position</th>
              <th className="p-3.5">Provider</th>
              <th className="p-3.5">Device</th>
              <th className="p-3.5 text-right">Impressions</th>
              <th className="p-3.5 text-right">Clicks</th>
              <th className="p-3.5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pitch-800/60">
            {placements.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500">
                  No active ad placements found. Click Create Placement Slot to add one.
                </td>
              </tr>
            ) : (
              placements.map((p) => (
                <tr key={p.id} className="hover:bg-pitch-850/40 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-slate-100">{p.title}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{p.slotKey}</div>
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-pitch-800 text-[10px] font-mono text-pitch-gold font-bold">
                      {p.position}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-300">{p.provider?.name || "Direct"}</td>
                  <td className="p-3.5 text-slate-400">{p.device}</td>
                  <td className="p-3.5 text-right font-mono font-bold text-slate-200">
                    {p.impressionsCount.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-brand-green">
                    {p.clicksCount.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE PLACEMENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-pitch-900 border border-pitch-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-green" />
                Configure Sandboxed Ad Placement
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              For security, raw JavaScript execution is strictly prohibited. Use approved image banners, sponsor tokens, and target URLs.
            </p>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs text-red-400">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-xs text-emerald-400">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Placement Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Home Header Top Banner"
                  required
                  className="w-full bg-pitch-950 border border-pitch-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-green"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    Slot Key (Unique)
                  </label>
                  <input
                    type="text"
                    value={slotKey}
                    onChange={(e) => setSlotKey(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
                    placeholder="e.g. home_top_banner"
                    required
                    className="w-full bg-pitch-950 border border-pitch-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-brand-green"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    Position
                  </label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value as any)}
                    className="w-full bg-pitch-950 border border-pitch-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-green"
                  >
                    {Object.values(AdPlacementPosition).map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    Ad Provider
                  </label>
                  <select
                    value={providerId}
                    onChange={(e) => setProviderId(e.target.value)}
                    className="w-full bg-pitch-950 border border-pitch-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-green"
                  >
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    Device Targeting
                  </label>
                  <select
                    value={device}
                    onChange={(e) => setDevice(e.target.value)}
                    className="w-full bg-pitch-950 border border-pitch-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-green"
                  >
                    <option value="ALL">All Devices</option>
                    <option value="DESKTOP">Desktop Only</option>
                    <option value="MOBILE">Mobile Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Destination URL
                </label>
                <input
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://sponsor.example/landing"
                  className="w-full bg-pitch-950 border border-pitch-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-green"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-pitch-800 hover:bg-pitch-750 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-brand-green text-slate-950 font-bold hover:bg-brand-green-hover transition-colors flex items-center gap-1.5"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Save Placement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
