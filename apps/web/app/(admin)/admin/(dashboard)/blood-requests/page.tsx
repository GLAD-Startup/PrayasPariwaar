"use client";

import { useState, useEffect } from "react";
import {
  Droplet,
  CheckCircle,
  XCircle,
  PhoneCall,
  Clock,
  MapPin,
  RefreshCw,
  Search,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Share2,
  ExternalLink,
  MessageCircle,
  Filter,
} from "lucide-react";
import { BloodGroupValues, BloodGroupDisplayMap } from "@prayas/utils";

export default function AdminBloodRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [groupFilter, setGroupFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, groupFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (groupFilter !== "ALL") params.set("bloodGroup", groupFilter);

      const res = await fetch(`/api/blood-requests?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setRequests(json.data);
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
      const res = await fetch(`/api/blood-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
      }
    } catch (e) {
      console.error("Failed to update status", e);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteRequest = async (id: string) => {
    if (!confirm("Are you sure you want to remove this emergency blood request?")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/blood-requests/${id}`, { method: "DELETE" });
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.patientName.toLowerCase().includes(q) ||
      r.hospitalName.toLowerCase().includes(q) ||
      r.city.toLowerCase().includes(q) ||
      r.contactPhone.includes(q)
    );
  });

  const criticalCount = requests.filter((r) => r.urgency === "CRITICAL" && r.status === "PENDING").length;
  const pendingCount = requests.filter((r) => r.status === "PENDING").length;
  const totalUnits = requests.reduce((sum, r) => sum + (r.unitsNeeded || 1), 0);

  return (
    <div className="space-y-6">
      {/* 1. Header with Stats Ribbon */}
      <div className="border border-prayas-rule bg-white rounded-2xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-bold text-prayas-crimson">
            <Droplet className="w-3.5 h-3.5 fill-current" />
            <span>24/7 Voluntary Blood Donor Desk</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink">
            Emergency Blood Requests Queue
          </h1>
          <p className="text-xs text-prayas-muted max-w-2xl">
            Review incoming hospital blood requests, coordinate voluntary donors across Mathura, Vrindavan, and Agra, and manage dispatch statuses.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-prayas-stone hover:bg-prayas-paper text-prayas-ink font-semibold text-xs rounded-xl border border-prayas-rule shadow-sm transition-colors self-start md:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-prayas-crimson" : ""}`} />
          <span>Refresh Live Queue</span>
        </button>
      </div>

      {/* 2. Top Stats Counter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="border border-prayas-rule bg-white rounded-xl p-4 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-prayas-muted uppercase tracking-wider">Total in Queue</span>
          <p className="font-serif text-2xl font-bold text-prayas-ink">{requests.length}</p>
          <span className="text-[10px] text-slate-400">All registered cases</span>
        </div>

        <div className="border border-red-200 bg-red-50/50 rounded-xl p-4 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-prayas-crimson uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            Critical Pending
          </span>
          <p className="font-serif text-2xl font-bold text-red-900">{criticalCount}</p>
          <span className="text-[10px] text-red-700 font-medium">&lt; 60 min required</span>
        </div>

        <div className="border border-amber-200 bg-amber-50/50 rounded-xl p-4 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Pending Action</span>
          <p className="font-serif text-2xl font-bold text-amber-950">{pendingCount}</p>
          <span className="text-[10px] text-amber-700">Awaiting donor match</span>
        </div>

        <div className="border border-prayas-rule bg-white rounded-xl p-4 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-prayas-muted uppercase tracking-wider">Total Units Needed</span>
          <p className="font-serif text-2xl font-bold text-prayas-ink">{totalUnits}</p>
          <span className="text-[10px] text-slate-400">Whole blood / PRBC</span>
        </div>
      </div>

      {/* 3. Advanced Filter Bar & Search */}
      <div className="border border-prayas-rule bg-white rounded-2xl p-4 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-prayas-muted absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search patient, hospital, city, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-prayas-rule bg-prayas-stone/40 text-xs text-prayas-ink placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-medium"
            >
            </input>
          </div>

          {/* Status filter dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-prayas-muted whitespace-nowrap">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-prayas-stone/60 border border-prayas-rule text-prayas-ink rounded-xl px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-prayas-neem w-full sm:w-auto"
            >
              <option value="ALL">All Statuses ({requests.length})</option>
              <option value="PENDING">PENDING (Urgent)</option>
              <option value="APPROVED">APPROVED (Coordinating)</option>
              <option value="FULFILLED">FULFILLED (Resolved)</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>

        {/* Blood group pills */}
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

      {/* 4. Requests List / Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-16 border border-prayas-rule bg-white rounded-2xl text-center text-xs text-prayas-muted shadow-card">
            <RefreshCw className="w-6 h-6 text-prayas-crimson animate-spin mx-auto mb-2" />
            <p className="font-semibold text-prayas-ink">Fetching emergency blood queue from database...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-16 border border-prayas-rule bg-white rounded-2xl text-center text-xs text-prayas-muted shadow-card space-y-3">
            <CheckCircle2 className="w-10 h-10 text-prayas-neem mx-auto" />
            <h3 className="font-serif text-lg font-bold text-prayas-ink">
              No Blood Requests Found
            </h3>
            <p className="max-w-md mx-auto">
              There are no blood requests matching your active search and filter criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((req) => {
              const isCritical = req.urgency === "CRITICAL";
              const isPending = req.status === "PENDING";
              const displayGroup = BloodGroupDisplayMap[req.bloodGroup] || req.bloodGroup;

              return (
                <div
                  key={req.id}
                  className={`border rounded-2xl p-5 sm:p-6 shadow-card transition-all duration-200 ${
                    isCritical
                      ? "border-red-300 bg-red-50/30"
                      : "border-prayas-rule bg-white"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Left: Blood Avatar & Details */}
                    <div className="flex items-start gap-4 sm:gap-5 min-w-0">
                      {/* Blood Group Badge */}
                      <div
                        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center font-serif font-bold shrink-0 shadow-sm ${
                          isCritical
                            ? "bg-prayas-crimson text-white border-2 border-red-600"
                            : "bg-rose-50 border-2 border-rose-200 text-rose-800"
                        }`}
                      >
                        <span className="text-xl sm:text-2xl leading-none">
                          {displayGroup}
                        </span>
                        <span className="text-[10px] font-sans font-medium uppercase mt-1 opacity-90">
                          {req.unitsNeeded} {req.unitsNeeded > 1 ? "Units" : "Unit"}
                        </span>
                      </div>

                      {/* Case Information */}
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isCritical
                                ? "bg-red-600 text-white shadow-sm"
                                : req.urgency === "HIGH"
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {req.urgency} Urgency
                          </span>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              req.status === "PENDING"
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : req.status === "APPROVED"
                                ? "bg-blue-100 text-blue-900 border border-blue-300"
                                : req.status === "FULFILLED"
                                ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            Status: {req.status}
                          </span>

                          <span className="text-[11px] text-prayas-muted flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(req.createdAt).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <h3 className="font-serif text-lg sm:text-xl font-bold text-prayas-ink">
                          Patient: {req.patientName}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-prayas-muted">
                          <span className="flex items-center gap-1 font-medium text-prayas-ink">
                            <MapPin className="w-3.5 h-3.5 text-prayas-crimson" />
                            {req.hospitalName}, {req.city}
                          </span>
                        </div>

                        {req.notes && (
                          <p className="text-xs text-prayas-ink/80 bg-white/80 p-2.5 rounded-lg border border-prayas-rule/80 leading-relaxed mt-2">
                            <strong>Medical Note:</strong> {req.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Contact & Dispatch Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-prayas-rule">
                      {/* Direct Phone Dial Link */}
                      <a
                        href={`tel:${req.contactPhone}`}
                        className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-prayas-crimson border border-red-200 font-bold text-xs flex items-center gap-2 transition-colors w-full sm:w-auto text-center justify-center"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Call Attendant: {req.contactPhone}</span>
                      </a>

                      {/* Status Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        {req.status === "PENDING" && (
                          <button
                            onClick={() => updateStatus(req.id, "APPROVED")}
                            disabled={actionLoading === req.id}
                            className="px-3.5 py-2 bg-[#2E5339] hover:bg-[#23432b] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                            style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve & Dispatch</span>
                          </button>
                        )}

                        {req.status === "APPROVED" && (
                          <button
                            onClick={() => updateStatus(req.id, "FULFILLED")}
                            disabled={actionLoading === req.id}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Mark Fulfilled</span>
                          </button>
                        )}

                        {req.status === "FULFILLED" && (
                          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Resolved & Verified
                          </span>
                        )}

                        <button
                          onClick={() => deleteRequest(req.id)}
                          disabled={actionLoading === req.id}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                          title="Delete request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
