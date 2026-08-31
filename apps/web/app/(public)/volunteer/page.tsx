"use client";

import { useState } from "react";
import { Users, Heart, Award, CheckCircle2, Send, AlertTriangle } from "lucide-react";

export default function VolunteerPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    skills: "Logistics & Coordination",
    availability: "Weekends & On-Call Emergency",
    areaOfInterest: "Blood Donation Drives",
    previousExperience: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to register volunteer");
      }

      setSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
            <Users className="w-3.5 h-3.5" />
            Join the Prayas Seva Taskforce
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display leading-tight">
            Be the First Responder in Someone's Time of Need
          </h1>
          <p className="text-amber-100 text-sm sm:text-base leading-relaxed">
            Join over 3,200 active volunteers across Rajasthan and beyond. Whether you have 2 hours a week or are ready for emergency on-call coordination, your time saves lives.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-display">
              Volunteer Registration
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Fill in your details below. Our team coordinator will connect with you on WhatsApp / Phone.
            </p>
          </div>

          {success ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-xl font-bold">Welcome to the Prayas Family!</h3>
              <p className="text-xs text-emerald-700 max-w-md mx-auto">
                Your volunteer application has been received. You will receive an orientation kit and invitation to the volunteer dispatch group shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Skills / Profession *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Medical / Nurse, Driver, IT / Social Media"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Availability *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Weekends, 4 hrs/week, Emergency On-Call"
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Area of Interest *
                </label>
                <select
                  value={formData.areaOfInterest}
                  onChange={(e) => setFormData({ ...formData, areaOfInterest: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 text-sm bg-white outline-none"
                >
                  <option value="Blood Donation Drives">Emergency Blood Donation Drives & Donor Matching</option>
                  <option value="Medical Equipment Maintenance & Logistics">Medical Equipment Maintenance & Logistics</option>
                  <option value="Disaster Relief Operations">Disaster & Floods Relief Operations</option>
                  <option value="Community Healthcare Camps">Community Healthcare Camps</option>
                  <option value="Digital Media & Helpline Support">Digital Media & Helpline Operations</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Previous Experience / Motivation (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Share a short note on why you'd like to join Prayas"
                  value={formData.previousExperience}
                  onChange={(e) => setFormData({ ...formData, previousExperience: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 text-sm outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Submitting Application..." : (
                  <>
                    <Send className="w-4 h-4" /> Submit Volunteer Application
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right Perks & Badges */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 text-white space-y-4">
            <h3 className="text-lg font-bold font-display flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              What You Gain as a Prayas Volunteer
            </h3>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Official Certificate of Service:</strong> Recognized service hours documentation for students & professionals.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>First Responder Training:</strong> Free certified workshops on basic life support (BLS), CPR, and equipment handling.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Direct Impact:</strong> Witness lives saved in real-time through your coordination.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
