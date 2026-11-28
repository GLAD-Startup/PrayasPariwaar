"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Newspaper,
  Tv,
  ExternalLink,
  Calendar,
  ZoomIn,
  Play,
  Layers,
  X,
  Search,
  ArrowRight,
  Filter,
} from "lucide-react";
import { assetPath } from "@/lib/api";
import {
  parseMediaImages,
  extractYouTubeId,
  getYouTubeThumbnail,
  isVideoLink,
} from "@/lib/media";

export interface MediaListItem {
  id: string;
  title: string;
  type: string;
  source?: string | null;
  url?: string | null;
  imageUrl?: string | null;
  publishedDate?: string | null;
  createdAt: string;
}

interface MediaListClientProps {
  mediaItems: MediaListItem[];
  selectedType?: string;
}

export default function MediaListClient({
  mediaItems,
  selectedType,
}: MediaListClientProps) {
  const [activeVideoModal, setActiveVideoModal] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<string>("ALL");

  // Extract distinct newspaper / broadcast sources
  const sourceOptions = useMemo(() => {
    const set = new Set<string>();
    mediaItems.forEach((item) => {
      if (item.source && item.source.trim()) {
        set.add(item.source.trim());
      }
    });
    return Array.from(set).sort();
  }, [mediaItems]);

  // Filter media items by search query and publication source
  const filteredItems = useMemo(() => {
    return mediaItems.filter((item) => {
      // Source filter
      if (selectedSource !== "ALL") {
        if (!item.source || item.source.trim() !== selectedSource) {
          return false;
        }
      }

      // Search keyword filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesSource = (item.source || "").toLowerCase().includes(query);
        if (!matchesTitle && !matchesSource) return false;
      }

      return true;
    });
  }, [mediaItems, selectedSource, searchQuery]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Search & Publication Filter Toolbar */}
      <div className="bg-white border border-prayas-rule rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Keyword Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-prayas-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news headline, publication or keywords..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-prayas-rule text-xs sm:text-sm bg-prayas-stone/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2E5339]/20 focus:border-[#2E5339] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-prayas-muted hover:text-prayas-ink"
              >
                Clear
              </button>
            )}
          </div>

          {/* Results Summary */}
          <div className="text-xs text-prayas-muted shrink-0 flex items-center justify-between sm:justify-end gap-2">
            <span>
              Showing <strong className="text-prayas-ink">{filteredItems.length}</strong> of {mediaItems.length} clippings
            </span>
          </div>
        </div>

        {/* Publication Chips (if multiple sources exist) */}
        {sourceOptions.length > 0 && (
          <div className="pt-2 border-t border-prayas-rule/60 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin text-xs">
            <span className="text-[11px] font-semibold text-prayas-muted uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-prayas-neem" /> Sources:
            </span>

            <button
              type="button"
              onClick={() => setSelectedSource("ALL")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                selectedSource === "ALL"
                  ? "bg-[#2E5339] text-white"
                  : "bg-prayas-stone text-prayas-ink hover:bg-stone-200"
              }`}
            >
              All Publications
            </button>

            {sourceOptions.map((source) => (
              <button
                key={source}
                type="button"
                onClick={() => setSelectedSource(source)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                  selectedSource === source
                    ? "bg-[#2E5339] text-white"
                    : "bg-prayas-stone text-prayas-ink hover:bg-stone-200"
                }`}
              >
                {source}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Balanced Press Coverage Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center text-prayas-muted bg-white border border-prayas-rule rounded-2xl space-y-3">
          <Newspaper className="w-10 h-10 text-prayas-muted mx-auto opacity-40" />
          <p className="text-sm font-medium text-prayas-ink">No media coverage matches your search filter.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedSource("ALL");
            }}
            className="text-xs font-bold text-[#2E5339] hover:underline"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredItems.map((item) => {
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

            const formattedDate = item.publishedDate
              ? new Date(item.publishedDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : null;

            return (
              <article
                key={item.id}
                itemScope
                itemType="https://schema.org/NewsArticle"
                className="border border-prayas-rule bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group hover:-translate-y-0.5"
              >
                {/* Media Image / Newspaper Clipping Preview */}
                <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden border-b border-prayas-rule">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={assetPath(displayImage)}
                    alt={item.title}
                    itemProp="image"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Format Indicator Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-xs flex items-center gap-1 ${
                        isPrint
                          ? "bg-black/80 text-white"
                          : "bg-red-700/90 text-white"
                      }`}
                    >
                      {isPrint ? (
                        <Newspaper className="w-3 h-3 text-amber-400" />
                      ) : (
                        <Tv className="w-3 h-3 text-white" />
                      )}
                      <span>{isPrint ? "Press Clipping" : "TV Coverage"}</span>
                    </span>
                  </div>

                  {/* Multi-page indicator */}
                  {images.length > 1 && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/80 text-white backdrop-blur-md border border-white/20 flex items-center gap-1 shadow-xs">
                      <Layers className="w-3 h-3 text-emerald-400" />
                      <span>{images.length} Pages</span>
                    </span>
                  )}

                  {/* Play Button for Video Broadcasts */}
                  {isVideo && item.url && (
                    <button
                      type="button"
                      onClick={() => setActiveVideoModal(item.url!)}
                      className="absolute inset-0 flex items-center justify-center bg-black/25 hover:bg-black/40 transition-colors cursor-pointer group/btn"
                      title="Watch news broadcast"
                      aria-label="Watch news broadcast"
                    >
                      <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover/btn:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-white translate-x-0.5" />
                      </div>
                    </button>
                  )}

                  {/* Zoom/Expand button */}
                  {images.length > 0 && (
                    <Link
                      href={`/media/${item.id}`}
                      className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-opacity opacity-0 group-hover:opacity-100 shadow cursor-pointer"
                      title="View High-Res Clipping"
                      aria-label="View High-Res Clipping"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Link>
                  )}
                </div>

                {/* Card Editorial Information */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5">
                  <div className="space-y-2">
                    {/* Publication & Date Bar */}
                    <div className="flex items-center justify-between text-xs text-prayas-muted gap-2">
                      <span
                        itemProp="author"
                        className="font-bold text-prayas-ink px-2.5 py-0.5 rounded-md bg-stone-100 border border-stone-200 truncate max-w-[65%]"
                      >
                        {item.source || (isPrint ? "Print Media" : "Broadcast")}
                      </span>

                      {formattedDate && (
                        <time
                          dateTime={item.publishedDate || item.createdAt}
                          itemProp="datePublished"
                          className="flex items-center gap-1 text-[11px] shrink-0 font-medium text-prayas-muted"
                        >
                          <Calendar className="w-3 h-3 text-prayas-neem" />
                          <span>{formattedDate}</span>
                        </time>
                      )}
                    </div>

                    {/* Headline - Balanced Journalistic Scale */}
                    <h2
                      itemProp="headline"
                      className="font-serif text-base sm:text-lg font-bold text-prayas-ink group-hover:text-prayas-neem transition-colors leading-snug line-clamp-2"
                    >
                      <Link href={`/media/${item.id}`}>{item.title}</Link>
                    </h2>
                  </div>

                  {/* Card Action Footer */}
                  <div className="pt-3 border-t border-prayas-rule flex items-center justify-between">
                    <Link
                      href={`/media/${item.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E5339] hover:text-[#23422d] transition-colors"
                    >
                      <span>Read Coverage</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>

                    {isVideo && item.url ? (
                      <button
                        type="button"
                        onClick={() => setActiveVideoModal(item.url!)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-red-600" />
                        <span>Watch Video</span>
                      </button>
                    ) : item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-prayas-ink"
                      >
                        <span>Original Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Video Modal Player */}
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
              aria-label="Close Video"
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
