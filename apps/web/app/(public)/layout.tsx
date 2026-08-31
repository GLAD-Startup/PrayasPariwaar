import Link from "next/link";
import { Heart, PhoneCall, ShieldAlert, Sparkles, Droplet, Activity, Users, HelpCircle } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Emergency Ticker */}
      <div className="bg-red-600 text-white text-xs sm:text-sm font-medium py-2 px-4 flex items-center justify-between shadow-inner">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            <span className="font-semibold tracking-wide">
              24/7 EMERGENCY BLOOD HELPLINE:
            </span>
            <a
              href="tel:+919876543210"
              className="underline font-bold hover:text-red-100 flex items-center gap-1"
            >
              <PhoneCall className="w-3.5 h-3.5 inline" /> +91 98765 43210
            </a>
          </div>
          <div className="hidden md:flex items-center gap-4 text-red-100 text-xs">
            <span>✨ 80G Tax Exemption Certified</span>
            <span>•</span>
            <span>NITI Aayog Darpan Registered</span>
            <span>•</span>
            <Link href="/admin/login" className="hover:text-white underline">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header / Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Droplet className="w-6 h-6 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold font-display tracking-tight text-slate-900 leading-none">
                  PRAYAS <span className="text-red-600">SANSTHA</span>
                </span>
                <span className="text-[11px] font-medium text-slate-500 tracking-wider uppercase mt-1">
                  Humanitarian Aid & Life Care
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-700">
              <Link href="/" className="hover:text-red-600 transition-colors">
                Home
              </Link>
              <Link href="/about" className="hover:text-red-600 transition-colors">
                About Us
              </Link>
              <Link
                href="/blood-donation"
                className="hover:text-red-600 flex items-center gap-1.5 transition-colors text-red-600 font-semibold"
              >
                <Droplet className="w-4 h-4 text-red-600 fill-red-600" />
                Blood Bank
              </Link>
              <Link
                href="/medical-equipment"
                className="hover:text-red-600 flex items-center gap-1 transition-colors"
              >
                <Activity className="w-4 h-4 text-emerald-600" />
                Equipment Bank
              </Link>
              <Link href="/projects" className="hover:text-red-600 transition-colors">
                Projects
              </Link>
              <Link href="/volunteer" className="hover:text-red-600 transition-colors">
                Volunteer
              </Link>
              <Link href="/contact" className="hover:text-red-600 transition-colors">
                Contact
              </Link>
            </nav>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/blood-donation"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 transition-all shadow-sm"
              >
                <ShieldAlert className="w-4 h-4 text-red-600" />
                Request Blood
              </Link>
              <Link
                href="/donate"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-all shadow-md shadow-red-500/20 active:scale-95"
              >
                <Heart className="w-4 h-4 fill-current" />
                Donate Now
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
            {/* Column 1: Organization Bio */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white">
                  <Droplet className="w-6 h-6 fill-current" />
                </div>
                <span className="text-xl font-bold font-display text-white">
                  PRAYAS SANSTHA
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-md">
                Prayas Sanstha is a registered non-profit organization dedicated to saving lives through rapid emergency blood donation matching, free community medical equipment leasing, and humanitarian aid.
              </p>
              <div className="pt-2 text-xs text-slate-400 space-y-1">
                <p>📋 <strong className="text-slate-300">Reg No:</strong> PS-RAJ/2015/0982</p>
                <p>💳 <strong className="text-slate-300">80G Exemption:</strong> AAATP1234F2101</p>
                <p>🏛️ <strong className="text-slate-300">NITI Aayog Darpan:</strong> RJ/2018/019283</p>
              </div>
            </div>

            {/* Column 2: Emergency & Services */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">
                Direct Services
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/blood-donation" className="hover:text-red-400 transition-colors">
                    Emergency Blood Matching
                  </Link>
                </li>
                <li>
                  <Link href="/medical-equipment" className="hover:text-red-400 transition-colors">
                    Oxygen Concentrators
                  </Link>
                </li>
                <li>
                  <Link href="/medical-equipment" className="hover:text-red-400 transition-colors">
                    BiPAP & Wheelchair Bank
                  </Link>
                </li>
                <li>
                  <Link href="/volunteer" className="hover:text-red-400 transition-colors">
                    First Responder Network
                  </Link>
                </li>
                <li>
                  <Link href="/projects" className="hover:text-red-400 transition-colors">
                    Disaster Relief Funds
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Quick Links */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">
                Organization
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/about" className="hover:text-red-400 transition-colors">
                    About Our Mission
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-red-400 transition-colors">
                    Impact Stories & News
                  </Link>
                </li>
                <li>
                  <Link href="/donate" className="hover:text-red-400 transition-colors">
                    80G Tax Deductible Donation
                  </Link>
                </li>
                <li>
                  <Link href="/volunteer" className="hover:text-red-400 transition-colors">
                    Join as a Volunteer
                  </Link>
                </li>
                <li>
                  <Link href="/admin/login" className="hover:text-red-400 transition-colors">
                    Staff & Admin Portal
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: 24/7 Helpline */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">
                Emergency Contact
              </h4>
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 space-y-2.5">
                <p className="text-xs text-red-400 font-bold uppercase tracking-wider">
                  24/7 Blood & Crisis Desk
                </p>
                <p className="text-lg font-bold text-white tracking-wide">
                  +91 98765 43210
                </p>
                <p className="text-xs text-slate-400">
                  Prayas Seva Bhawan, Main Road, Jaipur, Rajasthan 302001
                </p>
                <p className="text-xs text-slate-400">
                  contact@prayas-sanstha.org
                </p>
              </div>
            </div>
          </div>

          {/* Bottom copyright */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} Prayas Sanstha. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/contact" className="hover:text-slate-300">
                Privacy Policy
              </Link>
              <Link href="/contact" className="hover:text-slate-300">
                Terms of Service
              </Link>
              <Link href="/admin/login" className="hover:text-slate-300">
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
