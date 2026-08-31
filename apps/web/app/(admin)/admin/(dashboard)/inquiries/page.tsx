"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Building2,
  User,
  Phone,
  Mail,
  Calendar,
  Trash2,
  CheckCircle2,
  RefreshCw,
  X,
  AlertCircle,
  Clock,
  Eye,
} from "lucide-react";

export default function AdminInquiriesPage() {
  const [activeTab, setActiveTab] = useState<"PARTNERSHIPS" | "MESSAGES">("PARTNERSHIPS");
  const [partnerships, setPartnerships] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      // In a real setup or via server action, we can fetch from API
      // Let's fetch partnerships and contact
      const [resP, resC] = await Promise.all([
        fetch("/api/partnerships"),
        fetch("/api/contact"),
      ]);
      const jsonP = await resP.json();
      const jsonC = await resC.json();
      if (jsonP.success) setPartnerships(jsonP.data);
      if (jsonC.success) setMessages(jsonC.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updatePartnershipStatus = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/partnerships/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setPartnerships((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
        );
        setSuccessMsg(`Partnership status updated to ${newStatus}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const deletePartnership = async (id: string) => {
    if (!confirm("Are you sure you want to delete this partnership inquiry?")) return;

    setActionLoading(id);
    try {
      const res = await fetch(`/api/partnerships/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPartnerships((prev) => prev.filter((p) => p.id !== id));
        setSuccessMsg("Partnership inquiry deleted.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const toggleMessageRead = async (id: string, currentRead: boolean) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: !currentRead }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, isRead: !currentRead } : m))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact message?")) return;

    setActionLoading(id);
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        setSuccessMsg("Message deleted.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="border-b border-prayas-rule pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-prayas-neem" />
            <span>Inquiries, CSR Proposals & Messages</span>
          </h1>
          <p className="text-xs text-prayas-muted mt-1">
            Manage incoming partnership requests, CSR proposals, and direct contact messages.
          </p>
        </div>

        <button
          onClick={fetchInquiries}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-prayas-stone text-prayas-ink font-semibold text-xs rounded-lg border border-prayas-rule shadow-sm transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Success alert */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-900 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-prayas-neem shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-green-700 hover:text-green-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-prayas-rule pb-2">
        <button
          onClick={() => setActiveTab("PARTNERSHIPS")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === "PARTNERSHIPS"
              ? "bg-[#2E5339] text-white shadow-sm"
              : "bg-white border border-prayas-rule text-prayas-ink hover:bg-prayas-stone"
          }`}
          style={activeTab === "PARTNERSHIPS" ? { backgroundColor: "#2E5339", color: "#ffffff" } : {}}
        >
          Partnership & CSR Inquiries ({partnerships.length})
        </button>

        <button
          onClick={() => setActiveTab("MESSAGES")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === "MESSAGES"
              ? "bg-[#2E5339] text-white shadow-sm"
              : "bg-white border border-prayas-rule text-prayas-ink hover:bg-prayas-stone"
          }`}
          style={activeTab === "MESSAGES" ? { backgroundColor: "#2E5339", color: "#ffffff" } : {}}
        >
          Direct Contact Messages ({messages.length})
        </button>
      </div>

      {/* TAB 1: PARTNERSHIP INQUIRIES */}
      {activeTab === "PARTNERSHIPS" && (
        <div className="bg-white border border-prayas-rule rounded-xl overflow-hidden shadow-card">
          {loading ? (
            <div className="p-12 text-center text-prayas-muted text-xs">
              Loading partnership proposals...
            </div>
          ) : partnerships.length === 0 ? (
            <div className="p-12 text-center text-prayas-muted text-xs">
              No partnership proposals recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-prayas-ink">
                <thead className="bg-prayas-stone border-b border-prayas-rule text-prayas-muted uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="p-4">Type</th>
                    <th className="p-4">Name / Company</th>
                    <th className="p-4">Contact Info</th>
                    <th className="p-4">Proposal / Areas</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-prayas-rule">
                  {partnerships.map((p) => (
                    <tr key={p.id} className="hover:bg-prayas-paper transition-colors">
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-prayas-stone border border-prayas-rule font-bold text-[10px]">
                          {p.type}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-prayas-ink text-sm">{p.contactPerson}</div>
                        {p.companyName && (
                          <div className="text-[11px] text-prayas-neem font-semibold mt-0.5">
                            {p.companyName}
                          </div>
                        )}
                      </td>

                      <td className="p-4 space-y-1 font-mono text-xs">
                        {p.email && (
                          <a
                            href={`mailto:${p.email}`}
                            className="text-prayas-muted hover:text-prayas-ink flex items-center gap-1"
                          >
                            <Mail className="w-3 h-3" />
                            <span>{p.email}</span>
                          </a>
                        )}
                        {p.phone && (
                          <a
                            href={`tel:${p.phone}`}
                            className="text-prayas-neem font-bold hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{p.phone}</span>
                          </a>
                        )}
                      </td>

                      <td className="p-4 max-w-xs">
                        <p className="text-xs text-prayas-ink line-clamp-2 leading-relaxed">
                          {p.proposal || p.notes || "Inquiry for collaborative community program."}
                        </p>
                      </td>

                      <td className="p-4">
                        <select
                          value={p.status}
                          onChange={(e) => updatePartnershipStatus(p.id, e.target.value)}
                          disabled={actionLoading === p.id}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border outline-none ${
                            p.status === "CONVERTED"
                              ? "bg-green-100 text-emerald-900 border-green-200"
                              : p.status === "CONTACTED"
                              ? "bg-blue-100 text-blue-900 border-blue-200"
                              : p.status === "PENDING"
                              ? "bg-amber-100 text-amber-900 border-amber-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="CONVERTED">CONVERTED (Partner)</option>
                          <option value="CLOSED">CLOSED</option>
                        </select>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => deletePartnership(p.id)}
                          disabled={actionLoading === p.id}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors inline-flex items-center disabled:opacity-50"
                          title="Delete inquiry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DIRECT CONTACT MESSAGES */}
      {activeTab === "MESSAGES" && (
        <div className="bg-white border border-prayas-rule rounded-xl overflow-hidden shadow-card">
          {loading ? (
            <div className="p-12 text-center text-prayas-muted text-xs">
              Loading contact messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="p-12 text-center text-prayas-muted text-xs">
              No direct contact messages received.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-prayas-ink">
                <thead className="bg-prayas-stone border-b border-prayas-rule text-prayas-muted uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="p-4">Sender & Contact</th>
                    <th className="p-4">Subject</th>
                    <th className="p-4">Message Body</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-prayas-rule">
                  {messages.map((m) => (
                    <tr key={m.id} className={`hover:bg-prayas-paper transition-colors ${!m.isRead ? "bg-green-50/40" : ""}`}>
                      <td className="p-4">
                        <div className="font-bold text-prayas-ink text-sm">{m.name}</div>
                        <div className="text-prayas-muted font-mono text-[11px] mt-0.5">{m.email}</div>
                        {m.phone && <div className="text-prayas-neem font-mono text-[11px]">{m.phone}</div>}
                      </td>

                      <td className="p-4 font-semibold text-prayas-ink">
                        {m.subject || "General Inquiry"}
                      </td>

                      <td className="p-4 max-w-sm">
                        <p className="text-xs text-prayas-ink leading-relaxed">
                          {m.message}
                        </p>
                      </td>

                      <td className="p-4 text-prayas-muted text-[11px] whitespace-nowrap">
                        {new Date(m.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => toggleMessageRead(m.id, m.isRead)}
                          disabled={actionLoading === m.id}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                            m.isRead
                              ? "bg-slate-100 text-slate-700"
                              : "bg-green-100 text-emerald-900 border border-green-200"
                          }`}
                        >
                          {m.isRead ? "Read" : "Unread (New)"}
                        </button>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => deleteMessage(m.id)}
                          disabled={actionLoading === m.id}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors inline-flex items-center disabled:opacity-50"
                          title="Delete message"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
