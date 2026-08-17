"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { useParams, useRouter } from "next/navigation";
import { ImageRightsStatus, SourceType } from "@prisma/client";
import {
  Save,
  Send,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  History,
  FileText,
  Shield,
  Search,
  Undo2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ArticleEditorPage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;

  const [activeTab, setActiveTab] = useState<"content" | "sources" | "rights" | "seo" | "revisions">("content");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [article, setArticle] = useState<any>(null);

  const [formData, setFormData] = useState({
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
    sources: [] as Array<{
      sourceName: string;
      sourceUrl: string;
      sourceType: SourceType;
      notes?: string;
    }>,
  });

  const loadArticle = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/contributor/articles/${articleId}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load article");
      }

      setArticle(data.data);
      setFormData({
        title: data.data.title || "",
        subtitle: data.data.subtitle || "",
        excerpt: data.data.excerpt || "",
        category: data.data.category || "Tactical Analysis",
        body: data.data.body || "",
        featuredImageUrl: data.data.featuredImageUrl || "",
        featuredImageCaption: data.data.featuredImageCaption || "",
        imageRightsStatus: data.data.imageRightsStatus || ImageRightsStatus.UNKNOWN,
        imageAttribution: data.data.imageAttribution || "",
        seoTitle: data.data.seoTitle || "",
        seoDescription: data.data.seoDescription || "",
        sources: (data.data.sources || []).map((s: any) => ({
          sourceName: s.sourceName,
          sourceUrl: s.sourceUrl,
          sourceType: s.sourceType,
          notes: s.notes || "",
        })),
      });
    } catch (err: any) {
      setError(err.message || "Failed to load draft");
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    if (articleId) loadArticle();
  }, [articleId, loadArticle]);

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

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/contributor/articles/${articleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save draft");
      }

      setSuccessMessage("Draft saved successfully.");
      await loadArticle();
    } catch (err: any) {
      setError(err.message || "Error saving draft");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitReview = async () => {
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // First save current edits
      await fetch(`/api/contributor/articles/${articleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      // Submit for review
      const res = await fetch(`/api/contributor/articles/${articleId}/submit`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit article");
      }

      setSuccessMessage("Article submitted for review!");
      await loadArticle();
    } catch (err: any) {
      setError(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    setError(null);
    try {
      const res = await fetch(`/api/contributor/articles/${articleId}/withdraw`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to withdraw");
      setSuccessMessage("Article withdrawn back to draft.");
      await loadArticle();
    } catch (err: any) {
      setError(err.message || "Withdrawal failed");
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-xs font-mono text-slate-400">
        Loading Newsroom Draft...
      </div>
    );
  }

  const isEditable = article?.status === "DRAFT" || article?.status === "REVISION_REQUIRED";
  const isSubmitted = article?.status === "SUBMITTED" || article?.status === "IN_REVIEW";

  return (
    <div className="py-8 space-y-6">
      <PageContainer>
        {/* Top Navigation & Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-pitch-800">
          <div className="flex items-center gap-3">
            <Link
              href="/contributor"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Desk</span>
            </Link>

            <span className="text-slate-600">/</span>

            <span
              className={cn(
                "px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider font-mono rounded",
                article?.status === "DRAFT" && "bg-pitch-800 text-slate-300",
                article?.status === "SUBMITTED" && "bg-brand-gold/20 text-brand-gold font-bold",
                article?.status === "IN_REVIEW" && "bg-brand-gold/20 text-brand-gold font-bold",
                article?.status === "REVISION_REQUIRED" && "bg-brand-red/20 text-brand-red font-bold",
                article?.status === "APPROVED" && "bg-brand-green/20 text-brand-green font-bold",
                article?.status === "PUBLISHED" && "bg-brand-green/25 text-brand-green font-bold"
              )}
            >
              {article?.status}
            </span>

            <span className="text-xs font-mono text-slate-400">
              {article?.wordCount || 0} words • ~{article?.readTimeMinutes || 1} min read
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isEditable && (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || submitting}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-pitch-850 hover:bg-pitch-800 text-slate-200 border border-pitch-750 disabled:opacity-50 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Saving..." : "Save Draft"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={saving || submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-brand-green hover:bg-brand-green-hover disabled:opacity-50 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? "Submitting..." : "Submit for Review"}</span>
                </button>
              </>
            )}

            {isSubmitted && (
              <button
                type="button"
                onClick={handleWithdraw}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-pitch-850 hover:bg-pitch-800 text-brand-gold border border-pitch-750 transition-colors"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Withdraw to Draft</span>
              </button>
            )}
          </div>
        </div>

        {/* Feedback / Alert Banners */}
        {article?.status === "REVISION_REQUIRED" && article?.reviews?.[0]?.contributorFeedback && (
          <div className="p-4 bg-brand-red/10 border border-brand-red/30 rounded space-y-1">
            <div className="flex items-center gap-2 text-brand-red text-xs font-bold font-mono uppercase">
              <AlertCircle className="w-4 h-4" />
              <span>Editorial Revision Requested</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans pl-6">
              {article.reviews[0].contributorFeedback}
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-brand-red/10 border border-brand-red/30 flex items-start gap-3 text-xs text-brand-red">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="whitespace-pre-line">{error}</div>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-brand-green/10 border border-brand-green/30 flex items-center gap-3 text-xs text-brand-green">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Editor Tabs Navigation */}
        <div className="flex items-center gap-2 border-b border-pitch-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab("content")}
            className={cn(
              "px-4 py-2 border-b-2 font-bold transition-colors",
              activeTab === "content"
                ? "border-brand-green text-brand-green"
                : "border-transparent text-slate-400 hover:text-slate-200"
            )}
          >
            Manuscript & Body
          </button>
          <button
            onClick={() => setActiveTab("sources")}
            className={cn(
              "px-4 py-2 border-b-2 font-bold transition-colors",
              activeTab === "sources"
                ? "border-brand-green text-brand-green"
                : "border-transparent text-slate-400 hover:text-slate-200"
            )}
          >
            Sources ({formData.sources.length})
          </button>
          <button
            onClick={() => setActiveTab("rights")}
            className={cn(
              "px-4 py-2 border-b-2 font-bold transition-colors",
              activeTab === "rights"
                ? "border-brand-green text-brand-green"
                : "border-transparent text-slate-400 hover:text-slate-200"
            )}
          >
            Image Rights ({formData.imageRightsStatus})
          </button>
          <button
            onClick={() => setActiveTab("seo")}
            className={cn(
              "px-4 py-2 border-b-2 font-bold transition-colors",
              activeTab === "seo"
                ? "border-brand-green text-brand-green"
                : "border-transparent text-slate-400 hover:text-slate-200"
            )}
          >
            SEO & Metadata
          </button>
          <button
            onClick={() => setActiveTab("revisions")}
            className={cn(
              "px-4 py-2 border-b-2 font-bold transition-colors",
              activeTab === "revisions"
                ? "border-brand-green text-brand-green"
                : "border-transparent text-slate-400 hover:text-slate-200"
            )}
          >
            Revision History ({article?.revisions?.length || 0})
          </button>
        </div>

        {/* Tab 1: Manuscript Content */}
        {activeTab === "content" && (
          <div className="bg-pitch-900 border border-pitch-800 p-6 space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Headline *
              </label>
              <input
                type="text"
                name="title"
                disabled={!isEditable}
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-pitch-950 border border-pitch-750 px-3 py-2.5 text-slate-100 rounded focus:border-brand-green outline-none font-sans text-base font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Category *
                </label>
                <select
                  name="category"
                  disabled={!isEditable}
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
                  Subtitle / Deck
                </label>
                <input
                  type="text"
                  name="subtitle"
                  disabled={!isEditable}
                  value={formData.subtitle}
                  onChange={handleChange}
                  className="w-full bg-pitch-950 border border-pitch-750 px-3 py-2 text-slate-100 rounded focus:border-brand-green outline-none font-sans"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Summary Excerpt *
              </label>
              <textarea
                name="excerpt"
                rows={2}
                disabled={!isEditable}
                value={formData.excerpt}
                onChange={handleChange}
                className="w-full bg-pitch-950 border border-pitch-750 px-3 py-2 text-slate-100 rounded focus:border-brand-green outline-none font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Article Body (Rich Text / Markdown) *
              </label>
              <textarea
                name="body"
                rows={16}
                disabled={!isEditable}
                value={formData.body}
                onChange={handleChange}
                className="w-full bg-pitch-950 border border-pitch-750 p-4 text-slate-100 rounded focus:border-brand-green outline-none font-sans leading-relaxed text-xs"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Sources */}
        {activeTab === "sources" && (
          <div className="bg-pitch-900 border border-pitch-800 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-pitch-800">
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans">
                  Editorial Reference Sources
                </h4>
                <p className="text-[11px] text-slate-400">
                  Every claim, quote, or tactical stat must cite verifiable original sources.
                </p>
              </div>

              {isEditable && (
                <button
                  type="button"
                  onClick={addSource}
                  className="px-3 py-1 text-xs font-semibold bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 text-slate-200 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Source</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {formData.sources.map((source, index) => (
                <div key={index} className="p-3 bg-pitch-950 border border-pitch-800 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      disabled={!isEditable}
                      placeholder="Source Name"
                      value={source.sourceName}
                      onChange={(e) => handleSourceChange(index, "sourceName", e.target.value)}
                      className="bg-pitch-900 border border-pitch-750 px-2.5 py-1.5 text-slate-200 rounded outline-none"
                    />
                    <input
                      type="url"
                      disabled={!isEditable}
                      placeholder="Source URL"
                      value={source.sourceUrl}
                      onChange={(e) => handleSourceChange(index, "sourceUrl", e.target.value)}
                      className="bg-pitch-900 border border-pitch-750 px-2.5 py-1.5 text-slate-200 rounded outline-none font-mono"
                    />
                    <div className="flex items-center gap-2">
                      <select
                        disabled={!isEditable}
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
                      {isEditable && formData.sources.length > 1 && (
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
        )}

        {/* Tab 3: Image Rights */}
        {activeTab === "rights" && (
          <div className="bg-pitch-900 border border-pitch-800 p-6 space-y-4 text-xs">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans pb-2 border-b border-pitch-800">
              Featured Image Rights Compliance
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Featured Image URL
                </label>
                <input
                  type="url"
                  name="featuredImageUrl"
                  disabled={!isEditable}
                  value={formData.featuredImageUrl}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-pitch-950 border border-pitch-750 px-3 py-2 text-slate-100 rounded focus:border-brand-green outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Rights Clearance Status *
                </label>
                <select
                  name="imageRightsStatus"
                  disabled={!isEditable}
                  value={formData.imageRightsStatus}
                  onChange={handleChange}
                  className="w-full bg-pitch-950 border border-pitch-750 px-3 py-2 text-slate-100 rounded focus:border-brand-green outline-none font-sans"
                >
                  <option value="OWNED">Owned (Author Original)</option>
                  <option value="LICENSED">Licensed (Editorial License)</option>
                  <option value="OFFICIAL_PRESS">Official Press Kit</option>
                  <option value="PUBLIC_DOMAIN">Public Domain</option>
                  <option value="PERMISSION_GRANTED">Permission Granted</option>
                  <option value="UNKNOWN">Unknown (Blocked from Publication)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Attribution & Credit
              </label>
              <input
                type="text"
                name="imageAttribution"
                disabled={!isEditable}
                value={formData.imageAttribution}
                onChange={handleChange}
                placeholder="e.g. Photo by John Doe / Getty Images"
                className="w-full bg-pitch-950 border border-pitch-750 px-3 py-2 text-slate-100 rounded focus:border-brand-green outline-none font-sans"
              />
            </div>
          </div>
        )}

        {/* Tab 4: SEO & Metadata */}
        {activeTab === "seo" && (
          <div className="bg-pitch-900 border border-pitch-800 p-6 space-y-4 text-xs">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans pb-2 border-b border-pitch-800">
              Search Engine & Social Discovery Metadata
            </h4>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  SEO Title *
                </label>
                <input
                  type="text"
                  name="seoTitle"
                  disabled={!isEditable}
                  value={formData.seoTitle}
                  onChange={handleChange}
                  className="w-full bg-pitch-950 border border-pitch-750 px-3 py-2 text-slate-100 rounded focus:border-brand-green outline-none font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  SEO Meta Description *
                </label>
                <textarea
                  name="seoDescription"
                  rows={3}
                  disabled={!isEditable}
                  value={formData.seoDescription}
                  onChange={handleChange}
                  className="w-full bg-pitch-950 border border-pitch-750 px-3 py-2 text-slate-100 rounded focus:border-brand-green outline-none font-sans"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Revisions History */}
        {activeTab === "revisions" && (
          <div className="bg-pitch-900 border border-pitch-800 p-6 space-y-4 text-xs">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans pb-2 border-b border-pitch-800">
              Version History & Change Snapshots
            </h4>

            <div className="divide-y divide-pitch-800">
              {(article?.revisions || []).map((rev: any) => (
                <div key={rev.id} className="py-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-mono font-bold text-brand-green">
                      Revision #{rev.revisionNumber}
                    </span>
                    <p className="text-slate-300">{rev.changeSummary || rev.title}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(rev.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
