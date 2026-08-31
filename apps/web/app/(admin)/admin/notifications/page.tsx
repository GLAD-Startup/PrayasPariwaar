"use client";

import { useState, useEffect } from "react";
import { Bell, Send, CheckCircle2, AlertCircle, Clock, Users, ShieldAlert } from "lucide-react";

export default function AdminNotificationsPage() {
  const [form, setForm] = useState({
    title: "",
    body: "",
    type: "GENERAL",
    targetBloodGroup: "ALL",
    targetCity: "ALL",
  });
  const [broadcasting, setBroadcasting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success) {
        setHistory(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcasting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(data.message);
        setForm({
          title: "",
          body: "",
          type: "GENERAL",
          targetBloodGroup: "ALL",
          targetCity: "ALL",
        });
        fetchHistory();
      } else {
        setErrorMsg(data.error || "Failed to broadcast notification");
      }
    } catch (err: any) {
      setErrorMsg("Network error broadcasting push notification");
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className="space-y-10 max-w-5xl">
      <div className="border-b border-prayas-rule pb-4">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink flex items-center gap-2">
          <Bell className="w-6 h-6 text-prayas-neem" /> Expo Mobile Push Broadcaster
        </h1>
        <p className="text-xs text-prayas-muted mt-1">
          Send instant push notifications to all registered donor and volunteer mobile devices in Mathura district.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Composer Form */}
        <div className="lg:col-span-7">
          <div className="border border-prayas-rule bg-white rounded p-6 shadow-card space-y-5">
            <h2 className="font-serif text-lg font-bold text-prayas-ink border-b border-prayas-rule pb-2">
              Compose Push Broadcast
            </h2>

            {successMsg && (
              <div className="p-3.5 rounded border border-green-200 bg-green-50 text-xs text-green-900">
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded border border-red-200 bg-red-50 text-xs text-red-800">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-prayas-ink">Notification Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 🚨 EMERGENCY: O-Positive Blood Needed at Ramakrishna Mission Hospital"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2.5 rounded border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-prayas-ink">Message Body *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. 2 units needed urgently for post-operative patient. Please contact +91 94122 79000 if available."
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  className="w-full p-2.5 rounded border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-prayas-ink">Category / Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full p-2.5 rounded border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white"
                  >
                    <option value="BLOOD_REQUEST">Blood Request Alert</option>
                    <option value="EVENT">Community Event</option>
                    <option value="GENERAL">General Bulletin</option>
                    <option value="EQUIPMENT_UPDATE">Equipment Bank Update</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-prayas-ink">Target Blood Group</label>
                  <select
                    value={form.targetBloodGroup}
                    onChange={(e) => setForm({ ...form, targetBloodGroup: e.target.value })}
                    className="w-full p-2.5 rounded border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white"
                  >
                    <option value="ALL">All Donors</option>
                    <option value="A_POSITIVE">A+</option>
                    <option value="A_NEGATIVE">A-</option>
                    <option value="B_POSITIVE">B+</option>
                    <option value="B_NEGATIVE">B-</option>
                    <option value="AB_POSITIVE">AB+</option>
                    <option value="AB_NEGATIVE">AB-</option>
                    <option value="O_POSITIVE">O+</option>
                    <option value="O_NEGATIVE">O-</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-prayas-ink">Target City</label>
                  <select
                    value={form.targetCity}
                    onChange={(e) => setForm({ ...form, targetCity: e.target.value })}
                    className="w-full p-2.5 rounded border border-prayas-rule bg-prayas-paper text-prayas-ink focus:bg-white"
                  >
                    <option value="ALL">All Towns (Mathura Dist.)</option>
                    <option value="Vrindavan">Vrindavan</option>
                    <option value="Mathura">Mathura</option>
                    <option value="Govardhan">Govardhan</option>
                    <option value="Agra">Agra</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={broadcasting}
                  className="px-6 py-2.5 rounded text-xs font-bold bg-prayas-neem text-white hover:bg-[#23432b] transition-colors shadow-subtle flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {broadcasting ? "Dispatching via Expo API..." : "Broadcast Push Notification"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Broadcast History */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border border-prayas-rule bg-white rounded p-5 shadow-card space-y-4">
            <h3 className="font-serif text-base font-bold text-prayas-ink border-b border-prayas-rule pb-2">
              Recent Broadcast Logs
            </h3>

            {history.length === 0 ? (
              <p className="text-xs text-prayas-muted text-center py-6">
                No past push broadcasts found.
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1 text-xs">
                {history.map((h) => (
                  <div key={h.id} className="p-3 rounded border border-prayas-rule bg-prayas-stone space-y-1">
                    <div className="flex items-center justify-between font-bold text-prayas-ink">
                      <span>{h.title}</span>
                      <span className="text-[10px] text-prayas-muted">
                        {new Date(h.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <p className="text-prayas-muted text-[11px] leading-relaxed">
                      {h.body}
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[10px] text-prayas-muted">
                      <span>Recipients: {h.recipientCount} devices</span>
                      <span className="font-bold text-prayas-neem">{h.type}</span>
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
