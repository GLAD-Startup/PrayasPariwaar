"use client";

import { useState, useEffect } from "react";
import ImageUpload from "@/components/ImageUpload";
import { apiFetch } from "@/lib/api";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  RefreshCw,
  FolderPlus,
  Eye,
  CheckCircle2,
  X,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  UploadCloud,
  Images,
  Filter,
} from "lucide-react";

const CATEGORIES = [
  "Free Education",
  "Blood Donation",
  "Plantation",
  "Jeev Jal Seva",
  "Vocational Training",
];

export default function AdminGalleryPage() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [recentPhotos, setRecentPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedAlbumFilter, setSelectedAlbumFilter] = useState<string>("ALL");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal states
  const [albumModalOpen, setAlbumModalOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Album form
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumSlug, setAlbumSlug] = useState("");
  const [albumCategory, setAlbumCategory] = useState("Free Education");
  const [albumCoverImage, setAlbumCoverImage] = useState("");
  const [albumDesc, setAlbumDesc] = useState("");
  const [albumInitialPhotos, setAlbumInitialPhotos] = useState<string[]>([]);

  // Single Photo form
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoCategory, setPhotoCategory] = useState("Free Education");
  const [photoLocation, setPhotoLocation] = useState("Mathura / Vrindavan");
  const [photoAlbumId, setPhotoAlbumId] = useState("");

  // Bulk Upload form
  const [bulkAlbumId, setBulkAlbumId] = useState("");
  const [bulkUrls, setBulkUrls] = useState<string[]>([]);
  const [bulkSharedTitle, setBulkSharedTitle] = useState("");
  const [bulkCategory, setBulkCategory] = useState("Free Education");
  const [bulkLocation, setBulkLocation] = useState("Mathura / Vrindavan");

  useEffect(() => {
    fetchGallery();
  }, [categoryFilter]);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const url =
        categoryFilter === "All"
          ? "/api/gallery"
          : `/api/gallery?category=${encodeURIComponent(categoryFilter)}`;
      const res = await apiFetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setAlbums(json.data.albums || []);
        setRecentPhotos(json.data.recentPhotos || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumCoverImage) {
      alert("Please upload or provide an album cover photo");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await apiFetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: albumTitle,
          slug: albumSlug || albumTitle.toLowerCase().replace(/\s+/g, "-"),
          category: albumCategory,
          coverImage: albumCoverImage,
          description: albumDesc,
          initialPhotos: albumInitialPhotos,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg(
          albumInitialPhotos.length > 0
            ? `Gallery album created with ${albumInitialPhotos.length} photos successfully!`
            : "Gallery album created successfully!"
        );
        setAlbumModalOpen(false);
        setAlbumTitle("");
        setAlbumSlug("");
        setAlbumCoverImage("");
        setAlbumDesc("");
        setAlbumInitialPhotos([]);
        fetchGallery();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl) {
      alert("Please upload or provide a photo URL");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await apiFetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_PHOTO",
          albumId: photoAlbumId || null,
          url: photoUrl,
          title: photoTitle,
          category: photoCategory,
          location: photoLocation,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg("Photo added to gallery successfully!");
        setPhotoModalOpen(false);
        setPhotoUrl("");
        setPhotoTitle("");
        fetchGallery();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkUrls.length === 0) {
      alert("Please select or upload at least one photo.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await apiFetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "BULK_ADD_PHOTOS",
          albumId: bulkAlbumId || null,
          category: bulkCategory,
          location: bulkLocation,
          sharedTitle: bulkSharedTitle,
          urls: bulkUrls,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg(
          json.message || `Successfully added ${bulkUrls.length} photos to the gallery album!`
        );
        setBulkModalOpen(false);
        setBulkUrls([]);
        setBulkSharedTitle("");
        fetchGallery();
      } else {
        alert(json.error || "Failed to bulk upload photos");
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed to bulk upload photos");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openBulkUploadForAlbum = (album: any) => {
    setBulkAlbumId(album.id);
    setBulkCategory(album.category || "Free Education");
    setBulkSharedTitle(`${album.title}`);
    setBulkUrls([]);
    setBulkModalOpen(true);
  };

  const handleDeleteAlbum = async (id: string) => {
    if (!confirm("Are you sure you want to delete this album and its associated photo records?"))
      return;
    try {
      const res = await apiFetch(`/api/gallery?albumId=${id}`, { method: "DELETE" });
      if (res.ok) {
        setSuccessMsg("Album removed.");
        if (selectedAlbumFilter === id) setSelectedAlbumFilter("ALL");
        fetchGallery();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (!confirm("Remove this photo from gallery?")) return;
    try {
      const res = await apiFetch(`/api/gallery?photoId=${id}`, { method: "DELETE" });
      if (res.ok) {
        setSuccessMsg("Photo removed.");
        fetchGallery();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filter photos by selected album
  const displayedPhotos =
    selectedAlbumFilter === "ALL"
      ? recentPhotos
      : recentPhotos.filter((p) => p.albumId === selectedAlbumFilter);

  const activeFilteredAlbum =
    selectedAlbumFilter !== "ALL"
      ? albums.find((a) => a.id === selectedAlbumFilter)
      : null;

  return (
    <div className="space-y-6">
      {/* 1. Header with Stats Banner */}
      <div className="border border-prayas-rule bg-white rounded-2xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
            <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>Visual Seva Archive • Prayas Pariwaar</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink">
            Photo Gallery & Field Albums
          </h1>
          <p className="text-xs text-prayas-muted max-w-2xl">
            Upload single or bulk field photography, organize by thematic seva albums, and showcase on-ground impact across Mathura, Vrindavan, and Braj region.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setAlbumModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-prayas-ink border border-prayas-rule hover:bg-prayas-stone transition-all shadow-sm"
          >
            <FolderPlus className="w-4 h-4 text-emerald-700" />
            <span>New Album</span>
          </button>

          {/* Prominent Bulk Upload to Album Button */}
          <button
            onClick={() => {
              if (albums.length > 0 && !bulkAlbumId) {
                setBulkAlbumId(albums[0].id);
                setBulkCategory(albums[0].category);
                setBulkSharedTitle(albums[0].title);
              }
              setBulkUrls([]);
              setBulkModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 transition-all shadow-md"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Bulk Upload to Album</span>
          </button>

          <button
            onClick={() => setPhotoModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all border border-slate-200"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Single Photo</span>
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)}>
            <X className="w-4 h-4 text-emerald-700" />
          </button>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setCategoryFilter("All")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
            categoryFilter === "All"
              ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
              : "bg-white text-prayas-ink border-prayas-rule hover:bg-prayas-stone"
          }`}
        >
          All Streams
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              categoryFilter === cat
                ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                : "bg-white text-prayas-ink border-prayas-rule hover:bg-prayas-stone"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 2. Seva Albums Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-prayas-ink flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-700" />
            <span>Thematic Seva Albums ({albums.length})</span>
          </h2>
          <span className="text-xs text-prayas-muted">
            Click <strong>"+ Bulk Add Photos"</strong> on any album card to upload images in bulk.
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-prayas-muted">
            <RefreshCw className="w-6 h-6 text-emerald-700 animate-spin mx-auto mb-2" />
            <span>Loading gallery albums...</span>
          </div>
        ) : albums.length === 0 ? (
          <div className="p-8 text-center text-xs text-prayas-muted bg-white border border-prayas-rule rounded-2xl">
            No albums found for this category. Click <strong>"New Album"</strong> to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {albums.map((album) => {
              const count = album.photoCount || album.photos?.length || 0;
              const isFiltered = selectedAlbumFilter === album.id;
              return (
                <div
                  key={album.id}
                  className={`bg-white border rounded-2xl overflow-hidden shadow-card group hover:shadow-md transition-all flex flex-col justify-between ${
                    isFiltered ? "ring-2 ring-emerald-600 border-emerald-600" : "border-prayas-rule"
                  }`}
                >
                  <div>
                    <div className="h-44 bg-slate-100 relative overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={album.coverImage}
                        alt={album.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {album.category}
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-md text-prayas-ink text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                        <Images className="w-3 h-3 text-emerald-700" />
                        <span>{count} Photos</span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif text-sm font-bold text-prayas-ink line-clamp-1">
                          {album.title}
                        </h3>
                        <button
                          onClick={() => handleDeleteAlbum(album.id)}
                          className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                          title="Delete album"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-prayas-muted line-clamp-2 leading-relaxed">
                        {album.description || "Field documentation from Prayas Pariwaar initiatives."}
                      </p>
                    </div>
                  </div>

                  {/* Album Quick Actions */}
                  <div className="p-3 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 bg-slate-50/60">
                    <button
                      onClick={() => openBulkUploadForAlbum(album)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 transition-colors shadow-xs"
                      title="Upload multiple images to this album"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>+ Bulk Add Photos</span>
                    </button>

                    <button
                      onClick={() =>
                        setSelectedAlbumFilter(selectedAlbumFilter === album.id ? "ALL" : album.id)
                      }
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors border ${
                        isFiltered
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {isFiltered ? "Showing Photos" : "Filter Photos"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Photos Grid with Album Filter Indicator */}
      <div className="space-y-3 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg font-bold text-prayas-ink flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-700" />
              <span>
                {activeFilteredAlbum
                  ? `Photos in Album: "${activeFilteredAlbum.title}"`
                  : `Uploaded Photos Archive`}
                {" "}
                ({displayedPhotos.length})
              </span>
            </h2>
            {selectedAlbumFilter !== "ALL" && (
              <button
                onClick={() => setSelectedAlbumFilter("ALL")}
                className="text-[11px] text-emerald-800 font-bold hover:underline px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200"
              >
                Clear Album Filter
              </button>
            )}
          </div>

          {activeFilteredAlbum && (
            <button
              onClick={() => openBulkUploadForAlbum(activeFilteredAlbum)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 transition-all shadow-sm"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>+ Bulk Upload More Photos to this Album</span>
            </button>
          )}
        </div>

        {displayedPhotos.length === 0 ? (
          <div className="p-8 text-center text-xs text-prayas-muted bg-white border border-prayas-rule rounded-2xl space-y-2">
            <p>
              {selectedAlbumFilter !== "ALL"
                ? `No photos uploaded to this album yet.`
                : `No standalone photos uploaded yet.`}
            </p>
            {activeFilteredAlbum ? (
              <button
                onClick={() => openBulkUploadForAlbum(activeFilteredAlbum)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 text-white"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Bulk Upload Photos Now</span>
              </button>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {displayedPhotos.map((photo) => (
              <div
                key={photo.id}
                className="bg-white border border-prayas-rule rounded-xl overflow-hidden shadow-sm group aspect-square relative"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.title || "Seva Photo"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between text-white text-[10px]">
                  <span className="line-clamp-2 font-bold">{photo.title || photo.category}</span>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-300 truncate max-w-[80px]">
                      {photo.location}
                    </span>
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="p-1 text-red-400 hover:text-red-300"
                      title="Delete photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL 1: Bulk Upload Photos to Album */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-prayas-rule space-y-4 my-8 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-prayas-rule pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-prayas-ink">
                    Bulk Upload Photos to Album
                  </h3>
                  <p className="text-[11px] text-prayas-muted">
                    Select multiple field images simultaneously to quickly populate a seva album.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBulkModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleBulkUpload} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
              {/* Destination Album Picker */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 space-y-1.5">
                <label className="font-bold text-emerald-950 flex items-center gap-2 text-xs">
                  <Layers className="w-4 h-4 text-emerald-700" />
                  <span>Destination Album *</span>
                </label>
                <select
                  value={bulkAlbumId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setBulkAlbumId(id);
                    const found = albums.find((a) => a.id === id);
                    if (found) {
                      setBulkCategory(found.category);
                      if (!bulkSharedTitle) setBulkSharedTitle(found.title);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-white text-xs outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
                >
                  <option value="">-- Standalone Gallery Photos (No Specific Album) --</option>
                  {albums.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title} ({a.category}) • {a.photoCount || 0} existing photos
                    </option>
                  ))}
                </select>
                <p className="text-[10.5px] text-emerald-800">
                  All selected photos will be linked to this album and visible in the public gallery.
                </p>
              </div>

              {/* Shared Metadata Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-prayas-ink block mb-1">Shared Title / Prefix</label>
                  <input
                    type="text"
                    placeholder="e.g. Health Camp Distribution"
                    value={bulkSharedTitle}
                    onChange={(e) => setBulkSharedTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-prayas-rule bg-prayas-stone/30 focus:bg-white text-xs outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                  <span className="text-[10px] text-prayas-muted">Auto-numbered: (1), (2), etc.</span>
                </div>

                <div>
                  <label className="font-bold text-prayas-ink block mb-1">Seva Category</label>
                  <select
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-prayas-rule bg-prayas-stone/30 text-xs outline-none focus:ring-2 focus:ring-emerald-700"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-prayas-ink block mb-1">Location</label>
                  <input
                    type="text"
                    value={bulkLocation}
                    onChange={(e) => setBulkLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-prayas-rule bg-prayas-stone/30 focus:bg-white text-xs outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              {/* Multi-Image File Uploader */}
              <div>
                <ImageUpload
                  label="Select Multiple Photos (Hold Ctrl/Shift to choose multiple, or Drag & Drop)"
                  description="Supports uploading multiple JPG, PNG, WEBP files at once (up to 35 files per batch)"
                  multiple={true}
                  value={bulkUrls}
                  onChange={(urls) => setBulkUrls(urls)}
                />
              </div>

              {/* Staged Photo Previews with Delete & Counter */}
              {bulkUrls.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-prayas-rule">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-800 text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{bulkUrls.length} Photos Selected & Staged</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setBulkUrls([])}
                      className="text-[11px] text-red-600 hover:underline font-semibold"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    {bulkUrls.map((u, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-lg overflow-hidden border border-slate-300 group bg-white shadow-xs"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={u}
                          alt={`Bulk upload ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1 rounded font-bold">
                          #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => setBulkUrls(bulkUrls.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 opacity-90 hover:opacity-100 shadow"
                          title="Remove this photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-prayas-rule shrink-0">
                <button
                  type="button"
                  onClick={() => setBulkModalOpen(false)}
                  className="px-4 py-2 bg-prayas-stone text-prayas-ink font-semibold rounded-xl text-xs hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || bulkUrls.length === 0}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs disabled:opacity-50 inline-flex items-center gap-2 shadow-md transition-all"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? `Saving ${bulkUrls.length} Photos...`
                      : `Upload & Add All ${bulkUrls.length} Photos to Album`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: New Album Modal (Now with optional initial photos bulk upload!) */}
      {albumModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-prayas-rule space-y-4 my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-prayas-rule pb-3 shrink-0">
              <h3 className="font-serif text-lg font-bold text-prayas-ink">Create New Seva Album</h3>
              <button onClick={() => setAlbumModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateAlbum} className="space-y-3.5 text-xs overflow-y-auto pr-1 flex-1">
              <div>
                <label className="font-bold text-prayas-ink block mb-1">Album Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Free Evening Learning Center - Batch 2024"
                  value={albumTitle}
                  onChange={(e) => setAlbumTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-prayas-rule bg-prayas-stone/30 focus:bg-white text-xs outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="font-bold text-prayas-ink block mb-1">Seva Stream Category</label>
                <select
                  value={albumCategory}
                  onChange={(e) => setAlbumCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-prayas-rule bg-prayas-stone/30 text-xs outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <ImageUpload
                  label="Album Cover Photo (Main Cover Image) *"
                  value={albumCoverImage}
                  onChange={(url) => setAlbumCoverImage(url)}
                />
              </div>

              {/* Optional: Add album photos right now in bulk */}
              <div>
                <ImageUpload
                  label="Additional Album Photos (Bulk Upload, Optional)"
                  description="Select multiple photos to immediately populate this new album"
                  multiple={true}
                  value={albumInitialPhotos}
                  onChange={(urls) => setAlbumInitialPhotos(urls)}
                />
                {albumInitialPhotos.length > 0 && (
                  <p className="text-[11px] font-semibold text-emerald-800 mt-1">
                    ✓ {albumInitialPhotos.length} additional photos will be added into this album.
                  </p>
                )}
              </div>

              <div>
                <label className="font-bold text-prayas-ink block mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Short summary of this seva drive..."
                  value={albumDesc}
                  onChange={(e) => setAlbumDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-prayas-rule bg-prayas-stone/30 focus:bg-white text-xs outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-prayas-rule shrink-0">
                <button
                  type="button"
                  onClick={() => setAlbumModalOpen(false)}
                  className="px-4 py-2 bg-prayas-stone text-prayas-ink font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs disabled:opacity-50 inline-flex items-center gap-2 shadow-md"
                >
                  {isSubmitting ? "Creating..." : "Create Album"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add Single Photo Modal */}
      {photoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-prayas-rule space-y-4 my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-prayas-rule pb-3 shrink-0">
              <h3 className="font-serif text-lg font-bold text-prayas-ink">Upload Single Photo</h3>
              <button onClick={() => setPhotoModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddPhoto} className="space-y-3.5 text-xs overflow-y-auto pr-1 flex-1">
              <div>
                <ImageUpload
                  label="Upload Photo from Computer"
                  value={photoUrl}
                  onChange={(url) => setPhotoUrl(url)}
                />
              </div>

              <div>
                <label className="font-bold text-prayas-ink block mb-1">Title / Caption</label>
                <input
                  type="text"
                  placeholder="e.g. Distribution of books to 120 children"
                  value={photoTitle}
                  onChange={(e) => setPhotoTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-prayas-rule bg-prayas-stone/30 focus:bg-white text-xs outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-prayas-ink block mb-1">Seva Category</label>
                  <select
                    value={photoCategory}
                    onChange={(e) => setPhotoCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-prayas-rule bg-prayas-stone/30 text-xs outline-none focus:ring-2 focus:ring-emerald-700"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-prayas-ink block mb-1">Location</label>
                  <input
                    type="text"
                    value={photoLocation}
                    onChange={(e) => setPhotoLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-prayas-rule bg-prayas-stone/30 focus:bg-white text-xs outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-prayas-ink block mb-1">Assign to Album (Optional)</label>
                <select
                  value={photoAlbumId}
                  onChange={(e) => setPhotoAlbumId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-prayas-rule bg-prayas-stone/30 text-xs outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  <option value="">-- Standalone Gallery Photo --</option>
                  {albums.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title} ({a.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-prayas-rule shrink-0">
                <button
                  type="button"
                  onClick={() => setPhotoModalOpen(false)}
                  className="px-4 py-2 bg-prayas-stone text-prayas-ink font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs disabled:opacity-50"
                >
                  {isSubmitting ? "Uploading..." : "Save Photo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
