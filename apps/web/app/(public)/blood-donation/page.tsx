"use client";

import { useState, useEffect } from "react";
import {
  Droplet,
  AlertTriangle,
  Send,
  CheckCircle,
  PhoneCall,
  MapPin,
  Clock,
  HeartHandshake,
  ShieldCheck,
} from "lucide-react";
import { BloodGroupValues, BloodGroupDisplayMap, UrgencyLevelValues } from "@prayas/utils";

interface BloodRequestItem {
  id: string;
  patientName: string;
  hospitalName: string;
  city: string;
  bloodGroup: string;
  unitsNeeded: number;
  urgency: string;
  status: string;
  contactPhone: string;
  notes?: string;
  createdAt: string;
}

export default function BloodDonationPage() {
  const [formData, setFormData] = useState({
    patientName: "",
    hospitalName: "",
    city: "Jaipur",
    bloodGroup: "O_POSITIVE",
    unitsNeeded: 1,
    urgency: "HIGH",
    contactPhone: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [successResponse, setSuccessResponse] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [recentRequests, setRecentRequests] = useState<BloodRequestItem[]>([]);
  const [activeTab, setActiveTab] = useState<"REQUEST" | "BROWSE">("REQUEST");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/blood-requests?limit=10");
      const json = await res.json();
      if (json.success) {
        setRecentRequests(json.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessResponse(null);

    try {
      const res = await fetch("/api/blood-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          unitsNeeded: Number(formData.unitsNeeded),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to submit request");
      }

      setSuccessResponse(json);
      setFormData({
        patientName: "",
        hospitalName: "",
        city: "Jaipur",
        bloodGroup: "O_POSITIVE",
        unitsNeeded: 1,
        urgency: "HIGH",
        contactPhone: "",
        notes: "",
      });
      fetchRequests();
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-600 to-rose-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
            <Droplet className="w-3.5 h-3.5 fill-current" />
            24/7 Emergency Blood Bank Coordination
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display leading-tight">
            Emergency Blood Request & Donor Network
          </h1>
          <p className="text-red-100 text-sm sm:text-base leading-relaxed">
            Submit a verified blood or platelet requirement. Our automated system notifies matching registered donors and volunteer taskforces instantly via mobile push notification.
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setActiveTab("REQUEST")}
            className={`px-6 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all ${
              activeTab === "REQUEST"
                ? "bg-white text-red-600 shadow-lg"
                : "bg-red-800/60 text-white hover:bg-red-800/90"
            }`}
          >
            Post Emergency Request
          </button>
          <button
            onClick={() => setActiveTab("BROWSE")}
            className={`px-6 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all ${
              activeTab === "BROWSE"
                ? "bg-white text-red-600 shadow-lg"
                : "bg-red-800/60 text-white hover:bg-red-800/90"
            }`}
          >
            Active Requests ({recentRequests.length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "REQUEST" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Request Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">
                Submit Blood Requirement
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Please enter accurate hospital details to avoid donor coordination delays.
              </p>
            </div>

            {successResponse && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  Emergency Request Broadcasted Successfully!
                </div>
                <p className="text-xs text-emerald-700">
                  {successResponse.message}
                </p>
                <div className="text-xs bg-white/70 p-2 rounded-lg text-slate-700">
                  📱 Mobile push notifications dispatched to active donors.
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone (Attendant) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Required Blood Group *
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm bg-white outline-none"
                  >
                    {BloodGroupValues.map((bg) => (
                      <option key={bg} value={bg}>
                        {BloodGroupDisplayMap[bg]} ({bg})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Units Needed *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={formData.unitsNeeded}
                    onChange={(e) => setFormData({ ...formData, unitsNeeded: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Urgency Level *
                  </label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm bg-white outline-none"
                  >
                    {UrgencyLevelValues.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hospital Name & Ward/Room *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fortis Hospital, ICU Ward 2"
                    value={formData.hospitalName}
                    onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City / Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jaipur, Rajasthan"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Platelets required, surgery scheduled tomorrow at 9 AM"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  "Transmitting to Donors..."
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Broadcast Emergency Request
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right: Guidelines & Emergency Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 rounded-2xl p-6 text-white space-y-4">
              <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                Donor Matching Protocol
              </div>
              <h3 className="text-lg font-bold font-display">
                How Our Automated System Responds:
              </h3>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </span>
                  <span>Your request is verified and logged in the centralized Prayas database.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </span>
                  <span>Real-time push alerts are triggered to matching donors & volunteers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </span>
                  <span>Prayas coordinators verify donor readiness and connect them directly.</span>
                </li>
              </ul>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Direct Emergency Desk:</span>
                <a
                  href="tel:+919876543210"
                  className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> +91 98765 43210
                </a>
              </div>
            </div>

            {/* Blood Compatibility Guide */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-bold text-sm text-slate-900">
                🩸 Universal Compatibility Quick Reference
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="font-bold text-red-700">O Negative (O-)</p>
                  <p className="text-slate-600 mt-0.5">Universal Red Cell Donor</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <p className="font-bold text-emerald-700">AB Positive (AB+)</p>
                  <p className="text-slate-600 mt-0.5">Universal Recipient</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* BROWSE ACTIVE REQUESTS */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 font-display">
              Live Blood Requirements ({recentRequests.length})
            </h2>
            <button
              onClick={fetchRequests}
              className="text-xs font-semibold text-red-600 hover:text-red-700"
            >
              🔄 Refresh List
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentRequests.map((req) => {
              const displayGroup = BloodGroupDisplayMap[req.bloodGroup] || req.bloodGroup;
              return (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-red-200 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-red-100 text-red-700">
                        {req.urgency} URGENCY
                      </span>
                      <h3 className="font-bold text-lg text-slate-900 mt-1">
                        {req.patientName}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {req.hospitalName}, {req.city}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 text-red-600 font-extrabold flex flex-col items-center justify-center">
                      <span className="text-base">{displayGroup}</span>
                      <span className="text-[9px] uppercase font-semibold text-red-400">
                        {req.unitsNeeded} U
                      </span>
                    </div>
                  </div>

                  {req.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg italic">
                      "{req.notes}"
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                    <a
                      href={`tel:${req.contactPhone}`}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg flex items-center gap-1 shadow-sm"
                    >
                      <PhoneCall className="w-3 h-3" /> Call: {req.contactPhone}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
