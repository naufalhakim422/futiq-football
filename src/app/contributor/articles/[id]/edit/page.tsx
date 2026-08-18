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
  Clock,
  Link2,
  Globe,
  HelpCircle,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { calculateReadTime } from "@/lib/security/sanitizer";
import { ModularArticleEditor } from "@/components/contributor/ModularArticleEditor";

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
    changeSummary: string;
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
    changeSummary: "",
    sources: [],
  });

  const { wordCount, readTimeMinutes } = calculateReadTime(formData.body || "");

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
        changeSummary: "",
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

      setSuccessMessage("Manuscript draft saved and version revision recorded.");
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

      setSuccessMessage("Article manuscript submitted to Editorial Review Queue!");
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
      setSuccessMessage("Article withdrawn back to draft state.");
      await loadArticle();
    } catch (err: any) {
      setError(err.message || "Withdrawal failed");
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3 font-mono text-xs text-slate-400">
        <div className="w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full animate-spin mx-auto" />
        <p>Loading Manuscript Studio...</p>
      </div>
    );
  }

  const isEditable = article?.status === "DRAFT" || article?.status === "REVISION_REQUIRED";
  const isSubmitted = article?.status === "SUBMITTED" || article?.status === "IN_REVIEW";

  return (
    <div className="py-8 space-y-6">
      <PageContainer>
        {/* Newsroom Top Bar */}
        <div className="bg-pitch-900 border border-pitch-800 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/contributor"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Desk</span>
            </Link>

            <span className="text-slate-700">|</span>

            <span
              className={cn(
                "px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider font-mono border",
                article?.status === "DRAFT" && "bg-pitch-800 text-slate-300 border-pitch-700",
                article?.status === "SUBMITTED" && "bg-brand-gold/15 text-brand-gold border-brand-gold/30 font-bold",
                article?.status === "IN_REVIEW" && "bg-brand-gold/15 text-brand-gold border-brand-gold/30 font-bold",
                article?.status === "REVISION_REQUIRED" && "bg-brand-red/15 text-brand-red border-brand-red/30 font-bold",
                article?.status === "APPROVED" && "bg-brand-green/15 text-brand-green border-brand-green/30 font-bold",
                article?.status === "PUBLISHED" && "bg-brand-green/25 text-brand-green border-brand-green/40 font-bold"
              )}
            >
              {article?.status}
            </span>

            <span className="text-xs font-mono text-slate-400">
              {wordCount} words • ~{readTimeMinutes} min read
            </span>
          </div>

          {/* Action Group */}
          <div className="flex flex-wrap items-center gap-2.5">
            {isEditable && (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-pitch-850 hover:bg-pitch-800 text-slate-200 border border-pitch-750 disabled:opacity-50 transition-colors active:scale-[0.99]"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Saving..." : "Save Draft"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={saving || submitting}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 bg-brand-green hover:bg-brand-green-hover disabled:opacity-50 transition-all shadow-md active:scale-[0.99]"
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
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-pitch-850 hover:bg-pitch-800 text-brand-gold border border-pitch-750 transition-colors active:scale-[0.99]"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Withdraw to Draft</span>
              </button>
            )}
          </div>
        </div>

        {/* Editorial Revision Memorandum Banner */}
        {article?.status === "REVISION_REQUIRED" && article?.reviews?.[0]?.contributorFeedback && (
          <div className="p-5 bg-brand-red/10 border-l-4 border-l-brand-red border border-brand-red/30 space-y-2 shadow-lg">
            <div className="flex items-center gap-2 text-brand-red text-xs font-bold font-mono uppercase tracking-wider">
              <AlertCircle className="w-4 h-4" />
              <span>Editorial Revision Memorandum from Desk</span>
            </div>
            <p className="text-xs text-slate-100 leading-relaxed font-sans pl-6 italic">
              &ldquo;{article.reviews[0].contributorFeedback}&rdquo;
            </p>
            <p className="text-[10px] text-slate-400 font-mono pl-6">
              Please address the notes above in your manuscript and click &ldquo;Submit for Review&rdquo; once updated.
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-brand-red/10 border border-brand-red/30 flex items-start gap-3 text-xs text-brand-red font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="whitespace-pre-line">{error}</div>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-brand-green/10 border border-brand-green/30 flex items-center gap-3 text-xs text-brand-green font-mono">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Editor Tabs Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-pitch-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab("content")}
            className={cn(
              "px-4 py-2.5 border-b-2 font-bold transition-colors flex items-center gap-2",
              activeTab === "content"
                ? "border-brand-green text-brand-green bg-pitch-900/50"
                : "border-transparent text-slate-400 hover:text-slate-200"
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Manuscript & Body</span>
          </button>

          <button
            onClick={() => setActiveTab("sources")}
            className={cn(
              "px-4 py-2.5 border-b-2 font-bold transition-colors flex items-center gap-2",
              activeTab === "sources"
                ? "border-brand-green text-brand-green bg-pitch-900/50"
                : "border-transparent text-slate-400 hover:text-slate-200"
            )}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Sources ({formData.sources.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("rights")}
            className={cn(
              "px-4 py-2.5 border-b-2 font-bold transition-colors flex items-center gap-2",
              activeTab === "rights"
                ? "border-brand-green text-brand-green bg-pitch-900/50"
                : "border-transparent text-slate-400 hover:text-slate-200"
            )}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Image Rights ({formData.imageRightsStatus})</span>
          </button>

          <button
            onClick={() => setActiveTab("seo")}
            className={cn(
              "px-4 py-2.5 border-b-2 font-bold transition-colors flex items-center gap-2",
              activeTab === "seo"
                ? "border-brand-green text-brand-green bg-pitch-900/50"
                : "border-transparent text-slate-400 hover:text-slate-200"
            )}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>SEO & Discovery</span>
          </button>

          <button
            onClick={() => setActiveTab("revisions")}
            className={cn(
              "px-4 py-2.5 border-b-2 font-bold transition-colors flex items-center gap-2",
              activeTab === "revisions"
                ? "border-brand-green text-brand-green bg-pitch-900/50"
                : "border-transparent text-slate-400 hover:text-slate-200"
            )}
          >
            <History className="w-3.5 h-3.5" />
            <span>Revisions History ({article?.revisions?.length || 0})</span>
          </button>
        </div>

        {/* Tab 1: Manuscript Content */}
        {activeTab === "content" && (
          <div className="bg-pitch-900 border border-pitch-800 p-6 sm:p-8 space-y-6 shadow-xl text-xs">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Headline *
                </label>
                <input
                  type="text"
                  name="title"
                  disabled={!isEditable}
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-pitch-950 border border-pitch-750 p-3.5 text-slate-100 focus:border-brand-green outline-none font-sans text-base font-bold transition-all disabled:opacity-70"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    Category Beat *
                  </label>
                  <select
                    name="category"
                    disabled={!isEditable}
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-pitch-950 border border-pitch-750 px-3.5 py-2.5 text-slate-100 focus:border-brand-green outline-none font-sans transition-all disabled:opacity-70"
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
                    Subtitle / Deck
                  </label>
                  <input
                    type="text"
                    name="subtitle"
                    disabled={!isEditable}
                    value={formData.subtitle}
                    onChange={handleChange}
                    className="w-full bg-pitch-950 border border-pitch-750 px-3.5 py-2.5 text-slate-100 focus:border-brand-green outline-none font-sans transition-all disabled:opacity-70"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Summary Excerpt *
                </label>
                <textarea
                  name="excerpt"
                  rows={2}
                  disabled={!isEditable}
                  value={formData.excerpt}
                  onChange={handleChange}
                  className="w-full bg-pitch-950 border border-pitch-750 p-3 text-slate-100 focus:border-brand-green outline-none font-sans leading-relaxed disabled:opacity-70"
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

              {isEditable && (
                <div className="space-y-1.5 pt-2 border-t border-pitch-800">
                  <label className="font-bold text-slate-400 uppercase tracking-wider text-[10px] font-mono">
                    Revision Change Summary (Optional description for next snapshot)
                  </label>
                  <input
                    type="text"
                    name="changeSummary"
                    value={formData.changeSummary}
                    onChange={handleChange}
                    placeholder="e.g. Added tactical pressing data and revised conclusion"
                    className="w-full bg-pitch-950 border border-pitch-800 px-3 py-2 text-slate-300 focus:border-brand-green outline-none font-mono text-xs"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Sources */}
        {activeTab === "sources" && (
          <div className="bg-pitch-900 border border-pitch-800 p-6 sm:p-8 space-y-6 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-pitch-800">
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans">
                  Editorial Reference Sources ({formData.sources.length})
                </h4>
                <p className="text-[11px] text-slate-400">
                  Every claim, quote, or tactical stat must cite verifiable original sources.
                </p>
              </div>

              {isEditable && (
                <button
                  type="button"
                  onClick={addSource}
                  className="px-3 py-1.5 text-xs font-semibold bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 text-slate-200 flex items-center gap-1.5 transition-colors active:scale-[0.99]"
                >
                  <Plus className="w-3.5 h-3.5 text-brand-green" />
                  <span>Add Source</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {formData.sources.map((source, index) => (
                <div key={index} className="p-4 bg-pitch-950 border border-pitch-800 space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase">Source Name *</label>
                      <input
                        type="text"
                        disabled={!isEditable}
                        placeholder="Source Name"
                        value={source.sourceName}
                        onChange={(e) => handleSourceChange(index, "sourceName", e.target.value)}
                        className="w-full bg-pitch-900 border border-pitch-750 px-3 py-2 text-slate-200 focus:border-brand-green outline-none disabled:opacity-70"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase">Source URL *</label>
                      <input
                        type="url"
                        disabled={!isEditable}
                        placeholder="Source URL"
                        value={source.sourceUrl}
                        onChange={(e) => handleSourceChange(index, "sourceUrl", e.target.value)}
                        className="w-full bg-pitch-900 border border-pitch-750 px-3 py-2 text-slate-200 focus:border-brand-green outline-none font-mono disabled:opacity-70"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase">Source Type *</label>
                      <div className="flex items-center gap-2">
                        <select
                          disabled={!isEditable}
                          value={source.sourceType}
                          onChange={(e) => handleSourceChange(index, "sourceType", e.target.value)}
                          className="w-full bg-pitch-900 border border-pitch-750 px-3 py-2 text-slate-200 focus:border-brand-green outline-none disabled:opacity-70"
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
        )}

        {/* Tab 3: Image Rights */}
        {activeTab === "rights" && (
          <div className="bg-pitch-900 border border-pitch-800 p-6 sm:p-8 space-y-6 shadow-xl text-xs">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans pb-2 border-b border-pitch-800">
              Featured Image & Rights Clearance
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
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
                  className="w-full bg-pitch-950 border border-pitch-750 px-3.5 py-2.5 text-slate-100 focus:border-brand-green outline-none font-mono disabled:opacity-70"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Rights Clearance Status *
                </label>
                <select
                  name="imageRightsStatus"
                  disabled={!isEditable}
                  value={formData.imageRightsStatus}
                  onChange={handleChange}
                  className="w-full bg-pitch-950 border border-pitch-750 px-3.5 py-2.5 text-slate-100 focus:border-brand-green outline-none font-sans disabled:opacity-70"
                >
                  <option value="OWNED">Owned (Author Original Photography/Graphic)</option>
                  <option value="LICENSED">Licensed (Editorial Media License)</option>
                  <option value="OFFICIAL_PRESS">Official Club Press Kit</option>
                  <option value="PUBLIC_DOMAIN">Public Domain</option>
                  <option value="PERMISSION_GRANTED">Permission Granted</option>
                  <option value="UNKNOWN">Unknown (Blocks Review Submission)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
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
                className="w-full bg-pitch-950 border border-pitch-750 px-3.5 py-2.5 text-slate-100 focus:border-brand-green outline-none font-sans disabled:opacity-70"
              />
            </div>
          </div>
        )}

        {/* Tab 4: SEO & Metadata */}
        {activeTab === "seo" && (
          <div className="bg-pitch-900 border border-pitch-800 p-6 sm:p-8 space-y-6 shadow-xl text-xs">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans pb-2 border-b border-pitch-800">
              Search Engine & Social Discovery Metadata
            </h4>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  SEO Title *
                </label>
                <input
                  type="text"
                  name="seoTitle"
                  disabled={!isEditable}
                  value={formData.seoTitle}
                  onChange={handleChange}
                  className="w-full bg-pitch-950 border border-pitch-750 px-3.5 py-2.5 text-slate-100 focus:border-brand-green outline-none font-sans disabled:opacity-70"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  SEO Meta Description *
                </label>
                <textarea
                  name="seoDescription"
                  rows={3}
                  disabled={!isEditable}
                  value={formData.seoDescription}
                  onChange={handleChange}
                  className="w-full bg-pitch-950 border border-pitch-750 p-3 text-slate-100 focus:border-brand-green outline-none font-sans leading-relaxed disabled:opacity-70"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Revisions History */}
        {activeTab === "revisions" && (
          <div className="bg-pitch-900 border border-pitch-800 p-6 sm:p-8 space-y-6 shadow-xl text-xs">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans pb-2 border-b border-pitch-800">
              Version History & Snapshot Log ({article?.revisions?.length || 0})
            </h4>

            {(!article?.revisions || article.revisions.length === 0) ? (
              <p className="text-xs text-slate-500 font-mono">No revision snapshots recorded yet.</p>
            ) : (
              <div className="divide-y divide-pitch-800 border border-pitch-800">
                {article.revisions.map((rev: any) => (
                  <div key={rev.id} className="p-4 bg-pitch-950 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-brand-green text-xs">
                          Revision #{rev.revisionNumber}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(rev.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-200 text-xs font-sans">
                        {rev.changeSummary || rev.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
