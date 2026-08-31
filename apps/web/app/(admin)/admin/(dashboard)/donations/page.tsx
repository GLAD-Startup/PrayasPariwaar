import { prisma } from "@/lib/prisma";
import { Heart, CheckCircle2, XCircle, Clock, ShieldCheck } from "lucide-react";

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
    <div className="space-y-6 max-w-6xl">
      <div className="border-b border-prayas-rule pb-4">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink flex items-center gap-2">
          <Heart className="w-6 h-6 text-prayas-crimson fill-current" />
          <span>Donation Ledger & 80G Tax Certificates</span>
        </h1>
        <p className="text-xs text-prayas-muted mt-1">
          Razorpay transaction logs, payment signatures, and tax certificates issued for Project Aashayein and Seva initiatives.
        </p>
      </div>

      <div className="bg-white border border-prayas-rule rounded-xl overflow-hidden shadow-card">
        {donations.length === 0 ? (
          <div className="p-12 text-center text-prayas-muted text-xs">
            No donation transactions recorded yet.
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
                  <tr key={d.id} className="hover:bg-prayas-paper transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-prayas-ink text-sm">{d.donorName}</div>
                      <div className="text-prayas-muted text-xs">{d.donorEmail}</div>
                      {d.panNumber && (
                        <span className="text-[10px] text-prayas-neem font-mono font-bold block mt-0.5">
                          PAN: {d.panNumber} (80G Certified)
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-serif font-bold text-prayas-neem text-base">
                      ₹{d.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="p-4 text-prayas-ink font-medium">
                      {d.projectOrCause}
                    </td>
                    <td className="p-4 font-mono text-[11px] text-prayas-muted">
                      {d.razorpayOrderId}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          d.status === "SUCCESS"
                            ? "bg-green-100 text-emerald-900 border border-green-200"
                            : d.status === "PENDING"
                            ? "bg-amber-100 text-amber-900 border border-amber-200"
                            : "bg-red-100 text-red-900 border border-red-200"
                        }`}
                      >
                        {d.status === "SUCCESS" ? "✓ SUCCESS" : d.status}
                      </span>
                    </td>
                    <td className="p-4 text-prayas-muted text-[11px]">
                      {new Date(d.createdAt).toLocaleDateString("en-IN", {
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
