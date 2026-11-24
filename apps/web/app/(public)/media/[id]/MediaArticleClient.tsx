"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  X,
  Play,
  Film,
  Layers,
  Share2,
  Check,
  Copy,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import { assetPath } from "@/lib/api";

interface MediaArticleClientProps {
  images: string[];
  title: string;
  source: string;
  externalUrl?: string | null;
  videoEmbedUrl?: string | null;
  youtubeId?: string | null;
  isDirectVideo?: boolean;
}

export default function MediaArticleClient({
  images,
  title,
  source,
  externalUrl,
  videoEmbedUrl,
  youtubeId,
  isDirectVideo,
}: MediaArticleClientProps) {
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxZoomed, setLightboxZoomed] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeImage = images[activePageIndex] || images[0] || null;

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareText = encodeURIComponent(
    `Read press coverage on Prayas Pariwaar: "${title}" (${source})`
  );
  const shareUrl =
    typeof window !== "undefined"
      ? encodeURIComponent(window.location.href)
      : "";

  return (
    <div className="space-y-8">
      {/* 1. MEDIA SHOWCASE SECTION */}
      {videoEmbedUrl || youtubeId ? (
        /* A: CINEMATIC VIDEO BROADCAST PLAYER */
        <div className="rounded-3xl overflow-hidden border border-prayas-rule bg-black shadow-2xl relative aspect-video">
          <iframe
            src={videoEmbedUrl || `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : isDirectVideo && externalUrl ? (
        /* B: DIRECT VIDEO PLAYER */
        <div className="rounded-3xl overflow-hidden border border-prayas-rule bg-black shadow-2xl relative aspect-video">
          <video
            src={assetPath(externalUrl)}
            controls
            playsInline
            className="w-full h-full object-contain"
          />
        </div>
      ) : activeImage ? (
        /* C: HIGH-RESOLUTION PRINT CLIPPING VIEWER */
        <div className="space-y-4">
          <div className="relative rounded-3xl overflow-hidden border border-prayas-rule bg-stone-900 shadow-xl group">
            {/* Scanned Image Display */}
            <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-stone-950 flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={assetPath(activeImage)}
                alt={`${title} - Page ${activePageIndex + 1}`}
                className="w-full h-full object-contain cursor-zoom-in"
                onClick={() => setLightboxOpen(true)}
              />

              {/* Top Page Indicator & Zoom Action */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-black/75 text-white backdrop-blur-md border border-white/20 shadow-md">
                  {images.length > 1
                    ? `Page ${activePageIndex + 1} of ${images.length}`
                    : "Archived Press Scan"}
                </span>

                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="pointer-events-auto px-3 py-1.5 rounded-full bg-black/75 hover:bg-black text-white text-xs font-bold backdrop-blur-md border border-white/20 shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Click to Zoom Fullscreen"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                  <span>Enlarge Scan</span>
                </button>
              </div>

              {/* Prev / Next Page Overlay Arrows (When multi-page) */}
              {images.length > 1 && (
                <>
                  {activePageIndex > 0 && (
                    <button
                      type="button"
                      onClick={() => setActivePageIndex((prev) => prev - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-all shadow-lg cursor-pointer"
                      title="Previous Page"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                  )}
                  {activePageIndex < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => setActivePageIndex((prev) => prev + 1)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-all shadow-lg cursor-pointer"
                      title="Next Page"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Bottom Caption Bar */}
            <div className="p-3 sm:p-4 bg-stone-900 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-300">
              <span className="font-medium text-stone-300">
                Official press archive verified by Prayas Pariwaar Secretariat
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={assetPath(activeImage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Raw File</span>
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Inspect High-Res</span>
                </button>
              </div>
            </div>
          </div>

          {/* MULTI-PAGE THUMBNAIL RIBBON */}
          {images.length > 1 && (
            <div className="p-3 bg-white rounded-2xl border border-prayas-rule shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-prayas-ink px-1">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-700" />
                  <span>Document Pages ({images.length} Scans Attached)</span>
                </span>
                <span className="text-[11px] text-prayas-muted font-normal">
                  Click a page below to view
                </span>
              </div>

              <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-1">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePageIndex(idx)}
                    className={`relative w-20 sm:w-24 aspect-[4/3] rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      activePageIndex === idx
                        ? "border-emerald-600 ring-2 ring-emerald-500/40 scale-105"
                        : "border-prayas-rule opacity-70 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={assetPath(imgUrl)}
                      alt={`Page ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-black/80 text-white text-[9px] font-bold">
                      Page {idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* 2. VIRAL SOCIAL SHARING BAR */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-prayas-rule shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
            <Share2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <span className="font-bold text-xs text-prayas-ink block">
              Share this News Report
            </span>
            <span className="text-[11px] text-prayas-muted">
              Help spread awareness of transparent seva in Vrindavan
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* WhatsApp */}
          <a
            href={`https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <span>WhatsApp</span>
          </a>

          {/* Facebook */}
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-[#1877F2] hover:bg-[#1465d2] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <span>Facebook</span>
          </a>

          {/* Twitter / X */}
          <a
            href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-black hover:bg-stone-800 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-sm transition-all"
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

      {/* 3. FULLSCREEN ZOOM LIGHTBOX MODAL */}
      {lightboxOpen && activeImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Lightbox Header Bar */}
          <div
            className="flex items-center justify-between pb-3 text-white border-b border-white/20 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold truncate max-w-md">
                {title}
              </span>
              {images.length > 1 && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20">
                  Page {activePageIndex + 1} of {images.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLightboxZoomed((prev) => !prev)}
                className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title={lightboxZoomed ? "Zoom Out" : "Zoom In (2x)"}
              >
                {lightboxZoomed ? (
                  <>
                    <ZoomOut className="w-4 h-4" />
                    <span>Fit to Screen</span>
                  </>
                ) : (
                  <>
                    <ZoomIn className="w-4 h-4" />
                    <span>Zoom 2x</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Image Stage */}
          <div
            className="flex-1 overflow-auto flex items-center justify-center p-2 sm:p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={assetPath(activeImage)}
              alt={title}
              className={`max-w-none transition-all duration-300 ${
                lightboxZoomed
                  ? "w-[180%] sm:w-[150%] max-w-none cursor-zoom-out"
                  : "max-h-[85vh] max-w-full object-contain cursor-zoom-in"
              }`}
              onClick={() => setLightboxZoomed((prev) => !prev)}
            />
          </div>

          {/* Lightbox Footer Navigation */}
          {images.length > 1 && (
            <div
              className="flex items-center justify-center gap-3 pt-3 border-t border-white/20 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                disabled={activePageIndex === 0}
                onClick={() => setActivePageIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Previous Page
              </button>
              <span className="text-xs text-white/80 font-mono">
                {activePageIndex + 1} / {images.length}
              </span>
              <button
                type="button"
                disabled={activePageIndex === images.length - 1}
                onClick={() =>
                  setActivePageIndex((prev) => Math.min(images.length - 1, prev + 1))
                }
                className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer flex items-center gap-1"
              >
                Next Page <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
