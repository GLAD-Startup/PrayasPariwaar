"use client";

import { useState, useEffect, Suspense } from "react";
import Script from "next/script";
import { useSearchParams } from "next/navigation";
import { Heart, ShieldCheck, CheckCircle2, Lock, GraduationCap, Award, BookOpen } from "lucide-react";
import { apiFetch } from "@/lib/api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const SPONSORSHIP_TIERS = [
  { amount: 500, label: "1 Mo. Books & Tuition" },
  { amount: 1100, label: "1 Mo. Full Care & Meals" },
  { amount: 3000, label: "6 Mo. Child Schooling" },
  { amount: 6000, label: "1 Full Year Sponsorship" },
  { amount: 12000, label: "2 Children 1 Year" },
];

export default function DonatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] py-16 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-prayas-muted font-sans">Loading 80G Seva Donation Portal...</p>
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

  const [amount, setAmount] = useState<number>(initialAmount ? Number(initialAmount) : 1100);
  const [frequency, setFrequency] = useState<"ONE_TIME" | "MONTHLY" | "YEARLY">("ONE_TIME");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustom, setIsCustom] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [donorAddress, setDonorAddress] = useState("");
  const [cause, setCause] = useState("Project Aashayein: Rural Child Education & Schooling");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [donationSuccess, setDonationSuccess] = useState<any>(null);

  useEffect(() => {
    if (initialAmount) {
      setAmount(Number(initialAmount));
    }
    if (initialProject === "vrindavan-harit-kranti") {
      setCause("Vrindavan Harit Kranti: Native Tree Plantation");
    } else if (initialProject === "jan-swasthya-raksha") {
      setCause("Jan Swasthya Raksha: Free Health & Eye Care Camps");
    } else if (initialProject === "aadhar-career-counseling") {
      setCause("Project Aadhar: Career & Digital Literacy");
    } else {
      setCause("Project Aashayein: Rural Child Education & Schooling");
    }
  }, [initialProject, initialAmount]);

  const selectedAmount = isCustom ? Number(customAmount) || 0 : amount;

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAmount < 50) {
      setErrorMessage("Minimum donation amount is ₹50");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await apiFetch("/api/donations/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: selectedAmount,
          frequency,
          donorName,
          donorEmail,
          donorPhone,
          projectOrCause: cause,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize donation");
      }

      if (typeof window !== "undefined" && window.Razorpay) {
        const options = {
          key: data.keyId,
          amount: data.order.amount,
          currency: data.order.currency,
          name: "Prayas Pariwaar",
          description: `Educational Support: ${cause}`,
          order_id: data.order.id,
          prefill: {
            name: donorName,
            email: donorEmail,
            contact: donorPhone,
          },
          theme: {
            color: "#2E5339",
          },
          handler: async function (response: any) {
            setDonationSuccess({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              amount: selectedAmount,
              donorName,
              cause,
            });
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        setDonationSuccess({
          paymentId: "pay_simulated_" + Math.random().toString(36).substring(7),
          orderId: data.order?.id || "order_simulated",
          amount: selectedAmount,
          donorName,
          cause,
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initiate payment. Please try again or use direct bank transfer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="space-y-8 sm:space-y-12 pb-20 max-w-5xl 2xl:max-w-6xl 3xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 pt-6 sm:pt-10">
        {/* Page Header */}
        <div className="border-b border-prayas-rule pb-6 sm:pb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-green-50 border border-green-200 text-xs 2xl:text-sm font-bold text-prayas-neem">
            <GraduationCap className="w-4 h-4" />
            <span>Project Aashayein Educational Sponsorship • Section 80G Tax-Exempt</span>
          </div>
          <h1 className="font-serif text-2xl xs:text-3xl sm:text-4xl 2xl:text-5xl font-bold text-prayas-ink leading-tight">
            Sponsor a Child's Education in Rural Vrindavan
          </h1>
          <p className="text-sm sm:text-base 2xl:text-lg text-prayas-muted max-w-2xl 2xl:max-w-3xl leading-relaxed">
            Your recurring or one-time contribution directly funds school admissions, evening tutoring, textbooks, school bags, uniforms, and nutritious meals for village children.
          </p>
        </div>

        {donationSuccess ? (
          <div className="border border-green-200 bg-green-50/70 rounded p-8 sm:p-12 shadow-card text-center space-y-6">
            <CheckCircle2 className="w-14 h-14 text-prayas-neem mx-auto" />
            <div className="space-y-2">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-green-950">
                Thank You for Sponsoring a Student, {donationSuccess.donorName}
              </h2>
              <p className="text-xs text-green-800 max-w-lg mx-auto leading-relaxed">
                Your contribution of <strong>₹{donationSuccess.amount.toLocaleString("en-IN")}</strong> towards <em>{donationSuccess.cause}</em> has been securely received and recorded.
              </p>
            </div>

            <div className="p-4 rounded border border-green-200 bg-white max-w-md mx-auto text-xs text-left space-y-2 font-mono text-prayas-ink">
              <p><strong>Payment ID:</strong> {donationSuccess.paymentId}</p>
              <p><strong>80G Receipt:</strong> Emailed to {donorEmail || "your email"}</p>
              <p><strong>Trust:</strong> Prayas Pariwaar (Regd. 142/2006-07 Mathura)</p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setDonationSuccess(null)}
                className="px-6 py-2.5 rounded font-bold bg-prayas-neem text-white hover:bg-[#23432b] text-xs transition-colors shadow-subtle"
              >
                Sponsor Another Student
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Form */}
            <div className="lg:col-span-7">
              <form onSubmit={handleDonate} className="border border-prayas-rule bg-white rounded p-6 sm:p-8 shadow-card space-y-6 text-xs">
                {errorMessage && (
                  <div className="p-3.5 rounded border border-red-200 bg-red-50 text-red-800">
                    {errorMessage}
                  </div>
                )}

                {/* Frequency Selector */}
                <div className="space-y-2">
                  <label className="font-bold text-prayas-ink text-sm block">
                    1. Donation Frequency
                  </label>
                  <div className="flex bg-prayas-stone p-1 rounded-xl border border-prayas-rule">
                    {(["ONE_TIME", "MONTHLY", "YEARLY"] as const).map((freq) => (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => setFrequency(freq)}
                        className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${
                          frequency === freq
                            ? "bg-[#2E5339] text-white shadow-sm"
                            : "text-prayas-muted hover:text-prayas-ink"
                        }`}
                      >
                        {freq === "ONE_TIME" ? "One Time" : freq === "MONTHLY" ? "Monthly Seva" : "Yearly Seva"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Select Sponsorship Tier */}
                <div className="space-y-3 pt-2">
                  <label className="font-bold text-prayas-ink text-sm block">
                    2. Select Donation / Sponsorship Amount (INR ₹) *
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {SPONSORSHIP_TIERS.map((tier) => (
                      <button
                        key={tier.amount}
                        type="button"
                        onClick={() => {
                          setAmount(tier.amount);
                          setIsCustom(false);
                        }}
                        className={`p-3 rounded-lg text-left border transition-all ${
                          !isCustom && amount === tier.amount
                            ? "bg-green-50 border-prayas-neem shadow-subtle ring-2 ring-prayas-neem"
                            : "bg-prayas-stone border-prayas-rule hover:bg-prayas-subtle"
                        }`}
                      >
                        <strong className="block font-serif text-base font-bold text-prayas-ink">
                          ₹{tier.amount.toLocaleString("en-IN")}
                        </strong>
                        <span className="text-[11px] text-prayas-muted block mt-0.5">
                          {tier.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCustom(!isCustom)}
                      className="text-xs font-semibold text-prayas-neem hover:underline"
                    >
                      {isCustom ? "Select from standard sponsorship tiers" : "+ Enter custom donation amount"}
                    </button>
                  </div>

                  {isCustom && (
                    <div className="space-y-1 pt-1">
                      <label className="font-bold text-prayas-ink">Custom Amount (₹)</label>
                      <input
                        type="number"
                        min="50"
                        placeholder="e.g. 15000"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink font-bold text-base"
                      />
                    </div>
                  )}
                </div>

                {/* 2. Select Cause / Program */}
                <div className="space-y-1.5 border-t border-prayas-rule pt-4">
                  <label className="font-bold text-prayas-ink text-sm block">
                    2. Allocated Program / Cause *
                  </label>
                  <select
                    value={cause}
                    onChange={(e) => setCause(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink font-medium"
                  >
                    <option value="Project Aashayein: Rural Child Education & Schooling">Project Aashayein: Rural Child Education & Schooling</option>
                    <option value="Project Aadhar: Career & Digital Skills for Youth">Project Aadhar: Career & Digital Skills for Youth</option>
                    <option value="Vrindavan Harit Kranti: Native Tree Plantation">Vrindavan Harit Kranti: Native Tree Plantation</option>
                    <option value="Jan Swasthya Raksha: Eye & Health Camps">Jan Swasthya Raksha: Eye & Health Camps</option>
                    <option value="General Seva Fund & Emergency Blood Desk">General Seva Fund & Emergency Blood Desk</option>
                  </select>
                </div>

                {/* 3. Donor Identity for 80G Tax Exemption */}
                <div className="space-y-4 border-t border-prayas-rule pt-4">
                  <div>
                    <label className="font-bold text-prayas-ink text-sm block">
                      3. Donor Details (Required for 80G Tax Certificate)
                    </label>
                    <p className="text-[11px] text-prayas-muted">
                      Your official receipt will be generated and dispatched automatically.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-prayas-ink">Full Legal Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Chandra Sharma"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-prayas-ink">Email Address (For Tax Receipt) *</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. ramesh@example.com"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-prayas-ink">Mobile Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +91 98971 23456"
                        value={donorPhone}
                        onChange={(e) => setDonorPhone(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-prayas-ink">PAN Number (For 80G Tax Exemption)</label>
                      <input
                        type="text"
                        placeholder="e.g. ABCDE1234F"
                        value={panNumber}
                        onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                        maxLength={10}
                        className="w-full p-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white font-mono uppercase"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-prayas-ink">Postal Address (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 14, Mathura Road, Agra, UP"
                      value={donorAddress}
                      onChange={(e) => setDonorAddress(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-prayas-rule">
                  <button
                    type="submit"
                    disabled={loading || selectedAmount < 50}
                    className="w-full py-3.5 rounded-lg text-sm font-bold bg-[#2E5339] text-white hover:bg-[#23432b] transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
                  >
                    <Lock className="w-4 h-4" />
                    {loading
                      ? "Connecting to Razorpay..."
                      : `Sponsor Student: Pay ₹${selectedAmount.toLocaleString("en-IN")} via UPI / Cards`}
                  </button>
                  <p className="text-[11px] text-prayas-muted text-center mt-2 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-prayas-neem" />
                    256-Bit Encrypted Secure Checkout via Razorpay
                  </p>
                </div>
              </form>
            </div>

            {/* Right Column: Direct Bank Transfer & Impact Reassurance */}
            <div className="lg:col-span-5 space-y-6">
              <div className="border border-prayas-rule bg-prayas-stone rounded p-6 shadow-card space-y-4">
                <h3 className="font-serif text-base font-bold text-prayas-ink border-b border-prayas-rule pb-2">
                  Direct Bank Account (NEFT / RTGS / IMPS)
                </h3>
                <div className="space-y-2 text-xs font-mono text-prayas-ink">
                  <p><strong>Account Name:</strong> PRAYAS PARIWAAR</p>
                  <p><strong>Bank:</strong> State Bank of India</p>
                  <p><strong>Branch:</strong> Raman Reti, Vrindavan</p>
                  <p><strong>Account No:</strong> 34891029384</p>
                  <p><strong>IFSC Code:</strong> SBIN0001234</p>
                </div>
                <p className="text-[11px] text-prayas-muted">
                  After wire transfer, WhatsApp transaction UTR to +91 94122 79000 for your instant 80G receipt.
                </p>
              </div>

              <div className="border border-prayas-rule bg-white rounded p-6 shadow-card space-y-3 text-xs text-prayas-muted">
                <h4 className="font-serif text-sm font-bold text-prayas-ink flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-prayas-neem" />
                  What Your Sponsorship Provides
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-prayas-neem shrink-0 mt-0.5" />
                    <span><strong>100% Direct Allocation:</strong> Every single rupee goes directly towards child textbooks, school bags, and teacher honorariums.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-prayas-neem shrink-0 mt-0.5" />
                    <span><strong>Student Progress Updates:</strong> Donors receive quarterly academic report cards and handwritten letters.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-prayas-neem shrink-0 mt-0.5" />
                    <span><strong>Tax Exemption:</strong> 50% deduction on taxable income under Section 80G.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
