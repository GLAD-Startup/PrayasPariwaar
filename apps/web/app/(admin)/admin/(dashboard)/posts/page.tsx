"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";
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
      const res = await fetch("/api/posts?all=true");
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
      slug: generatedSlug,
    }));
  };

  const handleStartEdit = (post: any) => {
    setEditingPostId(post.id);
    setFormData({
      title: post.title || "",
      slug: post.slug || "",
      type: post.type || "EVENT",
      excerpt: post.excerpt || "",
      content: post.content || "",
      eventDate: post.eventDate
        ? new Date(post.eventDate).toISOString().split("T")[0]
        : new Date(post.createdAt).toISOString().split("T")[0],
      location: post.location || "Vrindavan, Mathura District, UP",
      coverImage: post.coverImage || "",
      galleryImages: post.images ? post.images.map((img: any) => img.url) : [],
      published: post.published ?? true,
    });
    setIsCreating(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelForm = () => {
    setIsCreating(false);
    setEditingPostId(null);
    setErrorMsg(null);
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload = {
        title: formData.title,
        slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, "-"),
        type: formData.type,
        excerpt: formData.excerpt,
        content: formData.content,
        eventDate: formData.eventDate,
        location: formData.location,
        coverImage: formData.coverImage || (formData.galleryImages[0] || null),
        imageUrls: formData.galleryImages,
        published: formData.published,
      };

      const url = editingPostId ? `/api/posts/${editingPostId}` : "/api/posts";
      const method = editingPostId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save post.");
      }

      setSuccessMsg(
        editingPostId
          ? "Field dispatch updated successfully!"
          : "Field dispatch published successfully!"
      );
      handleCancelForm();
      fetchPosts();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit post.");
    } finally {
      setSubmitting(false);
    }
  };

  const togglePublished = async (post: any) => {
    setActionLoading(post.id);
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
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
      const res = await fetch(`/api/posts/${postId}`, {
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

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="border-b border-prayas-rule pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink flex items-center gap-2">
            <FileText className="w-6 h-6 text-prayas-neem" />
            <span>Field Dispatches & Events Publisher</span>
          </h1>
          <p className="text-xs text-prayas-muted mt-1">
            Publish, edit, and manage event reports, photo galleries, and community announcements.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              if (isCreating) {
                handleCancelForm();
              } else {
                setIsCreating(true);
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold bg-[#2E5339] text-white hover:bg-[#23432b] transition-all shadow-md"
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
            className="p-2 bg-white hover:bg-prayas-stone text-prayas-ink rounded-lg border border-prayas-rule shadow-sm"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-900 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-prayas-neem shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-green-700 hover:text-green-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-prayas-crimson shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-700 hover:text-red-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* CREATE / EDIT DISPATCH FORM */}
      {isCreating && (
        <div className="border border-prayas-rule bg-white rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
          <div className="border-b border-prayas-rule pb-3 flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-prayas-ink">
              {editingPostId ? "Edit Field Report / Event" : "Create New Field Report / Event Story"}
            </h2>
            <span className="text-xs text-prayas-muted font-medium">
              {editingPostId ? "Editing existing dispatch" : "All photos saved to server folder"}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-prayas-ink">
                  Event / Story Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual School Bag & Sweater Distribution in Raman Reti"
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-xs text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-prayas-ink">
                  URL Slug (Auto-generated) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="annual-school-bag-distribution"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-xs text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-mono"
                />
              </div>
            </div>

            {/* Type, Date, Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-prayas-ink">
                  Post Category / Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-xs text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-semibold"
                >
                  <option value="EVENT">EVENT (Field Camp / Distribution)</option>
                  <option value="NEWS">NEWS (Organization Milestone)</option>
                  <option value="ACHIEVEMENT">ACHIEVEMENT (Student / Seva Award)</option>
                  <option value="ANNOUNCEMENT">ANNOUNCEMENT (Urgent Notice)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-prayas-ink">
                  Event / Activity Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-xs text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-prayas-ink">
                  Location / Village *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Raman Reti Center, Vrindavan"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-xs text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-medium"
                />
              </div>
            </div>

            {/* MODULAR IMAGE UPLOAD: Cover Photo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-prayas-stone/40 border border-prayas-rule">
              <div>
                <ImageUpload
                  label="Primary Cover Photo"
                  description="Upload banner photo (saved directly to server folder)"
                  value={formData.coverImage}
                  onChange={(url) => setFormData((prev) => ({ ...prev, coverImage: url }))}
                />
              </div>

              {/* MODULAR IMAGE UPLOAD: Multi-Photo Gallery */}
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
            <div className="space-y-1">
              <label className="block text-xs font-bold text-prayas-ink">
                Short Summary / Excerpt
              </label>
              <textarea
                rows={2}
                placeholder="Brief 1-2 sentence overview shown in homepage feed and search previews..."
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-xs text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem"
              />
            </div>

            {/* Full Story Content */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-prayas-ink">
                Full Field Report Content *
              </label>
              <textarea
                rows={6}
                required
                placeholder="Detailed field write-up, beneficiaries count, volunteer names, and impact summary..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-xs text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem leading-relaxed"
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
                  className="px-4 py-2.5 rounded-lg border border-prayas-rule text-xs font-semibold text-prayas-ink hover:bg-prayas-stone"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-lg text-xs font-bold bg-[#2E5339] text-white hover:bg-[#23432b] shadow-md flex items-center gap-2 disabled:opacity-50"
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

      {/* DISPATCHES DATA TABLE */}
      <div className="bg-white border border-prayas-rule rounded-2xl overflow-hidden shadow-card">
        <div className="p-4 border-b border-prayas-rule flex items-center justify-between">
          <span className="font-serif font-bold text-sm text-prayas-ink">
            Published Field Dispatches & Stories ({posts.length})
          </span>
          <button
            onClick={fetchPosts}
            className="text-xs font-semibold text-prayas-neem hover:underline"
          >
            Refresh List
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-prayas-muted text-xs">
            Loading field reports...
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center text-prayas-muted text-xs">
            No dispatches published yet. Click "Create New Dispatch" to upload photos and publish.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-prayas-ink">
              <thead className="bg-prayas-stone border-b border-prayas-rule text-prayas-muted uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-4">Post & Cover</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Event Date & Location</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Gallery</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-prayas-rule">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-prayas-paper transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {post.coverImage ? (
                          <div className="w-12 h-10 rounded-lg overflow-hidden border border-prayas-rule shrink-0 bg-prayas-stone">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-10 rounded-lg border border-prayas-rule shrink-0 bg-prayas-stone flex items-center justify-center text-prayas-muted">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-prayas-ink block hover:text-prayas-neem">
                            {post.title}
                          </span>
                          <span className="text-[10px] text-prayas-muted font-mono">
                            /{post.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-prayas-neem border border-green-200">
                        {post.type || "EVENT"}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="text-prayas-ink font-medium">
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
                          <MapPin className="w-3 h-3 text-prayas-muted" />
                          <span>{post.location}</span>
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => togglePublished(post)}
                        disabled={actionLoading === post.id}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                          post.published
                            ? "bg-green-100 text-emerald-900 border border-green-200 hover:bg-green-200"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
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
                        <span className="font-semibold text-prayas-ink">
                          📷 {post.images.length} photos
                        </span>
                      ) : (
                        <span>1 photo</span>
                      )}
                    </td>

                    <td className="p-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleStartEdit(post)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 hover:bg-green-100 text-prayas-neem text-[11px] font-bold rounded border border-green-200 transition-colors shadow-sm"
                        title="Edit dispatch"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-prayas-stone hover:bg-white text-prayas-ink text-[11px] font-bold rounded border border-prayas-rule transition-colors shadow-sm"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View</span>
                      </Link>

                      <button
                        onClick={() => handleDelete(post.id)}
                        disabled={actionLoading === post.id}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors inline-flex items-center disabled:opacity-50"
                        title="Delete dispatch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
