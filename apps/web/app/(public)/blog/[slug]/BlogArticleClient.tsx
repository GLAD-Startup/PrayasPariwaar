"use client";

import { useState, useEffect } from "react";
import {
  Share2,
  Copy,
  Check,
  ZoomIn,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import { assetPath } from "@/lib/api";

interface BlogArticleClientProps {
  title: string;
  images: Array<{ id: string; url: string; caption?: string | null }>;
}

export default function BlogArticleClient({
  title,
  images,
}: BlogArticleClientProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  // Scroll Progress indicator
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      if (windowHeight > 0) {
        const scroll = (totalScroll / windowHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, scroll)));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareText = encodeURIComponent(`"${title}" - Prayas Pariwaar Field Journal`);
  const shareUrl =
    typeof window !== "undefined"
      ? encodeURIComponent(window.location.href)
      : "";

  return (
    <>
      {/* 1. TOP STICKY READING PROGRESS BAR */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-stone-200 pointer-events-none">
        <div
          className="h-full bg-emerald-700 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* 2. FLOATING / INLINE SOCIAL SHARE BAR */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-prayas-rule shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
            <Share2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <span className="font-bold text-xs text-prayas-ink block">
              Share This Field Dispatch
            </span>
            <span className="text-[11px] text-prayas-muted">
              Inspire friends & family with transparent grassroots seva
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* WhatsApp */}
          <a
            href={`https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-xs transition-all"
          >
            <span>WhatsApp</span>
          </a>

          {/* Facebook */}
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-[#1877F2] hover:bg-[#1465d2] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-xs transition-all"
          >
            <span>Facebook</span>
          </a>

          {/* Twitter / X */}
          <a
            href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-black hover:bg-stone-800 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-xs transition-all"
          >
            <span>Share on X</span>
          </a>

          {/* Copy Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-prayas-stone hover:bg-slate-200 text-prayas-ink border border-prayas-rule text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-600" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. FIELD GALLERY WITH ZOOM LIGHTBOX */}
      {images.length > 0 && (
        <section className="space-y-4 pt-4">
          <div className="border-b border-prayas-rule pb-3 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-prayas-ink flex items-center gap-2">
                <span>Field Photographs ({images.length} Captures)</span>
              </h2>
              <p className="text-xs text-prayas-muted mt-0.5">
                Click any photograph to enlarge and inspect details
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Verified Seva Captures
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {images.map((img, idx) => (
              <div
                key={img.id}
                className="border border-prayas-rule rounded-2xl overflow-hidden bg-prayas-stone shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div
                  className="relative aspect-[4/3] overflow-hidden bg-slate-950 cursor-pointer"
                  onClick={() => setActivePhotoIndex(idx)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={assetPath(img.url)}
                    alt={img.caption || title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                      <ZoomIn className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/75 text-white text-[10px] font-mono">
                    #{idx + 1}
                  </span>
                </div>
                {img.caption && (
                  <p className="p-3 text-xs text-prayas-muted leading-relaxed border-t border-prayas-rule bg-white">
                    {img.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. PHOTO LIGHTBOX MODAL */}
      {activePhotoIndex !== null && images[activePhotoIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col p-4 animate-in fade-in duration-200"
          onClick={() => setActivePhotoIndex(null)}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between pb-3 text-white border-b border-white/20 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs font-semibold text-white/80">
              Photo {activePhotoIndex + 1} of {images.length}
            </span>
            <button
              type="button"
              onClick={() => setActivePhotoIndex(null)}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Image Stage */}
          <div
            className="flex-1 overflow-auto flex items-center justify-center p-2 sm:p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={assetPath(images[activePhotoIndex].url)}
              alt={images[activePhotoIndex].caption || title}
              className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Footer Navigation */}
          <div
            className="flex items-center justify-between pt-3 border-t border-white/20 text-white text-xs shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-slate-300 italic truncate max-w-md">
              {images[activePhotoIndex].caption || title}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={activePhotoIndex === 0}
                onClick={() => setActivePhotoIndex((prev) => (prev !== null ? Math.max(0, prev - 1) : null))}
                className="px-3.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <button
                type="button"
                disabled={activePhotoIndex === images.length - 1}
                onClick={() =>
                  setActivePhotoIndex((prev) => (prev !== null ? Math.min(images.length - 1, prev + 1) : null))
                }
                className="px-3.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer flex items-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
