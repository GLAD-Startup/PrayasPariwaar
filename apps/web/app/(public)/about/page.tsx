import Link from "next/link";
import { ShieldCheck, Target, Eye, Users, Award, Heart, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
          ABOUT PRAYAS SANSTHA
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-slate-900 leading-tight">
          Dedicated to Restoring Health, Dignity, & Hope
        </h1>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
          Founded in 2015, Prayas Sanstha is a grassroots non-profit committed to delivering zero-cost life-saving healthcare logistics, emergency blood connectivity, and critical medical devices across India.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-display">Our Mission</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            To eliminate preventable deaths caused by the unavailability of blood, platelets, or high-cost medical equipment, and to mobilize compassionate citizens into an agile first-responder network.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Eye className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-display">Our Vision</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            A resilient community where every patient in critical distress receives immediate blood and life-support assistance within 30 minutes, regardless of their economic standing.
          </p>
        </div>
      </div>

      {/* Pillars of Integrity & Governance */}
      <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h3 className="text-2xl sm:text-3xl font-bold font-display">
            Governance & Legal Registrations
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Prayas Sanstha adheres to the highest standards of financial auditing and regulatory transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
            <p className="text-xs text-red-400 font-bold uppercase">Societies Registration</p>
            <p className="text-base font-bold text-white">PS-RAJ/2015/0982</p>
            <p className="text-xs text-slate-400">Registered under Rajasthan Societies Act, 1958.</p>
          </div>
          <div className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
            <p className="text-xs text-emerald-400 font-bold uppercase">80G Tax Exemption</p>
            <p className="text-base font-bold text-white">AAATP1234F2101</p>
            <p className="text-xs text-slate-400">50% income tax exemption for all donors.</p>
          </div>
          <div className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
            <p className="text-xs text-amber-400 font-bold uppercase">NITI Aayog Darpan</p>
            <p className="text-base font-bold text-white">RJ/2018/019283</p>
            <p className="text-xs text-slate-400">Verified NGO portal listing with Government of India.</p>
          </div>
          <div className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
            <p className="text-xs text-sky-400 font-bold uppercase">12A Certification</p>
            <p className="text-base font-bold text-white">AAATP1234F2001</p>
            <p className="text-xs text-slate-400">Permanent tax-exempt non-profit status.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
