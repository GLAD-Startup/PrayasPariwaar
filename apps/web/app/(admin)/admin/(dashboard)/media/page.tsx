"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";
import { apiFetch } from "@/lib/api";
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
  Radio,
  FileText,
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
            Upload and organize print news articles, electronic press clips, and television broadcast reports documenting Prayas Pariwaar's on-ground seva across Mathura and Vrindavan.
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
            <span>{isCreating ? (editingItemId ? "Cancel Edit" : "Cancel Form") : "Add New Press Coverage"}</span>
          </button>

          <button
            onClick={fetchMedia}
            disabled={loading}
            className="p-2.5 bg-prayas-stone hover:bg-prayas-paper text-prayas-ink rounded-xl border border-prayas-rule shadow-sm transition-colors disabled:opacity-50"
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
          <span className="text-[10px] text-emerald-700 font-medium">Newspapers & magazines</span>
        </div>

        <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-4 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1">
            <Tv className="w-3.5 h-3.5 text-blue-700" />
            Electronic & TV Broadcasts
          </span>
          <p className="font-serif text-2xl font-bold text-blue-950">{electronicCount}</p>
          <span className="text-[10px] text-blue-700 font-medium">Video & web news</span>
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

      {/* 3. CREATE / EDIT MEDIA FORM */}
      {isCreating && (
        <div className="border border-emerald-900/20 bg-white rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-prayas-rule pb-3 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-prayas-ink">
                {editingItemId ? "Edit Media Coverage Report" : "Add Press Coverage / News Report"}
              </h2>
              <p className="text-xs text-prayas-muted mt-0.5">
                Featured on the public /media page with downloadable high-res clipping.
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
                  <option value="PRINT">PRINT (Newspaper / Magazine Clipping)</option>
                  <option value="ELECTRONIC">ELECTRONIC (TV News / Video Broadcast / Online)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-prayas-ink block">
                  Publication / News Channel Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dainik Jagran, Amar Ujala, News18, Hindustan"
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
                <label className="font-bold text-prayas-ink block">
                  External Article / Video Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://jagran.com/news/... or YouTube video link"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/40 text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-mono text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* MODULAR IMAGE UPLOAD FOR SCANNED CLIPPING */}
            <div className="p-5 rounded-2xl bg-prayas-stone/30 border border-prayas-rule">
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
              No media items match your search. Click "Add New Press Coverage" to upload scanned newspaper clippings and TV links.
            </p>
          </div>
        ) : (
          <div>
            {/* 1. MOBILE CARDS (< md) */}
            <div className="md:hidden divide-y divide-prayas-rule">
          {filteredItems.map((item) => (
            <div key={item.id} className="p-4 space-y-3 hover:bg-prayas-stone/20 transition-colors">
              <div className="flex items-start gap-3">
                {item.imageUrl ? (
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-prayas-rule shrink-0 bg-prayas-stone">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl border border-prayas-rule shrink-0 bg-prayas-stone flex items-center justify-center text-prayas-muted">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="font-bold text-prayas-ink text-sm leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-600">
                    {item.source || "Dainik Jagran"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
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

                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-prayas-stone hover:bg-slate-200 text-prayas-ink border border-prayas-rule inline-flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                    <span>Visit</span>
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
          ))}
        </div>

        {/* 2. DESKTOP TABLE VIEW (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-prayas-ink">
            <thead className="bg-prayas-stone border-b border-prayas-rule text-prayas-muted uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-4 min-w-[260px]">Report Headline & Clipping</th>
                <th className="p-4 min-w-[100px]">Format</th>
                <th className="p-4 min-w-[130px]">Source / Publication</th>
                <th className="p-4 min-w-[110px]">Published Date</th>
                <th className="p-4 min-w-[110px]">External Link</th>
                <th className="p-4 min-w-[130px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-prayas-rule">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-prayas-stone/30 transition-colors">
                  <td className="p-4 max-w-sm sm:max-w-md">
                    <div className="flex items-center gap-3">
                      {item.imageUrl ? (
                        <div className="w-14 h-11 rounded-lg overflow-hidden border border-prayas-rule shrink-0 bg-prayas-stone">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-11 rounded-lg border border-prayas-rule shrink-0 bg-prayas-stone flex items-center justify-center text-prayas-muted">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                      <span className="font-bold text-prayas-ink text-sm line-clamp-2">
                        {item.title}
                      </span>
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
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-prayas-neem font-semibold hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Visit Article</span>
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400">Scanned Only</span>
                    )}
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
