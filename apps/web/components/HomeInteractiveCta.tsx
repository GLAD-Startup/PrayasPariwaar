"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { assetPath } from "@/lib/api";
import { Heart, Sparkles } from "lucide-react";

const givingOptions = [
  {
    amount: 500,
    label: "₹500 / mo",
    impact: "Covers 1 month of evening tutoring, school supplies & nutrition for 1 child",
  },
  {
    amount: 1000,
    label: "₹1,000 / mo",
    impact: "Sponsors 2 children's education with study materials and regular health checks",
  },
  {
    amount: 2500,
    label: "₹2,500",
    impact: "Funds books, stationery, and learning materials for an entire study batch",
  },
  {
    amount: 5000,
    label: "₹5,000",
    impact: "Comprehensive annual educational support & supplies for underprivileged students",
  },
];

export default function HomeInteractiveCta() {
  const [selectedAmount, setSelectedAmount] = useState<number>(500);

  const currentOption = givingOptions.find((o) => o.amount === selectedAmount) || givingOptions[0];

  return (
    <div className="border border-prayas-rule bg-prayas-stone rounded-2xl p-6 sm:p-10 2xl:p-14 text-center space-y-6 shadow-card">
      {/* Logo in CTA */}
      <div className="flex justify-center">
        <Image
          src={assetPath("/images/prayas-logo.png")}
          alt="Prayas Pariwaar Logo"
          width={180}
          height={50}
          className="h-10 sm:h-12 2xl:h-16 w-auto object-contain"
        />
      </div>

      <div className="max-w-2xl 2xl:max-w-3xl mx-auto space-y-2">
        <span className="text-xs 2xl:text-sm font-bold uppercase tracking-wider text-prayas-neem">
          Support Grassroots Community Seva in Vrindavan
        </span>
        <h2 className="font-serif text-xl sm:text-2xl 2xl:text-3xl font-bold text-prayas-ink leading-tight">
          For just ₹500 a month, you can ensure a child in Vrindavan stays in school and builds a brighter future.
        </h2>
      </div>

      <p className="text-xs sm:text-sm 2xl:text-base text-prayas-muted max-w-xl 2xl:max-w-2xl mx-auto leading-relaxed">
        All educational sponsorships directly support children with learning materials, uniforms, and tutoring. You will receive direct progress report cards and handwritten letters from the student you sponsor.
      </p>

      {/* Dynamic Giving Amount Chips (Interactive NGO Pattern) */}
      <div className="max-w-xl mx-auto space-y-3 pt-1">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
          {givingOptions.map((opt) => {
            const isSelected = selectedAmount === opt.amount;
            return (
              <button
                key={opt.amount}
                type="button"
                onClick={() => setSelectedAmount(opt.amount)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-[#2E5339] text-white shadow-md scale-105 border border-[#2E5339]"
                    : "bg-white text-slate-700 hover:text-emerald-900 border border-prayas-rule hover:border-emerald-300 hover:bg-emerald-50/50"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Impact Feedback Callout */}
        <div className="min-h-[24px] flex items-center justify-center text-xs text-slate-600 font-medium">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/60 text-emerald-900 border border-emerald-300/40 text-[11px] sm:text-xs">
            <Sparkles className="w-3 h-3 text-emerald-700 shrink-0" />
            <span>{currentOption.impact}</span>
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-3.5 pt-2">
        <Link
          href={`/donate?project=aashayein-education&amount=${selectedAmount}`}
          className="w-full sm:w-auto px-7 py-3.5 2xl:px-8 2xl:py-4 rounded-xl text-xs sm:text-sm 2xl:text-base font-bold bg-[#2E5339] text-white hover:bg-[#23432b] transition-all shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-center"
          style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
        >
          <Heart className="w-4 h-4 fill-white text-white shrink-0" />
          <span>Sponsor with ₹{selectedAmount.toLocaleString("en-IN")} Today →</span>
        </Link>
        <Link
          href="/volunteer"
          className="w-full sm:w-auto text-center px-6 py-3.5 2xl:px-8 2xl:py-4 rounded-xl text-xs sm:text-sm 2xl:text-base font-semibold border border-prayas-rule bg-white text-prayas-ink hover:bg-prayas-subtle transition-all hover:scale-[1.01] shadow-xs"
        >
          Join as a Volunteer
        </Link>
        <Link
          href="/partner/corporate"
          className="w-full sm:w-auto text-center px-6 py-3.5 2xl:px-8 2xl:py-4 rounded-xl text-xs sm:text-sm 2xl:text-base font-semibold border border-prayas-rule bg-white text-slate-800 hover:bg-prayas-subtle transition-all hover:scale-[1.01] shadow-xs"
        >
          Corporate CSR Partnership
        </Link>
      </div>
    </div>
  );
}
