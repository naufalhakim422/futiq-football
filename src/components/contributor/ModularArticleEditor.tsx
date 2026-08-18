"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Heading2,
  Heading3,
  Quote,
  List,
  Eye,
  Edit3,
  Layers,
  ChevronUp,
  ChevronDown,
  BarChart2,
  Sparkles,
  AlignLeft,
  Info,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type BlockType =
  | "paragraph"
  | "heading2"
  | "heading3"
  | "image"
  | "quote"
  | "callout"
  | "bullet_list";

export interface ArticleBlock {
  id: string;
  type: BlockType;
  content: string;
  caption?: string;
  attribution?: string;
  quoteAuthor?: string;
  calloutTitle?: string;
}

interface ModularArticleEditorProps {
  initialBody?: string;
  onChange: (fullBody: string) => void;
  featuredImageUrl?: string;
  featuredImageCaption?: string;
  title?: string;
  subtitle?: string;
  category?: string;
}

export function ModularArticleEditor({
  initialBody = "",
  onChange,
  featuredImageUrl,
  featuredImageCaption,
  title,
  subtitle,
  category,
}: ModularArticleEditorProps) {
  const [mode, setMode] = useState<"modular" | "classic" | "preview">("modular");

  // Parse initialBody into blocks if available, or default structure
  const [blocks, setBlocks] = useState<ArticleBlock[]>(() => {
    if (!initialBody.trim()) {
      return [
        {
          id: "b_intro",
          type: "paragraph",
          content: "Tulis paragraf pembuka naskah Anda di sini. Jelaskan latar belakang peristiwa atau pertandingan...",
        },
        {
          id: "b_h2_1",
          type: "heading2",
          content: "1. Analisis Taktik & Pola Serangan",
        },
        {
          id: "b_p_1",
          type: "paragraph",
          content: "Uraikan detail pembahasan taktik, pergerakan posisi pemain kunci, dan dinamika formasi...",
        },
        {
          id: "b_img_1",
          type: "image",
          content: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop",
          caption: "Peta pergerakan dan struktur formasi di lapangan.",
          attribution: "FUTIQ Tactical Data",
        },
        {
          id: "b_quote_1",
          type: "quote",
          content: "Kemenangan ini diraih berkat kedisiplinan transisi dan penguasaan ruang di sepertiga akhir lapangan.",
          quoteAuthor: "Pelatih Kepala",
        },
        {
          id: "b_h2_2",
          type: "heading2",
          content: "2. Kesimpulan & Implikasi Laga",
        },
        {
          id: "b_p_2",
          type: "paragraph",
          content: "Tutup artikel dengan rangkuman hasil, catatan penting untuk laga berikutnya, dan kesimpulan menyeluruh.",
        },
      ];
    }

    // Split basic text by double newlines into blocks
    return [
      {
        id: "b_1",
        type: "paragraph",
        content: initialBody,
      },
    ];
  });

  const [classicText, setClassicText] = useState(initialBody);

  // Convert blocks to full markdown body
  const compileBlocksToMarkdown = (currentBlocks: ArticleBlock[]): string => {
    return currentBlocks
      .map((b) => {
        switch (b.type) {
          case "heading2":
            return `## ${b.content.trim()}`;
          case "heading3":
            return `### ${b.content.trim()}`;
          case "quote":
            return `> "${b.content.trim()}"\n> — *${b.quoteAuthor || "Sumber Wawancara"}*`;
          case "callout":
            return `> [!NOTE]\n> **${b.calloutTitle || "Sorotan Kunci"}**\n> ${b.content.trim()}`;
          case "image":
            return `![${b.caption || "Foto Liputan"}](${b.content.trim()})\n*${b.caption || ""}* ${b.attribution ? `(Foto: ${b.attribution})` : ""}`;
          case "bullet_list":
            return b.content
              .split("\n")
              .map((line) => (line.startsWith("- ") ? line : `- ${line}`))
              .join("\n");
          case "paragraph":
          default:
            return b.content.trim();
        }
      })
      .filter(Boolean)
      .join("\n\n");
  };

  // Notify parent whenever blocks change in modular mode
  const updateBlocksAndSync = (newBlocks: ArticleBlock[]) => {
    setBlocks(newBlocks);
    const compiled = compileBlocksToMarkdown(newBlocks);
    setClassicText(compiled);
    onChange(compiled);
  };

  // Sync initial body on mount if empty
  useEffect(() => {
    if (!initialBody) {
      const compiled = compileBlocksToMarkdown(blocks);
      setClassicText(compiled);
      onChange(compiled);
    }
  }, []);

  // Add a new block of specified type
  const addBlock = (type: BlockType) => {
    const newId = `b_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    let newBlock: ArticleBlock;

    switch (type) {
      case "heading2":
        newBlock = { id: newId, type, content: "Subjudul Bab Baru (H2)" };
        break;
      case "heading3":
        newBlock = { id: newId, type, content: "Sub-poin Pembahasan (H3)" };
        break;
      case "image":
        newBlock = {
          id: newId,
          type,
          content: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop",
          caption: "Keterangan foto atau momen pertandingan...",
          attribution: "FUTIQ Photo Desk",
        };
        break;
      case "quote":
        newBlock = {
          id: newId,
          type,
          content: "Tuliskan kutipan langsung atau pernyataan kunci di sini...",
          quoteAuthor: "Nama Pelatih / Pemain",
        };
        break;
      case "callout":
        newBlock = {
          id: newId,
          type,
          calloutTitle: "Statistik Kunci & Data Lapangan",
          content: "Catatan xG: 2.45 • Penguasaan Bola: 62% • Akurasi Umpan: 88%",
        };
        break;
      case "bullet_list":
        newBlock = {
          id: newId,
          type,
          content: "Poin taktik pertama\nPoin taktik kedua\nPoin taktik ketiga",
        };
        break;
      case "paragraph":
      default:
        newBlock = {
          id: newId,
          type: "paragraph",
          content: "Tuliskan paragraf analisis Anda di sini...",
        };
        break;
    }

    updateBlocksAndSync([...blocks, newBlock]);
  };

  const updateBlockField = (id: string, field: keyof ArticleBlock, val: string) => {
    const next = blocks.map((b) => (b.id === id ? { ...b, [field]: val } : b));
    updateBlocksAndSync(next);
  };

  const removeBlock = (id: string) => {
    if (blocks.length <= 1) return;
    const next = blocks.filter((b) => b.id !== id);
    updateBlocksAndSync(next);
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === blocks.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const next = [...blocks];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    updateBlocksAndSync(next);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Mode Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 bg-pitch-950 border border-pitch-800 rounded-lg">
        <div className="flex items-center gap-1.5 font-sans">
          <button
            type="button"
            onClick={() => setMode("modular")}
            className={cn(
              "px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all",
              mode === "modular"
                ? "bg-[#c3ff00] text-slate-950 shadow-md"
                : "text-slate-400 hover:text-slate-200 hover:bg-pitch-850"
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>🧱 Editor Blok Modular</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("classic")}
            className={cn(
              "px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all",
              mode === "classic"
                ? "bg-[#c3ff00] text-slate-950 shadow-md"
                : "text-slate-400 hover:text-slate-200 hover:bg-pitch-850"
            )}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>✏️ Mode Teks Bebas</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("preview")}
            className={cn(
              "px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all",
              mode === "preview"
                ? "bg-cyan-400 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-slate-200 hover:bg-pitch-850"
            )}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>👁️ Pratinjau Berita</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 self-end sm:self-auto">
          <span>{blocks.length} Elemen Blok</span>
          <span>•</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Tersinkronisasi Otomatis</span>
          </span>
        </div>
      </div>

      {/* MODE 1: MODULAR BLOCKS BUILDER */}
      {mode === "modular" && (
        <div className="space-y-4 font-sans">
          {/* Quick Insert Media & Section Toolbar */}
          <div className="p-3 bg-pitch-900 border border-pitch-800 rounded-lg space-y-2">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#c3ff00]" />
              <span>Tambah Elemen Naskah Baru:</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => addBlock("paragraph")}
                className="px-2.5 py-1.5 bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 hover:border-slate-500 text-slate-200 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <AlignLeft className="w-3.5 h-3.5 text-slate-300" />
                <span>+ Paragraf Teks</span>
              </button>

              <button
                type="button"
                onClick={() => addBlock("heading2")}
                className="px-2.5 py-1.5 bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 hover:border-[#c3ff00]/60 text-slate-200 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Heading2 className="w-3.5 h-3.5 text-[#c3ff00]" />
                <span>+ Subjudul (H2)</span>
              </button>

              <button
                type="button"
                onClick={() => addBlock("heading3")}
                className="px-2.5 py-1.5 bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 hover:border-[#c3ff00]/60 text-slate-200 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Heading3 className="w-3.5 h-3.5 text-[#c3ff00]" />
                <span>+ Sub-poin (H3)</span>
              </button>

              <button
                type="button"
                onClick={() => addBlock("image")}
                className="px-2.5 py-1.5 bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 hover:border-cyan-400 text-slate-200 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>+ Foto / Gambar Taktik</span>
              </button>

              <button
                type="button"
                onClick={() => addBlock("quote")}
                className="px-2.5 py-1.5 bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 hover:border-purple-400 text-slate-200 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Quote className="w-3.5 h-3.5 text-purple-400" />
                <span>+ Kutipan Wawancara</span>
              </button>

              <button
                type="button"
                onClick={() => addBlock("callout")}
                className="px-2.5 py-1.5 bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 hover:border-amber-400 text-slate-200 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
                <span>+ Kotak Statistik / Data</span>
              </button>

              <button
                type="button"
                onClick={() => addBlock("bullet_list")}
                className="px-2.5 py-1.5 bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 hover:border-emerald-400 text-slate-200 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <List className="w-3.5 h-3.5 text-emerald-400" />
                <span>+ Poin Analisis (List)</span>
              </button>
            </div>
          </div>

          {/* Block Stack List */}
          <div className="space-y-3">
            {blocks.map((b, index) => (
              <div
                key={b.id}
                className="p-4 bg-pitch-900 border border-pitch-800 rounded-xl space-y-3 relative group hover:border-pitch-700 transition-all shadow-md"
              >
                {/* Block Header & Reordering Controls */}
                <div className="flex items-center justify-between pb-2 border-b border-pitch-800/80">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-pitch-800 text-slate-300 font-mono text-[10px] font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      {b.type === "paragraph" && <AlignLeft className="w-3.5 h-3.5 text-slate-400" />}
                      {b.type === "heading2" && <Heading2 className="w-3.5 h-3.5 text-[#c3ff00]" />}
                      {b.type === "heading3" && <Heading3 className="w-3.5 h-3.5 text-[#c3ff00]" />}
                      {b.type === "image" && <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />}
                      {b.type === "quote" && <Quote className="w-3.5 h-3.5 text-purple-400" />}
                      {b.type === "callout" && <BarChart2 className="w-3.5 h-3.5 text-amber-400" />}
                      {b.type === "bullet_list" && <List className="w-3.5 h-3.5 text-emerald-400" />}
                      <span>
                        {b.type === "paragraph" && "Paragraf Narasi"}
                        {b.type === "heading2" && "Subjudul Bab (H2)"}
                        {b.type === "heading3" && "Sub-poin Pembahasan (H3)"}
                        {b.type === "image" && "Foto / Gambar Analisis Taktik"}
                        {b.type === "quote" && "Kutipan Sorotan / Wawancara"}
                        {b.type === "callout" && "Kotak Data Statistik"}
                        {b.type === "bullet_list" && "Daftar Poin Analisis"}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveBlock(index, "up")}
                      className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30 rounded hover:bg-pitch-800"
                      title="Geser ke Atas"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={index === blocks.length - 1}
                      onClick={() => moveBlock(index, "down")}
                      className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30 rounded hover:bg-pitch-800"
                      title="Geser ke Bawah"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBlock(b.id)}
                      className="p-1 text-red-400 hover:text-red-300 rounded hover:bg-red-950/40 ml-1"
                      title="Hapus Blok"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Block Content Inputs */}
                {b.type === "paragraph" && (
                  <textarea
                    rows={4}
                    value={b.content}
                    onChange={(e) => updateBlockField(b.id, "content", e.target.value)}
                    placeholder="Tuliskan naskah paragraf di sini..."
                    className="w-full bg-pitch-950 border border-pitch-750 p-3 text-slate-100 focus:border-[#c3ff00] focus:ring-1 focus:ring-[#c3ff00]/30 outline-none font-sans text-xs leading-relaxed rounded"
                  />
                )}

                {b.type === "heading2" && (
                  <input
                    type="text"
                    value={b.content}
                    onChange={(e) => updateBlockField(b.id, "content", e.target.value)}
                    placeholder="Judul Sub-Bab (H2)..."
                    className="w-full bg-pitch-950 border border-pitch-750 px-3.5 py-2.5 text-slate-100 font-bold text-sm focus:border-[#c3ff00] outline-none rounded font-sans"
                  />
                )}

                {b.type === "heading3" && (
                  <input
                    type="text"
                    value={b.content}
                    onChange={(e) => updateBlockField(b.id, "content", e.target.value)}
                    placeholder="Sub-poin Pembahasan (H3)..."
                    className="w-full bg-pitch-950 border border-pitch-750 px-3.5 py-2 text-slate-200 font-semibold text-xs focus:border-[#c3ff00] outline-none rounded font-sans"
                  />
                )}

                {b.type === "image" && (
                  <div className="space-y-3 p-3 bg-pitch-950/60 border border-pitch-800 rounded-lg">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                        URL Gambar / Foto (Link Web / CDN) *
                      </label>
                      <input
                        type="url"
                        value={b.content}
                        onChange={(e) => updateBlockField(b.id, "content", e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-pitch-950 border border-pitch-750 px-3 py-2 text-slate-100 text-xs focus:border-cyan-400 outline-none rounded font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                          Keterangan Foto (Caption)
                        </label>
                        <input
                          type="text"
                          value={b.caption || ""}
                          onChange={(e) => updateBlockField(b.id, "caption", e.target.value)}
                          placeholder="Contoh: Papan formasi Arsenal saat fase transisi"
                          className="w-full bg-pitch-950 border border-pitch-750 px-3 py-2 text-slate-200 text-xs focus:border-cyan-400 outline-none rounded font-sans"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                          Sumber / Kredit Foto (Attribution)
                        </label>
                        <input
                          type="text"
                          value={b.attribution || ""}
                          onChange={(e) => updateBlockField(b.id, "attribution", e.target.value)}
                          placeholder="Contoh: Opta / Reuters / FUTIQ Scouting"
                          className="w-full bg-pitch-950 border border-pitch-750 px-3 py-2 text-slate-200 text-xs focus:border-cyan-400 outline-none rounded font-sans"
                        />
                      </div>
                    </div>

                    {b.content && (
                      <div className="mt-2 relative w-full h-36 rounded overflow-hidden border border-pitch-800 bg-pitch-950">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={b.content}
                          alt={b.caption || "Preview"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {b.type === "quote" && (
                  <div className="space-y-2 p-3 bg-pitch-950/60 border border-purple-900/40 rounded-lg">
                    <textarea
                      rows={2}
                      value={b.content}
                      onChange={(e) => updateBlockField(b.id, "content", e.target.value)}
                      placeholder="Kutipan penting narasumber..."
                      className="w-full bg-pitch-950 border border-pitch-750 p-2.5 text-purple-200 italic focus:border-purple-400 outline-none rounded text-xs"
                    />
                    <input
                      type="text"
                      value={b.quoteAuthor || ""}
                      onChange={(e) => updateBlockField(b.id, "quoteAuthor", e.target.value)}
                      placeholder="Nama Narasumber (misal: Pep Guardiola, Manajer Man City)"
                      className="w-full bg-pitch-950 border border-pitch-750 px-3 py-1.5 text-slate-300 text-[11px] focus:border-purple-400 outline-none rounded font-mono"
                    />
                  </div>
                )}

                {b.type === "callout" && (
                  <div className="space-y-2 p-3 bg-pitch-950/60 border border-amber-900/40 rounded-lg">
                    <input
                      type="text"
                      value={b.calloutTitle || ""}
                      onChange={(e) => updateBlockField(b.id, "calloutTitle", e.target.value)}
                      placeholder="Judul Kotak Statistik..."
                      className="w-full bg-pitch-950 border border-pitch-750 px-3 py-1.5 text-amber-300 font-bold text-xs focus:border-amber-400 outline-none rounded font-sans"
                    />
                    <textarea
                      rows={2}
                      value={b.content}
                      onChange={(e) => updateBlockField(b.id, "content", e.target.value)}
                      placeholder="Rincian angka, metriks, atau poin sorotan..."
                      className="w-full bg-pitch-950 border border-pitch-750 p-2 text-slate-200 focus:border-amber-400 outline-none rounded text-xs"
                    />
                  </div>
                )}

                {b.type === "bullet_list" && (
                  <textarea
                    rows={3}
                    value={b.content}
                    onChange={(e) => updateBlockField(b.id, "content", e.target.value)}
                    placeholder="Tuliskan setiap poin di baris baru..."
                    className="w-full bg-pitch-950 border border-pitch-750 p-3 text-slate-200 focus:border-emerald-400 outline-none rounded text-xs font-mono"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Bottom Add Block Fast Bar */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => addBlock("paragraph")}
              className="px-4 py-2 bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 hover:border-[#c3ff00] text-slate-200 hover:text-[#c3ff00] rounded-lg text-xs font-bold font-mono inline-flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-[#c3ff00]" />
              <span>+ Tambah Paragraf Selanjutnya</span>
            </button>
          </div>
        </div>
      )}

      {/* MODE 2: CLASSIC UNIFIED TEXT EDITOR */}
      {mode === "classic" && (
        <div className="space-y-2 font-sans">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Editor Teks Penuh (Markdown Didukung)</span>
            <span>Gunakan ## untuk H2, ### untuk H3, &gt; untuk kutipan</span>
          </div>
          <textarea
            rows={18}
            value={classicText}
            onChange={(e) => {
              setClassicText(e.target.value);
              onChange(e.target.value);
            }}
            placeholder="Tuliskan naskah lengkap Anda di sini..."
            className="w-full bg-pitch-950 border border-pitch-750 p-4 text-slate-100 focus:border-[#c3ff00] focus:ring-1 focus:ring-[#c3ff00]/30 outline-none font-mono text-xs leading-relaxed rounded-xl"
          />
        </div>
      )}

      {/* MODE 3: LIVE ARTICLE PREVIEW */}
      {mode === "preview" && (
        <div className="bg-pitch-900 border border-pitch-800 rounded-xl p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-950/60 border border-cyan-800 text-cyan-400 text-[10px] font-mono font-bold uppercase tracking-widest rounded">
            <Eye className="w-3 h-3" />
            <span>Pratinjau Langsung Publikasi Berita</span>
          </div>

          {/* Article Header Preview */}
          <div className="space-y-3 pb-4 border-b border-pitch-800">
            <span className="text-xs font-bold uppercase tracking-wider text-[#c3ff00] font-mono">
              {category || "Tactical Analysis"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-sans tracking-tight leading-tight">
              {title || "Judul Utama Artikel / Headline"}
            </h1>
            {subtitle && (
              <p className="text-sm text-slate-300 font-sans leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* Featured Hero Image Preview if provided */}
          {featuredImageUrl && (
            <div className="space-y-2">
              <div className="relative w-full h-64 sm:h-80 rounded-lg overflow-hidden border border-pitch-800 bg-pitch-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featuredImageUrl}
                  alt={title || "Featured"}
                  className="w-full h-full object-cover"
                />
              </div>
              {featuredImageCaption && (
                <p className="text-[11px] text-slate-400 italic text-center font-sans">
                  {featuredImageCaption}
                </p>
              )}
            </div>
          )}

          {/* Rendered Block Flow */}
          <div className="space-y-6 text-sm text-slate-200 font-sans leading-relaxed pt-2">
            {blocks.map((b) => {
              if (b.type === "heading2") {
                return (
                  <h2 key={b.id} className="text-lg sm:text-xl font-bold text-slate-100 pt-4 border-b border-pitch-800 pb-2">
                    {b.content}
                  </h2>
                );
              }
              if (b.type === "heading3") {
                return (
                  <h3 key={b.id} className="text-base font-bold text-[#c3ff00] pt-2">
                    {b.content}
                  </h3>
                );
              }
              if (b.type === "image") {
                return (
                  <div key={b.id} className="my-5 space-y-2 bg-pitch-950 p-2 rounded-lg border border-pitch-800">
                    <div className="relative w-full h-56 sm:h-72 rounded overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={b.content} alt={b.caption || "Image"} className="w-full h-full object-cover" />
                    </div>
                    {(b.caption || b.attribution) && (
                      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 px-2 py-1 font-sans">
                        <span className="italic">{b.caption}</span>
                        {b.attribution && (
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                            Foto: {b.attribution}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              }
              if (b.type === "quote") {
                return (
                  <blockquote key={b.id} className="my-5 p-4 border-l-4 border-[#c3ff00] bg-pitch-950 rounded-r-lg space-y-1">
                    <p className="text-slate-100 font-medium italic text-sm">
                      &ldquo;{b.content}&rdquo;
                    </p>
                    {b.quoteAuthor && (
                      <span className="text-xs text-[#c3ff00] font-mono block">
                        — {b.quoteAuthor}
                      </span>
                    )}
                  </blockquote>
                );
              }
              if (b.type === "callout") {
                return (
                  <div key={b.id} className="my-5 p-4 bg-amber-950/20 border border-amber-800/60 rounded-lg space-y-1.5">
                    <div className="text-xs font-bold text-amber-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span>{b.calloutTitle || "Statistik Pertandingan"}</span>
                    </div>
                    <p className="text-xs text-slate-200 font-mono leading-relaxed whitespace-pre-line">
                      {b.content}
                    </p>
                  </div>
                );
              }
              if (b.type === "bullet_list") {
                return (
                  <ul key={b.id} className="list-disc list-inside space-y-1 text-slate-300 pl-2">
                    {b.content.split("\n").map((item, idx) => (
                      <li key={idx}>{item.replace(/^- /, "")}</li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={b.id} className="text-slate-300 leading-relaxed whitespace-pre-line">
                  {b.content}
                </p>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
