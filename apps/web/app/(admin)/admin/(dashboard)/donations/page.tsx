import { prisma } from "@/lib/prisma";
import { Heart, CheckCircle2, XCircle, Clock, ShieldCheck, Download, IndianRupee } from "lucide-react";

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
            <span>12A & 80G Tax-Exempt Institutional Ledger</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink">
            Donation Ledger & 80G Tax Receipts
          </h1>
          <p className="text-xs text-prayas-muted max-w-2xl">
            Razorpay transaction logs, payment signatures, and tax certificates issued for Project Aashayein and Vrindavan Seva initiatives.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 shrink-0 text-right">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Total Verified Funds</span>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-emerald-950">
            ₹{totalRaised.toLocaleString("en-IN")}
          </p>
          <span className="text-[10px] text-emerald-700">{successCount} successful 80G receipts</span>
        </div>
      </div>

      {/* 2. Donations Table */}
      <div className="bg-white border border-prayas-rule rounded-2xl overflow-hidden shadow-card">
        {donations.length === 0 ? (
          <div className="p-16 text-center text-prayas-muted text-xs space-y-2">
            <Heart className="w-8 h-8 text-prayas-crimson/50 mx-auto" />
            <p className="font-bold text-prayas-ink">No donation transactions recorded yet.</p>
            <p>Direct online contributions via Razorpay will be logged here automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-prayas-ink">
              <thead className="bg-prayas-stone border-b border-prayas-rule text-prayas-muted uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-4">Donor Name & Email</th>
                  <th className="p-4">Amount (₹)</th>
                  <th className="p-4">Allocated Program</th>
                  <th className="p-4">Razorpay Order ID</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-prayas-rule">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-prayas-stone/30 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-prayas-ink text-sm">{d.donorName}</div>
                      <div className="text-prayas-muted text-[11px] font-mono">{d.donorEmail}</div>
                      {d.donorPhone && (
                        <div className="text-prayas-muted text-[10px]">{d.donorPhone}</div>
                      )}
                    </td>

                    <td className="p-4">
                      <span className="font-serif text-base font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block">
                        ₹{d.amount.toLocaleString("en-IN")}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="font-semibold text-prayas-ink block">
                        {d.cause || "Project Aashayein"}
                      </span>
                      <span className="text-[10px] text-prayas-muted">
                        {d.isAnonymous ? "Anonymous Donation" : "Named Sponsor"}
                      </span>
                    </td>

                    <td className="p-4 font-mono text-[11px] text-slate-500">
                      {d.razorpayPaymentId || d.razorpayOrderId || "DIRECT_SEVA"}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          d.status === "SUCCESS"
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                            : d.status === "PENDING"
                            ? "bg-amber-100 text-amber-900 border border-amber-200"
                            : "bg-red-100 text-red-900"
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
        )}
      </div>
    </div>
  );
}
