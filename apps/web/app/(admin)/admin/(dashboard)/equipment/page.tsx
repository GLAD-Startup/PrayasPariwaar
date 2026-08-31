"use client";

import { useState, useEffect } from "react";
import ImageUpload from "@/components/ImageUpload";
import {
  Stethoscope,
  Plus,
  CheckCircle2,
  Clock,
  MapPin,
  PhoneCall,
  Trash2,
  X,
  AlertCircle,
  Activity,
  Layers,
  Send,
  Loader2,
  RefreshCw,
  Search,
  CheckCircle,
  Package,
  Wrench,
} from "lucide-react";

export default function AdminEquipmentPage() {
  const [activeTab, setActiveTab] = useState<"INVENTORY" | "REQUESTS">("REQUESTS");
  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [requestsList, setRequestsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingDevice, setIsAddingDevice] = useState(false);
  const [submittingDevice, setSubmittingDevice] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // New Device Form State
  const [newDevice, setNewDevice] = useState({
    name: "",
    category: "OXYGEN_CONCENTRATOR",
    description: "",
    totalUnits: 1,
    availableUnits: 1,
    status: "AVAILABLE",
    imageUrl: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/equipment");
      const json = await res.json();
      if (json.success) {
        setEquipmentList(json.data);
        // Flatten requests from all equipment
        const allReqs: any[] = [];
        json.data.forEach((eq: any) => {
          if (eq.requests) {
            eq.requests.forEach((r: any) => {
              allReqs.push({ ...r, equipmentName: eq.name, equipmentCategory: eq.category });
            });
          }
        });
        setRequestsList(allReqs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingDevice(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDevice),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to add device to inventory.");
      }

      setSuccessMsg("Medical device added to inventory successfully!");
      setIsAddingDevice(false);
      setNewDevice({
        name: "",
        category: "OXYGEN_CONCENTRATOR",
        description: "",
        totalUnits: 1,
        availableUnits: 1,
        status: "AVAILABLE",
        imageUrl: "",
      });
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setSubmittingDevice(false);
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    setActionLoading(requestId);
    try {
      const res = await fetch(`/api/equipment/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setRequestsList((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r))
        );
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const updateDeviceStatus = async (deviceId: string, newStatus: string) => {
    setActionLoading(deviceId);
    try {
      const res = await fetch(`/api/equipment/${deviceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setEquipmentList((prev) =>
          prev.map((eq) => (eq.id === deviceId ? { ...eq, status: newStatus } : eq))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteDevice = async (deviceId: string) => {
    if (!confirm("Are you sure you want to remove this medical equipment asset?")) return;
    setActionLoading(deviceId);
    try {
      const res = await fetch(`/api/equipment/${deviceId}`, { method: "DELETE" });
      if (res.ok) {
        setEquipmentList((prev) => prev.filter((eq) => eq.id !== deviceId));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteRequest = async (requestId: string) => {
    if (!confirm("Are you sure you want to remove this patient borrowing request?")) return;
    setActionLoading(requestId);
    try {
      const res = await fetch(`/api/equipment/requests/${requestId}`, { method: "DELETE" });
      if (res.ok) {
        setRequestsList((prev) => prev.filter((r) => r.id !== requestId));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const totalDevices = equipmentList.reduce((sum, eq) => sum + (eq.totalUnits || 1), 0);
  const availableDevices = equipmentList.filter((eq) => eq.status === "AVAILABLE").length;
  const pendingLoans = requestsList.filter((r) => r.status === "PENDING").length;
  const activeLoans = requestsList.filter((r) => r.status === "ACTIVE" || r.status === "APPROVED").length;

  const filteredEquipment = equipmentList.filter((eq) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return eq.name.toLowerCase().includes(q) || eq.category.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* 1. Header with Add Button */}
      <div className="border border-prayas-rule bg-white rounded-2xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
            <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
            <span>Free Community Medical Lending Bank</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink">
            Medical Equipment Bank & Loan Queue
          </h1>
          <p className="text-xs text-prayas-muted max-w-2xl">
            Manage oxygen concentrators, hospital beds, wheelchairs, and review incoming patient home loan requests across Mathura district.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsAddingDevice(!isAddingDevice)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#2E5339] text-white hover:bg-[#23432b] transition-all shadow-md"
            style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
          >
            {isAddingDevice ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isAddingDevice ? "Cancel Form" : "Add New Device Asset"}</span>
          </button>

          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 bg-prayas-stone hover:bg-prayas-paper text-prayas-ink rounded-xl border border-prayas-rule shadow-sm transition-colors disabled:opacity-50"
            title="Refresh Inventory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-prayas-neem" : ""}`} />
          </button>
        </div>
      </div>

      {/* 2. Top Stats Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="border border-prayas-rule bg-white rounded-xl p-4 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-prayas-muted uppercase tracking-wider">Total Inventory Assets</span>
          <p className="font-serif text-2xl font-bold text-prayas-ink">{equipmentList.length}</p>
          <span className="text-[10px] text-slate-400">{totalDevices} total units in bank</span>
        </div>

        <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-4 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Available in Center</span>
          <p className="font-serif text-2xl font-bold text-emerald-950">{availableDevices}</p>
          <span className="text-[10px] text-emerald-700 font-medium">Ready for dispatch</span>
        </div>

        <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-4 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Active Patient Loans</span>
          <p className="font-serif text-2xl font-bold text-blue-950">{activeLoans}</p>
          <span className="text-[10px] text-blue-700">In patient homecare</span>
        </div>

        <div className="border border-amber-200 bg-amber-50/50 rounded-xl p-4 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Pending Requests</span>
          <p className="font-serif text-2xl font-bold text-amber-950">{pendingLoans}</p>
          <span className="text-[10px] text-amber-700">Awaiting coordinator review</span>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Collapsible Add New Device Form */}
      {isAddingDevice && (
        <div className="border border-emerald-900/20 bg-white rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-prayas-rule pb-4 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-prayas-ink">
                Register New Medical Equipment to Bank
              </h2>
              <p className="text-xs text-prayas-muted mt-0.5">
                Add 10L oxygen concentrators, hospital beds, wheelchairs, or monitors available for free community lending.
              </p>
            </div>
            <button
              onClick={() => setIsAddingDevice(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleAddDevice} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-prayas-ink block">Equipment Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Philips EverFlo 10L Oxygen Concentrator"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/40 text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-medium text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-prayas-ink block">Category *</label>
                <select
                  value={newDevice.category}
                  onChange={(e) => setNewDevice({ ...newDevice, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/40 text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-semibold text-xs sm:text-sm"
                >
                  <option value="OXYGEN_CONCENTRATOR">Oxygen Concentrator (5L / 10L)</option>
                  <option value="HOSPITAL_BED">Hospital Bed (Semi-Fowler / Full)</option>
                  <option value="WHEELCHAIR">Wheelchair / Mobility Aid</option>
                  <option value="BIPAP_CPAP">BiPAP / CPAP Machine</option>
                  <option value="PATIENT_MONITOR">Patient Monitor / Suction Apparatus</option>
                  <option value="OTHER">Other Life-Support Equipment</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-prayas-ink block">Total Units In Bank *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newDevice.totalUnits}
                  onChange={(e) =>
                    setNewDevice({
                      ...newDevice,
                      totalUnits: Number(e.target.value),
                      availableUnits: Number(e.target.value),
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/40 text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-mono text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-prayas-ink block">Initial Status *</label>
                <select
                  value={newDevice.status}
                  onChange={(e) => setNewDevice({ ...newDevice, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/40 text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-semibold text-xs sm:text-sm"
                >
                  <option value="AVAILABLE">AVAILABLE (In Center)</option>
                  <option value="LEASED">LEASED (At Patient Home)</option>
                  <option value="MAINTENANCE">MAINTENANCE (Servicing)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <ImageUpload
                  label="Device Photograph (Saved to Server)"
                  value={newDevice.imageUrl}
                  onChange={(url) => setNewDevice({ ...newDevice, imageUrl: url })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-prayas-ink block">Specifications & Usage Notes</label>
              <textarea
                rows={2}
                placeholder="Include flow rate, accessories included (cannula, mask, humidifier bottle)..."
                value={newDevice.description}
                onChange={(e) => setNewDevice({ ...newDevice, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/40 text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem text-xs sm:text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingDevice(false)}
                className="px-5 py-2.5 rounded-xl border border-prayas-rule font-semibold text-prayas-ink hover:bg-prayas-stone"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingDevice}
                className="px-6 py-2.5 rounded-xl font-bold bg-[#2E5339] text-white hover:bg-[#23432b] shadow-md flex items-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
              >
                {submittingDevice ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
                <span>{submittingDevice ? "Registering..." : "Add to Medical Bank →"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Tab Navigation & Search Toolbar */}
      <div className="border border-prayas-rule bg-white rounded-2xl p-4 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("REQUESTS")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "REQUESTS"
                  ? "bg-[#2E5339] text-white shadow-md"
                  : "bg-prayas-stone/60 hover:bg-prayas-stone text-prayas-ink border border-prayas-rule"
              }`}
              style={activeTab === "REQUESTS" ? { backgroundColor: "#2E5339", color: "#ffffff" } : {}}
            >
              Patient Loan Requests ({requestsList.length})
            </button>

            <button
              onClick={() => setActiveTab("INVENTORY")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "INVENTORY"
                  ? "bg-[#2E5339] text-white shadow-md"
                  : "bg-prayas-stone/60 hover:bg-prayas-stone text-prayas-ink border border-prayas-rule"
              }`}
              style={activeTab === "INVENTORY" ? { backgroundColor: "#2E5339", color: "#ffffff" } : {}}
            >
              Equipment Inventory Assets ({equipmentList.length})
            </button>
          </div>

          {activeTab === "INVENTORY" && (
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-prayas-muted absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-1.5 rounded-xl border border-prayas-rule bg-prayas-stone/40 text-xs text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-medium"
              />
            </div>
          )}
        </div>
      </div>

      {/* 5. TAB 1: PATIENT BORROWING REQUESTS QUEUE */}
      {activeTab === "REQUESTS" && (
        <div className="bg-white border border-prayas-rule rounded-2xl overflow-hidden shadow-card">
          {loading ? (
            <div className="p-16 text-center text-prayas-muted text-xs">
              <RefreshCw className="w-6 h-6 text-prayas-neem animate-spin mx-auto mb-2" />
              <p className="font-semibold text-prayas-ink">Loading patient equipment loan queue...</p>
            </div>
          ) : requestsList.length === 0 ? (
            <div className="p-16 text-center text-prayas-muted text-xs space-y-3">
              <CheckCircle2 className="w-10 h-10 text-prayas-neem mx-auto" />
              <h3 className="font-serif text-lg font-bold text-prayas-ink">
                No Active Patient Borrowing Requests
              </h3>
              <p className="max-w-md mx-auto leading-relaxed">
                All patient equipment loans have been processed and dispatched. New incoming borrowing requests will appear here in real-time.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-prayas-ink">
                <thead className="bg-prayas-stone border-b border-prayas-rule text-prayas-muted uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="p-4">Requester & Phone</th>
                    <th className="p-4">Requested Device</th>
                    <th className="p-4">Duration & Purpose</th>
                    <th className="p-4">Delivery Address</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Loan Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-prayas-rule">
                  {requestsList.map((r) => (
                    <tr key={r.id} className="hover:bg-prayas-stone/30 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-prayas-ink text-sm">{r.requesterName}</div>
                        <a
                          href={`tel:${r.contactPhone}`}
                          className="text-prayas-neem font-mono text-xs font-bold hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>{r.contactPhone}</span>
                        </a>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-prayas-ink block">{r.equipmentName}</span>
                        <span className="text-[10px] text-prayas-muted font-semibold uppercase">
                          {r.equipmentCategory}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-semibold text-prayas-ink block">
                          {r.requestedDays} Days Loan
                        </span>
                        {r.purpose && (
                          <span className="text-[11px] text-prayas-muted italic line-clamp-1">
                            "{r.purpose}"
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-prayas-muted max-w-xs">
                        <div className="flex items-center gap-1 text-[11px]">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-prayas-muted" />
                          <span className="truncate">{r.deliveryAddress}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            r.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                              : r.status === "APPROVED"
                              ? "bg-blue-100 text-blue-900 border border-blue-200"
                              : r.status === "PENDING"
                              ? "bg-amber-100 text-amber-900 border border-amber-200"
                              : r.status === "RETURNED"
                              ? "bg-slate-100 text-slate-700"
                              : "bg-red-100 text-red-900"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>

                      <td className="p-4 text-right space-x-2">
                        {r.status === "PENDING" && (
                          <button
                            onClick={() => updateRequestStatus(r.id, "APPROVED")}
                            disabled={actionLoading === r.id}
                            className="px-3 py-1.5 bg-[#2E5339] hover:bg-[#23432b] text-white text-[11px] font-bold rounded-xl shadow-sm disabled:opacity-50"
                            style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
                          >
                            Approve
                          </button>
                        )}

                        {r.status === "APPROVED" && (
                          <button
                            onClick={() => updateRequestStatus(r.id, "ACTIVE")}
                            disabled={actionLoading === r.id}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl shadow-sm disabled:opacity-50"
                          >
                            Delivered
                          </button>
                        )}

                        {r.status === "ACTIVE" && (
                          <button
                            onClick={() => updateRequestStatus(r.id, "RETURNED")}
                            disabled={actionLoading === r.id}
                            className="px-3 py-1.5 bg-prayas-stone hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-xl border border-prayas-rule disabled:opacity-50"
                          >
                            Mark Returned
                          </button>
                        )}

                        <button
                          onClick={() => deleteRequest(r.id)}
                          disabled={actionLoading === r.id}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center disabled:opacity-50"
                          title="Delete request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 6. TAB 2: EQUIPMENT INVENTORY ASSETS (Fluid Grid) */}
      {activeTab === "INVENTORY" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filteredEquipment.map((eq) => {
            const isAvail = eq.status === "AVAILABLE";
            return (
              <div
                key={eq.id}
                className="bg-white border border-prayas-rule rounded-2xl p-5 shadow-card hover:shadow-lg transition-all duration-200 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Photo Container */}
                  <div className="aspect-[16/10] rounded-xl overflow-hidden border border-prayas-rule bg-prayas-stone/50 relative flex items-center justify-center">
                    {eq.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={eq.imageUrl}
                        alt={eq.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-center p-4 text-prayas-muted">
                        <Stethoscope className="w-10 h-10 mx-auto text-prayas-neem/60 mb-1" />
                        <span className="text-[10px] uppercase font-bold">Equipment Asset</span>
                      </div>
                    )}

                    <div className="absolute top-2 right-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm ${
                          isAvail
                            ? "bg-emerald-600 text-white"
                            : eq.status === "MAINTENANCE"
                            ? "bg-amber-600 text-white"
                            : "bg-blue-600 text-white"
                        }`}
                      >
                        {eq.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block uppercase tracking-wider">
                      {eq.category.replace(/_/g, " ")}
                    </span>

                    <h3 className="font-serif text-base font-bold text-prayas-ink line-clamp-1 group-hover:text-[#2E5339] transition-colors">
                      {eq.name}
                    </h3>

                    <p className="text-xs text-prayas-muted leading-relaxed line-clamp-2">
                      {eq.description || "Maintained in free community circulation for Vrindavan homecare."}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-prayas-rule flex items-center justify-between text-xs">
                  <button
                    onClick={() =>
                      updateDeviceStatus(
                        eq.id,
                        eq.status === "AVAILABLE" ? "MAINTENANCE" : "AVAILABLE"
                      )
                    }
                    disabled={actionLoading === eq.id}
                    className="text-[11px] font-semibold text-prayas-neem hover:underline flex items-center gap-1 disabled:opacity-50"
                  >
                    <Wrench className="w-3 h-3" />
                    <span>Set {eq.status === "AVAILABLE" ? "Maintenance" : "Available"}</span>
                  </button>

                  <button
                    onClick={() => deleteDevice(eq.id)}
                    disabled={actionLoading === eq.id}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete device"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
