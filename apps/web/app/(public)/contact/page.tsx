"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Clock, CheckCircle2, ShieldCheck } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
      } else {
        setError(data.error || "Failed to send message.");
      }
    } catch (err) {
      setError("Network error. Please call our office directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 pb-20 max-w-6xl mx-auto px-4 sm:px-6 pt-10">
      {/* Page Header */}
      <div className="border-b border-prayas-rule pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-prayas-stone border border-prayas-rule text-xs font-bold text-prayas-ink">
          <span>Registered Office & Seva Karyalaya</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-prayas-ink">
          Contact Prayas Pariwaar in Vrindavan
        </h1>
        <p className="text-sm text-prayas-muted max-w-2xl leading-relaxed">
          Reach our volunteer team, visit our Seva Karyalaya for medical equipment loans, or connect with our emergency blood desk.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Contact Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border border-prayas-rule bg-white rounded p-6 shadow-card space-y-6">
            <h2 className="font-serif text-xl font-bold text-prayas-ink border-b border-prayas-rule pb-3">
              Office & Help Desks
            </h2>

            <div className="space-y-4 text-xs text-prayas-ink">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-prayas-neem shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Physical Address</strong>
                  <p className="text-prayas-muted leading-relaxed">
                    Prayas Seva Karyalaya, Near Raman Reti,<br />
                    Parikrama Marg, Vrindavan,<br />
                    Mathura District, UP — 281121
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-prayas-crimson shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Emergency Blood Helpline (24/7)</strong>
                  <p className="text-prayas-crimson font-bold font-mono text-sm">+91 94122 79000</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-prayas-neem shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Medical Equipment Coordinator</strong>
                  <p className="text-prayas-ink font-bold font-mono text-sm">+91 98971 23456</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-prayas-muted shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">General Enquiries Email</strong>
                  <p className="text-prayas-muted">contact@prayaspariwaar.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-prayas-muted shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Karyalaya Visiting Hours</strong>
                  <p className="text-prayas-muted">Morning: 8:00 AM – 1:00 PM | Evening: 4:00 PM – 8:00 PM</p>
                  <p className="text-[11px] text-prayas-neem font-semibold">Emergency Blood & Oxygen support: 24/7 on call</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Message Form */}
        <div className="lg:col-span-7">
          <div className="border border-prayas-rule bg-white rounded p-6 sm:p-8 shadow-card space-y-6">
            <div className="border-b border-prayas-rule pb-3">
              <h2 className="font-serif text-xl font-bold text-prayas-ink">
                Send a Message to Our Office
              </h2>
              <p className="text-xs text-prayas-muted">
                Our general secretary reviews and responds to all correspondence daily.
              </p>
            </div>

            {success ? (
              <div className="p-8 rounded border border-green-200 bg-green-50 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-prayas-neem mx-auto" />
                <h3 className="font-serif text-xl font-bold text-green-900">
                  Message Sent Successfully
                </h3>
                <p className="text-xs text-green-800 leading-relaxed max-w-md mx-auto">
                  Thank you for reaching out to Prayas Pariwaar. We have received your query and will reply within 24 hours.
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
                    <label className="font-bold text-prayas-ink">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Shyam Sundar Sharma"
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
                      placeholder="e.g. shyam@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full p-2.5 rounded border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-prayas-ink">Contact Phone Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 98971 23456"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full p-2.5 rounded border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-prayas-ink">Subject *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Equipment loan query / School support"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full p-2.5 rounded border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-prayas-ink">Your Message *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Write your message here..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full p-2.5 rounded border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 rounded text-sm font-bold bg-prayas-neem text-white hover:bg-[#23432b] transition-colors shadow-subtle disabled:opacity-50"
                  >
                    {submitting ? "Sending Message..." : "Send Message to Office"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
