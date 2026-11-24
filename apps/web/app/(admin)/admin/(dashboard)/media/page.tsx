"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";
import { apiFetch, assetPath } from "@/lib/api";
import {
  parseMediaImages,
  formatMediaImages,
  extractYouTubeId,
  getYouTubeThumbnail,
  isVideoLink,
  isVideoUrl,
  getVideoEmbedUrl,
} from "@/lib/media";
import {
  Newspaper,
  Tv,
  Plus,
  Calendar,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  Loader2,
  RefreshCw,
  Search,
  Image as ImageIcon,
  Play,
  Film,
  Layers,
  Sparkles,
  Eye,
  ArrowUpRight,
  Star,
} from "lucide-react";

export default function AdminMediaPage() {
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Video Preview Modal State
  const [activeVideoModal, setActiveVideoModal] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    type: string;
    source: string;
    url: string;
    images: string[];
    publishedDate: string;
    order: number;
  }>({
    title: "",
    type: "PRINT",
    source: "Dainik Jagran",
    url: "",
    images: [],
    publishedDate: new Date().toISOString().split("T")[0],
    order: 0,
  });

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/media");
      const json = await res.json();
      if (json.success) {
        setMediaItems(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (item: any) => {
    setEditingItemId(item.id);
    const parsed = parseMediaImages(item.imageUrl);
    setFormData({
      title: item.title || "",
      type: item.type || "PRINT",
      source: item.source || "Dainik Jagran",
      url: item.url || "",
      images: parsed,
      publishedDate: item.publishedDate
        ? new Date(item.publishedDate).toISOString().split("T")[0]
        : new Date(item.createdAt).toISOString().split("T")[0],
      order: item.order || 0,
    });
    setIsCreating(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelForm = () => {
    setIsCreating(false);
    setEditingItemId(null);
    setErrorMsg(null);
    setFormData({
      title: "",
      type: "PRINT",
      source: "Dainik Jagran",
      url: "",
      images: [],
      publishedDate: new Date().toISOString().split("T")[0],
      order: 0,
    });
  };

  // Video detection from formData.url
  const detectedVideoInfo = useMemo(() => {
    const rawUrl = formData.url.trim();
    if (!rawUrl) return null;

    const ytId = extractYouTubeId(rawUrl);
    if (ytId) {
      return {
        type: "youtube" as const,
        videoId: ytId,
        thumbnail: getYouTubeThumbnail(ytId, "maxres"),
        embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0`,
        label: "YouTube Broadcast Video",
      };
    }

    if (isVideoUrl(rawUrl)) {
      return {
        type: "direct" as const,
        videoId: null,
        thumbnail: null,
        embedUrl: assetPath(rawUrl),
        label: "Direct Video Stream (.mp4)",
      };
    }

    const embed = getVideoEmbedUrl(rawUrl);
    if (embed) {
      return {
        type: "embed" as const,
        videoId: null,
        thumbnail: null,
        embedUrl: embed,
        label: "Online Video Embed",
      };
    }

    return null;
  }, [formData.url]);

  // Handle setting detected video thumbnail as cover image
  const handleUseVideoThumbnail = () => {
    if (!detectedVideoInfo?.thumbnail) return;
    const thumbUrl = detectedVideoInfo.thumbnail;
    if (!formData.images.includes(thumbUrl)) {
      setFormData((prev) => ({
        ...prev,
        images: [thumbUrl, ...prev.images],
      }));
      setSuccessMsg("Video thumbnail set as primary cover image!");
    }
  };

  // Move image to cover position (#1)
  const handleMakeCover = (index: number) => {
    if (index === 0) return;
    setFormData((prev) => {
      const copy = [...prev.images];
      const [item] = copy.splice(index, 1);
      return { ...prev, images: [item, ...copy] };
    });
  };

  // Remove individual image
  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // If electronic media with a detected video and zero images, offer to auto-attach thumbnail
      let submissionImages = [...formData.images];
      if (
        submissionImages.length === 0 &&
        detectedVideoInfo?.thumbnail &&
        formData.type === "ELECTRONIC"
      ) {
        submissionImages = [detectedVideoInfo.thumbnail];
      }

      const payload = {
        title: formData.title,
        type: formData.type,
        source: formData.source,
        url: formData.url,
        imageUrl: formatMediaImages(submissionImages),
        images: submissionImages,
        publishedDate: formData.publishedDate,
        order: Number(formData.order) || 0,
      };

      const url = editingItemId ? `/api/media/${editingItemId}` : "/api/media";
      const method = editingItemId ? "PATCH" : "POST";

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save media item.");
      }

      setSuccessMsg(
        editingItemId
          ? "Media coverage report updated successfully!"
          : "Media coverage report added to Media Centre successfully!"
      );
      handleCancelForm();
      fetchMedia();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit media item.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this media coverage report?")) return;

    setActionLoading(id);
    try {
      const res = await apiFetch(`/api/media/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMediaItems((prev) => prev.filter((m) => m.id !== id));
        setSuccessMsg("Media report deleted successfully.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredItems = mediaItems.filter((item) => {
    const matchesType = typeFilter === "ALL" || item.type === typeFilter;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.source && item.source.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const printCount = mediaItems.filter((m) => m.type === "PRINT").length;
  const electronicCount = mediaItems.filter((m) => m.type === "ELECTRONIC").length;

  return (
    <div className="space-y-6">
      {/* 1. Header with Add Button */}
      <div className="border border-prayas-rule bg-white rounded-2xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-900">
            <Newspaper className="w-3.5 h-3.5 text-blue-700" />
            <span>Public Press & Media Archive</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink">
            Media Centre & Press Clipping Manager
          </h1>
          <p className="text-xs text-prayas-muted max-w-2xl">
            Upload multi-page print clippings, YouTube and electronic broadcast clips, and television reports documenting Prayas Pariwaar's on-ground seva across Mathura and Vrindavan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/media"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white border border-prayas-rule text-prayas-ink hover:bg-prayas-stone transition-all shadow-xs"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-700" />
            <span>View Public /media</span>
          </Link>

          <button
            onClick={() => {
              if (isCreating) {
                handleCancelForm();
              } else {
                setIsCreating(true);
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#2E5339] text-white hover:bg-[#23432b] transition-all shadow-md cursor-pointer"
            style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
          >
            {isCreating ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isCreating ? (editingItemId ? "Cancel Edit" : "Cancel Form") : "Add New Press Coverage"}</span>
          </button>

          <button
            onClick={fetchMedia}
            disabled={loading}
            className="p-2.5 bg-prayas-stone hover:bg-prayas-paper text-prayas-ink rounded-xl border border-prayas-rule shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-prayas-neem" : ""}`} />
          </button>
        </div>
      </div>

      {/* 2. Top Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="border border-prayas-rule bg-white rounded-xl p-4 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-prayas-muted uppercase tracking-wider">Total Media Items</span>
          <p className="font-serif text-2xl font-bold text-prayas-ink">{mediaItems.length}</p>
          <span className="text-[10px] text-slate-400">Archived press clips</span>
        </div>

        <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-4 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
            <Newspaper className="w-3.5 h-3.5 text-emerald-700" />
            Print Media Clippings
          </span>
          <p className="font-serif text-2xl font-bold text-emerald-950">{printCount}</p>
          <span className="text-[10px] text-emerald-700 font-medium">Newspapers & multi-page scans</span>
        </div>

        <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-4 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1">
            <Tv className="w-3.5 h-3.5 text-blue-700" />
            Electronic & TV Broadcasts
          </span>
          <p className="font-serif text-2xl font-bold text-blue-950">{electronicCount}</p>
          <span className="text-[10px] text-blue-700 font-medium">YouTube & video reports with previews</span>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-700 hover:text-red-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. CREATE / EDIT MEDIA FORM */}
      {isCreating && (
        <div className="border border-emerald-900/20 bg-white rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-prayas-rule pb-3 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-prayas-ink">
                {editingItemId ? "Edit Media Coverage Report" : "Add Press Coverage / News Report"}
              </h2>
              <p className="text-xs text-prayas-muted mt-0.5">
                Upload multiple scanned newspaper pages, or paste YouTube/video link with instant thumbnail and preview.
              </p>
            </div>
            <button
              onClick={handleCancelForm}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-prayas-ink block">
                  Headline / Report Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prayas Pariwaar Deploys 40 Free Oxygen Concentrators in Vrindavan"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/40 text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-medium text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-prayas-ink block">
                  Media Format / Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/40 text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-semibold text-xs sm:text-sm"
                >
                  <option value="PRINT">📰 PRINT (Newspaper / Magazine Multi-Page Clipping)</option>
                  <option value="ELECTRONIC">📺 ELECTRONIC (TV News / YouTube Video / Digital Broadcast)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-prayas-ink block">
                  Publication / News Channel Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dainik Jagran, Amar Ujala, News18, Hindustan, Zee News"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/40 text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-medium text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-prayas-ink block">
                  Published Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.publishedDate}
                  onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/40 text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-mono text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-prayas-ink block flex items-center justify-between">
                  <span>External Article or Video Link (YouTube / Vimeo / MP4)</span>
                  {detectedVideoInfo && (
                    <span className="text-[10px] text-red-600 font-bold bg-red-50 border border-red-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Play className="w-2.5 h-2.5 fill-red-600" /> Video Detected
                    </span>
                  )}
                </label>
                <input
                  type="url"
                  placeholder="e.g. https://www.youtube.com/watch?v=... or https://jagran.com/news/..."
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/40 text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-mono text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* VIDEO LINK THUMBNAIL & INTERACTIVE PREVIEW CARD */}
            {detectedVideoInfo && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-700 shadow-md space-y-3.5 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-sm">
                      <Play className="w-4 h-4 fill-white" />
                    </div>
                    <div>
                      <span className="font-bold text-xs">{detectedVideoInfo.label}</span>
                      <span className="block text-[10px] text-slate-400 font-mono truncate max-w-sm">
                        {formData.url}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {detectedVideoInfo.thumbnail && (
                      <button
                        type="button"
                        onClick={handleUseVideoThumbnail}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Use Video Thumbnail as Cover</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setActiveVideoModal(formData.url)}
                      className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white font-semibold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Watch Preview</span>
                    </button>
                  </div>
                </div>

                {/* Video Preview Thumbnail Bar */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {detectedVideoInfo.thumbnail ? (
                    <div
                      className="relative w-full sm:w-60 aspect-video rounded-xl overflow-hidden border border-white/20 bg-black group shrink-0 cursor-pointer shadow-md"
                      onClick={() => setActiveVideoModal(formData.url)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={detectedVideoInfo.thumbnail}
                        alt="Extracted video thumbnail"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                        <div className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-white translate-x-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-white text-[9px] font-bold">
                        Click to Play
                      </span>
                    </div>
                  ) : (
                    <div className="w-full sm:w-60 aspect-video rounded-xl bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-slate-400 gap-1 shrink-0">
                      <Film className="w-6 h-6 text-slate-400" />
                      <span className="text-[10px] font-medium">Direct Video Stream</span>
                    </div>
                  )}

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <p className="font-semibold text-white">
                      Live Video Integration Active
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      This video will be featured with an interactive player on the public Media Centre. Readers will be able to watch this news broadcast directly inside the story page.
                    </p>
                    {formData.images.length === 0 && detectedVideoInfo.thumbnail && (
                      <p className="text-[11px] text-amber-300 font-medium">
                        💡 Tip: Click "Use Video Thumbnail as Cover" to automatically set this video's high-res snapshot as the news clipping image!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* MULTI-IMAGE UPLOAD FOR SCANNED CLIPPINGS */}
            <div className="p-5 sm:p-6 rounded-2xl bg-prayas-stone/30 border border-prayas-rule space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-sm font-bold text-prayas-ink flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-700" />
                    <span>Press Clippings & Scanned Newspaper Pages</span>
                  </h3>
                  <p className="text-xs text-prayas-muted">
                    Upload multiple pages (Page 1 cover, Page 2 inner story, etc.). Drag multiple files or select at once.
                  </p>
                </div>
                {formData.images.length > 0 && (
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    {formData.images.length} {formData.images.length === 1 ? "page" : "pages"} attached
                  </span>
                )}
              </div>

              <ImageUpload
                multiple={true}
                value={formData.images}
                onChange={(urls: string[]) => setFormData((prev) => ({ ...prev, images: urls }))}
                label=""
                description="Upload multiple high-resolution scans or photos (JPG, PNG, WEBP, GIF up to 25MB each)"
                allowAdjustment={false}
              />

              {/* Multi-Image Page Organizer & Cover Selector */}
              {formData.images.length > 1 && (
                <div className="pt-3 border-t border-prayas-rule/80 space-y-2">
                  <span className="text-[11px] font-bold text-prayas-ink block">
                    Clipping Page Order (First image is the Primary Cover):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {formData.images.map((url, idx) => (
                      <div
                        key={idx}
                        className={`relative rounded-xl overflow-hidden border ${
                          idx === 0
                            ? "border-emerald-600 ring-2 ring-emerald-500/30"
                            : "border-prayas-rule"
                        } bg-white shadow-xs p-1.5 space-y-1`}
                      >
                        <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-900">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={assetPath(url)}
                            alt={`Page ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <span
                            className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              idx === 0
                                ? "bg-emerald-700 text-white"
                                : "bg-black/75 text-white"
                            }`}
                          >
                            {idx === 0 ? "★ Primary Cover" : `Page ${idx + 1}`}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-1 pt-1">
                          {idx !== 0 ? (
                            <button
                              type="button"
                              onClick={() => handleMakeCover(idx)}
                              className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 w-full text-center transition-colors cursor-pointer"
                            >
                              Make Cover
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700 px-1.5 py-0.5 w-full text-center">
                              Active Cover
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Form Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancelForm}
                className="px-5 py-2.5 rounded-xl border border-prayas-rule font-semibold text-prayas-ink hover:bg-prayas-stone cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl font-bold bg-[#2E5339] text-white hover:bg-[#23432b] shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>
                  {submitting
                    ? "Saving..."
                    : editingItemId
                    ? "Update Press Report →"
                    : "Add to Media Centre →"}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. FILTER & SEARCH TOOLBAR */}
      <div className="border border-prayas-rule bg-white rounded-2xl p-4 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-semibold text-prayas-muted">Format Filter:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-prayas-stone/60 border border-prayas-rule text-prayas-ink rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-prayas-neem w-full sm:w-auto"
            >
              <option value="ALL">All Formats ({mediaItems.length})</option>
              <option value="PRINT">📰 Print Media Clippings ({printCount})</option>
              <option value="ELECTRONIC">📺 TV & Video Broadcasts ({electronicCount})</option>
            </select>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-prayas-muted absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search headline or channel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-prayas-rule bg-prayas-stone/40 text-xs text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-medium"
            />
          </div>
        </div>
      </div>

      {/* 5. MEDIA DATA TABLE */}
      <div className="bg-white border border-prayas-rule rounded-2xl overflow-hidden shadow-card">
        {loading ? (
          <div className="p-16 text-center text-prayas-muted text-xs">
            <RefreshCw className="w-6 h-6 text-prayas-neem animate-spin mx-auto mb-2" />
            <p className="font-semibold text-prayas-ink">Loading press coverage reports...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-16 text-center text-prayas-muted text-xs space-y-3">
            <CheckCircle2 className="w-10 h-10 text-prayas-neem mx-auto" />
            <h3 className="font-serif text-lg font-bold text-prayas-ink">
              No Press Reports Found
            </h3>
            <p className="max-w-md mx-auto leading-relaxed">
              No media items match your search. Click "Add New Press Coverage" to upload multi-page newspaper clippings and TV links.
            </p>
          </div>
        ) : (
          <div>
            {/* 1. MOBILE CARDS (< md) */}
            <div className="md:hidden divide-y divide-prayas-rule">
              {filteredItems.map((item) => {
                const itemImages = parseMediaImages(item.imageUrl);
                const ytId = extractYouTubeId(item.url);
                const thumb =
                  itemImages[0] ||
                  (ytId ? getYouTubeThumbnail(ytId, "hq") : null);
                const isVideo = item.type === "ELECTRONIC" || isVideoLink(item.url);

                return (
                  <div key={item.id} className="p-4 space-y-3 hover:bg-prayas-stone/20 transition-colors">
                    <div className="flex items-start gap-3">
                      {thumb ? (
                        <div
                          className="w-20 h-16 rounded-xl overflow-hidden border border-prayas-rule shrink-0 bg-prayas-stone relative group cursor-pointer"
                          onClick={() => {
                            if (isVideo && item.url) setActiveVideoModal(item.url);
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={assetPath(thumb)}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {isVideo && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <Play className="w-4 h-4 fill-white text-white" />
                            </div>
                          )}
                          {itemImages.length > 1 && (
                            <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 text-white text-[8px] font-bold">
                              {itemImages.length}p
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="w-20 h-16 rounded-xl border border-prayas-rule shrink-0 bg-prayas-stone flex items-center justify-center text-prayas-muted">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0 space-y-1">
                        <Link
                          href={`/media/${item.id}`}
                          target="_blank"
                          className="font-bold text-prayas-ink text-sm leading-snug line-clamp-2 hover:text-emerald-800 transition-colors"
                        >
                          {item.title}
                        </Link>
                        <p className="text-[11px] font-semibold text-slate-600">
                          {item.source || "Dainik Jagran"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        {item.type === "PRINT" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <Newspaper className="w-3 h-3 text-emerald-700" />
                            <span>PRINT</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            <Tv className="w-3 h-3 text-blue-700" />
                            <span>ELECTRONIC</span>
                          </span>
                        )}

                        {itemImages.length > 1 && (
                          <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            📄 {itemImages.length} pages
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-prayas-muted font-medium">
                        {item.publishedDate
                          ? new Date(item.publishedDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : new Date(item.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-prayas-rule/60 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(item)}
                        className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-prayas-stone hover:bg-slate-200 text-prayas-ink border border-prayas-rule inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Edit</span>
                      </button>

                      <Link
                        href={`/media/${item.id}`}
                        target="_blank"
                        className="py-2 px-3 rounded-xl text-xs font-bold bg-prayas-stone hover:bg-slate-200 text-prayas-ink border border-prayas-rule inline-flex items-center justify-center gap-1 transition-colors"
                        title="View Public Article Page"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                      </Link>

                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-3 rounded-xl text-xs font-bold bg-prayas-stone hover:bg-slate-200 text-prayas-ink border border-prayas-rule inline-flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        disabled={actionLoading === item.id}
                        className="p-2 text-slate-400 hover:text-rose-600 bg-prayas-stone hover:bg-rose-50 rounded-xl border border-prayas-rule transition-colors inline-flex items-center justify-center disabled:opacity-50 cursor-pointer"
                        title="Delete press report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 2. DESKTOP TABLE VIEW (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-prayas-ink">
                <thead className="bg-prayas-stone border-b border-prayas-rule text-prayas-muted uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="p-4 min-w-[280px]">Report Headline & Clipping</th>
                    <th className="p-4 min-w-[100px]">Format</th>
                    <th className="p-4 min-w-[130px]">Source / Publication</th>
                    <th className="p-4 min-w-[110px]">Published Date</th>
                    <th className="p-4 min-w-[120px]">Links & Previews</th>
                    <th className="p-4 min-w-[140px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-prayas-rule">
                  {filteredItems.map((item) => {
                    const itemImages = parseMediaImages(item.imageUrl);
                    const ytId = extractYouTubeId(item.url);
                    const thumb =
                      itemImages[0] ||
                      (ytId ? getYouTubeThumbnail(ytId, "hq") : null);
                    const isVideo = item.type === "ELECTRONIC" || isVideoLink(item.url);

                    return (
                      <tr key={item.id} className="hover:bg-prayas-stone/30 transition-colors">
                        <td className="p-4 max-w-sm sm:max-w-md">
                          <div className="flex items-center gap-3">
                            {thumb ? (
                              <div
                                className="w-16 h-12 rounded-lg overflow-hidden border border-prayas-rule shrink-0 bg-prayas-stone relative group cursor-pointer"
                                onClick={() => {
                                  if (isVideo && item.url) setActiveVideoModal(item.url);
                                }}
                                title={isVideo ? "Click to play preview" : "View clipping"}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={assetPath(thumb)}
                                  alt={item.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  loading="lazy"
                                />
                                {isVideo && (
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <Play className="w-4 h-4 fill-white text-white" />
                                  </div>
                                )}
                                {itemImages.length > 1 && (
                                  <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 rounded bg-black/85 text-white text-[8px] font-bold">
                                    {itemImages.length}p
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="w-16 h-12 rounded-lg border border-prayas-rule shrink-0 bg-prayas-stone flex items-center justify-center text-prayas-muted">
                                <ImageIcon className="w-4 h-4" />
                              </div>
                            )}

                            <div className="space-y-1">
                              <Link
                                href={`/media/${item.id}`}
                                target="_blank"
                                className="font-bold text-prayas-ink text-sm line-clamp-2 hover:text-emerald-800 transition-colors"
                              >
                                {item.title}
                              </Link>
                              {itemImages.length > 1 && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  <Layers className="w-2.5 h-2.5" />
                                  <span>{itemImages.length} Scanned Pages</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          {item.type === "PRINT" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <Newspaper className="w-3 h-3 text-emerald-700" />
                              <span>PRINT</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                              <Tv className="w-3 h-3 text-blue-700" />
                              <span>ELECTRONIC</span>
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          <span className="font-semibold text-prayas-ink">
                            {item.source || "Dainik Jagran"}
                          </span>
                        </td>

                        <td className="p-4 text-prayas-muted text-[11px]">
                          {item.publishedDate
                            ? new Date(item.publishedDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : new Date(item.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })}
                        </td>

                        <td className="p-4">
                          <div className="flex flex-col gap-1.5">
                            <Link
                              href={`/media/${item.id}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 text-xs text-emerald-800 font-semibold hover:underline"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Focused Story</span>
                            </Link>

                            {isVideo && item.url && (
                              <button
                                type="button"
                                onClick={() => setActiveVideoModal(item.url)}
                                className="inline-flex items-center gap-1 text-xs text-red-600 font-semibold hover:underline cursor-pointer"
                              >
                                <Play className="w-3 h-3 fill-red-600" />
                                <span>Watch Video</span>
                              </button>
                            )}

                            {item.url && !isVideo && (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Source Link</span>
                              </a>
                            )}
                          </div>
                        </td>

                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-prayas-stone hover:bg-slate-200 text-prayas-ink border border-prayas-rule inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3 text-emerald-700" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={actionLoading === item.id}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center disabled:opacity-50 cursor-pointer"
                            title="Delete press report"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 6. ADMIN VIDEO PREVIEW MODAL */}
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
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
            {extractYouTubeId(activeVideoModal) ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${extractYouTubeId(activeVideoModal)}?autoplay=1&rel=0`}
                title="Video Preview"
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
