"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";
import { apiFetch } from "@/lib/api";
import {
  FileText,
  Plus,
  Calendar,
  MapPin,
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
  Send,
  X,
  Clock,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Edit2,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    type: string;
    excerpt: string;
    content: string;
    eventDate: string;
    location: string;
    coverImage: string;
    galleryImages: string[];
    published: boolean;
  }>({
    title: "",
    slug: "",
    type: "EVENT",
    excerpt: "",
    content: "",
    eventDate: new Date().toISOString().split("T")[0],
    location: "Vrindavan, Mathura District, UP",
    coverImage: "",
    galleryImages: [],
    published: true,
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/posts?all=true");
      const data = await res.json();
      if (data.success) {
        setPosts(data.data);
      }
    } catch (e) {
      console.error("Failed to load posts", e);
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const generatedSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug === "" || prev.slug === generatedSlug ? generatedSlug : prev.slug,
    }));
  };

  const handleStartEdit = (post: any) => {
    setEditingPostId(post.id);
    setIsCreating(true);
    setFormData({
      title: post.title || "",
      slug: post.slug || "",
      type: post.type || "EVENT",
      excerpt: post.excerpt || "",
      content: post.content || "",
      eventDate: post.eventDate ? new Date(post.eventDate).toISOString().split("T")[0] : "",
      location: post.location || "Vrindavan, Mathura District, UP",
      coverImage: post.coverImage || "",
      galleryImages: Array.isArray(post.images) ? post.images.map((img: any) => img.url) : [],
      published: post.published ?? true,
    });
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleCancelForm = () => {
    setIsCreating(false);
    setEditingPostId(null);
    setFormData({
      title: "",
      slug: "",
      type: "EVENT",
      excerpt: "",
      content: "",
      eventDate: new Date().toISOString().split("T")[0],
      location: "Vrindavan, Mathura District, UP",
      coverImage: "",
      galleryImages: [],
      published: true,
    });
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrorMsg("Post Title is required.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim() || formData.title.toLowerCase().replace(/\s+/g, "-"),
        type: formData.type,
        excerpt: formData.excerpt.trim() || null,
        content: formData.content.trim(),
        eventDate: formData.eventDate ? new Date(formData.eventDate) : null,
        location: formData.location,
        coverImage: formData.coverImage || (formData.galleryImages[0] || null),
        imageUrls: formData.galleryImages,
        published: formData.published,
      };

      let res;
      if (editingPostId) {
        res = await apiFetch(`/api/posts/${editingPostId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await apiFetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save post.");
      }

      setSuccessMsg(
        editingPostId
          ? "Field dispatch updated successfully."
          : "New field story published successfully!"
      );
      handleCancelForm();
      fetchPosts();
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const togglePublished = async (post: any) => {
    setActionLoading(post.id);
    try {
      const res = await apiFetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !post.published }),
      });
      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) => (p.id === post.id ? { ...p, published: !post.published } : p))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to permanently delete this field dispatch?")) return;

    setActionLoading(postId);
    try {
      const res = await apiFetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        setSuccessMsg("Post deleted successfully.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredPosts = posts.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      (p.location && p.location.toLowerCase().includes(q)) ||
      (p.type && p.type.toLowerCase().includes(q))
    );
  });

  const eventCount = posts.filter((p) => p.type === "EVENT").length;
  const achievementCount = posts.filter((p) => p.type === "ACHIEVEMENT").length;
  const newsCount = posts.filter((p) => p.type === "NEWS").length;

  return (
    <div className="space-y-6">
      {/* 1. Header with Publisher Button */}
      <div className="border border-prayas-rule bg-white rounded-2xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Community Editorial & Press Desk</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink">
            Field Dispatches & Events Publisher
          </h1>
          <p className="text-xs text-prayas-muted max-w-2xl">
            Publish, edit, and manage grassroots event reports, photo galleries, and field announcements across Vrindavan, Mathura, and Braj rural centers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (isCreating) {
                handleCancelForm();
              } else {
                setIsCreating(true);
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#2E5339] text-white hover:bg-[#23432b] transition-all shadow-md"
            style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
          >
            {isCreating ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>
              {isCreating
                ? editingPostId
                  ? "Cancel Edit"
                  : "Cancel Publisher"
                : "Create New Dispatch / Event"}
            </span>
          </button>

          <button
            onClick={fetchPosts}
            disabled={loading}
            className="p-2.5 bg-prayas-stone hover:bg-prayas-paper text-prayas-ink rounded-xl border border-prayas-rule shadow-sm transition-colors disabled:opacity-50"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-prayas-neem" : ""}`} />
          </button>
        </div>
      </div>

      {/* 2. Top Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="border border-prayas-rule bg-white rounded-xl p-4 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-prayas-muted uppercase tracking-wider">Total Published</span>
          <p className="font-serif text-2xl font-bold text-prayas-ink">{posts.length}</p>
          <span className="text-[10px] text-slate-400">Public stories</span>
        </div>

        <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-4 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Field Events & Camps</span>
          <p className="font-serif text-2xl font-bold text-emerald-950">{eventCount}</p>
          <span className="text-[10px] text-emerald-700 font-medium">On-ground seva</span>
        </div>

        <div className="border border-purple-200 bg-purple-50/50 rounded-xl p-4 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">Achievements & Awards</span>
          <p className="font-serif text-2xl font-bold text-purple-950">{achievementCount}</p>
          <span className="text-[10px] text-purple-700">Milestones verified</span>
        </div>

        <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-4 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Press & News Bulletins</span>
          <p className="font-serif text-2xl font-bold text-blue-950">{newsCount}</p>
          <span className="text-[10px] text-blue-700">Official notices</span>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">
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
          <button onClick={() => setErrorMsg(null)} className="text-red-700 hover:text-red-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. CREATE / EDIT DISPATCH FORM */}
      {isCreating && (
        <div className="border border-emerald-900/20 bg-white rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-prayas-rule pb-3 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-prayas-ink">
                {editingPostId ? "Edit Field Report / Event" : "Create New Field Report / Event Story"}
              </h2>
              <p className="text-xs text-prayas-muted mt-0.5">
                {editingPostId ? "Updating existing field dispatch" : "All photos uploaded will be stored in /uploads and published to the public gallery."}
              </p>
            </div>
            <button
              onClick={handleCancelForm}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Title & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block font-bold text-prayas-ink">
                  Event / Story Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual School Bag & Sweater Distribution in Raman Reti"
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/40 text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-medium text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-prayas-ink">
                  URL Slug (Auto-generated) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="annual-school-bag-distribution"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/40 text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-mono text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Type, Date, Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block font-bold text-prayas-ink">
                  Post Category / Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/40 text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-semibold text-xs sm:text-sm"
                >
                  <option value="EVENT">EVENT (Field Camp / Distribution)</option>
                  <option value="NEWS">NEWS (Organization Milestone)</option>
                  <option value="ACHIEVEMENT">ACHIEVEMENT (Student / Seva Award)</option>
                  <option value="ANNOUNCEMENT">ANNOUNCEMENT (Urgent Notice)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-prayas-ink">
                  Event / Activity Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/40 text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-mono text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-prayas-ink">
                  Location / Village *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Raman Reti Center, Vrindavan"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/40 text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-medium text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* MODULAR IMAGE UPLOADS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-2xl bg-prayas-stone/30 border border-prayas-rule">
              <div>
                <ImageUpload
                  label="Primary Cover Photo"
                  description="Upload banner photo (saved directly to server folder)"
                  value={formData.coverImage}
                  onChange={(url) => setFormData((prev) => ({ ...prev, coverImage: url }))}
                />
              </div>

              <div>
                <ImageUpload
                  multiple={true}
                  label="Event Photo Gallery (Multi-Upload)"
                  description="Upload multiple field photos saved to /uploads/"
                  value={formData.galleryImages}
                  onChange={(urls) => setFormData((prev) => ({ ...prev, galleryImages: urls }))}
                />
              </div>
            </div>

            {/* Summary / Excerpt */}
            <div className="space-y-1.5">
              <label className="block font-bold text-prayas-ink">
                Short Summary / Excerpt
              </label>
              <textarea
                rows={2}
                placeholder="Brief 1-2 sentence overview shown in homepage feed and search previews..."
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/40 text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem text-xs sm:text-sm"
              />
            </div>

            {/* Full Story Content */}
            <div className="space-y-1.5">
              <label className="block font-bold text-prayas-ink">
                Full Field Report Content *
              </label>
              <textarea
                rows={6}
                required
                placeholder="Detailed field write-up, beneficiaries count, volunteer names, and impact summary..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/40 text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem leading-relaxed text-xs sm:text-sm"
              />
            </div>

            {/* Publishing Controls */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-prayas-rule">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-prayas-ink">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="rounded text-prayas-neem focus:ring-prayas-neem w-4 h-4"
                />
                <span>Publish immediately to live public feed</span>
              </label>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-5 py-2.5 rounded-xl border border-prayas-rule font-semibold text-prayas-ink hover:bg-prayas-stone"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl font-bold bg-[#2E5339] text-white hover:bg-[#23432b] shadow-md flex items-center gap-2 disabled:opacity-50"
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
                      : editingPostId
                      ? "Update Field Dispatch →"
                      : "Publish Field Dispatch →"}
                  </span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* 4. DISPATCHES DATA TABLE */}
      <div className="bg-white border border-prayas-rule rounded-2xl overflow-hidden shadow-card">
        <div className="p-4 border-b border-prayas-rule flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="font-serif font-bold text-base text-prayas-ink">
            Published Field Dispatches & Stories ({posts.length})
          </span>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-prayas-muted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-prayas-rule bg-prayas-stone/40 text-xs text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-medium"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-prayas-muted text-xs">
            <RefreshCw className="w-6 h-6 text-prayas-neem animate-spin mx-auto mb-2" />
            <p className="font-semibold text-prayas-ink">Loading field reports...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-16 text-center text-prayas-muted text-xs space-y-3">
            <CheckCircle2 className="w-10 h-10 text-prayas-neem mx-auto" />
            <h3 className="font-serif text-lg font-bold text-prayas-ink">
              No Field Dispatches Found
            </h3>
            <p className="max-w-md mx-auto leading-relaxed">
              No field stories match your search. Click "Create New Dispatch / Event" to write a report and upload photos.
            </p>
          </div>
        ) : (
          <div>
            {/* 1. MOBILE CARD LIST (< md) */}
            <div className="md:hidden divide-y divide-prayas-rule">
          {filteredPosts.map((post) => (
            <div key={post.id} className="p-4 space-y-3 hover:bg-prayas-stone/20 transition-colors">
              {/* Top: Thumbnail & Title */}
              <div className="flex items-start gap-3">
                {post.coverImage ? (
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-prayas-rule shrink-0 bg-prayas-stone">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl border border-prayas-rule shrink-0 bg-prayas-stone flex items-center justify-center text-prayas-muted">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}

                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="font-bold text-prayas-ink text-sm leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-[10px] text-prayas-muted font-mono truncate">
                    /blog/{post.slug}
                  </p>
                </div>
              </div>

              {/* Middle: Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  post.type === "ACHIEVEMENT"
                    ? "bg-purple-50 text-purple-800 border-purple-200"
                    : post.type === "NEWS"
                    ? "bg-blue-50 text-blue-800 border-blue-200"
                    : "bg-emerald-50 text-emerald-800 border-emerald-200"
                }`}>
                  {post.type || "EVENT"}
                </span>

                <button
                  type="button"
                  onClick={() => togglePublished(post)}
                  disabled={actionLoading === post.id}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                    post.published
                      ? "bg-emerald-100 text-emerald-900 border border-emerald-200 hover:bg-emerald-200"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                  }`}
                >
                  {post.published ? (
                    <>
                      <Eye className="w-3 h-3 text-emerald-700" />
                      <span>Published</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3 text-slate-500" />
                      <span>Draft</span>
                    </>
                  )}
                </button>

                <span className="text-[10px] font-semibold text-prayas-ink bg-prayas-stone px-2 py-0.5 rounded-md border border-prayas-rule inline-flex items-center gap-1">
                  📷 {post.images && post.images.length > 0 ? `${post.images.length} photos` : "1 photo"}
                </span>
              </div>

              {/* Date & Location Line */}
              <div className="flex items-center justify-between text-[11px] text-prayas-muted pt-0.5">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-700">
                    {post.eventDate
                      ? new Date(post.eventDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : new Date(post.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                  </span>
                </div>

                {post.location && (
                  <div className="flex items-center gap-1 truncate max-w-[50%]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{post.location}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-prayas-rule/60 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStartEdit(post)}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-prayas-stone hover:bg-slate-200 text-prayas-ink border border-prayas-rule inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Edit</span>
                </button>

                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-prayas-stone hover:bg-slate-200 text-prayas-ink border border-prayas-rule inline-flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span>View</span>
                </Link>

                <button
                  type="button"
                  onClick={() => handleDelete(post.id)}
                  disabled={actionLoading === post.id}
                  className="p-2 text-slate-400 hover:text-rose-600 bg-prayas-stone hover:bg-rose-50 rounded-xl border border-prayas-rule transition-colors inline-flex items-center justify-center disabled:opacity-50 cursor-pointer"
                  title="Delete post"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 2. DESKTOP TABLE VIEW (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-prayas-ink">
            <thead className="bg-prayas-stone border-b border-prayas-rule text-prayas-muted uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-4 min-w-[260px]">Post & Cover</th>
                <th className="p-4 min-w-[110px]">Category</th>
                <th className="p-4 min-w-[150px]">Event Date & Location</th>
                <th className="p-4 min-w-[110px]">Status</th>
                <th className="p-4 min-w-[100px]">Gallery</th>
                <th className="p-4 min-w-[140px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-prayas-rule">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-prayas-stone/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {post.coverImage ? (
                        <div className="w-14 h-11 rounded-lg overflow-hidden border border-prayas-rule shrink-0 bg-prayas-stone">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-11 rounded-lg border border-prayas-rule shrink-0 bg-prayas-stone flex items-center justify-center text-prayas-muted">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="font-bold text-prayas-ink text-sm block hover:text-prayas-neem line-clamp-1">
                          {post.title}
                        </span>
                        <span className="text-[10px] text-prayas-muted font-mono truncate block">
                          /blog/{post.slug}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      post.type === "ACHIEVEMENT"
                        ? "bg-purple-50 text-purple-800 border-purple-200"
                        : post.type === "NEWS"
                        ? "bg-blue-50 text-blue-800 border-blue-200"
                        : "bg-emerald-50 text-emerald-800 border-emerald-200"
                    }`}>
                      {post.type || "EVENT"}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="text-prayas-ink font-semibold">
                      {post.eventDate
                        ? new Date(post.eventDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : new Date(post.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                    </div>
                    {post.location && (
                      <div className="text-[11px] text-prayas-muted flex items-center gap-1 mt-0.5 truncate max-w-xs">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{post.location}</span>
                      </div>
                    )}
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => togglePublished(post)}
                      disabled={actionLoading === post.id}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                        post.published
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-200 hover:bg-emerald-200"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                      }`}
                    >
                      {post.published ? (
                        <>
                          <Eye className="w-3 h-3 text-emerald-700" />
                          <span>Published</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 text-slate-500" />
                          <span>Draft</span>
                        </>
                      )}
                    </button>
                  </td>

                  <td className="p-4 text-prayas-muted text-[11px]">
                    {post.images && post.images.length > 0 ? (
                      <span className="font-semibold text-prayas-ink bg-prayas-stone px-2 py-0.5 rounded-md border border-prayas-rule">
                        📷 {post.images.length} photos
                      </span>
                    ) : (
                      <span className="text-slate-400">1 photo</span>
                    )}
                  </td>

                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleStartEdit(post)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-prayas-stone hover:bg-slate-200 text-prayas-ink border border-prayas-rule inline-flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3 text-emerald-700" />
                      <span>Edit</span>
                    </button>

                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-prayas-stone hover:bg-slate-200 text-prayas-ink border border-prayas-rule inline-flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                      <span>View</span>
                    </Link>

                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={actionLoading === post.id}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center disabled:opacity-50 cursor-pointer"
                      title="Delete post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  </div>
);
}
