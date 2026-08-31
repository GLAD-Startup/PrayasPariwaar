import Link from "next/link";
import { Heart, Droplet, Activity, Users, ArrowRight } from "lucide-react";

const PROJECTS = [
  {
    id: "proj-blood-mobile",
    title: "Prayas Emergency Blood Mobile Response",
    slug: "blood-mobile-response",
    description: "Dedicated rapid transport vehicle equipped with cold-chain storage to transport donors & blood units directly to emergency ICU units across the district.",
    goalAmount: 500000,
    raisedAmount: 375000,
    category: "Emergency Logistics",
  },
  {
    id: "proj-oxygen-bank",
    title: "Rural Oxygen & BiPAP Equipment Bank Expansion",
    slug: "oxygen-bank-expansion",
    description: "Procuring 50 additional 10L medical-grade oxygen concentrators and BiPAP machines to serve rural patient communities with zero rental fees.",
    goalAmount: 1200000,
    raisedAmount: 890000,
    category: "Medical Infrastructure",
  },
  {
    id: "proj-first-responder",
    title: "Youth First-Responder Training Initiative",
    slug: "youth-first-responder",
    description: "Training 1,000 college students across 20 institutions in Basic Life Support (BLS), CPR, and emergency blood coordination protocols.",
    goalAmount: 300000,
    raisedAmount: 240000,
    category: "Community Training",
  },
];

export default function ProjectsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
          ACTIVE INITIATIVES & RELIEF CAUSES
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-slate-900 leading-tight">
          Current Humanitarian Projects
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Support specific healthcare and emergency relief programs with measurable, verified community impact.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PROJECTS.map((p) => {
          const progress = Math.min(Math.round((p.raisedAmount / p.goalAmount) * 100), 100);
          return (
            <div
              key={p.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full">
                  {p.category}
                </span>
                <h3 className="text-xl font-bold text-slate-900">{p.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{p.description}</p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">₹{p.raisedAmount.toLocaleString()} raised</span>
                    <span className="text-slate-500">Goal: ₹{p.goalAmount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-red-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-red-600">{progress}% funded</span>
                </div>

                <Link
                  href="/donate"
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Heart className="w-3.5 h-3.5 fill-current" /> Support This Project
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
