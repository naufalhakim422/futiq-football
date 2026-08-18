"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { useRouter } from "next/navigation";
import { ImageRightsStatus, SourceType } from "@prisma/client";
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  AlertCircle,
  FileText,
  Shield,
  Link2,
  Sparkles,
  Info,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { calculateReadTime } from "@/lib/security/sanitizer";
import { ModularArticleEditor } from "@/components/contributor/ModularArticleEditor";

export default function NewArticleDraftPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    title: string;
    subtitle: string;
    excerpt: string;
    category: string;
    body: string;
    featuredImageUrl: string;
    featuredImageCaption: string;
    imageRightsStatus: ImageRightsStatus;
    imageAttribution: string;
    seoTitle: string;
    seoDescription: string;
    sources: Array<{
      sourceName: string;
      sourceUrl: string;
      sourceType: SourceType;
      notes?: string;
    }>;
  }>({
    title: "",
    subtitle: "",
    excerpt: "",
    category: "Tactical Analysis",
    body: "",
    featuredImageUrl: "",
    featuredImageCaption: "",
    imageRightsStatus: ImageRightsStatus.OWNED,
    imageAttribution: "",
    seoTitle: "",
    seoDescription: "",
    sources: [
      {
        sourceName: "Official Press Conference / Club Statement",
        sourceUrl: "https://",
        sourceType: SourceType.OFFICIAL,
        notes: "",
      },
    ],
  });

  const { wordCount, readTimeMinutes } = calculateReadTime(formData.body || "");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSourceChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const nextSources = [...prev.sources];
      nextSources[index] = { ...nextSources[index], [field]: value };
      return { ...prev, sources: nextSources };
    });
  };

  const addSource = () => {
    setFormData((prev) => ({
      ...prev,
      sources: [
        ...prev.sources,
        {
          sourceName: "",
          sourceUrl: "https://",
          sourceType: SourceType.NEWS_REPORT,
          notes: "",
        },
      ],
    }));
  };

  const removeSource = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sources: prev.sources.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/contributor/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create article draft");
      }

      router.push(`/contributor/articles/${data.data.id}/edit`);
    } catch (err: any) {
      setError(err.message || "An error occurred while creating draft.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 space-y-8">
      <PageContainer>
        {/* Navigation & Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-pitch-800">
          <Link
            href="/contributor"
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Newsroom Desk</span>
          </Link>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span>Live Word Count: <strong className="text-slate-200">{wordCount}</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-brand-green" />
              <span>~{readTimeMinutes} min read</span>
            </span>
          </div>
        </div>

        <SectionHeader
          title="Create New Manuscript"
          subtitle="Draft tactical analysis, configure citations, declare image rights, and prepare for editorial review"
          badgeText="Manuscript Studio"
        />

        {error && (
          <div className="p-4 bg-brand-red/10 border border-brand-red/30 flex items-center gap-3 text-xs text-brand-red font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 text-xs">
          {/* Main Editorial Manuscript */}
          <div className="bg-pitch-900 border border-pitch-800 p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-2 pb-2 border-b border-pitch-800">
              <FileText className="w-4 h-4 text-brand-green" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans">
                Article Headline & Manuscript Body
              </h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Headline / Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Tactical Breakdown: How Arsenal's Midfield Pivot Overwhelmed Liverpool's High Press"
                  className="w-full bg-pitch-950 border border-pitch-750 p-3.5 text-slate-100 focus:border-brand-green focus:ring-1 focus:ring-brand-green/30 outline-none font-sans text-base font-bold transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    Category Beat *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-pitch-950 border border-pitch-750 px-3.5 py-2.5 text-slate-100 focus:border-brand-green focus:ring-1 focus:ring-brand-green/30 outline-none font-sans transition-all"
                  >
                    <option value="Tactical Analysis">Tactical Analysis</option>
                    <option value="Match Reports">Match Reports</option>
                    <option value="Transfer Center">Transfer Center</option>
                    <option value="European Football">European Football</option>
                    <option value="Club Features">Club Features</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    Subtitle / Deck (Optional)
                  </label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleChange}
                    placeholder="Secondary supporting lead sentence..."
                    className="w-full bg-pitch-950 border border-pitch-750 px-3.5 py-2.5 text-slate-100 focus:border-brand-green focus:ring-1 focus:ring-brand-green/30 outline-none font-sans transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Lead Excerpt / Summary *
                </label>
                <textarea
                  name="excerpt"
                  rows={2}
                  value={formData.excerpt}
                  onChange={handleChange}
                  placeholder="Short 2-3 sentence overview that appears in cards and feeds..."
                  className="w-full bg-pitch-950 border border-pitch-750 p-3 text-slate-100 focus:border-brand-green focus:ring-1 focus:ring-brand-green/30 outline-none font-sans leading-relaxed"
                />
              </div>

              {/* Modular Rich Manuscript Studio */}
              <div className="space-y-2 pt-2">
                <ModularArticleEditor
                  initialBody={formData.body}
                  onChange={(compiledBody) =>
                    setFormData((prev) => ({ ...prev, body: compiledBody }))
                  }
                  title={formData.title}
                  subtitle={formData.subtitle}
                  category={formData.category}
                  featuredImageUrl={formData.featuredImageUrl}
                  featuredImageCaption={formData.featuredImageCaption}
                />
              </div>
            </div>
          </div>

          {/* Sources Section */}
          <div className="bg-pitch-900 border border-pitch-800 p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-pitch-800">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-brand-green" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans">
                  Editorial Citations & References ({formData.sources.length})
                </h3>
              </div>

              <button
                type="button"
                onClick={addSource}
                className="px-3 py-1.5 text-xs font-semibold bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 text-slate-200 flex items-center gap-1.5 transition-colors active:scale-[0.99]"
              >
                <Plus className="w-3.5 h-3.5 text-brand-green" />
                <span>Add Source</span>
              </button>
            </div>

            <div className="p-3.5 bg-pitch-950 border border-pitch-800 text-slate-400 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 text-brand-green shrink-0" />
              <span>Minimum 1 verified primary source required before editorial review submission.</span>
            </div>

            <div className="space-y-3">
              {formData.sources.map((source, index) => (
                <div key={index} className="p-4 bg-pitch-950 border border-pitch-800 space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase">Source Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Official Club Statement"
                        value={source.sourceName}
                        onChange={(e) => handleSourceChange(index, "sourceName", e.target.value)}
                        className="w-full bg-pitch-900 border border-pitch-750 px-3 py-2 text-slate-200 focus:border-brand-green outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase">Source URL *</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={source.sourceUrl}
                        onChange={(e) => handleSourceChange(index, "sourceUrl", e.target.value)}
                        className="w-full bg-pitch-900 border border-pitch-750 px-3 py-2 text-slate-200 focus:border-brand-green outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase">Source Type *</label>
                      <div className="flex items-center gap-2">
                        <select
                          value={source.sourceType}
                          onChange={(e) => handleSourceChange(index, "sourceType", e.target.value)}
                          className="w-full bg-pitch-900 border border-pitch-750 px-3 py-2 text-slate-200 focus:border-brand-green outline-none"
                        >
                          <option value="OFFICIAL">Official</option>
                          <option value="INTERVIEW">Interview</option>
                          <option value="PRESS_RELEASE">Press Release</option>
                          <option value="FOOTBALL_DATA">Football Data</option>
                          <option value="NEWS_REPORT">News Report</option>
                          <option value="SOCIAL">Social</option>
                          <option value="OTHER">Other</option>
                        </select>
                        {formData.sources.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSource(index)}
                            className="p-2 text-slate-500 hover:text-brand-red transition-colors shrink-0"
                            title="Remove Source"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Image & Rights Metadata */}
          <div className="bg-pitch-900 border border-pitch-800 p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-2 pb-2 border-b border-pitch-800">
              <Shield className="w-4 h-4 text-brand-green" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans">
                Featured Media & Image Rights Clearance
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Featured Image URL (Optional)
                </label>
                <input
                  type="url"
                  name="featuredImageUrl"
                  value={formData.featuredImageUrl}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-pitch-950 border border-pitch-750 px-3.5 py-2.5 text-slate-100 focus:border-brand-green outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Rights Clearance Status *
                </label>
                <select
                  name="imageRightsStatus"
                  value={formData.imageRightsStatus}
                  onChange={handleChange}
                  className="w-full bg-pitch-950 border border-pitch-750 px-3.5 py-2.5 text-slate-100 focus:border-brand-green outline-none font-sans"
                >
                  <option value="OWNED">Owned (Author Original Photography/Graphic)</option>
                  <option value="LICENSED">Licensed (Editorial Media License)</option>
                  <option value="OFFICIAL_PRESS">Official Club Press Kit</option>
                  <option value="PUBLIC_DOMAIN">Public Domain Media</option>
                  <option value="PERMISSION_GRANTED">Permission Granted by Rights Holder</option>
                  <option value="UNKNOWN">Unknown (Blocks Review Submission)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/contributor"
              className="text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel and Return to Desk
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 bg-brand-green hover:bg-brand-green-hover disabled:opacity-50 transition-all shadow-lg active:scale-[0.99]"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? "Creating Manuscript..." : "Save Initial Manuscript"}</span>
            </button>
          </div>
        </form>
      </PageContainer>
    </div>
  );
}
