"use client";

import React, { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";

interface SocialShareBarProps {
  title: string;
  url?: string;
}

export function SocialShareBar({ title, url }: SocialShareBarProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== "undefined" ? url || window.location.href : url || "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleShare = (platform: string) => {
    let target = "";
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);

    switch (platform) {
      case "whatsapp":
        target = `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case "x":
        target = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
        break;
      case "facebook":
        target = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "telegram":
        target = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        break;
    }

    if (target) {
      window.open(target, "_blank", "noopener,noreferrer,width=600,height=400");
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap text-xs">
      <span className="text-slate-400 font-semibold flex items-center gap-1.5 mr-1">
        <Share2 className="w-3.5 h-3.5 text-brand-green" /> Share:
      </span>

      <button
        onClick={() => handleShare("whatsapp")}
        className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-medium transition-colors"
        aria-label="Share on WhatsApp"
      >
        WhatsApp
      </button>

      <button
        onClick={() => handleShare("x")}
        className="px-2.5 py-1.5 rounded-lg bg-pitch-900 border border-pitch-800 text-slate-300 hover:text-white hover:border-slate-700 font-medium transition-colors"
        aria-label="Share on X"
      >
        X / Twitter
      </button>

      <button
        onClick={() => handleShare("facebook")}
        className="px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 font-medium transition-colors"
        aria-label="Share on Facebook"
      >
        Facebook
      </button>

      <button
        onClick={() => handleShare("telegram")}
        className="px-2.5 py-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 font-medium transition-colors"
        aria-label="Share on Telegram"
      >
        Telegram
      </button>

      <button
        onClick={handleCopy}
        className="px-2.5 py-1.5 rounded-lg bg-pitch-900 border border-pitch-800 text-slate-400 hover:text-slate-200 font-medium transition-colors flex items-center gap-1"
        aria-label="Copy article link"
      >
        {copied ? (
          <>
            <Check className="w-3 h-3 text-brand-green" /> Copied
          </>
        ) : (
          <>
            <Copy className="w-3 h-3" /> Copy Link
          </>
        )}
      </button>
    </div>
  );
}
