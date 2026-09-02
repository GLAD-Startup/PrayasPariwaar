"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
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
  MapPin,
  Calendar,
  CheckCircle,
  Eye,
  HeartHandshake,
  ExternalLink,
} from "lucide-react";

export default function AdminVolunteersPage() {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [causeFilter, setCauseFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState<any | null>(null);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/volunteers");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setVolunteers(json.data);
      } else {
        console.warn("[Volunteers Fetch Warning]", json.error);
      }
    } catch (e) {
      console.error("[Volunteers Fetch Error]", e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      const res = await apiFetch(`/api/volunteers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setVolunteers((prev) =>
          prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v))
        );
        if (selectedVolunteer?.id === id) {
          setSelectedVolunteer((prev: any) => (prev ? { ...prev, status: newStatus } : null));
        }
        setSuccessMsg(`Volunteer status updated to ${newStatus}.`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteVolunteer = async (id: string) => {
    if (!confirm("Are you sure you want to remove this volunteer application?")) return;

    setActionLoading(id);
    try {
      const res = await apiFetch(`/api/volunteers/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setVolunteers((prev) => prev.filter((v) => v.id !== id));
        if (selectedVolunteer?.id === id) setSelectedVolunteer(null);
        setSuccessMsg("Volunteer application deleted.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredVolunteers = volunteers.filter((vol) => {
    const matchesStatus = statusFilter === "ALL" || vol.status === statusFilter;
    const areas: string[] = Array.isArray(vol.areasOfInterest) && vol.areasOfInterest.length > 0
      ? vol.areasOfInterest
      : vol.areaOfInterest ? [vol.areaOfInterest] : ["Education"];
    const areasStr = areas.join(" ");

    const matchesCause =
      causeFilter === "ALL" ||
      areas.some((a) => a.toLowerCase().includes(causeFilter.toLowerCase()));

    const matchesSearch =
      vol.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vol.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vol.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vol.city && vol.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (vol.skills && vol.skills.toLowerCase().includes(searchQuery.toLowerCase())) ||
      areasStr.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesCause && matchesSearch;
  });

  const pendingCount = volunteers.filter((v) => v.status === "PENDING").length;
  const approvedCount = volunteers.filter((v) => v.status === "APPROVED" || v.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      {/* 1. Header with Stats Ribbon */}
      <div className="border border-prayas-rule bg-white rounded-2xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900">
            <Users className="w-3.5 h-3.5 text-emerald-700" />
            <span>Volunteer Seva Network</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink">
            Volunteer Applications & Roster
          </h1>
          <p className="text-xs text-prayas-muted max-w-2xl">
            Review, approve, and mobilize volunteer signups across all 5 grassroots Seva Streams (Free Education, Emergency Blood Donation, Parikrama Tree Plantation, Jeev Jal Seva, Vocational Training).
          </p>
        </div>

        <button
          onClick={fetchVolunteers}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-prayas-stone hover:bg-prayas-paper text-prayas-ink font-semibold text-xs rounded-xl border border-prayas-rule shadow-sm transition-colors self-start md:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-700" : ""}`} />
          <span>Refresh Roster</span>
        </button>
      </div>

      {/* 2. Top Stats Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="border border-prayas-rule bg-white rounded-xl p-4 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-prayas-muted uppercase tracking-wider">Total Applications</span>
          <p className="font-serif text-2xl font-bold text-prayas-ink">{volunteers.length}</p>
          <span className="text-[10px] text-slate-400">Registered in system</span>
        </div>

        <div className="border border-amber-200 bg-amber-50/50 rounded-xl p-4 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Pending Review</span>
          <p className="font-serif text-2xl font-bold text-amber-950">{pendingCount}</p>
          <span className="text-[10px] text-amber-700 font-medium">Requires verification</span>
        </div>

        <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-4 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Approved / Active</span>
          <p className="font-serif text-2xl font-bold text-emerald-950">{approvedCount}</p>
          <span className="text-[10px] text-emerald-700 font-medium">Ready for deployment</span>
        </div>

        <div className="border border-sky-200 bg-sky-50/50 rounded-xl p-4 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider">Cities Represented</span>
          <p className="font-serif text-2xl font-bold text-sky-950">
            {new Set(volunteers.map((v) => v.city).filter(Boolean)).size || 1}
          </p>
          <span className="text-[10px] text-sky-700 font-medium">Mathura, Vrindavan & Braj</span>
        </div>
      </div>

      {/* Success Notification */}
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

      {/* 3. Search and Filter Bar */}
      <div className="border border-prayas-rule bg-white rounded-2xl p-4 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-prayas-muted absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search name, city, causes, phone, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-prayas-rule bg-prayas-stone/40 text-xs text-prayas-ink placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-prayas-muted">Cause:</span>
              <select
                value={causeFilter}
                onChange={(e) => setCauseFilter(e.target.value)}
                className="bg-prayas-stone/60 border border-prayas-rule text-prayas-ink rounded-xl px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-700"
              >
                <option value="ALL">All Causes</option>
                <option value="Education">Education</option>
                <option value="Blood">Blood Donation</option>
                <option value="Plantation">Plantation</option>
                <option value="Jal">Jeev Jal Seva</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Vocational">Vocational</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-prayas-muted">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-prayas-stone/60 border border-prayas-rule text-prayas-ink rounded-xl px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-700"
              >
                <option value="ALL">All Statuses ({volunteers.length})</option>
                <option value="PENDING">PENDING ({pendingCount})</option>
                <option value="APPROVED">APPROVED</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Volunteer Roster Table */}
      <div className="bg-white border border-prayas-rule rounded-2xl overflow-hidden shadow-card">
        {loading ? (
          <div className="p-16 text-center text-prayas-muted text-xs">
            <RefreshCw className="w-6 h-6 text-emerald-700 animate-spin mx-auto mb-2" />
            <p className="font-semibold text-prayas-ink">Fetching volunteer applications...</p>
          </div>
        ) : filteredVolunteers.length === 0 ? (
          <div className="p-16 text-center text-prayas-muted text-xs space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-prayas-ink">
              No Volunteer Applications Found
            </h3>
            <p className="max-w-md mx-auto leading-relaxed">
              No volunteer signups match your current search and filter criteria.
            </p>
          </div>
        ) : (
          <div>
            {/* 1. MOBILE CARDS (< md) */}
            <div className="md:hidden divide-y divide-prayas-rule">
          {filteredVolunteers.map((vol) => {
            const areas: string[] = Array.isArray(vol.areasOfInterest) && vol.areasOfInterest.length > 0
              ? vol.areasOfInterest
              : vol.areaOfInterest ? [vol.areaOfInterest] : ["Education"];

            return (
              <div key={vol.id} className="p-4 space-y-3 hover:bg-prayas-stone/20 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-prayas-ink text-sm">{vol.name}</h3>
                    <div className="text-[11px] text-prayas-muted flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{vol.email}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      vol.status === "APPROVED" || vol.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                        : vol.status === "PENDING"
                        ? "bg-amber-100 text-amber-900 border border-amber-200"
                        : "bg-red-100 text-red-900 border border-red-200"
                    }`}
                  >
                    {vol.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-0.5">
                  <a
                    href={`tel:${vol.phone}`}
                    className="text-[11px] text-emerald-700 font-mono font-bold hover:underline flex items-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>{vol.phone}</span>
                  </a>

                  <span className="text-[11px] text-prayas-muted">
                    {vol.city || "Vrindavan / Mathura"}
                    {vol.state ? `, ${vol.state}` : ""}
                  </span>
                </div>

                {/* Areas of interest */}
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {areas.map((a, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 inline-block"
                    >
                      {a}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-prayas-rule/60 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedVolunteer(vol)}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-prayas-stone hover:bg-slate-200 text-prayas-ink border border-prayas-rule inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-700" />
                    <span>View Dossier</span>
                  </button>

                  {vol.status === "PENDING" ? (
                    <button
                      type="button"
                      onClick={() => updateStatus(vol.id, "APPROVED")}
                      disabled={actionLoading === vol.id}
                      className="flex-1 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs disabled:opacity-50 inline-flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  ) : vol.status === "APPROVED" ? (
                    <button
                      type="button"
                      onClick={() => updateStatus(vol.id, "ACTIVE")}
                      disabled={actionLoading === vol.id}
                      className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-50 inline-flex items-center justify-center cursor-pointer"
                    >
                      Mark Active
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => updateStatus(vol.id, "PENDING")}
                      disabled={actionLoading === vol.id}
                      className="flex-1 py-2 px-3 bg-prayas-stone hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-prayas-rule disabled:opacity-50 inline-flex items-center justify-center cursor-pointer"
                    >
                      Reset
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => deleteVolunteer(vol.id)}
                    disabled={actionLoading === vol.id}
                    className="p-2 text-slate-400 hover:text-rose-600 bg-prayas-stone hover:bg-rose-50 rounded-xl border border-prayas-rule transition-colors inline-flex items-center justify-center disabled:opacity-50 cursor-pointer"
                    title="Delete application"
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
                <th className="p-4 min-w-[200px]">Volunteer & Contact</th>
                <th className="p-4 min-w-[130px]">Location</th>
                <th className="p-4 min-w-[180px]">Areas of Interest (Causes)</th>
                <th className="p-4 min-w-[100px]">Status</th>
                <th className="p-4 min-w-[110px]">Date Applied</th>
                <th className="p-4 min-w-[140px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-prayas-rule">
              {filteredVolunteers.map((vol) => {
                const areas: string[] = Array.isArray(vol.areasOfInterest) && vol.areasOfInterest.length > 0
                  ? vol.areasOfInterest
                  : vol.areaOfInterest ? [vol.areaOfInterest] : ["Education"];

                return (
                  <tr key={vol.id} className="hover:bg-prayas-stone/30 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-prayas-ink text-sm">{vol.name}</div>
                      <div className="text-[11px] text-prayas-muted flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{vol.email}</span>
                      </div>
                      <a
                        href={`tel:${vol.phone}`}
                        className="text-[11px] text-emerald-700 font-mono font-bold hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>{vol.phone}</span>
                      </a>
                    </td>

                    <td className="p-4">
                      <span className="font-semibold text-prayas-ink block">
                        {vol.city || "Vrindavan / Mathura"}
                      </span>
                      {vol.state && (
                        <span className="text-[10px] text-prayas-muted">{vol.state}</span>
                      )}
                    </td>

                    <td className="p-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {areas.map((a, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 inline-block"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          vol.status === "APPROVED" || vol.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                            : vol.status === "PENDING"
                            ? "bg-amber-100 text-amber-900 border border-amber-200"
                            : "bg-red-100 text-red-900 border border-red-200"
                        }`}
                      >
                        {vol.status}
                      </span>
                    </td>

                    <td className="p-4 text-prayas-muted text-[11px]">
                      {new Date(vol.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedVolunteer(vol)}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors inline-flex items-center cursor-pointer"
                        title="View Full Dossier"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {vol.status === "PENDING" ? (
                        <button
                          onClick={() => updateStatus(vol.id, "APPROVED")}
                          disabled={actionLoading === vol.id}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      ) : vol.status === "APPROVED" ? (
                        <button
                          onClick={() => updateStatus(vol.id, "ACTIVE")}
                          disabled={actionLoading === vol.id}
                          className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-xl shadow-sm disabled:opacity-50 cursor-pointer"
                        >
                          Mark Active
                        </button>
                      ) : (
                        <button
                          onClick={() => updateStatus(vol.id, "PENDING")}
                          disabled={actionLoading === vol.id}
                          className="px-2.5 py-1.5 bg-prayas-stone hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-xl border border-prayas-rule disabled:opacity-50 cursor-pointer"
                        >
                          Reset
                        </button>
                      )}

                      <button
                        onClick={() => deleteVolunteer(vol.id)}
                        disabled={actionLoading === vol.id}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center disabled:opacity-50 cursor-pointer"
                        title="Delete application"
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

      {/* Volunteer Details Modal */}
      {selectedVolunteer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-prayas-rule space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-prayas-rule pb-3">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-emerald-700" />
                <h3 className="font-serif text-lg font-bold text-prayas-ink">
                  Volunteer Application Dossier
                </h3>
              </div>
              <button
                onClick={() => setSelectedVolunteer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] font-bold text-prayas-muted uppercase">Full Name</span>
                  <p className="font-bold text-sm text-prayas-ink">{selectedVolunteer.name}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-prayas-muted uppercase">Status</span>
                  <div className="mt-0.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        selectedVolunteer.status === "APPROVED" || selectedVolunteer.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                          : selectedVolunteer.status === "PENDING"
                          ? "bg-amber-100 text-amber-900 border border-amber-200"
                          : "bg-red-100 text-red-900 border border-red-200"
                      }`}
                    >
                      {selectedVolunteer.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] font-bold text-prayas-muted uppercase">Email Address</span>
                  <p className="text-prayas-ink">{selectedVolunteer.email}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-prayas-muted uppercase">Phone Number</span>
                  <p className="text-emerald-700 font-bold">{selectedVolunteer.phone}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-prayas-muted uppercase">Full Address</span>
                <p className="text-prayas-ink">
                  {selectedVolunteer.address || "N/A"}, {selectedVolunteer.city || "Vrindavan"},{" "}
                  {selectedVolunteer.state || "Uttar Pradesh"} - {selectedVolunteer.pincode || ""}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-prayas-muted uppercase">Areas of Interest (Causes)</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(Array.isArray(selectedVolunteer.areasOfInterest) && selectedVolunteer.areasOfInterest.length > 0
                    ? selectedVolunteer.areasOfInterest
                    : [selectedVolunteer.areaOfInterest || "Education"]
                  ).map((a: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px]"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              {selectedVolunteer.skills && (
                <div>
                  <span className="text-[10px] font-bold text-prayas-muted uppercase">Skills & Special Strengths</span>
                  <p className="text-prayas-ink bg-slate-50 p-2 rounded-lg border border-prayas-rule mt-0.5">
                    {selectedVolunteer.skills}
                  </p>
                </div>
              )}

              {selectedVolunteer.availability && (
                <div>
                  <span className="text-[10px] font-bold text-prayas-muted uppercase">Availability & Schedule</span>
                  <p className="text-prayas-ink bg-slate-50 p-2 rounded-lg border border-prayas-rule mt-0.5">
                    {selectedVolunteer.availability}
                  </p>
                </div>
              )}

              {selectedVolunteer.previousExperience && (
                <div>
                  <span className="text-[10px] font-bold text-prayas-muted uppercase">Previous Experience</span>
                  <p className="text-prayas-ink italic bg-slate-50 p-2 rounded-lg border border-prayas-rule mt-0.5">
                    "{selectedVolunteer.previousExperience}"
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-prayas-rule">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${selectedVolunteer.phone}`}
                  className="px-3 py-2 bg-emerald-50 text-emerald-800 font-bold rounded-xl text-xs hover:bg-emerald-100 flex items-center gap-1.5 border border-emerald-200"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
                <a
                  href={`mailto:${selectedVolunteer.email}`}
                  className="px-3 py-2 bg-blue-50 text-blue-800 font-bold rounded-xl text-xs hover:bg-blue-100 flex items-center gap-1.5 border border-blue-200"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </a>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedVolunteer(null)}
                  className="px-4 py-2 bg-prayas-stone text-prayas-ink font-semibold rounded-xl text-xs"
                >
                  Close
                </button>
                {selectedVolunteer.status === "PENDING" && (
                  <button
                    onClick={() => updateStatus(selectedVolunteer.id, "APPROVED")}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-sm"
                  >
                    Approve Application
                  </button>
                )}
                {selectedVolunteer.status === "APPROVED" && (
                  <button
                    onClick={() => updateStatus(selectedVolunteer.id, "ACTIVE")}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm"
                  >
                    Set as Active Sevak
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
