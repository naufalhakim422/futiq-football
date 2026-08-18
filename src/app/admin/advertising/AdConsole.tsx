"use client";

import React, { useState } from "react";
import {
  Megaphone,
  Plus,
  TrendingUp,
  ExternalLink,
  Shield,
  Sparkles,
  Download,
  Eye,
  MousePointerClick,
  Users,
  Trash2,
  Pause,
  Play,
  AlertTriangle,
} from "lucide-react";
import { AdPlacementPosition } from "@prisma/client";
import { AdProviderConfig } from "@/lib/ads/ad-provider.interface";
import {
  AdSponsorRecord,
  AdCampaignRecord,
  PopunderPolicy,
  AdAuditLogEntry,
  AdFormat,
  CampaignType,
  PricingModel,
} from "@/lib/ads/types";
import { cn } from "@/lib/utils";

interface AdConsoleProps {
  initialPlacements: any[];
  initialProviders: AdProviderConfig[];
  initialSponsors: AdSponsorRecord[];
  initialCampaigns: AdCampaignRecord[];
  initialPopunderPolicy: PopunderPolicy | null;
  initialAuditLogs: AdAuditLogEntry[];
}

export function AdConsole({
  initialPlacements,
  initialProviders,
  initialSponsors,
  initialCampaigns,
  initialPopunderPolicy,
  initialAuditLogs,
}: AdConsoleProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "providers" | "sponsors" | "campaigns" | "creatives" | "placements" | "popunder" | "reports" | "audit"
  >("overview");

  const [providers] = useState<AdProviderConfig[]>(initialProviders);
  const [sponsors, setSponsors] = useState<AdSponsorRecord[]>(initialSponsors);
  const [campaigns, setCampaigns] = useState<AdCampaignRecord[]>(initialCampaigns);
  const [placements] = useState<any[]>(initialPlacements);
  const [popunderPolicy, setPopunderPolicy] = useState<PopunderPolicy | null>(initialPopunderPolicy);
  const [auditLogs, setAuditLogs] = useState<AdAuditLogEntry[]>(initialAuditLogs);

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "CAMPAIGN" | "SPONSOR";
    id: string;
    name: string;
  } | null>(null);

  // Wizard Modal State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState<{
    source: CampaignType;
    format: AdFormat;
    sponsorId?: string;
    campaignName: string;
    title: string;
    description: string;
    imageUrl: string;
    mobileImageUrl: string;
    targetUrl: string;
    ctaText: string;
    placementPosition: AdPlacementPosition;
    pricingModel: PricingModel;
    agreedPrice: number;
    priority: number;
    startAt: string;
    endAt: string;
  }>({
    source: "DIRECT_SPONSOR",
    format: "BANNER",
    campaignName: "",
    title: "",
    description: "",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
    mobileImageUrl: "",
    targetUrl: "https://example.com/sponsor",
    ctaText: "Lihat Koleksi",
    placementPosition: AdPlacementPosition.ARTICLE_TOP,
    pricingModel: "FLAT_RATE",
    agreedPrice: 5000,
    priority: 100,
    startAt: new Date().toISOString().split("T")[0],
    endAt: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
  });

  // Create Sponsor Form State
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false);
  const [sponsorForm, setSponsorForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    billingEmail: "",
    notes: "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Aggregated KPIs
  const totalDeliveredImpressions = campaigns.reduce((acc, c) => acc + (c.impressionsDelivered || 0), 0);
  const totalDeliveredClicks = campaigns.reduce((acc, c) => acc + (c.clicksDelivered || 0), 0);
  const averageCtr =
    totalDeliveredImpressions > 0
      ? ((totalDeliveredClicks / totalDeliveredImpressions) * 100).toFixed(2)
      : "0.00";
  const activeSponsorsCount = sponsors.filter((s) => s.status === "ACTIVE").length;
  const activeCampaignsCount = campaigns.filter((c) => c.status === "ACTIVE").length;

  const handleLaunchWizardAd = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/advertising/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignName: wizardData.campaignName || `Kampanye ${wizardData.source} - ${wizardData.format}`,
          sponsorId: wizardData.sponsorId || (sponsors[0]?.id),
          providerId: wizardData.source === "DIRECT_SPONSOR" ? "sponsor-direct" : wizardData.source === "NETWORK" ? "adsterra" : "house-ad",
          type: wizardData.source,
          pricingModel: wizardData.pricingModel,
          agreedPriceMinor: Math.round(Number(wizardData.agreedPrice || 0) * 100),
          currency: "MYR",
          startAt: new Date(wizardData.startAt).toISOString(),
          endAt: wizardData.endAt ? new Date(wizardData.endAt).toISOString() : undefined,
          priority: Number(wizardData.priority),
          targetDevice: "ALL",
          creative: {
            name: `${wizardData.title} Kreatif`,
            format: wizardData.format,
            title: wizardData.title || "Promosi Sponsor Resmi",
            description: wizardData.description || "Kampanye partner resmi",
            imageUrl: wizardData.imageUrl,
            mobileImageUrl: wizardData.mobileImageUrl || undefined,
            targetUrl: wizardData.targetUrl,
            ctaText: wizardData.ctaText || "Selengkapnya",
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCampaigns((prev) => [data.campaign, ...prev]);
        setIsWizardOpen(false);
        setWizardStep(1);
        setMessage({ type: "success", text: "Kampanye iklan baru berhasil diaktifkan!" });
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "Gagal membuat kampanye." });
      }
    } catch {
      setMessage({ type: "error", text: "Terjadi kesalahan jaringan." });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCampaignStatus = async (camp: AdCampaignRecord) => {
    const nextStatus = camp.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try {
      const res = await fetch("/api/admin/advertising/campaigns", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: camp.id, status: nextStatus }),
      });
      if (res.ok) {
        setCampaigns((prev) =>
          prev.map((c) => (c.id === camp.id ? { ...c, status: nextStatus } : c))
        );
        setMessage({
          type: "success",
          text: `Status kampanye "${camp.campaignName}" diubah menjadi ${nextStatus === "ACTIVE" ? "AKTIF" : "DIJEDA"}.`,
        });
      }
    } catch {
      setMessage({ type: "error", text: "Gagal mengubah status kampanye." });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      if (deleteTarget.type === "CAMPAIGN") {
        const res = await fetch(`/api/admin/advertising/campaigns?id=${deleteTarget.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setCampaigns((prev) => prev.filter((c) => c.id !== deleteTarget.id));
          setMessage({
            type: "success",
            text: `Kampanye iklan "${deleteTarget.name}" berhasil dihapus dari sistem.`,
          });
        }
      } else if (deleteTarget.type === "SPONSOR") {
        const res = await fetch(`/api/admin/advertising/sponsors?id=${deleteTarget.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setSponsors((prev) => prev.filter((s) => s.id !== deleteTarget.id));
          setMessage({
            type: "success",
            text: `Sponsor "${deleteTarget.name}" berhasil dihapus.`,
          });
        }
      }
    } catch {
      setMessage({ type: "error", text: "Gagal menghapus entitas." });
    } finally {
      setSaving(false);
      setDeleteTarget(null);
    }
  };

  const handleCreateSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/advertising/sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sponsorForm),
      });

      if (res.ok) {
        const data = await res.json();
        setSponsors((prev) => [data.sponsor, ...prev]);
        setIsSponsorModalOpen(false);
        setSponsorForm({ companyName: "", contactName: "", email: "", phone: "", website: "", billingEmail: "", notes: "" });
        setMessage({ type: "success", text: `Sponsor "${data.sponsor.companyName}" berhasil didaftarkan.` });
      }
    } catch {
      setMessage({ type: "error", text: "Gagal mendaftarkan sponsor." });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePopunder = async (updates: Partial<PopunderPolicy>) => {
    try {
      const res = await fetch("/api/admin/advertising/popunder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setPopunderPolicy(data.policy);
        setMessage({ type: "success", text: "Kebijakan keamanan popunder berhasil diperbarui." });
      }
    } catch {
      setMessage({ type: "error", text: "Gagal memperbarui kebijakan popunder." });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alert */}
      {message && (
        <div
          className={cn(
            "p-3 rounded-lg border flex items-center justify-between text-xs font-semibold",
            message.type === "success"
              ? "bg-pitch-900 border-[#c3ff00]/40 text-[#c3ff00]"
              : "bg-red-950/80 border-red-800 text-red-300"
          )}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Primary KPI Header Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-pitch-900 border border-pitch-800 p-4 rounded-xl">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <Megaphone className="w-3.5 h-3.5 text-[#c3ff00]" />
            <span>Kampanye Aktif</span>
          </div>
          <p className="text-xl font-bold text-slate-100 mt-1">{activeCampaignsCount}</p>
          <span className="text-[10px] text-slate-500 font-mono">Sedang Tayang</span>
        </div>

        <div className="bg-pitch-900 border border-pitch-800 p-4 rounded-xl">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>Sponsor Langsung</span>
          </div>
          <p className="text-xl font-bold text-slate-100 mt-1">{activeSponsorsCount}</p>
          <span className="text-[10px] text-slate-500 font-mono">Partner Resmi</span>
        </div>

        <div className="bg-pitch-900 border border-pitch-800 p-4 rounded-xl">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>Total Impresi</span>
          </div>
          <p className="text-xl font-bold text-slate-100 mt-1">{totalDeliveredImpressions.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500 font-mono">Tayangan Terverifikasi</span>
        </div>

        <div className="bg-pitch-900 border border-pitch-800 p-4 rounded-xl">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <MousePointerClick className="w-3.5 h-3.5 text-amber-400" />
            <span>Total Klik</span>
          </div>
          <p className="text-xl font-bold text-slate-100 mt-1">{totalDeliveredClicks.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500 font-mono">Klik Riil Tervalidasi</span>
        </div>

        <div className="bg-pitch-900 border border-pitch-800 p-4 rounded-xl">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-[#c3ff00]" />
            <span>Rata-rata CTR</span>
          </div>
          <p className="text-xl font-bold text-[#c3ff00] mt-1">{averageCtr}%</p>
          <span className="text-[10px] text-slate-500 font-mono">Rasio Interaksi</span>
        </div>

        <div className="bg-pitch-900 border border-pitch-800 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Aksi Cepat</span>
          </div>
          <button
            onClick={() => {
              setWizardStep(1);
              setIsWizardOpen(true);
            }}
            className="w-full mt-2 py-1.5 px-3 bg-[#c3ff00] hover:bg-[#a6ff00] text-slate-950 font-bold text-xs rounded transition-colors flex items-center justify-center gap-1 shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Buat Iklan</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 border-b border-pitch-800 pb-2 overflow-x-auto">
        {[
          { id: "overview", label: "Ringkasan" },
          { id: "providers", label: `Provider Jaringan (${providers.length})` },
          { id: "sponsors", label: `Sponsor Langsung (${sponsors.length})` },
          { id: "campaigns", label: `Kampanye & Kontrak (${campaigns.length})` },
          { id: "creatives", label: "Studio Kreatif / Banner" },
          { id: "placements", label: `Penempatan Slot (${placements.length})` },
          { id: "popunder", label: "Kebijakan Popunder" },
          { id: "reports", label: "Laporan & Export CSV" },
          { id: "audit", label: `Log Audit (${auditLogs.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap",
              activeTab === tab.id
                ? "bg-[#c3ff00]/15 text-[#c3ff00] border border-[#c3ff00]/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-pitch-850"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW / RINGKASAN */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Active Campaigns & Sponsor Deals */}
            <div className="lg:col-span-2 bg-pitch-900 border border-pitch-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-[#c3ff00]" />
                  Kampanye Aktif & Kontrak Sponsor
                </h3>
                <span className="text-xs text-slate-400 font-mono">Prioritas Bertingkat Aktif</span>
              </div>

              <div className="space-y-3">
                {campaigns.map((camp) => (
                  <div
                    key={camp.id}
                    className="p-3.5 bg-pitch-950 border border-pitch-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-pitch-700 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded",
                            camp.type === "DIRECT_SPONSOR"
                              ? "bg-[#c3ff00]/20 text-[#c3ff00] border border-[#c3ff00]/40"
                              : camp.type === "NETWORK"
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                              : "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                          )}
                        >
                          {camp.type.replace("_", " ")}
                        </span>
                        <span className="text-xs font-bold text-slate-200">{camp.campaignName}</span>
                        {camp.status === "PAUSED" && (
                          <span className="px-1.5 py-0.2 text-[9px] bg-amber-950 text-amber-400 border border-amber-800 rounded font-mono">
                            DIJEDA
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {camp.sponsorName ? `Sponsor: ${camp.sponsorName} • ` : ""}
                        Model Biaya: {camp.pricingModel} {camp.agreedPriceMinor > 0 ? `(${camp.currency} ${(camp.agreedPriceMinor / 100).toLocaleString()})` : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono">
                      <div className="text-right">
                        <span className="text-slate-200 font-bold">{camp.impressionsDelivered.toLocaleString()}</span>
                        <span className="text-slate-500 text-[10px] block">impresi</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-200 font-bold">{camp.clicksDelivered.toLocaleString()}</span>
                        <span className="text-slate-500 text-[10px] block">klik</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[#c3ff00] font-bold">
                          {camp.impressionsDelivered > 0
                            ? ((camp.clicksDelivered / camp.impressionsDelivered) * 100).toFixed(1)
                            : "0.0"}%
                        </span>
                        <span className="text-slate-500 text-[10px] block">CTR</span>
                      </div>

                      {/* Action Buttons: Pause/Resume & Delete */}
                      <div className="flex items-center gap-1.5 pl-2 border-l border-pitch-800">
                        <button
                          title={camp.status === "ACTIVE" ? "Jeda Iklan" : "Aktifkan Iklan"}
                          onClick={() => handleToggleCampaignStatus(camp)}
                          className="p-1.5 rounded bg-pitch-900 hover:bg-pitch-850 text-slate-300 hover:text-white border border-pitch-750 transition-colors"
                        >
                          {camp.status === "ACTIVE" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-[#c3ff00]" />}
                        </button>

                        <button
                          title="Hapus Iklan Ini"
                          onClick={() => setDeleteTarget({ type: "CAMPAIGN", id: camp.id, name: camp.campaignName })}
                          className="p-1.5 rounded bg-pitch-900 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-pitch-750 hover:border-red-800 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Architecture & Security Card */}
            <div className="bg-pitch-900 border border-pitch-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#c3ff00]" />
                Aturan Keamanan & Perlindungan
              </h3>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="p-2.5 bg-pitch-950 border border-pitch-800 rounded">
                  <span className="font-bold text-slate-100 block mb-0.5">1. Zero Arbitrary JavaScript</span>
                  <p className="text-slate-400 text-[11px]">
                    Tidak ada injeksi skrip bebas ke DOM. Semua materi iklan terisolasi dalam sandbox aman.
                  </p>
                </div>

                <div className="p-2.5 bg-pitch-950 border border-pitch-800 rounded">
                  <span className="font-bold text-slate-100 block mb-0.5">2. Urutan Prioritas Ketat</span>
                  <p className="text-slate-400 text-[11px]">
                    Sponsor Langsung (P100) → Kontrak Berbayar (P75) → Jaringan Adsterra (P50) → Iklan Internal FUTIQ (P10).
                  </p>
                </div>

                <div className="p-2.5 bg-pitch-950 border border-pitch-800 rounded">
                  <span className="font-bold text-slate-100 block mb-0.5">3. Fallback Otomatis</span>
                  <p className="text-slate-400 text-[11px]">
                    Jika sponsor habis masa tayang atau dihapus, sistem otomatis beralih ke Adsterra atau House Ad tanpa slot kosong.
                  </p>
                </div>

                <div className="p-2.5 bg-pitch-950 border border-pitch-800 rounded">
                  <span className="font-bold text-slate-100 block mb-0.5">4. Pengalihan Klik Aman</span>
                  <p className="text-slate-400 text-[11px]">
                    URL tujuan divalidasi ketat di sisi server untuk mencegah serangan phishing dan open-redirect.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROVIDERS HUB / JARINGAN IKLAN */}
      {activeTab === "providers" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100">Daftar Provider Jaringan Iklan</h3>
            <span className="text-xs text-slate-400 font-mono">Provider-Agnostic Abstraction Layer</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {providers.map((p) => (
              <div key={p.adapterKey} className="bg-pitch-900 border border-pitch-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100">{p.providerName}</span>
                  <span
                    className={cn(
                      "px-2 py-0.5 text-[9px] font-bold uppercase rounded",
                      p.status === "ACTIVE"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : p.status === "MOCK"
                        ? "bg-amber-950 text-amber-400 border border-amber-800"
                        : "bg-slate-800 text-slate-400"
                    )}
                  >
                    {p.status}
                  </span>
                </div>

                <div className="space-y-1 text-[11px] text-slate-400">
                  <p>Tipe: <span className="text-slate-200 font-semibold">{p.providerType}</span></p>
                  <p>Mode: <span className="text-slate-200 font-semibold">{p.isTestMode ? "Sandbox / Uji Coba" : "Produksi"}</span></p>
                </div>

                <div className="pt-2 border-t border-pitch-800">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">Format Didukung:</span>
                  <div className="flex flex-wrap gap-1">
                    {p.supportedFormats.map((fmt) => (
                      <span key={fmt} className="px-1.5 py-0.5 text-[9px] bg-pitch-950 text-slate-300 border border-pitch-800 rounded">
                        {fmt}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DIRECT SPONSORS CRM */}
      {activeTab === "sponsors" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Direktori Sponsor Langsung</h3>
              <p className="text-xs text-slate-400">Kelola partner pengiklan langsung, kontrak sponsor, dan kontak perusahaan</p>
            </div>
            <button
              onClick={() => setIsSponsorModalOpen(true)}
              className="py-1.5 px-3 bg-[#c3ff00] hover:bg-[#a6ff00] text-slate-950 font-bold text-xs rounded transition-colors flex items-center gap-1 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Sponsor</span>
            </button>
          </div>

          <div className="bg-pitch-900 border border-pitch-800 rounded-xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-pitch-950 text-slate-400 uppercase font-mono text-[10px] border-b border-pitch-800">
                <tr>
                  <th className="p-3">Perusahaan</th>
                  <th className="p-3">Kontak Person</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Website</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Terdaftar</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pitch-800 text-slate-300">
                {sponsors.map((s) => (
                  <tr key={s.id} className="hover:bg-pitch-850/50">
                    <td className="p-3 font-bold text-slate-100 flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-pitch-950 border border-pitch-700 flex items-center justify-center font-bold text-[#c3ff00] text-[10px]">
                        {s.companyName.charAt(0)}
                      </div>
                      <span>{s.companyName}</span>
                    </td>
                    <td className="p-3 text-slate-300">{s.contactName || "—"}</td>
                    <td className="p-3 text-slate-400 font-mono">{s.email || s.billingEmail || "—"}</td>
                    <td className="p-3">
                      {s.website ? (
                        <a href={s.website} target="_blank" rel="noreferrer" className="text-[#c3ff00] hover:underline flex items-center gap-1">
                          <span>kunjungi</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 font-mono text-[11px]">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        title="Hapus Sponsor Ini"
                        onClick={() => setDeleteTarget({ type: "SPONSOR", id: s.id, name: s.companyName })}
                        className="p-1 rounded bg-pitch-950 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-pitch-800 hover:border-red-800 transition-colors inline-flex"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CAMPAIGNS & DEALS */}
      {activeTab === "campaigns" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100">Daftar Kampanye Iklan & Jadwal Tayang</h3>
            <button
              onClick={() => {
                setWizardStep(1);
                setIsWizardOpen(true);
              }}
              className="py-1.5 px-3 bg-[#c3ff00] hover:bg-[#a6ff00] text-slate-950 font-bold text-xs rounded transition-colors flex items-center gap-1 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Buat Kampanye</span>
            </button>
          </div>

          <div className="space-y-3">
            {campaigns.map((camp) => (
              <div key={camp.id} className="bg-pitch-900 border border-pitch-800 rounded-xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-pitch-800 pb-3">
                  <div>
                    <span className="text-sm font-bold text-slate-100">{camp.campaignName}</span>
                    <p className="text-xs text-slate-400">
                      Sponsor: <span className="text-slate-200 font-semibold">{camp.sponsorName || "Langsung / House"}</span> •
                      Biaya: <span className="text-[#c3ff00] font-semibold">{camp.pricingModel} {camp.agreedPriceMinor > 0 ? `(${camp.currency} ${(camp.agreedPriceMinor / 100).toLocaleString()})` : ""}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "px-2 py-0.5 text-[10px] font-bold rounded",
                        camp.status === "ACTIVE"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : "bg-amber-950 text-amber-400 border border-amber-800"
                      )}
                    >
                      {camp.status === "ACTIVE" ? "AKTIF" : "DIJEDA"}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-pitch-950 text-slate-300 border border-pitch-800">
                      Prioritas: P{camp.priority}
                    </span>

                    {/* Action buttons in campaign tab */}
                    <button
                      title={camp.status === "ACTIVE" ? "Jeda Iklan" : "Aktifkan Iklan"}
                      onClick={() => handleToggleCampaignStatus(camp)}
                      className="p-1.5 rounded bg-pitch-950 hover:bg-pitch-850 text-slate-300 hover:text-white border border-pitch-800 transition-colors"
                    >
                      {camp.status === "ACTIVE" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-[#c3ff00]" />}
                    </button>

                    <button
                      title="Hapus Iklan Ini"
                      onClick={() => setDeleteTarget({ type: "CAMPAIGN", id: camp.id, name: camp.campaignName })}
                      className="p-1.5 rounded bg-pitch-950 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-pitch-800 hover:border-red-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-pitch-950 p-2.5 rounded border border-pitch-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-mono">Masa Tayang</span>
                    <span className="text-slate-200 font-medium">
                      {new Date(camp.startAt).toLocaleDateString()} → {camp.endAt ? new Date(camp.endAt).toLocaleDateString() : "Tanpa Batas"}
                    </span>
                  </div>

                  <div className="bg-pitch-950 p-2.5 rounded border border-pitch-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-mono">Impresi Terkirim</span>
                    <span className="text-slate-200 font-bold">{camp.impressionsDelivered.toLocaleString()}</span>
                  </div>

                  <div className="bg-pitch-950 p-2.5 rounded border border-pitch-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-mono">Klik / Rasio CTR</span>
                    <span className="text-slate-200 font-bold">
                      {camp.clicksDelivered.toLocaleString()} (
                      {camp.impressionsDelivered > 0
                        ? ((camp.clicksDelivered / camp.impressionsDelivered) * 100).toFixed(2)
                        : "0.00"}%)
                    </span>
                  </div>

                  <div className="bg-pitch-950 p-2.5 rounded border border-pitch-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-mono">Target Penonton</span>
                    <span className="text-slate-200">
                      {camp.targetCompetition || camp.targetCategory || "Sepak Bola Global"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: CREATIVE STUDIO */}
      {activeTab === "creatives" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100">Studio Kreatif & Pratinjau Tampilan Iklan</h3>
            <span className="text-xs text-slate-400 font-mono">Responsive Sandbox Renderer</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Interactive Preview */}
            <div className="bg-pitch-900 border border-pitch-800 rounded-xl p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Pratinjau Banner Billboard (Desktop & Mobile)
              </h4>

              <div className="bg-pitch-950 border border-[#c3ff00]/30 rounded-xl overflow-hidden shadow-2xl">
                <div className="px-3 py-1.5 bg-black border-b border-pitch-800 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#c3ff00] font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Sponsor Resmi • Nike Football
                  </span>
                  <span className="text-slate-500">ads.futiq.com</span>
                </div>

                <div className="relative aspect-[21/9] bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80"
                    alt="Nike Football"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-4">
                    <h5 className="text-base font-bold text-white leading-snug">
                      Koleksi Performa Nike Football 2026
                    </h5>
                    <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                      Didesain khusus untuk akselerasi dan akurasi sentuhan maksimal di malam Liga Champions.
                    </p>
                    <span className="mt-2 text-[11px] font-bold text-[#c3ff00] uppercase">
                      Lihat Koleksi →
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Creative Specifications */}
            <div className="bg-pitch-900 border border-pitch-800 rounded-xl p-5 space-y-3 text-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Standar Aset Kreatif & Dimensi Gambar
              </h4>

              <div className="space-y-2 text-slate-300">
                <div className="p-3 bg-pitch-950 border border-pitch-800 rounded">
                  <span className="font-bold text-slate-100">Banner / Billboard:</span>
                  <p className="text-slate-400 mt-0.5">Ukuran rekomendasi 1200x250 (Desktop) dan 600x300 (Mobile). Maks 350KB JPG/WebP/PNG.</p>
                </div>

                <div className="p-3 bg-pitch-950 border border-pitch-800 rounded">
                  <span className="font-bold text-slate-100">Native In-Feed:</span>
                  <p className="text-slate-400 mt-0.5">Judul (maks 60 karakter), Deskripsi (maks 140 karakter), Thumbnail rasio 1:1 atau 16:9.</p>
                </div>

                <div className="p-3 bg-pitch-950 border border-pitch-800 rounded">
                  <span className="font-bold text-slate-100">Kartu / Artikel Bersponsor:</span>
                  <p className="text-slate-400 mt-0.5">Menyertakan badge tanda &quot;Sponsored&quot;, logo sponsor, dan tombol CTA pengalihan.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: PLACEMENTS MANAGER */}
      {activeTab === "placements" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100">Slot Penempatan Iklan di Website</h3>
            <span className="text-xs text-slate-400 font-mono">Titik Injeksi Tata Letak Web</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { slot: "HOME_TOP", name: "Billboard Atas Beranda", status: "AKTIF", priority: "P100" },
              { slot: "HOME_MIDDLE", name: "Tengah Feed Beranda", status: "AKTIF", priority: "P75" },
              { slot: "ARTICLE_TOP", name: "Kepala Naskah Artikel", status: "AKTIF", priority: "P100" },
              { slot: "ARTICLE_BOTTOM", name: "Bawah Naskah Artikel", status: "AKTIF", priority: "P50" },
              { slot: "MOBILE_STICKY", name: "Banner Melayang Bawah Mobile", status: "AKTIF", priority: "P50" },
              { slot: "NEWS_TOP", name: "Kepala Halaman Berita", status: "AKTIF", priority: "P50" },
            ].map((slot) => (
              <div key={slot.slot} className="bg-pitch-900 border border-pitch-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{slot.name}</span>
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    {slot.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono">{slot.slot}</p>
                <div className="pt-2 border-t border-pitch-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Prioritas: <strong className="text-slate-200">{slot.priority}</strong></span>
                  <span>Cadangan: <strong className="text-[#c3ff00]">House Ad</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: POPUNDER POLICY */}
      {activeTab === "popunder" && (
        <div className="bg-pitch-900 border border-pitch-800 rounded-xl p-5 space-y-6 max-w-3xl">
          <div className="flex items-center justify-between border-b border-pitch-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#c3ff00]" />
                Kebijakan Popunder & Kontrol Frekuensi Anti-Spam
              </h3>
              <p className="text-xs text-slate-400">
                Atur jeda penayangan popunder agar tidak mengganggu pembaca, durasi cooldown, dan halaman yang diblacklist
              </p>
            </div>

            <button
              onClick={() => handleUpdatePopunder({ enabled: !popunderPolicy?.enabled })}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded transition-colors",
                popunderPolicy?.enabled
                  ? "bg-emerald-600 text-white hover:bg-emerald-500"
                  : "bg-red-950 text-red-400 border border-red-800 hover:bg-red-900"
              )}
            >
              {popunderPolicy?.enabled ? "● POPUNDER AKTIF" : "○ POPUNDER NONAKTIF"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">Jeda Cooldown Antar Tayang (Menit):</label>
              <input
                type="number"
                defaultValue={popunderPolicy?.frequencyCapMinutes || 30}
                className="w-full px-3 py-2 bg-pitch-950 border border-pitch-800 rounded text-slate-100 font-mono text-xs"
              />
              <span className="text-[10px] text-slate-500">Waktu jeda minimal sebelum popunder boleh muncul lagi untuk 1 user</span>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">Batas Maksimal per Sesi Pembaca:</label>
              <input
                type="number"
                defaultValue={popunderPolicy?.maxPerSession || 1}
                className="w-full px-3 py-2 bg-pitch-950 border border-pitch-800 rounded text-slate-100 font-mono text-xs"
              />
              <span className="text-[10px] text-slate-500">Batas ketat agar pengunjung tidak merasa terganggu</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <label className="text-slate-400 font-semibold">Daftar Rute yang Diblokir (Blacklist):</label>
            <div className="p-3 bg-pitch-950 border border-pitch-800 rounded font-mono text-[11px] text-slate-300">
              /admin, /contributor, /auth, /login, /editor
            </div>
            <span className="text-[10px] text-slate-500">
              Iklan popunder otomatis diblokir di seluruh halaman admin, newsroom penulis, dan halaman otentikasi.
            </span>
          </div>
        </div>
      )}

      {/* TAB 8: REPORTS & CSV EXPORT */}
      {activeTab === "reports" && (
        <div className="bg-pitch-900 border border-pitch-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Laporan Performa Sponsor & Kampanye</h3>
              <p className="text-xs text-slate-400">Unduh data impresi dan keterlibatan klik tervalidasi untuk laporan pengiklan</p>
            </div>

            <a
              href="/api/admin/advertising/reports?format=csv"
              className="py-1.5 px-3 bg-[#c3ff00] hover:bg-[#a6ff00] text-slate-950 font-bold text-xs rounded transition-colors flex items-center gap-1.5 shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Laporan CSV</span>
            </a>
          </div>

          <div className="bg-pitch-950 border border-pitch-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-black text-slate-400 uppercase font-mono text-[10px] border-b border-pitch-800">
                <tr>
                  <th className="p-3">Nama Kampanye</th>
                  <th className="p-3">Sponsor</th>
                  <th className="p-3">Model</th>
                  <th className="p-3">Nilai Kontrak</th>
                  <th className="p-3">Impresi</th>
                  <th className="p-3">Klik</th>
                  <th className="p-3">CTR</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pitch-800 text-slate-300">
                {campaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-pitch-900/50 font-mono">
                    <td className="p-3 font-sans font-bold text-slate-100">{camp.campaignName}</td>
                    <td className="p-3 font-sans text-slate-300">{camp.sponsorName || "Jaringan"}</td>
                    <td className="p-3">{camp.pricingModel}</td>
                    <td className="p-3 text-[#c3ff00]">
                      {camp.agreedPriceMinor > 0 ? `${camp.currency} ${(camp.agreedPriceMinor / 100).toLocaleString()}` : "—"}
                    </td>
                    <td className="p-3">{camp.impressionsDelivered.toLocaleString()}</td>
                    <td className="p-3">{camp.clicksDelivered.toLocaleString()}</td>
                    <td className="p-3 text-slate-200">
                      {camp.impressionsDelivered > 0
                        ? ((camp.clicksDelivered / camp.impressionsDelivered) * 100).toFixed(2)
                        : "0.00"}%
                    </td>
                    <td className="p-3 font-sans">
                      <span
                        className={cn(
                          "px-2 py-0.5 text-[9px] font-bold uppercase rounded",
                          camp.status === "ACTIVE"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : "bg-amber-950 text-amber-400 border border-amber-800"
                        )}
                      >
                        {camp.status === "ACTIVE" ? "AKTIF" : "DIJEDA"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 9: AUDIT LOG */}
      {activeTab === "audit" && (
        <div className="bg-pitch-900 border border-pitch-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100">Log Audit Aktivitas Operasional Iklan</h3>
            <span className="text-xs text-slate-400 font-mono">Pencatatan Permanen Tanpa Manipulasi</span>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-pitch-950 border border-pitch-800 rounded-lg flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-[#c3ff00]/15 text-[#c3ff00] border border-[#c3ff00]/30 rounded uppercase">
                      {log.action}
                    </span>
                    <span className="text-slate-300">{log.details}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Aktor: {log.actorEmail || log.actorId} • Entitas: {log.entityType} ({log.entityId})
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-pitch-900 border border-red-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl text-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-red-950 border border-red-800 text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-100">
                  Konfirmasi Hapus {deleteTarget.type === "CAMPAIGN" ? "Iklan / Kampanye" : "Sponsor"}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Apakah Anda yakin ingin menghapus{" "}
                  <strong className="text-slate-200">&quot;{deleteTarget.name}&quot;</strong>?
                  {deleteTarget.type === "CAMPAIGN" && (
                    <span className="block mt-1 text-slate-500">
                      Iklan ini akan segera diturunkan dari seluruh slot website, dan sistem akan otomatis mengalihkan slot ke provider cadangan (fallback).
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2 border-t border-pitch-800">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="w-1/2 py-2.5 bg-pitch-800 hover:bg-pitch-750 text-slate-300 font-bold rounded transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleConfirmDelete}
                className="w-1/2 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition-colors flex items-center justify-center gap-1.5 shadow"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{saving ? "Menghapus..." : "Ya, Hapus Sekarang"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK CREATE AD WIZARD MODAL */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-pitch-900 border border-pitch-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-pitch-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#c3ff00]" />
                  Panduan Pembuatan Iklan Baru (Wizard)
                </h3>
                <span className="text-xs text-slate-400">Langkah {wizardStep} dari 4</span>
              </div>
              <button
                onClick={() => setIsWizardOpen(false)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            {/* STEP 1: Sumber & Format */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase">1. Pilih Sumber Iklan</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "DIRECT_SPONSOR", label: "Sponsor Langsung", desc: "Nike, Betting, Brand Olahraga" },
                      { id: "NETWORK", label: "Jaringan Iklan", desc: "Adsterra / Programmatic" },
                      { id: "HOUSE_AD", label: "Iklan Internal", desc: "Promosi Internal FUTIQ" },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setWizardData((prev) => ({ ...prev, source: s.id as any }))}
                        className={cn(
                          "p-3 rounded-lg border text-left transition-all",
                          wizardData.source === s.id
                            ? "bg-[#c3ff00]/15 border-[#c3ff00] text-slate-100"
                            : "bg-pitch-950 border-pitch-800 text-slate-400 hover:border-pitch-700"
                        )}
                      >
                        <span className="font-bold text-xs block">{s.label}</span>
                        <span className="text-[10px] text-slate-500">{s.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase">2. Pilih Format Iklan</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-xs">
                    {[
                      "BANNER",
                      "NATIVE",
                      "SOCIAL_BAR",
                      "POPUNDER",
                      "SMARTLINK",
                      "SPONSORED_CARD",
                      "IMAGE_LINK",
                      "TEXT_LINK",
                    ].map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setWizardData((prev) => ({ ...prev, format: fmt as any }))}
                        className={cn(
                          "p-2 rounded border font-semibold text-center text-xs transition-colors",
                          wizardData.format === fmt
                            ? "bg-[#c3ff00] text-slate-950 font-bold border-[#c3ff00]"
                            : "bg-pitch-950 border-pitch-800 text-slate-300 hover:border-pitch-700"
                        )}
                      >
                        {fmt.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="w-full py-2.5 bg-[#c3ff00] hover:bg-[#a6ff00] text-slate-950 font-bold text-xs rounded transition-colors"
                >
                  Lanjut ke Pengaturan Materi Iklan →
                </button>
              </div>
            )}

            {/* STEP 2: Materi & Teks */}
            {wizardStep === 2 && (
              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Nama Kampanye</label>
                  <input
                    type="text"
                    value={wizardData.campaignName}
                    onChange={(e) => setWizardData((prev) => ({ ...prev, campaignName: e.target.value }))}
                    placeholder="contoh: Peluncuran Sepatu Nike Football"
                    className="w-full px-3 py-2 bg-pitch-950 border border-pitch-800 rounded text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Judul / Headline Iklan</label>
                  <input
                    type="text"
                    value={wizardData.title}
                    onChange={(e) => setWizardData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="contoh: Koleksi Performa Resmi Musim 2026"
                    className="w-full px-3 py-2 bg-pitch-950 border border-pitch-800 rounded text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">URL Gambar Banner</label>
                  <input
                    type="text"
                    value={wizardData.imageUrl}
                    onChange={(e) => setWizardData((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-pitch-950 border border-pitch-800 rounded text-slate-100 font-mono text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">URL Tujuan / Link Saat Diklik</label>
                  <input
                    type="text"
                    value={wizardData.targetUrl}
                    onChange={(e) => setWizardData((prev) => ({ ...prev, targetUrl: e.target.value }))}
                    placeholder="https://sponsor.com/landing"
                    className="w-full px-3 py-2 bg-pitch-950 border border-pitch-800 rounded text-slate-100 font-mono text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Teks Tombol CTA</label>
                    <input
                      type="text"
                      value={wizardData.ctaText}
                      onChange={(e) => setWizardData((prev) => ({ ...prev, ctaText: e.target.value }))}
                      placeholder="Beli Sekarang"
                      className="w-full px-3 py-2 bg-pitch-950 border border-pitch-800 rounded text-slate-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Slot Penempatan</label>
                    <select
                      value={wizardData.placementPosition}
                      onChange={(e) => setWizardData((prev) => ({ ...prev, placementPosition: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-pitch-950 border border-pitch-800 rounded text-slate-100"
                    >
                      <option value="HOME_TOP">HOME_TOP (Atas Beranda)</option>
                      <option value="HOME_MIDDLE">HOME_MIDDLE (Tengah Beranda)</option>
                      <option value="ARTICLE_TOP">ARTICLE_TOP (Atas Artikel)</option>
                      <option value="ARTICLE_BOTTOM">ARTICLE_BOTTOM (Bawah Artikel)</option>
                      <option value="MOBILE_STICKY">MOBILE_STICKY (Melayang Mobile)</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="w-1/3 py-2 bg-pitch-800 hover:bg-pitch-750 text-slate-300 rounded font-semibold"
                  >
                    ← Kembali
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardStep(3)}
                    className="w-2/3 py-2 bg-[#c3ff00] hover:bg-[#a6ff00] text-slate-950 font-bold rounded"
                  >
                    Lanjut ke Nilai Kontrak & Biaya →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Biaya & Jadwal */}
            {wizardStep === 3 && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Model Pembayaran</label>
                    <select
                      value={wizardData.pricingModel}
                      onChange={(e) => setWizardData((prev) => ({ ...prev, pricingModel: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-pitch-950 border border-pitch-800 rounded text-slate-100"
                    >
                      <option value="FLAT_RATE">FLAT_RATE (Biaya Tetap Hasil Negosiasi)</option>
                      <option value="CPM">CPM (Biaya per 1.000 Tayang)</option>
                      <option value="CPC">CPC (Biaya per Klik)</option>
                      <option value="FREE">FREE / Iklan Internal</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Nominal Kesepakatan (MYR)</label>
                    <input
                      type="number"
                      value={wizardData.agreedPrice}
                      onChange={(e) => setWizardData((prev) => ({ ...prev, agreedPrice: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-pitch-950 border border-pitch-800 rounded text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Tanggal Mulai Tayang</label>
                    <input
                      type="date"
                      value={wizardData.startAt}
                      onChange={(e) => setWizardData((prev) => ({ ...prev, startAt: e.target.value }))}
                      className="w-full px-3 py-2 bg-pitch-950 border border-pitch-800 rounded text-slate-100 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Tanggal Berakhir</label>
                    <input
                      type="date"
                      value={wizardData.endAt}
                      onChange={(e) => setWizardData((prev) => ({ ...prev, endAt: e.target.value }))}
                      className="w-full px-3 py-2 bg-pitch-950 border border-pitch-800 rounded text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="w-1/3 py-2 bg-pitch-800 hover:bg-pitch-750 text-slate-300 rounded font-semibold"
                  >
                    ← Kembali
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardStep(4)}
                    className="w-2/3 py-2 bg-[#c3ff00] hover:bg-[#a6ff00] text-slate-950 font-bold rounded"
                  >
                    Tinjau & Aktifkan Kampanye →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Tinjau & Terbitkan */}
            {wizardStep === 4 && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-pitch-950 border border-pitch-800 rounded-xl space-y-2">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Ringkasan Kampanye</span>
                  <p className="text-sm font-bold text-slate-100">{wizardData.campaignName || "Kampanye Tanpa Judul"}</p>
                  <div className="grid grid-cols-2 gap-2 text-slate-300 pt-2 border-t border-pitch-800 text-[11px]">
                    <div>Sumber: <strong>{wizardData.source}</strong></div>
                    <div>Format: <strong>{wizardData.format}</strong></div>
                    <div>Slot: <strong>{wizardData.placementPosition}</strong></div>
                    <div>Biaya: <strong>{wizardData.pricingModel} (MYR {wizardData.agreedPrice.toLocaleString()})</strong></div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setWizardStep(3)}
                    className="w-1/3 py-2.5 bg-pitch-800 hover:bg-pitch-750 text-slate-300 rounded font-semibold"
                  >
                    ← Kembali
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleLaunchWizardAd}
                    className="w-2/3 py-2.5 bg-[#c3ff00] hover:bg-[#a6ff00] text-slate-950 font-bold rounded transition-colors flex items-center justify-center gap-2"
                  >
                    {saving ? "Mengaktifkan Kampanye..." : "🚀 Terbitkan & Tayangkan Iklan"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL PENDAFTARAN SPONSOR */}
      {isSponsorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSponsor}
            className="bg-pitch-900 border border-pitch-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-pitch-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100">Daftarkan Sponsor Langsung Baru</h3>
              <button
                type="button"
                onClick={() => setIsSponsorModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Nama Perusahaan / Brand *</label>
              <input
                required
                type="text"
                value={sponsorForm.companyName}
                onChange={(e) => setSponsorForm((prev) => ({ ...prev, companyName: e.target.value }))}
                placeholder="contoh: Nike Football"
                className="w-full px-3 py-2 bg-pitch-950 border border-pitch-800 rounded text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Nama Kontak Person</label>
                <input
                  type="text"
                  value={sponsorForm.contactName}
                  onChange={(e) => setSponsorForm((prev) => ({ ...prev, contactName: e.target.value }))}
                  placeholder="contoh: Budi Santoso"
                  className="w-full px-3 py-2 bg-pitch-950 border border-pitch-800 rounded text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Alamat Email</label>
                <input
                  type="email"
                  value={sponsorForm.email}
                  onChange={(e) => setSponsorForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="kontak@brand.com"
                  className="w-full px-3 py-2 bg-pitch-950 border border-pitch-800 rounded text-slate-100"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Website Resmi</label>
              <input
                type="url"
                value={sponsorForm.website}
                onChange={(e) => setSponsorForm((prev) => ({ ...prev, website: e.target.value }))}
                placeholder="https://brand.com"
                className="w-full px-3 py-2 bg-pitch-950 border border-pitch-800 rounded text-slate-100 font-mono text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-[#c3ff00] hover:bg-[#a6ff00] text-slate-950 font-bold rounded transition-colors"
            >
              {saving ? "Mendaftarkan..." : "Simpan Data Sponsor"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
