import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Droplet, Activity, Users, Heart, ArrowUpRight, Flame, Clock, MapPin } from "lucide-react";
import { BloodGroupDisplayMap } from "@prayas/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  let pendingBloodCount = 0;
  let activeEquipmentCount = 0;
  let volunteerCount = 0;
  let donationSum = 0;
  let recentBloodRequests: any[] = [];

  try {
    const [bloodCount, equipCount, volCount, donAggregate, recentRequests] = await Promise.all([
      prisma.bloodRequest.count({ where: { status: "PENDING" } }),
      prisma.medicalEquipment.count({ where: { status: "AVAILABLE" } }),
      prisma.volunteer.count(),
      prisma.donation.aggregate({
        _sum: { amount: true },
        where: { status: "SUCCESS" },
      }),
      prisma.bloodRequest.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    pendingBloodCount = bloodCount;
    activeEquipmentCount = equipCount;
    volunteerCount = volCount;
    donationSum = donAggregate._sum.amount || 0;
    recentBloodRequests = recentRequests;
  } catch (e) {
    console.warn("DB not connected yet or empty");
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Operations Command Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time monitoring of blood requests, equipment leases, and volunteer mobilization.
          </p>
        </div>

        <Link
          href="/admin/blood-requests"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
        >
          <Droplet className="w-4 h-4 fill-current" /> Manage Blood Requests
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Pending Blood Needs</span>
            <Droplet className="w-4 h-4 text-red-500 fill-red-500" />
          </div>
          <p className="text-3xl font-bold font-display text-white">{pendingBloodCount}</p>
          <span className="text-[11px] text-red-400 font-medium">Requires immediate response</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Available Equipment</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold font-display text-white">{activeEquipmentCount}</p>
          <span className="text-[11px] text-emerald-400 font-medium">Ready for dispatch</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Registered Volunteers</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-bold font-display text-white">{volunteerCount}</p>
          <span className="text-[11px] text-amber-400 font-medium">Active nationwide</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Donations Received</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-3xl font-bold font-display text-white">₹{donationSum.toLocaleString()}</p>
          <span className="text-[11px] text-slate-400 font-medium">Via Razorpay (80G)</span>
        </div>
      </div>

      {/* Recent Emergency Requests Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-500" /> Recent Emergency Blood Requests
          </h2>
          <Link
            href="/admin/blood-requests"
            className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
          >
            View All <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentBloodRequests.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No blood requests logged yet. Submit a test request via the mobile app or web portal!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Patient Name</th>
                  <th className="p-3">Group</th>
                  <th className="p-3">Hospital & City</th>
                  <th className="p-3">Urgency</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentBloodRequests.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-white">{item.patientName}</td>
                    <td className="p-3 font-bold text-red-400">
                      {BloodGroupDisplayMap[item.bloodGroup] || item.bloodGroup} ({item.unitsNeeded}U)
                    </td>
                    <td className="p-3 text-slate-400">
                      {item.hospitalName}, {item.city}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-red-950/80 text-red-300 text-[10px] font-bold border border-red-800/60">
                        {item.urgency}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300 font-mono">{item.contactPhone}</td>
                    <td className="p-3 text-slate-500">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
