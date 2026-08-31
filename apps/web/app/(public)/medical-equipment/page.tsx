"use client";

import { useState } from "react";
import { Activity, ShieldCheck, CheckCircle2, Clock, MapPin, Send, AlertCircle, HeartHandshake } from "lucide-react";

interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  description: string;
  status: "AVAILABLE" | "LEASED";
  deposit: string;
  features: string[];
}

const SAMPLE_EQUIPMENT: EquipmentItem[] = [
  {
    id: "eq-ox-10l",
    name: "10L Medical Oxygen Concentrator",
    category: "Respiratory Support",
    description: "High-flow dual outlet 10LPM medical oxygen concentrator with continuous purity sensor.",
    status: "AVAILABLE",
    deposit: "₹0 Free Lease (Refundable Security)",
    features: ["Dual Flow Ports", "93% ± 3% Purity", "Heavy Duty Compressor", "Nebulizer Port"],
  },
  {
    id: "eq-bipap-auto",
    name: "BiPAP / Auto-CPAP Machine",
    category: "Critical Care",
    description: "Non-invasive mechanical ventilation with heated humidifier and full face mask kit.",
    status: "AVAILABLE",
    deposit: "₹0 Free Lease",
    features: ["Heated Humidifier", "Pressure Range 4-25 cmH2O", "SD Card Data Log"],
  },
  {
    id: "eq-hospital-bed",
    name: "Semi-Fowler Adjustable Hospital Bed",
    category: "Patient Mobility",
    description: "Ergonomic medical bed with backrest elevation crank, side safety railings, and IV pole.",
    status: "AVAILABLE",
    deposit: "₹0 Free Lease",
    features: ["Side Safety Rails", "Anti-Bedsore Mattress", "Locking Casters", "IV Stand"],
  },
  {
    id: "eq-wheelchair-fold",
    name: "Heavy-Duty Foldable Wheelchair",
    category: "Mobility Aid",
    description: "Lightweight, durable steel wheelchair with padded armrests and footrest for rehabilitation.",
    status: "AVAILABLE",
    deposit: "₹0 Free Lease",
    features: ["Compact Foldable", "Up to 120kg Capacity", "Dual Handbrakes"],
  },
  {
    id: "eq-suction-pump",
    name: "Electric Phlegm Suction Machine",
    category: "Home ICU",
    description: "High negative pressure medical suction apparatus for tracheostomy and respiratory airway clearance.",
    status: "AVAILABLE",
    deposit: "₹0 Free Lease",
    features: ["Oil-free Vacuum Pump", "1000ml Storage Bottle", "Overflow Protection"],
  },
  {
    id: "eq-ox-5l",
    name: "5L Portable Oxygen Concentrator",
    category: "Respiratory Support",
    description: "Compact 5 Litre oxygen concentrator suitable for home quarantine and mild respiratory recovery.",
    status: "LEASED",
    deposit: "₹0 Free Lease",
    features: ["Whisper Quiet", "Purity Display", "Compact Wheels"],
  },
];

export default function MedicalEquipmentPage() {
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem | null>(null);
  const [formData, setFormData] = useState({
    requesterName: "",
    contactPhone: "",
    purpose: "",
    requestedDays: 14,
    deliveryAddress: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipment) return;

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipmentId: selectedEquipment.id,
          requesterName: formData.requesterName,
          contactPhone: formData.contactPhone,
          purpose: formData.purpose,
          requestedDays: Number(formData.requestedDays),
          deliveryAddress: formData.deliveryAddress,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to submit equipment request");
      }

      setSuccessMessage(json.message);
      setFormData({
        requesterName: "",
        contactPhone: "",
        purpose: "",
        requestedDays: 14,
        deliveryAddress: "",
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
            <Activity className="w-3.5 h-3.5" />
            Free Community Medical Equipment Bank
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display leading-tight">
            Life Support & Home ICU Equipment on Free Loan
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
            Prayas Sanstha provides life-saving medical equipment on a zero-rental basis for patients recovering at home. Supported by generous donors and community sponsors.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center space-y-2">
          <p className="text-2xl font-extrabold text-white">100% Free Loans</p>
          <p className="text-xs text-emerald-200">
            Patients only provide basic identity verification and physician prescription.
          </p>
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-display">
            Available Equipment Inventory
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Click "Request Loan" to reserve equipment for a patient.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SAMPLE_EQUIPMENT.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    {item.category}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                      item.status === "AVAILABLE"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <h3 className="font-bold text-lg text-slate-900 leading-snug">
                  {item.name}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>

                <div className="space-y-1.5 pt-2">
                  {item.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-700">
                  {item.deposit}
                </span>
                <button
                  onClick={() => setSelectedEquipment(item)}
                  disabled={item.status !== "AVAILABLE"}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                >
                  {item.status === "AVAILABLE" ? "Request Loan" : "Currently in Use"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Equipment Request Modal */}
      {selectedEquipment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase">
                  Medical Equipment Loan Application
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {selectedEquipment.name}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedEquipment(null);
                  setSuccessMessage("");
                  setErrorMessage("");
                }}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {successMessage ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Application Submitted Successfully!
                </div>
                <p className="text-xs text-emerald-700">{successMessage}</p>
                <button
                  onClick={() => setSelectedEquipment(null)}
                  className="w-full mt-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Requester / Attendant Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    value={formData.requesterName}
                    onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Loan Duration (Days) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="90"
                      required
                      value={formData.requestedDays}
                      onChange={(e) => setFormData({ ...formData, requestedDays: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Deposit / Fee
                    </label>
                    <input
                      type="text"
                      disabled
                      value="₹0 Free of Charge"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-600 text-sm font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Patient Medical Condition & Purpose *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Post-COVID recovery, low SpO2 level prescribed by doctor"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Delivery Address / Pickup Location *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Full residential address with landmark"
                    value={formData.deliveryAddress}
                    onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? "Submitting Application..." : "Confirm & Submit Request"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
