"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  Image as ImageIcon,
  Layers,
  MapPin,
  Calendar,
  X,
  Share2,
  Heart,
  ChevronRight,
  RefreshCw,
  ArrowLeft,
  FolderOpen,
  Film,
  Play,
  Video,
} from "lucide-react";
import { isVideoUrl } from "@/lib/media";

const CATEGORIES = [
  "All",
  "Free Education",
  "Blood Donation",
  "Plantation",
  "Jeev Jal Seva",
  "Vocational Training",
];

function GalleryContent() {
  const searchParams = useSearchParams();
  const urlAlbumId = searchParams?.get("albumId");
  const urlCategory = searchParams?.get("category");

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [mediaTypeFilter, setMediaTypeFilter] = useState<"ALL" | "PHOTO" | "VIDEO">("ALL");
  const [albums, setAlbums] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState<any | null>(null);
  const [activeAlbum, setActiveAlbum] = useState<any | null>(null);

  useEffect(() => {
    fetchGalleryData();
  }, []);

  useEffect(() => {
    if (urlAlbumId && albums.length > 0) {
      const found = albums.find((a: any) => a.id === urlAlbumId || a.slug === urlAlbumId);
      if (found) setActiveAlbum(found);
    } else if (urlCategory && CATEGORIES.includes(urlCategory)) {
      setSelectedCategory(urlCategory);
      setActiveAlbum(null);
    }
  }, [urlAlbumId, urlCategory, albums]);

  const fetchGalleryData = () => {
    setLoading(true);
    apiFetch("/api/gallery")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const dbAlbums = json.data.albums || [];
          const dbPhotos = json.data.recentPhotos || [];
          setAlbums(dbAlbums);
          setPhotos(dbPhotos);

          if (urlAlbumId) {
            const found = dbAlbums.find((a: any) => a.id === urlAlbumId || a.slug === urlAlbumId);
            if (found) setActiveAlbum(found);
          } else if (urlCategory && CATEGORIES.includes(urlCategory)) {
            setSelectedCategory(urlCategory);
          }
        } else {
          setAlbums([]);
          setPhotos([]);
        }
      })
      .catch((err) => {
        console.warn("Failed to load gallery from database:", err);
        setAlbums([]);
        setPhotos([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const filteredAlbums = albums.filter(
    (a) => selectedCategory === "All" || a.category === selectedCategory
  );

  const filteredPhotos = photos.filter((p) => {
    if (selectedCategory !== "All" && p.category !== selectedCategory) return false;
    const isVideo = isVideoUrl(p.url);
    if (mediaTypeFilter === "PHOTO" && isVideo) return false;
    if (mediaTypeFilter === "VIDEO" && !isVideo) return false;
    return true;
  });

  // Photos & videos belonging to the currently open active album
  const rawAlbumPhotos = activeAlbum
    ? (activeAlbum.photos && activeAlbum.photos.length > 0
        ? activeAlbum.photos
        : photos.filter((p: any) => p.albumId === activeAlbum.id))
    : [];

  const albumPhotos = rawAlbumPhotos.filter((p: any) => {
    const isVideo = isVideoUrl(p.url);
    if (mediaTypeFilter === "PHOTO" && isVideo) return false;
    if (mediaTypeFilter === "VIDEO" && !isVideo) return false;
    return true;
  });

  return (
    <div className="space-y-8 sm:space-y-12 pb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
      {/* Page Header */}
      <div className="border-b border-prayas-rule pb-6 sm:pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900">
          <ImageIcon className="w-3.5 h-3.5 text-emerald-700" />
          <span>Moments of Nishkam Seva • Prayas Pariwaar</span>
        </div>
        <h1 className="font-serif text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold text-prayas-ink leading-tight">
          Photos & Videos Gallery
        </h1>
        <p className="text-sm sm:text-base text-prayas-muted leading-relaxed max-w-2xl">
          Explore on-ground photography and field video chronicles from our core seva initiatives across Mathura, Vrindavan, and Braj region.
        </p>
      </div>

      {/* Filter Bars: Categories & Media Type */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-prayas-rule pb-4">
        {/* Category Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setActiveAlbum(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                selectedCategory === cat && !activeAlbum
                  ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                  : "bg-white text-prayas-ink border-prayas-rule hover:bg-prayas-stone"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Media Type Switcher: All / Photos / Videos */}
        <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setMediaTypeFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              mediaTypeFilter === "ALL"
                ? "bg-white text-emerald-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Media
          </button>
          <button
            type="button"
            onClick={() => setMediaTypeFilter("PHOTO")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              mediaTypeFilter === "PHOTO"
                ? "bg-white text-emerald-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Photos
          </button>
          <button
            type="button"
            onClick={() => setMediaTypeFilter("VIDEO")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              mediaTypeFilter === "VIDEO"
                ? "bg-white text-emerald-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Film className="w-3.5 h-3.5 text-amber-600" />
            Videos
          </button>
        </div>
      </div>

      {/* DEDICATED ACTIVE ALBUM VIEW */}
      {activeAlbum ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Back button & Album Header */}
          <div className="p-6 rounded-2xl bg-white border border-prayas-rule shadow-sm space-y-4">
            <button
              onClick={() => setActiveAlbum(null)}
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-lg border border-emerald-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Albums</span>
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    {activeAlbum.category}
                  </span>
                  <span className="text-xs text-prayas-muted">
                    {albumPhotos.length} {albumPhotos.length === 1 ? "Photo" : "Photos"}
                  </span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-prayas-ink">
                  {activeAlbum.title}
                </h2>
                {activeAlbum.description && (
                  <p className="text-sm text-prayas-muted max-w-3xl leading-relaxed">
                    {activeAlbum.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Album Photos & Videos Grid */}
          {albumPhotos.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-prayas-rule text-prayas-muted space-y-3">
              <FolderOpen className="w-10 h-10 text-emerald-700 mx-auto opacity-40" />
              <p className="text-sm font-medium text-prayas-ink">No media found in this album</p>
              <p className="text-xs text-prayas-muted max-w-md mx-auto">
                Any photos or videos uploaded for projects or events linked to this album will automatically appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {albumPhotos.map((photo: any) => (
                <div
                  key={photo.id || photo.url}
                  onClick={() => setActivePhoto(photo)}
                  className="bg-slate-900 border border-prayas-rule rounded-xl overflow-hidden shadow-sm group aspect-square relative cursor-pointer hover:shadow-md transition-all"
                >
                  {isVideoUrl(photo.url) ? (
                    <div className="relative w-full h-full bg-black">
                      <video
                        src={photo.url}
                        muted
                        preload="metadata"
                        className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white border border-white/30 group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-white translate-x-0.5" />
                        </div>
                      </div>
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-600/90 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                        <Film className="w-2.5 h-2.5" /> Video
                      </span>
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo.url}
                      alt={photo.title || activeAlbum.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-end text-white">
                    <span className="text-[11px] font-bold line-clamp-1">{photo.title || activeAlbum.title}</span>
                    <span className="text-[9px] text-slate-300">{photo.location || "Mathura / Vrindavan"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-prayas-ink">Fetching field captures from database...</p>
        </div>
      ) : filteredAlbums.length === 0 && filteredPhotos.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-white border border-prayas-rule shadow-sm space-y-3">
          <ImageIcon className="w-12 h-12 text-emerald-700/40 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-prayas-ink">
            No photos in {selectedCategory === "All" ? "gallery" : selectedCategory}
          </h3>
          <p className="text-xs text-prayas-muted max-w-md mx-auto">
            All photos and albums in the gallery are linked directly to verified database records.
            New ground captures will appear here once published via the Admin Panel.
          </p>
        </div>
      ) : (
        <>
          {/* Featured Albums Section */}
          {filteredAlbums.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-serif text-xl font-bold text-prayas-ink flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-700" />
                <span>Featured Seva Albums</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAlbums.map((album) => (
                  <div
                    key={album.id}
                    onClick={() => setActiveAlbum(album)}
                    className="bg-white border border-prayas-rule rounded-2xl overflow-hidden shadow-card group hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-48 bg-slate-100 relative overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={album.coverImage}
                          alt={album.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                          {album.category}
                        </div>
                        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-prayas-ink text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                          📷 {album.photoCount || album.photos?.length || 0} Photos
                        </div>
                      </div>

                      <div className="p-5 space-y-2">
                        <h3 className="font-serif text-base font-bold text-prayas-ink line-clamp-1 group-hover:text-emerald-800 transition-colors">
                          {album.title}
                        </h3>
                        <p className="text-xs text-prayas-muted line-clamp-2 leading-relaxed">
                          {album.description || `Field photography collection for ${album.title}.`}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <div className="pt-3 flex items-center justify-between text-[11px] text-prayas-muted border-t border-prayas-rule">
                        <span>{album.date || "Ongoing"}</span>
                        <span className="text-emerald-700 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>View Album</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Photos & Videos Grid */}
          {filteredPhotos.length > 0 && (
            <div className="space-y-4 pt-4">
              <h2 className="font-serif text-xl font-bold text-prayas-ink flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-emerald-700" />
                <span>
                  {mediaTypeFilter === "VIDEO"
                    ? "Field Videos Grid"
                    : mediaTypeFilter === "PHOTO"
                    ? "Recent Photos Grid"
                    : "Recent Photos & Videos Grid"}
                </span>
                <span className="text-xs font-normal text-prayas-muted font-mono">
                  ({filteredPhotos.length})
                </span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {filteredPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => setActivePhoto(photo)}
                    className="bg-slate-900 border border-prayas-rule rounded-xl overflow-hidden shadow-sm group aspect-square relative cursor-pointer hover:shadow-md transition-all"
                  >
                    {isVideoUrl(photo.url) ? (
                      <div className="relative w-full h-full bg-black">
                        <video
                          src={photo.url}
                          muted
                          preload="metadata"
                          className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white border border-white/30 group-hover:scale-110 transition-transform">
                            <Play className="w-4 h-4 fill-white translate-x-0.5" />
                          </div>
                        </div>
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-600/90 text-white text-[9px] font-bold flex items-center gap-1 shadow-sm">
                          <Film className="w-2.5 h-2.5" /> Video
                        </span>
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photo.url}
                        alt={photo.title || "Seva Photo"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-end text-white">
                      <span className="text-[11px] font-bold line-clamp-1">{photo.title}</span>
                      <span className="text-[9px] text-slate-300">{photo.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Lightbox Media (Photo / Video) Viewer Modal */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-700 animate-in zoom-in-95 duration-150">
            <div className="p-3 bg-black flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-700">
                  {activePhoto.category}
                </span>
                {isVideoUrl(activePhoto.url) && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-600 flex items-center gap-1">
                    <Film className="w-3 h-3" /> Video
                  </span>
                )}
              </div>
              <button
                onClick={() => setActivePhoto(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[65vh] bg-black flex items-center justify-center overflow-hidden">
              {isVideoUrl(activePhoto.url) ? (
                <video
                  src={activePhoto.url}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[65vh] w-auto max-w-full"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activePhoto.url}
                  alt={activePhoto.title}
                  className="max-h-[60vh] w-auto object-contain"
                />
              )}
            </div>

            <div className="p-5 space-y-2 bg-white text-xs">
              <h3 className="font-serif text-base font-bold text-prayas-ink">
                {activePhoto.title}
              </h3>
              <div className="flex items-center justify-between text-prayas-muted text-[11px]">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{activePhoto.location || "Vrindavan, UP"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activePhoto.date || "2024"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PublicGalleryPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-prayas-muted font-medium">Loading Moments of Seva Gallery...</p>
        </div>
      }
    >
      <GalleryContent />
    </Suspense>
  );
}
