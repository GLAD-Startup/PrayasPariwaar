"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import {
  Users,
  CheckCircle2,
  Heart,
  Trees,
  BookOpen,
  Stethoscope,
  Droplet,
  AlertCircle,
  PhoneCall,
  ArrowRight,
  ShieldCheck,
  Send,
  Loader2,
  Check,
} from "lucide-react";

const INTEREST_AREAS = [
  "Education",
  "Health",
  "Environment",
  "Blood Donation",
  "Events",
  "Teaching",
  "Admin Support",
  "Digital Marketing",
  "Other",
];

const STATES = [
  "Uttar Pradesh",
  "Delhi NCR",
  "Haryana",
  "Rajasthan",
  "Madhya Pradesh",
  "Punjab",
  "Maharashtra",
  "Other",
];

export default function VolunteerPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    gender: "Male",
    address: "",
    city: "Vrindavan",
    state: "Uttar Pradesh",
    pincode: "",
    areasOfInterest: ["Education", "Teaching"] as string[],
    skills: "",
    availability: "WEEKENDS",
    previousExperience: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [alreadyRegisteredMessage, setAlreadyRegisteredMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleInterest = (area: string) => {
    if (form.areasOfInterest.includes(area)) {
      if (form.areasOfInterest.length === 1) return;
      setForm({
        ...form,
        areasOfInterest: form.areasOfInterest.filter((item) => item !== area),
      });
    } else {
      setForm({
        ...form,
        areasOfInterest: [...form.areasOfInterest, area],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    setAlreadyRegisteredMessage(null);

    try {
      const res = await apiFetch("/api/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.status === 409 || data.alreadyRegistered) {
        setAlreadyRegisteredMessage(
          data.error || "You are already registered! Our coordination desk has your contact details on record."
        );
      } else if (res.ok && data.success) {
        setSuccessMessage(data.message || "Thank you for joining our volunteer taskforce!");
      } else {
        setError(data.error || "Failed to submit volunteer application. Please check all fields.");
      }
    } catch (err) {
      setError("Network error. Please call our office directly at +91 96765 43210.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-12 pb-20 max-w-4xl 2xl:max-w-5xl 3xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 pt-6 sm:pt-10">
      {/* Page Header */}
      <div className="border-b border-prayas-rule pb-6 sm:pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-prayas-stone border border-prayas-rule text-xs 2xl:text-sm font-bold text-prayas-neem">
          <Users className="w-3.5 h-3.5" />
          <span>Nishkam Seva • Volunteer Taskforce</span>
        </div>
        <h1 className="font-serif text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold text-prayas-ink leading-tight">
          Volunteer With Us in Vrindavan & Mathura
        </h1>
        <p className="text-sm sm:text-base text-prayas-muted leading-relaxed max-w-2xl">
          Whether you are a student, teacher, doctor, professional, or devotee, your contribution of a few hours each week can transform lives across our 5 Seva Streams.
        </p>
      </div>

      {/* Main Registration Card */}
      <div className="border border-prayas-rule bg-white rounded-2xl p-6 sm:p-10 shadow-card space-y-6">
        <div className="border-b border-prayas-rule pb-4">
          <h2 className="font-serif text-xl font-bold text-prayas-ink">
            Volunteer Application Form
          </h2>
          <p className="text-xs text-prayas-muted">
            Please fill in your details and select the areas where you would love to serve.
          </p>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{successMessage}</p>
              <p className="text-emerald-800 text-xs mt-1">
                Our coordination team will contact you within 48 hours to complete your orientation.
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Already Registered Message */}
        {alreadyRegisteredMessage && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="font-medium">{alreadyRegisteredMessage}</p>
            </div>
            <div className="pt-1 border-t border-amber-200/80 flex items-center justify-between">
              <span className="text-xs text-amber-800">Need to register a family member or friend?</span>
              <button
                type="button"
                onClick={() => {
                  setAlreadyRegisteredMessage(null);
                  setForm({
                    name: "",
                    email: "",
                    phone: "",
                    dob: "",
                    gender: "Male",
                    address: "",
                    city: "Vrindavan",
                    state: "Uttar Pradesh",
                    pincode: "",
                    areasOfInterest: ["Education", "Teaching"],
                    skills: "",
                    availability: "WEEKENDS",
                    previousExperience: "",
                  });
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition-colors shadow-sm"
              >
                Register Another Person (+)
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
          {/* Section 1: Personal Information */}
          <div className="space-y-4">
            <h3 className="font-bold text-prayas-ink text-sm uppercase tracking-wider text-emerald-800">
              1. Personal Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-prayas-ink block">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/30 focus:bg-white text-xs outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-prayas-ink block">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/30 focus:bg-white text-xs outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-prayas-ink block">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/30 focus:bg-white text-xs outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-prayas-ink block">Date of Birth</label>
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/30 focus:bg-white text-xs outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-prayas-ink block">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/30 text-xs outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-prayas-ink block">Address</label>
              <input
                type="text"
                placeholder="Enter complete address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/30 focus:bg-white text-xs outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-prayas-ink block">City</label>
                <input
                  type="text"
                  placeholder="Enter city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/30 focus:bg-white text-xs outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-prayas-ink block">State</label>
                <select
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/30 text-xs outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  {STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-prayas-ink block">Pincode</label>
                <input
                  type="text"
                  placeholder="e.g. 281001"
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/30 focus:bg-white text-xs outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Multi-Select Areas of Interest */}
          <div className="space-y-3 pt-4 border-t border-prayas-rule">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-prayas-ink text-sm uppercase tracking-wider text-emerald-800">
                2. Areas of Interest (Select one or more) *
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {INTEREST_AREAS.map((area) => {
                const isSelected = form.areasOfInterest.includes(area);
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleInterest(area)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                        : "bg-white text-prayas-ink border-prayas-rule hover:bg-prayas-stone"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{area}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Availability & Skills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-prayas-rule">
            <div className="space-y-1">
              <label className="font-bold text-prayas-ink block">Your Availability *</label>
              <select
                value={form.availability}
                onChange={(e) => setForm({ ...form, availability: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/30 text-xs outline-none focus:ring-2 focus:ring-emerald-700"
              >
                <option value="WEEKENDS">Weekends (Saturday / Sunday)</option>
                <option value="WEEKDAY_EVENINGS">Weekday Evenings</option>
                <option value="FULL_TIME">Full Time Seva</option>
                <option value="FLEXIBLE">Flexible / On-Call</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-prayas-ink block">Skills / Background</label>
              <input
                type="text"
                placeholder="e.g. Teaching, Doctor, IT, Social Work"
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/30 focus:bg-white text-xs outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Application</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
