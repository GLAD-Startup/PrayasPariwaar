"use client";

import { useState, useEffect } from "react";
import { Stethoscope, CheckCircle2, Phone, ArrowLeft, ArrowRight, ShieldCheck, Clock, MapPin } from "lucide-react";

interface EquipmentItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  quantity: number;
  status: "AVAILABLE" | "LEASED" | "MAINTENANCE";
  imageUrl?: string;
}

export default function MedicalEquipmentPage() {
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Multi-step Borrowing Flow (Legitimate 3-step sequence)
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [selectedItem, setSelectedItem] = useState<EquipmentItem | null>(null);

  // Form Details
  const [formData, setFormData] = useState({
    requesterName: "",
    contactPhone: "",
    deliveryAddress: "",
    purpose: "",
    requestedDays: 14,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/equipment");
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (e) {
      console.error("Failed to load medical equipment", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDevice = (item: EquipmentItem) => {
    setSelectedItem(item);
    setActiveStep(2);
    setErrorMessage(null);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipmentId: selectedItem.id,
          requesterName: formData.requesterName,
          contactPhone: formData.contactPhone,
          deliveryAddress: formData.deliveryAddress,
          purpose: formData.purpose,
          requestedDays: Number(formData.requestedDays),
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setActiveStep(3);
        setSubmissionSuccess(true);
      } else {
        setErrorMessage(json.error || "Failed to submit equipment request. Please call our helpline.");
      }
    } catch (err) {
      setErrorMessage("Network error. Please call our equipment coordinator at +91 98971 23456.");
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ["ALL", "Respiratory Support", "Mobility Assistance", "Patient Beds & Care"];

  const filteredItems = selectedCategory === "ALL"
    ? items
    : items.filter((it) => it.category === selectedCategory);

  return (
    <div className="space-y-8 sm:space-y-12 pb-20 max-w-6xl 2xl:max-w-7xl 3xl:max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 pt-6 sm:pt-10">
      {/* 1. Masthead Header */}
      <div className="border-b border-prayas-rule pb-6 sm:pb-8 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-prayas-stone border border-prayas-rule text-xs 2xl:text-sm font-bold text-prayas-neem">
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Free Community Medical Equipment Lending Bank</span>
        </div>

        <h1 className="font-serif text-2xl xs:text-3xl sm:text-4xl 2xl:text-5xl font-bold text-prayas-ink">
          Medical Equipment Bank • Vrindavan & Mathura
        </h1>

        <p className="text-sm sm:text-base 2xl:text-lg text-prayas-muted leading-relaxed max-w-3xl 2xl:max-w-4xl">
          Prayas Pariwaar maintains a bank of critical homecare equipment — 10L oxygen concentrators, hospital beds, wheelchairs, and air mattresses — available on free temporary loan for elderly and recovering patients.
        </p>

        {/* Helpline Notice */}
        <div className="border border-prayas-rule bg-white rounded p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-subtle">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-prayas-stone border border-prayas-rule flex items-center justify-center text-prayas-neem">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-prayas-ink uppercase tracking-wider">
                Direct Equipment Dispatch Desk
              </p>
              <p className="text-xs text-prayas-muted">
                Pick up directly from our Vrindavan Seva Karyalaya or request home delivery for bedridden patients:
              </p>
            </div>
          </div>
          <a
            href="tel:+919897123456"
            className="w-full sm:w-auto px-4 py-2.5 text-center rounded-lg bg-[#2E5339] text-white text-xs font-bold hover:bg-[#23432b] transition-all shadow-sm"
            style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
          >
            Call Desk: +91 98971 23456
          </a>
        </div>
      </div>

      {/* 2. THREE-STEP SEQUENTIAL PROGRESS INDICATOR */}
      <div className="border border-prayas-rule bg-white rounded-xl p-4 shadow-subtle">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div
            className={`p-3 rounded-lg border flex items-center gap-2.5 transition-colors ${
              activeStep === 1
                ? "bg-prayas-stone border-prayas-neem font-bold text-prayas-ink"
                : activeStep > 1
                ? "bg-green-50 border-green-200 text-green-800"
                : "border-prayas-rule text-prayas-muted"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-prayas-neem text-white text-[11px] flex items-center justify-center font-bold shrink-0">
              1
            </span>
            <span className="truncate">1. Select Equipment</span>
          </div>

          <div
            className={`p-3 rounded-lg border flex items-center gap-2.5 transition-colors ${
              activeStep === 2
                ? "bg-prayas-stone border-prayas-neem font-bold text-prayas-ink"
                : activeStep > 2
                ? "bg-green-50 border-green-200 text-green-800"
                : "border-prayas-rule text-prayas-muted"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-prayas-neem text-white text-[11px] flex items-center justify-center font-bold shrink-0">
              2
            </span>
            <span className="truncate">2. Patient & Delivery Details</span>
          </div>

          <div
            className={`p-3 rounded-lg border flex items-center gap-2.5 transition-colors ${
              activeStep === 3
                ? "bg-prayas-stone border-prayas-neem font-bold text-prayas-ink"
                : "border-prayas-rule text-prayas-muted"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-prayas-neem text-white text-[11px] flex items-center justify-center font-bold shrink-0">
              3
            </span>
            <span className="truncate">3. Volunteer Dispatch</span>
          </div>
        </div>
      </div>

      {/* STEP 1: SELECT EQUIPMENT CATALOG */}
      {activeStep === 1 && (
        <div className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-prayas-neem text-white font-bold"
                    : "bg-white border border-prayas-rule text-prayas-ink hover:bg-prayas-stone"
                }`}
              >
                {cat === "ALL" ? "All Equipment" : cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-10 text-center text-xs text-prayas-muted border border-prayas-rule bg-white rounded">
              Loading available medical devices...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => {
                const isAvailable = item.status === "AVAILABLE";
                return (
                  <div
                    key={item.id}
                    className="border border-prayas-rule bg-white rounded overflow-hidden shadow-card flex flex-col justify-between"
                  >
                    {item.imageUrl && (
                      <div className="aspect-[4/3] bg-prayas-stone overflow-hidden border-b border-prayas-rule">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}

                    <div className="p-5 space-y-3 flex-grow flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-prayas-stone border border-prayas-rule text-[10px] font-bold uppercase tracking-wider text-prayas-ink">
                            {item.category}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isAvailable
                                ? "bg-green-100 text-prayas-neem border border-green-200"
                                : "bg-amber-100 text-amber-900 border border-amber-200"
                            }`}
                          >
                            {isAvailable ? "● AVAILABLE" : "● CURRENTLY LEASED"}
                          </span>
                        </div>

                        <h3 className="font-serif text-lg font-bold text-prayas-ink">
                          {item.name}
                        </h3>

                        <p className="text-xs text-prayas-muted leading-relaxed line-clamp-3">
                          {item.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-prayas-rule flex items-center justify-between gap-3 text-xs">
                        <span className="text-prayas-muted text-[11px]">
                          Free community loan
                        </span>
                        <button
                          onClick={() => handleSelectDevice(item)}
                          disabled={!isAvailable}
                          className="px-4 py-2 rounded font-bold bg-prayas-neem text-white hover:bg-[#23432b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-subtle"
                        >
                          Request Loan
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* STEP 2: PATIENT & DELIVERY DETAILS FORM */}
      {activeStep === 2 && selectedItem && (
        <div className="border border-prayas-rule bg-white rounded p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-prayas-rule pb-4">
            <div>
              <button
                onClick={() => setActiveStep(1)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-prayas-muted hover:text-prayas-ink mb-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Equipment Catalog
              </button>
              <h2 className="font-serif text-2xl font-bold text-prayas-ink">
                Request Loan for: {selectedItem.name}
              </h2>
            </div>
            <span className="px-2.5 py-1 rounded bg-green-50 border border-green-200 text-xs font-bold text-prayas-neem">
              100% Free Service
            </span>
          </div>

          {errorMessage && (
            <div className="p-4 rounded border border-red-200 bg-red-50 text-xs text-red-800 space-y-1">
              <strong className="block font-bold">Submission Error</strong>
              <p>{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-prayas-ink">Patient / Caregiver Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shri Radhey Shyam"
                  value={formData.requesterName}
                  onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                  className="w-full p-2.5 rounded border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-prayas-ink">Contact Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98971 23456"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full p-2.5 rounded border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-prayas-ink">Estimated Loan Duration (Days) *</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  required
                  value={formData.requestedDays}
                  onChange={(e) => setFormData({ ...formData, requestedDays: Number(e.target.value) })}
                  className="w-full p-2.5 rounded border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white"
                />
                <span className="text-[11px] text-prayas-muted">
                  Extensions are easily granted with a simple WhatsApp call to our coordinator.
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-prayas-ink">Patient Condition / Purpose *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Post-surgery recovery at home / elderly assistance"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full p-2.5 rounded border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-prayas-ink">Delivery Address in Vrindavan / Mathura *</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. House No. 12, Near Raman Reti, Parikrama Marg, Vrindavan"
                value={formData.deliveryAddress}
                onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                className="w-full p-2.5 rounded border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white"
              />
            </div>

            <div className="pt-3 border-t border-prayas-rule flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="px-4 py-2 rounded border border-prayas-rule bg-white text-prayas-ink font-semibold"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded text-sm font-bold bg-prayas-neem text-white hover:bg-[#23432b] transition-colors shadow-subtle disabled:opacity-50"
              >
                {submitting ? "Submitting Request..." : "Submit Equipment Loan Application"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 3: DISPATCH CONFIRMATION */}
      {activeStep === 3 && (
        <div className="border border-prayas-rule bg-white rounded p-8 sm:p-10 shadow-card text-center space-y-6">
          <CheckCircle2 className="w-12 h-12 text-prayas-neem mx-auto" />
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-prayas-ink">
              Equipment Loan Application Registered
            </h2>
            <p className="text-xs text-prayas-muted max-w-lg mx-auto leading-relaxed">
              Your request has been forwarded to our equipment coordinator. You will receive a verification call within 30 minutes to confirm delivery or self-pickup timing at our Vrindavan Seva Karyalaya.
            </p>
          </div>

          <div className="p-4 rounded border border-prayas-rule bg-prayas-stone max-w-md mx-auto text-xs text-left space-y-2">
            <p><strong>Device:</strong> {selectedItem?.name}</p>
            <p><strong>Caregiver:</strong> {formData.requesterName}</p>
            <p><strong>Phone:</strong> {formData.contactPhone}</p>
            <p><strong>Address:</strong> {formData.deliveryAddress}</p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setActiveStep(1);
                setSelectedItem(null);
                setFormData({
                  requesterName: "",
                  contactPhone: "",
                  deliveryAddress: "",
                  purpose: "",
                  requestedDays: 14,
                });
              }}
              className="px-6 py-2.5 rounded font-bold bg-prayas-neem text-white hover:bg-[#23432b] text-xs transition-colors shadow-subtle"
            >
              Browse Other Equipment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
