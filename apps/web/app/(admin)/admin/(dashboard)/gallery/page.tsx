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
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal states
  const [albumModalOpen, setAlbumModalOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Album form
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumSlug, setAlbumSlug] = useState("");
  const [albumCategory, setAlbumCategory] = useState("Free Education");
  const [albumCoverImage, setAlbumCoverImage] = useState("");
  const [albumDesc, setAlbumDesc] = useState("");

  // Photo form
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoCategory, setPhotoCategory] = useState("Free Education");
  const [photoLocation, setPhotoLocation] = useState("Mathura / Vrindavan");
  const [photoAlbumId, setPhotoAlbumId] = useState("");

  useEffect(() => {
    fetchGallery();
  }, [categoryFilter]);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const url = categoryFilter === "All" ? "/api/gallery" : `/api/gallery?category=${encodeURIComponent(categoryFilter)}`;
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
    setIsSubmitting(true);
    try {
      const res = await apiFetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: albumTitle,
          slug: albumSlug || albumTitle.toLowerCase().replace(/\s+/g, "-"),
          category: albumCategory,
          coverImage: albumCoverImage || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800",
          description: albumDesc,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg("Gallery album created successfully!");
        setAlbumModalOpen(false);
        setAlbumTitle("");
        setAlbumSlug("");
        setAlbumCoverImage("");
        setAlbumDesc("");
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

  const handleDeleteAlbum = async (id: string) => {
    if (!confirm("Are you sure you want to delete this album and its associated photo records?")) return;
    try {
      const res = await apiFetch(`/api/gallery?albumId=${id}`, { method: "DELETE" });
      if (res.ok) {
        setSuccessMsg("Album removed.");
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
            Upload field photography from computer, create thematic seva albums, and showcase on-ground impact across Mathura, Vrindavan, and Braj region.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setAlbumModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-prayas-ink border border-prayas-rule hover:bg-prayas-stone transition-all shadow-sm"
          >
            <FolderPlus className="w-4 h-4 text-emerald-700" />
            <span>New Album</span>
          </button>

          <button
            onClick={() => setPhotoModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Photo</span>
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-sm">
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
            {albums.map((album) => (
              <div
                key={album.id}
                className="bg-white border border-prayas-rule rounded-2xl overflow-hidden shadow-card group hover:shadow-md transition-all"
              >
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
                  <div className="absolute bottom-2.5 right-2.5 bg-white/90 backdrop-blur-md text-prayas-ink text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    📷 {album.photoCount || album.photos?.length || 0} Photos
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
            ))}
          </div>
        )}
      </div>

      {/* 3. Recent Individual Photos Grid */}
      <div className="space-y-3 pt-4">
        <h2 className="font-serif text-lg font-bold text-prayas-ink flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-emerald-700" />
          <span>Uploaded Photos Archive ({recentPhotos.length})</span>
        </h2>

        {recentPhotos.length === 0 ? (
          <div className="p-8 text-center text-xs text-prayas-muted bg-white border border-prayas-rule rounded-2xl">
            No standalone photos uploaded yet. Click <strong>"Upload Photo"</strong> above.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {recentPhotos.map((photo) => (
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
                    <span className="text-[9px] text-slate-300">{photo.location}</span>
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="p-1 text-red-400 hover:text-red-300"
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

      {/* New Album Modal with File Upload */}
      {albumModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-prayas-rule space-y-4">
            <div className="flex items-center justify-between border-b border-prayas-rule pb-3">
              <h3 className="font-serif text-lg font-bold text-prayas-ink">Create New Seva Album</h3>
              <button onClick={() => setAlbumModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateAlbum} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-prayas-ink block mb-1">Album Title</label>
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
                  label="Album Cover Photo (Upload from Device)"
                  value={albumCoverImage}
                  onChange={(url) => setAlbumCoverImage(url)}
                />
              </div>

              <div>
                <label className="font-bold text-prayas-ink block mb-1">Description (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Short summary of this seva drive..."
                  value={albumDesc}
                  onChange={(e) => setAlbumDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-prayas-rule bg-prayas-stone/30 focus:bg-white text-xs outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-prayas-rule">
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
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Album"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Photo Modal with File Upload */}
      {photoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-prayas-rule space-y-4">
            <div className="flex items-center justify-between border-b border-prayas-rule pb-3">
              <h3 className="font-serif text-lg font-bold text-prayas-ink">Add Photo to Gallery</h3>
              <button onClick={() => setPhotoModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddPhoto} className="space-y-3 text-xs">
              <div>
                <ImageUpload
                  label="Upload Photo from Computer (or Drag & Drop)"
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

              <div className="flex justify-end gap-2 pt-3 border-t border-prayas-rule">
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
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs disabled:opacity-50"
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
