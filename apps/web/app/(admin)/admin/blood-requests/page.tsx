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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Emergency Blood Requests Control
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review incoming donor requests, coordinate transfusions, and manage statuses.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Feed
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800 text-xs">
        <span className="text-slate-400 font-semibold">Filter:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="APPROVED">APPROVED</option>
          <option value="FULFILLED">FULFILLED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>

        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 outline-none"
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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No blood requests match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-4">Patient & Hospital</th>
                  <th className="p-4">Group</th>
                  <th className="p-4">Urgency</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Time</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {requests.map((req) => {
                  const displayGroup = BloodGroupDisplayMap[req.bloodGroup] || req.bloodGroup;
                  return (
                    <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{req.patientName}</div>
                        <div className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {req.hospitalName}, {req.city}
                        </div>
                        {req.notes && (
                          <div className="text-[10px] text-slate-500 italic mt-1 max-w-xs truncate">
                            "{req.notes}"
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <span className="inline-flex flex-col items-center justify-center px-2.5 py-1 rounded-lg bg-red-950/80 border border-red-800/60 text-red-300 font-bold">
                          <span className="text-sm">{displayGroup}</span>
                          <span className="text-[9px] text-red-400">{req.unitsNeeded} Units</span>
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase ${
                            req.urgency === "CRITICAL"
                              ? "bg-red-600 text-white animate-pulse"
                              : req.urgency === "HIGH"
                              ? "bg-rose-950 text-rose-300 border border-rose-800"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {req.urgency}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            req.status === "FULFILLED"
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                              : req.status === "APPROVED"
                              ? "bg-sky-950 text-sky-300 border border-sky-800"
                              : req.status === "CANCELLED"
                              ? "bg-slate-800 text-slate-500 line-through"
                              : "bg-amber-950 text-amber-300 border border-amber-800"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>

                      <td className="p-4">
                        <a
                          href={`tel:${req.contactPhone}`}
                          className="inline-flex items-center gap-1 text-slate-200 hover:text-white font-mono bg-slate-800 px-2.5 py-1 rounded-lg hover:bg-slate-700 transition-colors"
                        >
                          <PhoneCall className="w-3 h-3 text-red-400" />
                          {req.contactPhone}
                        </a>
                      </td>

                      <td className="p-4 text-slate-500 whitespace-nowrap">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>

                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {req.status !== "APPROVED" && req.status !== "FULFILLED" && (
                            <button
                              onClick={() => updateStatus(req.id, "APPROVED")}
                              disabled={actionLoading === req.id}
                              className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-[11px] font-bold transition-colors"
                            >
                              Approve
                            </button>
                          )}
                          {req.status !== "FULFILLED" && (
                            <button
                              onClick={() => updateStatus(req.id, "FULFILLED")}
                              disabled={actionLoading === req.id}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold transition-colors"
                            >
                              Fulfill
                            </button>
                          )}
                          {req.status !== "CANCELLED" && (
                            <button
                              onClick={() => updateStatus(req.id, "CANCELLED")}
                              disabled={actionLoading === req.id}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-300 rounded-lg text-[11px] font-bold transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
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
