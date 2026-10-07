"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";
import TimelineImagePlaceholder from "@/components/TimelineImagePlaceholder";
import { apiFetch, assetPath } from "@/lib/api";
import {
  History,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  Calendar,
  MapPin,
  Sparkles,
  GraduationCap,
  Droplet,
  Trees,
  ShieldCheck,
  Award,
  Layers,
  Image as ImageIcon,
} from "lucide-react";

interface MilestoneData {
  id: string;
  year: number;
  dateLabel: string;
  category: "education" | "health" | "plantation" | "institutional";
  categoryLabel: string;
  title: string;
  subtitle: string;
  location: string;
  imageUrl: string;
  impactBadge: string;
  summary: string;
  story: string;
  quote?: string | null;
  keyStats?: { label: string; value: string }[];
  highlightTag?: string | null;
  linkUrl?: string | null;
  linkLabel?: string | null;
  order?: number;
  published?: boolean;
}

const CATEGORIES = [
  { value: "education", label: "Free Education", icon: GraduationCap, color: "text-amber-700 bg-amber-50 border-amber-200" },
  { value: "health", label: "Emergency Blood & Health", icon: Droplet, color: "text-rose-700 bg-rose-50 border-rose-200" },
  { value: "plantation", label: "Ecology & Green Vrindavan", icon: Trees, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { value: "institutional", label: "Trust, Awards & Governance", icon: ShieldCheck, color: "text-sky-700 bg-sky-50 border-sky-200" },
];

export default function AdminTimelinePage() {
  const [milestones, setMilestones] = useState<MilestoneData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<MilestoneData | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    dateLabel: "",
    category: "education" as MilestoneData["category"],
    categoryLabel: "Free Education",
    title: "",
    subtitle: "",
    location: "Vrindavan, Mathura",
    imageUrl: "",
    impactBadge: "",
    summary: "",
    story: "",
    quote: "",
    highlightTag: "",
    linkUrl: "",
    linkLabel: "",
    order: 0,
    published: true,
  });

  useEffect(() => {
    fetchMilestones();
  }, []);

  const fetchMilestones = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/timeline");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMilestones(json.data);
      }
    } catch (e: any) {
      console.error("Failed to fetch milestones:", e);
      setErrorMsg("Failed to load timeline milestones.");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingMilestone(null);
    setFormData({
      year: new Date().getFullYear(),
      dateLabel: "",
      category: "education",
      categoryLabel: "Free Education",
      title: "",
      subtitle: "",
      location: "Vrindavan, Mathura",
      imageUrl: "",
      impactBadge: "",
      summary: "",
      story: "",
      quote: "",
      highlightTag: "",
      linkUrl: "",
      linkLabel: "",
      order: milestones.length + 1,
      published: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (m: MilestoneData) => {
    setEditingMilestone(m);
    setFormData({
      year: m.year,
      dateLabel: m.dateLabel || `${m.year}`,
      category: m.category || "education",
      categoryLabel: m.categoryLabel || "Free Education",
      title: m.title || "",
      subtitle: m.subtitle || "",
      location: m.location || "Vrindavan, Mathura",
      imageUrl: m.imageUrl || "",
      impactBadge: m.impactBadge || "",
      summary: m.summary || "",
      story: m.story || "",
      quote: m.quote || "",
      highlightTag: m.highlightTag || "",
      linkUrl: m.linkUrl || "",
      linkLabel: m.linkLabel || "",
      order: m.order || 0,
      published: m.published !== false,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      setErrorMsg("Please upload an authentic photo for this timeline milestone.");
      return;
    }
    if (!formData.title.trim()) {
      setErrorMsg("Milestone title is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const isEditing = Boolean(editingMilestone && editingMilestone.id);
      const endpoint = isEditing ? `/api/timeline/${editingMilestone!.id}` : "/api/timeline";
      const method = isEditing ? "PUT" : "POST";

      const res = await apiFetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Failed to save milestone");
      }

      setSuccessMsg(
        isEditing
          ? "Milestone photo and details updated successfully!"
          : "New timeline milestone added to public chronicle!"
      );
      setModalOpen(false);
      await fetchMilestones();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save milestone.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to remove the milestone "${title}" from the timeline?`)) {
      return;
    }

    try {
      const res = await apiFetch(`/api/timeline/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Failed to delete milestone");
      }
      setSuccessMsg("Milestone removed successfully.");
      await fetchMilestones();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || "Could not delete milestone.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-prayas-rule pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
              <History className="w-4 h-4" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-prayas-ink">
              15-Year Timeline Chronicle
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-prayas-muted mt-1">
            Manage the historic milestones, documentary photographs, and seva archives displayed on the homepage horizontal timeline and /timeline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/#timeline"
            target="_blank"
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-prayas-rule bg-white text-prayas-ink hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-prayas-muted" />
            <span>View Public Timeline</span>
          </Link>
          <button
            onClick={fetchMilestones}
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
            <span>Add Milestone</span>
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

      {/* Statistics Header Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-prayas-rule bg-white shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-prayas-muted block">
            Total Milestones
          </span>
          <span className="font-serif text-2xl font-bold text-prayas-ink mt-0.5 block">
            {milestones.length}
          </span>
        </div>
        <div className="p-4 rounded-xl border border-prayas-rule bg-white shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-prayas-muted block">
            Chronicle Span
          </span>
          <span className="font-serif text-2xl font-bold text-emerald-800 mt-0.5 block">
            {milestones.length > 0 ? `${milestones[0].year} – ${milestones[milestones.length - 1].year}` : "2011 – 2026"}
          </span>
        </div>
        <div className="p-4 rounded-xl border border-prayas-rule bg-white shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-prayas-muted block">
            Free Education
          </span>
          <span className="font-serif text-2xl font-bold text-amber-700 mt-0.5 block">
            {milestones.filter((m) => m.category === "education").length} Stages
          </span>
        </div>
        <div className="p-4 rounded-xl border border-prayas-rule bg-white shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-prayas-muted block">
            Healthcare & Blood
          </span>
          <span className="font-serif text-2xl font-bold text-rose-700 mt-0.5 block">
            {milestones.filter((m) => m.category === "health").length} Stages
          </span>
        </div>
      </div>

      {/* Milestone Cards Grid */}
      {loading ? (
        <div className="text-center py-16 bg-white border border-prayas-rule rounded-2xl">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-700 mx-auto mb-3" />
          <p className="text-xs text-prayas-muted font-medium">Loading chronicle milestones...</p>
        </div>
      ) : milestones.length === 0 ? (
        <div className="text-center py-16 bg-white border border-prayas-rule rounded-2xl p-6">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-serif text-base font-bold text-prayas-ink">No milestones found</h3>
          <p className="text-xs text-prayas-muted mt-1 max-w-sm mx-auto">
            Click &quot;Add Milestone&quot; above to create your first chronicle milestone with documentary photos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {milestones.map((milestone, idx) => {
            const catConfig =
              CATEGORIES.find((c) => c.value === milestone.category) || CATEGORIES[0];
            const CategoryIcon = catConfig.icon;

            const imgKey = milestone.id || `m-${idx}`;
            const hasValidImage =
              typeof milestone.imageUrl === "string" &&
              milestone.imageUrl.trim().length > 0 &&
              milestone.imageUrl !== "null" &&
              milestone.imageUrl !== "undefined" &&
              !brokenImages[imgKey];

            return (
              <div
                key={imgKey}
                className="border border-prayas-rule bg-white rounded-2xl overflow-hidden shadow-2xs flex flex-col hover:border-emerald-700/40 hover:shadow-md transition-all group"
              >
                {/* Photo Preview Container */}
                <div className="relative aspect-[16/10] bg-prayas-stone overflow-hidden border-b border-prayas-rule">
                  {hasValidImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={assetPath(milestone.imageUrl)}
                      alt={milestone.title}
                      onError={() =>
                        setBrokenImages((prev) => ({ ...prev, [imgKey]: true }))
                      }
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <TimelineImagePlaceholder
                      category={milestone.category}
                      year={milestone.year}
                      title={milestone.title}
                      location={milestone.location}
                    />
                  )}

                  {/* Year & Category Pill Overlay */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-white font-mono font-bold text-xs shadow-sm">
                      {milestone.year}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold backdrop-blur-md uppercase shadow-sm ${catConfig.color}`}>
                      {milestone.categoryLabel || catConfig.label}
                    </span>
                  </div>

                  {milestone.highlightTag && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-amber-500/90 text-white font-bold text-[10px] shadow-sm">
                      {milestone.highlightTag}
                    </div>
                  )}

                  <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded bg-black/60 backdrop-blur-sm text-white/90 text-[10px] flex items-center justify-between">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-amber-300 shrink-0" />
                      <span className="truncate">{milestone.location || "Vrindavan"}</span>
                    </span>
                    <span className="shrink-0 text-amber-200 font-medium">
                      {milestone.dateLabel || `${milestone.year}`}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col space-y-3">
                  <div>
                    <h3 className="font-serif text-sm font-bold text-prayas-ink line-clamp-1 group-hover:text-emerald-800 transition-colors">
                      {milestone.title}
                    </h3>
                    <p className="text-[11px] text-prayas-muted line-clamp-2 mt-0.5 leading-snug">
                      {milestone.subtitle || milestone.summary}
                    </p>
                  </div>

                  {milestone.impactBadge && (
                    <div className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg self-start">
                      {milestone.impactBadge}
                    </div>
                  )}

                  {/* Card Actions */}
                  <div className="pt-2 border-t border-prayas-rule mt-auto flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">
                      Stage {idx + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(milestone)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg text-emerald-800 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-all flex items-center gap-1"
                        title="Edit milestone & photo"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(milestone.id, milestone.title)}
                        className="p-1.5 text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete milestone"
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
      {/* ADD / EDIT MILESTONE MODAL                                                */}
      {/* ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl border border-prayas-rule shadow-2xl max-w-2xl w-full my-8 max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-prayas-rule flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-prayas-ink">
                    {editingMilestone ? "Edit Timeline Milestone & Photo" : "Add Timeline Milestone"}
                  </h3>
                  <p className="text-[11px] text-prayas-muted">
                    Photo will appear in the homepage horizontal timeline and interactive chronicle.
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
                  Milestone Documentary Photo <span className="text-rose-600">*</span>
                </label>
                <ImageUpload
                  value={formData.imageUrl}
                  onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
                  label="Upload Chronicle Photo or Paste Image Link"
                  description="Supported formats: JPEG, PNG, WebP (auto-compressed for optimum speed)"
                  required
                />
              </div>

              {/* Year & Date Label */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-prayas-ink">
                    Chronological Year <span className="text-rose-600">*</span>
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
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-prayas-ink">
                    Date Display Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. October 2011, or July 2015"
                    value={formData.dateLabel}
                    onChange={(e) => setFormData((prev) => ({ ...prev, dateLabel: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-prayas-rule rounded-xl focus:outline-none focus:border-emerald-700 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Category & Category Label */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-prayas-ink">
                    Category Theme
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const val = e.target.value as MilestoneData["category"];
                      const found = CATEGORIES.find((c) => c.value === val);
                      setFormData((prev) => ({
                        ...prev,
                        category: val,
                        categoryLabel: found ? found.label : prev.categoryLabel,
                      }));
                    }}
                    className="w-full px-3 py-2 text-xs border border-prayas-rule rounded-xl focus:outline-none focus:border-emerald-700 bg-slate-50/50"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-prayas-ink">
                    Location in Vrindavan / Mathura
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kesi Ghat, Yamuna Bank, Vrindavan"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-prayas-rule rounded-xl focus:outline-none focus:border-emerald-700 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-prayas-ink">
                  Milestone Headline / Title <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. First Open-Air Pathshala Under Ancient Banyan Tree"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-prayas-rule rounded-xl focus:outline-none focus:border-emerald-700 bg-slate-50/50 font-serif font-bold text-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-prayas-ink">
                  Subtitle
                </label>
                <input
                  type="text"
                  placeholder="e.g. Informal evening study circle for riverbank boatmen and daily-wage families"
                  value={formData.subtitle}
                  onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-prayas-rule rounded-xl focus:outline-none focus:border-emerald-700 bg-slate-50/50"
                />
              </div>

              {/* Impact Badge & Highlight Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-prayas-ink">
                    Impact Badge (Highlighted Metrics)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 18 Children • 3 Student Volunteers"
                    value={formData.impactBadge}
                    onChange={(e) => setFormData((prev) => ({ ...prev, impactBadge: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-prayas-rule rounded-xl focus:outline-none focus:border-emerald-700 bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-prayas-ink">
                    Special Tag (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Genesis of Seva, Lifeline of Braj, Present Frontier"
                    value={formData.highlightTag}
                    onChange={(e) => setFormData((prev) => ({ ...prev, highlightTag: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-prayas-rule rounded-xl focus:outline-none focus:border-emerald-700 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-prayas-ink">
                  Short Summary
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief 1-2 sentence overview shown in the timeline preview card"
                  value={formData.summary}
                  onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-prayas-rule rounded-xl focus:outline-none focus:border-emerald-700 bg-slate-50/50"
                />
              </div>

              {/* Full Story */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-prayas-ink">
                  Full Documentary Narrative / Story
                </label>
                <textarea
                  rows={4}
                  placeholder="Detailed backstory of this milestone for modal and timeline page..."
                  value={formData.story}
                  onChange={(e) => setFormData((prev) => ({ ...prev, story: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-prayas-rule rounded-xl focus:outline-none focus:border-emerald-700 bg-slate-50/50"
                />
              </div>

              {/* Quote */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-prayas-ink">
                  Inspirational Quote (Optional)
                </label>
                <input
                  type="text"
                  placeholder='e.g. "Education is not charity; it is lighting an indestructible torch in the dark."'
                  value={formData.quote}
                  onChange={(e) => setFormData((prev) => ({ ...prev, quote: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-prayas-rule rounded-xl focus:outline-none focus:border-emerald-700 bg-slate-50/50 italic"
                />
              </div>

              {/* Call to action Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-prayas-ink">
                    Action Link URL (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. /projects/aashayein-education or /donate"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, linkUrl: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-prayas-rule rounded-xl focus:outline-none focus:border-emerald-700 bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-prayas-ink">
                    Button Label (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Support Project Aashayein"
                    value={formData.linkLabel}
                    onChange={(e) => setFormData((prev) => ({ ...prev, linkLabel: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-prayas-rule rounded-xl focus:outline-none focus:border-emerald-700 bg-slate-50/50"
                  />
                </div>
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
                      <span>Saving Milestone...</span>
                    </>
                  ) : (
                    <span>{editingMilestone ? "Update Milestone" : "Add Milestone"}</span>
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
