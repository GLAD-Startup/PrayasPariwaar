"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Trash2,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Mail,
  Phone,
  Clock,
  FileText,
  Lock,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

export default function DeleteAccountClient() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Send deletion request via existing contact API or notify admin
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: "ACCOUNT & DATA DELETION REQUEST",
          message: `Request for account and personal data deletion.\nUser Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nReason / Additional Notes: ${form.reason || "None specified"}`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || "Failed to submit request. Please email us directly.");
      }
    } catch (err) {
      setError("Network error. Please email us directly at av.prayas@gmail.com.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Header */}
      <div className="border-b border-prayas-rule pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-red-50 border border-red-200 text-xs font-bold text-red-700">
          <Trash2 className="w-3.5 h-3.5" />
          <span>User Privacy & Data Deletion</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-prayas-ink">
          Request Account & Data Deletion
        </h1>
        <p className="text-sm sm:text-base text-prayas-muted max-w-2xl leading-relaxed">
          In compliance with Google Play Store policies and the Digital Personal Data Protection Act (DPDP Act 2023), Prayas Pariwaar provides full rights to users to request the permanent deletion of their account and associated personal data.
        </p>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-prayas-rule rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-prayas-ink">What Data Gets Deleted</h3>
              <p className="text-xs text-prayas-muted">Permanently purged upon verification</p>
            </div>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-prayas-muted">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Account Credentials:</strong> Email, encrypted password, OAuth profile linkages.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Profile Details:</strong> Full name, phone number, city, and avatar photo.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Volunteer & Blood Donor Records:</strong> Delisted from emergency donor rosters.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Device Tokens:</strong> Expo push notification registrations and device links.</span>
            </li>
          </ul>
        </div>

        <div className="bg-white border border-prayas-rule rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-prayas-ink">What Data Is Retained</h3>
              <p className="text-xs text-prayas-muted">Legally mandated audit retentions</p>
            </div>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-prayas-muted">
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span><strong>Statutory 80G Tax Receipts:</strong> Financial donation records and Form 10BD filings are legally retained for 7 financial years under the Indian Income Tax Act.</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span><strong>Payment Gateway Logs:</strong> Razorpay transaction IDs retained for accounting reconciliation and fraud prevention.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Steps to delete */}
      <div className="bg-prayas-stone rounded-2xl p-6 sm:p-8 border border-prayas-rule space-y-6">
        <h3 className="font-serif text-lg sm:text-xl font-bold text-prayas-ink">
          How to Request Account & Data Deletion
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-prayas-ink">
              <span className="w-6 h-6 rounded-full bg-prayas-neem text-white text-xs flex items-center justify-center">1</span>
              <span>Submit the Web Form Below</span>
            </div>
            <p className="text-xs text-prayas-muted pl-8 leading-relaxed">
              Fill out the fast verification form on this page with your registered email and phone number. Our data protection team will verify your request.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-prayas-ink">
              <span className="w-6 h-6 rounded-full bg-prayas-neem text-white text-xs flex items-center justify-center">2</span>
              <span>Direct Email / Telephone Request</span>
            </div>
            <p className="text-xs text-prayas-muted pl-8 leading-relaxed">
              Email us at <a href="mailto:av.prayas@gmail.com" className="text-prayas-neem underline font-semibold">av.prayas@gmail.com</a> with subject &ldquo;Account Deletion Request&rdquo; or call our Vrindavan Seva Karyalaya at <strong>+91 94122 79069</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 text-xs text-prayas-muted border-t border-prayas-rule/60">
          <Clock className="w-4 h-4 text-prayas-ink" />
          <span>Processing Timeline: Requests are acknowledged within 48 hours and completed within <strong>7 business days</strong>.</span>
        </div>
      </div>

      {/* Online Request Form */}
      <div className="bg-white border border-prayas-rule rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-prayas-ink">
            Submit Account Deletion Request
          </h2>
          <p className="text-xs sm:text-sm text-prayas-muted mt-1">
            Please provide the email address and phone number used when signing into the Prayas Sanstha mobile app.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Deletion Request Received</span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-700 leading-relaxed">
              Thank you. Your request for deletion of account credentials and associated profile data has been received. Our data grievance officer will process your request within 7 business days and send confirmation to your registered email.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-prayas-ink">Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your Name as registered"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-prayas-rule text-sm focus:outline-none focus:ring-2 focus:ring-prayas-neem/20 focus:border-prayas-neem"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-prayas-ink">Registered Email Address *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-prayas-rule text-sm focus:outline-none focus:ring-2 focus:ring-prayas-neem/20 focus:border-prayas-neem"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-prayas-ink">Registered Phone Number (Optional)</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-lg border border-prayas-rule text-sm focus:outline-none focus:ring-2 focus:ring-prayas-neem/20 focus:border-prayas-neem"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-prayas-ink">Reason for Deletion (Optional)</label>
              <textarea
                rows={3}
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Let us know why you are leaving or if you have any questions..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-prayas-rule text-sm focus:outline-none focus:ring-2 focus:ring-prayas-neem/20 focus:border-prayas-neem"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-lg bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors shadow-subtle flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? "Submitting Request..." : "Submit Deletion Request"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* Footer link to privacy policy */}
      <div className="text-center text-xs text-prayas-muted pt-4">
        Need more information on our data governance? Read our complete{" "}
        <Link href="/privacy-policy" className="text-prayas-neem underline font-semibold">
          Privacy Policy & Data Governance Charter
        </Link>
        .
      </div>
    </div>
  );
}
