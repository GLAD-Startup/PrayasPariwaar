"use client";

import { useState, useEffect } from "react";
import {
  Droplet,
  Flame,
  CheckCircle,
  XCircle,
  PhoneCall,
  Clock,
  MapPin,
  RefreshCw,
  Send,
  AlertCircle,
} from "lucide-react";
import { BloodGroupValues, BloodGroupDisplayMap } from "@prayas/utils";

export default function AdminBloodRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [groupFilter, setGroupFilter] = useState("ALL");
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

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="border-b border-prayas-rule pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink flex items-center gap-2">
            <Droplet className="w-6 h-6 text-prayas-crimson fill-current" />
            <span>Emergency Blood Requests Queue</span>
          </h1>
          <p className="text-xs text-prayas-muted mt-1">
            Review incoming hospital blood requests, coordinate voluntary donors, and manage dispatch statuses.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-prayas-stone text-prayas-ink font-semibold text-xs rounded-lg border border-prayas-rule shadow-sm transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-prayas-rule shadow-sm text-xs">
        <span className="text-prayas-ink font-bold">Filter By:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-prayas-paper border border-prayas-rule text-prayas-ink rounded-lg px-3 py-1.5 font-medium outline-none focus:ring-2 focus:ring-prayas-neem"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">PENDING (Urgent)</option>
          <option value="APPROVED">APPROVED (Coordinating)</option>
          <option value="FULFILLED">FULFILLED (Resolved)</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>

        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="bg-prayas-paper border border-prayas-rule text-prayas-ink rounded-lg px-3 py-1.5 font-medium outline-none focus:ring-2 focus:ring-prayas-neem"
        >
          <option value="ALL">All Blood Groups</option>
          {BloodGroupValues.map((bg) => (
            <option key={bg} value={bg}>
              {BloodGroupDisplayMap[bg]} ({bg})
            </option>
          ))}
        </select>
      </div>

      {/* Table / List */}
      <div className="bg-white border border-prayas-rule rounded-xl overflow-hidden shadow-card">
        {loading ? (
          <div className="p-12 text-center text-prayas-muted text-xs">
            Loading emergency queue...
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-prayas-muted text-xs">
            No blood requests match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-prayas-ink">
              <thead className="bg-prayas-stone border-b border-prayas-rule text-prayas-muted uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-4">Patient & Hospital</th>
                  <th className="p-4">Group & Units</th>
                  <th className="p-4">Urgency</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Date / Time</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-prayas-rule">
                {requests.map((req) => {
                  const displayGroup = BloodGroupDisplayMap[req.bloodGroup] || req.bloodGroup;
                  return (
                    <tr key={req.id} className="hover:bg-prayas-paper transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-prayas-ink text-sm">{req.patientName}</div>
                        <div className="text-prayas-muted text-[11px] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-prayas-muted" />
                          {req.hospitalName}, {req.city}
                        </div>
                        {req.notes && (
                          <div className="text-[11px] text-prayas-muted italic mt-1 max-w-xs truncate">
                            "{req.notes}"
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <span className="inline-flex flex-col items-center justify-center px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-prayas-crimson font-bold">
                          <span className="text-sm">{displayGroup}</span>
                          <span className="text-[10px] text-red-700">{req.unitsNeeded} Units</span>
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase ${
                            req.urgency === "CRITICAL"
                              ? "bg-[#B91C1C] text-white animate-pulse shadow-sm"
                              : req.urgency === "HIGH"
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : "bg-prayas-stone text-prayas-muted"
                          }`}
                        >
                          {req.urgency}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            req.status === "PENDING"
                              ? "bg-amber-100 text-amber-900 border border-amber-200"
                              : req.status === "APPROVED"
                              ? "bg-blue-100 text-blue-900 border border-blue-200"
                              : req.status === "FULFILLED"
                              ? "bg-green-100 text-emerald-900 border border-green-200"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>

                      <td className="p-4 font-mono text-xs">
                        <a
                          href={`tel:${req.contactPhone}`}
                          className="flex items-center gap-1 text-prayas-crimson font-bold hover:underline"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>{req.contactPhone}</span>
                        </a>
                      </td>

                      <td className="p-4 text-prayas-muted text-[11px]">
                        {new Date(req.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      <td className="p-4 text-right space-x-1.5">
                        {req.status === "PENDING" && (
                          <button
                            onClick={() => updateStatus(req.id, "APPROVED")}
                            disabled={actionLoading === req.id}
                            className="px-2.5 py-1 bg-[#2E5339] hover:bg-[#23432b] text-white text-[11px] font-bold rounded shadow-sm disabled:opacity-50"
                            style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
                          >
                            Approve
                          </button>
                        )}
                        {req.status === "APPROVED" && (
                          <button
                            onClick={() => updateStatus(req.id, "FULFILLED")}
                            disabled={actionLoading === req.id}
                            className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white text-[11px] font-bold rounded shadow-sm disabled:opacity-50"
                          >
                            Fulfilled
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            if (!confirm("Are you sure you want to delete this blood request?")) return;
                            setActionLoading(req.id);
                            try {
                              const res = await fetch(`/api/blood-requests/${req.id}`, { method: "DELETE" });
                              if (res.ok) setRequests((prev) => prev.filter((r) => r.id !== req.id));
                            } catch (e) {
                              console.error(e);
                            } finally {
                              setActionLoading(null);
                            }
                          }}
                          disabled={actionLoading === req.id}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors inline-flex items-center disabled:opacity-50"
                          title="Delete request"
                        >
                          <XCircle className="w-4 h-4" />
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
