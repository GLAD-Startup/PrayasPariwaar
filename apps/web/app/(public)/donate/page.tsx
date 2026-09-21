"use client";

import { useState, useEffect, Suspense } from "react";
import Script from "next/script";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Heart,
  ShieldCheck,
  CheckCircle2,
  Lock,
  GraduationCap,
  Award,
  BookOpen,
  Copy,
  Check,
  Droplet,
  Trees,
  Stethoscope,
  Sparkles,
  QrCode,
  Building2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Quick suggested amounts with clear impact indicators
const SUGGESTED_AMOUNTS = [
  { amount: 500, label: "Study Kit & Jal Jeev Bowls", icon: "📚" },
  { amount: 1000, label: "1 Mo. Tuition & Milk", icon: "🥛" },
  { amount: 2500, label: "Jal Jeev & 5 Tree Guards", icon: "🌳" },
  { amount: 5000, label: "Vocational Sewing Kit", icon: "🧵" },
  { amount: 11000, label: "Oxygen & Hospital Bed Loan", icon: "🛏️" },
  { amount: 25000, label: "Solar Smart Classroom Hub", icon: "☀️" },
];

const CAUSES = [
  {
    id: "education",
    shortLabel: "Education",
    title: "Education (Child Pathshalas & Student Sponsorship)",
    desc: "Free evening study centers, tuition fees, school bags, textbooks, and teacher honorariums.",
    icon: GraduationCap,
    badge: "Most Popular",
  },
  {
    id: "general-sponsor",
    shortLabel: "General Sponsor",
    title: "General Sponsor (Where Most Needed / Nishkam Seva Fund)",
    desc: "Deployed dynamically across urgent medical emergencies, daily nutrition, and immediate seva calls.",
    icon: Sparkles,
    badge: "Flexible Seva",
  },
  {
    id: "jal-jeev",
    shortLabel: "Jal Jeev Seva",
    title: "Jal Jeev Seva (Water Bowls, Bird Feeders & Animal Welfare)",
    desc: "Installing summer clean water stations, clay bird feeders, cow fodder, and injured animal care.",
    icon: Droplet,
    badge: "Compassion",
  },
  {
    id: "vocational",
    shortLabel: "Vocational Training",
    title: "Vocational Training & Women Skill Centers",
    desc: "Practical skill training, sewing machines, computer literacy, and artisan self-reliance workshops.",
    icon: Award,
    badge: "Livelihood",
  },
  {
    id: "medical-blood",
    shortLabel: "Medical & Blood",
    title: "Emergency Blood Coordination & Medical Equipment Bank",
    desc: "24/7 volunteer blood matching, free oxygen concentrators, hospital beds, and patient aids.",
    icon: Stethoscope,
    badge: "Life-Saving",
  },
  {
    id: "vrindavan-harit-kranti",
    shortLabel: "Tree Plantation",
    title: "Vrindavan Harit Kranti (Sacred Native Tree Plantation)",
    desc: "Planting and guarding indigenous Neem, Peepal, and Kadamba groves along Braj Parikrama.",
    icon: Trees,
    badge: "Ecology",
  },
  {
    id: "others",
    shortLabel: "Other Seva",
    title: "Other Seva Initiatives (Senior Care & Relief Drives)",
    desc: "Winter blanket distribution, rural health clinics, widow ashram assistance, and disaster relief.",
    icon: Heart,
    badge: "Grassroots",
  },
];

export default function DonatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] py-16 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-prayas-muted font-sans">
              Loading Seva Donation Portal...
            </p>
          </div>
        </div>
      }
    >
      <DonateForm />
    </Suspense>
  );
}

