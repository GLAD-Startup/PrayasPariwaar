import { prisma } from "@/lib/prisma";
import { Heart, CheckCircle2, XCircle, Clock } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
          Donation Ledger & 80G Receipts
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Razorpay transaction logs, payment signatures, and tax certificates issued.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {donations.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No donation transactions recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-4">Donor Name & Email</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Cause / Campaign</th>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/40">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{d.donorName}</div>
                      <div className="text-slate-400 text-xs">{d.donorEmail}</div>
                    </td>
                    <td className="p-4 font-bold text-emerald-400 text-sm">
                      ₹{d.amount.toLocaleString()}
                    </td>
                    <td className="p-4 text-slate-300">{d.projectOrCause}</td>
                    <td className="p-4 font-mono text-[11px] text-slate-400">
                      {d.razorpayOrderId}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          d.status === "SUCCESS"
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : "bg-amber-950 text-amber-300 border border-amber-800"
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(d.createdAt).toLocaleDateString()}
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
