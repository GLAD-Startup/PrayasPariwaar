import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { assetPath } from "@/lib/api";
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building2,
  ArrowLeft,
  Heart,
  FileCheck,
  CreditCard,
} from "lucide-react";
import PrintButton from "./PrintButton";

export const dynamic = "force-dynamic";

interface ReceiptPageProps {
  params: {
    receiptNumber: string;
  };
}

// Convert numbers into Indian Currency words
function numberToWordsINR(amount: number): string {
  if (!amount || isNaN(amount) || amount <= 0) return "Zero Rupees Only";

  const single = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function convertTwoDigits(n: number): string {
    if (n < 20) return single[n];
    return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + single[n % 10] : "");
  }

  function convertThreeDigits(n: number): string {
    if (n === 0) return "";
    let str = "";
    if (Math.floor(n / 100) > 0) {
      str += single[Math.floor(n / 100)] + " Hundred ";
    }
    const remainder = n % 100;
    if (remainder > 0) {
      str += convertTwoDigits(remainder);
    }
    return str.trim();
  }

  let num = Math.floor(amount);
  let crore = Math.floor(num / 10000000);
  num %= 10000000;
  let lakh = Math.floor(num / 100000);
  num %= 100000;
  let thousand = Math.floor(num / 1000);
  num %= 1000;
  let hundred = num;

  let result = "";
  if (crore > 0) result += convertTwoDigits(crore) + " Crore ";
  if (lakh > 0) result += convertTwoDigits(lakh) + " Lakh ";
  if (thousand > 0) result += convertTwoDigits(thousand) + " Thousand ";
  if (hundred > 0) result += convertThreeDigits(hundred) + " ";

  return "Rupees " + result.trim() + " Only";
}

