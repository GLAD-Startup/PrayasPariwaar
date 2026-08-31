import { prisma } from "@/lib/prisma";
import { Activity, Plus, CheckCircle, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminEquipmentPage() {
  let equipmentList: any[] = [];
  let requestList: any[] = [];

  try {
    const [equip, reqs] = await Promise.all([
      prisma.medicalEquipment.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.equipmentRequest.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { equipment: true },
      }),
    ]);
    equipmentList = equip;
    requestList = reqs;
  } catch (e) {
    console.warn("DB not ready");
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Medical Equipment Bank Inventory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track oxygen concentrators, hospital beds, BiPAP machines, and patient loan requests.
          </p>
        </div>
      </div>

      {/* Equipment List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {equipmentList.length === 0 ? (
          <div className="col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
            No equipment entered in database. Seed equipment via Prisma or add new device inventory.
          </div>
        ) : (
          equipmentList.map((eq) => (
            <div
              key={eq.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">
                  {eq.category}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    eq.status === "AVAILABLE"
                      ? "bg-emerald-950 text-emerald-400"
                      : "bg-amber-950 text-amber-400"
                  }`}
                >
                  {eq.status}
                </span>
              </div>
              <h3 className="font-bold text-white text-base">{eq.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{eq.description}</p>
              <div className="pt-2 border-t border-slate-800 text-xs text-slate-500">
                Quantity: <strong className="text-slate-300">{eq.quantity} Units</strong>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pending Loan Requests */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white font-display">
          Recent Equipment Loan Requests
        </h2>
        {requestList.length === 0 ? (
          <p className="text-xs text-slate-500">No active equipment requests submitted yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 uppercase text-[10px] text-slate-400">
                <tr>
                  <th className="p-3">Requester</th>
                  <th className="p-3">Equipment</th>
                  <th className="p-3">Purpose</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {requestList.map((r) => (
                  <tr key={r.id}>
                    <td className="p-3 font-semibold text-white">{r.requesterName}</td>
                    <td className="p-3 text-emerald-400">{r.equipment?.name || "Equipment"}</td>
                    <td className="p-3 text-slate-400 max-w-xs truncate">{r.purpose}</td>
                    <td className="p-3">{r.requestedDays} Days</td>
                    <td className="p-3 font-mono">{r.contactPhone}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                        {r.status}
                      </span>
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
