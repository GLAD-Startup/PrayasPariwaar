"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Droplet,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Calendar,
  Trash2,
  Heart,
  UserCheck,
  UserX,
  Download,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  Users,
  Clock,
} from "lucide-react";
import { BloodGroupValues, BloodGroupDisplayMap } from "@prayas/utils";
import { apiFetch } from "@/lib/api";

interface BloodDonor {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  bloodGroup: string | null;
  city: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function AdminBloodDonorsPage() {
  const [donors, setDonors] = useState<BloodDonor[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupFilter, setGroupFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchDonors();
  }, [groupFilter]);

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (groupFilter !== "ALL") params.set("bloodGroup", groupFilter);

      const res = await apiFetch(`/api/blood-donors?${params.toString()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setDonors(json.data);
      }
    } catch (e) {
      console.error("[Blood Donors Fetch Error]", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleDonorActive = async (id: string, currentStatus: boolean) => {
    setActionLoading(id);
    try {
      const res = await apiFetch(`/api/blood-donors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setDonors((prev) =>
          prev.map((d) => (d.id === id ? { ...d, isActive: !currentStatus } : d))
        );
        setFeedbackMsg({
          type: "success",
          text: `Donor status updated to ${!currentStatus ? "Active" : "Inactive"}.`,
        });
      } else {
        setFeedbackMsg({ type: "error", text: json.error || "Failed to update donor status." });
      }
    } catch (e: any) {
      setFeedbackMsg({ type: "error", text: e?.message || "Failed to update donor status." });
    } finally {
      setActionLoading(null);
    }
  };

  const removeDonor = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from the voluntary blood donor registry?`)) {
      return;
    }

    setActionLoading(id);
    try {
      const res = await apiFetch(`/api/blood-donors/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (res.ok && json.success) {
        setDonors((prev) => prev.filter((d) => d.id !== id));
        setFeedbackMsg({
          type: "success",
          text: `${name} has been removed from the voluntary donor registry.`,
        });
      } else {
        setFeedbackMsg({ type: "error", text: json.error || "Failed to remove donor." });
      }
    } catch (e: any) {
      setFeedbackMsg({ type: "error", text: e?.message || "Failed to remove donor." });
    } finally {
      setActionLoading(null);
    }
  };

  const exportCSV = () => {
    if (donors.length === 0) return;
    const headers = ["Name", "Blood Group", "Phone", "Email", "City", "Status", "Registered Date"];
    const rows = filteredDonors.map((d) => [
      `"${d.name.replace(/"/g, '""')}"`,
      `"${(BloodGroupDisplayMap[d.bloodGroup || ""] || d.bloodGroup || "N/A").replace(/"/g, '""')}"`,
      `"${(d.phone || "").replace(/"/g, '""')}"`,
      `"${(d.email.includes("@prayas.donor.local") ? "Not Provided" : d.email).replace(/"/g, '""')}"`,
      `"${(d.city || "Mathura / Vrindavan").replace(/"/g, '""')}"`,
      d.isActive ? "Active" : "Inactive",
      new Date(d.createdAt).toLocaleDateString("en-IN"),
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `prayas-voluntary-blood-donors-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredDonors = donors.filter((d) => {
    // Status filter
    if (statusFilter === "ACTIVE" && !d.isActive) return false;
    if (statusFilter === "INACTIVE" && d.isActive) return false;

    // Search query
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      d.name.toLowerCase().includes(q) ||
      (d.phone && d.phone.includes(q)) ||
      (d.email && d.email.toLowerCase().includes(q)) ||
      (d.city && d.city.toLowerCase().includes(q)) ||
      (d.bloodGroup && d.bloodGroup.toLowerCase().includes(q))
    );
  });

  const totalDonorsCount = donors.length;
  const activeDonorsCount = donors.filter((d) => d.isActive).length;
  const universalDonorsCount = donors.filter(
    (d) => d.bloodGroup === "O_NEGATIVE" || d.bloodGroup === "O_POSITIVE"
  ).length;
  const uniqueCitiesCount = new Set(donors.map((d) => d.city || "Mathura / Vrindavan")).size;

  return (
    <div className="space-y-6">
      {/* 1. Header with Queue Navigation Tabs */}
      <div className="border border-prayas-rule bg-white rounded-2xl p-6 shadow-card space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-bold text-prayas-crimson">
              <Droplet className="w-3.5 h-3.5 fill-current" />
              <span>Prayas Blood Seva Directorate</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink">
              Voluntary Blood Donors Registry
            </h1>
            <p className="text-xs text-prayas-muted max-w-2xl">
              Directory of voluntary donors registered via mobile app and web portal ready for emergency blood donations across Mathura, Vrindavan, Agra, and surrounding areas.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={exportCSV}
              disabled={donors.length === 0}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-prayas-stone text-prayas-ink font-semibold text-xs rounded-xl border border-prayas-rule shadow-sm transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={fetchDonors}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-prayas-stone hover:bg-prayas-paper text-prayas-ink font-semibold text-xs rounded-xl border border-prayas-rule shadow-sm transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-prayas-crimson" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs between Blood Requests and Blood Donors */}
        <div className="flex items-center gap-2 pt-2 border-t border-prayas-rule">
          <Link
            href="/admin/blood-requests"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-prayas-muted hover:text-prayas-ink hover:bg-prayas-stone transition-all flex items-center gap-2"
          >
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Emergency Blood Requests (Patients)</span>
          </Link>
          <div className="px-4 py-2 rounded-xl text-xs font-bold bg-prayas-crimson text-white shadow-sm flex items-center gap-2">
            <Droplet className="w-3.5 h-3.5 fill-current" />
            <span>Voluntary Donors Registry ({totalDonorsCount})</span>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
            feedbackMsg.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-red-50 text-red-900 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold ml-4"
          >
            ×
          </button>
        </div>
      )}

      {/* 2. Stats Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="border border-prayas-rule bg-white rounded-xl p-4 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-prayas-muted uppercase tracking-wider">Total Donors</span>
          <p className="font-serif text-2xl font-bold text-prayas-ink">{totalDonorsCount}</p>
          <span className="text-[10px] text-slate-400">Registered in registry</span>
        </div>

        <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-4 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            Active & Available
          </span>
          <p className="font-serif text-2xl font-bold text-emerald-950">{activeDonorsCount}</p>
          <span className="text-[10px] text-emerald-700 font-medium">Ready for immediate dispatch</span>
        </div>

        <div className="border border-red-200 bg-red-50/50 rounded-xl p-4 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-prayas-crimson uppercase tracking-wider">Universal Donors</span>
          <p className="font-serif text-2xl font-bold text-red-900">{universalDonorsCount}</p>
          <span className="text-[10px] text-red-700">O+ and O- blood groups</span>
        </div>

        <div className="border border-prayas-rule bg-white rounded-xl p-4 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-prayas-muted uppercase tracking-wider">Regions Active</span>
          <p className="font-serif text-2xl font-bold text-prayas-ink">{uniqueCitiesCount}</p>
          <span className="text-[10px] text-slate-400">Cities and tehsils</span>
        </div>
      </div>

      {/* 3. Search and Filter Bar */}
      <div className="border border-prayas-rule bg-white rounded-2xl p-4 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-prayas-muted absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search donor name, phone, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-prayas-rule bg-prayas-stone/40 text-xs text-prayas-ink placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-crimson font-medium"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-prayas-muted whitespace-nowrap">Availability:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-prayas-stone/60 border border-prayas-rule text-prayas-ink rounded-xl px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-prayas-crimson w-full sm:w-auto"
            >
              <option value="ALL">All ({donors.length})</option>
              <option value="ACTIVE">Active Donors Only</option>
              <option value="INACTIVE">Inactive Donors</option>
            </select>
          </div>
        </div>

        {/* Blood Group Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-prayas-rule text-xs">
          <span className="text-[11px] font-bold text-prayas-muted mr-1">Blood Group:</span>
          <button
            onClick={() => setGroupFilter("ALL")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              groupFilter === "ALL"
                ? "bg-prayas-crimson text-white shadow-sm font-bold"
                : "bg-prayas-stone/60 hover:bg-prayas-stone text-prayas-ink border border-prayas-rule"
            }`}
          >
            All Groups
          </button>
          {BloodGroupValues.map((bg) => {
            const label = BloodGroupDisplayMap[bg] || bg;
            const active = groupFilter === bg;
            return (
              <button
                key={bg}
                onClick={() => setGroupFilter(bg)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  active
                    ? "bg-prayas-crimson text-white shadow-sm font-bold"
                    : "bg-prayas-stone/60 hover:bg-prayas-stone text-prayas-ink border border-prayas-rule"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Donors Table / Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-16 border border-prayas-rule bg-white rounded-2xl text-center text-xs text-prayas-muted shadow-card">
            <RefreshCw className="w-6 h-6 text-prayas-crimson animate-spin mx-auto mb-2" />
            <p className="font-semibold text-prayas-ink">Fetching voluntary blood donor registry from database...</p>
          </div>
        ) : filteredDonors.length === 0 ? (
          <div className="p-16 border border-prayas-rule bg-white rounded-2xl text-center text-xs text-prayas-muted shadow-card space-y-3">
            <CheckCircle2 className="w-10 h-10 text-prayas-neem mx-auto" />
            <h3 className="font-serif text-lg font-bold text-prayas-ink">
              No Donors Found
            </h3>
            <p className="max-w-md mx-auto text-prayas-muted">
              There are no voluntary blood donors matching your current filter or search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDonors.map((donor) => {
              const displayBloodGroup = BloodGroupDisplayMap[donor.bloodGroup || ""] || donor.bloodGroup || "Unknown";
              const cleanPhone = donor.phone?.replace(/[\s-]/g, "") || "";
              const formattedPhone = donor.phone || "No phone provided";
              const isLocalEmail = donor.email.includes("@prayas.donor.local");

              return (
                <div
                  key={donor.id}
                  className={`border rounded-2xl p-5 shadow-card transition-all flex flex-col justify-between gap-4 ${
                    donor.isActive ? "bg-white border-prayas-rule hover:border-red-300" : "bg-slate-50 border-slate-200 opacity-80"
                  }`}
                >
                  {/* Card Header */}
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <h3 className="font-serif text-base font-bold text-prayas-ink">
                          {donor.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-prayas-muted">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{donor.city || "Mathura / Vrindavan"}</span>
                        </div>
                      </div>

                      {/* Blood Group Badge */}
                      <div className="px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-1.5 shadow-sm">
                        <Droplet className="w-3.5 h-3.5 text-prayas-crimson fill-current" />
                        <span className="font-bold text-xs text-prayas-crimson">
                          {displayBloodGroup}
                        </span>
                      </div>
                    </div>

                    {/* Contact details */}
                    <div className="pt-2 border-t border-prayas-rule/60 space-y-1 text-xs">
                      {donor.phone && (
                        <div className="flex items-center justify-between text-slate-700 font-medium">
                          <span className="text-prayas-muted">Phone:</span>
                          <span className="font-mono">{formattedPhone}</span>
                        </div>
                      )}

                      {!isLocalEmail && (
                        <div className="flex items-center justify-between text-slate-700 font-medium">
                          <span className="text-prayas-muted">Email:</span>
                          <span className="truncate max-w-[180px] text-[11px]">{donor.email}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>Registered:</span>
                        <span>{new Date(donor.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-3 border-t border-prayas-rule flex items-center justify-between gap-2">
                    {/* Communication shortcuts */}
                    <div className="flex items-center gap-1.5">
                      {donor.phone && (
                        <>
                          <a
                            href={`tel:${cleanPhone}`}
                            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                            title="Call Donor"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`https://wa.me/${cleanPhone.startsWith("+") ? cleanPhone.slice(1) : cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone}?text=${encodeURIComponent(`Namaste ${donor.name} ji, this is Prayas Pariwaar Voluntary Blood Seva Desk.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                            title="WhatsApp Message"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </>
                      )}

                      {!isLocalEmail && (
                        <a
                          href={`mailto:${donor.email}?subject=Prayas%20Pariwaar%20Blood%20Seva`}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                          title="Send Email"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    {/* Management toggles */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleDonorActive(donor.id, donor.isActive)}
                        disabled={actionLoading === donor.id}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition-colors flex items-center gap-1 ${
                          donor.isActive
                            ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200"
                            : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200"
                        }`}
                        title={donor.isActive ? "Set Inactive" : "Set Active"}
                      >
                        {donor.isActive ? (
                          <>
                            <UserX className="w-3 h-3" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3 h-3" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => removeDonor(donor.id, donor.name)}
                        disabled={actionLoading === donor.id}
                        className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors"
                        title="Remove from Donor Registry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
