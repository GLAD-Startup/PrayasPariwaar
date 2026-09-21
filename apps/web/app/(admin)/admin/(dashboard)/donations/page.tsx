import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Heart,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  IndianRupee,
  Receipt,
  CreditCard,
  Hash,
  AlertTriangle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDonationsPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  let donations: any[] = [];
  try {
    donations = await prisma.donation.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    console.warn("Database connection issue loading donations:", e);
  }

  // Filter based on status query parameter if provided
  const activeStatus = searchParams?.status?.toUpperCase();
  const filteredDonations = activeStatus
    ? donations.filter((d) => d.status === activeStatus)
    : donations;

  const totalRaised = donations
    .filter((d) => d.status === "SUCCESS")
    .reduce((sum, d) => sum + (d.amount || 0), 0);
  const successCount = donations.filter((d) => d.status === "SUCCESS").length;
  const pendingCount = donations.filter((d) => d.status === "PENDING").length;
  const failedCount = donations.filter((d) => d.status === "FAILED").length;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="border border-prayas-rule bg-white rounded-2xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Institutional Seva Donation Ledger</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink">
            Donations & Razorpay Ledger
          </h1>
          <p className="text-xs text-prayas-muted max-w-2xl leading-relaxed">
            Real-time Razorpay payments, cryptographic signature verification logs, order IDs, and issued 80G seva receipts.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 shrink-0 text-right">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
            Total Verified Funds
          </span>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-emerald-950">
            ₹{totalRaised.toLocaleString("en-IN")}
          </p>
          <span className="text-[10px] text-emerald-700 font-medium">
            {successCount} verified successful receipts
          </span>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-prayas-rule p-4 rounded-xl shadow-subtle flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-prayas-muted uppercase tracking-wider block">Total Raised</span>
            <span className="font-serif text-lg font-bold text-emerald-950">₹{totalRaised.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="bg-white border border-prayas-rule p-4 rounded-xl shadow-subtle flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-prayas-muted uppercase tracking-wider block">Verified Success</span>
            <span className="font-serif text-lg font-bold text-prayas-ink">{successCount}</span>
          </div>
        </div>

        <div className="bg-white border border-prayas-rule p-4 rounded-xl shadow-subtle flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-prayas-muted uppercase tracking-wider block">Pending Orders</span>
            <span className="font-serif text-lg font-bold text-prayas-ink">{pendingCount}</span>
          </div>
        </div>

        <div className="bg-white border border-prayas-rule p-4 rounded-xl shadow-subtle flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 text-red-700 flex items-center justify-center font-bold">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-prayas-muted uppercase tracking-wider block">Failed / Dropped</span>
            <span className="font-serif text-lg font-bold text-prayas-ink">{failedCount}</span>
          </div>
        </div>
      </div>

      {/* 3. Filter Navigation */}
      <div className="flex items-center gap-2 border-b border-prayas-rule pb-2 overflow-x-auto text-xs font-bold">
        <a
          href="/admin/donations"
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            !activeStatus
              ? "bg-[#2E5339] text-white"
              : "text-prayas-muted hover:text-prayas-ink hover:bg-prayas-stone"
          }`}
        >
          All Transactions ({donations.length})
        </a>
        <a
          href="/admin/donations?status=SUCCESS"
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeStatus === "SUCCESS"
              ? "bg-[#2E5339] text-white"
              : "text-prayas-muted hover:text-prayas-ink hover:bg-prayas-stone"
          }`}
        >
          Verified Success ({successCount})
        </a>
        <a
          href="/admin/donations?status=PENDING"
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeStatus === "PENDING"
              ? "bg-[#2E5339] text-white"
              : "text-prayas-muted hover:text-prayas-ink hover:bg-prayas-stone"
          }`}
        >
          Pending ({pendingCount})
        </a>
        <a
          href="/admin/donations?status=FAILED"
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeStatus === "FAILED"
              ? "bg-[#2E5339] text-white"
              : "text-prayas-muted hover:text-prayas-ink hover:bg-prayas-stone"
          }`}
        >
          Failed ({failedCount})
        </a>
      </div>

      {/* 4. Transactions Table */}
      <div className="bg-white border border-prayas-rule rounded-2xl overflow-hidden shadow-card">
        {filteredDonations.length === 0 ? (
          <div className="p-16 text-center text-prayas-muted text-xs space-y-2">
            <Heart className="w-8 h-8 text-rose-500/50 mx-auto" />
            <p className="font-bold text-prayas-ink text-sm">No donation transactions match this view.</p>
            <p>Direct online contributions via Razorpay checkout will be logged here automatically.</p>
          </div>
        ) : (
          <div>
            {/* MOBILE CARDS (< md) */}
            <div className="md:hidden divide-y divide-prayas-rule">
              {filteredDonations.map((d) => (
                <div key={d.id} className="p-4 space-y-3 hover:bg-prayas-stone/20 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-prayas-ink text-sm">
                        {d.isAnonymous ? "Anonymous Donor 🤍" : d.donorName}
                      </h3>
                      <p className="text-[11px] text-prayas-muted font-mono">{d.donorEmail}</p>
                      {d.donorPhone && (
                        <p className="text-emerald-700 text-[10px] font-mono mt-0.5">{d.donorPhone}</p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-serif text-base font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block">
                        ₹{d.amount.toLocaleString("en-IN")}
                      </span>
                      <span className="block mt-0.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                        {d.frequency ? d.frequency.replace("_", " ") : "ONE TIME"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] font-mono text-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Order ID:</span>
                      <span className="font-bold text-prayas-ink truncate max-w-[180px]">{d.razorpayOrderId}</span>
                    </div>
                    {d.razorpayPaymentId && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Payment ID:</span>
                        <span className="font-bold text-emerald-700 truncate max-w-[180px]">{d.razorpayPaymentId}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Receipt:</span>
                      {d.receiptNumber ? (
                        <Link
                          href={`/receipt/${d.receiptNumber}`}
                          target="_blank"
                          className="font-bold text-emerald-800 hover:underline inline-flex items-center gap-1"
                        >
                          <span>{d.receiptNumber}</span>
                          <span className="text-[10px]">↗</span>
                        </Link>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-0.5">
                    <span className="font-semibold text-slate-700 bg-prayas-stone px-2 py-0.5 rounded text-[11px] border border-prayas-rule">
                      {d.projectOrCause || "General Seva Fund"}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        d.status === "SUCCESS"
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                          : d.status === "PENDING"
                          ? "bg-amber-100 text-amber-900 border border-amber-200"
                          : "bg-red-100 text-red-900 border border-red-200"
                      }`}
                    >
                      {d.status === "SUCCESS" && <ShieldCheck className="w-3 h-3 text-emerald-700" />}
                      {d.status === "PENDING" && <Clock className="w-3 h-3 text-amber-700" />}
                      {d.status === "FAILED" && <AlertTriangle className="w-3 h-3 text-red-700" />}
                      {d.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-prayas-muted pt-1 border-t border-prayas-rule/60">
                    <span className="font-mono text-emerald-800 font-bold text-[10px]">
                      {d.paymentMethod || "Razorpay"}
                    </span>
                    <span>
                      {new Date(d.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE VIEW (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-prayas-ink">
                <thead className="bg-prayas-stone border-b border-prayas-rule text-prayas-muted uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="p-4 min-w-[200px]">Donor & Contact</th>
                    <th className="p-4 min-w-[140px]">Amount & Frequency</th>
                    <th className="p-4 min-w-[150px]">Allocated Cause</th>
                    <th className="p-4 min-w-[200px]">Razorpay Payment Details</th>
                    <th className="p-4 min-w-[130px]">Verification & Status</th>
                    <th className="p-4 min-w-[110px]">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-prayas-rule">
                  {filteredDonations.map((d) => (
                    <tr key={d.id} className="hover:bg-prayas-stone/30 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-prayas-ink text-sm">
                          {d.isAnonymous ? "Anonymous Donor 🤍" : d.donorName}
                        </div>
                        <div className="text-prayas-muted text-[11px] font-mono">{d.donorEmail}</div>
                        {d.donorPhone && (
                          <div className="text-emerald-700 text-[10px] font-mono mt-0.5">{d.donorPhone}</div>
                        )}
                      </td>

                      <td className="p-4">
                        <span className="font-serif text-base font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block">
                          ₹{d.amount.toLocaleString("en-IN")}
                        </span>
                        <span className="block mt-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {d.frequency ? d.frequency.replace("_", " ") : "ONE TIME"}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-semibold text-prayas-ink block">
                          {d.projectOrCause || "General Seva Fund"}
                        </span>
                      </td>

                      <td className="p-4 space-y-1">
                        <div className="text-[11px] font-mono text-slate-700">
                          <span className="text-slate-400 font-sans text-[10px] mr-1">Order:</span>
                          <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {d.razorpayOrderId}
                          </span>
                        </div>
                        {d.razorpayPaymentId && (
                          <div className="text-[11px] font-mono text-emerald-800">
                            <span className="text-slate-400 font-sans text-[10px] mr-1">Payment:</span>
                            <span className="font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              {d.razorpayPaymentId}
                            </span>
                          </div>
                        )}
                        <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                          <span className="font-sans text-[10px] text-slate-400">Receipt:</span>
                          {d.receiptNumber ? (
                            <Link
                              href={`/receipt/${d.receiptNumber}`}
                              target="_blank"
                              className="font-bold text-emerald-800 hover:underline inline-flex items-center gap-0.5"
                              title="View & Print Official 80G Receipt"
                            >
                              <span>{d.receiptNumber}</span>
                              <span className="text-[9px]">↗</span>
                            </Link>
                          ) : (
                            <span>N/A</span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            d.status === "SUCCESS"
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                              : d.status === "PENDING"
                              ? "bg-amber-100 text-amber-900 border border-amber-200"
                              : "bg-red-100 text-red-900 border border-red-200"
                          }`}
                        >
                          {d.status === "SUCCESS" && <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />}
                          {d.status === "PENDING" && <Clock className="w-3.5 h-3.5 text-amber-700" />}
                          {d.status === "FAILED" && <AlertTriangle className="w-3.5 h-3.5 text-red-700" />}
                          <span>{d.status}</span>
                        </span>
                        {d.status === "SUCCESS" && d.razorpaySignature && (
                          <span className="block mt-1 text-[9px] text-emerald-700 font-mono">
                            HMAC Verified ✓
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-prayas-muted text-[11px]">
                        {new Date(d.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
