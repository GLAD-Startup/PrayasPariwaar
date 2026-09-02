import { prisma } from "@/lib/prisma";
import { Heart, CheckCircle2, XCircle, Clock, ShieldCheck, Download, IndianRupee, Tag } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDonationsPage() {
  let donations: any[] = [];
  try {
    donations = await prisma.donation.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    console.warn("DB not ready");
  }

  const totalRaised = donations
    .filter((d) => d.status === "SUCCESS")
    .reduce((sum, d) => sum + (d.amount || 0), 0);
  const successCount = donations.filter((d) => d.status === "SUCCESS").length;

  return (
    <div className="space-y-6">
      {/* 1. Header with Stats Banner */}
      <div className="border border-prayas-rule bg-white rounded-2xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Institutional Seva Donation Ledger</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink">
            Donation Ledger & Receipts
          </h1>
          <p className="text-xs text-prayas-muted max-w-2xl">
            Razorpay transaction logs, payment signatures, and donation receipts issued for Education, Blood Donation, Plantation, Jeev Jal, and Vocational Seva.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 shrink-0 text-right">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Total Verified Funds</span>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-emerald-950">
            ₹{totalRaised.toLocaleString("en-IN")}
          </p>
          <span className="text-[10px] text-emerald-700">{successCount} successful receipts</span>
        </div>
      </div>

      {/* 2. Donations Table */}
      <div className="bg-white border border-prayas-rule rounded-2xl overflow-hidden shadow-card">
        {donations.length === 0 ? (
          <div className="p-16 text-center text-prayas-muted text-xs space-y-2">
            <Heart className="w-8 h-8 text-rose-500/50 mx-auto" />
            <p className="font-bold text-prayas-ink">No donation transactions recorded yet.</p>
            <p>Direct online contributions via UPI, Cards, NetBanking, and Wallets will be logged here automatically.</p>
          </div>
        ) : (
          <div>
            {/* 1. MOBILE CARDS (< md) */}
            <div className="md:hidden divide-y divide-prayas-rule">
          {donations.map((d) => (
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

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-0.5">
                <span className="font-semibold text-slate-700 bg-prayas-stone px-2 py-0.5 rounded text-[11px] border border-prayas-rule">
                  {d.projectOrCause || "General Fund"}
                </span>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    d.status === "SUCCESS"
                      ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                      : d.status === "PENDING"
                      ? "bg-amber-100 text-amber-900 border border-amber-200"
                      : "bg-red-100 text-red-900 border border-red-200"
                  }`}
                >
                  {d.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-prayas-muted pt-1 border-t border-prayas-rule/60">
                <span className="font-mono text-emerald-800 font-bold text-[10px]">
                  {d.receiptNumber || d.razorpayOrderId?.slice(0, 16) || "SDT-REC"} • {d.paymentMethod || "UPI"}
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

        {/* 2. DESKTOP TABLE VIEW (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-prayas-ink">
            <thead className="bg-prayas-stone border-b border-prayas-rule text-prayas-muted uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-4 min-w-[200px]">Donor & Contact</th>
                <th className="p-4 min-w-[140px]">Amount & Frequency</th>
                <th className="p-4 min-w-[140px]">Allocated Cause</th>
                <th className="p-4 min-w-[140px]">Method & Receipt #</th>
                <th className="p-4 min-w-[100px]">Status</th>
                <th className="p-4 min-w-[110px]">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-prayas-rule">
              {donations.map((d) => (
                <tr key={d.id} className="hover:bg-prayas-stone/30 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-prayas-ink text-sm">
                      {d.isAnonymous ? "Anonymous Donor 🤍" : d.donorName}
                    </div>
                    <div className="text-prayas-muted text-[11px] font-mono">{d.donorEmail}</div>
                    {d.donorPhone && (
                      <div className="text-emerald-700 text-[10px] font-mono">{d.donorPhone}</div>
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
                      {d.projectOrCause || "General Fund"}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className="font-bold text-slate-700 text-xs block">
                      {d.paymentMethod || "UPI / QR"}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold block">
                      {d.receiptNumber || d.razorpayOrderId?.slice(0, 16) || "SDT-REC"}
                    </span>
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        d.status === "SUCCESS"
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                          : d.status === "PENDING"
                          ? "bg-amber-100 text-amber-900 border border-amber-200"
                          : "bg-red-100 text-red-900 border border-red-200"
                      }`}
                    >
                      {d.status}
                    </span>
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
