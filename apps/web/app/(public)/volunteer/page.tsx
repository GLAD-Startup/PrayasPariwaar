"use client";

import { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";

export default function VolunteerPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    skills: "Teaching / Mentorship",
    availability: "WEEKENDS",
    areaOfInterest: "Child Education & Evening Tutoring",
    previousExperience: "",
    // Blood Donor Cross-Registration
    isBloodDonor: false,
    bloodGroup: "O_POSITIVE",
    city: "Vrindavan",
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [alreadyRegisteredMessage, setAlreadyRegisteredMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    setAlreadyRegisteredMessage(null);

    try {
      const res = await fetch("/api/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.status === 409 || data.alreadyRegistered) {
        setAlreadyRegisteredMessage(
          data.error || "You are already registered with Prayas Pariwaar! Our coordination desk has your contact details on record."
        );
      } else if (res.ok && data.success) {
        setSuccessMessage(data.message || "Thank you for joining Prayas Pariwaar!");
      } else {
        setError(data.error || "Failed to submit volunteer application. Please check all fields.");
      }
    } catch (err) {
      setError("Network error. Please call our office directly at +91 94122 79000.");
    } finally {
      setSubmitting(false);
    }
  };

  const bloodGroups = [
    { value: "A_POSITIVE", label: "A+" },
    { value: "A_NEGATIVE", label: "A-" },
    { value: "B_POSITIVE", label: "B+" },
    { value: "B_NEGATIVE", label: "B-" },
    { value: "AB_POSITIVE", label: "AB+" },
    { value: "AB_NEGATIVE", label: "AB-" },
    { value: "O_POSITIVE", label: "O+" },
    { value: "O_NEGATIVE", label: "O-" },
  ];

  return (
    <div className="space-y-8 sm:space-y-12 pb-20 max-w-4xl 2xl:max-w-5xl 3xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 pt-6 sm:pt-10">
      {/* Page Header */}
      <div className="border-b border-prayas-rule pb-6 sm:pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-prayas-stone border border-prayas-rule text-xs 2xl:text-sm font-bold text-prayas-neem">
          <Users className="w-3.5 h-3.5" />
          <span>Nishkam Seva • Community Volunteer Program</span>
        </div>
        <h1 className="font-serif text-2xl xs:text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl font-bold text-prayas-ink leading-tight">
          Volunteer With Prayas Pariwaar in Vrindavan
        </h1>
        <p className="text-sm sm:text-base 2xl:text-lg text-prayas-muted leading-relaxed max-w-2xl 2xl:max-w-3xl">
          Whether you are a student, teacher, doctor, professional, or local resident, your contribution of a few hours each week can transform lives across Mathura district.
        </p>
      </div>

      {/* Program Roles Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-prayas-rule bg-white rounded-xl p-5 shadow-card space-y-2">
          <div className="w-9 h-9 rounded-lg bg-green-50 text-prayas-neem flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-sm font-bold text-prayas-ink">
            Weekend Teaching & Mentoring
          </h3>
          <p className="text-xs text-prayas-muted leading-relaxed">
            Teach basic mathematics, English, and sciences to underprivileged village children in our 6 evening centers.
          </p>
        </div>

        <div className="border border-prayas-rule bg-white rounded-xl p-5 shadow-card space-y-2">
          <div className="w-9 h-9 rounded-lg bg-red-50 text-prayas-crimson flex items-center justify-center">
            <Droplet className="w-5 h-5 fill-current" />
          </div>
          <h3 className="font-serif text-sm font-bold text-prayas-ink">
            Emergency Blood Donation
          </h3>
          <p className="text-xs text-prayas-muted leading-relaxed">
            Register as a voluntary donor to be on-call for critical surgical and accident cases in Mathura hospitals.
          </p>
        </div>

        <div className="border border-prayas-rule bg-white rounded-xl p-5 shadow-card space-y-2">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
            <Trees className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-sm font-bold text-prayas-ink">
            Plantation & Ecology Drives
          </h3>
          <p className="text-xs text-prayas-muted leading-relaxed">
            Participate in seasonal Sunday tree planting drives and tree-guard maintenance along Parikrama Marg.
          </p>
        </div>
      </div>

      {/* Application Form */}
      <div className="border border-prayas-rule bg-white rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
        <div className="border-b border-prayas-rule pb-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-prayas-ink">
            Volunteer Registration Form
          </h2>
          <p className="text-xs text-prayas-muted mt-1">
            Choose your seva domain and optionally register as an emergency voluntary blood donor in one simple step.
          </p>
        </div>

        {/* ALREADY REGISTERED NOTICE */}
        {alreadyRegisteredMessage && (
          <div className="p-5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 space-y-2 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-700 shrink-0" />
              <h3 className="font-serif text-base font-bold text-amber-950">
                You Are Already Registered!
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-amber-900">
              {alreadyRegisteredMessage}
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs">
              <a
                href="tel:+919412279000"
                className="font-bold text-amber-900 underline flex items-center gap-1"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                Call Helpline: +91 94122 79000
              </a>
              <Link href="/" className="text-amber-800 hover:underline">
                Return to Homepage →
              </Link>
            </div>
          </div>
        )}

        {/* NEW REGISTRATION SUCCESS */}
        {successMessage && (
          <div className="p-6 rounded-xl bg-green-50 border border-green-300 text-green-950 space-y-3 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-prayas-neem shrink-0" />
              <h3 className="font-serif text-lg font-bold text-emerald-950">
                Volunteer Registration Received!
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
              {successMessage}
            </p>
            <p className="text-xs text-emerald-800">
              Our general volunteer coordinator will reach out to you via WhatsApp / Phone to brief you on upcoming orientation sessions and field schedules.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setSuccessMessage(null);
                  setForm({
                    name: "",
                    email: "",
                    phone: "",
                    skills: "",
                    availability: "WEEKENDS",
                    areaOfInterest: "Child Education & Evening Tutoring",
                    previousExperience: "",
                    isBloodDonor: false,
                    bloodGroup: "O_POSITIVE",
                    city: "Vrindavan",
                  });
                }}
                className="px-4 py-2 rounded-lg bg-[#2E5339] text-white text-xs font-bold shadow hover:bg-[#23432b]"
                style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
              >
                Register Another Volunteer
              </button>
            </div>
          </div>
        )}

        {/* ERROR NOTICE */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-prayas-crimson shrink-0" />
            <span className="flex-1 font-medium">{error}</span>
          </div>
        )}

        {/* FORM FIELDS (Hidden when successfully registered) */}
        {!successMessage && !alreadyRegisteredMessage && (
          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            {/* Name, Email, Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-prayas-ink block">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-prayas-ink block">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh@gmail.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-prayas-ink block">
                  Contact Phone (WhatsApp) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-mono"
                />
              </div>
            </div>

            {/* Primary Seva Interest & Availability */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-prayas-ink block">
                  Primary Area of Seva *
                </label>
                <select
                  value={form.areaOfInterest}
                  onChange={(e) => setForm({ ...form, areaOfInterest: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-semibold"
                >
                  <option value="Child Education & Evening Tutoring">
                    🎓 Project Aashayein (Evening Tutoring & Teaching)
                  </option>
                  <option value="Environmental & Native Tree Plantation">
                    🌳 Vrindavan Harit Kranti (Afforestation & Tree Care)
                  </option>
                  <option value="Emergency Blood Donation & Hospital Dispatch">
                    🩸 24/7 Blood Donation & Patient Hospital Support
                  </option>
                  <option value="Jan Swasthya Eye & Health Camps">
                    🩺 Medical Camps & Equipment Lending Assistance
                  </option>
                  <option value="General Volunteer & Seva Coordination">
                    🤝 General Event Organization & Community Outreach
                  </option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-prayas-ink block">
                  Your Availability *
                </label>
                <select
                  value={form.availability}
                  onChange={(e) => setForm({ ...form, availability: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-semibold"
                >
                  <option value="WEEKENDS">Weekends Only (Saturday / Sunday)</option>
                  <option value="WEEKDAY_EVENINGS">Weekday Evenings (5:00 PM - 7:30 PM)</option>
                  <option value="FULL_TIME">Full Time Volunteer</option>
                  <option value="EMERGENCY_ON_CALL">Emergency On-Call (Blood & Medical Dispatch)</option>
                  <option value="FLEXIBLE">Flexible / As per schedule</option>
                </select>
              </div>
            </div>

            {/* Skills & Background */}
            <div className="space-y-1">
              <label className="font-bold text-prayas-ink block">
                Your Skills / Profession *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mathematics Teacher, Doctor, College Student, IT Professional, Social Worker"
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-medium"
              />
            </div>

            {/* CROSS-REGISTRATION: ALSO REGISTER AS BLOOD DONOR? */}
            <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isBloodDonor}
                  onChange={(e) => setForm({ ...form, isBloodDonor: e.target.checked })}
                  className="rounded text-prayas-crimson focus:ring-prayas-crimson w-4 h-4 mt-0.5"
                />
                <div>
                  <span className="font-bold text-xs text-red-950 block">
                    🩸 Would you also like to register as an Emergency Voluntary Blood Donor?
                  </span>
                  <span className="text-[11px] text-red-800 block mt-0.5">
                    Help save lives during acute surgical emergencies and accident trauma across Mathura district.
                  </span>
                </div>
              </label>

              {/* Conditional Blood Donor Fields */}
              {form.isBloodDonor && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-red-200/60 animate-in fade-in">
                  <div className="space-y-1">
                    <label className="font-bold text-red-950 block">
                      Your Blood Group *
                    </label>
                    <select
                      value={form.bloodGroup}
                      onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-red-200 bg-white text-red-950 font-bold focus:outline-none focus:ring-2 focus:ring-prayas-crimson"
                    >
                      {bloodGroups.map((bg) => (
                        <option key={bg.value} value={bg.value}>
                          {bg.label} Blood Group
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-red-950 block">
                      Current City / Village in Mathura *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Vrindavan, Mathura, Govardhan, Barsana"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-red-200 bg-white text-red-950 font-medium focus:outline-none focus:ring-2 focus:ring-prayas-crimson"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Previous Experience */}
            <div className="space-y-1">
              <label className="font-bold text-prayas-ink block">
                Previous Volunteer Experience or Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Tell us about any previous community work or what motivates you to join Prayas Pariwaar..."
                value={form.previousExperience}
                onChange={(e) => setForm({ ...form, previousExperience: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-prayas-rule">
              <span className="text-[11px] text-prayas-muted flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-prayas-neem" />
                100% voluntary, honorary seva.
              </span>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-[#2E5339] text-white hover:bg-[#23432b] shadow-md flex items-center justify-center gap-2 disabled:opacity-50 transition-all text-xs sm:text-sm"
                style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>
                  {form.isBloodDonor
                    ? "Register as Volunteer & Blood Donor →"
                    : "Submit Volunteer Registration →"}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
