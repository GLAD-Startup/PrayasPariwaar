"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";
import { apiFetch } from "@/lib/api";
import {
  FolderKanban,
  Plus,
  ExternalLink,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  Loader2,
  RefreshCw,
  Edit2,
  Save,
  ImageIcon,
  Layers,
} from "lucide-react";

const CATEGORIES = [
  { value: "EDUCATION", label: "EDUCATION (Free Education & School Kits)" },
  { value: "HEALTH", label: "HEALTH (Blood Donation & Medical Camps)" },
  { value: "PLANTATION", label: "PLANTATION (Native Trees & Green Braj)" },
  { value: "JEEV_JAL", label: "JEEV_JAL (Jeev Jal & Animal Seva)" },
  { value: "VOCATIONAL", label: "VOCATIONAL (Skill Training & Medical Equipment Bank)" },
  { value: "AWARENESS", label: "AWARENESS (Daan Vardaan & De-Addiction)" },
  { value: "OTHER", label: "OTHER (Community Relief)" },
];

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Full Edit Modal State
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    slug: "",
    category: "EDUCATION",
    description: "",
    goalAmount: 200000,
    raisedAmount: 0,
    status: "ACTIVE",
    coverImage: "",
    galleryImages: [] as string[],
    albumId: "",
  });

  // New Project Form State
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "EDUCATION",
    description: "",
    goalAmount: 200000,
    raisedAmount: 0,
    status: "ACTIVE",
    coverImage: "",
    galleryImages: [] as string[],
    metaTitle: "",
    metaDescription: "",
    albumId: "",
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const [res, albumRes] = await Promise.all([
        apiFetch("/api/projects"),
        apiFetch("/api/gallery"),
      ]);
      const json = await res.json();
      if (json.success) {
        setProjects(json.data);
      }
      const albumJson = await albumRes.json();
      if (albumJson.success && albumJson.data) {
        setAlbums(albumJson.data.albums || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setFormData((prev) => ({ ...prev, title, slug }));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload = {
        title: formData.title,
        slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, "-"),
        category: formData.category,
        description: formData.description,
        goalAmount: Number(formData.goalAmount),
        raisedAmount: Number(formData.raisedAmount),
        status: formData.status,
        coverImage: formData.coverImage || (formData.galleryImages[0] || null),
        imageUrls: formData.galleryImages,
        albumId: formData.albumId || null,
        metaTitle: formData.metaTitle || `${formData.title} | Prayas Pariwaar`,
        metaDescription: formData.metaDescription || formData.description.substring(0, 150),
      };

      const res = await apiFetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create project.");
      }

      setSuccessMsg("Program / cause created successfully and photos synced to gallery!");
      setIsCreating(false);
      setFormData({
        title: "",
        slug: "",
        category: "EDUCATION",
        description: "",
        goalAmount: 200000,
        raisedAmount: 0,
        status: "ACTIVE",
        coverImage: "",
        galleryImages: [],
        metaTitle: "",
        metaDescription: "",
        albumId: "",
      });
      fetchProjects();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create project.");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (project: any) => {
    setEditingProject(project);
    const existingImages = project.images ? project.images.map((img: any) => img.url) : [];
    setEditFormData({
      title: project.title,
      slug: project.slug,
      category: project.category || "EDUCATION",
      description: project.description || "",
      goalAmount: project.goalAmount || 0,
      raisedAmount: project.raisedAmount || 0,
      status: project.status || "ACTIVE",
      coverImage: project.coverImage || "",
      galleryImages: existingImages,
      albumId: project.albumId || "",
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const payload = {
        title: editFormData.title,
        slug: editFormData.slug,
        category: editFormData.category,
        description: editFormData.description,
        goalAmount: Number(editFormData.goalAmount),
        raisedAmount: Number(editFormData.raisedAmount),
        status: editFormData.status,
        coverImage: editFormData.coverImage || null,
        imageUrls: editFormData.galleryImages,
        albumId: editFormData.albumId || null,
      };

      const res = await apiFetch(`/api/projects/${editingProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update project.");
      }

      setSuccessMsg(`Program "${editFormData.title}" updated successfully!`);
      setEditingProject(null);
      fetchProjects();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update project.");
    } finally {
      setSubmitting(false);
    }
  };

  const updateProjectStatus = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      const res = await apiFetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
        );
        setSuccessMsg(`Status updated to ${newStatus}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this program/project?")) return;

    setActionLoading(id);
    try {
      const res = await apiFetch(`/api/projects/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        setSuccessMsg("Project deleted successfully.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border border-prayas-rule bg-white rounded-2xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
            <FolderKanban className="w-3.5 h-3.5 text-emerald-600" />
            <span>Grassroots Program Administration</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink">
            Programs & Project Causes
          </h1>
          <p className="text-xs text-prayas-muted max-w-2xl">
            Create, edit, and manage initiatives across the 5 Seva Streams. Upload photos directly from your computer or drag & drop.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => {
              setIsCreating(!isCreating);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#2E5339] text-white hover:bg-[#23432b] transition-all shadow-md"
            style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
          >
            {isCreating ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isCreating ? "Cancel" : "Add New Program"}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)}>
            <X className="w-4 h-4 text-green-700" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)}>
            <X className="w-4 h-4 text-red-700" />
          </button>
        </div>
      )}

      {/* CREATE FORM DRAWER */}
      {isCreating && (
        <div className="bg-white border border-prayas-rule rounded-2xl p-6 sm:p-8 shadow-card space-y-6 animate-in fade-in duration-200 text-xs">
          <div className="border-b border-prayas-rule pb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-prayas-ink">
              Create New Program / Cause
            </h2>
            <button onClick={() => setIsCreating(false)}>
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-prayas-ink block">Program Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vrindavan Harit Kranti - 5,000 Tree Drive"
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-prayas-ink block">URL Slug *</label>
                <input
                  type="text"
                  required
                  placeholder="vrindavan-harit-kranti"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-prayas-rule bg-prayas-stone text-prayas-muted font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-prayas-ink block">Program Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink font-semibold"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-prayas-ink block">Funding Target Goal (₹) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.goalAmount}
                  onChange={(e) => setFormData({ ...formData, goalAmount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-prayas-ink block">Initial Raised Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.raisedAmount}
                  onChange={(e) => setFormData({ ...formData, raisedAmount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink font-mono"
                />
              </div>
            </div>

            {/* LINK PROJECT TO GALLERY ALBUM */}
            <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-700" />
                  <span>Link to Photo Gallery Album</span>
                </label>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-200">
                  Auto-Sync Photos to Gallery
                </span>
              </div>
              <select
                value={formData.albumId}
                onChange={(e) => setFormData({ ...formData, albumId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-emerald-300 bg-white text-prayas-ink text-xs focus:ring-2 focus:ring-emerald-600 outline-none font-medium"
              >
                <option value="">-- No Linked Album (Standalone Project) --</option>
                {albums.map((alb) => (
                  <option key={alb.id} value={alb.id}>
                    📁 {alb.title} ({alb.category})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-emerald-800 leading-tight">
                💡 When an album is linked, all cover and gallery photos uploaded below will automatically appear in that album and across the public photo gallery!
              </p>
            </div>

            {/* DIRECT FILE UPLOADS: COVER & GALLERY */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-prayas-stone/40 border border-prayas-rule">
              <div>
                <ImageUpload
                  label="Program Cover Image (Upload from Computer)"
                  description="Single photo used as main banner"
                  value={formData.coverImage}
                  onChange={(url) => setFormData((prev) => ({ ...prev, coverImage: url }))}
                />
              </div>

              <div>
                <ImageUpload
                  multiple={true}
                  label="Field Photo Gallery (Multi-File Upload)"
                  description="Upload multiple high-res photos"
                  value={formData.galleryImages}
                  onChange={(urls) => setFormData((prev) => ({ ...prev, galleryImages: urls }))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-prayas-ink block">Detailed Narrative *</label>
              <textarea
                rows={4}
                required
                placeholder="Explain the background, goals, and impact of this initiative in Mathura & Vrindavan..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2.5 rounded-lg border border-prayas-rule font-semibold text-prayas-ink hover:bg-prayas-stone"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-lg font-bold bg-[#2E5339] text-white hover:bg-[#23432b] shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{submitting ? "Saving..." : "Create & Launch Cause →"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PROJECTS TABLE */}
      <div className="bg-white border border-prayas-rule rounded-2xl overflow-hidden shadow-card">
        {loading ? (
          <div className="p-12 text-center text-prayas-muted text-xs">
            <RefreshCw className="w-6 h-6 text-emerald-700 animate-spin mx-auto mb-2" />
            <span>Loading programs and causes...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center text-prayas-muted text-xs">
            No programs created yet. Click "Add New Program" above to launch a cause.
          </div>
        ) : (
          <div>
            {/* 1. MOBILE CARDS (< md) */}
            <div className="md:hidden divide-y divide-prayas-rule">
          {projects.map((p) => {
            const percent = p.goalAmount > 0
              ? Math.min(Math.round((p.raisedAmount / p.goalAmount) * 100), 100)
              : 0;

            return (
              <div key={p.id} className="p-4 space-y-3 hover:bg-prayas-stone/20 transition-colors">
                <div className="flex items-start gap-3">
                  {p.coverImage ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-prayas-rule shrink-0 bg-prayas-stone">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.coverImage}
                        alt={p.title}
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
                      {p.title}
                    </h3>
                    <p className="text-[10px] text-prayas-muted font-mono truncate">
                      /projects/{p.slug}
                    </p>
                  </div>
                </div>

                {/* Category, Status & Photo Count */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-prayas-neem border border-green-200">
                      {p.category}
                    </span>

                    <span className="text-[10px] font-semibold text-prayas-ink bg-prayas-stone px-2 py-0.5 rounded-md border border-prayas-rule">
                      📷 {p.images && p.images.length > 0 ? `${p.images.length} photos` : "1 cover"}
                    </span>

                    {p.album && (
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-emerald-600" />
                        <span>{p.album.title}</span>
                      </span>
                    )}
                  </div>

                  <select
                    value={p.status}
                    onChange={(e) => updateProjectStatus(p.id, e.target.value)}
                    disabled={actionLoading === p.id}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border outline-none ${
                      p.status === "ACTIVE"
                        ? "bg-green-100 text-emerald-900 border-green-200"
                        : p.status === "COMPLETED"
                        ? "bg-blue-100 text-blue-900 border-blue-200"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="UPCOMING">UPCOMING</option>
                  </select>
                </div>

                {/* Funding Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-bold text-prayas-ink">
                      ₹{p.raisedAmount?.toLocaleString("en-IN") || 0}
                    </span>
                    <span className="text-prayas-muted text-[11px]">
                      Goal: ₹{p.goalAmount?.toLocaleString("en-IN") || 0} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-prayas-stone rounded-full overflow-hidden border border-prayas-rule">
                    <div
                      className="h-full bg-emerald-700 rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-prayas-rule/60 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(p)}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Edit</span>
                  </button>

                  <Link
                    href={`/projects/${p.slug}`}
                    target="_blank"
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-prayas-stone hover:bg-slate-200 text-prayas-ink border border-prayas-rule inline-flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                    <span>View</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    disabled={actionLoading === p.id}
                    className="p-2 text-slate-400 hover:text-rose-600 bg-prayas-stone hover:bg-rose-50 rounded-xl border border-prayas-rule transition-colors inline-flex items-center justify-center disabled:opacity-50 cursor-pointer shadow-xs"
                    title="Delete program"
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
                <th className="p-4 min-w-[260px]">Program & Cover</th>
                <th className="p-4 min-w-[110px]">Category</th>
                <th className="p-4 min-w-[200px]">Funding Progress (₹)</th>
                <th className="p-4 min-w-[120px]">Status</th>
                <th className="p-4 min-w-[140px]">Gallery & Album</th>
                <th className="p-4 min-w-[140px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-prayas-rule">
              {projects.map((p) => {
                const percent = p.goalAmount > 0
                  ? Math.min(Math.round((p.raisedAmount / p.goalAmount) * 100), 100)
                  : 0;

                return (
                  <tr key={p.id} className="hover:bg-prayas-paper transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {p.coverImage && (
                          <div className="w-14 h-11 rounded-lg overflow-hidden border border-prayas-rule shrink-0 bg-prayas-stone">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.coverImage}
                              alt={p.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-prayas-ink text-sm block">
                            {p.title}
                          </span>
                          <span className="text-[10px] text-prayas-muted font-mono">
                            /projects/{p.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-prayas-neem border border-green-200">
                        {p.category}
                      </span>
                    </td>

                    <td className="p-4 w-52">
                      <div className="space-y-1">
                        <div className="flex justify-between items-baseline text-[11px]">
                          <span className="font-bold text-prayas-ink">
                            ₹{p.raisedAmount?.toLocaleString("en-IN") || 0}
                          </span>
                          <span className="text-prayas-muted text-[10px]">
                            / ₹{p.goalAmount?.toLocaleString("en-IN") || 0} ({percent}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-prayas-stone rounded-full overflow-hidden border border-prayas-rule">
                          <div
                            className="h-full bg-emerald-700 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <select
                        value={p.status}
                        onChange={(e) => updateProjectStatus(p.id, e.target.value)}
                        disabled={actionLoading === p.id}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border outline-none ${
                          p.status === "ACTIVE"
                            ? "bg-green-100 text-emerald-900 border-green-200"
                            : p.status === "COMPLETED"
                            ? "bg-blue-100 text-blue-900 border-blue-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="UPCOMING">UPCOMING</option>
                      </select>
                    </td>

                    <td className="p-4 text-prayas-muted text-[11px]">
                      <div className="space-y-1">
                        <div>
                          {p.images && p.images.length > 0 ? (
                            <span className="font-semibold text-prayas-ink">
                              📷 {p.images.length} photos
                            </span>
                          ) : (
                            <span>1 cover</span>
                          )}
                        </div>
                        {p.album && (
                          <div className="inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                            <Layers className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate max-w-[130px]">{p.album.title}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-xl border border-emerald-200 transition-colors shadow-sm cursor-pointer"
                        title="Edit Program & Images"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Edit</span>
                      </button>

                      <Link
                        href={`/projects/${p.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-prayas-stone hover:bg-white text-prayas-ink text-[11px] font-bold rounded-xl border border-prayas-rule transition-colors shadow-sm"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View</span>
                      </Link>

                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={actionLoading === p.id}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center disabled:opacity-50 cursor-pointer"
                        title="Delete project"
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

      {/* FULL EDIT PROGRAM & CAUSES MODAL WITH IMAGE UPLOADS */}
      {editingProject && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-prayas-rule space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-prayas-rule pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-prayas-ink">
                  Edit Program: {editingProject.title}
                </h3>
                <span className="text-xs text-prayas-muted">
                  Update cause details, funding numbers, and upload photos directly.
                </span>
              </div>
              <button
                onClick={() => setEditingProject(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-prayas-ink block">Program Title *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/30 focus:bg-white text-xs outline-none focus:ring-2 focus:ring-emerald-700 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-prayas-ink block">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.slug}
                    onChange={(e) => setEditFormData({ ...editFormData, slug: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/30 focus:bg-white text-xs outline-none focus:ring-2 focus:ring-emerald-700 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-prayas-ink block">Category *</label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/30 text-xs outline-none focus:ring-2 focus:ring-emerald-700"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-prayas-ink block">Status *</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/30 text-xs outline-none focus:ring-2 focus:ring-emerald-700"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-prayas-ink block">Funding Goal (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.goalAmount}
                    onChange={(e) => setEditFormData({ ...editFormData, goalAmount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/30 focus:bg-white text-xs outline-none focus:ring-2 focus:ring-emerald-700 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-prayas-ink block">Raised Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={editFormData.raisedAmount}
                  onChange={(e) => setEditFormData({ ...editFormData, raisedAmount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/30 focus:bg-white text-xs outline-none focus:ring-2 focus:ring-emerald-700 font-mono"
                />
              </div>

              {/* LINK PROJECT TO GALLERY ALBUM IN EDIT MODAL */}
              <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Link to Photo Gallery Album</span>
                  </label>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-200">
                    Auto-Sync
                  </span>
                </div>
                <select
                  value={editFormData.albumId}
                  onChange={(e) => setEditFormData({ ...editFormData, albumId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-emerald-300 bg-white text-prayas-ink text-xs focus:ring-2 focus:ring-emerald-600 outline-none font-medium"
                >
                  <option value="">-- No Linked Album (Standalone Project) --</option>
                  {albums.map((alb) => (
                    <option key={alb.id} value={alb.id}>
                      📁 {alb.title} ({alb.category})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-emerald-800">
                  Saving will automatically sync all cover and gallery photos into this album in the public gallery.
                </p>
              </div>

              {/* DIRECT FILE UPLOADER FOR EDIT MODAL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-prayas-rule">
                <div>
                  <ImageUpload
                    label="Program Cover Image"
                    description="Upload new banner image"
                    value={editFormData.coverImage}
                    onChange={(url) => setEditFormData((prev) => ({ ...prev, coverImage: url }))}
                  />
                </div>

                <div>
                  <ImageUpload
                    multiple={true}
                    label="Field Photo Gallery"
                    description="Add more photos or delete existing"
                    value={editFormData.galleryImages}
                    onChange={(urls) => setEditFormData((prev) => ({ ...prev, galleryImages: urls }))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-prayas-ink block">Description / Narrative *</label>
                <textarea
                  rows={4}
                  required
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/30 focus:bg-white text-xs outline-none focus:ring-2 focus:ring-emerald-700 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-prayas-rule">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 bg-prayas-stone text-prayas-ink font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
