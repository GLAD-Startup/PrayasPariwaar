"use client";

import { useState } from "react";
import { Users, CheckCircle2, Heart, Trees, BookOpen, Stethoscope, Droplet } from "lucide-react";

export default function VolunteerPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    skills: "",
    availability: "WEEKENDS",
    areaOfInterest: "Child Education & Evening Tutoring",
    previousExperience: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
      } else {
        setError(data.error || "Failed to submit volunteer application. Please check all fields.");
      }
    } catch (err) {
      setError("Network error. Please call our office directly at +91 94122 79000.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 pb-20 max-w-4xl mx-auto px-4 sm:px-6 pt-10">
      {/* Page Header */}
      <div className="border-b border-prayas-rule pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-prayas-stone border border-prayas-rule text-xs font-bold text-prayas-neem">
          <Users className="w-3.5 h-3.5" />
          <span>Nishkam Seva • Community Volunteer Program</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-prayas-ink">
          Volunteer With Prayas Pariwaar in Vrindavan
        </h1>
        <p className="text-sm text-prayas-muted leading-relaxed max-w-2xl">
          Whether you are a student, teacher, doctor, professional, or local resident, your contribution of a few hours each week can transform lives across Mathura district.
        </p>
      </div>

      {/* Program Roles Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-prayas-rule bg-white rounded p-4 shadow-subtle space-y-2">
          <BookOpen className="w-5 h-5 text-prayas-neem" />
          <h3 className="font-serif text-sm font-bold text-prayas-ink">Weekend Teaching & Mentoring</h3>
          <p className="text-xs text-prayas-muted leading-relaxed">
            Teach basic mathematics, English, and sciences to underprivileged village children.
          </p>
        </div>

        <div className="border border-prayas-rule bg-white rounded p-4 shadow-subtle space-y-2">
          <Droplet className="w-5 h-5 text-prayas-crimson" />
          <h3 className="font-serif text-sm font-bold text-prayas-ink">Blood Donation Dispatch</h3>
          <p className="text-xs text-prayas-muted leading-relaxed">
            Help coordinate emergency hospital requests and connect with registered donors.
          </p>
        </div>

        <div className="border border-prayas-rule bg-white rounded p-4 shadow-subtle space-y-2">
          <Trees className="w-5 h-5 text-prayas-marigold" />
          <h3 className="font-serif text-sm font-bold text-prayas-ink">Plantation & Ecology Drives</h3>
          <p className="text-xs text-prayas-muted leading-relaxed">
            Participate in seasonal Sunday tree planting drives along the Vrindavan Parikrama Marg.
          </p>
        </div>
      </div>

      {/* Application Form */}
      <div className="border border-prayas-rule bg-white rounded p-6 sm:p-8 shadow-card space-y-6">
        <div className="border-b border-prayas-rule pb-3">
          <h2 className="font-serif text-xl font-bold text-prayas-ink">
            Volunteer Application Form
          </h2>
          <p className="text-xs text-prayas-muted">
            Our volunteer coordinator will review your profile and connect via phone or WhatsApp.
          </p>
        </div>

        {success ? (
          <div className="p-8 rounded border border-green-200 bg-green-50 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-prayas-neem mx-auto" />
            <h3 className="font-serif text-xl font-bold text-green-900">
              Application Submitted Successfully
            </h3>
            <p className="text-xs text-green-800 max-w-md mx-auto leading-relaxed">
              Thank you for dedicating your time to the service of Vrindavan. Shri Radhey Mohan from our volunteer coordination desk will contact you within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-3.5 rounded border border-red-200 bg-red-50 text-red-800">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-prayas-ink">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-2.5 rounded border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-prayas-ink">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full p-2.5 rounded border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-prayas-ink">WhatsApp / Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98971 23456"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full p-2.5 rounded border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-prayas-ink">Your Availability *</label>
                <select
                  value={form.availability}
                  onChange={(e) => setForm({ ...form, availability: e.target.value })}
                  className="w-full p-2.5 rounded border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white"
                >
                  <option value="WEEKENDS">Weekends Only (Saturday & Sunday)</option>
                  <option value="WEEKDAYS_EVENING">Weekday Evenings (5 PM - 8 PM)</option>
                  <option value="FULL_TIME">Full Time (Daily Active Seva)</option>
                  <option value="ON_CALL_EMERGENCY">On-Call Emergency Response (Blood/Medical)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-prayas-ink">Primary Area of Interest *</label>
              <select
                value={form.areaOfInterest}
                onChange={(e) => setForm({ ...form, areaOfInterest: e.target.value })}
                className="w-full p-2.5 rounded border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white"
              >
                <option value="Child Education & Evening Tutoring">Child Education & Evening Tutoring</option>
                <option value="Emergency Blood Donation Coordination">Emergency Blood Donation Coordination</option>
                <option value="Medical Equipment Delivery & Maintenance">Medical Equipment Delivery & Maintenance</option>
                <option value="Native Tree Plantation & Caretaking">Native Tree Plantation & Caretaking</option>
                <option value="Health Camp Logistics & Doctor Assistance">Health Camp Logistics & Doctor Assistance</option>
                <option value="Digital Media, Photography & Content">Digital Media, Photography & Content</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-prayas-ink">Key Skills / Profession *</label>
              <input
                type="text"
                required
                placeholder="e.g. High school mathematics teacher / BSc nursing student / Graphic designer"
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                className="w-full p-2.5 rounded border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-prayas-ink">Previous Social Work or Community Experience (Optional)</label>
              <textarea
                rows={3}
                placeholder="Briefly describe any prior volunteering or seva work you have done..."
                value={form.previousExperience}
                onChange={(e) => setForm({ ...form, previousExperience: e.target.value })}
                className="w-full p-2.5 rounded border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded text-sm font-bold bg-prayas-neem text-white hover:bg-[#23432b] transition-colors shadow-subtle disabled:opacity-50"
              >
                {submitting ? "Submitting Application..." : "Submit Volunteer Application"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
