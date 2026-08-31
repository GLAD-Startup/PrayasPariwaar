"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, AlertCircle, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@prayaspariwaar.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid login credentials");
      }

      if (data.user?.role !== "ADMIN" && data.user?.role !== "EDITOR") {
        throw new Error("Access restricted. Authorized administrative credentials required.");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to log in. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-prayas-paper flex flex-col items-center justify-center p-4 selection:bg-prayas-neem selection:text-white">
      <div className="max-w-md w-full space-y-6">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-prayas-muted hover:text-prayas-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Public Website</span>
        </Link>

        {/* Login Card */}
        <div className="bg-white border border-prayas-rule rounded-2xl p-8 space-y-6 shadow-card">
          {/* Brand Header with Official Logo */}
          <div className="text-center space-y-3 pb-2 border-b border-prayas-rule">
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/prayas-logo.png"
                alt="Prayas Pariwaar - A Trial to Move Ahead"
                className="h-14 w-auto object-contain"
              />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-prayas-ink">
                Staff & Coordinator Portal
              </h1>
              <p className="text-xs text-prayas-muted mt-0.5">
                Prayas Pariwaar Seva Karyalaya • Vrindavan, UP
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-prayas-crimson shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-prayas-ink block">
                Administrative Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-prayas-muted absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="admin@prayaspariwaar.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-prayas-ink block">
                Secret Access Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-prayas-muted absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-prayas-rule bg-prayas-paper text-prayas-ink font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-lg font-bold text-xs bg-[#2E5339] text-white hover:bg-[#23432b] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{loading ? "Authenticating Seva Credentials..." : "Sign In to Operations Console →"}</span>
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials Info */}
          <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-[11px] text-green-900 space-y-1">
            <div className="font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-prayas-neem" />
              <span>Default Coordinator Access:</span>
            </div>
            <p className="font-mono text-[10px]">
              Email: <strong>admin@prayaspariwaar.com</strong> | Password: <strong>admin123</strong>
            </p>
          </div>

          <div className="text-center pt-2 text-[11px] text-prayas-muted border-t border-prayas-rule">
            🔒 Protected by JWT Role-Based Access Control (RBAC)
          </div>
        </div>
      </div>
    </div>
  );
}
