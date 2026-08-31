import Link from "next/link";
import {
  Droplet,
  Activity,
  Heart,
  Users,
  ShieldCheck,
  PhoneCall,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Award,
  Flame,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-red-50/60 via-white to-slate-50 pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-100/80 border border-red-200 text-red-700 text-xs sm:text-sm font-semibold tracking-wide shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-red-600 animate-ping" />
                24/7 Rapid Emergency Response Network
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display text-slate-900 tracking-tight leading-[1.15]">
                When Every Second Counts,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-600 to-red-700">
                  Prayas Saves Lives.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Bridging the gap between emergency blood donors, critical medical equipment loans, and patients in need across India. Zero fee, zero delay, pure community action.
              </p>

              {/* Call to Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/blood-donation"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl text-base font-bold text-white bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/25 hover:shadow-red-600/40 transition-all hover:-translate-y-0.5"
                >
                  <Droplet className="w-5 h-5 fill-current" />
                  Request Emergency Blood
                </Link>

                <Link
                  href="/medical-equipment"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-base font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm transition-all hover:-translate-y-0.5"
                >
                  <Activity className="w-5 h-5 text-emerald-600" />
                  Medical Equipment Bank
                </Link>

                <Link
                  href="/donate"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-base font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 shadow-sm transition-all"
                >
                  <Heart className="w-5 h-5 fill-current" />
                  Donate (80G)
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>100% Free Service</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verified Donors Only</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Avg Response &lt; 15 Mins</span>
                </div>
              </div>
            </div>

            {/* Right Card / Live Urgent Request Showcase */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-red-100">
                {/* Floating Urgent Badge */}
                <div className="absolute -top-3.5 right-6 bg-red-600 text-white text-xs font-extrabold uppercase px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 fill-current animate-pulse" />
                  Active Emergency Alert
                </div>

                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                        CRITICAL MATCHING
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                        B+ Blood Required
                      </h3>
                      <p className="text-xs text-slate-500">
                        SMS Hospital, ICU Ward 4 • Jaipur
                      </p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex flex-col items-center justify-center text-red-600 font-display font-extrabold">
                      <span className="text-lg leading-none">B+</span>
                      <span className="text-[10px] font-medium uppercase text-red-500">2 Units</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 text-xs text-slate-600 border border-slate-200">
                    <div className="flex justify-between">
                      <span>Patient:</span>
                      <strong className="text-slate-800">Radha Sharma (Age 42)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Urgency:</span>
                      <span className="text-red-600 font-bold">Immediate (Within 2 Hours)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                        <Clock className="w-3 h-3" /> Matching Donors Nearby
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <Link
                      href="/blood-donation"
                      className="flex-1 text-center py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-md"
                    >
                      Respond as Donor
                    </Link>
                    <a
                      href="tel:+919876543210"
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5" /> Call Desk
                    </a>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 text-[11px] text-center text-slate-400">
                  ⚡ Over 18 volunteers notified in real-time via Expo Push
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. IMPACT NUMBERS COUNTER */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 shadow-xl text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-5xl font-extrabold font-display text-red-500">
                14,800+
              </p>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">
                Blood Units Arranged
              </p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-5xl font-extrabold font-display text-emerald-400">
                3,450+
              </p>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">
                Medical Equipment Loans
              </p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-5xl font-extrabold font-display text-amber-400">
                3,200+
              </p>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">
                Active Volunteers
              </p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-5xl font-extrabold font-display text-sky-400">
                100%
              </p>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">
                Free & Transparent
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOUR CORE PILLARS OF ACTION */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
            OUR HUMANITARIAN SERVICES
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
            How Prayas Sanstha Serves the Community
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            We provide structured, rapid-response humanitarian infrastructure to ensure no patient suffers due to lack of blood or critical equipment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1: Blood Donation Network */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <Droplet className="w-7 h-7 fill-current" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              24/7 Emergency Blood Coordination
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Real-time matching system notifying verified donors within minutes of an emergency blood or platelet request via instant push and SMS.
            </p>
            <Link
              href="/blood-donation"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700"
            >
              Explore Blood Portal <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Pillar 2: Medical Equipment Bank */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Activity className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Medical Equipment Bank
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Free leasing of high-cost life-support equipment including Oxygen Concentrators, BiPAP/CPAP machines, Hospital Beds, and Wheelchairs for home care.
            </p>
            <Link
              href="/medical-equipment"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              Request Equipment <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Pillar 3: Volunteer Mobilization */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Volunteer Taskforce
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Youth and community members trained in first response, hospital coordination, blood donation camps, and disaster relief aid delivery.
            </p>
            <Link
              href="/volunteer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700"
            >
              Join the Team <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION FOR DONATION (80G) */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-3xl p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl space-y-5 relative z-10">
            <span className="inline-block px-3.5 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              Support Life-Saving Operations
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight">
              Your Contribution Funds Oxygen & Emergency Transfusions
            </h2>
            <p className="text-red-100 text-sm sm:text-base leading-relaxed">
              All donations made to Prayas Sanstha are 50% tax-exempt under Section 80G of the Indian Income Tax Act. Instant 80G certificates are issued for every donation.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/donate"
                className="px-7 py-3.5 bg-white text-red-600 hover:bg-red-50 font-bold rounded-xl shadow-lg transition-all text-sm"
              >
                Make a Tax-Deductible Donation
              </Link>
              <Link
                href="/about"
                className="px-6 py-3.5 bg-red-800/60 hover:bg-red-800/90 text-white font-bold rounded-xl border border-red-400/30 transition-all text-sm"
              >
                Read Transparency Report
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
