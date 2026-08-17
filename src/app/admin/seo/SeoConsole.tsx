"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  FileText,
  Search,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function SeoConsole() {
  const [stats, setStats] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [redirects, setRedirects] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "discover" | "redirects">("overview");

  // Redirect form state
  const [sourcePath, setSourcePath] = useState("");
  const [targetPath, setTargetPath] = useState("");
  const [statusCode, setStatusCode] = useState("301");
  const [isSubmittingRedirect, setIsSubmittingRedirect] = useState(false);
  const [redirectMsg, setRedirectMsg] = useState("");
  const [redirectErr, setRedirectErr] = useState("");

  const fetchData = async () => {
    try {
      const [ovRes, redRes] = await Promise.all([
        fetch("/api/admin/seo/overview").then((r) => r.json()),
        fetch("/api/admin/seo/redirects").then((r) => r.json()),
      ]);

      if (ovRes.stats) setStats(ovRes.stats);
      if (ovRes.settings) setSettings(ovRes.settings);
      if (redRes.redirects) setRedirects(redRes.redirects);
    } catch (err) {
      console.warn("Failed to fetch SEO admin data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRedirect = async (e: React.FormEvent) => {
    e.preventDefault();
    setRedirectMsg("");
    setRedirectErr("");
    setIsSubmittingRedirect(true);

    try {
      const res = await fetch("/api/admin/seo/redirects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourcePath,
          targetPath,
          statusCode: parseInt(statusCode, 10),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create redirect");

      setRedirectMsg("Redirect created successfully.");
      setSourcePath("");
      setTargetPath("");
      fetchData();
    } catch (err: any) {
      setRedirectErr(err.message || "Failed to create redirect");
    } finally {
      setIsSubmittingRedirect(false);
    }
  };

  const handleDeleteRedirect = async (id: string) => {
    try {
      await fetch(`/api/admin/seo/redirects/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.warn("Failed to delete redirect:", err);
    }
  };

  return (
    <div className="min-h-screen bg-pitch-950 text-slate-100 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-pitch-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
                <Globe className="w-6 h-6 text-brand-green" />
                Growth & SEO Console
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-green/10 text-brand-green border border-brand-green/20">
                Server-Authoritative
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Centralized search visibility, Google Discover readiness, XML sitemaps, RSS feeds, and URL redirects.
            </p>
          </div>

          <button
            onClick={fetchData}
            className="px-3.5 py-1.5 bg-pitch-900 border border-pitch-800 hover:border-pitch-700 text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Data
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-pitch-900 border border-pitch-800 rounded-xl p-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Indexable Articles</span>
            <div className="text-2xl font-black text-white mt-1">
              {stats?.indexableArticles ?? "..."}
              <span className="text-xs font-normal text-slate-500 ml-1">/ {stats?.totalArticles ?? "..."}</span>
            </div>
            <span className="text-[10px] text-emerald-400 mt-1 block">Gate cleared & published</span>
          </div>

          <div className="bg-pitch-900 border border-pitch-800 rounded-xl p-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Redirects</span>
            <div className="text-2xl font-black text-white mt-1">{stats?.totalRedirects ?? 0}</div>
            <span className="text-[10px] text-slate-500 mt-1 block">301 / 302 rules active</span>
          </div>

          <div className="bg-pitch-900 border border-pitch-800 rounded-xl p-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Breaking Stories</span>
            <div className="text-2xl font-black text-pitch-gold mt-1">{stats?.breakingArticles ?? 0}</div>
            <span className="text-[10px] text-slate-500 mt-1 block">High urgency priority</span>
          </div>

          <div className="bg-pitch-900 border border-pitch-800 rounded-xl p-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Discover Engine</span>
            <div className="text-2xl font-black text-brand-green mt-1">Active</div>
            <span className="text-[10px] text-slate-500 mt-1 block">Structured schema enabled</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-pitch-800 pb-3">
          <button
            onClick={() => setActiveTab("overview")}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5",
              activeTab === "overview"
                ? "bg-brand-green text-slate-950"
                : "bg-pitch-900 text-slate-400 hover:text-slate-200"
            )}
          >
            <Globe className="w-3.5 h-3.5" />
            Global Feeds & Sitemaps
          </button>
          <button
            onClick={() => setActiveTab("discover")}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5",
              activeTab === "discover"
                ? "bg-brand-green text-slate-950"
                : "bg-pitch-900 text-slate-400 hover:text-slate-200"
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Google Discover Checklist
          </button>
          <button
            onClick={() => setActiveTab("redirects")}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5",
              activeTab === "redirects"
                ? "bg-brand-green text-slate-950"
                : "bg-pitch-900 text-slate-400 hover:text-slate-200"
            )}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            Redirect Manager ({redirects.length})
          </button>
        </div>

        {/* TAB 1: Global Feeds & Sitemaps */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-pitch-900 border border-pitch-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Live Indexing Feeds
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-pitch-950 border border-pitch-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white">XML Sitemap Index</div>
                    <div className="text-[10px] text-slate-500">Includes all verified published entities</div>
                  </div>
                  <a
                    href="/sitemap.xml"
                    target="_blank"
                    className="text-xs text-brand-green hover:underline font-mono"
                  >
                    /sitemap.xml ↗
                  </a>
                </div>

                <div className="p-3 bg-pitch-950 border border-pitch-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white">Google News XML Sitemap</div>
                    <div className="text-[10px] text-slate-500">Articles published within the last 48 hours</div>
                  </div>
                  <a
                    href="/news-sitemap.xml"
                    target="_blank"
                    className="text-xs text-brand-green hover:underline font-mono"
                  >
                    /news-sitemap.xml ↗
                  </a>
                </div>

                <div className="p-3 bg-pitch-950 border border-pitch-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white">Robots Directives</div>
                    <div className="text-[10px] text-slate-500">Dynamic allow/disallow crawlers map</div>
                  </div>
                  <a
                    href="/robots.txt"
                    target="_blank"
                    className="text-xs text-brand-green hover:underline font-mono"
                  >
                    /robots.txt ↗
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-pitch-900 border border-pitch-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-pitch-gold" />
                RSS & Content Syndication
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-pitch-950 border border-pitch-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white">Global RSS 2.0 Feed</div>
                    <div className="text-[10px] text-slate-500">Full editorial syndication feed</div>
                  </div>
                  <a
                    href="/rss.xml"
                    target="_blank"
                    className="text-xs text-pitch-gold hover:underline font-mono"
                  >
                    /rss.xml ↗
                  </a>
                </div>

                <div className="p-3 bg-pitch-950 border border-pitch-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white">Transfers Feed</div>
                    <div className="text-[10px] text-slate-500">Dedicated transfer deals and rumors</div>
                  </div>
                  <a
                    href="/transfers/rss.xml"
                    target="_blank"
                    className="text-xs text-pitch-gold hover:underline font-mono"
                  >
                    /transfers/rss.xml ↗
                  </a>
                </div>

                <div className="p-3 bg-pitch-950 border border-pitch-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white">Internal Search Endpoint</div>
                    <div className="text-[10px] text-slate-500">Ranked server-side multi-entity search</div>
                  </div>
                  <a
                    href="/search"
                    target="_blank"
                    className="text-xs text-pitch-gold hover:underline font-mono"
                  >
                    /search ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Google Discover Checklist */}
        {activeTab === "discover" && (
          <div className="bg-pitch-900 border border-pitch-800 rounded-2xl p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-green" />
                Google Discover Readiness Framework
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Google Discover rewards compelling high-quality football journalism with rich media, fast server rendering, and transparent author bylines.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { title: "High-Resolution Lead Images", desc: "Featured images must be at least 1200px wide with max-image-preview:large enabled in robots directives." },
                { title: "Structured NewsArticle Schema", desc: "JSON-LD includes publisher logo, datePublished, dateModified, and verified author Person schema." },
                { title: "Transparent Author & Editorial Bylines", desc: "Every article is authored by an approved contributor or editor with a public profile." },
                { title: "Server-Authoritative Canonical URLs", desc: "Deterministic canonical tags strip query tracking parameters to prevent duplicate indexing." },
                { title: "Fast Server-Side Rendering", desc: "Pages render instantaneously with Next.js Turbopack and Redis caching without layout shifting." },
              ].map((item, idx) => (
                <div key={idx} className="p-4 bg-pitch-950 border border-pitch-800 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white">{item.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Redirect Manager */}
        {activeTab === "redirects" && (
          <div className="space-y-6">
            {/* Create Redirect Form */}
            <div className="bg-pitch-900 border border-pitch-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white">Create URL Redirect Rule</h3>

              {redirectMsg && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                  {redirectMsg}
                </div>
              )}
              {redirectErr && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                  {redirectErr}
                </div>
              )}

              <form onSubmit={handleCreateRedirect} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  value={sourcePath}
                  onChange={(e) => setSourcePath(e.target.value)}
                  placeholder="Source path (e.g. /news/old-slug)"
                  className="bg-pitch-950 border border-pitch-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-green"
                  required
                />
                <input
                  type="text"
                  value={targetPath}
                  onChange={(e) => setTargetPath(e.target.value)}
                  placeholder="Target path (e.g. /news/new-slug)"
                  className="bg-pitch-950 border border-pitch-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-green"
                  required
                />
                <select
                  value={statusCode}
                  onChange={(e) => setStatusCode(e.target.value)}
                  className="bg-pitch-950 border border-pitch-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-green"
                >
                  <option value="301">301 — Permanent Redirect</option>
                  <option value="302">302 — Temporary Redirect</option>
                </select>
                <button
                  type="submit"
                  disabled={isSubmittingRedirect}
                  className="px-4 py-2 bg-brand-green text-slate-950 font-bold text-xs rounded-lg hover:bg-brand-green-hover transition-colors"
                >
                  {isSubmittingRedirect ? "Saving..." : "Add Redirect Rule"}
                </button>
              </form>
            </div>

            {/* Redirects Table */}
            <div className="overflow-x-auto border border-pitch-800 rounded-2xl bg-pitch-900">
              <table className="w-full text-left text-xs">
                <thead className="bg-pitch-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-pitch-800">
                  <tr>
                    <th className="p-3.5">Source Path</th>
                    <th className="p-3.5">Target Path</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5 text-right">Hits</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pitch-800/60">
                  {redirects.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500">
                        No redirect rules configured yet.
                      </td>
                    </tr>
                  ) : (
                    redirects.map((r) => (
                      <tr key={r.id} className="hover:bg-pitch-850/40 transition-colors">
                        <td className="p-3.5 font-mono text-slate-200">{r.sourcePath}</td>
                        <td className="p-3.5 font-mono text-brand-green">{r.targetPath}</td>
                        <td className="p-3.5 font-bold text-pitch-gold">{r.statusCode}</td>
                        <td className="p-3.5 text-right font-mono text-slate-400">{r.hitCount}</td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleDeleteRedirect(r.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                            title="Delete rule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
