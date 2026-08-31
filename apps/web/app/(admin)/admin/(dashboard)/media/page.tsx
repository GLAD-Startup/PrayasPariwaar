"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";
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

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    type: "PRINT",
    source: "Dainik Jagran",
    url: "",
    imageUrl: "",
    publishedDate: new Date().toISOString().split("T")[0],
    order: 0,
  });

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/media");
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
    setFormData({
      title: item.title || "",
      type: item.type || "PRINT",
      source: item.source || "Dainik Jagran",
      url: item.url || "",
      imageUrl: item.imageUrl || "",
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
      imageUrl: "",
      publishedDate: new Date().toISOString().split("T")[0],
      order: 0,
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
        type: formData.type,
        source: formData.source,
        url: formData.url,
        imageUrl: formData.imageUrl || null,
        publishedDate: formData.publishedDate,
        order: Number(formData.order) || 0,
      };

      const url = editingItemId ? `/api/media/${editingItemId}` : "/api/media";
      const method = editingItemId ? "PATCH" : "POST";

      const res = await fetch(url, {
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
      const res = await fetch(`/api/media/${id}`, {
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

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="border-b border-prayas-rule pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-prayas-neem" />
            <span>Media Centre • Press & Coverage Manager</span>
          </h1>
          <p className="text-xs text-prayas-muted mt-1">
            Upload newspaper clippings, broadcast links, and press releases featured on the public Media Centre page.
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
                ? editingItemId
                  ? "Cancel Edit"
                  : "Cancel"
                : "Add New Press Coverage"}
            </span>
          </button>

          <button
            onClick={fetchMedia}
            className="p-2 bg-white hover:bg-prayas-stone text-prayas-ink rounded-lg border border-prayas-rule shadow-sm"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Messages */}
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

      {/* CREATE / EDIT FORM */}
      {isCreating && (
        <div className="border border-prayas-rule bg-white rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
          <div className="border-b border-prayas-rule pb-3 flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-prayas-ink">
              {editingItemId ? "Edit Media Coverage Report" : "Add Press Coverage / News Report"}
            </h2>
            <span className="text-xs text-prayas-muted font-medium">
              Featured on public /media page
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-prayas-ink block">
                  Headline / Report Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prayas Pariwaar Deploys 40 Free Oxygen Concentrators in Vrindavan"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-medium text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-prayas-ink block">
                  Media Format / Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-semibold"
                >
                  <option value="PRINT">PRINT (Newspaper / Magazine Clipping)</option>
                  <option value="ELECTRONIC">ELECTRONIC (TV News / Video Broadcast / Online)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-prayas-ink block">
                  Publication / News Channel Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dainik Jagran, Amar Ujala, News18, Hindustan"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-prayas-ink block">
                  Published Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.publishedDate}
                  onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-prayas-ink block">
                  External Article / Video Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://jagran.com/news/... or YouTube link"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-mono"
                />
              </div>
            </div>

            {/* MODULAR IMAGE UPLOAD FOR SCANNED CLIPPING */}
            <div className="p-4 rounded-xl bg-prayas-stone/40 border border-prayas-rule">
              <ImageUpload
                label="Scanned Newspaper Clipping / Photo / Thumbnail (Saved to Server)"
                description="Upload high-res clipping photo (saved directly to /uploads/)"
                value={formData.imageUrl}
                onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancelForm}
                className="px-4 py-2.5 rounded-lg border border-prayas-rule font-semibold text-prayas-ink hover:bg-prayas-stone"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-lg font-bold bg-[#2E5339] text-white hover:bg-[#23432b] shadow-md flex items-center gap-2 disabled:opacity-50"
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

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-prayas-rule shadow-sm text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-prayas-ink">Format Filter:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-prayas-paper border border-prayas-rule text-prayas-ink rounded-lg px-3 py-1.5 font-semibold outline-none focus:ring-2 focus:ring-prayas-neem"
          >
            <option value="ALL">All Media ({mediaItems.length})</option>
            <option value="PRINT">📰 Print Media Clippings</option>
            <option value="ELECTRONIC">📺 TV & Video Broadcasts</option>
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-prayas-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by headline or channel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-prayas-rule bg-prayas-paper text-xs text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem"
          />
        </div>
      </div>

      {/* MEDIA TABLE */}
      <div className="bg-white border border-prayas-rule rounded-xl overflow-hidden shadow-card">
        {loading ? (
          <div className="p-12 text-center text-prayas-muted text-xs">
            Loading press coverage...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-prayas-muted text-xs">
            No press reports found. Click "Add New Press Coverage" to upload clippings.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-prayas-ink">
              <thead className="bg-prayas-stone border-b border-prayas-rule text-prayas-muted uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-4">Report Headline & Clipping</th>
                  <th className="p-4">Format</th>
                  <th className="p-4">Source / Publication</th>
                  <th className="p-4">Published Date</th>
                  <th className="p-4">External Link</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-prayas-rule">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-prayas-paper transition-colors">
                    <td className="p-4 max-w-sm">
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          <div className="w-14 h-11 rounded-lg overflow-hidden border border-prayas-rule shrink-0 bg-prayas-stone">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-14 h-11 rounded-lg border border-prayas-rule shrink-0 bg-prayas-stone flex items-center justify-center text-prayas-muted">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                        <span className="font-bold text-prayas-ink line-clamp-2">
                          {item.title}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      {item.type === "PRINT" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-prayas-neem border border-green-200">
                          <Newspaper className="w-3 h-3" />
                          <span>PRINT</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200">
                          <Tv className="w-3 h-3" />
                          <span>ELECTRONIC</span>
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-prayas-ink block">
                        {item.source || "Press Release"}
                      </span>
                    </td>

                    <td className="p-4 text-prayas-muted text-[11px] font-medium whitespace-nowrap">
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
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-prayas-neem font-bold hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Visit Article</span>
                        </a>
                      ) : (
                        <span className="text-prayas-muted text-[11px]">Archived scan only</span>
                      )}
                    </td>

                    <td className="p-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 hover:bg-green-100 text-prayas-neem text-[11px] font-bold rounded border border-green-200 transition-colors shadow-sm"
                        title="Edit media report"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={actionLoading === item.id}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors inline-flex items-center disabled:opacity-50"
                        title="Delete report"
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
