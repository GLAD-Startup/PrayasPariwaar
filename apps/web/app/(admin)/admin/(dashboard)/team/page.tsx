"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { apiFetch, assetPath } from "@/lib/api";
import ImageUpload from "@/components/ImageUpload";
import {
  UserCheck,
  Users,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  LayoutGrid,
  List,
  Lock,
  Building2,
  HeartHandshake,
  Stethoscope,
  Briefcase,
  GraduationCap,
  Award,
  ChevronDown,
} from "lucide-react";

export interface TeamMemberData {
  id: string;
  name: string;
  designation: string;
  category:
    | "LEADERSHIP"
    | "TRUSTEE"
    | "EXECUTIVE"
    | "OPERATIONS"
    | "HEALTHCARE"
    | "VOLUNTEER_LEAD"
    | "ADVISORY"
    | "OTHER";
  department?: string | null;
  imageUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  bio?: string | null;
  joinedYear?: number | null;
  location?: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const CATEGORY_MAP: Record<
  TeamMemberData["category"],
  { label: string; badgeColor: string; icon: any }
> = {
  LEADERSHIP: {
    label: "Leadership & Patrons",
    badgeColor: "bg-amber-50 text-amber-900 border-amber-300",
    icon: Award,
  },
  TRUSTEE: {
    label: "Board of Trustees",
    badgeColor: "bg-purple-50 text-purple-900 border-purple-300",
    icon: ShieldCheck,
  },
  EXECUTIVE: {
    label: "Executive Committee",
    badgeColor: "bg-blue-50 text-blue-900 border-blue-300",
    icon: Briefcase,
  },
  OPERATIONS: {
    label: "Field Operations & Seva",
    badgeColor: "bg-emerald-50 text-emerald-900 border-emerald-300",
    icon: HeartHandshake,
  },
  HEALTHCARE: {
    label: "Medical & Blood Bank",
    badgeColor: "bg-rose-50 text-rose-900 border-rose-300",
    icon: Stethoscope,
  },
  VOLUNTEER_LEAD: {
    label: "Youth & Volunteer Leads",
    badgeColor: "bg-teal-50 text-teal-900 border-teal-300",
    icon: GraduationCap,
  },
  ADVISORY: {
    label: "Advisory Council",
    badgeColor: "bg-indigo-50 text-indigo-900 border-indigo-300",
    icon: Building2,
  },
  OTHER: {
    label: "Institutional Support",
    badgeColor: "bg-stone-100 text-stone-800 border-stone-300",
    icon: Users,
  },
};

export default function AdminTeamPage() {
  const [members, setMembers] = useState<TeamMemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Notifications
  const [toastMsg, setToastMsg] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMemberData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Form Data
  const [formData, setFormData] = useState<{
    name: string;
    designation: string;
    category: TeamMemberData["category"];
    department: string;
    imageUrl: string;
    phone: string;
    email: string;
    bio: string;
    joinedYear: number | "";
    location: string;
    order: number;
    isActive: boolean;
  }>({
    name: "",
    designation: "",
    category: "OPERATIONS",
    department: "",
    imageUrl: "",
    phone: "",
    email: "",
    bio: "",
    joinedYear: "",
    location: "",
    order: 0,
    isActive: true,
  });

  // Fetch Team Members
  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await apiFetch(`/api/team?${params.toString()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMembers(json.data);
      } else {
        setToastMsg({
          text: json.error || "Failed to load team directory.",
          type: "error",
        });
      }
    } catch (err: any) {
      console.error("Error fetching team members:", err);
      setToastMsg({ text: "Failed to connect to team registry.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, categoryFilter, statusFilter]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Toast Auto-Dismiss
  useEffect(() => {
    if (!toastMsg) return;
    const timer = setTimeout(() => setToastMsg(null), 4000);
    return () => clearTimeout(timer);
  }, [toastMsg]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingMember(null);
    setFormData({
      name: "",
      designation: "",
      category: "OPERATIONS",
      department: "",
      imageUrl: "",
      phone: "",
      email: "",
      bio: "",
      joinedYear: "",
      location: "",
      order: members.length + 1,
      isActive: true,
    });
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (member: TeamMemberData) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      designation: member.designation,
      category: member.category,
      department: member.department || "",
      imageUrl: member.imageUrl || "",
      phone: member.phone || "",
      email: member.email || "",
      bio: member.bio || "",
      joinedYear: member.joinedYear ?? "",
      location: member.location || "",
      order: member.order,
      isActive: member.isActive,
    });
    setModalOpen(true);
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setToastMsg({ text: "Please provide the member's full name.", type: "error" });
      return;
    }
    if (!formData.designation.trim()) {
      setToastMsg({ text: "Please provide the designation or role.", type: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const isEditing = Boolean(editingMember && editingMember.id);
      const endpoint = isEditing ? `/api/team/${editingMember!.id}` : "/api/team";
      const method = isEditing ? "PUT" : "POST";

      const payload = {
        ...formData,
        joinedYear: formData.joinedYear === "" ? null : Number(formData.joinedYear),
      };

      const res = await apiFetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Failed to save team member");
      }

      setToastMsg({
        text: isEditing
          ? `Updated profile for "${formData.name}".`
          : `Added "${formData.name}" to Sanstha team directory.`,
        type: "success",
      });
      setModalOpen(false);
      await fetchMembers();
    } catch (err: any) {
      setToastMsg({
        text: err.message || "Failed to save team member.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Active Status
  const handleToggleActive = async (member: TeamMemberData) => {
    setActionLoadingId(member.id);
    try {
      const res = await apiFetch(`/api/team/${member.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !member.isActive }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Failed to update status");
      }

      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, isActive: !m.isActive } : m))
      );
      setToastMsg({
        text: `${member.name} marked as ${!member.isActive ? "Active" : "Inactive"}.`,
        type: "success",
      });
    } catch (err: any) {
      setToastMsg({ text: err.message || "Failed to update status", type: "error" });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete Member
  const handleDelete = async (member: TeamMemberData) => {
    if (
      !window.confirm(
        `Are you sure you want to remove "${member.name}" (${member.designation}) from the internal team registry?`
      )
    ) {
      return;
    }

    setActionLoadingId(member.id);
    try {
      const res = await apiFetch(`/api/team/${member.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Failed to delete team member");
      }

      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      setToastMsg({
        text: `Removed "${member.name}" from registry.`,
        type: "success",
      });
    } catch (err: any) {
      setToastMsg({ text: err.message || "Failed to delete member", type: "error" });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Key Counts for Metric Cards
  const stats = useMemo(() => {
    const total = members.length;
    const active = members.filter((m) => m.isActive).length;
    const leadership = members.filter(
      (m) => m.category === "LEADERSHIP" || m.category === "TRUSTEE"
    ).length;
    const healthcare = members.filter((m) => m.category === "HEALTHCARE").length;
    const operations = members.filter(
      (m) => m.category === "OPERATIONS" || m.category === "VOLUNTEER_LEAD"
    ).length;
    return { total, active, leadership, healthcare, operations };
  }, [members]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium transition-all ${
            toastMsg.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-300"
              : "bg-red-50 text-red-900 border-red-300"
          }`}
        >
          {toastMsg.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{toastMsg.text}</span>
          <button
            onClick={() => setToastMsg(null)}
            className="p-1 hover:bg-black/5 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-prayas-rule rounded-xl p-5 sm:p-6 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink">
              Prayas Sanstha Team Directory
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              Internal Admin Only
            </span>
          </div>
          <p className="text-xs sm:text-sm text-prayas-muted mt-1 max-w-2xl">
            Internal registry of office bearers, trustees, healthcare leads, and field seva coordinators.
            <strong className="text-prayas-ink ml-1 font-semibold">
              Restricted exclusively to this admin portal — not displayed on public website.
            </strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 flex-wrap">
          <button
            onClick={fetchMembers}
            disabled={loading}
            className="px-3 py-2 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink hover:bg-prayas-stone text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Team Member
          </button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white border border-prayas-rule rounded-lg p-4 shadow-subtle">
          <div className="text-[11px] font-bold text-prayas-muted uppercase tracking-wider">
            Total Team
          </div>
          <div className="text-2xl font-serif font-bold text-prayas-ink mt-1">
            {stats.total}
          </div>
          <div className="text-[11px] text-prayas-muted mt-0.5">Enrolled members</div>
        </div>

        <div className="bg-white border border-prayas-rule rounded-lg p-4 shadow-subtle">
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
            Active Seva
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-800 mt-1">
            {stats.active}
          </div>
          <div className="text-[11px] text-prayas-muted mt-0.5">Currently serving</div>
        </div>

        <div className="bg-white border border-prayas-rule rounded-lg p-4 shadow-subtle">
          <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
            Leadership & Board
          </div>
          <div className="text-2xl font-serif font-bold text-amber-800 mt-1">
            {stats.leadership}
          </div>
          <div className="text-[11px] text-prayas-muted mt-0.5">Patrons & Trustees</div>
        </div>

        <div className="bg-white border border-prayas-rule rounded-lg p-4 shadow-subtle">
          <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
            Medical & Blood
          </div>
          <div className="text-2xl font-serif font-bold text-rose-800 mt-1">
            {stats.healthcare}
          </div>
          <div className="text-[11px] text-prayas-muted mt-0.5">Clinical desk leads</div>
        </div>

        <div className="bg-white border border-prayas-rule rounded-lg p-4 shadow-subtle col-span-2 sm:col-span-1">
          <div className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">
            Field & Youth
          </div>
          <div className="text-2xl font-serif font-bold text-teal-800 mt-1">
            {stats.operations}
          </div>
          <div className="text-[11px] text-prayas-muted mt-0.5">Operations coordinators</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-prayas-rule rounded-xl p-4 shadow-subtle flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-prayas-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, role, department, phone, email, city..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-prayas-rule text-xs sm:text-sm text-prayas-ink placeholder-prayas-muted focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 bg-prayas-paper/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-prayas-muted hover:text-prayas-ink"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-prayas-rule bg-white text-xs font-medium text-prayas-ink focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
            >
              <option value="ALL">All Categories</option>
              <option value="LEADERSHIP">Leadership & Patrons</option>
              <option value="TRUSTEE">Board of Trustees</option>
              <option value="EXECUTIVE">Executive Committee</option>
              <option value="OPERATIONS">Field Operations</option>
              <option value="HEALTHCARE">Medical & Blood Desk</option>
              <option value="VOLUNTEER_LEAD">Youth & Volunteer Leads</option>
              <option value="ADVISORY">Advisory Council</option>
              <option value="OTHER">Other Support</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-prayas-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-prayas-rule bg-white text-xs font-medium text-prayas-ink focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-prayas-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* View Toggle */}
          <div className="border border-prayas-rule rounded-lg p-0.5 bg-prayas-stone flex items-center">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded text-xs font-medium transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-prayas-ink shadow-xs"
                  : "text-prayas-muted hover:text-prayas-ink"
              }`}
              title="Grid Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded text-xs font-medium transition-colors ${
                viewMode === "table"
                  ? "bg-white text-prayas-ink shadow-xs"
                  : "text-prayas-muted hover:text-prayas-ink"
              }`}
              title="Compact Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white border border-prayas-rule rounded-xl p-16 text-center space-y-3 shadow-subtle">
          <RefreshCw className="w-8 h-8 text-emerald-800 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-prayas-ink">
            Loading Prayas Sanstha team directory...
          </p>
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white border border-dashed border-prayas-rule rounded-xl p-12 text-center space-y-4 shadow-subtle">
          <div className="w-14 h-14 rounded-full bg-prayas-stone flex items-center justify-center mx-auto text-prayas-muted">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-prayas-ink">
              No team members found
            </h3>
            <p className="text-xs text-prayas-muted mt-1 max-w-md mx-auto">
              {searchQuery || categoryFilter !== "ALL" || statusFilter !== "ALL"
                ? "Try clearing your filters or search keywords to view all team members."
                : "No team members have been added to the internal registry yet."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            {(searchQuery || categoryFilter !== "ALL" || statusFilter !== "ALL") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("ALL");
                  setStatusFilter("ALL");
                }}
                className="px-3.5 py-2 rounded-lg border border-prayas-rule bg-prayas-paper text-xs font-semibold text-prayas-ink hover:bg-prayas-stone"
              >
                Reset Filters
              </button>
            )}
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-lg bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-900 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 inline mr-1" />
              Add First Member
            </button>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {members.map((member) => {
            const catInfo = CATEGORY_MAP[member.category] || CATEGORY_MAP.OTHER;
            const CatIcon = catInfo.icon;
            const initials = member.name
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((n) => n[0])
              .join("")
              .toUpperCase();

            return (
              <div
                key={member.id}
                className={`bg-white border rounded-xl overflow-hidden shadow-subtle hover:shadow-card transition-all flex flex-col justify-between ${
                  member.isActive ? "border-prayas-rule" : "border-stone-200 opacity-75"
                }`}
              >
                {/* Card Header & Avatar */}
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      {/* Avatar Portrait */}
                      <div className="relative w-14 h-14 rounded-full border-2 border-prayas-rule overflow-hidden bg-prayas-stone shrink-0 flex items-center justify-center shadow-xs">
                        {member.imageUrl ? (
                          <Image
                            src={assetPath(member.imageUrl)}
                            alt={member.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <span className="font-serif font-bold text-lg text-emerald-800">
                            {initials || "P"}
                          </span>
                        )}
                      </div>

                      {/* Name & Designation */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif font-bold text-base text-prayas-ink leading-tight">
                            {member.name}
                          </h3>
                        </div>
                        <p className="text-xs font-semibold text-emerald-800 mt-0.5">
                          {member.designation}
                        </p>
                        {member.department && (
                          <p className="text-[11px] text-prayas-muted font-medium">
                            {member.department}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Active/Inactive Badge */}
                    <button
                      onClick={() => handleToggleActive(member)}
                      disabled={actionLoadingId === member.id}
                      title="Click to toggle active status"
                      className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase transition-colors shrink-0 ${
                        member.isActive
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                          : "bg-stone-100 text-stone-600 border border-stone-300 hover:bg-stone-200"
                      }`}
                    >
                      {member.isActive ? "Active" : "Inactive"}
                    </button>
                  </div>

                  {/* Category & Order Badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${catInfo.badgeColor}`}
                    >
                      <CatIcon className="w-3 h-3" />
                      {catInfo.label}
                    </span>

                    {member.location && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-prayas-muted font-medium">
                        <MapPin className="w-3 h-3 text-prayas-muted" />
                        {member.location}
                      </span>
                    )}

                    {member.joinedYear && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-prayas-muted font-medium ml-auto">
                        <Calendar className="w-3 h-3 text-prayas-muted" />
                        Since {member.joinedYear}
                      </span>
                    )}
                  </div>

                  {/* Bio */}
                  {member.bio && (
                    <p className="text-xs text-prayas-ink/80 leading-relaxed line-clamp-2 bg-prayas-paper/50 p-2.5 rounded-lg border border-prayas-rule/60">
                      {member.bio}
                    </p>
                  )}

                  {/* Contact Details */}
                  <div className="space-y-1.5 pt-1 text-xs text-prayas-ink border-t border-prayas-rule/60">
                    {member.phone && (
                      <a
                        href={`tel:${member.phone}`}
                        className="flex items-center gap-2 text-prayas-ink hover:text-emerald-800 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-prayas-muted shrink-0" />
                        <span className="font-mono text-[11px]">{member.phone}</span>
                      </a>
                    )}
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="flex items-center gap-2 text-prayas-ink hover:text-emerald-800 transition-colors truncate"
                      >
                        <Mail className="w-3.5 h-3.5 text-prayas-muted shrink-0" />
                        <span className="truncate text-[11px]">{member.email}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="px-5 py-3 bg-prayas-paper/70 border-t border-prayas-rule flex items-center justify-between text-xs">
                  <span className="text-[11px] text-prayas-muted font-mono font-medium">
                    Order #{member.order}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(member)}
                      className="px-2.5 py-1 rounded border border-prayas-rule bg-white text-prayas-ink hover:bg-prayas-stone text-[11px] font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Edit2 className="w-3 h-3 text-emerald-800" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(member)}
                      disabled={actionLoadingId === member.id}
                      className="px-2.5 py-1 rounded border border-red-200 bg-white text-red-700 hover:bg-red-50 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE LEDGER VIEW */
        <div className="bg-white border border-prayas-rule rounded-xl shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-prayas-ink">
              <thead className="bg-prayas-stone border-b border-prayas-rule text-[11px] font-bold text-prayas-muted uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Member & Designation</th>
                  <th className="py-3 px-4">Category & Department</th>
                  <th className="py-3 px-4">Direct Contact</th>
                  <th className="py-3 px-4">Location & Tenure</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-prayas-rule">
                {members.map((member) => {
                  const catInfo = CATEGORY_MAP[member.category] || CATEGORY_MAP.OTHER;
                  const initials = member.name
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase();

                  return (
                    <tr
                      key={member.id}
                      className={`hover:bg-prayas-paper/50 transition-colors ${
                        !member.isActive ? "bg-stone-50/50 opacity-75" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-prayas-muted">
                        #{member.order}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-9 h-9 rounded-full border border-prayas-rule overflow-hidden bg-prayas-stone shrink-0 flex items-center justify-center">
                            {member.imageUrl ? (
                              <Image
                                src={assetPath(member.imageUrl)}
                                alt={member.name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <span className="font-serif font-bold text-xs text-emerald-800">
                                {initials}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-prayas-ink">{member.name}</div>
                            <div className="text-[11px] font-semibold text-emerald-800">
                              {member.designation}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${catInfo.badgeColor}`}
                          >
                            {catInfo.label}
                          </span>
                          {member.department && (
                            <div className="text-[11px] text-prayas-muted font-medium">
                              {member.department}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div>{member.phone || "—"}</div>
                        <div className="text-prayas-muted font-sans text-[10px]">
                          {member.email || "—"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[11px]">
                        <div>{member.location || "Vrindavan"}</div>
                        <div className="text-prayas-muted">
                          {member.joinedYear ? `Since ${member.joinedYear}` : "—"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleActive(member)}
                          disabled={actionLoadingId === member.id}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase transition-colors ${
                            member.isActive
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-stone-100 text-stone-600 border border-stone-300 hover:bg-stone-200"
                          }`}
                        >
                          {member.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(member)}
                            className="p-1.5 rounded border border-prayas-rule hover:bg-prayas-stone text-prayas-ink"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-emerald-800" />
                          </button>
                          <button
                            onClick={() => handleDelete(member)}
                            disabled={actionLoadingId === member.id}
                            className="p-1.5 rounded border border-red-200 hover:bg-red-50 text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE & EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-prayas-rule rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-7 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-prayas-rule pb-4">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-prayas-ink">
                  {editingMember ? "Edit Team Member Profile" : "Add New Sanstha Team Member"}
                </h2>
                <p className="text-xs text-prayas-muted mt-0.5">
                  Internal administration registry • Not published publicly
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg border border-prayas-rule hover:bg-prayas-stone text-prayas-muted hover:text-prayas-ink transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-prayas-ink uppercase tracking-wider">
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full name of member (e.g. Ramesh Chandra Sharma)"
                    className="w-full px-3.5 py-2 rounded-lg border border-prayas-rule text-xs sm:text-sm text-prayas-ink focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 bg-prayas-paper/30"
                  />
                </div>

                {/* Designation / Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-prayas-ink uppercase tracking-wider">
                    Designation / Title <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) =>
                      setFormData({ ...formData, designation: e.target.value })
                    }
                    placeholder="Designation or role (e.g. President, General Secretary, Coordinator)"
                    className="w-full px-3.5 py-2 rounded-lg border border-prayas-rule text-xs sm:text-sm text-prayas-ink focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 bg-prayas-paper/30"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-prayas-ink uppercase tracking-wider">
                    Organizational Wing / Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as TeamMemberData["category"],
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-prayas-rule text-xs sm:text-sm text-prayas-ink focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 bg-white"
                  >
                    <option value="LEADERSHIP">Leadership & Patrons</option>
                    <option value="TRUSTEE">Board of Trustees & Governance</option>
                    <option value="EXECUTIVE">Executive Committee Members</option>
                    <option value="OPERATIONS">Field Seva & Operations</option>
                    <option value="HEALTHCARE">Medical & Blood Desk</option>
                    <option value="VOLUNTEER_LEAD">Youth & Volunteer Leads</option>
                    <option value="ADVISORY">Advisory Council</option>
                    <option value="OTHER">Other Institutional Support</option>
                  </select>
                </div>

                {/* Department / Sub-wing */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-prayas-ink uppercase tracking-wider">
                    Department / Focus Project
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    placeholder="e.g. Blood Seva Desk, Free Education, Administration"
                    className="w-full px-3.5 py-2 rounded-lg border border-prayas-rule text-xs sm:text-sm text-prayas-ink focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 bg-prayas-paper/30"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-prayas-ink uppercase tracking-wider">
                    City / Base Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="e.g. Vrindavan, Mathura, Delhi"
                    className="w-full px-3.5 py-2 rounded-lg border border-prayas-rule text-xs sm:text-sm text-prayas-ink focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 bg-prayas-paper/30"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-prayas-ink uppercase tracking-wider">
                    Phone / Mobile (Admin Contact)
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2 rounded-lg border border-prayas-rule text-xs sm:text-sm text-prayas-ink focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 bg-prayas-paper/30"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-prayas-ink uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. member@prayaspariwaar.com"
                    className="w-full px-3.5 py-2 rounded-lg border border-prayas-rule text-xs sm:text-sm text-prayas-ink focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 bg-prayas-paper/30"
                  />
                </div>

                {/* Joined Year */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-prayas-ink uppercase tracking-wider">
                    Associated Since (Year)
                  </label>
                  <input
                    type="number"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    value={formData.joinedYear}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        joinedYear: e.target.value === "" ? "" : parseInt(e.target.value, 10),
                      })
                    }
                    placeholder={`e.g. ${new Date().getFullYear()}`}
                    className="w-full px-3.5 py-2 rounded-lg border border-prayas-rule text-xs sm:text-sm text-prayas-ink focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 bg-prayas-paper/30"
                  />
                </div>

                {/* Display Order */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-prayas-ink uppercase tracking-wider">
                    Display Priority Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-prayas-rule text-xs sm:text-sm text-prayas-ink focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 bg-prayas-paper/30"
                  />
                  <p className="text-[10px] text-prayas-muted">
                    Lower numbers appear first (e.g. 1 for Patron, 2 for President)
                  </p>
                </div>

                {/* Active Status Toggle */}
                <div className="space-y-1 sm:col-span-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700 border-prayas-rule"
                    />
                    <span className="text-xs font-bold text-prayas-ink">
                      Active Member (Currently engaged in Sanstha seva)
                    </span>
                  </label>
                </div>

                {/* Portrait Photo Upload */}
                <div className="space-y-1 sm:col-span-2 pt-2">
                  <label className="text-xs font-bold text-prayas-ink uppercase tracking-wider">
                    Portrait Photo / Profile Picture
                  </label>
                  <ImageUpload
                    value={formData.imageUrl}
                    onChange={(val) => setFormData({ ...formData, imageUrl: val })}
                    label="Member Photo"
                    description="Upload a photo from your computer or paste an image link. You can adjust zoom, alignment, and center the face."
                    aspectRatio="square"
                    shape="circle"
                    allowAdjustment={true}
                  />
                </div>

                {/* Bio / Seva Notes */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-prayas-ink uppercase tracking-wider">
                    Bio & Seva Background (Internal Notes)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Brief background of seva, areas of leadership, or operational responsibilities..."
                    className="w-full px-3.5 py-2 rounded-lg border border-prayas-rule text-xs sm:text-sm text-prayas-ink focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 bg-prayas-paper/30"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-prayas-rule">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-prayas-rule bg-white text-prayas-ink hover:bg-prayas-stone text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : editingMember ? (
                    "Save Changes"
                  ) : (
                    "Create Member Profile"
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
