"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, CheckCircle2, ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function CorporatePartnerPage() {
  const [form, setForm] = useState({
    name: "",
    organizationName: "",
    email: "",
    phone: "",
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
      const res = await apiFetch("/api/partnerships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, type: "CORPORATE" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
      } else {
        setError(data.error || "Failed to submit CSR proposal.");
      }
    } catch (err) {
      setError("Network error. Please call our office directly at +91 94122 79000.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-10 pb-20 max-w-3xl 2xl:max-w-4xl 3xl:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 pt-6 sm:pt-10">
      <div className="space-y-3 border-b border-prayas-rule pb-6">
        <Link
          href="/about"
          className="inline-flex items-center gap-1.5 text-xs 2xl:text-sm font-semibold text-prayas-muted hover:text-prayas-ink"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to About Us
        </Link>
        <h1 className="font-serif text-2xl xs:text-3xl sm:text-4xl 2xl:text-5xl font-bold text-prayas-ink leading-tight">
          Corporate Social Responsibility (CSR) & Institutional Alliances
        </h1>
        <p className="text-sm sm:text-base 2xl:text-lg text-prayas-muted leading-relaxed">
          Partner with an 18-year-old registered NGO with full 12A and NITI Aayog Darpan compliance for direct on-ground impact in Mathura district.
        </p>
      </div>

      <div className="border border-prayas-rule bg-white rounded p-6 sm:p-8 shadow-card space-y-6">
        {success ? (
          <div className="p-8 rounded border border-green-200 bg-green-50 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-prayas-neem mx-auto" />
            <h2 className="font-serif text-xl font-bold text-green-900">
              CSR Proposal Received
            </h2>
            <p className="text-xs text-green-800 leading-relaxed">
              Thank you for initiating a CSR dialogue with Prayas Pariwaar. Our executive trustees will send our organizational profile and audited reports for formal board review.
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
                <label className="font-bold text-prayas-ink">Representative Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meenakshi Sundaram"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-2.5 rounded border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-prayas-ink">Company / Trust / Foundation Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Engineering Pvt Ltd"
                  value={form.organizationName}
                  onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                  className="w-full p-2.5 rounded border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-prayas-ink">Official Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. csr@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full p-2.5 rounded border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-prayas-ink">Mobile / Office Contact Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98971 23456"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full p-2.5 rounded border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-prayas-ink">CSR Focus Area & Proposal Details *</label>
              <textarea
                rows={4}
                required
                placeholder="e.g. Environmental restoration along Yamuna banks / Village health diagnostic mobile clinic funding / School computer laboratory setup."
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
                {submitting ? "Submitting Proposal..." : "Submit CSR Partnership Proposal"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
