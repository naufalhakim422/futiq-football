"use client";

import React, { useState } from "react";
import {
  Megaphone,
  Layers,
  Plus,
  Radio,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Globe,
  ExternalLink,
  Shield,
  Smartphone,
  Laptop,
  Calendar,
  Sparkles,
  DollarSign,
  Download,
  Filter,
  Lock,
  Eye,
  MousePointerClick,
  Users,
  Settings,
  HelpCircle,
} from "lucide-react";
import { AdPlacementPosition, AdSlotStatus } from "@prisma/client";
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

  const [providers, setProviders] = useState<AdProviderConfig[]>(initialProviders);
  const [sponsors, setSponsors] = useState<AdSponsorRecord[]>(initialSponsors);
  const [campaigns, setCampaigns] = useState<AdCampaignRecord[]>(initialCampaigns);
  const [placements, setPlacements] = useState<any[]>(initialPlacements);
  const [popunderPolicy, setPopunderPolicy] = useState<PopunderPolicy | null>(initialPopunderPolicy);
  const [auditLogs, setAuditLogs] = useState<AdAuditLogEntry[]>(initialAuditLogs);

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
    ctaText: "Shop Collection",
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
          campaignName: wizardData.campaignName || `${wizardData.source} - ${wizardData.format} Campaign`,
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
            name: `${wizardData.title} Creative`,
            format: wizardData.format,
            title: wizardData.title || "Promoted Football Showcase",
            description: wizardData.description || "Official partner promotion",
            imageUrl: wizardData.imageUrl,
            mobileImageUrl: wizardData.mobileImageUrl || undefined,
            targetUrl: wizardData.targetUrl,
            ctaText: wizardData.ctaText || "Explore",
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCampaigns((prev) => [data.campaign, ...prev]);
        setIsWizardOpen(false);
        setWizardStep(1);
        setMessage({ type: "success", text: "New campaign and creative activated successfully!" });
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "Failed to create campaign." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error occurred." });
    } finally {
      setSaving(false);
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
        setMessage({ type: "success", text: `Sponsor "${data.sponsor.companyName}" registered.` });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to create sponsor." });
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
        setMessage({ type: "success", text: "Popunder safety policy updated." });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to update popunder policy." });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alert / Flash */}
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
            <span>Active Campaigns</span>
          </div>
          <p className="text-xl font-bold text-slate-100 mt-1">{activeCampaignsCount}</p>
          <span className="text-[10px] text-slate-500 font-mono">In Flight</span>
        </div>

        <div className="bg-pitch-900 border border-pitch-800 p-4 rounded-xl">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>Direct Sponsors</span>
          </div>
          <p className="text-xl font-bold text-slate-100 mt-1">{activeSponsorsCount}</p>
          <span className="text-[10px] text-slate-500 font-mono">Direct Partners</span>
        </div>

        <div className="bg-pitch-900 border border-pitch-800 p-4 rounded-xl">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>Total Delivered</span>
          </div>
          <p className="text-xl font-bold text-slate-100 mt-1">{totalDeliveredImpressions.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500 font-mono">Impressions</span>
        </div>

        <div className="bg-pitch-900 border border-pitch-800 p-4 rounded-xl">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <MousePointerClick className="w-3.5 h-3.5 text-amber-400" />
            <span>Verified Clicks</span>
          </div>
          <p className="text-xl font-bold text-slate-100 mt-1">{totalDeliveredClicks.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500 font-mono">Audited Hits</span>
        </div>

        <div className="bg-pitch-900 border border-pitch-800 p-4 rounded-xl">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-[#c3ff00]" />
            <span>Average CTR</span>
          </div>
          <p className="text-xl font-bold text-[#c3ff00] mt-1">{averageCtr}%</p>
          <span className="text-[10px] text-slate-500 font-mono">Engagement</span>
        </div>

        <div className="bg-pitch-900 border border-pitch-800 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Quick Action</span>
          </div>
          <button
            onClick={() => {
              setWizardStep(1);
              setIsWizardOpen(true);
            }}
            className="w-full mt-2 py-1.5 px-3 bg-[#c3ff00] hover:bg-[#a6ff00] text-slate-950 font-bold text-xs rounded transition-colors flex items-center justify-center gap-1 shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Create Ad</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 border-b border-pitch-800 pb-2 overflow-x-auto">
        {[
          { id: "overview", label: "Overview" },
          { id: "providers", label: `Providers (${providers.length})` },
          { id: "sponsors", label: `Direct Sponsors (${sponsors.length})` },
          { id: "campaigns", label: `Campaigns & Deals (${campaigns.length})` },
          { id: "creatives", label: "Creative Studio" },
          { id: "placements", label: `Placements (${placements.length})` },
          { id: "popunder", label: "Popunder Policy" },
          { id: "reports", label: "Reports & CSV" },
          { id: "audit", label: `Audit Log (${auditLogs.length})` },
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

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Active Campaigns & Sponsor Deals */}
            <div className="lg:col-span-2 bg-pitch-900 border border-pitch-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-[#c3ff00]" />
                  Active Sponsorship Deals & Campaigns
                </h3>
                <span className="text-xs text-slate-400 font-mono">Priority Cascade Enabled</span>
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
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {camp.sponsorName ? `Sponsor: ${camp.sponsorName} • ` : ""}
                        Pricing: {camp.pricingModel} {camp.agreedPriceMinor > 0 ? `(${camp.currency} ${(camp.agreedPriceMinor / 100).toLocaleString()})` : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div className="text-right">
                        <span className="text-slate-200 font-bold">{camp.impressionsDelivered.toLocaleString()}</span>
                        <span className="text-slate-500 text-[10px] block">imp.</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-200 font-bold">{camp.clicksDelivered.toLocaleString()}</span>
                        <span className="text-slate-500 text-[10px] block">clicks</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[#c3ff00] font-bold">
                          {camp.impressionsDelivered > 0
                            ? ((camp.clicksDelivered / camp.impressionsDelivered) * 100).toFixed(1)
                            : "0.0"}%
                        </span>
                        <span className="text-slate-500 text-[10px] block">CTR</span>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">
                        P{camp.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Architecture & Security Card */}
            <div className="bg-pitch-900 border border-pitch-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#c3ff00]" />
                Ad Safety & Architecture Rules
              </h3>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="p-2.5 bg-pitch-950 border border-pitch-800 rounded">
                  <span className="font-bold text-slate-100 block mb-0.5">1. Zero Arbitrary JS</span>
                  <p className="text-slate-400 text-[11px]">
                    No raw scripts in DOM. All creatives are sandboxed or rendered through controlled adapters.
                  </p>
                </div>

                <div className="p-2.5 bg-pitch-950 border border-pitch-800 rounded">
                  <span className="font-bold text-slate-100 block mb-0.5">2. Strict Priority Hierarchy</span>
                  <p className="text-slate-400 text-[11px]">
                    Direct Sponsor (P100) → Paid Deals (P75) → Adsterra (P50) → House Ad (P10).
                  </p>
                </div>

                <div className="p-2.5 bg-pitch-950 border border-pitch-800 rounded">
                  <span className="font-bold text-slate-100 block mb-0.5">3. Fallback Protection</span>
                  <p className="text-slate-400 text-[11px]">
                    Expired sponsors fall back instantly to Adsterra or House Ads without blank containers.
                  </p>
                </div>

                <div className="p-2.5 bg-pitch-950 border border-pitch-800 rounded">
                  <span className="font-bold text-slate-100 block mb-0.5">4. Safe Click Redirect</span>
                  <p className="text-slate-400 text-[11px]">
                    Destination URLs are strictly validated to prevent open-redirects and XSS attacks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROVIDERS HUB */}
      {activeTab === "providers" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100">Registered Ad Providers</h3>
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
                  <p>Type: <span className="text-slate-200 font-semibold">{p.providerType}</span></p>
                  <p>Mode: <span className="text-slate-200 font-semibold">{p.isTestMode ? "Test / Sandbox" : "Production"}</span></p>
                </div>

                <div className="pt-2 border-t border-pitch-800">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">Supported Formats:</span>
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
              <h3 className="text-sm font-bold text-slate-100">Direct Sponsor Directory</h3>
              <p className="text-xs text-slate-400">Manage direct advertisers, negotiated deals, and client contacts</p>
            </div>
            <button
              onClick={() => setIsSponsorModalOpen(true)}
              className="py-1.5 px-3 bg-[#c3ff00] hover:bg-[#a6ff00] text-slate-950 font-bold text-xs rounded transition-colors flex items-center gap-1 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Sponsor</span>
            </button>
          </div>

          <div className="bg-pitch-900 border border-pitch-800 rounded-xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-pitch-950 text-slate-400 uppercase font-mono text-[10px] border-b border-pitch-800">
                <tr>
                  <th className="p-3">Company</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Website</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Created</th>
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
                          <span>visit</span>
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
            <h3 className="text-sm font-bold text-slate-100">Advertising Campaigns & Flight Dates</h3>
            <button
              onClick={() => {
                setWizardStep(1);
                setIsWizardOpen(true);
              }}
              className="py-1.5 px-3 bg-[#c3ff00] hover:bg-[#a6ff00] text-slate-950 font-bold text-xs rounded transition-colors flex items-center gap-1 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Create Campaign</span>
            </button>
          </div>

          <div className="space-y-3">
            {campaigns.map((camp) => (
              <div key={camp.id} className="bg-pitch-900 border border-pitch-800 rounded-xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-pitch-800 pb-3">
                  <div>
                    <span className="text-sm font-bold text-slate-100">{camp.campaignName}</span>
                    <p className="text-xs text-slate-400">
                      Sponsor: <span className="text-slate-200 font-semibold">{camp.sponsorName || "Direct / House"}</span> •
                      Pricing: <span className="text-[#c3ff00] font-semibold">{camp.pricingModel} {camp.agreedPriceMinor > 0 ? `(${camp.currency} ${(camp.agreedPriceMinor / 100).toLocaleString()})` : ""}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {camp.status}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-pitch-950 text-slate-300 border border-pitch-800">
                      Priority: P{camp.priority}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-pitch-950 p-2.5 rounded border border-pitch-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-mono">Flight Window</span>
                    <span className="text-slate-200 font-medium">
                      {new Date(camp.startAt).toLocaleDateString()} → {camp.endAt ? new Date(camp.endAt).toLocaleDateString() : "Indefinite"}
                    </span>
                  </div>

                  <div className="bg-pitch-950 p-2.5 rounded border border-pitch-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-mono">Impressions</span>
                    <span className="text-slate-200 font-bold">{camp.impressionsDelivered.toLocaleString()}</span>
                  </div>

                  <div className="bg-pitch-950 p-2.5 rounded border border-pitch-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-mono">Clicks / CTR</span>
                    <span className="text-slate-200 font-bold">
                      {camp.clicksDelivered.toLocaleString()} (
                      {camp.impressionsDelivered > 0
                        ? ((camp.clicksDelivered / camp.impressionsDelivered) * 100).toFixed(2)
                        : "0.00"}%)
                    </span>
                  </div>

                  <div className="bg-pitch-950 p-2.5 rounded border border-pitch-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-mono">Targeting</span>
                    <span className="text-slate-200">
                      {camp.targetCompetition || camp.targetCategory || "Global Football"}
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
            <h3 className="text-sm font-bold text-slate-100">Creative Studio & Live Mockup Preview</h3>
            <span className="text-xs text-slate-400 font-mono">Responsive Sandbox Renderer</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Interactive Preview */}
            <div className="bg-pitch-900 border border-pitch-800 rounded-xl p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Desktop & Mobile Billboard Preview
              </h4>

              <div className="bg-pitch-950 border border-[#c3ff00]/30 rounded-xl overflow-hidden shadow-2xl">
                <div className="px-3 py-1.5 bg-black border-b border-pitch-800 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#c3ff00] font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Official Sponsor • Nike Football
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
                      Nike Football Performance Collection 2026
                    </h5>
                    <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                      Engineered for explosive transitions and precision control on European matchdays.
                    </p>
                    <span className="mt-2 text-[11px] font-bold text-[#c3ff00] uppercase">
                      Shop Collection →
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Creative Specifications */}
            <div className="bg-pitch-900 border border-pitch-800 rounded-xl p-5 space-y-3 text-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Creative Asset Standards
              </h4>

              <div className="space-y-2 text-slate-300">
                <div className="p-3 bg-pitch-950 border border-pitch-800 rounded">
                  <span className="font-bold text-slate-100">Banner / Billboard:</span>
                  <p className="text-slate-400 mt-0.5">Recommended 1200x250 (Desktop) and 600x300 (Mobile). Max 350KB JPG/WebP/PNG.</p>
                </div>

                <div className="p-3 bg-pitch-950 border border-pitch-800 rounded">
                  <span className="font-bold text-slate-100">Native In-Feed:</span>
                  <p className="text-slate-400 mt-0.5">Headline (60 chars max), Description (140 chars max), 1:1 or 16:9 thumbnail.</p>
                </div>

                <div className="p-3 bg-pitch-950 border border-pitch-800 rounded">
                  <span className="font-bold text-slate-100">Sponsored Card / Article:</span>
                  <p className="text-slate-400 mt-0.5">Includes &quot;Sponsored&quot; editorial badge, brand logo, and click-through CTA.</p>
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
            <h3 className="text-sm font-bold text-slate-100">Ad Placement Slots</h3>
            <span className="text-xs text-slate-400 font-mono">Website Layout Injection Points</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { slot: "HOME_TOP", name: "Homepage Billboard Top", status: "ACTIVE", priority: "P100" },
              { slot: "HOME_MIDDLE", name: "Homepage Mid-Feed Stream", status: "ACTIVE", priority: "P75" },
              { slot: "ARTICLE_TOP", name: "Article Manuscript Header", status: "ACTIVE", priority: "P100" },
              { slot: "ARTICLE_BOTTOM", name: "Article Manuscript Footer", status: "ACTIVE", priority: "P50" },
              { slot: "MOBILE_STICKY", name: "Mobile Sticky Footer Anchor", status: "ACTIVE", priority: "P50" },
              { slot: "NEWS_TOP", name: "News Archive Header", status: "ACTIVE", priority: "P50" },
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
                  <span>Priority: <strong className="text-slate-200">{slot.priority}</strong></span>
                  <span>Fallback: <strong className="text-[#c3ff00]">House Ad</strong></span>
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
                Popunder Policy & Anti-Abuse Frequency Controls
              </h3>
              <p className="text-xs text-slate-400">
                Configure non-intrusive popunder limits, cooldown intervals, and blacklisted routes
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
              {popunderPolicy?.enabled ? "● POPUNDER ENABLED" : "○ POPUNDER DISABLED"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">Frequency Cooldown (Minutes):</label>
              <input
                type="number"
                defaultValue={popunderPolicy?.frequencyCapMinutes || 30}
                className="w-full px-3 py-2 bg-pitch-950 border border-pitch-800 rounded text-slate-100 font-mono text-xs"
              />
              <span className="text-[10px] text-slate-500">Minimum time between popunder triggers for a single user</span>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">Max Impressions Per Session:</label>
              <input
                type="number"
                defaultValue={popunderPolicy?.maxPerSession || 1}
                className="w-full px-3 py-2 bg-pitch-950 border border-pitch-800 rounded text-slate-100 font-mono text-xs"
              />
              <span className="text-[10px] text-slate-500">Hard limit to prevent user frustration</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <label className="text-slate-400 font-semibold">Blacklisted Excluded Routes:</label>
            <div className="p-3 bg-pitch-950 border border-pitch-800 rounded font-mono text-[11px] text-slate-300">
              /admin, /contributor, /auth, /login, /editor
            </div>
            <span className="text-[10px] text-slate-500">
              Popunders are strictly blocked on all administrative and authentication surfaces.
            </span>
          </div>
        </div>
      )}

      {/* TAB 8: REPORTS & CSV EXPORT */}
      {activeTab === "reports" && (
        <div className="bg-pitch-900 border border-pitch-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Sponsor Performance & Campaign Reports</h3>
              <p className="text-xs text-slate-400">Export verified impression and engagement data for direct advertisers</p>
            </div>

            <a
              href="/api/admin/advertising/reports?format=csv"
              className="py-1.5 px-3 bg-[#c3ff00] hover:bg-[#a6ff00] text-slate-950 font-bold text-xs rounded transition-colors flex items-center gap-1.5 shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV Report</span>
            </a>
          </div>

          <div className="bg-pitch-950 border border-pitch-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-black text-slate-400 uppercase font-mono text-[10px] border-b border-pitch-800">
                <tr>
                  <th className="p-3">Campaign</th>
                  <th className="p-3">Sponsor</th>
                  <th className="p-3">Model</th>
                  <th className="p-3">Deal Value</th>
                  <th className="p-3">Delivered</th>
                  <th className="p-3">Clicks</th>
                  <th className="p-3">CTR</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pitch-800 text-slate-300">
                {campaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-pitch-900/50 font-mono">
                    <td className="p-3 font-sans font-bold text-slate-100">{camp.campaignName}</td>
                    <td className="p-3 font-sans text-slate-300">{camp.sponsorName || "Network"}</td>
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
                      <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {camp.status}
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
            <h3 className="text-sm font-bold text-slate-100">Advertising Operations Audit Log</h3>
            <span className="text-xs text-slate-400 font-mono">Immutable Operations Trail</span>
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
                    Actor: {log.actorEmail || log.actorId} • Entity: {log.entityType} ({log.entityId})
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

      {/* QUICK CREATE AD WIZARD MODAL */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-pitch-900 border border-pitch-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-pitch-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#c3ff00]" />
                  Launch Ad Campaign Wizard
                </h3>
                <span className="text-xs text-slate-400">Step {wizardStep} of 4</span>
              </div>
              <button
                onClick={() => setIsWizardOpen(false)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            {/* STEP 1: Source & Format */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase">1. Select Campaign Source</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "DIRECT_SPONSOR", label: "Direct Sponsor", desc: "Nike, Betting, Sports Brands" },
                      { id: "NETWORK", label: "Ad Network", desc: "Adsterra / Programmatic" },
                      { id: "HOUSE_AD", label: "House Ad", desc: "Internal FUTIQ Promotion" },
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
                  <label className="text-xs font-bold text-slate-300 uppercase">2. Select Ad Format</label>
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
                  Continue to Creative Setup →
                </button>
              </div>
            )}

            {/* STEP 2: Creative & Copy */}
            {wizardStep === 2 && (
              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Campaign Name</label>
                  <input
                    type="text"
                    value={wizardData.campaignName}
                    onChange={(e) => setWizardData((prev) => ({ ...prev, campaignName: e.target.value }))}
                    placeholder="e.g. Nike Football Boots Launch"
                    className="w-full px-3 py-2 bg-pitch-950 border border-pitch-800 rounded text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Ad Headline / Title</label>
                  <input
                    type="text"
                    value={wizardData.title}
                    onChange={(e) => setWizardData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Official Performance Collection 2026"
                    className="w-full px-3 py-2 bg-pitch-950 border border-pitch-800 rounded text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Image Asset URL</label>
                  <input
                    type="text"
                    value={wizardData.imageUrl}
                    onChange={(e) => setWizardData((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-pitch-950 border border-pitch-800 rounded text-slate-100 font-mono text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Destination / Click URL</label>
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
                    <label className="font-bold text-slate-300">CTA Button Text</label>
                    <input
                      type="text"
                      value={wizardData.ctaText}
                      onChange={(e) => setWizardData((prev) => ({ ...prev, ctaText: e.target.value }))}
                      placeholder="Shop Now"
                      className="w-full px-3 py-2 bg-pitch-950 border border-pitch-800 rounded text-slate-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Placement Slot</label>
                    <select
                      value={wizardData.placementPosition}
                      onChange={(e) => setWizardData((prev) => ({ ...prev, placementPosition: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-pitch-950 border border-pitch-800 rounded text-slate-100"
                    >
                      <option value="HOME_TOP">HOME_TOP</option>
                      <option value="HOME_MIDDLE">HOME_MIDDLE</option>
                      <option value="ARTICLE_TOP">ARTICLE_TOP</option>
                      <option value="ARTICLE_BOTTOM">ARTICLE_BOTTOM</option>
                      <option value="MOBILE_STICKY">MOBILE_STICKY</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="w-1/3 py-2 bg-pitch-800 hover:bg-pitch-750 text-slate-300 rounded font-semibold"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardStep(3)}
                    className="w-2/3 py-2 bg-[#c3ff00] hover:bg-[#a6ff00] text-slate-950 font-bold rounded"
                  >
                    Continue to Financials →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Financials & Pricing */}
            {wizardStep === 3 && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Pricing Model</label>
                    <select
                      value={wizardData.pricingModel}
                      onChange={(e) => setWizardData((prev) => ({ ...prev, pricingModel: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-pitch-950 border border-pitch-800 rounded text-slate-100"
                    >
                      <option value="FLAT_RATE">FLAT_RATE (Direct Negotiated Fixed Fee)</option>
                      <option value="CPM">CPM (Cost per Mille)</option>
                      <option value="CPC">CPC (Cost per Click)</option>
                      <option value="FREE">FREE / House Ad</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Agreed Fixed Price (MYR)</label>
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
                    <label className="font-bold text-slate-300">Start Flight Date</label>
                    <input
                      type="date"
                      value={wizardData.startAt}
                      onChange={(e) => setWizardData((prev) => ({ ...prev, startAt: e.target.value }))}
                      className="w-full px-3 py-2 bg-pitch-950 border border-pitch-800 rounded text-slate-100 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">End Flight Date</label>
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
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardStep(4)}
                    className="w-2/3 py-2 bg-[#c3ff00] hover:bg-[#a6ff00] text-slate-950 font-bold rounded"
                  >
                    Review & Activate Campaign →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Review & Launch */}
            {wizardStep === 4 && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-pitch-950 border border-pitch-800 rounded-xl space-y-2">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Campaign Summary</span>
                  <p className="text-sm font-bold text-slate-100">{wizardData.campaignName || "Untitled Campaign"}</p>
                  <div className="grid grid-cols-2 gap-2 text-slate-300 pt-2 border-t border-pitch-800 text-[11px]">
                    <div>Source: <strong>{wizardData.source}</strong></div>
                    <div>Format: <strong>{wizardData.format}</strong></div>
                    <div>Placement: <strong>{wizardData.placementPosition}</strong></div>
                    <div>Pricing: <strong>{wizardData.pricingModel} (MYR {wizardData.agreedPrice.toLocaleString()})</strong></div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setWizardStep(3)}
                    className="w-1/3 py-2.5 bg-pitch-800 hover:bg-pitch-750 text-slate-300 rounded font-semibold"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleLaunchWizardAd}
                    className="w-2/3 py-2.5 bg-[#c3ff00] hover:bg-[#a6ff00] text-slate-950 font-bold rounded transition-colors flex items-center justify-center gap-2"
                  >
                    {saving ? "Activating Campaign..." : "🚀 Launch & Mount Campaign"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE SPONSOR MODAL */}
      {isSponsorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSponsor}
            className="bg-pitch-900 border border-pitch-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-pitch-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100">Register Direct Sponsor</h3>
              <button
                type="button"
                onClick={() => setIsSponsorModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Company / Brand Name *</label>
              <input
                required
                type="text"
                value={sponsorForm.companyName}
                onChange={(e) => setSponsorForm((prev) => ({ ...prev, companyName: e.target.value }))}
                placeholder="e.g. Nike Football"
                className="w-full px-3 py-2 bg-pitch-950 border border-pitch-800 rounded text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Contact Person</label>
                <input
                  type="text"
                  value={sponsorForm.contactName}
                  onChange={(e) => setSponsorForm((prev) => ({ ...prev, contactName: e.target.value }))}
                  placeholder="e.g. John Smith"
                  className="w-full px-3 py-2 bg-pitch-950 border border-pitch-800 rounded text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Email Address</label>
                <input
                  type="email"
                  value={sponsorForm.email}
                  onChange={(e) => setSponsorForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="contact@brand.com"
                  className="w-full px-3 py-2 bg-pitch-950 border border-pitch-800 rounded text-slate-100"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Official Website URL</label>
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
              {saving ? "Registering..." : "Save Sponsor Record"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
