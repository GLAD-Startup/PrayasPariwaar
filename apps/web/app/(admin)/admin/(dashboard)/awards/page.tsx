"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";
import TimelineImagePlaceholder from "@/components/TimelineImagePlaceholder";
import { apiFetch, assetPath } from "@/lib/api";
import {
  Award,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  Calendar,
  Image as ImageIcon,
  ShieldCheck,
} from "lucide-react";

interface AwardData {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  year?: number | null;
  order: number;
  createdAt?: string;
}

export default function AdminAwardsPage() {
  const [awards, setAwards] = useState<AwardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAward, setEditingAward] = useState<AwardData | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    year: new Date().getFullYear(),
    order: 0,
  });

  useEffect(() => {
    fetchAwards();
  }, []);

  const fetchAwards = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/awards");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAwards(json.data);
      }
    } catch (e: any) {
      console.error("Failed to fetch awards:", e);
      setErrorMsg("Failed to load awards.");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingAward(null);
    setFormData({
      title: "",
      description: "",
      imageUrl: "",
      year: new Date().getFullYear(),
      order: awards.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (award: AwardData) => {
    setEditingAward(award);
    setFormData({
      title: award.title || "",
      description: award.description || "",
      imageUrl: award.imageUrl || "",
      year: award.year || new Date().getFullYear(),
      order: award.order || 0,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrorMsg("Award title is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const isEditing = Boolean(editingAward && editingAward.id);
      const endpoint = isEditing ? `/api/awards/${editingAward!.id}` : "/api/awards";
      const method = isEditing ? "PUT" : "POST";

      const res = await apiFetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Failed to save award");
      }

      setSuccessMsg(
        isEditing
          ? "Award details and certificate photo updated successfully!"
          : "New institutional award added to public honours registry!"
      );
      setModalOpen(false);
      await fetchAwards();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save award.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete the award "${title}"?`)) {
      return;
    }

    try {
      const res = await apiFetch(`/api/awards/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Failed to delete award");
      }
      setSuccessMsg("Award deleted successfully.");
      await fetchAwards();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || "Could not delete award.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-prayas-rule pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200">
              <Award className="w-4 h-4" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-prayas-ink">
              Awards, Honors & Empanelments
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-prayas-muted mt-1">
            Manage institutional certificates, state commendations, and NITI Aayog recognitions displayed on /about and /about/awards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/about/awards"
            target="_blank"
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-prayas-rule bg-white text-prayas-ink hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-prayas-muted" />
            <span>View Public Awards Page</span>
          </Link>
          <button
            onClick={fetchAwards}
            className="p-2 text-xs font-semibold rounded-lg border border-prayas-rule bg-white text-prayas-muted hover:text-prayas-ink hover:bg-slate-50 transition-colors shadow-2xs"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-700" : ""}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-[#2E5339] text-white hover:bg-[#23432b] transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Award</span>
          </button>
        </div>
      </div>

      {/* Success / Error Alerts */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2 animate-fade-in shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-medium flex items-center gap-2 animate-fade-in shadow-2xs">
          <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-prayas-rule bg-white shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-prayas-muted block">
            Official Recognitions
          </span>
          <span className="font-serif text-2xl font-bold text-prayas-ink mt-0.5 block">
            {awards.length}
          </span>
        </div>
        <div className="p-4 rounded-xl border border-prayas-rule bg-white shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-prayas-muted block">
            Most Recent Honor
          </span>
          <span className="font-serif text-2xl font-bold text-emerald-800 mt-0.5 block">
            {awards.length > 0 ? Math.max(...awards.map((a) => a.year || 0)) : "2024"}
          </span>
        </div>
        <div className="p-4 rounded-xl border border-prayas-rule bg-white shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-prayas-muted block">
            Statutory Standing
          </span>
          <span className="font-serif text-sm font-bold text-prayas-ink mt-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>12A Certified • NITI Aayog</span>
          </span>
        </div>
      </div>

      {/* Awards Cards Grid */}
      {loading ? (
        <div className="text-center py-16 bg-white border border-prayas-rule rounded-2xl">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-700 mx-auto mb-3" />
          <p className="text-xs text-prayas-muted font-medium">Loading awards and citations...</p>
        </div>
      ) : awards.length === 0 ? (
        <div className="text-center py-16 bg-white border border-prayas-rule rounded-2xl p-6">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-serif text-base font-bold text-prayas-ink">No awards listed</h3>
          <p className="text-xs text-prayas-muted mt-1 max-w-sm mx-auto">
            Click &quot;Add Award&quot; above to add an institutional award or empanelment certificate with photos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {awards.map((award, idx) => {
            const imgKey = award.id || `award-${idx}`;
            const hasValidImage =
              typeof award.imageUrl === "string" &&
              award.imageUrl.trim().length > 0 &&
              award.imageUrl !== "null" &&
              award.imageUrl !== "undefined" &&
              !brokenImages[imgKey];

            return (
              <div
                key={imgKey}
                className="border border-prayas-rule bg-white rounded-2xl overflow-hidden shadow-2xs flex flex-col hover:border-amber-600/40 hover:shadow-md transition-all group"
              >
                {/* Photo / Certificate Container */}
                <div className="relative aspect-[16/10] bg-prayas-stone overflow-hidden border-b border-prayas-rule">
                  {hasValidImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={assetPath(award.imageUrl)}
                      alt={award.title}
                      onError={() =>
                        setBrokenImages((prev) => ({ ...prev, [imgKey]: true }))
                      }
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <TimelineImagePlaceholder
                      category="institutional"
                      year={award.year || undefined}
                      title={award.title}
                      isAward={true}
                    />
                  )}

                {/* Year Badge */}
                {award.year && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-white font-mono font-bold text-xs shadow-sm flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-amber-400" />
                    <span>{award.year}</span>
                  </div>
                )}

                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold text-[10px] shadow-sm flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  <span>Recognition</span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 flex-1 flex flex-col space-y-2.5">
                <div>
                  <h3 className="font-serif text-sm font-bold text-prayas-ink line-clamp-2 group-hover:text-emerald-800 transition-colors">
                    {award.title}
                  </h3>
                  {award.description && (
                    <p className="text-[11px] text-prayas-muted line-clamp-3 mt-1 leading-snug">
                      {award.description}
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-prayas-rule mt-auto flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">
                    Order #{award.order || idx + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(award)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg text-emerald-800 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-all flex items-center gap-1"
                      title="Edit award"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(award.id, award.title)}
                      className="p-1.5 text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete award"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT AWARD MODAL                                                    */}
      {/* ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl border border-prayas-rule shadow-2xl max-w-lg w-full my-8 max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-prayas-rule flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-prayas-ink">
                    {editingAward ? "Edit Award & Certificate Photo" : "Add Award / Recognition"}
                  </h3>
                  <p className="text-[11px] text-prayas-muted">
                    Photo will appear on /about and /about/awards.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-prayas-ink hover:bg-slate-200/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {/* Image Upload Area */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-prayas-ink uppercase tracking-wider block">
                  Certificate / Trophy Photograph
                </label>
                <ImageUpload
                  value={formData.imageUrl}
                  onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
                  label="Upload Award Certificate / Ceremony Photo"
                  description="Supported formats: JPEG, PNG, WebP (auto-compressed for crisp display)"
                />
              </div>

              {/* Award Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-prayas-ink">
                  Award / Honor Title <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mathura District Administration Seva Samman"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-prayas-rule rounded-xl focus:outline-none focus:border-emerald-700 bg-slate-50/50 font-serif font-bold text-sm"
                  required
                />
              </div>

              {/* Year & Order */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-prayas-ink">
                    Conferred Year
                  </label>
                  <input
                    type="number"
                    min="2000"
                    max="2035"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        year: parseInt(e.target.value, 10) || 2026,
                      }))
                    }
                    className="w-full px-3 py-2 text-xs border border-prayas-rule rounded-xl focus:outline-none focus:border-emerald-700 bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-prayas-ink">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        order: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 text-xs border border-prayas-rule rounded-xl focus:outline-none focus:border-emerald-700 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-prayas-ink">
                  Citation / Description
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Conferred by the District Magistrate of Mathura for outstanding public service during natural calamities..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-prayas-rule rounded-xl focus:outline-none focus:border-emerald-700 bg-slate-50/50"
                />
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-prayas-rule flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-prayas-rule bg-white text-prayas-muted hover:text-prayas-ink hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#2E5339] text-white hover:bg-[#23432b] transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Award...</span>
                    </>
                  ) : (
                    <span>{editingAward ? "Update Award" : "Add Award"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
