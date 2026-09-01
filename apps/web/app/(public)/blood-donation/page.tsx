"use client";

import { useState, useEffect } from "react";
import { Droplet, Phone, MapPin, Clock, ShieldCheck, CheckCircle2, AlertCircle, Heart } from "lucide-react";
import { BloodGroupDisplayMap } from "@prayas/utils";
import { apiFetch } from "@/lib/api";

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
  const [activeTab, setActiveTab] = useState<"BOARD" | "REQUEST" | "DONOR_REGISTER">("BOARD");
  const [filterGroup, setFilterGroup] = useState<string>("ALL");
  const [requests, setRequests] = useState<BloodRequestItem[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // Request Form State
  const [requestForm, setRequestForm] = useState({
    patientName: "",
    hospitalName: "",
    city: "Vrindavan",
    bloodGroup: "O_POSITIVE",
    unitsNeeded: 1,
    urgency: "HIGH",
    contactPhone: "",
    notes: "",
  });
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);

  // Donor Registration State
  const [donorForm, setDonorForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "Vrindavan",
    bloodGroup: "O_POSITIVE",
    lastDonationMonths: 6,
  });
  const [submittingDonor, setSubmittingDonor] = useState(false);
  const [donorSuccess, setDonorSuccess] = useState<string | null>(null);
  const [donorAlreadyRegistered, setDonorAlreadyRegistered] = useState<string | null>(null);
  const [donorError, setDonorError] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveRequests();
  }, [filterGroup]);

  const fetchActiveRequests = async () => {
    setLoadingRequests(true);
    try {
      const url = filterGroup === "ALL"
        ? "/api/blood-requests?status=PENDING"
        : `/api/blood-requests?status=PENDING&bloodGroup=${filterGroup}`;
      const res = await apiFetch(url);
      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingRequest(true);
    setRequestError(null);
    setRequestSuccess(null);

    try {
      const res = await apiFetch("/api/blood-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...requestForm,
          unitsNeeded: Number(requestForm.unitsNeeded),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRequestSuccess("Blood request registered. Our voluntary coordination desk has received the alert and is dispatching notifications to registered donors.");
        setRequestForm({
          patientName: "",
          hospitalName: "",
          city: "Vrindavan",
          bloodGroup: "O_POSITIVE",
          unitsNeeded: 1,
          urgency: "HIGH",
          contactPhone: "",
          notes: "",
        });
        fetchActiveRequests();
      } else {
        setRequestError(data.error || "Failed to submit blood request. Please check all fields or call our helpline.");
      }
    } catch (err: any) {
      setRequestError("Network error. Please call our 24/7 blood helpline directly at +91 94122 79000.");
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleDonorRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingDonor(true);
    setDonorError(null);
    setDonorSuccess(null);
    setDonorAlreadyRegistered(null);

    try {
      const payload = {
        name: donorForm.name,
        email: donorForm.email || undefined,
        phone: donorForm.phone,
        bloodGroup: donorForm.bloodGroup,
        city: donorForm.city,
      };

      const res = await apiFetch("/api/blood-donors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 409 || data.alreadyRegistered) {
        setDonorAlreadyRegistered(
          data.error || "You are already registered in the Prayas Voluntary Blood Donor Registry! Thank you for your continued commitment."
        );
      } else if (res.ok && data.success) {
        setDonorSuccess(data.message || "Thank you for joining the Voluntary Blood Donor Registry!");
      } else {
        setDonorError(data.error || "Failed to register donor. Please check phone number or call our helpline.");
      }
    } catch (err) {
      setDonorError("Network error. Please call our 24/7 helpline at +91 94122 79000.");
    } finally {
      setSubmittingDonor(false);
    }
  };

  const bloodGroups = [
    { key: "ALL", label: "All Groups" },
    { key: "A_POSITIVE", label: "A+" },
    { key: "A_NEGATIVE", label: "A-" },
    { key: "B_POSITIVE", label: "B+" },
    { key: "B_NEGATIVE", label: "B-" },
    { key: "AB_POSITIVE", label: "AB+" },
    { key: "AB_NEGATIVE", label: "AB-" },
    { key: "O_POSITIVE", label: "O+" },
    { key: "O_NEGATIVE", label: "O-" },
  ];

  return (
    <div className="space-y-8 sm:space-y-10 pb-20 max-w-5xl 2xl:max-w-6xl 3xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 pt-6 sm:pt-10">
      {/* 1. Header & Emergency Helpline Masthead */}
      <div className="border-b border-prayas-rule pb-6 sm:pb-8 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-red-50 border border-prayas-crimsonBorder text-xs 2xl:text-sm font-bold text-prayas-crimson">
          <Droplet className="w-3.5 h-3.5 fill-current" />
          <span>24/7 Voluntary Blood Donor Coordination Desk</span>
        </div>

        <h1 className="font-serif text-2xl xs:text-3xl sm:text-4xl 2xl:text-5xl font-bold text-prayas-ink">
          Emergency Blood Registry • Mathura & Vrindavan
        </h1>

        <p className="text-sm sm:text-base 2xl:text-lg text-prayas-muted leading-relaxed max-w-3xl 2xl:max-w-4xl">
          Prayas Pariwaar coordinates voluntary, non-remunerated blood donors for critical emergency surgeries, accident trauma, and Thalassemia patients in district hospitals across Mathura, Vrindavan, and Agra.
        </p>

        {/* 24/7 Helpline Banner */}
        <div className="border border-prayas-rule bg-white rounded p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-subtle">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-prayas-stone border border-prayas-rule flex items-center justify-center text-prayas-crimson">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-prayas-ink uppercase tracking-wider">
                Immediate Urgent Requirement Helpline
              </p>
              <p className="text-xs text-prayas-muted">
                For ICU / OT cases requiring blood in &lt; 60 minutes, speak directly with our on-duty coordinator:
              </p>
            </div>
          </div>
          <a
            href="tel:+919412279000"
            className="w-full sm:w-auto px-4 py-2.5 text-center rounded-lg bg-[#B91C1C] text-white text-xs font-bold hover:bg-[#991B1B] transition-all shadow-sm"
            style={{ backgroundColor: "#B91C1C", color: "#ffffff" }}
          >
            Call: +91 94122 79000
          </a>
        </div>
      </div>

      {/* 2. Navigation Tabs (Horizontally Scrollable on Mobile) */}
      <div className="flex border-b border-prayas-rule text-xs sm:text-sm overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setActiveTab("BOARD")}
          className={`pb-3 px-3 sm:px-4 font-semibold transition-colors border-b-2 shrink-0 ${
            activeTab === "BOARD"
              ? "border-prayas-crimson text-prayas-crimson"
              : "border-transparent text-prayas-muted hover:text-prayas-ink"
          }`}
        >
          Active Hospital Requirements ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab("REQUEST")}
          className={`pb-3 px-3 sm:px-4 font-semibold transition-colors border-b-2 shrink-0 ${
            activeTab === "REQUEST"
              ? "border-prayas-crimson text-prayas-crimson"
              : "border-transparent text-prayas-muted hover:text-prayas-ink"
          }`}
        >
          Submit a Blood Request
        </button>
        <button
          onClick={() => setActiveTab("DONOR_REGISTER")}
          className={`pb-3 px-3 sm:px-4 font-semibold transition-colors border-b-2 shrink-0 ${
            activeTab === "DONOR_REGISTER"
              ? "border-prayas-crimson text-prayas-crimson"
              : "border-transparent text-prayas-muted hover:text-prayas-ink"
          }`}
        >
          Register as a Voluntary Donor
        </button>
      </div>

      {/* 3. TAB 1: ACTIVE HOSPITAL REQUIREMENTS */}
      {activeTab === "BOARD" && (
        <div className="space-y-6">
          {/* Blood Group Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-prayas-muted mr-1">Filter by Blood Group:</span>
            {bloodGroups.map((bg) => (
              <button
                key={bg.key}
                onClick={() => setFilterGroup(bg.key)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  filterGroup === bg.key
                    ? "bg-prayas-crimson text-white font-bold"
                    : "bg-white border border-prayas-rule text-prayas-ink hover:bg-prayas-stone"
                }`}
              >
                {bg.label}
              </button>
            ))}
          </div>

          {loadingRequests ? (
            <div className="p-10 text-center text-xs text-prayas-muted border border-prayas-rule bg-white rounded">
              Loading current hospital blood requirements...
            </div>
          ) : requests.length === 0 ? (
            <div className="p-10 border border-prayas-rule bg-white rounded text-center space-y-2 shadow-subtle">
              <CheckCircle2 className="w-8 h-8 text-prayas-neem mx-auto" />
              <h3 className="font-serif text-lg font-bold text-prayas-ink">
                All Verified Hospital Blood Requirements Are Currently Met
              </h3>
              <p className="text-xs text-prayas-muted max-w-md mx-auto leading-relaxed">
                There are no pending emergency blood requests right now. If you are admitted at a hospital in Mathura or Vrindavan and need urgent assistance, click "Submit a Blood Request" above or call our helpline.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => {
                const isCritical = req.urgency === "CRITICAL";
                return (
                  <div
                    key={req.id}
                    className={`border rounded p-5 shadow-card transition-all ${
                      isCritical
                        ? "border-prayas-crimsonBorder bg-red-50/40"
                        : "border-prayas-rule bg-white"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: Blood Group Badge & Details */}
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-14 h-14 rounded flex flex-col items-center justify-center border font-serif font-bold ${
                            isCritical
                              ? "bg-prayas-crimson text-white border-prayas-crimson"
                              : "bg-prayas-stone text-prayas-ink border-prayas-rule"
                          }`}
                        >
                          <span className="text-lg leading-none">
                            {req.bloodGroup.replace("_POSITIVE", "+").replace("_NEGATIVE", "-")}
                          </span>
                          <span className="text-[10px] font-sans font-medium uppercase mt-0.5 opacity-90">
                            {req.unitsNeeded} {req.unitsNeeded > 1 ? "Units" : "Unit"}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                                isCritical
                                  ? "bg-red-100 text-prayas-crimson border border-red-200"
                                  : "bg-amber-100 text-amber-900 border border-amber-200"
                              }`}
                            >
                              {req.urgency} Urgency
                            </span>
                            <span className="text-xs text-prayas-muted flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {req.hospitalName}, {req.city}
                            </span>
                          </div>

                          <h3 className="font-serif text-base font-bold text-prayas-ink">
                            Patient: {req.patientName}
                          </h3>

                          {req.notes && (
                            <p className="text-xs text-prayas-muted leading-relaxed">
                              {req.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Contact Coordinator */}
                      <div className="flex sm:flex-col items-center sm:items-end gap-2 border-t sm:border-t-0 border-prayas-rule pt-3 sm:pt-0">
                        <a
                          href={`tel:${req.contactPhone}`}
                          className="px-4 py-2 rounded text-xs font-bold bg-prayas-crimson text-white hover:bg-[#991B1B] transition-colors flex items-center gap-1.5 shadow-subtle"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Contact: {req.contactPhone}
                        </a>
                        <span className="text-[11px] text-prayas-muted">
                          Verified by Prayas Desk
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. TAB 2: SUBMIT BLOOD REQUEST FORM */}
      {activeTab === "REQUEST" && (
        <div className="border border-prayas-rule bg-white rounded p-6 sm:p-8 shadow-card space-y-6">
          <div className="border-b border-prayas-rule pb-3">
            <h2 className="font-serif text-xl font-bold text-prayas-ink">
              Submit an Emergency Blood Requirement
            </h2>
            <p className="text-xs text-prayas-muted">
              Please enter exact hospital details. Our voluntary coordinators verify every request before broadcasting.
            </p>
          </div>

          {requestSuccess && (
            <div className="p-4 rounded border border-green-200 bg-green-50 text-xs text-green-800 space-y-1">
              <strong className="block font-bold">Request Submitted Successfully</strong>
              <p>{requestSuccess}</p>
            </div>
          )}

          {requestError && (
            <div className="p-4 rounded border border-red-200 bg-red-50 text-xs text-red-800 space-y-1">
              <strong className="block font-bold">Submission Error</strong>
              <p>{requestError}</p>
            </div>
          )}

          <form onSubmit={handleRequestSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-prayas-ink">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smt. Kamla Devi"
                  value={requestForm.patientName}
                  onChange={(e) => setRequestForm({ ...requestForm, patientName: e.target.value })}
                  className="w-full p-2.5 rounded border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-prayas-ink">Hospital / Clinic Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramakrishna Mission Sevashrama"
                  value={requestForm.hospitalName}
                  onChange={(e) => setRequestForm({ ...requestForm, hospitalName: e.target.value })}
                  className="w-full p-2.5 rounded border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-prayas-ink">City / Town *</label>
                <select
                  value={requestForm.city}
                  onChange={(e) => setRequestForm({ ...requestForm, city: e.target.value })}
                  className="w-full p-2.5 rounded border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white"
                >
                  <option value="Vrindavan">Vrindavan</option>
                  <option value="Mathura">Mathura</option>
                  <option value="Govardhan">Govardhan</option>
                  <option value="Barsana">Barsana</option>
                  <option value="Kosi Kalan">Kosi Kalan</option>
                  <option value="Agra">Agra</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-prayas-ink">Blood Group Required *</label>
                <select
                  value={requestForm.bloodGroup}
                  onChange={(e) => setRequestForm({ ...requestForm, bloodGroup: e.target.value })}
                  className="w-full p-2.5 rounded border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white font-bold"
                >
                  <option value="A_POSITIVE">A+ (A Positive)</option>
                  <option value="A_NEGATIVE">A- (A Negative)</option>
                  <option value="B_POSITIVE">B+ (B Positive)</option>
                  <option value="B_NEGATIVE">B- (B Negative)</option>
                  <option value="AB_POSITIVE">AB+ (AB Positive)</option>
                  <option value="AB_NEGATIVE">AB- (AB Negative)</option>
                  <option value="O_POSITIVE">O+ (O Positive)</option>
                  <option value="O_NEGATIVE">O- (O Negative)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-prayas-ink">Units Needed *</label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  required
                  value={requestForm.unitsNeeded}
                  onChange={(e) => setRequestForm({ ...requestForm, unitsNeeded: Number(e.target.value) })}
                  className="w-full p-2.5 rounded border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-prayas-ink">Urgency Level *</label>
                <select
                  value={requestForm.urgency}
                  onChange={(e) => setRequestForm({ ...requestForm, urgency: e.target.value })}
                  className="w-full p-2.5 rounded border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white"
                >
                  <option value="CRITICAL">CRITICAL (Immediate OT / Emergency within 2 hours)</option>
                  <option value="HIGH">HIGH (Required today / Scheduled surgery)</option>
                  <option value="MEDIUM">MEDIUM (Required in 24 hours)</option>
                  <option value="LOW">LOW (Advance planned requirement)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-prayas-ink">Attendant / Doctor Contact Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98971 23456"
                  value={requestForm.contactPhone}
                  onChange={(e) => setRequestForm({ ...requestForm, contactPhone: e.target.value })}
                  className="w-full p-2.5 rounded border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-prayas-ink">Hospital Bed / Case Notes</label>
              <textarea
                rows={3}
                placeholder="e.g. Admitted in ICU Bed 4, doctor has requested replacement donor for surgery."
                value={requestForm.notes}
                onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
                className="w-full p-2.5 rounded border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submittingRequest}
                className="px-6 py-3 rounded text-sm font-bold bg-prayas-crimson text-white hover:bg-[#991B1B] transition-colors shadow-subtle disabled:opacity-50"
              >
                {submittingRequest ? "Registering Emergency Request..." : "Submit Emergency Blood Request"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. TAB 3: REGISTER AS A VOLUNTARY DONOR */}
      {activeTab === "DONOR_REGISTER" && (
        <div className="border border-prayas-rule bg-white rounded p-6 sm:p-8 shadow-card space-y-6">
          <div className="border-b border-prayas-rule pb-3">
            <h2 className="font-serif text-xl font-bold text-prayas-ink">
              Join the Voluntary Blood Donor Registry
            </h2>
            <p className="text-xs text-prayas-muted">
              Receive alerts only when a matching patient in your town or hospital is in urgent need.
            </p>
          </div>

          {donorAlreadyRegistered && (
            <div className="p-5 rounded-xl border border-amber-300 bg-amber-50 text-xs text-amber-950 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-700 shrink-0" />
                <h3 className="font-serif text-base font-bold text-amber-950">
                  Already Registered as a Voluntary Donor
                </h3>
              </div>
              <p className="leading-relaxed text-amber-900">
                {donorAlreadyRegistered}
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setDonorAlreadyRegistered(null)}
                  className="px-3 py-1.5 rounded-lg bg-amber-800 text-white text-xs font-semibold hover:bg-amber-900"
                >
                  Register Another Donor
                </button>
              </div>
            </div>
          )}

          {donorSuccess && (
            <div className="p-6 rounded-xl border border-green-300 bg-green-50 text-xs text-green-900 space-y-2 text-center">
              <CheckCircle2 className="w-8 h-8 text-prayas-neem mx-auto" />
              <h3 className="font-serif text-base font-bold text-emerald-950">Registration Received</h3>
              <p className="max-w-md mx-auto leading-relaxed text-emerald-900">
                {donorSuccess}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDonorSuccess(null);
                    setDonorForm({
                      name: "",
                      email: "",
                      phone: "",
                      city: "Vrindavan",
                      bloodGroup: "O_POSITIVE",
                      lastDonationMonths: 6,
                    });
                  }}
                  className="px-4 py-2 rounded-lg bg-[#2E5339] text-white text-xs font-bold shadow hover:bg-[#23432b]"
                  style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
                >
                  Register Another Donor
                </button>
              </div>
            </div>
          )}

          {donorError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-prayas-crimson shrink-0" />
              <span className="flex-1 font-medium">{donorError}</span>
            </div>
          )}

          {!donorSuccess && !donorAlreadyRegistered && (
            <form onSubmit={handleDonorRegister} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-prayas-ink">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amit Sharma"
                    value={donorForm.name}
                    onChange={(e) => setDonorForm({ ...donorForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-prayas-ink">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="e.g. amit@gmail.com"
                    value={donorForm.email}
                    onChange={(e) => setDonorForm({ ...donorForm, email: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-prayas-ink">WhatsApp / Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98971 23456"
                    value={donorForm.phone}
                    onChange={(e) => setDonorForm({ ...donorForm, phone: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-prayas-ink">Blood Group *</label>
                  <select
                    value={donorForm.bloodGroup}
                    onChange={(e) => setDonorForm({ ...donorForm, bloodGroup: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white font-bold text-prayas-crimson"
                  >
                    <option value="A_POSITIVE">A+ (A Positive)</option>
                    <option value="A_NEGATIVE">A- (A Negative)</option>
                    <option value="B_POSITIVE">B+ (B Positive)</option>
                    <option value="B_NEGATIVE">B- (B Negative)</option>
                    <option value="AB_POSITIVE">AB+ (AB Positive)</option>
                    <option value="AB_NEGATIVE">AB- (AB Negative)</option>
                    <option value="O_POSITIVE">O+ (O Positive)</option>
                    <option value="O_NEGATIVE">O- (O Negative)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-prayas-ink">City / Residential Area in Mathura *</label>
                  <select
                    value={donorForm.city}
                    onChange={(e) => setDonorForm({ ...donorForm, city: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white font-medium"
                  >
                    <option value="Vrindavan">Vrindavan</option>
                    <option value="Mathura">Mathura</option>
                    <option value="Govardhan">Govardhan</option>
                    <option value="Barsana">Barsana</option>
                    <option value="Agra">Agra</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingDonor}
                  className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-[#2E5339] text-white hover:bg-[#23432b] transition-all shadow-md"
                  style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
                >
                  {submittingDonor ? "Pledging Seva..." : "Submit Voluntary Donor Registration →"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
