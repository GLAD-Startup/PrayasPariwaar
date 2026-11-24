"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Newspaper,
  Tv,
  ExternalLink,
  Calendar,
  ZoomIn,
  Play,
  Film,
  Layers,
  X,
  Share2,
  ArrowRight,
} from "lucide-react";
import { assetPath } from "@/lib/api";
import {
  parseMediaImages,
  extractYouTubeId,
  getYouTubeThumbnail,
  isVideoLink,
} from "@/lib/media";

interface MediaItem {
  id: string;
  title: string;
  type: string;
  source?: string | null;
  url?: string | null;
  imageUrl?: string | null;
  publishedDate?: string | Date | null;
  createdAt: string | Date;
}

interface MediaListClientProps {
  mediaItems: MediaItem[];
  selectedType?: string;
}

export default function MediaListClient({
  mediaItems,
  selectedType,
}: MediaListClientProps) {
  const [activeVideoModal, setActiveVideoModal] = useState<string | null>(null);

  // Separate top featured news story from grid
  const featuredItem = mediaItems.length > 0 ? mediaItems[0] : null;
  const regularItems = mediaItems.length > 1 ? mediaItems.slice(1) : [];

  return (
    <div className="space-y-10">
      {/* 1. FEATURED BREAKING/MAJOR STORY SPOTLIGHT (Attracts Maximum Attention) */}
      {featuredItem && !selectedType && (
        <div className="rounded-3xl border border-prayas-rule bg-gradient-to-br from-stone-900 to-emerald-950 text-white overflow-hidden shadow-2xl relative group">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            {/* Visual Media Column (Left) */}
            <div className="lg:col-span-7 relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto lg:h-full min-h-[280px] sm:min-h-[360px] bg-black overflow-hidden">
              {(() => {
                const images = parseMediaImages(featuredItem.imageUrl);
                const ytId = extractYouTubeId(featuredItem.url);
                const displayThumb =
                  images[0] ||
                  (ytId
                    ? getYouTubeThumbnail(ytId, "maxres")
                    : "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80");
                const isVideo =
                  featuredItem.type === "ELECTRONIC" || isVideoLink(featuredItem.url);

                return (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={assetPath(displayThumb)}
                      alt={featuredItem.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-stone-900" />

                    {/* Format Badge */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500 text-stone-950 flex items-center gap-1.5 shadow-lg">
                        ★ Featured Coverage
                      </span>
                      {isVideo ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-600 text-white flex items-center gap-1 shadow-md">
                          <Play className="w-3 h-3 fill-white" /> TV Broadcast
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/70 text-white backdrop-blur-md flex items-center gap-1 shadow-md">
                          <Newspaper className="w-3 h-3 text-amber-400" /> Press Clipping
                        </span>
                      )}
                    </div>

                    {/* Interactive Play Button for Video */}
                    {isVideo && featuredItem.url && (
                      <button
                        type="button"
                        onClick={() => setActiveVideoModal(featuredItem.url!)}
                        className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/45 transition-colors cursor-pointer group/btn"
                        title="Watch full broadcast"
                      >
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl group-hover/btn:scale-110 transition-transform">
                          <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white translate-x-0.5" />
                        </div>
                      </button>
                    )}

                    {/* Multi-page badge */}
                    {images.length > 1 && (
                      <span className="absolute bottom-4 right-4 px-2.5 py-1 rounded-lg bg-black/85 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm border border-white/20">
                        <Layers className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{images.length} Scanned Pages</span>
                      </span>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Editorial Story Column (Right) */}
            <div className="lg:col-span-5 p-6 sm:p-8 lg:pr-10 space-y-4">
              <div className="flex items-center gap-2.5 text-xs text-emerald-300">
                <span className="font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-200">
                  {featuredItem.source || "Official Press Release"}
                </span>
                {featuredItem.publishedDate && (
                  <span className="flex items-center gap-1 text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    {new Date(featuredItem.publishedDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                <Link
                  href={`/media/${featuredItem.id}`}
                  className="hover:text-emerald-200 transition-colors"
                >
                  {featuredItem.title}
                </Link>
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                Documented coverage by regional journalists reporting on Prayas Pariwaar’s transparent seva interventions across Mathura and Vrindavan.
              </p>

              <div className="pt-3 flex flex-wrap items-center gap-3">
                <Link
                  href={`/media/${featuredItem.id}`}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
                >
                  <span>Read Full Press Article</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {featuredItem.url && isVideoLink(featuredItem.url) && (
                  <button
                    type="button"
                    onClick={() => setActiveVideoModal(featuredItem.url!)}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-white/20"
                  >
                    <Play className="w-3.5 h-3.5 fill-white text-red-500" />
                    <span>Watch Video</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. REGULAR PRESS STORIES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {(selectedType ? mediaItems : regularItems).map((item) => {
          const isPrint = item.type === "PRINT";
          const images = parseMediaImages(item.imageUrl);
          const ytId = extractYouTubeId(item.url);
          const isVideo = item.type === "ELECTRONIC" || isVideoLink(item.url);

          const displayImage =
            images[0] ||
            (ytId
              ? getYouTubeThumbnail(ytId, "maxres")
              : isPrint
              ? "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80"
              : "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80");

          return (
            <article
              key={item.id}
              className="border border-prayas-rule bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1"
            >
              {/* MEDIA CLIPPING IMAGE PREVIEW */}
              <div className="relative aspect-[16/10] bg-prayas-stone overflow-hidden border-b border-prayas-rule">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={assetPath(displayImage)}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Format Badge Overlay */}
                <span
                  className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm flex items-center gap-1 ${
                    isPrint
                      ? "bg-black/75 text-white"
                      : "bg-blue-900/85 text-white"
                  }`}
                >
                  {isPrint ? (
                    <Newspaper className="w-3 h-3 text-amber-400" />
                  ) : (
                    <Tv className="w-3 h-3 text-cyan-400" />
                  )}
                  <span>{isPrint ? "Press Clipping" : "TV Broadcast"}</span>
                </span>

                {/* Multiple Images Badge */}
                {images.length > 1 && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/80 text-white backdrop-blur-md border border-emerald-500/40 flex items-center gap-1 shadow-sm">
                    <Layers className="w-3 h-3 text-emerald-400" />
                    <span>{images.length} Pages</span>
                  </span>
                )}

                {/* Play Button Overlay for Video Broadcasts */}
                {isVideo && item.url && (
                  <button
                    type="button"
                    onClick={() => setActiveVideoModal(item.url!)}
                    className="absolute inset-0 flex items-center justify-center bg-black/25 hover:bg-black/45 transition-colors cursor-pointer group/btn"
                    title="Watch news video"
                  >
                    <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover/btn:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-white translate-x-0.5" />
                    </div>
                  </button>
                )}

                {/* Click to Expand Link overlay */}
                {images.length > 0 && (
                  <Link
                    href={`/media/${item.id}`}
                    className="absolute bottom-3 right-3 p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 shadow cursor-pointer"
                    title="Open Full News Coverage"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Link>
                )}
              </div>

              {/* Content Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  {/* Meta: Source & Date */}
                  <div className="flex items-center justify-between text-[11px] text-prayas-muted">
                    <span className="font-bold text-prayas-ink px-2 py-0.5 rounded bg-prayas-stone border border-prayas-rule">
                      {item.source || (isPrint ? "Print Media" : "Broadcast")}
                    </span>

                    {item.publishedDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-prayas-neem" />
                        {new Date(item.publishedDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>

                  {/* Headline */}
                  <h2 className="font-serif text-base font-bold text-prayas-ink group-hover:text-prayas-neem transition-colors leading-snug line-clamp-3">
                    <Link href={`/media/${item.id}`}>{item.title}</Link>
                  </h2>
                </div>

                {/* Action Links */}
                <div className="pt-3 border-t border-prayas-rule flex items-center justify-between">
                  <Link
                    href={`/media/${item.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E5339] hover:underline"
                  >
                    <span>Read Full Story</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {isVideo && item.url ? (
                    <button
                      type="button"
                      onClick={() => setActiveVideoModal(item.url!)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-red-600" />
                      <span>Watch</span>
                    </button>
                  ) : item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 hover:underline"
                    >
                      <span>Press Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* 3. INTERACTIVE VIDEO PLAYER MODAL */}
      {activeVideoModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActiveVideoModal(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/20 aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveVideoModal(null)}
              className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close Video"
            >
              <X className="w-5 h-5" />
            </button>
            {extractYouTubeId(activeVideoModal) ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${extractYouTubeId(activeVideoModal)}?autoplay=1&rel=0`}
                title="Press Broadcast Video"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={assetPath(activeVideoModal)}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
