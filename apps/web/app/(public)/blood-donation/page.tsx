"use client";

import { useState } from "react";
import {
  Droplet,
  Phone,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Zap,
  Users,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function BloodDonationPage() {
  const [activeTab, setActiveTab] = useState<"DONOR_REGISTER" | "REQUEST">("DONOR_REGISTER");

  // Donor Registration State (Kept functional on web)
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
          data.error ||
            "You are already registered in the Prayas Voluntary Blood Donor Registry! Thank you for your continued commitment."
        );
      } else if (res.ok && data.success) {
        setDonorSuccess(
          data.message || "Thank you for joining the Voluntary Blood Donor Registry!"
        );
      } else {
        setDonorError(data.error || "Failed to register donor. Please check phone number or call our helpline.");
      }
    } catch (err) {
      setDonorError("Network error. Please call our 24/7 helpline at +91 94122 79000.");
    } finally {
      setSubmittingDonor(false);
    }
  };

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
        <div className="border border-prayas-rule bg-white rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-prayas-crimson shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-prayas-ink uppercase tracking-wider">
                Immediate Urgent Requirement Helpline (24/7 Desk)
              </p>
              <p className="text-xs text-prayas-muted">
                For ICU / OT cases requiring blood in &lt; 60 minutes, call our on-duty coordinator directly:
              </p>
            </div>
          </div>
          <a
            href="tel:+919412279000"
            className="w-full sm:w-auto px-5 py-2.5 text-center rounded-xl bg-[#B91C1C] text-white text-xs font-bold hover:bg-[#991B1B] transition-all shadow-sm"
            style={{ backgroundColor: "#B91C1C", color: "#ffffff" }}
          >
            Call 24/7 Desk: +91 94122 79000
          </a>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex border-b border-prayas-rule text-xs sm:text-sm overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setActiveTab("DONOR_REGISTER")}
          className={`pb-3 px-3 sm:px-5 font-semibold transition-colors border-b-2 shrink-0 ${
            activeTab === "DONOR_REGISTER"
              ? "border-prayas-crimson text-prayas-crimson font-bold"
              : "border-transparent text-prayas-muted hover:text-prayas-ink"
          }`}
        >
          Register as a Voluntary Donor
        </button>
        <button
          onClick={() => setActiveTab("REQUEST")}
          className={`pb-3 px-3 sm:px-5 font-semibold transition-colors border-b-2 shrink-0 flex items-center gap-1.5 ${
            activeTab === "REQUEST"
              ? "border-prayas-crimson text-prayas-crimson font-bold"
              : "border-transparent text-prayas-muted hover:text-prayas-ink"
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Request Emergency Blood (via App)</span>
        </button>
      </div>

      {/* 3. TAB 1: REGISTER AS A VOLUNTARY DONOR (FUNCTIONAL ON WEB) */}
      {activeTab === "DONOR_REGISTER" && (
        <div className="border border-prayas-rule bg-white rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
          <div className="border-b border-prayas-rule pb-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
              <span>Web Registration Available</span>
            </div>
            <h2 className="font-serif text-xl font-bold text-prayas-ink">
              Join the Voluntary Blood Donor Registry
            </h2>
            <p className="text-xs text-prayas-muted">
              Receive alerts only when a matching patient in your town or hospital is in urgent need. You can register right here on the website.
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

              <div className="p-3.5 rounded-xl bg-prayas-stone border border-prayas-rule text-[11px] text-prayas-muted flex items-start gap-2">
                <Smartphone className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                <span>
                  <strong>Tip for Donors:</strong> After registering, install the <strong>Prayas Sanstha App</strong> on your Android or iPhone so you can receive instantaneous push alerts whenever a patient in your vicinity urgently needs your blood group.
                </span>
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

      {/* 4. TAB 2: APP-ONLY BLOOD REQUEST SCREEN */}
      {activeTab === "REQUEST" && (
        <div className="border border-prayas-rule bg-white rounded-2xl p-6 sm:p-10 shadow-card space-y-8">
          {/* Critical Emergency Banner (Top Priority) */}
          <div className="rounded-2xl border-2 border-red-600/40 bg-gradient-to-br from-red-950 via-[#991B1B] to-[#7F1D1D] text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/20 text-red-200 text-xs font-bold uppercase tracking-wider">
                  <AlertCircle className="w-3.5 h-3.5 text-red-300" />
                  <span>Immediate OT / ICU Emergency</span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold leading-tight">
                  Patient In Critical Need Within 60 Minutes?
                </h3>
                <p className="text-xs sm:text-sm text-red-100/90 leading-relaxed">
                  Do not wait for app downloads. Speak directly with our 24/7 on-duty Voluntary Blood Coordinator for instantaneous donor mobilization:
                </p>
              </div>

              <a
                href="tel:+919412279000"
                className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-white text-red-900 font-bold text-sm text-center hover:bg-red-50 transition-all shadow-lg shrink-0 flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4 fill-current text-red-700" />
                <span>Call Emergency Desk: +91 94122 79000</span>
              </a>
            </div>
          </div>

          {/* Main Notice: App-Only Requirement */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-900 text-xs font-bold border border-red-200">
              <Smartphone className="w-3.5 h-3.5 text-red-700" />
              <span>Mobile App Exclusive Protocol</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink leading-tight">
              Emergency Blood Requests Are Exclusively Managed via the Prayas Mobile App
            </h2>

            <p className="text-xs sm:text-sm text-prayas-muted leading-relaxed max-w-3xl">
              To broadcast verified emergency alerts with real-time push notifications and GPS proximity coordination directly to active voluntary blood donors in Mathura, Vrindavan, and Agra, emergency blood requests must be raised through our official <strong>Android</strong> or <strong>iOS</strong> App.
            </p>
          </div>

          {/* Why Mobile App Only? Explanation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-5 rounded-xl border border-prayas-rule bg-prayas-stone space-y-2">
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-prayas-ink text-sm">Instant Push Broadcasting</h4>
              <p className="text-prayas-muted text-[11px] leading-relaxed">
                When a request is submitted via the app, 500+ matching verified donors receive an immediate, high-priority push notification sound on their phones.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-prayas-rule bg-prayas-stone space-y-2">
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
                <MapPin className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-prayas-ink text-sm">GPS Proximity Matching</h4>
              <p className="text-prayas-muted text-[11px] leading-relaxed">
                The app prioritizes voluntary donors closest to your specified hospital (e.g. Ramakrishna Mission Sevashrama, District Hospital Mathura, or Agra).
              </p>
            </div>

            <div className="p-5 rounded-xl border border-prayas-rule bg-prayas-stone space-y-2">
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-prayas-ink text-sm">Live Arrival Confirmation</h4>
              <p className="text-prayas-muted text-[11px] leading-relaxed">
                The patient’s attendant can see in real time when a voluntary donor confirms and is on their way to the hospital blood bank.
              </p>
            </div>
          </div>

          {/* 3-Step Process for Raising Request on Mobile App */}
          <div className="rounded-2xl border border-prayas-rule bg-slate-50 p-6 sm:p-8 space-y-6">
            <h3 className="font-serif text-lg font-bold text-prayas-ink flex items-center gap-2">
              <span>How to Submit a Blood Request on the Prayas App</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
                <span className="w-7 h-7 rounded-full bg-red-700 text-white font-bold flex items-center justify-center text-xs">
                  1
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Install Prayas App</h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Download the free <strong>Prayas Sanstha</strong> app from the Google Play Store or Apple App Store.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
                <span className="w-7 h-7 rounded-full bg-red-700 text-white font-bold flex items-center justify-center text-xs">
                  2
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Tap 'Blood Request'</h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Tap the emergency red icon on the home screen. Enter patient name, required blood group & hospital.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
                <span className="w-7 h-7 rounded-full bg-red-700 text-white font-bold flex items-center justify-center text-xs">
                  3
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Instant Broadcast</h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  The system instantly pushes loud notifications to all nearby matching donors.
                </p>
              </div>
            </div>

            {/* Store Download Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://play.google.com/store"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-[#1C2421] text-white hover:bg-black transition-all font-bold text-xs shadow-md group"
              >
                <svg className="w-5 h-5 fill-current text-red-400 shrink-0" viewBox="0 0 24 24">
                  <path d="M3.609 1.814L13.793 12 3.61 22.186c-.365-.337-.61-.83-.61-1.397V3.211c0-.567.245-1.06.61-1.397zM15.207 13.414l2.766 2.766-13.064 7.542 10.298-10.308zM15.207 10.586L4.909.278l13.064 7.542-2.766 2.766zM16.621 12l3.77-2.178c.811-.468.811-1.233 0-1.701l-1.004-.58L16.621 12zm0 0l2.766 4.459 1.004-.58c.811-.468.811-1.233 0-1.701L16.621 12z" />
                </svg>
                <div className="text-left leading-tight">
                  <div className="text-[10px] text-red-300 uppercase tracking-wider font-semibold">GET IT ON</div>
                  <div className="text-sm font-bold">Google Play (Android)</div>
                </div>
              </a>

              <a
                href="https://www.apple.com/app-store/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-[#1C2421] text-white hover:bg-black transition-all font-bold text-xs shadow-md group"
              >
                <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.66-.99 1.73-.86 2.76 1.01.08 2.05-.51 2.59-1.26z" />
                </svg>
                <div className="text-left leading-tight">
                  <div className="text-[10px] text-red-300 uppercase tracking-wider font-semibold">Download on the</div>
                  <div className="text-sm font-bold">App Store (iOS)</div>
                </div>
              </a>

              <a
                href="prayas://blood-request"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-red-700 text-white hover:bg-red-800 transition-all font-bold text-xs shadow-md"
              >
                <Smartphone className="w-4 h-4" />
                <span>Open Request in Prayas App</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
