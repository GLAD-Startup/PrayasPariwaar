"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
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
  Search,
  ExternalLink,
  Briefcase,
  Sparkles,
  CheckCheck,
  Send,
} from "lucide-react";

export default function AdminInquiriesPage() {
  const [activeTab, setActiveTab] = useState<"PARTNERSHIPS" | "MESSAGES">("PARTNERSHIPS");
  const [partnerships, setPartnerships] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const [resP, resC] = await Promise.all([
        apiFetch("/api/partnerships"),
        apiFetch("/api/contact"),
      ]);
      const jsonP = await resP.json();
      const jsonC = await resC.json();
      if (jsonP.success) setPartnerships(jsonP.data || []);
      if (jsonC.success) setMessages(jsonC.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updatePartnershipStatus = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      const res = await apiFetch(`/api/partnerships/${id}`, {
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
      const res = await apiFetch(`/api/partnerships/${id}`, {
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
      const res = await apiFetch(`/api/contact/${id}`, {
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
      const res = await apiFetch(`/api/contact/${id}`, {
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

  const corporateCount = partnerships.filter((p) => p.type === "CORPORATE").length;
  const individualCount = partnerships.filter((p) => p.type === "INDIVIDUAL").length;
  const unreadMessagesCount = messages.filter((m) => !m.isRead).length;

  const filteredPartnerships = partnerships.filter((p) => {
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.contactPerson?.toLowerCase().includes(q) ||
      p.companyName?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phone?.toLowerCase().includes(q) ||
      p.notes?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const filteredMessages = messages.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.subject?.toLowerCase().includes(q) ||
      m.message?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* 1. Header with Stats Ribbon */}
      <div className="border border-prayas-rule bg-white rounded-2xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-900">
            <MessageSquare className="w-3.5 h-3.5 text-indigo-700" />
            <span>Institutional Alliances & Community Desk</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink">
            Inquiries, CSR Proposals & Messages
          </h1>
          <p className="text-xs text-prayas-muted max-w-2xl">
            Manage incoming partnership requests, CSR alliance proposals, and direct contact inquiries submitted through the public website.
          </p>
        </div>

        <button
          onClick={fetchInquiries}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-prayas-stone hover:bg-prayas-paper text-prayas-ink font-semibold text-xs rounded-xl border border-prayas-rule shadow-sm transition-colors self-start md:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-700" : ""}`} />
          <span>Refresh Desk</span>
        </button>
      </div>

      {/* 2. Top Stats Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="border border-prayas-rule bg-white rounded-xl p-4 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-prayas-muted uppercase tracking-wider">Total Received</span>
          <p className="font-serif text-2xl font-bold text-prayas-ink">
            {partnerships.length + messages.length}
          </p>
          <span className="text-[10px] text-slate-400">All submissions</span>
        </div>

        <div className="border border-indigo-200 bg-indigo-50/50 rounded-xl p-4 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-indigo-700" />
            Corporate CSR Leads
          </span>
          <p className="font-serif text-2xl font-bold text-indigo-950">{corporateCount}</p>
          <span className="text-[10px] text-indigo-700 font-medium">Institutional alliances</span>
        </div>

        <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-4 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-emerald-700" />
            Individual Patrons
          </span>
          <p className="font-serif text-2xl font-bold text-emerald-950">{individualCount}</p>
          <span className="text-[10px] text-emerald-700 font-medium">Philanthropic supporters</span>
        </div>

        <div className="border border-amber-200 bg-amber-50/50 rounded-xl p-4 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
            Unread Contact Msgs
          </span>
          <p className="font-serif text-2xl font-bold text-amber-950">{unreadMessagesCount}</p>
          <span className="text-[10px] text-amber-700 font-medium">General inquiries</span>
        </div>
      </div>

      {/* Success alert */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Navigation Tabs and Filter Bar */}
      <div className="border border-prayas-rule bg-white rounded-2xl p-4 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setActiveTab("PARTNERSHIPS");
                setSearchQuery("");
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "PARTNERSHIPS"
                  ? "bg-[#2E5339] text-white shadow-md"
                  : "bg-prayas-stone text-prayas-ink hover:bg-slate-200 border border-prayas-rule"
              }`}
              style={activeTab === "PARTNERSHIPS" ? { backgroundColor: "#2E5339", color: "#ffffff" } : {}}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Partnership & CSR Inquiries ({partnerships.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("MESSAGES");
                setSearchQuery("");
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "MESSAGES"
                  ? "bg-[#2E5339] text-white shadow-md"
                  : "bg-prayas-stone text-prayas-ink hover:bg-slate-200 border border-prayas-rule"
              }`}
              style={activeTab === "MESSAGES" ? { backgroundColor: "#2E5339", color: "#ffffff" } : {}}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Direct Contact Messages ({messages.length})</span>
              {unreadMessagesCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {activeTab === "PARTNERSHIPS" && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-prayas-stone/60 border border-prayas-rule text-prayas-ink rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-prayas-neem"
              >
                <option value="ALL">All Statuses ({partnerships.length})</option>
                <option value="PENDING">PENDING</option>
                <option value="CONTACTED">CONTACTED</option>
                <option value="CONVERTED">CONVERTED (Partner)</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            )}

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-prayas-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={activeTab === "PARTNERSHIPS" ? "Search company, person..." : "Search messages..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-prayas-rule bg-prayas-stone/40 text-xs text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. TAB 1: PARTNERSHIP INQUIRIES */}
      {activeTab === "PARTNERSHIPS" && (
        <div className="bg-white border border-prayas-rule rounded-2xl overflow-hidden shadow-card">
          {loading ? (
            <div className="p-16 text-center text-prayas-muted text-xs">
              <RefreshCw className="w-6 h-6 text-indigo-700 animate-spin mx-auto mb-2" />
              <p className="font-semibold text-prayas-ink">Loading partnership proposals...</p>
            </div>
          ) : filteredPartnerships.length === 0 ? (
            <div className="p-16 text-center text-prayas-muted text-xs space-y-3">
              <Building2 className="w-10 h-10 text-indigo-700 mx-auto opacity-70" />
              <h3 className="font-serif text-lg font-bold text-prayas-ink">
                No Partnership Proposals Recorded Yet
              </h3>
              <p className="max-w-md mx-auto leading-relaxed">
                Corporate CSR proposals and individual patronage inquiries submitted via <Link href="/partner/corporate" target="_blank" className="text-prayas-neem underline font-semibold">/partner/corporate</Link> and <Link href="/partner/individual" target="_blank" className="text-prayas-neem underline font-semibold">/partner/individual</Link> will automatically populate this ledger.
              </p>
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
                  {filteredPartnerships.map((p) => (
                    <tr key={p.id} className="hover:bg-prayas-stone/30 transition-colors">
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          p.type === "CORPORATE"
                            ? "bg-indigo-50 text-indigo-800 border-indigo-200"
                            : "bg-emerald-50 text-emerald-800 border-emerald-200"
                        }`}>
                          {p.type}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-prayas-ink text-sm">{p.contactPerson}</div>
                        {p.companyName && (
                          <div className="text-[11px] text-indigo-700 font-semibold mt-0.5 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-indigo-500" />
                            <span>{p.companyName}</span>
                          </div>
                        )}
                        {p.designation && (
                          <div className="text-[10px] text-prayas-muted italic">
                            {p.designation}
                          </div>
                        )}
                      </td>

                      <td className="p-4 space-y-1 font-mono text-xs">
                        {p.email && (
                          <a
                            href={`mailto:${p.email}`}
                            className="text-prayas-muted hover:text-prayas-ink flex items-center gap-1 text-[11px]"
                          >
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{p.email}</span>
                          </a>
                        )}
                        {p.phone && (
                          <a
                            href={`tel:${p.phone}`}
                            className="text-prayas-neem font-bold hover:underline flex items-center gap-1 text-[11px]"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{p.phone}</span>
                          </a>
                        )}
                      </td>

                      <td className="p-4 max-w-xs">
                        <p className="text-xs text-prayas-ink leading-relaxed">
                          {p.notes || "CSR Partnership Exploration with Prayas Pariwaar."}
                        </p>
                        {p.focusArea && (
                          <span className="inline-block mt-1 text-[10px] bg-prayas-stone px-2 py-0.5 rounded border border-prayas-rule font-medium text-slate-600">
                            Pillar: {p.focusArea}
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <select
                          value={p.status}
                          onChange={(e) => updatePartnershipStatus(p.id, e.target.value)}
                          disabled={actionLoading === p.id}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border outline-none ${
                            p.status === "CONVERTED"
                              ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                              : p.status === "CONTACTED"
                              ? "bg-blue-100 text-blue-900 border-blue-300"
                              : p.status === "PENDING"
                              ? "bg-amber-100 text-amber-900 border-amber-300"
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
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center disabled:opacity-50"
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

      {/* 5. TAB 2: DIRECT CONTACT MESSAGES */}
      {activeTab === "MESSAGES" && (
        <div className="bg-white border border-prayas-rule rounded-2xl overflow-hidden shadow-card">
          {loading ? (
            <div className="p-16 text-center text-prayas-muted text-xs">
              <RefreshCw className="w-6 h-6 text-indigo-700 animate-spin mx-auto mb-2" />
              <p className="font-semibold text-prayas-ink">Loading contact messages...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-16 text-center text-prayas-muted text-xs space-y-3">
              <MessageSquare className="w-10 h-10 text-prayas-neem mx-auto opacity-70" />
              <h3 className="font-serif text-lg font-bold text-prayas-ink">
                No Direct Contact Messages Received
              </h3>
              <p className="max-w-md mx-auto leading-relaxed">
                Messages submitted through the public Contact page form will appear here in real-time.
              </p>
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
                  {filteredMessages.map((m) => (
                    <tr key={m.id} className={`hover:bg-prayas-stone/30 transition-colors ${!m.isRead ? "bg-amber-50/30" : ""}`}>
                      <td className="p-4">
                        <div className="font-bold text-prayas-ink text-sm">{m.name}</div>
                        <div className="text-prayas-muted font-mono text-[11px] mt-0.5 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{m.email}</span>
                        </div>
                        {m.phone && (
                          <div className="text-prayas-neem font-mono text-[11px] flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" />
                            <span>{m.phone}</span>
                          </div>
                        )}
                      </td>

                      <td className="p-4 font-semibold text-prayas-ink">
                        {m.subject || "General Seva Inquiry"}
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
                              : "bg-amber-100 text-amber-900 border border-amber-300 font-bold"
                          }`}
                        >
                          {m.isRead ? "Read" : "Unread (New)"}
                        </button>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => deleteMessage(m.id)}
                          disabled={actionLoading === m.id}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center disabled:opacity-50"
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
