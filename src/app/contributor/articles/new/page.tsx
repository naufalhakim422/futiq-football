"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { useRouter } from "next/navigation";
import { ImageRightsStatus, SourceType } from "@prisma/client";
import { Plus, Trash2, Save, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

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
        <div className="flex items-center justify-between">
          <Link
            href="/contributor"
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-slate-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <SectionHeader
          title="Create New Editorial Article"
          subtitle="Draft initial manuscript, select category, attach verified sources, and define image rights"
          badgeText="Draft Studio"
        />

        {error && (
          <div className="p-4 bg-brand-red/10 border border-brand-red/30 flex items-center gap-3 text-xs text-brand-red">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-pitch-900 border border-pitch-800 p-6 sm:p-8 space-y-6 text-xs">
          {/* Main Info */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Headline / Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Tactical Breakdown: How Arsenal Deconstructed Liverpool's Midfield Pivot"
                className="w-full bg-pitch-950 border border-pitch-750 px-3 py-2.5 text-slate-100 rounded focus:border-brand-green outline-none font-sans text-sm font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-pitch-950 border border-pitch-750 px-3 py-2 text-slate-100 rounded focus:border-brand-green outline-none font-sans"
                >
                  <option value="Tactical Analysis">Tactical Analysis</option>
                  <option value="Match Reports">Match Reports</option>
                  <option value="Transfer Center">Transfer Center</option>
                  <option value="European Football">European Football</option>
                  <option value="Club Features">Club Features</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Subtitle / Deck (Optional)
                </label>
                <input
                  type="text"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleChange}
                  placeholder="Secondary supporting lead sentence..."
                  className="w-full bg-pitch-950 border border-pitch-750 px-3 py-2 text-slate-100 rounded focus:border-brand-green outline-none font-sans"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Lead Excerpt / Summary *
              </label>
              <textarea
                name="excerpt"
                rows={2}
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="Short 2-3 sentence overview that appears in cards and previews..."
                className="w-full bg-pitch-950 border border-pitch-750 px-3 py-2 text-slate-100 rounded focus:border-brand-green outline-none font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Article Body (Rich Text / Markdown) *
              </label>
              <textarea
                name="body"
                required
                rows={12}
                value={formData.body}
                onChange={handleChange}
                placeholder="Draft your full editorial story here..."
                className="w-full bg-pitch-950 border border-pitch-750 p-4 text-slate-100 rounded focus:border-brand-green outline-none font-sans leading-relaxed text-xs"
              />
            </div>
          </div>

          {/* Sources Section */}
          <div className="pt-6 border-t border-pitch-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans">
                  Editorial Source References
                </h4>
                <p className="text-[11px] text-slate-400">
                  Minimum 1 verified source required before review submission.
                </p>
              </div>

              <button
                type="button"
                onClick={addSource}
                className="px-2.5 py-1 text-xs font-semibold bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 text-slate-200 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Source</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.sources.map((source, index) => (
                <div key={index} className="p-3 bg-pitch-950 border border-pitch-800 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Source Name (e.g. Official Club Press)"
                      value={source.sourceName}
                      onChange={(e) => handleSourceChange(index, "sourceName", e.target.value)}
                      className="bg-pitch-900 border border-pitch-750 px-2.5 py-1.5 text-slate-200 rounded outline-none"
                    />
                    <input
                      type="url"
                      placeholder="Source URL"
                      value={source.sourceUrl}
                      onChange={(e) => handleSourceChange(index, "sourceUrl", e.target.value)}
                      className="bg-pitch-900 border border-pitch-750 px-2.5 py-1.5 text-slate-200 rounded outline-none font-mono"
                    />
                    <div className="flex items-center gap-2">
                      <select
                        value={source.sourceType}
                        onChange={(e) => handleSourceChange(index, "sourceType", e.target.value)}
                        className="w-full bg-pitch-900 border border-pitch-750 px-2.5 py-1.5 text-slate-200 rounded outline-none"
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
                          className="p-1.5 text-slate-500 hover:text-brand-red"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image Rights */}
          <div className="pt-6 border-t border-pitch-800 space-y-4">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans">
              Featured Image & Rights Metadata
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Featured Image URL
                </label>
                <input
                  type="url"
                  name="featuredImageUrl"
                  value={formData.featuredImageUrl}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-pitch-950 border border-pitch-750 px-3 py-2 text-slate-100 rounded focus:border-brand-green outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Image Rights Status *
                </label>
                <select
                  name="imageRightsStatus"
                  value={formData.imageRightsStatus}
                  onChange={handleChange}
                  className="w-full bg-pitch-950 border border-pitch-750 px-3 py-2 text-slate-100 rounded focus:border-brand-green outline-none font-sans"
                >
                  <option value="OWNED">Owned (Author Original)</option>
                  <option value="LICENSED">Licensed (Editorial License)</option>
                  <option value="OFFICIAL_PRESS">Official Press Kit</option>
                  <option value="PUBLIC_DOMAIN">Public Domain</option>
                  <option value="PERMISSION_GRANTED">Permission Granted</option>
                  <option value="UNKNOWN">Unknown (Blocks Review)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit / Save Bar */}
          <div className="pt-6 border-t border-pitch-800 flex justify-end gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-brand-green hover:bg-brand-green-hover disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? "Creating Draft..." : "Save Initial Draft"}</span>
            </button>
          </div>
        </form>
      </PageContainer>
    </div>
  );
}