function DonateForm() {
  const searchParams = useSearchParams();
  const initialProject = searchParams?.get("project") || "";
  const initialAmount = searchParams?.get("amount") || "";

  // The primary donation amount: freely typed by user without forced pre-fed locks
  const [typedAmount, setTypedAmount] = useState<string>(
    initialAmount ? String(initialAmount) : "1000"
  );
  const [frequency, setFrequency] = useState<"ONE_TIME" | "MONTHLY">("ONE_TIME");
  const [cause, setCause] = useState<string>("Education (Child Pathshalas & Student Sponsorship)");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [donorAddress, setDonorAddress] = useState("");
  const [isDedication, setIsDedication] = useState(false);
  const [dedicationNote, setDedicationNote] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [donationSuccess, setDonationSuccess] = useState<any>(null);

  useEffect(() => {
    if (initialAmount) {
      setTypedAmount(String(initialAmount));
    }
    if (initialProject === "vrindavan-harit-kranti") {
      setCause("Vrindavan Harit Kranti (Sacred Native Tree Plantation)");
    } else if (
      initialProject === "jan-swasthya-raksha" ||
      initialProject === "medical-equipment" ||
      initialProject === "blood-desk"
    ) {
      setCause("Emergency Blood Coordination & Medical Equipment Bank");
    } else if (
      initialProject === "aashayein-education" ||
      initialProject === "education"
    ) {
      setCause("Education (Child Pathshalas & Student Sponsorship)");
    } else if (initialProject === "jal-jeev" || initialProject === "jaljeev") {
      setCause("Jal Jeev Seva (Water Bowls, Bird Feeders & Animal Welfare)");
    } else if (initialProject === "vocational" || initialProject === "skill") {
      setCause("Vocational Training & Women Skill Centers");
    } else if (initialProject === "general" || initialProject === "general-sponsor") {
      setCause("General Sponsor (Where Most Needed / Nishkam Seva Fund)");
    } else if (initialProject === "others") {
      setCause("Other Seva Initiatives (Senior Care & Relief Drives)");
    }
  }, [initialProject, initialAmount]);

  const parsedAmount = Math.max(0, parseInt(typedAmount, 10) || 0);

  // Dynamic impact descriptor based on whatever amount and motto the user has selected
  const getImpactDescription = (amt: number, selectedCause: string) => {
    if (amt <= 0) return "Please enter any donation amount to see its grassroots impact.";
    if (amt < 500) {
      return `₹${amt.toLocaleString("en-IN")} goes directly towards immediate grassroots seva supplies and daily seva in Vrindavan.`;
    }
    if (amt < 1000) {
      if (selectedCause.includes("Jal Jeev")) {
        return `₹${amt.toLocaleString("en-IN")} installs 5 clean drinking water troughs and hanging bird clay bowls across Parikrama Marg.`;
      }
      if (selectedCause.includes("Vocational")) {
        return `₹${amt.toLocaleString("en-IN")} provides tailoring practice fabric, threads, and stationery kits for women trainees.`;
      }
      return `₹${amt.toLocaleString("en-IN")} provides complete textbook bundles, notebooks, and learning slates for a child in our evening study center.`;
    }
    if (amt < 2500) {
      if (selectedCause.includes("Jal Jeev")) {
        return `₹${amt.toLocaleString("en-IN")} sponsors 1 month of fresh green fodder, jaggery, and medical care for Gaushala cows and stray animals.`;
      }
      if (selectedCause.includes("Vocational")) {
        return `₹${amt.toLocaleString("en-IN")} sponsors 1 month of certified vocational computer literacy training for an aspiring village youth.`;
      }
      return `₹${amt.toLocaleString("en-IN")} funds 1 full month of comprehensive evening tutoring, school bags, and daily nutritious snacks for a student.`;
    }
    if (amt < 5000) {
      if (selectedCause.includes("Vocational")) {
        return `₹${amt.toLocaleString("en-IN")} funds a complete heavy-duty sewing machine kit for a graduate woman to earn self-sufficient income.`;
      }
      if (selectedCause.includes("Jal Jeev")) {
        return `₹${amt.toLocaleString("en-IN")} builds a permanent cemented cattle drinking trough and provides seasonal bird grain for 3 months.`;
      }
      return `₹${amt.toLocaleString("en-IN")} plants and protects 5 native Neem and Peepal saplings with custom iron cages along Braj Parikrama Marg.`;
    }
    if (amt < 10000) {
      if (selectedCause.includes("Vocational")) {
        return `₹${amt.toLocaleString("en-IN")} equips a local village skill center with 2 sewing machines and tailoring training tables.`;
      }
      return `₹${amt.toLocaleString("en-IN")} sponsors free diagnostic screenings, blood tests, and prescription spectacles for 25+ elderly rural villagers.`;
    }
    if (amt < 25000) {
      return `₹${amt.toLocaleString("en-IN")} maintains and delivers hospital Fowler beds and 10L oxygen concentrators to homebound patients with zero rental fee.`;
    }
    return `₹${amt.toLocaleString("en-IN")} powers a solar smart classroom hub or full vocational training workshop for over 60 village children and women.`;
  };

  const copyToClipboard = (text: string, key: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (parsedAmount < 1) {
      setErrorMessage("Please enter a donation amount of at least ₹1.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      // 1. Amount in paise (1 INR = 100 paise)
      const amountInPaise = Math.round(parsedAmount * 100);

      // 2. Call backend order creation endpoint
      const res = await apiFetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          frequency,
          donorName,
          donorEmail,
          donorPhone,
          projectOrCause: cause,
          notes: {
            panNumber,
            donorAddress,
            dedicationNote: isDedication ? dedicationNote : undefined,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.order_id) {
        throw new Error(data.error || "Failed to initialize payment order with gateway");
      }

      // If in development sandbox fallback
      if (data.isSimulated) {
        const testPaymentId = `pay_sandbox_${Date.now()}`;
        const testSig = `sandbox_sig_${data.order_id}`;

        const verifyRes = await apiFetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: data.order_id,
            razorpay_payment_id: testPaymentId,
            razorpay_signature: testSig,
          }),
        });

        const verifyData = await verifyRes.json();
        if (!verifyRes.ok || !verifyData.success) {
          throw new Error(verifyData.error || "Payment verification failed.");
        }

        setDonationSuccess({
          paymentId: testPaymentId,
          orderId: data.order_id,
          receipt: verifyData.receipt || data.receipt,
          amount: parsedAmount,
          donorName,
          cause,
          isDevSandbox: true,
          authWarning: data.authWarning,
        });
        setLoading(false);
        return;
      }

      if (typeof window !== "undefined" && window.Razorpay) {
        const options = {
          key: data.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_Tbsbstm4t3B2Ho",
          amount: data.amount,
          currency: data.currency || "INR",
          name: "Prayas Pariwaar",
          description: `Nishkam Seva: ${cause}`,
          image: "https://gladstudio.net/prayas/icon.png",
          order_id: data.order_id,
          prefill: {
            name: donorName,
            email: donorEmail,
            contact: donorPhone,
          },
          theme: {
            color: "#2E5339",
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
              setErrorMessage("Payment was not completed. You can retry or use Direct Bank Wire.");
            },
          },
          handler: async function (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) {
            try {
              const verifyRes = await apiFetch("/api/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              const verifyData = await verifyRes.json();
              if (!verifyRes.ok || !verifyData.success) {
                throw new Error(verifyData.error || "Cryptographic signature verification failed.");
              }

              setDonationSuccess({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                receipt: verifyData.receipt || data.receipt,
                amount: parsedAmount,
                donorName,
                cause,
              });
            } catch (verifyErr: any) {
              setErrorMessage(
                verifyErr.message || "Payment verification failed on server. Please contact support."
              );
            } finally {
              setLoading(false);
            }
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (failResponse: any) {
          setLoading(false);
          const reason =
            failResponse.error?.description ||
            failResponse.error?.reason ||
            "Transaction declined.";
          setErrorMessage(`Payment Failed: ${reason}`);
        });

        rzp.open();
      } else {
        throw new Error("Razorpay Checkout SDK is still loading. Please try again in a few seconds.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initiate payment. Please try again or use direct bank transfer.");
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="space-y-10 sm:space-y-14 pb-20 max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 pt-6 sm:pt-10">
        {/* ========================================================================= */}
        {/* 1. UNIFIED PORTAL MASTHEAD & REASSURANCE BANNER                           */}
        {/* ========================================================================= */}
        <div className="border-b border-prayas-rule pb-6 sm:pb-8 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Official Seva Donation Portal</span>
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold">
              100% Nishkam Seva • 0% Admin Deductions
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold hidden sm:inline-block">
              Section 80G & 12A Certified
            </span>
          </div>

          <h1 className="font-serif text-2xl xs:text-3xl sm:text-4xl 2xl:text-5xl font-bold text-prayas-ink leading-tight">
            Support Grassroots Seva in Vrindavan
          </h1>
          <p className="text-sm sm:text-base 2xl:text-lg text-prayas-muted max-w-3xl leading-relaxed">
            Every rupee you contribute directly reaches our rural students, emergency patients, free medical equipment bank, and sacred tree groves. Operational and administrative overheads are funded 100% by trustees.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 2. SUCCESS CONFIRMATION MODAL / PANEL                                     */}
        {/* ========================================================================= */}
        {donationSuccess ? (
          <div className="border-2 border-emerald-300 bg-emerald-50/80 rounded-2xl p-8 sm:p-12 shadow-card text-center space-y-6 max-w-2xl mx-auto">
            <CheckCircle2 className="w-16 h-16 text-[#2E5339] mx-auto" />
            <div className="space-y-2">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-emerald-950">
                Thank You for Your Sacred Contribution, {donationSuccess.donorName || "Kind Sevadar"}!
              </h2>
              <p className="text-sm text-emerald-900 leading-relaxed max-w-lg mx-auto">
                Your donation of <strong>₹{donationSuccess.amount.toLocaleString("en-IN")}</strong> towards <em>{donationSuccess.cause}</em> has been securely received and recorded in our official ledger.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-emerald-200 bg-white text-xs text-left space-y-2 font-mono text-prayas-ink shadow-sm">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
                <span className="text-emerald-800 font-bold font-sans flex items-center gap-1.5 text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Verified 80G Tax Exemption Receipt
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                  CONFIRMED
                </span>
              </div>
              <p><strong>Receipt No:</strong> {donationSuccess.receipt || "PRY-SEVA-80G"}</p>
              <p><strong>Order Reference:</strong> {donationSuccess.orderId}</p>
              <p><strong>Transaction Ref:</strong> {donationSuccess.paymentId}</p>
              <p><strong>Official Certificate:</strong> Dispatched to {donorEmail || "your email"}</p>
              <p className="text-[11px] text-prayas-muted pt-2 border-t border-slate-100 font-sans">
                <strong>Registered Society:</strong> Prayas Pariwaar (Reg. 142/2006-07 Mathura, UP) • 12A & 80G Empanelled
              </p>
            </div>

            {donationSuccess.isDevSandbox && (
              <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl text-amber-900 text-xs text-left space-y-1">
                <p className="font-bold flex items-center gap-1 text-amber-800">
                  <span>ℹ️ Developer Sandbox Mode Active</span>
                </p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  The test key provided in <code>.env</code> was rejected by Razorpay's live servers. The transaction was simulated and recorded in your <strong>Admin Panel Ledger</strong>. To enable live bank gateway checkout, update <code>RAZORPAY_KEY_ID</code> and <code>RAZORPAY_KEY_SECRET</code> in <code>.env</code> with active Razorpay credentials.
                </p>
              </div>
            )}

            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              {donationSuccess.receipt && (
                <Link
                  href={`/receipt/${donationSuccess.receipt}`}
                  className="px-6 py-2.5 rounded-lg font-bold bg-[#2E5339] text-white hover:bg-[#23432b] text-xs transition-colors shadow-subtle inline-flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>View & Print Official 80G Receipt →</span>
                </Link>
              )}
              <button
                onClick={() => setDonationSuccess(null)}
                className="px-5 py-2.5 rounded-lg font-semibold bg-white text-stone-700 hover:bg-stone-100 border border-stone-300 text-xs transition-colors shadow-2xs"
              >
                Make Another Contribution
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* ===================================================================== */}
            {/* LEFT COLUMN: PRIMARY DONATION FORM (TYPE-YOUR-OWN AMOUNT FIRST)        */}
            {/* ===================================================================== */}
            <div className="lg:col-span-7">
              <form
                onSubmit={handleDonate}
                className="border border-prayas-rule bg-white rounded-2xl p-6 sm:p-8 shadow-card space-y-7 text-xs"
              >
                {errorMessage && (
                  <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 text-red-800 text-xs font-medium">
                    {errorMessage}
                  </div>
                )}

                {/* 1. FREQUENCY SELECTOR */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-prayas-ink text-sm block">
                      1. Contribution Frequency
                    </label>
                    <span className="text-[11px] text-prayas-muted">
                      Cancel anytime
                    </span>
                  </div>
                  <div className="flex bg-prayas-stone p-1.5 rounded-xl border border-prayas-rule">
                    <button
                      type="button"
                      onClick={() => setFrequency("ONE_TIME")}
                      className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${
                        frequency === "ONE_TIME"
                          ? "bg-[#2E5339] text-white shadow-sm"
                          : "text-prayas-muted hover:text-prayas-ink"
                      }`}
                    >
                      One-Time Seva
                    </button>
                    <button
                      type="button"
                      onClick={() => setFrequency("MONTHLY")}
                      className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${
                        frequency === "MONTHLY"
                          ? "bg-[#2E5339] text-white shadow-sm"
                          : "text-prayas-muted hover:text-prayas-ink"
                      }`}
                    >
                      Monthly Recurring Seva
                    </button>
                  </div>
                </div>

                {/* ================================================================= */}
                {/* 2. CUSTOM AMOUNT INPUT: TYPED DIRECTLY (NO FORCED PRE-FED BUTTONS) */}
                {/* ================================================================= */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-prayas-ink text-sm block">
                      2. Enter Your Donation Amount (INR ₹) *
                    </label>
                    <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Type any custom amount
                    </span>
                  </div>

                  {/* Primary Large Typed Amount Input */}
                  <div className="relative rounded-2xl border-2 border-[#2E5339]/50 bg-emerald-50/20 focus-within:border-[#2E5339] focus-within:ring-4 focus-within:ring-emerald-100 transition-all p-3 sm:p-4 shadow-inner">
                    <div className="flex items-center gap-3">
                      <span className="font-serif text-2xl sm:text-3xl font-bold text-[#2E5339] select-none">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Type any amount, e.g. 2500"
                        value={typedAmount}
                        onChange={(e) => setTypedAmount(e.target.value)}
                        className="w-full bg-transparent font-serif text-2xl sm:text-3xl font-bold text-prayas-ink placeholder:text-stone-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Dynamic Impact Indicator */}
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-950 flex items-start gap-2 text-xs">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong>Grassroots Impact:</strong>{" "}
                      {getImpactDescription(parsedAmount, cause)}
                    </p>
                  </div>

                  {/* Quick-suggestion chips (User can click to populate, or ignore and keep typing) */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] text-prayas-muted font-semibold block">
                      Quick suggestions (optional):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {SUGGESTED_AMOUNTS.map((item) => (
                        <button
                          key={item.amount}
                          type="button"
                          onClick={() => setTypedAmount(String(item.amount))}
                          className={`p-2 rounded-lg text-left border text-xs transition-all ${
                            parsedAmount === item.amount
                              ? "bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/40 font-bold"
                              : "bg-prayas-stone/70 border-prayas-rule hover:bg-prayas-stone"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-prayas-ink">
                              ₹{item.amount.toLocaleString("en-IN")}
                            </span>
                            <span className="text-xs">{item.icon}</span>
                          </div>
                          <span className="text-[10px] text-prayas-muted block truncate mt-0.5">
                            {item.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ================================================================= */}
                {/* 3. SEVA MOTTO / CONTRIBUTION ALLOCATION SELECTOR                  */}
                {/* ================================================================= */}
                <div className="space-y-3 border-t border-prayas-rule pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-bold text-prayas-ink text-sm block">
                        3. Seva Motto / Contribution Purpose *
                      </label>
                      <p className="text-[11px] text-prayas-muted mt-0.5">
                        Choose the primary initiative your donation directly supports:
                      </p>
                    </div>
                  </div>

                  {/* Interactive Motto Card Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {CAUSES.map((c) => {
                      const isSelected = cause === c.title;
                      const IconComponent = c.icon;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setCause(c.title)}
                          className={`p-3 rounded-xl text-left border transition-all relative flex flex-col justify-between ${
                            isSelected
                              ? "bg-emerald-50/90 border-emerald-600 ring-2 ring-emerald-500/30 shadow-xs"
                              : "bg-white border-prayas-rule/80 hover:bg-prayas-stone/60 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5 w-full">
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? "bg-emerald-700 text-white"
                                    : "bg-stone-100 text-[#2E5339]"
                                }`}
                              >
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-xs text-prayas-ink truncate">
                                {c.shortLabel}
                              </span>
                            </div>

                            {isSelected ? (
                              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                <Check className="w-2.5 h-2.5" />
                              </span>
                            ) : (
                              <span className="text-[9px] font-semibold text-slate-500 bg-stone-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                                {c.badge}
                              </span>
                            )}
                          </div>

                          <p className="text-[10px] text-prayas-muted leading-relaxed line-clamp-2">
                            {c.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Accessible fallback select dropdown */}
                  <div className="pt-1">
                    <label htmlFor="cause-select" className="text-[10px] text-prayas-muted font-semibold block mb-1">
                      Selected Motto Name (appears on official receipt):
                    </label>
                    <select
                      id="cause-select"
                      value={cause}
                      onChange={(e) => setCause(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/40 text-prayas-ink font-semibold text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    >
                      {CAUSES.map((c) => (
                        <option key={c.id} value={c.title}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ================================================================= */}
                {/* 4. DONOR DETAILS & TAX EXEMPTION INFORMATION                      */}
                {/* ================================================================= */}
                <div className="space-y-4 border-t border-prayas-rule pt-5">
                  <div>
                    <label className="font-bold text-prayas-ink text-sm block">
                      4. Donor Information (For 80G Tax Exemption Receipt)
                    </label>
                    <p className="text-[11px] text-prayas-muted">
                      Under Indian Income Tax Act, donation receipts must include donor identity.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="font-bold text-prayas-ink text-[11px]">
                        Full Legal Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Chandra Sharma"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-prayas-ink text-[11px]">
                        Email Address (For Official 80G Receipt) *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. ramesh@example.com"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="font-bold text-prayas-ink text-[11px]">
                        Mobile / WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +91 98971 23456"
                        value={donorPhone}
                        onChange={(e) => setDonorPhone(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-prayas-ink text-[11px]">
                          PAN Card Number
                        </label>
                        <span className="text-[10px] text-emerald-800 font-semibold">
                          Required for 80G Benefit
                        </span>
                      </div>
                      <input
                        type="text"
                        maxLength={10}
                        placeholder="e.g. ABCDE1234F"
                        value={panNumber}
                        onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                        className="w-full p-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 font-mono uppercase"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-prayas-ink text-[11px]">
                      Postal Address / City (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 14, Mathura Road, Agra, UP"
                      value={donorAddress}
                      onChange={(e) => setDonorAddress(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>

                  {/* Optional Dedication / In Honor */}
                  <div className="pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-[11px] text-prayas-ink font-semibold">
                      <input
                        type="checkbox"
                        checked={isDedication}
                        onChange={(e) => setIsDedication(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-400"
                      />
                      <span>Dedicate this donation in memory or honor of someone special</span>
                    </label>

                    {isDedication && (
                      <div className="mt-2 space-y-1">
                        <input
                          type="text"
                          placeholder="e.g. In loving memory of my grandparents / on birthday of Arnav"
                          value={dedicationNote}
                          onChange={(e) => setDedicationNote(e.target.value)}
                          className="w-full p-2.5 rounded-lg border border-prayas-rule bg-white text-prayas-ink text-xs focus:outline-none focus:ring-2 focus:ring-emerald-200"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* ================================================================= */}
                {/* 5. SUBMIT PAYMENT BUTTON                                          */}
                {/* ================================================================= */}
                <div className="pt-3 border-t border-prayas-rule space-y-3">
                  <button
                    type="submit"
                    disabled={loading || parsedAmount < 1}
                    className="w-full py-4 rounded-xl text-sm sm:text-base font-bold bg-[#2E5339] text-white hover:bg-[#23432b] transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    {loading
                      ? "Connecting to Razorpay Gateway..."
                      : `Donate ₹${parsedAmount.toLocaleString("en-IN")} via UPI / Card / NetBanking`}
                  </button>

                  <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-prayas-muted text-center pt-1">
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      256-Bit SSL Encrypted
                    </span>
                    <span>•</span>
                    <span>Supports GPay, PhonePe, Paytm, Cards & NetBanking</span>
                    <span>•</span>
                    <span className="text-emerald-800 font-semibold">Instant 80G Receipt</span>
                  </div>
                </div>
              </form>
            </div>

            {/* ===================================================================== */}
            {/* RIGHT COLUMN: DIRECT BANK TRANSFER, UPI QR & TRUST BADGES              */}
            {/* ===================================================================== */}
            <div className="lg:col-span-5 space-y-6">
              {/* Direct Bank Transfer (SBI) with 1-Click Copy */}
              <div className="border border-prayas-rule bg-prayas-stone rounded-2xl p-6 shadow-card space-y-4">
                <div className="flex items-center justify-between border-b border-prayas-rule pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#2E5339]" />
                    <h3 className="font-serif text-base font-bold text-prayas-ink">
                      Direct Bank Wire (NEFT / RTGS / IMPS)
                    </h3>
                  </div>
                  <span className="text-[10px] uppercase font-bold bg-white text-emerald-800 px-2 py-0.5 rounded border border-prayas-rule">
                    Union Bank of India
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-prayas-ink">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-prayas-rule/60">
                    <div>
                      <span className="text-[10px] text-prayas-muted block">Beneficiary Name</span>
                      <strong className="font-mono">PRAYAS SAMITI</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("PRAYAS SAMITI", "name")}
                      className="p-1 text-prayas-muted hover:text-emerald-700"
                      title="Copy Name"
                    >
                      {copiedKey === "name" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-prayas-rule/60">
                    <div>
                      <span className="text-[10px] text-prayas-muted block">Account Number</span>
                      <strong className="font-mono text-sm">522902010905814</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("522902010905814", "acc")}
                      className="p-1 text-prayas-muted hover:text-emerald-700"
                      title="Copy Account Number"
                    >
                      {copiedKey === "acc" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-prayas-rule/60">
                    <div>
                      <span className="text-[10px] text-prayas-muted block">IFSC Code</span>
                      <strong className="font-mono">UBIN0552291</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("UBIN0552291", "ifsc")}
                      className="p-1 text-prayas-muted hover:text-emerald-700"
                      title="Copy IFSC Code"
                    >
                      {copiedKey === "ifsc" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-prayas-rule/60">
                    <div>
                      <span className="text-[10px] text-prayas-muted block">Official UPI ID</span>
                      <strong className="font-mono text-emerald-800">prayas.samiti@unionbank</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("prayas.samiti@unionbank", "upi")}
                      className="p-1 text-prayas-muted hover:text-emerald-700"
                      title="Copy UPI ID"
                    >
                      {copiedKey === "upi" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="p-2 rounded-lg bg-stone-50 border border-prayas-rule/40 text-[11px] text-prayas-muted">
                    <span><strong>Bank & Branch:</strong> Union Bank of India, Vrindavan, Mathura (UP)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-prayas-rule flex items-center justify-between">
                  <span className="text-[11px] text-prayas-muted">
                    Need instant QR code scan?
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowQrModal(!showQrModal)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-50 text-xs font-bold text-emerald-800 border border-emerald-300 transition-colors shadow-2xs"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{showQrModal ? "Hide QR" : "Show UPI QR"}</span>
                  </button>
                </div>

                {/* Expandable UPI QR box */}
                {showQrModal && (
                  <div className="p-4 rounded-xl bg-white border-2 border-emerald-500/40 text-center space-y-2 animate-in fade-in duration-200">
                    <div className="w-40 h-40 mx-auto bg-stone-100 rounded-xl border border-prayas-rule flex flex-col items-center justify-center p-3">
                      <QrCode className="w-24 h-24 text-stone-800" />
                      <span className="text-[9px] font-mono text-prayas-muted mt-1">prayas.samiti@unionbank</span>
                    </div>
                    <p className="text-[11px] text-prayas-muted leading-relaxed">
                      Scan using Google Pay, PhonePe, Paytm, or BHIM. After payment, WhatsApp UTR to <strong>+91 99270 81650</strong>.
                    </p>
                  </div>
                )}
              </div>

              {/* Institutional Trust & Tax Exemption Badges */}
              <div className="border border-prayas-rule bg-white rounded-2xl p-6 shadow-card space-y-4 text-xs">
                <h4 className="font-serif text-sm font-bold text-prayas-ink border-b border-prayas-rule pb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Statutory Non-Profit Credentials
                </h4>

                <ul className="space-y-3 text-prayas-ink">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-prayas-ink">Section 80G Tax Exemption</strong>
                      <span className="text-prayas-muted text-[11px] leading-relaxed block">
                        50% tax deduction on taxable income under Section 80G of the Income Tax Act 1961.
                      </span>
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-prayas-ink">Section 12A Non-Profit Registration</strong>
                      <span className="text-prayas-muted text-[11px] leading-relaxed block">
                        Societies Registration Act XXI of 1860 (Reg. No: 142/2006-07 Mathura).
                      </span>
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-prayas-ink">NITI Aayog NGO Darpan Empanelled</strong>
                      <span className="text-prayas-muted text-[11px] leading-relaxed block font-mono">
                        Unique Identification: UP/2017/0154210
                      </span>
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-prayas-ink">100% Nishkam Seva Allocation</strong>
                      <span className="text-prayas-muted text-[11px] leading-relaxed block">
                        Zero administrative overhead deducted from donor contributions. Trustees personally fund all operational bills.
                      </span>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Direct Help & Seva Desk Contact */}
              <div className="p-4 rounded-xl bg-stone-100 border border-prayas-rule text-xs space-y-1">
                <span className="font-bold text-prayas-ink block">Need Assistance with Your Contribution?</span>
                <p className="text-prayas-muted text-[11px] leading-relaxed">
                  Call our Vrindavan Seva Desk at <strong>+91 99270 81650</strong> or email <strong>av.prayas@gmail.com</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 6. TRANSPARENT DONATION FREQUENTLY ASKED QUESTIONS                        */}
        {/* ========================================================================= */}
        <div className="border-t border-prayas-rule pt-10 sm:pt-14 space-y-6">
          <div className="max-w-2xl">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-prayas-ink">
              Frequently Asked Questions About Donating
            </h3>
            <p className="text-xs sm:text-sm text-prayas-muted mt-1">
              Clear answers regarding tax exemption, receipt generation, and utilization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                q: "Can I donate any custom amount?",
                a: "Yes! There are no restrictions or forced pre-fed tiers. You can type any custom amount (e.g. ₹500, ₹2,100, ₹15,000, or ₹51,000) directly into the amount input field.",
              },
              {
                q: "Will I receive an 80G tax exemption receipt?",
                a: "Yes, instantly. As soon as your online contribution completes, an official donation receipt with Section 80G tax exemption details is generated and dispatched to your email.",
              },
              {
                q: "Why is PAN number requested?",
                a: "Under current Indian Income Tax regulations, providing your PAN allows Prayas Pariwaar to submit Form 10BD so that your 80G deduction appears directly in your Annual Information Statement (AIS).",
              },
              {
                q: "How are administrative expenses funded?",
                a: "Prayas Pariwaar follows a radical 100% Nishkam Seva model. 100% of public donations go directly to program activities (books, saplings, oxygen machines, medicines). Founding trustees personally fund all electricity, telephone, and logistical expenses.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl border border-prayas-rule bg-white shadow-2xs space-y-2"
              >
                <h4 className="font-serif font-bold text-sm text-prayas-ink flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-[#2E5339] shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs text-prayas-muted leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
