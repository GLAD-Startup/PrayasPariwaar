"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import {
  Bell,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  ShieldAlert,
  Smartphone,
  Sparkles,
  Droplet,
  Heart,
  Stethoscope,
  TreePine,
  RefreshCw,
  X,
  Radio,
  MapPin,
  CheckCheck,
} from "lucide-react";

export default function AdminNotificationsPage() {
  const [form, setForm] = useState({
    title: "🚨 EMERGENCY: O-Positive Blood Needed at Ramakrishna Mission Hospital",
    body: "2 units needed urgently for emergency patient in Vrindavan. Please contact +91 94122 79000 if you can donate.",
    type: "BLOOD_REQUEST",
    targetBloodGroup: "O_POSITIVE",
    targetCity: "Vrindavan",
  });
  const [broadcasting, setBroadcasting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/notifications");
      const data = await res.json();
      if (data.success) {
        setHistory(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const templates = [
    {
      label: "🚨 Urgent Blood Alert",
      icon: Droplet,
      accent: "text-rose-700 bg-rose-50 border-rose-200",
      data: {
        title: "🚨 EMERGENCY: O+ Blood Needed at District Hospital Mathura",
        body: "Urgent 2 units of O-Positive blood needed for emergency trauma case. Please call +91 94122 79000 immediately.",
        type: "BLOOD_REQUEST",
        targetBloodGroup: "O_POSITIVE",
        targetCity: "Mathura",
      },
    },
    {
      label: "🩺 Free Health Camp",
      icon: Stethoscope,
      accent: "text-emerald-700 bg-emerald-50 border-emerald-200",
      data: {
        title: "🩺 Free Health & Dental Checkup Camp this Sunday",
        body: "Prayas Pariwaar is organizing a free health screening camp at Chhatikara Village from 9:00 AM to 2:00 PM. Volunteers required.",
        type: "EVENT",
        targetBloodGroup: "ALL",
        targetCity: "Vrindavan",
      },
    },
    {
      label: "🌳 Plantation Seva Drive",
      icon: TreePine,
      accent: "text-green-700 bg-green-50 border-green-200",
      data: {
        title: "🌳 Vrindavan Harit Kranti: 100 Neem Trees Plantation Drive",
        body: "Join us this Saturday at 7:00 AM on Parikrama Marg for planting native sacred trees with protective guards.",
        type: "EVENT",
        targetBloodGroup: "ALL",
        targetCity: "Vrindavan",
      },
    },
    {
      label: "📢 General Announcement",
      icon: Sparkles,
      accent: "text-blue-700 bg-blue-50 border-blue-200",
      data: {
        title: "📢 Prayas Pariwaar Seva Update",
        body: "Thank you to all donors and volunteers for supporting our ongoing community programs across Mathura district.",
        type: "GENERAL",
        targetBloodGroup: "ALL",
        targetCity: "ALL",
      },
    },
  ];

  const applyTemplate = (t: any) => {
    setForm(t.data);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcasting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await apiFetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(data.message || "Push notification broadcasted successfully to all active devices.");
        fetchHistory();
      } else {
        setErrorMsg(data.error || "Failed to broadcast notification");
      }
    } catch (err: any) {
      setErrorMsg("Network error broadcasting push notification.");
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Status Ribbon */}
      <div className="border border-prayas-rule bg-white rounded-2xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-purple-900">
            <Radio className="w-3.5 h-3.5 text-purple-700 animate-pulse" />
            <span>Expo Mobile Push Dispatch Gateway</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink">
            Expo Mobile Push Broadcaster
          </h1>
          <p className="text-xs text-prayas-muted max-w-2xl">
            Broadcast high-priority push alerts to all registered volunteer and emergency blood donor devices across Mathura, Vrindavan, and Agra.
          </p>
        </div>

        <button
          onClick={fetchHistory}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-prayas-stone hover:bg-prayas-paper text-prayas-ink font-semibold text-xs rounded-xl border border-prayas-rule shadow-sm transition-colors self-start md:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-purple-700" : ""}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* 2. Top Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="border border-prayas-rule bg-white rounded-xl p-4 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-prayas-muted uppercase tracking-wider">Gateway Status</span>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <p className="font-serif text-lg font-bold text-emerald-950">Active & Ready</p>
          </div>
          <span className="text-[10px] text-slate-400">Expo push server v2</span>
        </div>

        <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-4 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Target Reach</span>
          <p className="font-serif text-2xl font-bold text-emerald-950">All Devices</p>
          <span className="text-[10px] text-emerald-700 font-medium">Braj volunteer network</span>
        </div>

        <div className="border border-purple-200 bg-purple-50/50 rounded-xl p-4 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">Total Broadcasts</span>
          <p className="font-serif text-2xl font-bold text-purple-950">{history.length}</p>
          <span className="text-[10px] text-purple-700 font-medium">Sent from console</span>
        </div>

        <div className="border border-rose-200 bg-rose-50/50 rounded-xl p-4 shadow-card space-y-1">
          <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Dispatch Latency</span>
          <p className="font-serif text-2xl font-bold text-rose-950">&lt; 2.5s</p>
          <span className="text-[10px] text-rose-700 font-medium">Instant lockscreen delivery</span>
        </div>
      </div>

      {/* Notifications */}
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

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-700 hover:text-red-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Quick Message Preset Templates */}
      <div className="border border-prayas-rule bg-white rounded-2xl p-5 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-prayas-ink flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Quick-Load Broadcast Templates:</span>
          </span>
          <span className="text-[10px] text-prayas-muted">Click any chip to prefill form</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {templates.map((tpl, i) => {
            const Icon = tpl.icon;
            return (
              <button
                key={i}
                type="button"
                onClick={() => applyTemplate(tpl)}
                className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-[0.99] flex items-center gap-2.5 shadow-sm ${tpl.accent}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold truncate">{tpl.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Main 2-Column Grid: Composer + Live Smartphone Simulator & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Compose Push Broadcast */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border border-prayas-rule bg-white rounded-2xl p-6 sm:p-7 shadow-card space-y-5">
            <div className="border-b border-prayas-rule pb-3 flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-prayas-ink flex items-center gap-2">
                <Send className="w-4 h-4 text-[#2E5339]" />
                <span>Compose Push Broadcast</span>
              </h2>
              <span className="text-xs text-prayas-muted">Live dispatch</span>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-prayas-ink">Notification Title *</label>
                  <span className="text-[10px] text-prayas-muted font-mono">{form.title.length}/65 chars</span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. 🚨 EMERGENCY: O-Positive Blood Needed at Ramakrishna Mission Hospital"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/40 text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-medium text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-prayas-ink">Message Body *</label>
                  <span className="text-[10px] text-prayas-muted font-mono">{form.body.length}/180 chars</span>
                </div>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. 2 units needed urgently for post-operative patient. Please contact +91 94122 79000 if available."
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/40 text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem text-xs sm:text-sm leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-prayas-ink">Category / Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-prayas-rule bg-prayas-stone/40 text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-semibold text-xs"
                  >
                    <option value="BLOOD_REQUEST">🚨 Blood Request Alert</option>
                    <option value="EVENT">📅 Community Event</option>
                    <option value="GENERAL">📢 General Bulletin</option>
                    <option value="EQUIPMENT_UPDATE">📦 Equipment Bank Update</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-prayas-ink">Target Blood Group</label>
                  <select
                    value={form.targetBloodGroup}
                    onChange={(e) => setForm({ ...form, targetBloodGroup: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-prayas-rule bg-prayas-stone/40 text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-semibold text-xs"
                  >
                    <option value="ALL">All Donors (Universal)</option>
                    <option value="O_POSITIVE">O+ Positive</option>
                    <option value="O_NEGATIVE">O- Negative</option>
                    <option value="A_POSITIVE">A+ Positive</option>
                    <option value="A_NEGATIVE">A- Negative</option>
                    <option value="B_POSITIVE">B+ Positive</option>
                    <option value="B_NEGATIVE">B- Negative</option>
                    <option value="AB_POSITIVE">AB+ Positive</option>
                    <option value="AB_NEGATIVE">AB- Negative</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-prayas-ink">Target City</label>
                  <select
                    value={form.targetCity}
                    onChange={(e) => setForm({ ...form, targetCity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-prayas-rule bg-prayas-stone/40 text-prayas-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem font-semibold text-xs"
                  >
                    <option value="ALL">All Towns (Mathura Dist.)</option>
                    <option value="Vrindavan">Vrindavan</option>
                    <option value="Mathura">Mathura</option>
                    <option value="Govardhan">Govardhan</option>
                    <option value="Agra">Agra</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-prayas-rule flex items-center justify-between">
                <div className="text-[11px] text-prayas-muted flex items-center gap-1.5">
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Will trigger immediate push to iOS & Android apps</span>
                </div>

                <button
                  type="submit"
                  disabled={broadcasting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#2E5339] text-white hover:bg-[#23432b] transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{broadcasting ? "Dispatching via Expo Gateway..." : "Broadcast Push Notification →"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column (5 cols): Live Smartphone Notification Simulator & Logs */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Smartphone Lockscreen Preview Card */}
          <div className="border border-prayas-rule bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">Live Lockscreen Simulator</span>
              </div>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
                iOS / Android
              </span>
            </div>

            {/* Simulated Notification Card */}
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5 shadow-lg">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-[#2E5339] flex items-center justify-center text-[9px] font-bold text-white">
                    P
                  </div>
                  <span className="font-bold tracking-wide text-white uppercase text-[10px]">
                    Prayas Pariwaar
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">now</span>
              </div>

              <div className="font-bold text-xs text-white leading-snug">
                {form.title || "Emergency Blood Alert"}
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-3">
                {form.body || "Notification body message will appear here in real-time as you compose your dispatch."}
              </p>
            </div>

            <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1.5">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>Target Audience: {form.targetBloodGroup === "ALL" ? "All Registered Donors" : form.targetBloodGroup} in {form.targetCity === "ALL" ? "All Locations" : form.targetCity}</span>
            </div>
          </div>

          {/* Recent Broadcast Logs */}
          <div className="border border-prayas-rule bg-white rounded-2xl p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between border-b border-prayas-rule pb-2">
              <h3 className="font-serif text-sm font-bold text-prayas-ink flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-700" />
                <span>Recent Broadcast History ({history.length})</span>
              </h3>
            </div>

            {loading ? (
              <div className="p-8 text-center text-prayas-muted text-xs">
                <RefreshCw className="w-5 h-5 text-purple-700 animate-spin mx-auto mb-1" />
                <span>Loading logs...</span>
              </div>
            ) : history.length === 0 ? (
              <div className="p-8 text-center text-prayas-muted text-xs space-y-2">
                <CheckCircle2 className="w-8 h-8 text-prayas-neem mx-auto" />
                <p className="font-bold text-prayas-ink">No past push broadcasts found.</p>
                <p>Broadcasts dispatched via the form above will be logged here with recipient metrics.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 text-xs">
                {history.map((h) => (
                  <div
                    key={h.id}
                    className="p-3 rounded-xl border border-prayas-rule bg-prayas-stone/40 hover:bg-prayas-stone/70 transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-prayas-ink">
                      <span className="truncate max-w-[200px]">{h.title}</span>
                      <span className="text-[10px] text-prayas-muted font-mono shrink-0">
                        {new Date(h.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <p className="text-prayas-muted text-[11px] line-clamp-2 leading-relaxed">
                      {h.body}
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[10px]">
                      <span className="font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        ✓ Sent to {h.recipientCount || 1} devices
                      </span>
                      <span className="font-semibold text-slate-500 uppercase">{h.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