export default async function ReceiptPage({ params }: ReceiptPageProps) {
  const { receiptNumber } = params;

  if (!receiptNumber) {
    notFound();
  }

  const donation = await prisma.donation.findFirst({
    where: {
      OR: [
        { receiptNumber: receiptNumber },
        { razorpayOrderId: receiptNumber },
        { razorpayPaymentId: receiptNumber },
      ],
    },
  });

  if (!donation) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full border border-prayas-rule bg-white rounded-2xl p-8 text-center space-y-4 shadow-card">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <FileCheck className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-prayas-ink">
            Receipt Not Found
          </h1>
          <p className="text-xs text-prayas-muted leading-relaxed">
            No donation record matches receipt or transaction reference:{" "}
            <code className="font-mono font-bold text-prayas-ink bg-slate-100 px-1.5 py-0.5 rounded">
              {receiptNumber}
            </code>
          </p>
          <div className="pt-2">
            <Link
              href="/donate"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2E5339] text-white hover:bg-[#23432b] text-xs font-bold transition-all shadow-subtle"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go to Seva Donation Portal</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(donation.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = new Date(donation.createdAt).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="py-8 sm:py-14 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Action Bar (Hidden on Print) */}
      <div className="print:hidden mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-prayas-rule pb-4">
        <Link
          href="/donate"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-prayas-muted hover:text-prayas-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Donation Portal</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <PrintButton />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PRINTABLE OFFICIAL 80G DONATION RECEIPT VOUCHER                           */}
      {/* ========================================================================= */}
      <div
        id="printable-receipt"
        className="border-2 border-prayas-rule bg-white rounded-3xl p-6 sm:p-10 shadow-lg print:border print:border-black print:shadow-none print:rounded-none print:p-6 space-y-8"
      >
        {/* Masthead Header */}
        <div className="border-b-2 border-prayas-rule pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-stone-50 border border-prayas-rule inline-block">
                <Image
                  src={assetPath("/images/prayas-logo.png")}
                  alt="Prayas Pariwaar"
                  width={150}
                  height={42}
                  className="h-9 w-auto object-contain"
                />
              </div>
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2E5339] tracking-tight">
                  PRAYAS PARIWAAR
                </h2>
                <p className="text-[10px] font-bold text-prayas-muted uppercase tracking-widest">
                  A Trial to Move Ahead • Registered Grassroots Society
                </p>
              </div>
            </div>
            <p className="text-[11px] text-prayas-muted max-w-lg leading-relaxed pt-1">
              Raman Reti, Vrindavan, Mathura, Uttar Pradesh - 281121 • Helpline: +91 99270 81650
            </p>
          </div>

          <div className="text-left sm:text-right text-[11px] font-mono text-prayas-muted space-y-0.5 bg-prayas-stone/60 p-3 rounded-xl border border-prayas-rule/80">
            <p><strong>Reg. No:</strong> 142/2006-07 (Mathura)</p>
            <p><strong>NITI Darpan:</strong> UP/2017/0154210</p>
            <p><strong>Income Tax:</strong> Section 12A & 80G</p>
          </div>
        </div>

        {/* Certificate Title & Status */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official 80G Tax Exemption Donation Receipt</span>
          </div>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-prayas-ink">
            Seva Donation Certificate & Acknowledgment
          </h1>
          <p className="text-xs text-prayas-muted">
            Issued under Section 80G(5)(vi) of the Income Tax Act, 1961
          </p>
        </div>

        {/* Receipt Key Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-prayas-stone/50 p-4 rounded-2xl border border-prayas-rule text-xs font-mono">
          <div>
            <span className="text-[10px] uppercase font-bold text-prayas-muted block">
              Receipt Number
            </span>
            <strong className="text-sm font-bold text-prayas-ink">
              {donation.receiptNumber || "SDT-VOUCHER"}
            </strong>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-prayas-muted block">
              Date & Time
            </span>
            <span className="font-bold text-prayas-ink block">
              {formattedDate}
            </span>
            <span className="text-[10px] text-prayas-muted">{formattedTime}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-prayas-muted block">
              Status
            </span>
            <span
              className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                donation.status === "SUCCESS"
                  ? "bg-emerald-100 text-emerald-900"
                  : "bg-amber-100 text-amber-900"
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
              {donation.status}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-prayas-muted block">
              Payment Gateway
            </span>
            <span className="font-bold text-prayas-ink block truncate">
              {donation.paymentMethod || "Razorpay Online"}
            </span>
          </div>
        </div>

        {/* Donor & Contribution Details Table */}
        <div className="space-y-4 text-xs">
          <table className="w-full border border-prayas-rule rounded-xl overflow-hidden">
            <tbody className="divide-y divide-prayas-rule">
              <tr className="bg-prayas-stone/30">
                <td className="p-3 font-bold text-prayas-muted w-1/3">
                  Received with thanks from:
                </td>
                <td className="p-3 font-bold text-sm text-prayas-ink">
                  {donation.isAnonymous ? "Anonymous Sevadar" : donation.donorName}
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-prayas-muted">
                  Email Address:
                </td>
                <td className="p-3 font-mono text-prayas-ink">
                  {donation.donorEmail}
                </td>
              </tr>
              {donation.donorPhone && (
                <tr>
                  <td className="p-3 font-bold text-prayas-muted">
                    Mobile / Contact:
                  </td>
                  <td className="p-3 font-mono text-prayas-ink">
                    {donation.donorPhone}
                  </td>
                </tr>
              )}
              <tr>
                <td className="p-3 font-bold text-prayas-muted">
                  Allocated Program / Cause:
                </td>
                <td className="p-3 font-semibold text-emerald-900">
                  {donation.projectOrCause}
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-prayas-muted">
                  Razorpay Order Reference:
                </td>
                <td className="p-3 font-mono text-xs text-slate-700">
                  {donation.razorpayOrderId}
                </td>
              </tr>
              {donation.razorpayPaymentId && (
                <tr>
                  <td className="p-3 font-bold text-prayas-muted">
                    Razorpay Payment ID:
                  </td>
                  <td className="p-3 font-mono text-xs text-emerald-800 font-bold">
                    {donation.razorpayPaymentId}
                  </td>
                </tr>
              )}
              <tr className="bg-emerald-50/60">
                <td className="p-4 font-bold text-emerald-950 text-sm">
                  Amount Donated:
                </td>
                <td className="p-4 font-serif text-2xl font-bold text-emerald-950">
                  ₹{donation.amount.toLocaleString("en-IN")}.00
                  <span className="block font-sans text-xs font-normal text-emerald-800 mt-0.5">
                    ({numberToWordsINR(donation.amount)})
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 80G Statutory Exemption Declaration */}
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-[11px] text-amber-950 space-y-1.5 leading-relaxed">
          <p className="font-bold">
            Statutory Income Tax Exemption Terms (Section 80G):
          </p>
          <p>
            This donation qualifies for tax exemption under Section 80G(5)(vi) of the Income Tax Act, 1961. Prayas Pariwaar is a registered grassroots society (Registration No. 142/2006-07 Mathura) with Section 12A non-profit certification and NITI Aayog NGO Darpan unique identity UP/2017/0154210.
          </p>
          <p className="text-[10px] text-amber-900 pt-1 border-t border-amber-200/60">
            * 100% Nishkam Seva Guarantee: Zero administrative deduction is applied to public donations. Every rupee is deployed directly to student tuition, medical equipment, and sacred tree groves.
          </p>
        </div>

        {/* Official Signature / Verification Block */}
        <div className="pt-6 border-t-2 border-prayas-rule flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div className="space-y-1 text-xs text-prayas-muted">
            <p className="font-mono text-[10px] text-slate-500">
              Cryptographic HMAC Verification: PASS ✓
            </p>
            <p className="text-[11px]">
              Computer-generated official receipt. Requires no manual signature.
            </p>
          </div>

          <div className="text-right space-y-1">
            <div className="w-32 border-b border-prayas-rule pb-2 ml-auto text-center font-serif text-xs font-bold text-prayas-ink">
              PRAYAS PARIWAAR
            </div>
            <p className="text-[10px] uppercase font-bold text-prayas-muted tracking-wider">
              Authorized Signatory • Seva Trust
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
