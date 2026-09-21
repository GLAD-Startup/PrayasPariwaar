"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { apiFetch, assetPath } from "@/lib/api";
import {
  Lock,
  Mail,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  Eye,
  EyeOff,
  KeyRound,
  Droplet,
  Stethoscope,
  Users,
  HeartHandshake,
  Activity,
  ArrowRight,
  Shield,
  Clock,
  X,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const sessionNotice =
    errorParam === "session_expired"
      ? "Your administrative session has expired. Please sign in again to continue."
      : errorParam === "unauthorized_role"
      ? "Access restricted. Administrative privileges are required."
      : errorParam === "invalid_token"
      ? "Your session is invalid. Please sign in again."
      : null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter both your administrative email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid login credentials. Please check and try again.");
      }

      if (data.user?.role !== "ADMIN" && data.user?.role !== "EDITOR") {
        throw new Error("Access restricted. Authorized administrative credentials required.");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 text-slate-900 selection:bg-emerald-800 selection:text-white font-sans">
      {/* ========================================================= */}
      {/* LEFT HERO BRAND PANEL (Clean Minimalist Slate & Single Green) */}
      {/* ========================================================= */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-7/12 relative flex-col justify-between p-10 xl:p-14 bg-slate-50 text-slate-900 border-r border-slate-200">
        {/* Subtle Clean Dot Matrix */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #0F172A 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* TOP BRAND HEADER */}
        <div className="relative z-10 w-full max-w-lg xl:max-w-xl mx-auto space-y-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-xs inline-flex items-center justify-center">
              <Image
                src={assetPath("/images/prayas-logo.png")}
                alt="Prayas Pariwaar Logo"
                width={160}
                height={40}
                className="h-10 w-auto object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl font-bold tracking-tight text-slate-900">
                  Prayas Pariwaar
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                  NGO Seva Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Vrindavan • Registered Public Seva & Healthcare Trust
              </p>
            </div>
          </div>
        </div>

        {/* CENTER HERO MISSION & UNIFIED FEATURE TILES (Centered in Left Half) */}
        <div className="relative z-10 my-auto py-8 space-y-7 w-full max-w-lg xl:max-w-xl mx-auto">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Central Operations & Seva Command</span>
            </div>
            <h1 className="font-serif text-3xl xl:text-4xl 2xl:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
              Empowering real-time humanitarian care across Uttar Pradesh.
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              Unified mission control for emergency voluntary blood matching, medical equipment banks, doctor camps, and donor auditing.
            </p>
          </div>

          {/* 4-Card Service Feature Grid - ALL USING SINGLE UNIFIED EMERALD ACCENT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-600 transition-all shadow-xs group">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-3 group-hover:scale-105 transition-transform">
                <Droplet className="w-4 h-4 fill-current" />
              </div>
              <h2 className="text-xs font-bold text-slate-900 tracking-wide">
                Emergency Blood Registry
              </h2>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Sub-second donor dispatch & hospital requirements coordination.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-600 transition-all shadow-xs group">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-3 group-hover:scale-105 transition-transform">
                <Stethoscope className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold text-slate-900 tracking-wide">
                Medical Equipment Bank
              </h2>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Oxygen concentrators, wheelchair leases & 24/7 inventory logs.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-600 transition-all shadow-xs group">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-3 group-hover:scale-105 transition-transform">
                <Users className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold text-slate-900 tracking-wide">
                Volunteer Taskforce
              </h2>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Field volunteer onboarding, identity verification & camp rosters.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-600 transition-all shadow-xs group">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-3 group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold text-slate-900 tracking-wide">
                Donation Receipts
              </h2>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Automated donation receipts, audit logs & donor ledger.
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM STATUS & TELEMETRY FOOTER */}
        <div className="relative z-10 pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 w-full max-w-lg xl:max-w-xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
            </span>
            <span className="font-semibold text-slate-700">
              Operations Node Online • 99.9% Uptime
            </span>
          </div>

          <span className="font-mono text-[11px] text-slate-700 font-semibold bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
            256-Bit SSL Encrypted
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT AUTH FORM PANEL (Clean Crisp White & Emerald CTA)   */}
      {/* ========================================================= */}
      <div className="w-full lg:w-1/2 xl:w-5/12 flex flex-col justify-between bg-white px-6 py-8 sm:px-10 sm:py-12 lg:p-12 xl:p-16 min-h-screen relative overflow-y-auto">
        {/* TOP BAR NAVIGATION */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors bg-slate-50 hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Return to Public Website</span>
          </Link>

          <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>Karyalaya Console</span>
          </span>
        </div>

        {/* MAIN AUTHENTICATION CONTAINER */}
        <div className="w-full max-w-md mx-auto my-auto py-8 space-y-7">
          {/* Mobile-Only Header Brand Logo */}
          <div className="lg:hidden text-center space-y-3 pb-2">
            <div className="inline-block p-2 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <Image
                src={assetPath("/images/prayas-logo.png")}
                alt="Prayas Pariwaar Logo"
                width={160}
                height={44}
                className="h-11 w-auto object-contain mx-auto"
              />
            </div>
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 block">
                Prayas Pariwaar Vrindavan
              </span>
            </div>
          </div>

          {/* Form Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold tracking-wide">
              <Shield className="w-3.5 h-3.5 text-emerald-700" />
              <span>Administrative Sign In</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Operations Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Enter your authorized staff credentials to manage emergency dispatches, inventory, and seva records.
            </p>
          </div>

          {/* Session Notice Alert Box */}
          {sessionNotice && !error && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold">Session Notice</p>
                <p className="text-amber-800 leading-snug">{sessionNotice}</p>
              </div>
            </div>
          )}

          {/* Error Alert Box */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold">Authentication Failed</p>
                <p className="text-red-700 leading-snug">{error}</p>
              </div>
            </div>
          )}

          {/* Production Authentication Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">
                Administrative Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  autoComplete="username"
                  placeholder="name@prayaspariwaar.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:border-slate-400 text-slate-900 text-xs sm:text-sm font-medium placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Secret Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">
                Secret Access Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your administrative password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white hover:border-slate-400 text-slate-900 text-xs sm:text-sm font-medium placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 p-0.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Help Link */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-800 border-slate-300 focus:ring-emerald-700"
                />
                <span>Remember this workstation</span>
              </label>

              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="font-semibold text-emerald-800 hover:text-emerald-950 hover:underline transition-colors cursor-pointer"
              >
                Need help signing in?
              </button>
            </div>

            {/* Primary Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-5 rounded-xl font-bold text-xs sm:text-sm bg-[#1A4B30] hover:bg-[#143D26] text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 group cursor-pointer"
                style={{ backgroundColor: "#1A4B30", color: "#ffffff" }}
              >
                {loading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin text-emerald-200" />
                    <span>Verifying Credentials & Permissions...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-emerald-300" />
                    <span>Sign In to Operations Console</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
          {/* Production Security Notice */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1 shadow-2xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Shield className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Authorized Personnel Only</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
              Access is restricted to verified Prayas Sanstha administrators, coordinators, and medical desk staff. Unauthorized access attempts are monitored and recorded.
            </p>
          </div>
        </div>

        {/* HELP / RECOVERY MODAL */}
        {showHelpModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <h3 className="font-serif text-lg font-bold text-slate-900">
                    Administrative Access Help
                  </h3>
                </div>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <p>
                  To protect public donation accounts, emergency blood donor data, and patient relief logs, administrative accounts do not support self-service automated resets.
                </p>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-800">
                    Central Karyalaya Help Desk:
                  </div>
                  <div className="space-y-1 font-mono text-[11px]">
                    <div>Email: <strong className="text-slate-900">av.prayas@gmail.com</strong></div>
                    <div>Helpline: <strong className="text-slate-900">+91 99270 81650</strong></div>
                    <div>Office: <span className="text-slate-700 font-sans">Prayas Karyalaya, Vrindavan, Mathura District, UP</span></div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  If you are an active coordinator who requires access credentials or a password reset, please contact your Chief Administrator.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM SECURITY BADGE & FOOTER */}
        <div className="w-full max-w-md mx-auto pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>256-Bit TLS Encryption • RBAC Protected</span>
          </div>
          <span>Prayas Pariwaar © 2026</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <LoginForm />
    </Suspense>
  );
}
