"use client";

import { Printer, Share2, Check } from "lucide-react";
import { useState } from "react";

export default function PrintButton() {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleCopyLink}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors shadow-2xs"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
        <span>{copied ? "Link Copied" : "Share Receipt"}</span>
      </button>

      <button
        type="button"
        onClick={handlePrint}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2E5339] text-white hover:bg-[#23432b] text-xs font-bold transition-colors shadow-subtle"
      >
        <Printer className="w-3.5 h-3.5" />
        <span>Print / Save PDF</span>
      </button>
    </div>
  );
}
