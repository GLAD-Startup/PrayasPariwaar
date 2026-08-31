"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";
import {
  FolderKanban,
  Plus,
  Heart,
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
} from "lucide-react";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Editing state for quick raised amount update
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editRaisedAmount, setEditRaisedAmount] = useState<number>(0);

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
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const json = await res.json();
      if (json.success) {
        setProjects(json.data);
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

  const handleSubmit = async (e: React.FormEvent) => {
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
        metaTitle: formData.metaTitle || `${formData.title} | Prayas Pariwaar`,
        metaDescription: formData.metaDescription || formData.description.substring(0, 150),
      };

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create project.");
      }

      setSuccessMsg("Program / cause created successfully!");
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
      });
      fetchProjects();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create project.");
    } finally {
      setSubmitting(false);
    }
  };

  const updateProjectStatus = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/projects/${id}`, {
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

  const saveRaisedAmount = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raisedAmount: editRaisedAmount }),
      });
      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? { ...p, raisedAmount: editRaisedAmount } : p))
        );
        setEditingProjectId(null);
        setSuccessMsg("Funds raised amount updated.");
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
      const res = await fetch(`/api/projects/${id}`, {
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
            Create and manage community initiatives, upload high-res field photo galleries, track funding goals, and update project status in Mathura district.
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
            <span>{isCreating ? "Cancel" : "Add New Program / Cause"}</span>
          </button>

          <button
            onClick={fetchProjects}
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

      {/* CREATE NEW PROJECT FORM */}
      {isCreating && (
        <div className="border border-prayas-rule bg-white rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
          <div className="border-b border-prayas-rule pb-3">
            <h2 className="font-serif text-lg font-bold text-prayas-ink">
              Create New Program / Community Cause
            </h2>
            <p className="text-xs text-prayas-muted">
              Add a new charitable initiative with direct 80G tax receipt allocation.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-prayas-ink block">Program Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daan Vardaan: Food & Blanket Seva"
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-prayas-ink block">URL Slug (Auto-generated) *</label>
                <input
                  type="text"
                  required
                  placeholder="daan-vardaan-food-seva"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-prayas-ink block">Program Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-semibold"
                >
                  <option value="EDUCATION">EDUCATION (Study Centers, Tuition)</option>
                  <option value="HEALTH">HEALTH (Blood Desk, Equipment, Camps)</option>
                  <option value="PLANTATION">PLANTATION (Native Trees, Environment)</option>
                  <option value="AWARENESS">AWARENESS (Daan Vardaan, De-addiction)</option>
                  <option value="OTHER">OTHER (Community Relief)</option>
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
                  className="w-full px-3.5 py-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-prayas-ink block">Initial Raised Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.raisedAmount}
                  onChange={(e) => setFormData({ ...formData, raisedAmount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-mono"
                />
              </div>
            </div>

            {/* MODULAR IMAGE UPLOADS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-prayas-stone/40 border border-prayas-rule">
              <div>
                <ImageUpload
                  label="Program Cover Image (Saved to Server)"
                  value={formData.coverImage}
                  onChange={(url) => setFormData((prev) => ({ ...prev, coverImage: url }))}
                />
              </div>

              <div>
                <ImageUpload
                  multiple={true}
                  label="Program Field Gallery (Multi-Upload)"
                  value={formData.galleryImages}
                  onChange={(urls) => setFormData((prev) => ({ ...prev, galleryImages: urls }))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-prayas-ink block">Detailed Program Narrative *</label>
              <textarea
                rows={4}
                required
                placeholder="Explain the background, why this cause exists in Vrindavan, what beneficiaries receive, and how funds are deployed..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem leading-relaxed"
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
                style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{submitting ? "Saving..." : "Create & Launch Cause →"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PROJECTS TABLE */}
      <div className="bg-white border border-prayas-rule rounded-xl overflow-hidden shadow-card">
        {loading ? (
          <div className="p-12 text-center text-prayas-muted text-xs">
            Loading programs...
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center text-prayas-muted text-xs">
            No programs created yet. Click "Add New Program" above to launch a cause.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-prayas-ink">
              <thead className="bg-prayas-stone border-b border-prayas-rule text-prayas-muted uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-4">Program & Cover</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Funding Progress (₹)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Gallery</th>
                  <th className="p-4 text-right">Actions</th>
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
                            <div className="w-12 h-10 rounded-lg overflow-hidden border border-prayas-rule shrink-0 bg-prayas-stone">
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

                      <td className="p-4 w-48">
                        {editingProjectId === p.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={editRaisedAmount}
                              onChange={(e) => setEditRaisedAmount(Number(e.target.value))}
                              className="w-24 px-2 py-1 border border-prayas-rule rounded text-xs font-mono font-bold"
                            />
                            <button
                              onClick={() => saveRaisedAmount(p.id)}
                              className="p-1 text-green-700 hover:bg-green-100 rounded"
                              title="Save"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingProjectId(null)}
                              className="p-1 text-slate-500 hover:bg-slate-100 rounded"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex justify-between items-baseline text-[11px]">
                              <span className="font-bold text-prayas-ink">
                                ₹{p.raisedAmount.toLocaleString("en-IN")}
                              </span>
                              <span className="text-prayas-muted text-[10px]">
                                / ₹{p.goalAmount.toLocaleString("en-IN")} ({percent}%)
                              </span>
                              <button
                                onClick={() => {
                                  setEditingProjectId(p.id);
                                  setEditRaisedAmount(p.raisedAmount);
                                }}
                                className="text-slate-400 hover:text-slate-700 ml-1"
                                title="Edit amount"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="w-full h-1.5 bg-prayas-stone rounded-full overflow-hidden border border-prayas-rule">
                              <div
                                className="h-full bg-prayas-neem rounded-full"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        )}
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
                        {p.images && p.images.length > 0 ? (
                          <span className="font-semibold text-prayas-ink">
                            📷 {p.images.length} photos
                          </span>
                        ) : (
                          <span>1 cover</span>
                        )}
                      </td>

                      <td className="p-4 text-right space-x-2">
                        <Link
                          href={`/projects/${p.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-prayas-stone hover:bg-white text-prayas-ink text-[11px] font-bold rounded border border-prayas-rule transition-colors shadow-sm"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View</span>
                        </Link>

                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={actionLoading === p.id}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors inline-flex items-center disabled:opacity-50"
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
        )}
      </div>
    </div>
  );
}
