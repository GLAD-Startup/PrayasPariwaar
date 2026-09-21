import Link from "next/link";
import Image from "next/image";
import { assetPath } from "@/lib/api";
import {
  ArrowLeft,
  Home,
  Droplet,
  Stethoscope,
  Heart,
  BookOpen,
  Phone,
  HelpCircle,
  ShieldCheck,
  Search,
  ExternalLink,
} from "lucide-react";

export default function NotFound() {
  const quickLinks = [
    {
      title: "Emergency Blood Registry",
      desc: "Instant donor discovery & 24/7 emergency hospital matching.",
      href: "/blood-donation",
      icon: Droplet,
      accent: "text-rose-600",
      bgAccent: "bg-rose-50 border-rose-200",
    },
    {
      title: "Medical Equipment Bank",
      desc: "Borrow oxygen concentrators, hospital beds & wheelchairs.",
      href: "/medical-equipment",
      icon: Stethoscope,
      accent: "text-emerald-700",
      bgAccent: "bg-emerald-50 border-emerald-200",
    },
    {
      title: "Support Our Causes",
      desc: "Direct community donations powering rural education & health.",
      href: "/donate",
      icon: Heart,
      accent: "text-rose-600",
      bgAccent: "bg-rose-50 border-rose-200",
    },
    {
      title: "18-Year Legacy & Projects",
      desc: "Explore child education, Harit Kranti, and health camps.",
      href: "/about",
      icon: BookOpen,
      accent: "text-emerald-700",
      bgAccent: "bg-emerald-50 border-emerald-200",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#1C2421] flex flex-col justify-between selection:bg-emerald-800 selection:text-white font-sans">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-[#E2DDD5] px-4 sm:px-8 py-3.5 shadow-xs sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-1.5 rounded-xl bg-[#EFECE6] border border-[#E2DDD5] shadow-xs inline-flex items-center justify-center group-hover:scale-105 transition-transform">
              <Image
                src={assetPath("/images/prayas-logo.png")}
                alt="Prayas Pariwaar"
                width={120}
                height={32}
                className="h-8 w-auto object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-sm font-bold tracking-tight text-slate-900">
                Prayas Pariwaar
              </span>
              <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">
                Vrindavan Seva Karyalaya
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <a
              href="tel:+919927081650"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>24/7 Helpline: +91 99270 81650</span>
            </a>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1C2421] text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Homepage</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main 404 Experience */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 flex flex-col items-center justify-center text-center space-y-7">
        {/* Hero 404 Visual Icon & Code */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs flex items-center justify-center text-emerald-800">
            <HelpCircle className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.75]" />
          </div>

          <div className="space-y-1.5">
            <span className="font-serif text-6xl sm:text-7xl font-black text-slate-900 tracking-tight block">
              404
            </span>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Page Not Found</span>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-2.5 max-w-xl">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            The Path You&apos;re Looking For Has Moved
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            The page or resource you requested may have been relocated, renamed, or is temporarily offline as part of our platform improvements.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-[#1E5338] hover:bg-[#16432B] text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>

          <a
            href="tel:+919927081650"
            className="px-5 py-3 rounded-xl font-semibold text-xs sm:text-sm bg-white hover:bg-slate-50 text-slate-800 border border-[#E2DDD5] shadow-xs transition-colors flex items-center gap-2"
          >
            <Phone className="w-4 h-4 text-emerald-700" />
            <span>Emergency Seva Desk (+91 99270 81650)</span>
          </a>
        </div>

        {/* Helpful Direct Links Grid */}
        <div className="w-full pt-6 space-y-3 text-left">
          <div className="flex items-center justify-between border-b border-[#E2DDD5] pb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Popular Seva Destinations
            </span>
            <span className="text-xs text-slate-400">Direct Access</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {quickLinks.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className="p-4 rounded-2xl bg-white border border-[#E2DDD5] hover:border-emerald-600 transition-all shadow-xs hover:shadow-md flex items-start gap-3.5 group"
                >
                  <div className={`w-10 h-10 rounded-xl ${item.bgAccent} border flex items-center justify-center shrink-0 ${item.accent} group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors flex items-center gap-1">
                      <span>{item.title}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h2>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {item.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Emergency Blood Support Card */}
        <div className="w-full p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-left shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700 shrink-0">
              <Droplet className="w-4 h-4 fill-current" />
            </div>
            <div>
              <p className="font-bold text-rose-900">Immediate Blood Requirement in Braj Region?</p>
              <p className="text-[11px] text-rose-800/90">Our volunteer network coordinates emergency blood across Mathura, Vrindavan, and Agra 24/7.</p>
            </div>
          </div>
          <Link
            href="/blood-donation"
            className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs whitespace-nowrap shadow-xs transition-colors shrink-0"
          >
            Post Emergency Request →
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2DDD5] bg-white py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Prayas Pariwaar (Reg. 142/2006-07) • 18 Years of Nishkam Seva</span>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/about" className="hover:text-slate-900 transition-colors">About Society</Link>
            <Link href="/contact" className="hover:text-slate-900 transition-colors">Contact Office</Link>
            <Link href="/admin/login" className="hover:text-slate-900 transition-colors">Operations Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
