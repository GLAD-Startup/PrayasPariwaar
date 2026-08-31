"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@prayaspariwaar.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
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

  const fillDemoCredentials = (role: "admin" | "editor") => {
    if (role === "admin") {
      setEmail("admin@prayaspariwaar.com");
      setPassword("admin123");
    } else {
      setEmail("editor@prayaspariwaar.com");
      setPassword("editor123");
    }
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] relative flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-prayas-neem selection:text-white">
      {/* Decorative Subtle Background Aura */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#2E5339]/10 via-[#2E5339]/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[350px] h-[350px] bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #1C2421 1px, transparent 0)`,
          backgroundSize: "28px 28px",
        }}
      />

      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-prayas-muted hover:text-prayas-ink transition-colors bg-white px-3 py-1.5 rounded-lg border border-prayas-rule shadow-subtle"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Website</span>
          </Link>

          <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>Seva Karyalaya v1.0</span>
          </span>
        </div>

        {/* Elevated Light Card */}
        <div className="bg-white border border-prayas-rule rounded-3xl p-7 sm:p-9 shadow-card space-y-6 text-prayas-ink relative">
          {/* Top Accent Line */}
          <div className="absolute top-0 left-8 right-8 h-1 bg-[#2E5339] rounded-b" />

          {/* Brand Header with Official Logo */}
          <div className="text-center space-y-3 pb-3 border-b border-prayas-rule">
            <div className="flex justify-center">
              <div className="p-2 rounded-2xl bg-prayas-stone border border-prayas-rule shadow-sm inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/prayas-logo.png"
                  alt="Prayas Pariwaar - A Trial to Move Ahead"
                  className="h-12 w-auto object-contain"
                />
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800 mb-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Authorized Staff & Coordinator Portal</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink tracking-tight">
                Operations Console
              </h1>
              <p className="text-xs text-prayas-muted mt-0.5">
                Prayas Pariwaar Seva Karyalaya • Vrindavan, UP
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-prayas-crimson shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-prayas-ink block">
                Administrative Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-prayas-muted absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="admin@prayaspariwaar.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/40 text-prayas-ink font-medium placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem focus:border-prayas-neem transition-all text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-prayas-ink block">
                Secret Access Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-prayas-muted absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-prayas-rule bg-prayas-stone/40 text-prayas-ink font-medium placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-prayas-neem focus:border-prayas-neem transition-all text-xs sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-prayas-muted hover:text-prayas-ink transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm bg-[#2E5339] text-white hover:bg-[#23432b] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
              >
                <KeyRound className="w-4 h-4" />
                <span>{loading ? "Authenticating Seva Credentials..." : "Sign In to Operations Console →"}</span>
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials Info Box with 1-Click Fill */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-emerald-950">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Default Credentials (Demo):</span>
              </span>
              <span className="text-[10px] text-emerald-700 font-mono">1-Click Auto-Fill</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemoCredentials("admin")}
                className="p-2 rounded-lg bg-white hover:bg-emerald-100/60 border border-emerald-300 text-left transition-all group shadow-sm"
              >
                <strong className="block text-[11px] text-emerald-950 font-bold group-hover:text-emerald-800">
                  Admin Coordinator
                </strong>
                <span className="text-[10px] text-slate-500 font-mono block">admin123</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoCredentials("editor")}
                className="p-2 rounded-lg bg-white hover:bg-emerald-100/60 border border-emerald-300 text-left transition-all group shadow-sm"
              >
                <strong className="block text-[11px] text-emerald-950 font-bold group-hover:text-emerald-800">
                  Field Editor
                </strong>
                <span className="text-[10px] text-slate-500 font-mono block">editor123</span>
              </button>
            </div>
          </div>

          <div className="text-center pt-1 text-[11px] text-prayas-muted border-t border-prayas-rule flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-prayas-neem" />
            <span>Protected by JWT Role-Based Access Control (RBAC)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
