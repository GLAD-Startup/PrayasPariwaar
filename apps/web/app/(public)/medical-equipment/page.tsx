"use client";

import { useState, useEffect } from "react";
import {
  Stethoscope,
  Phone,
  ArrowLeft,
  ShieldCheck,
  Clock,
  MapPin,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  QrCode,
  PackageCheck,
  Truck,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

interface EquipmentItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  quantity: number;
  status: "AVAILABLE" | "LEASED" | "MAINTENANCE";
  imageUrl?: string;
}

export default function MedicalEquipmentPage() {
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Step 1: Catalog view, Step 2: App-only request instructions for selected item
  const [activeStep, setActiveStep] = useState<1 | 2>(1);
  const [selectedItem, setSelectedItem] = useState<EquipmentItem | null>(null);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/equipment");
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (e) {
      console.error("Failed to load medical equipment", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDevice = (item: EquipmentItem) => {
    setSelectedItem(item);
    setActiveStep(2);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const categories = ["ALL", "Respiratory Support", "Mobility Assistance", "Patient Beds & Care"];

  const filteredItems =
    selectedCategory === "ALL"
      ? items
      : items.filter((it) => it.category === selectedCategory);

  return (
    <div className="space-y-8 sm:space-y-12 pb-20 max-w-6xl 2xl:max-w-7xl 3xl:max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 pt-6 sm:pt-10">
      {/* 1. Masthead Header */}
      <div className="border-b border-prayas-rule pb-6 sm:pb-8 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-prayas-stone border border-prayas-rule text-xs 2xl:text-sm font-bold text-prayas-neem">
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Free Community Medical Equipment Lending Bank</span>
        </div>

        <h1 className="font-serif text-2xl xs:text-3xl sm:text-4xl 2xl:text-5xl font-bold text-prayas-ink">
          Medical Equipment Bank • Vrindavan & Mathura
        </h1>

        <p className="text-sm sm:text-base 2xl:text-lg text-prayas-muted leading-relaxed max-w-3xl 2xl:max-w-4xl">
          Prayas Pariwaar maintains a bank of critical homecare equipment — 10L oxygen concentrators, hospital beds, wheelchairs, and air mattresses — available on free temporary loan for elderly and recovering patients.
        </p>

        {/* Helpline Notice */}
        <div className="border border-prayas-rule bg-white rounded p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-subtle">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-prayas-stone border border-prayas-rule flex items-center justify-center text-prayas-neem">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-prayas-ink uppercase tracking-wider">
                Direct Equipment Dispatch Desk
              </p>
              <p className="text-xs text-prayas-muted">
                Pick up directly from our Vrindavan Seva Karyalaya or request home delivery for bedridden patients:
              </p>
            </div>
          </div>
          <a
            href="tel:+919927081650"
            className="w-full sm:w-auto px-4 py-2.5 text-center rounded-lg bg-[#2E5339] text-white text-xs font-bold hover:bg-[#23432b] transition-all shadow-sm"
            style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
          >
            Call Desk: +91 99270 81650
          </a>
        </div>
      </div>

      {/* Prominent App-Only Policy Callout Banner */}
      <div className="rounded-2xl border-2 border-emerald-600/30 bg-gradient-to-br from-emerald-950/90 via-emerald-900/90 to-[#1C2421] text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-400/40 text-emerald-200 text-xs font-bold uppercase tracking-wider">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile App Exclusive Service</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl 2xl:text-3xl font-bold leading-snug">
              Equipment Requests Are Made Exclusively via the Prayas Mobile App
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              To guarantee secure identity verification, transparent loan duration tracking, and real-time volunteer doorstep delivery across Mathura district, all equipment requests must be submitted through our official <strong>Android</strong> or <strong>iOS</strong> App.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-[11px] sm:text-xs text-emerald-200/80 pt-1 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                100% Free Service
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Verified Patient KYC
              </span>
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-400" />
                Doorstep Delivery Tracking
              </span>
            </div>
          </div>

          {/* Quick App Download Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto shrink-0">
            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 px-5 py-3 rounded-xl bg-white text-slate-950 hover:bg-emerald-50 transition-all font-bold text-xs shadow-md group"
            >
              <svg className="w-5 h-5 fill-current text-emerald-800 shrink-0" viewBox="0 0 24 24">
                <path d="M3.609 1.814L13.793 12 3.61 22.186c-.365-.337-.61-.83-.61-1.397V3.211c0-.567.245-1.06.61-1.397zM15.207 13.414l2.766 2.766-13.064 7.542 10.298-10.308zM15.207 10.586L4.909.278l13.064 7.542-2.766 2.766zM16.621 12l3.77-2.178c.811-.468.811-1.233 0-1.701l-1.004-.58L16.621 12zm0 0l2.766 4.459 1.004-.58c.811-.468.811-1.233 0-1.701L16.621 12z" />
              </svg>
              <div className="text-left leading-tight">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">GET IT ON</div>
                <div className="text-sm font-bold">Google Play (Android)</div>
              </div>
            </a>

            <a
              href="https://www.apple.com/app-store/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all font-bold text-xs backdrop-blur-sm shadow-md group"
            >
              <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.66-.99 1.73-.86 2.76 1.01.08 2.05-.51 2.59-1.26z" />
              </svg>
              <div className="text-left leading-tight">
                <div className="text-[10px] text-emerald-300 uppercase tracking-wider font-semibold">Download on the</div>
                <div className="text-sm font-bold">App Store (iOS)</div>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* STEP 1: SELECT EQUIPMENT CATALOG */}
      {activeStep === 1 && (
        <div className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-prayas-neem text-white font-bold shadow-sm"
                    : "bg-white border border-prayas-rule text-prayas-ink hover:bg-prayas-stone"
                }`}
              >
                {cat === "ALL" ? "All Equipment" : cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-prayas-muted border border-prayas-rule bg-white rounded-xl">
              Loading available medical devices...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => {
                const isAvailable = item.status === "AVAILABLE";
                return (
                  <div
                    key={item.id}
                    className="border border-prayas-rule bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                  >
                    {item.imageUrl && (
                      <div className="aspect-[4/3] bg-prayas-stone overflow-hidden border-b border-prayas-rule relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                            {item.category}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="p-5 space-y-4 flex-grow flex flex-col justify-between">
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              isAvailable
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : "bg-amber-50 text-amber-900 border border-amber-200"
                            }`}
                          >
                            {isAvailable ? "● AVAILABLE FOR LOAN" : "● CURRENTLY LEASED"}
                          </span>
                          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                            ₹0 Free Seva
                          </span>
                        </div>

                        <h3 className="font-serif text-lg font-bold text-prayas-ink leading-snug group-hover:text-emerald-900 transition-colors">
                          {item.name}
                        </h3>

                        <p className="text-xs text-prayas-muted leading-relaxed line-clamp-3">
                          {item.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-prayas-rule/80 space-y-2.5">
                        <div className="flex items-center justify-between text-[11px] text-prayas-muted">
                          <span>Quantity in Bank: {item.quantity}</span>
                          <span className="font-mono text-emerald-700 font-bold">App Required</span>
                        </div>

                        <button
                          onClick={() => handleSelectDevice(item)}
                          className="w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white transition-all shadow-sm group-hover:shadow"
                        >
                          <Smartphone className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Request via App</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* STEP 2: APP-ONLY REQUEST GUIDE FOR SELECTED ITEM */}
      {activeStep === 2 && selectedItem && (
        <div className="border border-prayas-rule bg-white rounded-2xl p-6 sm:p-10 shadow-card space-y-8">
          {/* Back Button & Header */}
          <div className="border-b border-prayas-rule pb-6 space-y-3">
            <button
              onClick={() => {
                setActiveStep(1);
                setSelectedItem(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Equipment Catalog
            </button>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                  Selected Device for Loan
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink">
                  {selectedItem.name}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-200">
                  100% Free Community Loan
                </span>
              </div>
            </div>
          </div>

          {/* Device Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 rounded-2xl bg-prayas-stone border border-prayas-rule">
            {selectedItem.imageUrl && (
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-white border border-prayas-rule">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className={`${selectedItem.imageUrl ? "md:col-span-2" : "md:col-span-3"} space-y-2 flex flex-col justify-center`}>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-white text-prayas-ink font-mono text-[10px] font-bold uppercase border border-prayas-rule">
                  {selectedItem.category}
                </span>
                <span className="text-xs text-emerald-800 font-bold">
                  {selectedItem.status === "AVAILABLE" ? "● Ready for Immediate Dispatch" : "● Check App for Availability Queue"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-prayas-muted leading-relaxed">
                {selectedItem.description}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" /> Standard Duration: 14 to 30 days (Extendable)
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" /> Mathura & Vrindavan Coverage
                </span>
              </div>
            </div>
          </div>

          {/* Detailed App-Only Instructions Card */}
          <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/70 p-6 sm:p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-md">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="inline-block px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 text-[10px] font-bold uppercase tracking-wider">
                  Important Notice
                </div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-emerald-950">
                  Loan Requests for {selectedItem.name} Must Be Placed Through the Prayas App
                </h3>
                <p className="text-xs sm:text-sm text-emerald-900/80 leading-relaxed">
                  Web-based requests are not accepted to prevent fraudulent claims and ensure live inventory tracking. Follow the quick steps below to request this equipment on your smartphone:
                </p>
              </div>
            </div>

            {/* 3 Step Guide Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-white border border-emerald-200 space-y-2 shadow-xs">
                <span className="w-7 h-7 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-xs">
                  1
                </span>
                <h4 className="font-bold text-emerald-950 text-sm">Download the App</h4>
                <p className="text-prayas-muted text-[11px] leading-relaxed">
                  Install the free <strong>Prayas Sanstha</strong> app on your Android smartphone or Apple iPhone.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-emerald-200 space-y-2 shadow-xs">
                <span className="w-7 h-7 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-xs">
                  2
                </span>
                <h4 className="font-bold text-emerald-950 text-sm">Select {selectedItem.name}</h4>
                <p className="text-prayas-muted text-[11px] leading-relaxed">
                  Open the app, go to <strong>Medical Equipment Bank</strong>, and tap <em>{selectedItem.name}</em>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-emerald-200 space-y-2 shadow-xs">
                <span className="w-7 h-7 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-xs">
                  3
                </span>
                <h4 className="font-bold text-emerald-950 text-sm">Doorstep Dispatch</h4>
                <p className="text-prayas-muted text-[11px] leading-relaxed">
                  Enter patient address and phone number. Our volunteer team verifies and dispatches to your home.
                </p>
              </div>
            </div>

            {/* Store Download Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://play.google.com/store"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-[#1C2421] text-white hover:bg-black transition-all font-bold text-xs shadow-md"
              >
                <svg className="w-5 h-5 fill-current text-emerald-400 shrink-0" viewBox="0 0 24 24">
                  <path d="M3.609 1.814L13.793 12 3.61 22.186c-.365-.337-.61-.83-.61-1.397V3.211c0-.567.245-1.06.61-1.397zM15.207 13.414l2.766 2.766-13.064 7.542 10.298-10.308zM15.207 10.586L4.909.278l13.064 7.542-2.766 2.766zM16.621 12l3.77-2.178c.811-.468.811-1.233 0-1.701l-1.004-.58L16.621 12zm0 0l2.766 4.459 1.004-.58c.811-.468.811-1.233 0-1.701L16.621 12z" />
                </svg>
                <div className="text-left leading-tight">
                  <div className="text-[10px] text-emerald-300 uppercase tracking-wider font-semibold">GET IT ON</div>
                  <div className="text-sm font-bold">Google Play (Android)</div>
                </div>
              </a>

              <a
                href="https://www.apple.com/app-store/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-[#1C2421] text-white hover:bg-black transition-all font-bold text-xs shadow-md"
              >
                <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.66-.99 1.73-.86 2.76 1.01.08 2.05-.51 2.59-1.26z" />
                </svg>
                <div className="text-left leading-tight">
                  <div className="text-[10px] text-emerald-300 uppercase tracking-wider font-semibold">Download on the</div>
                  <div className="text-sm font-bold">App Store (iOS)</div>
                </div>
              </a>

              <a
                href="prayas://medical-request"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-800 text-white hover:bg-emerald-900 transition-all font-bold text-xs shadow-md"
              >
                <Smartphone className="w-4 h-4" />
                <span>Already Have App? Open Request</span>
              </a>
            </div>
          </div>

          {/* Urgent Emergency / Elder Assistance Callout */}
          <div className="border border-amber-300 bg-amber-50 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Emergency Respiratory Distress or No Smartphone?</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed max-w-2xl">
                If the patient requires an oxygen concentrator immediately or you are assisting an elderly relative unable to use a smartphone, call our emergency coordinator directly or visit our Vrindavan center for walk-in dispatch:
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
              <a
                href="tel:+919927081650"
                className="px-5 py-2.5 rounded-xl bg-amber-800 text-white font-bold text-xs text-center hover:bg-amber-900 transition-colors shadow-sm"
              >
                Call Coordinator: +91 99270 81650
              </a>
            </div>
          </div>

          {/* Bottom Action */}
          <div className="pt-2 flex justify-start">
            <button
              onClick={() => {
                setActiveStep(1);
                setSelectedItem(null);
              }}
              className="px-5 py-2.5 rounded-xl border border-prayas-rule bg-white text-prayas-ink hover:bg-prayas-stone text-xs font-bold transition-colors"
            >
              ← Back to Catalog
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
