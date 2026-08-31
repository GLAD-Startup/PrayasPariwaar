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
      setErrorMsg(err.message || "Failed to create device.");
    } finally {
      setSubmittingDevice(false);
    }
  };

  const updateDeviceStatus = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/equipment/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setEquipmentList((prev) =>
          prev.map((eq) => (eq.id === id ? { ...eq, status: newStatus } : eq))
        );
        setSuccessMsg(`Device status updated to ${newStatus}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteDevice = async (id: string) => {
    if (!confirm("Are you sure you want to delete this device from inventory?")) return;

    setActionLoading(id);
    try {
      const res = await fetch(`/api/equipment/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setEquipmentList((prev) => prev.filter((eq) => eq.id !== id));
        setSuccessMsg("Device deleted from inventory.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const updateRequestStatus = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/equipment/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setRequestsList((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
        setSuccessMsg(`Loan request updated to ${newStatus}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteRequest = async (id: string) => {
    if (!confirm("Are you sure you want to delete this patient loan request?")) return;

    setActionLoading(id);
    try {
      const res = await fetch(`/api/equipment/requests/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setRequestsList((prev) => prev.filter((r) => r.id !== id));
        setSuccessMsg("Loan request deleted.");
      }
    } catch (e) {
      console.error(e);
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
            <Stethoscope className="w-6 h-6 text-prayas-neem" />
            <span>Medical Equipment Bank & Loan Queue</span>
          </h1>
          <p className="text-xs text-prayas-muted mt-1">
            Manage oxygen concentrators, hospital beds, wheelchairs, and review incoming patient home loan requests.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              setIsAddingDevice(!isAddingDevice);
              setActiveTab("INVENTORY");
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#2E5339] text-white font-bold text-xs rounded-lg shadow-md hover:bg-[#23432b] transition-all"
            style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
          >
            {isAddingDevice ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isAddingDevice ? "Cancel" : "Add New Device Asset"}</span>
          </button>

          <button
            onClick={fetchData}
            className="p-2 bg-white hover:bg-prayas-stone text-prayas-ink rounded-lg border border-prayas-rule shadow-sm"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Messages */}
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

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-prayas-crimson shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-700 hover:text-red-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ADD NEW DEVICE FORM */}
      {isAddingDevice && (
        <div className="border border-prayas-rule bg-white rounded-2xl p-6 shadow-card space-y-5">
          <div className="border-b border-prayas-rule pb-3">
            <h2 className="font-serif text-lg font-bold text-prayas-ink">
              Register New Medical Equipment to Bank
            </h2>
            <p className="text-xs text-prayas-muted">
              Add oxygen concentrators, hospital beds, or monitors available for free community lending.
            </p>
          </div>

          <form onSubmit={handleAddDevice} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-prayas-ink block">Equipment Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Philips EverFlo 10L Oxygen Concentrator"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-prayas-ink block">Category *</label>
                <select
                  value={newDevice.category}
                  onChange={(e) => setNewDevice({ ...newDevice, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-semibold"
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
              <div className="space-y-1">
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
                  className="w-full px-3 py-2 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-prayas-ink block">Initial Status *</label>
                <select
                  value={newDevice.status}
                  onChange={(e) => setNewDevice({ ...newDevice, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-semibold"
                >
                  <option value="AVAILABLE">AVAILABLE (In Center)</option>
                  <option value="LEASED">LEASED (At Patient Home)</option>
                  <option value="MAINTENANCE">MAINTENANCE (Servicing)</option>
                </select>
              </div>

              <div className="space-y-1">
                <ImageUpload
                  label="Device Photograph (Saved to Server)"
                  value={newDevice.imageUrl}
                  onChange={(url) => setNewDevice({ ...newDevice, imageUrl: url })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-prayas-ink block">Specifications & Usage Notes</label>
              <textarea
                rows={2}
                placeholder="Include flow rate, accessories included (cannula, mask, humidifier bottle)..."
                value={newDevice.description}
                onChange={(e) => setNewDevice({ ...newDevice, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingDevice(false)}
                className="px-4 py-2 rounded-lg border border-prayas-rule font-semibold text-prayas-ink hover:bg-prayas-stone"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingDevice}
                className="px-6 py-2 rounded-lg font-bold bg-[#2E5339] text-white hover:bg-[#23432b] shadow-sm disabled:opacity-50"
                style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
              >
                {submittingDevice ? "Registering..." : "Add to Medical Bank →"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-prayas-rule pb-2">
        <button
          onClick={() => setActiveTab("REQUESTS")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === "REQUESTS"
              ? "bg-[#2E5339] text-white shadow-sm"
              : "bg-white border border-prayas-rule text-prayas-ink hover:bg-prayas-stone"
          }`}
          style={activeTab === "REQUESTS" ? { backgroundColor: "#2E5339", color: "#ffffff" } : {}}
        >
          Patient Borrowing Requests ({requestsList.length})
        </button>

        <button
          onClick={() => setActiveTab("INVENTORY")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === "INVENTORY"
              ? "bg-[#2E5339] text-white shadow-sm"
              : "bg-white border border-prayas-rule text-prayas-ink hover:bg-prayas-stone"
          }`}
          style={activeTab === "INVENTORY" ? { backgroundColor: "#2E5339", color: "#ffffff" } : {}}
        >
          Equipment Inventory Assets ({equipmentList.length})
        </button>
      </div>

      {/* TAB 1: PATIENT BORROWING REQUESTS QUEUE */}
      {activeTab === "REQUESTS" && (
        <div className="bg-white border border-prayas-rule rounded-xl overflow-hidden shadow-card">
          {loading ? (
            <div className="p-12 text-center text-prayas-muted text-xs">
              Loading borrowing queue...
            </div>
          ) : requestsList.length === 0 ? (
            <div className="p-12 text-center text-prayas-muted text-xs">
              No active patient borrowing requests in queue.
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
                    <tr key={r.id} className="hover:bg-prayas-paper transition-colors">
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

                      <td className="p-4 text-prayas-muted max-w-xs truncate">
                        <div className="flex items-center gap-1 text-[11px]">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-prayas-muted" />
                          <span className="truncate">{r.deliveryAddress}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            r.status === "ACTIVE"
                              ? "bg-green-100 text-emerald-900 border border-green-200"
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

                      <td className="p-4 text-right space-x-1.5">
                        {r.status === "PENDING" && (
                          <button
                            onClick={() => updateRequestStatus(r.id, "APPROVED")}
                            disabled={actionLoading === r.id}
                            className="px-2.5 py-1 bg-[#2E5339] hover:bg-[#23432b] text-white text-[11px] font-bold rounded shadow-sm disabled:opacity-50"
                            style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
                          >
                            Approve
                          </button>
                        )}

                        {r.status === "APPROVED" && (
                          <button
                            onClick={() => updateRequestStatus(r.id, "ACTIVE")}
                            disabled={actionLoading === r.id}
                            className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white text-[11px] font-bold rounded shadow-sm disabled:opacity-50"
                          >
                            Delivered
                          </button>
                        )}

                        {r.status === "ACTIVE" && (
                          <button
                            onClick={() => updateRequestStatus(r.id, "RETURNED")}
                            disabled={actionLoading === r.id}
                            className="px-2.5 py-1 bg-prayas-stone hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded border border-prayas-rule disabled:opacity-50"
                          >
                            Mark Returned
                          </button>
                        )}

                        <button
                          onClick={() => deleteRequest(r.id)}
                          disabled={actionLoading === r.id}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors inline-flex items-center disabled:opacity-50"
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

      {/* TAB 2: EQUIPMENT INVENTORY ASSETS */}
      {activeTab === "INVENTORY" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {equipmentList.map((eq) => (
            <div
              key={eq.id}
              className="bg-white border border-prayas-rule rounded-xl p-5 shadow-card space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                {eq.imageUrl && (
                  <div className="aspect-[16/10] rounded-lg overflow-hidden border border-prayas-rule bg-prayas-stone mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={eq.imageUrl}
                      alt={eq.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-prayas-neem bg-green-50 px-2 py-0.5 rounded border border-green-100">
                    {eq.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      eq.status === "AVAILABLE"
                        ? "bg-green-100 text-emerald-900 border border-green-200"
                        : "bg-amber-100 text-amber-900 border border-amber-200"
                    }`}
                  >
                    {eq.status}
                  </span>
                </div>

                <h3 className="font-serif text-base font-bold text-prayas-ink">
                  {eq.name}
                </h3>
                <p className="text-xs text-prayas-muted leading-relaxed">
                  {eq.description || "In free circulation for Vrindavan homecare."}
                </p>
              </div>

              <div className="pt-2 border-t border-prayas-rule flex items-center justify-between text-xs">
                <div className="space-x-1">
                  <button
                    onClick={() =>
                      updateDeviceStatus(
                        eq.id,
                        eq.status === "AVAILABLE" ? "MAINTENANCE" : "AVAILABLE"
                      )
                    }
                    disabled={actionLoading === eq.id}
                    className="text-[11px] font-semibold text-prayas-neem hover:underline"
                  >
                    Toggle {eq.status === "AVAILABLE" ? "Maintenance" : "Available"}
                  </button>
                </div>

                <button
                  onClick={() => deleteDevice(eq.id)}
                  disabled={actionLoading === eq.id}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Delete device"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
