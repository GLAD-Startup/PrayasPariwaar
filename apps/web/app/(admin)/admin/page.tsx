import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Droplet, Stethoscope, Users, Heart, ArrowUpRight, MessageSquare, Building2, Bell } from "lucide-react";
import { BloodGroupDisplayMap } from "@prayas/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    pendingBloodCount,
    pendingEquipmentCount,
    pendingVolunteersCount,
    pendingInquiriesCount,
    unreadMessagesCount,
    donationsAggregate,
    recentBloodRequests,
  ] = await Promise.all([
    prisma.bloodRequest.count({ where: { status: "PENDING" } }),
    prisma.equipmentRequest.count({ where: { status: "PENDING" } }),
    prisma.volunteer.count({ where: { status: "PENDING" } }),
    prisma.partnershipInquiry.count({ where: { status: "PENDING" } }),
    prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.donation.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCESS" },
    }),
    prisma.bloodRequest.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalDonations = donationsAggregate._sum.amount || 0;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="border-b border-prayas-rule pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink">
            Administrative Operations & Dispatch Desk
          </h1>
          <p className="text-xs text-prayas-muted mt-1">
            Real-time management of emergency blood coordination, medical equipment loans, and volunteer applications in Mathura district.
          </p>
        </div>

        <Link
          href="/admin/notifications"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded text-xs font-bold bg-prayas-neem text-white hover:bg-[#23432b] transition-colors shadow-subtle self-start sm:self-auto"
        >
          <Bell className="w-3.5 h-3.5" /> Broadcast Push Alert
        </Link>
      </div>

      {/* Pending Queues Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Link
          href="/admin/blood-requests"
          className="border border-prayas-rule bg-white rounded p-4 shadow-subtle space-y-1 hover:border-prayas-crimson transition-colors block"
        >
          <div className="flex items-center justify-between text-prayas-crimson">
            <span className="text-[11px] font-bold uppercase tracking-wider">Blood Requests</span>
            <Droplet className="w-4 h-4 fill-current" />
          </div>
          <p className="font-serif text-2xl font-bold text-prayas-ink">{pendingBloodCount}</p>
          <span className="text-[10px] text-prayas-crimson font-medium block">
            {pendingBloodCount > 0 ? "Requires active matching" : "All cases resolved"}
          </span>
        </Link>

        <Link
          href="/admin/equipment"
          className="border border-prayas-rule bg-white rounded p-4 shadow-subtle space-y-1 hover:border-prayas-neem transition-colors block"
        >
          <div className="flex items-center justify-between text-prayas-neem">
            <span className="text-[11px] font-bold uppercase tracking-wider">Equipment Leases</span>
            <Stethoscope className="w-4 h-4" />
          </div>
          <p className="font-serif text-2xl font-bold text-prayas-ink">{pendingEquipmentCount}</p>
          <span className="text-[10px] text-prayas-muted font-medium block">Pending deliveries</span>
        </Link>

        <Link
          href="/admin/volunteers"
          className="border border-prayas-rule bg-white rounded p-4 shadow-subtle space-y-1 hover:border-prayas-marigold transition-colors block"
        >
          <div className="flex items-center justify-between text-prayas-marigold">
            <span className="text-[11px] font-bold uppercase tracking-wider">Volunteers</span>
            <Users className="w-4 h-4" />
          </div>
          <p className="font-serif text-2xl font-bold text-prayas-ink">{pendingVolunteersCount}</p>
          <span className="text-[10px] text-prayas-muted font-medium block">New applications</span>
        </Link>

        <Link
          href="/admin/inquiries"
          className="border border-prayas-rule bg-white rounded p-4 shadow-subtle space-y-1 hover:border-prayas-ink transition-colors block"
        >
          <div className="flex items-center justify-between text-prayas-ink">
            <span className="text-[11px] font-bold uppercase tracking-wider">CSR & Partners</span>
            <Building2 className="w-4 h-4 text-prayas-muted" />
          </div>
          <p className="font-serif text-2xl font-bold text-prayas-ink">{pendingInquiriesCount}</p>
          <span className="text-[10px] text-prayas-muted font-medium block">Inquiry proposals</span>
        </Link>

        <Link
          href="/admin/donations"
          className="border border-prayas-rule bg-white rounded p-4 shadow-subtle space-y-1 hover:border-prayas-neem transition-colors block"
        >
          <div className="flex items-center justify-between text-prayas-neem">
            <span className="text-[11px] font-bold uppercase tracking-wider">Donations</span>
            <Heart className="w-4 h-4" />
          </div>
          <p className="font-serif text-2xl font-bold text-prayas-ink">₹{totalDonations.toLocaleString("en-IN")}</p>
          <span className="text-[10px] text-prayas-muted font-medium block">Verified 80G funds</span>
        </Link>
      </div>

      {/* Recent Emergency Blood Requests Table */}
      <div className="border border-prayas-rule bg-white rounded p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-prayas-rule pb-3">
          <h2 className="font-serif text-lg font-bold text-prayas-ink flex items-center gap-2">
            <Droplet className="w-4 h-4 text-prayas-crimson fill-current" />
            Recent Emergency Blood Requirements
          </h2>
          <Link
            href="/admin/blood-requests"
            className="text-xs text-prayas-crimson font-bold hover:underline flex items-center gap-1"
          >
            Manage Queue <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentBloodRequests.length === 0 ? (
          <div className="py-8 text-center text-prayas-muted text-xs">
            No blood requests in database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-prayas-ink">
              <thead className="bg-prayas-stone border-b border-prayas-rule text-prayas-muted uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-2.5">Patient Name</th>
                  <th className="p-2.5">Group & Units</th>
                  <th className="p-2.5">Hospital & City</th>
                  <th className="p-2.5">Urgency</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Contact Phone</th>
                  <th className="p-2.5">Time Logged</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-prayas-rule">
                {recentBloodRequests.map((item) => (
                  <tr key={item.id} className="hover:bg-prayas-paper">
                    <td className="p-2.5 font-bold">{item.patientName}</td>
                    <td className="p-2.5 font-bold text-prayas-crimson">
                      {BloodGroupDisplayMap[item.bloodGroup] || item.bloodGroup} ({item.unitsNeeded}U)
                    </td>
                    <td className="p-2.5 text-prayas-muted">
                      {item.hospitalName}, {item.city}
                    </td>
                    <td className="p-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.urgency === "CRITICAL"
                            ? "bg-red-100 text-prayas-crimson border border-red-200"
                            : "bg-amber-100 text-amber-900 border border-amber-200"
                        }`}
                      >
                        {item.urgency}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded bg-prayas-stone border border-prayas-rule text-[10px] font-bold">
                        {item.status}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono">{item.contactPhone}</td>
                    <td className="p-2.5 text-prayas-muted">
                      {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
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
