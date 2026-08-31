"use client";

import { useState, useEffect } from "react";
import {
  Users,
  PhoneCall,
  Mail,
  CheckCircle2,
  Clock,
  Trash2,
  Search,
  Filter,
  AlertCircle,
  X,
  UserCheck,
  UserX,
  RefreshCw,
  Droplet,
  BookOpen,
  Sparkles,
} from "lucide-react";

export default function AdminVolunteersPage() {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/volunteers");
      const json = await res.json();
      if (json.success) {
        setVolunteers(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/volunteers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setVolunteers((prev) =>
          prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v))
        );
        setSuccessMsg(`Volunteer status updated to ${newStatus}`);
      }
    } catch (e) {
      console.error("Failed to update status", e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this volunteer application?")) return;

    setActionLoading(id);
    try {
      const res = await fetch(`/api/volunteers/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setVolunteers((prev) => prev.filter((v) => v.id !== id));
        setSuccessMsg("Volunteer application deleted.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  // Helper to determine volunteer category
  const getVolunteerType = (vol: any) => {
    const area = (vol.areaOfInterest || "").toLowerCase();
    const skills = (vol.skills || "").toLowerCase();
    const isBlood = area.includes("blood") || skills.includes("blood group");
    const isGeneral =
      area.includes("education") ||
      area.includes("tutoring") ||
      area.includes("plantation") ||
      area.includes("camps") ||
      area.includes("general") ||
      skills.includes("teacher") ||
      skills.includes("doctor") ||
      skills.includes("social");

    if (isBlood && isGeneral) return "DUAL_SEVA";
    if (isBlood) return "BLOOD_DONOR";
    return "GENERAL";
  };

  const filteredVolunteers = volunteers.filter((vol) => {
    const matchesStatus = statusFilter === "ALL" || vol.status === statusFilter;
    const volType = getVolunteerType(vol);
    const matchesType = typeFilter === "ALL" || volType === typeFilter;
    const matchesSearch =
      vol.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vol.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vol.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vol.skills && vol.skills.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (vol.areaOfInterest && vol.areaOfInterest.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="border-b border-prayas-rule pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink flex items-center gap-2">
            <Users className="w-6 h-6 text-prayas-marigold" />
            <span>Volunteer & Blood Donor Roster</span>
          </h1>
          <p className="text-xs text-prayas-muted mt-1">
            Review and approve applications for General Seva (Teaching, Plantation, Camps) and Emergency Blood Donors.
          </p>
        </div>

        <button
          onClick={fetchVolunteers}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-prayas-stone text-prayas-ink font-semibold text-xs rounded-lg border border-prayas-rule shadow-sm transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Roster</span>
        </button>
      </div>

      {/* Success alert */}
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

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-prayas-rule shadow-sm text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-prayas-ink">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-prayas-paper border border-prayas-rule text-prayas-ink rounded-lg px-2.5 py-1.5 font-medium outline-none focus:ring-2 focus:ring-prayas-neem"
            >
              <option value="ALL">All ({volunteers.length})</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          {/* Volunteer Type Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-prayas-ink">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-prayas-paper border border-prayas-rule text-prayas-ink rounded-lg px-2.5 py-1.5 font-semibold outline-none focus:ring-2 focus:ring-prayas-neem"
            >
              <option value="ALL">All Categories</option>
              <option value="GENERAL">🎓 General Seva Volunteer</option>
              <option value="BLOOD_DONOR">🩸 Emergency Blood Donor</option>
              <option value="DUAL_SEVA">🌟 Dual Seva (General + Blood)</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-prayas-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, skill, phone, blood group..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-prayas-rule bg-prayas-paper text-xs text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem"
          />
        </div>
      </div>

      {/* Volunteers Table */}
      <div className="bg-white border border-prayas-rule rounded-xl overflow-hidden shadow-card">
        {loading ? (
          <div className="p-12 text-center text-prayas-muted text-xs">
            Loading volunteer applications...
          </div>
        ) : filteredVolunteers.length === 0 ? (
          <div className="p-12 text-center text-prayas-muted text-xs">
            No applications found matching the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-prayas-ink">
              <thead className="bg-prayas-stone border-b border-prayas-rule text-prayas-muted uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-4">Volunteer Name & Contact</th>
                  <th className="p-4">Volunteer Seva Category</th>
                  <th className="p-4">Skills & Availability</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Phone / WhatsApp</th>
                  <th className="p-4 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-prayas-rule">
                {filteredVolunteers.map((vol) => {
                  const volType = getVolunteerType(vol);

                  return (
                    <tr key={vol.id} className="hover:bg-prayas-paper transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-prayas-ink text-sm flex items-center gap-1.5">
                          <span>{vol.name}</span>
                        </div>
                        <a
                          href={`mailto:${vol.email}`}
                          className="text-prayas-muted text-xs hover:text-prayas-neem flex items-center gap-1 mt-0.5"
                        >
                          <Mail className="w-3 h-3" />
                          <span>{vol.email}</span>
                        </a>
                      </td>

                      <td className="p-4">
                        {volType === "DUAL_SEVA" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-900 font-bold text-[11px]">
                            <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>Dual Seva (General + Donor)</span>
                          </span>
                        )}

                        {volType === "BLOOD_DONOR" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-50 border border-red-200 text-red-900 font-bold text-[11px]">
                            <Droplet className="w-3 h-3 text-red-600 fill-current shrink-0" />
                            <span>Blood Donor Volunteer</span>
                          </span>
                        )}

                        {volType === "GENERAL" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-green-50 border border-green-200 text-green-900 font-semibold text-[11px]">
                            <BookOpen className="w-3 h-3 text-prayas-neem shrink-0" />
                            <span>{vol.areaOfInterest || "General Volunteer"}</span>
                          </span>
                        )}

                        {vol.areaOfInterest && volType !== "GENERAL" && (
                          <span className="text-[10px] text-prayas-muted block mt-0.5 truncate max-w-xs">
                            {vol.areaOfInterest}
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="font-medium text-prayas-ink">{vol.skills || "Eager to help"}</div>
                        <div className="text-prayas-muted text-[11px] flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{vol.availability}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            vol.status === "ACTIVE"
                              ? "bg-green-100 text-emerald-900 border border-green-200"
                              : vol.status === "APPROVED"
                              ? "bg-blue-100 text-blue-900 border border-blue-200"
                              : vol.status === "PENDING"
                              ? "bg-amber-100 text-amber-900 border border-amber-200"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {vol.status}
                        </span>
                      </td>

                      <td className="p-4 font-mono text-xs">
                        <a
                          href={`tel:${vol.phone}`}
                          className="text-prayas-neem font-bold hover:underline flex items-center gap-1"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>{vol.phone}</span>
                        </a>
                      </td>

                      <td className="p-4 text-right space-x-1.5">
                        {vol.status === "PENDING" && (
                          <button
                            onClick={() => updateStatus(vol.id, "APPROVED")}
                            disabled={actionLoading === vol.id}
                            className="px-2.5 py-1 bg-[#2E5339] hover:bg-[#23432b] text-white text-[11px] font-bold rounded shadow-sm disabled:opacity-50"
                            style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
                          >
                            Approve
                          </button>
                        )}

                        {vol.status === "APPROVED" && (
                          <button
                            onClick={() => updateStatus(vol.id, "ACTIVE")}
                            disabled={actionLoading === vol.id}
                            className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white text-[11px] font-bold rounded shadow-sm disabled:opacity-50"
                          >
                            Mark Active
                          </button>
                        )}

                        {vol.status === "ACTIVE" && (
                          <button
                            onClick={() => updateStatus(vol.id, "INACTIVE")}
                            disabled={actionLoading === vol.id}
                            className="px-2.5 py-1 bg-prayas-stone hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded border border-prayas-rule disabled:opacity-50"
                          >
                            Set Inactive
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(vol.id)}
                          disabled={actionLoading === vol.id}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors inline-flex items-center disabled:opacity-50"
                          title="Delete volunteer"
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
