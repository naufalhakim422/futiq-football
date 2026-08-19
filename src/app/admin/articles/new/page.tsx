"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { useRouter } from "next/navigation";
import { ImageRightsStatus, SourceType } from "@prisma/client";
import {
  Plus,
  Trash2,
  Send,
  ArrowLeft,
  AlertCircle,
  FileText,
  Shield,
  Link2,
  Sparkles,
  Flame,
  Star,
  CheckCircle2,
  Clock,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { calculateReadTime } from "@/lib/security/sanitizer";
import { ModularArticleEditor } from "@/components/contributor/ModularArticleEditor";
import { cn } from "@/lib/utils";

export default function AdminNewArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any>(null);

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
    isBreaking: boolean;
    isFeatured: boolean;
    instantPublish: boolean;
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
    featuredImageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop",
    featuredImageCaption: "Ruang Analisis & Berita FUTIQ FOOTBALL",
    imageRightsStatus: ImageRightsStatus.OWNED,
    imageAttribution: "Redaksi FUTIQ FOOTBALL",
    isBreaking: false,
    isFeatured: true,
    instantPublish: true,
    seoTitle: "",
    seoDescription: "",
    sources: [
      {
        sourceName: "FUTIQ Global Football Intelligence Desk",
        sourceUrl: "https://futiq.com",
        sourceType: SourceType.OFFICIAL,
        notes: "Verifikasi langsung meja redaksi",
      },
    ],
  });

  const { wordCount, readTimeMinutes } = calculateReadTime(formData.body || "");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal membuat artikel admin.");
      }

      setSuccessData(data.data);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memproses naskah.");
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="py-12 md:py-16">
        <PageContainer>
          <div className="max-w-xl mx-auto bg-pitch-900 border border-pitch-800 p-8 sm:p-10 shadow-2xl text-center space-y-6 rounded-2xl">
            <div className="w-16 h-16 bg-[#c3ff00]/10 border border-[#c3ff00]/30 text-[#c3ff00] flex items-center justify-center mx-auto rounded-full">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest bg-pitch-850 text-[#c3ff00] border border-pitch-750 rounded">
                Status • {successData.status}
              </span>
              <h2 className="text-2xl font-bold text-slate-100 font-sans tracking-tight">
                {formData.instantPublish
                  ? "Artikel Berhasil Diterbitkan ke Publik!"
                  : "Draf Artikel Admin Berhasil Disimpan!"}
              </h2>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto font-sans">
              Naskah Anda telah diproses dengan hak istimewa Super Admin. Artikel kini dapat diakses langsung oleh seluruh pembaca global.
            </p>

            <div className="p-4 bg-pitch-950 border border-pitch-800 text-left text-xs font-mono space-y-2 rounded-xl text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Judul:</span>
                <span className="text-slate-200 font-bold truncate max-w-[280px]">{formData.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kategori:</span>
                <span className="text-[#c3ff00] font-semibold">{formData.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">URL Slug:</span>
                <span className="text-cyan-400 truncate max-w-[280px]">/news/{successData.slug}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 font-sans">
              <Link
                href={`/news/${successData.slug}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 bg-[#c3ff00] hover:bg-[#b0e600] rounded-xl transition-all shadow-lg"
              >
                <Eye className="w-4 h-4" />
                <span>Lihat Berita Live</span>
              </Link>
              <Link
                href="/admin"
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-3 text-xs font-semibold text-slate-300 hover:text-white bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 rounded-xl transition-colors"
              >
                <span>Kembali ke Admin Hub</span>
              </Link>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8 font-sans">
      <PageContainer>
        {/* Navigation Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-pitch-800">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Pusat Admin</span>
          </Link>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="px-2.5 py-0.5 rounded bg-brand-red/10 border border-brand-red/30 text-brand-red font-bold text-[10px] uppercase tracking-wider">
              Mode Rilis Super Admin
            </span>
            <span>•</span>
            <span>Jumlah Kata: <strong className="text-slate-200">{wordCount}</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#c3ff00]" />
              <span>~{readTimeMinutes} menit baca</span>
            </span>
          </div>
        </div>

        <SectionHeader
          title="Studio Penulisan & Publikasi Berita Admin"
          subtitle="Tulis analisis editorial resmi, rilis berita langsung ke beranda tanpa antrean, dan atur sorotan Breaking News"
          badgeText="Admin Editorial Studio"
        />

        {error && (
          <div className="p-4 bg-brand-red/10 border border-brand-red/30 flex items-center gap-3 text-xs text-brand-red font-mono rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 text-xs">
          {/* Admin Priority & Publishing Options Banner */}
          <div className="bg-pitch-900 border border-[#c3ff00]/40 p-5 sm:p-6 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center gap-2 pb-2 border-b border-pitch-800">
              <Sparkles className="w-4 h-4 text-[#c3ff00]" />
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
                Opsi Prioritas Distribusi & Publikasi Admin
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Toggle Instant Publish */}
              <label className="p-3.5 bg-pitch-950 border border-pitch-800 rounded-xl flex items-start gap-3 cursor-pointer hover:border-[#c3ff00]/60 transition-colors">
                <input
                  type="checkbox"
                  name="instantPublish"
                  checked={formData.instantPublish}
                  onChange={handleChange}
                  className="mt-0.5 accent-[#c3ff00] w-4 h-4 rounded"
                />
                <div className="space-y-0.5">
                  <div className="text-slate-200 font-bold flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-[#c3ff00]" />
                    <span>Langsung Terbitkan (Live)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-normal leading-relaxed">
                    Langsung tampil di beranda publik tanpa melewati antrean review.
                  </p>
                </div>
              </label>

              {/* Toggle Featured Story */}
              <label className="p-3.5 bg-pitch-950 border border-pitch-800 rounded-xl flex items-start gap-3 cursor-pointer hover:border-amber-400/60 transition-colors">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="mt-0.5 accent-amber-400 w-4 h-4 rounded"
                />
                <div className="space-y-0.5">
                  <div className="text-slate-200 font-bold flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    <span>Berita Unggulan (Hero)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-normal leading-relaxed">
                    Tampil di sorotan utama (Hero Banner) pada halaman depan.
                  </p>
                </div>
              </label>

              {/* Toggle Breaking News */}
              <label className="p-3.5 bg-pitch-950 border border-pitch-800 rounded-xl flex items-start gap-3 cursor-pointer hover:border-brand-red/60 transition-colors">
                <input
                  type="checkbox"
                  name="isBreaking"
                  checked={formData.isBreaking}
                  onChange={handleChange}
                  className="mt-0.5 accent-red-500 w-4 h-4 rounded"
                />
                <div className="space-y-0.5">
                  <div className="text-slate-200 font-bold flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-brand-red" />
                    <span>Breaking News Priority</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-normal leading-relaxed">
                    Aktifkan lencana merah & prioritas ticker siaran langsung.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Main Editorial Details */}
          <div className="bg-pitch-900 border border-pitch-800 p-6 sm:p-8 space-y-6 rounded-2xl shadow-xl">
            <div className="flex items-center gap-2 pb-2 border-b border-pitch-800">
              <FileText className="w-4 h-4 text-[#c3ff00]" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Judul & Detail Berita
              </h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px] font-mono">
                  Judul Utama / Headline *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Contoh: Analisis Taktik: Mengapa Formasi 3-2-4-1 Merajai Kompetisi Eropa Musim Ini"
                  className="w-full bg-pitch-950 border border-pitch-750 p-3.5 text-slate-100 focus:border-[#c3ff00] focus:ring-1 focus:ring-[#c3ff00]/30 outline-none font-sans text-base font-bold rounded-xl transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px] font-mono">
                    Kategori Liputan *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-pitch-950 border border-pitch-750 px-3.5 py-2.5 text-slate-100 focus:border-[#c3ff00] outline-none font-sans rounded-xl transition-all"
                  >
                    <option value="Tactical Analysis">Tactical Analysis</option>
                    <option value="Match Reports">Match Reports</option>
                    <option value="Transfer Center">Transfer Center</option>
                    <option value="European Football">European Football</option>
                    <option value="Club Features">Club Features</option>
                    <option value="Finance & Governance">Finance & Governance</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px] font-mono">
                    Subjudul / Deck (Opsional)
                  </label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleChange}
                    placeholder="Kalimat penjelas pendukung judul utama..."
                    className="w-full bg-pitch-950 border border-pitch-750 px-3.5 py-2.5 text-slate-100 focus:border-[#c3ff00] outline-none font-sans rounded-xl transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px] font-mono">
                  Ringkasan Singkat / Lead Excerpt *
                </label>
                <textarea
                  name="excerpt"
                  rows={2}
                  value={formData.excerpt}
                  onChange={handleChange}
                  placeholder="Ringkasan 2-3 kalimat yang akan muncul pada kartu berita dan media sosial..."
                  className="w-full bg-pitch-950 border border-pitch-750 p-3 text-slate-100 focus:border-[#c3ff00] outline-none font-sans leading-relaxed rounded-xl"
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

          {/* Featured Hero Image & Rights */}
          <div className="bg-pitch-900 border border-pitch-800 p-6 sm:p-8 space-y-6 rounded-2xl shadow-xl">
            <div className="flex items-center gap-2 pb-2 border-b border-pitch-800">
              <Shield className="w-4 h-4 text-[#c3ff00]" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Foto Utama & Hak Cipta Gambar (Hero Image)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px] font-mono">
                  URL Foto Utama *
                </label>
                <input
                  type="url"
                  name="featuredImageUrl"
                  value={formData.featuredImageUrl}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-pitch-950 border border-pitch-750 px-3.5 py-2.5 text-slate-100 focus:border-[#c3ff00] outline-none font-mono text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px] font-mono">
                  Keterangan Gambar (Caption)
                </label>
                <input
                  type="text"
                  name="featuredImageCaption"
                  value={formData.featuredImageCaption}
                  onChange={handleChange}
                  placeholder="Contoh: Suasana latihan taktik jelang pertandingan akbar"
                  className="w-full bg-pitch-950 border border-pitch-750 px-3.5 py-2.5 text-slate-100 focus:border-[#c3ff00] outline-none font-sans rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Citations Section */}
          <div className="bg-pitch-900 border border-pitch-800 p-6 sm:p-8 space-y-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-pitch-800">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-[#c3ff00]" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  Sumber Rujukan & Verifikasi Berita ({formData.sources.length})
                </h3>
              </div>

              <button
                type="button"
                onClick={addSource}
                className="px-3 py-1.5 text-xs font-semibold bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 text-slate-200 flex items-center gap-1.5 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#c3ff00]" />
                <span>Tambah Rujukan</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.sources.map((src, idx) => (
                <div key={idx} className="p-3 bg-pitch-950 border border-pitch-800 rounded-xl space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={src.sourceName}
                      onChange={(e) => handleSourceChange(idx, "sourceName", e.target.value)}
                      placeholder="Nama Sumber (misal: UEFA Official Statement)"
                      className="w-full bg-pitch-900 border border-pitch-750 px-3 py-2 text-slate-100 focus:border-[#c3ff00] outline-none rounded-lg text-xs"
                    />
                    <input
                      type="url"
                      value={src.sourceUrl}
                      onChange={(e) => handleSourceChange(idx, "sourceUrl", e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-pitch-900 border border-pitch-750 px-3 py-2 text-slate-100 focus:border-[#c3ff00] outline-none rounded-lg font-mono text-xs"
                    />
                    <div className="flex items-center gap-2">
                      <select
                        value={src.sourceType}
                        onChange={(e) => handleSourceChange(idx, "sourceType", e.target.value)}
                        className="w-full bg-pitch-900 border border-pitch-750 px-3 py-2 text-slate-100 focus:border-[#c3ff00] outline-none rounded-lg text-xs"
                      >
                        <option value={SourceType.OFFICIAL}>OFFICIAL</option>
                        <option value={SourceType.INTERVIEW}>INTERVIEW</option>
                        <option value={SourceType.PRESS_RELEASE}>PRESS_RELEASE</option>
                        <option value={SourceType.FOOTBALL_DATA}>FOOTBALL_DATA</option>
                        <option value={SourceType.NEWS_REPORT}>NEWS_REPORT</option>
                      </select>

                      {formData.sources.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSource(idx)}
                          className="p-2 text-red-400 hover:text-red-300 rounded hover:bg-red-950/40"
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

          {/* Form Actions Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
            <Link
              href="/admin"
              className="w-full sm:w-auto px-5 py-3 text-xs font-semibold text-slate-300 hover:text-white bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 rounded-xl transition-colors text-center"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-[#c3ff00] hover:bg-[#b0e600] rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-slate-950" />
              <span>{loading ? "Menerbitkan Naskah..." : formData.instantPublish ? "Publikasikan Berita Sekarang 🚀" : "Simpan Draf Berita"}</span>
            </button>
          </div>
        </form>
      </PageContainer>
    </div>
  );
}
