import { prisma } from "@/lib/prisma";
import { Users, PhoneCall, Mail, CheckCircle, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminVolunteersPage() {
  let volunteers: any[] = [];
  try {
    volunteers = await prisma.volunteer.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    console.warn("DB not ready");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
          Volunteer Roster & Applications
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review community volunteer applications and assign first-responder tasks.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {volunteers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No volunteer applications submitted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-4">Volunteer</th>
                  <th className="p-4">Skills</th>
                  <th className="p-4">Availability</th>
                  <th className="p-4">Area of Interest</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {volunteers.map((vol) => (
                  <tr key={vol.id} className="hover:bg-slate-800/40">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{vol.name}</div>
                      <div className="text-slate-400 text-xs">{vol.email}</div>
                    </td>
                    <td className="p-4 text-slate-300">{vol.skills}</td>
                    <td className="p-4 text-slate-400">{vol.availability}</td>
                    <td className="p-4 text-amber-400 font-semibold">{vol.areaOfInterest}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold">
                        {vol.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <a
                        href={`tel:${vol.phone}`}
                        className="text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1"
                      >
                        <PhoneCall className="w-3 h-3 text-emerald-400" />
                        {vol.phone}
                      </a>
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
