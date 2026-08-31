import { prisma } from "@/lib/prisma";
import { MessageSquare, Building2, User, Phone, Mail, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const [partnerships, contactMessages] = await Promise.all([
    prisma.partnershipInquiry.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-10 max-w-6xl">
      <div className="border-b border-prayas-rule pb-4">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink">
          Inquiries, CSR Proposals & Contact Messages
        </h1>
        <p className="text-xs text-prayas-muted mt-1">
          Review incoming patronage proposals, CSR requests, and general messages sent via the public website.
        </p>
      </div>

      {/* 1. Partnership Inquiries (CSR & Individual) */}
      <div className="border border-prayas-rule bg-white rounded p-6 shadow-card space-y-4">
        <div className="border-b border-prayas-rule pb-3 flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-prayas-ink flex items-center gap-2">
            <Building2 className="w-5 h-5 text-prayas-neem" />
            Partnership & CSR Proposals ({partnerships.length})
          </h2>
          <span className="text-xs text-prayas-muted">Individual & Corporate</span>
        </div>

        {partnerships.length === 0 ? (
          <p className="text-xs text-prayas-muted py-6 text-center">No partnership proposals recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-prayas-ink">
              <thead className="bg-prayas-stone border-b border-prayas-rule text-prayas-muted uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5">Name / Company</th>
                  <th className="p-2.5">Contact</th>
                  <th className="p-2.5">Proposal Details</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-prayas-rule">
                {partnerships.map((p) => (
                  <tr key={p.id} className="hover:bg-prayas-paper">
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded bg-prayas-stone border border-prayas-rule font-bold text-[10px]">
                        {p.type}
                      </span>
                    </td>
                    <td className="p-2.5 font-bold">
                      {p.name}
                      {p.organizationName && <span className="block text-prayas-muted font-normal text-[11px]">{p.organizationName}</span>}
                    </td>
                    <td className="p-2.5 font-mono">
                      <p>{p.phone}</p>
                      <p className="text-prayas-muted text-[11px] font-sans">{p.email}</p>
                    </td>
                    <td className="p-2.5 text-prayas-muted max-w-xs leading-relaxed">
                      {p.message || "—"}
                    </td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-prayas-muted">
                      {new Date(p.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 2. Contact Form Messages */}
      <div className="border border-prayas-rule bg-white rounded p-6 shadow-card space-y-4">
        <div className="border-b border-prayas-rule pb-3 flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-prayas-ink flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-prayas-marigold" />
            General Contact Messages ({contactMessages.length})
          </h2>
        </div>

        {contactMessages.length === 0 ? (
          <p className="text-xs text-prayas-muted py-6 text-center">No contact messages received.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-prayas-ink">
              <thead className="bg-prayas-stone border-b border-prayas-rule text-prayas-muted uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-2.5">Sender</th>
                  <th className="p-2.5">Contact</th>
                  <th className="p-2.5">Subject</th>
                  <th className="p-2.5">Message</th>
                  <th className="p-2.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-prayas-rule">
                {contactMessages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-prayas-paper">
                    <td className="p-2.5 font-bold">{msg.name}</td>
                    <td className="p-2.5">
                      <p className="font-sans">{msg.email}</p>
                      {msg.phone && <p className="font-mono text-prayas-muted text-[11px]">{msg.phone}</p>}
                    </td>
                    <td className="p-2.5 font-semibold text-prayas-ink">{msg.subject}</td>
                    <td className="p-2.5 text-prayas-muted max-w-sm leading-relaxed">{msg.message}</td>
                    <td className="p-2.5 text-prayas-muted">
                      {new Date(msg.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
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
