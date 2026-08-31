import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ScrollReveal from "@/components/ScrollReveal";
import FAQAccordion from "@/components/FAQAccordion";
import {
  GraduationCap,
  Heart,
  BookOpen,
  Trees,
  Stethoscope,
  Droplet,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  ArrowRight,
  Quote,
  Sparkles,
  Users,
  Target,
  Compass,
  Award,
  ExternalLink,
  Clock,
  Camera,
  HelpCircle,
  Banknote,
  FileCheck2,
  Send,
  UserCheck,
} from "lucide-react";

export const revalidate = 60;

export default async function HomePage() {
  const siteStats = await prisma.siteStat.findMany({ orderBy: { order: "asc" } });
  const recentEvents = await prisma.post.findMany({
    where: { published: true },
    include: { images: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
    take: 3,
  });
  const activeProjects = await prisma.project.findMany({
    where: { status: "ACTIVE" },
    include: { images: true },
    orderBy: { createdAt: "desc" },
    take: 4,
  });
  const testimonials = await prisma.testimonial.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
    take: 3,
  });

  // Find Aashayein project specifically
  const aashayeinProject = activeProjects.find((p: any) => p.slug === "aashayein-education") || activeProjects[0] || {
    raisedAmount: 215000,
    goalAmount: 350000,
  };
  const percentAashayein = aashayeinProject && aashayeinProject.goalAmount > 0
    ? Math.min(Math.round((aashayeinProject.raisedAmount / aashayeinProject.goalAmount) * 100), 100)
    : 62;

  return (
    <div className="space-y-12 sm:space-y-16 lg:space-y-24 2xl:space-y-28 pb-20">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION: Emotional, Heartfelt Seva on the Holy Soil of Vrindavan   */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden border-b border-prayas-rule pt-12 pb-14 sm:pt-16 sm:pb-20 lg:pt-24 lg:pb-28 2xl:pt-32 2xl:pb-36">
        {/* Photographic Background of Classroom under Banyan by Yamuna */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/banyan-study-vrindavan.jpg"
          alt="Informal outdoor classroom in Vrindavan along Yamuna riverbank - Project Aashayein"
          className="absolute inset-0 w-full h-full object-cover object-center z-0 scale-105 transition-transform duration-1000"
        />
        {/* Soft, rich dark vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/60 z-0" />
        <div className="absolute inset-0 bg-black/25 z-0" />

        <div className="relative z-10 max-w-7xl 2xl:max-w-[1440px] 3xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 2xl:gap-16 items-center">
            {/* Left Narrative: The Emotional Calling */}
            <div className="lg:col-span-7 2xl:col-span-7 space-y-4 sm:space-y-6 2xl:space-y-8 text-left text-white">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/85 border border-emerald-500/40 text-xs 2xl:text-sm font-bold text-emerald-300 backdrop-blur-md shadow-md max-w-full">
                <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">Project Aashayein • 18 Years of Nishkam Seva in Vrindavan</span>
              </div>

              <h1 className="font-serif text-2xl xs:text-3xl sm:text-4xl md:text-5xl 2xl:text-6xl font-bold tracking-tight text-white leading-[1.18] drop-shadow-md">
                In the holy soil of Vrindavan, no child's dream should end for want of a notebook.
              </h1>

              <p className="text-sm sm:text-base md:text-lg 2xl:text-xl text-slate-100 leading-relaxed max-w-2xl 2xl:max-w-3xl font-light drop-shadow">
                For 18 years, <strong>Prayas Pariwaar</strong> has stood beside daily-wage and rural families across Mathura district — ensuring free evening study centers, school supplies, emergency blood coordination, and home oxygen support with <strong>zero administrative deductions</strong>.
              </p>

              {/* Direct Emotional Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  href="/donate?project=aashayein-education"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 2xl:px-8 2xl:py-5 rounded-xl text-xs sm:text-sm 2xl:text-base font-bold bg-[#2E5339] text-white hover:bg-[#23432b] transition-all shadow-xl hover:shadow-emerald-950/50 text-center"
                  style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
                >
                  <Heart className="w-4 h-4 2xl:w-5 2xl:h-5 fill-white text-white shrink-0" />
                  <span>Sponsor a Child's Education — ₹500/mo</span>
                </Link>

                <Link
                  href="/projects/aashayein-education"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 sm:py-4 2xl:px-7 2xl:py-5 rounded-xl text-xs sm:text-sm 2xl:text-base font-semibold bg-white/15 text-white border border-white/30 hover:bg-white/25 transition-all backdrop-blur-md text-center"
                >
                  <BookOpen className="w-4 h-4 2xl:w-5 2xl:h-5 text-emerald-300 shrink-0" />
                  <span>Explore Project Aashayein</span>
                </Link>
              </div>

              {/* Trust & Emergency Blood Link */}
              <div className="pt-4 flex flex-wrap items-center gap-y-2.5 gap-x-6 text-xs 2xl:text-sm text-slate-200 border-t border-white/20">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  100% Tax-Exempt under Section 80G
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  100% Direct to Beneficiaries
                </span>
                <Link
                  href="/blood-donation"
                  className="flex items-center gap-1 font-semibold text-rose-300 hover:text-rose-200 underline decoration-rose-400/50"
                >
                  <Droplet className="w-3.5 h-3.5 fill-current text-rose-400 shrink-0" />
                  24/7 Emergency Blood Registry →
                </Link>
              </div>
            </div>

            {/* Right Column: Live Student Sponsorship Desk */}
            <div className="lg:col-span-5 2xl:col-span-5 w-full">
              <div className="border border-prayas-rule bg-white rounded-2xl p-4 sm:p-6 2xl:p-8 shadow-2xl space-y-4 sm:space-y-5 text-prayas-ink">
                <div className="flex items-center justify-between border-b border-prayas-rule pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-prayas-neem animate-pulse shrink-0" />
                    <span className="text-[11px] sm:text-xs 2xl:text-sm font-bold uppercase tracking-wider text-prayas-neem">
                      Project Aashayein Student Desk
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] 2xl:text-xs text-prayas-muted font-mono">Academic Year 2026</span>
                </div>

                {/* Progress Snapshot */}
                <div className="p-3 sm:p-4 2xl:p-5 rounded-xl bg-prayas-paper border border-prayas-rule space-y-2 sm:space-y-2.5 text-prayas-ink">
                  <div className="flex flex-wrap justify-between items-baseline gap-1 sm:gap-2">
                    <span className="text-xs 2xl:text-sm font-bold text-prayas-ink">Children in 6 Evening Centers</span>
                    <span className="font-serif text-lg sm:text-xl 2xl:text-2xl font-bold text-prayas-neem shrink-0">320 Students</span>
                  </div>
                  <div className="flex flex-wrap justify-between items-baseline text-xs 2xl:text-sm text-prayas-muted gap-1 sm:gap-2">
                    <span>Awaiting Educational Sponsors:</span>
                    <span className="font-bold text-amber-800 shrink-0">85 Children</span>
                  </div>
                  <div className="w-full h-2 bg-prayas-stone rounded-full overflow-hidden border border-prayas-rule">
                    <div
                      className="h-full bg-prayas-neem rounded-full"
                      style={{ width: `${percentAashayein}%` }}
                    />
                  </div>
                  <p className="text-[11px] 2xl:text-xs text-prayas-muted leading-relaxed">
                    ₹{aashayeinProject.raisedAmount?.toLocaleString("en-IN") || "2,15,000"} raised of ₹{aashayeinProject.goalAmount?.toLocaleString("en-IN") || "3,50,000"} target for notebooks, uniforms, and volunteer teacher honorariums.
                  </p>
                </div>

                {/* Sponsorship Tiers */}
                <div className="space-y-2 text-xs 2xl:text-sm">
                  <span className="font-bold text-prayas-ink block">Transparent Sponsorship Options:</span>
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
                    <Link
                      href="/donate?project=aashayein-education&amount=500"
                      className="p-2 sm:p-2.5 rounded-lg border border-prayas-rule bg-prayas-stone hover:bg-green-50 hover:border-prayas-neem transition-colors block text-prayas-ink"
                    >
                      <strong className="block font-serif text-[11px] xs:text-xs sm:text-sm 2xl:text-base font-bold text-prayas-ink">₹500/mo</strong>
                      <span className="text-[9px] sm:text-[10px] 2xl:text-xs text-prayas-muted block leading-tight mt-0.5">Books & Tuition</span>
                    </Link>
                    <Link
                      href="/donate?project=aashayein-education&amount=1100"
                      className="p-2 sm:p-2.5 rounded-lg border border-prayas-neem bg-green-50/80 hover:bg-green-100 transition-colors block ring-1 ring-prayas-neem/40 text-prayas-ink"
                    >
                      <strong className="block font-serif text-[11px] xs:text-xs sm:text-sm 2xl:text-base font-bold text-prayas-neem">₹1,100/mo</strong>
                      <span className="text-[9px] sm:text-[10px] 2xl:text-xs text-green-900 font-semibold block leading-tight mt-0.5">Full Care</span>
                    </Link>
                    <Link
                      href="/donate?project=aashayein-education&amount=6000"
                      className="p-2 sm:p-2.5 rounded-lg border border-prayas-rule bg-prayas-stone hover:bg-green-50 hover:border-prayas-neem transition-colors block text-prayas-ink"
                    >
                      <strong className="block font-serif text-[11px] xs:text-xs sm:text-sm 2xl:text-base font-bold text-prayas-ink">₹6,000/yr</strong>
                      <span className="text-[9px] sm:text-[10px] 2xl:text-xs text-prayas-muted block leading-tight mt-0.5">Full Year</span>
                    </Link>
                  </div>
                </div>

                <div>
                  <Link
                    href="/donate?project=aashayein-education"
                    className="w-full py-3 sm:py-3.5 2xl:py-4 px-4 rounded-xl text-center font-bold text-xs sm:text-sm 2xl:text-base bg-[#2E5339] text-white hover:bg-[#23432b] transition-all shadow-md flex items-center justify-center gap-2"
                    style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
                  >
                    <Heart className="w-4 h-4 fill-white text-white shrink-0" />
                    <span className="font-bold text-white">Sponsor a Student Today (80G) →</span>
                  </Link>
                </div>

                <div className="border-t border-prayas-rule pt-2 text-[10px] sm:text-[11px] 2xl:text-xs text-prayas-muted text-center">
                  Donors receive quarterly student progress report cards and handwritten letters.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. COMMUNITY AUDIT LEDGER (18 Years of Verified Seva)                     */}
      {/* ========================================================================= */}
      <section className="max-w-7xl 2xl:max-w-[1440px] 3xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        <ScrollReveal>
          <div className="border border-prayas-rule bg-white rounded-2xl p-5 sm:p-8 2xl:p-10 shadow-card">
            <div className="border-b border-prayas-rule pb-3 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] 2xl:text-xs font-bold uppercase tracking-wider text-prayas-neem">
                  18-Year Verified Institutional Ledger (Est. 2006)
                </span>
                <h2 className="font-serif text-lg sm:text-2xl 2xl:text-3xl font-bold text-prayas-ink">
                  Verified Grassroots Impact in Mathura & Vrindavan
                </h2>
              </div>
              <span className="text-xs font-mono text-prayas-muted">Mathura District, UP</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 2xl:gap-8">
              {siteStats.map((stat: any, idx: number) => (
                <div
                  key={stat.id}
                  className={`space-y-1 ${idx === siteStats.length - 1 && siteStats.length % 2 !== 0 ? "col-span-2 sm:col-span-1" : ""}`}
                >
                  <p className="font-serif text-2xl sm:text-3xl 2xl:text-4xl font-bold text-prayas-ink">
                    {stat.value}{stat.label.includes("Year") ? "" : "+"}
                  </p>
                  <p className="text-xs 2xl:text-sm font-medium text-prayas-muted leading-snug">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ========================================================================= */}
      {/* 3. ABOUT PRAYAS PARIWAAR — 18-YEAR LEGACY                                 */}
      {/* ========================================================================= */}
      <section className="max-w-7xl 2xl:max-w-[1440px] 3xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Left: Overlapping Photo Composition */}
            <div className="lg:col-span-6 relative pb-6 sm:pb-10 pr-2 sm:pr-8 max-w-md lg:max-w-none mx-auto lg:mx-0 w-full">
              {/* Main Primary Image */}
              <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl aspect-[4/3] bg-prayas-stone border border-prayas-rule/60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/youth-skills-vrindavan.jpg"
                  alt="Volunteer mentor guiding students at e-Pathshala center in Vrindavan"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Overlapping Secondary Portrait (Bottom-Right) */}
              <div className="absolute -bottom-2 sm:-bottom-4 right-0 sm:right-2 w-5/12 sm:w-1/2 rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-4 border-white shadow-2xl aspect-[4/3] bg-prayas-stone">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/child-hope-vrindavan.jpg"
                  alt="Smiling student holding notebook in Vrindavan classroom"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Decorative Multi-Color Accents (Bottom-Left) */}
              <div className="mt-4 sm:mt-5 space-y-1.5">
                <div className="w-12 sm:w-14 h-1.5 rounded-full bg-[#D97706]" />
                <div className="w-8 sm:w-10 h-1.5 rounded-full bg-[#2E5339]" />
                <div className="w-5 sm:w-6 h-1.5 rounded-full bg-[#94A3B8]" />
              </div>
            </div>

            {/* Right: Institutional Narrative & Credentials */}
            <div className="lg:col-span-6 space-y-5 sm:space-y-6 2xl:space-y-8">
              <div className="space-y-2">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#B45309]">
                  ABOUT PRAYAS PARIWAAR • EST. 2006
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl font-bold text-[#1C2421] leading-[1.2]">
                  An 18-Year Legacy of Selfless Community Seva in Vrindavan
                </h2>
              </div>

              <p className="text-xs sm:text-sm 2xl:text-base text-slate-600 leading-relaxed font-normal">
                Prayas Pariwaar is a registered grassroots society based in Vrindavan, UP. We work directly on the ground across education, emergency blood donation, free home medical equipment lending, and environmental restoration.
              </p>

              {/* 3 Key Institutional Features */}
              <div className="space-y-3 sm:space-y-4 pt-1">
                {/* Bullet 1 */}
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 2xl:w-6 2xl:h-6 text-[#2E5339] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm 2xl:text-base text-[#1C2421] leading-tight">
                      100% Direct Allocation (Zero Admin Cut)
                    </h4>
                    <p className="text-xs 2xl:text-sm text-slate-500 mt-0.5">
                      Every rupee donated goes directly to child education or patient care.
                    </p>
                  </div>
                </div>

                {/* Bullet 2 */}
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 2xl:w-6 2xl:h-6 text-[#2E5339] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm 2xl:text-base text-[#1C2421] leading-tight">
                      12A, 80G Certified & NITI Aayog Empaneled
                    </h4>
                    <p className="text-xs 2xl:text-sm text-slate-500 mt-0.5">
                      Registered society (142/2006-07) with annual independent chartered audits.
                    </p>
                  </div>
                </div>

                {/* Bullet 3 */}
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 2xl:w-6 2xl:h-6 text-[#2E5339] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm 2xl:text-base text-[#1C2421] leading-tight">
                      Transparent Quarterly Feedback
                    </h4>
                    <p className="text-xs 2xl:text-sm text-slate-500 mt-0.5">
                      Student sponsors receive academic report cards and handwritten letters.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-5">
                <Link
                  href="/about"
                  className="w-full sm:w-auto text-center px-6 sm:px-7 py-3 sm:py-3.5 2xl:px-8 2xl:py-4 rounded-xl font-bold text-xs sm:text-sm 2xl:text-base bg-[#2E5339] text-white hover:bg-[#23432b] transition-all shadow-md inline-flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
                >
                  <span>Learn More About Us →</span>
                </Link>
                <Link
                  href="/volunteer"
                  className="w-full sm:w-auto text-center text-xs sm:text-sm 2xl:text-base font-bold text-[#1C2421] hover:text-[#2E5339] hover:underline decoration-2 transition-colors py-2 sm:py-0"
                >
                  Join as a Volunteer
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ========================================================================= */}
      {/* 4. OUR 4 CORE SECTORS & PROJECTS SHOWCASE WITH PHOTOGRAPHIC ASSETS        */}
      {/* ========================================================================= */}
      <section className="max-w-7xl 2xl:max-w-[1440px] 3xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        <ScrollReveal>
          <div className="border-b border-prayas-rule pb-4 mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-xs 2xl:text-sm font-bold uppercase tracking-wider text-prayas-neem">
                Our 4 Pillars of Seva
              </span>
              <h2 className="font-serif text-xl sm:text-2xl 2xl:text-3xl font-bold text-prayas-ink mt-1">
                Active Programs Serving Vrindavan & Mathura District
              </h2>
            </div>
            <Link
              href="/projects"
              className="text-xs 2xl:text-sm font-semibold text-prayas-neem hover:underline self-start sm:self-auto flex items-center gap-1"
            >
              <span>View All Programs</span>
              <ArrowRight className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 2xl:gap-8">
          {/* Pillar 1: Child Education */}
          <ScrollReveal delay={50}>
            <div className="border border-prayas-rule bg-white rounded-2xl overflow-hidden shadow-card flex flex-col justify-between hover:shadow-lg transition-all group h-full">
              <div className="space-y-3">
                <div className="aspect-[16/10] bg-prayas-stone overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/youth-skills-vrindavan.jpg"
                    alt="Project Aashayein Child Education"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded bg-[#2E5339] text-white text-[10px] font-bold uppercase shadow-sm">
                    Education Pillar
                  </span>
                </div>
                <div className="p-4 sm:p-5 pt-1 space-y-2">
                  <h3 className="font-serif text-base sm:text-lg 2xl:text-xl font-bold text-prayas-ink">
                    Project Aashayein
                  </h3>
                  <p className="text-xs 2xl:text-sm text-prayas-muted leading-relaxed">
                    6 evening village study centers, school admissions, free textbooks, school bags, and winter uniforms for 320+ rural children.
                  </p>
                  <div className="text-[11px] 2xl:text-xs font-semibold text-emerald-900 bg-green-50 p-2 rounded-lg border border-green-100">
                    ⭐ 1,200+ Students Educated Since 2006
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-5 pt-0 border-t border-prayas-rule/60 flex items-center justify-between text-xs 2xl:text-sm mt-2">
                <Link href="/projects/aashayein-education" className="font-bold text-prayas-neem hover:underline">
                  Explore Project →
                </Link>
                <Link
                  href="/donate?project=aashayein-education"
                  className="px-3 py-1.5 rounded-lg bg-[#2E5339] text-white text-[11px] 2xl:text-xs font-bold shadow-sm hover:bg-[#23432b]"
                  style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
                >
                  Sponsor (80G)
                </Link>
              </div>
            </div>
          </ScrollReveal>

          {/* Pillar 2: Environment & Tree Plantation */}
          <ScrollReveal delay={120}>
            <div className="border border-prayas-rule bg-white rounded-2xl overflow-hidden shadow-card flex flex-col justify-between hover:shadow-lg transition-all group h-full">
              <div className="space-y-3">
                <div className="aspect-[16/10] bg-prayas-stone overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/vrindavan-plantation.jpg"
                    alt="Vrindavan Harit Kranti Native Tree Plantation"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded bg-green-800 text-white text-[10px] font-bold uppercase shadow-sm">
                    Environment Pillar
                  </span>
                </div>
                <div className="p-4 sm:p-5 pt-1 space-y-2">
                  <h3 className="font-serif text-base sm:text-lg 2xl:text-xl font-bold text-prayas-ink">
                    Vrindavan Harit Kranti
                  </h3>
                  <p className="text-xs 2xl:text-sm text-prayas-muted leading-relaxed">
                    5,400+ native Neem, Peepal, and Pilu saplings planted along Parikrama Marg with protective tree-guards and watering teams.
                  </p>
                  <div className="text-[11px] 2xl:text-xs font-semibold text-green-900 bg-green-50 p-2 rounded-lg border border-green-100">
                    🌳 5,400+ Protected Native Trees
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-5 pt-0 border-t border-prayas-rule/60 flex items-center justify-between text-xs 2xl:text-sm mt-2">
                <Link href="/projects/vrindavan-harit-kranti" className="font-bold text-prayas-neem hover:underline">
                  Explore Plantation →
                </Link>
                <Link
                  href="/donate?project=vrindavan-harit-kranti"
                  className="px-3 py-1.5 rounded-lg bg-green-700 text-white text-[11px] 2xl:text-xs font-bold shadow-sm hover:bg-green-800"
                >
                  Plant a Tree
                </Link>
              </div>
            </div>
          </ScrollReveal>

          {/* Pillar 3: Emergency Blood & Medical Bank */}
          <ScrollReveal delay={190}>
            <div className="border border-prayas-rule bg-white rounded-2xl overflow-hidden shadow-card flex flex-col justify-between hover:shadow-lg transition-all group h-full">
              <div className="space-y-3">
                <div className="aspect-[16/10] bg-prayas-stone overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/medical-blood-seva.jpg"
                    alt="Medical Equipment Bank & Emergency Blood Registry"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded bg-[#B91C1C] text-white text-[10px] font-bold uppercase shadow-sm">
                    Health & Emergency
                  </span>
                </div>
                <div className="p-4 sm:p-5 pt-1 space-y-2">
                  <h3 className="font-serif text-base sm:text-lg 2xl:text-xl font-bold text-prayas-ink">
                    Blood Desk & Medical Bank
                  </h3>
                  <p className="text-xs 2xl:text-sm text-prayas-muted leading-relaxed">
                    24/7 voluntary blood coordination for district hospitals, and free home loan of 10L oxygen concentrators and hospital beds.
                  </p>
                  <div className="text-[11px] 2xl:text-xs font-semibold text-red-900 bg-red-50 p-2 rounded-lg border border-red-100">
                    🩸 4,800+ Blood Units Coordinated
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-5 pt-0 border-t border-prayas-rule/60 flex items-center justify-between text-xs 2xl:text-sm mt-2">
                <Link href="/blood-donation" className="font-bold text-prayas-crimson hover:underline">
                  Blood Desk →
                </Link>
                <Link
                  href="/medical-equipment"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-[11px] 2xl:text-xs font-bold shadow-sm hover:bg-slate-900"
                >
                  Borrow Device
                </Link>
              </div>
            </div>
          </ScrollReveal>

          {/* Pillar 4: Youth Skills & Health Camps */}
          <ScrollReveal delay={260}>
            <div className="border border-prayas-rule bg-white rounded-2xl overflow-hidden shadow-card flex flex-col justify-between hover:shadow-lg transition-all group h-full">
              <div className="space-y-3">
                <div className="aspect-[16/10] bg-prayas-stone overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/health-camp-vrindavan.jpg"
                    alt="Jan Swasthya Free Health & Eye Checkup Camp"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded bg-amber-800 text-white text-[10px] font-bold uppercase shadow-sm">
                    Health Camps
                  </span>
                </div>
                <div className="p-4 sm:p-5 pt-1 space-y-2">
                  <h3 className="font-serif text-base sm:text-lg 2xl:text-xl font-bold text-prayas-ink">
                    Jan Swasthya & Skills
                  </h3>
                  <p className="text-xs 2xl:text-sm text-prayas-muted leading-relaxed">
                    Geriatric eye screening with cataract referrals, general medical checkups, and Project Aadhar youth career guidance.
                  </p>
                  <div className="text-[11px] 2xl:text-xs font-semibold text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-100">
                    👥 8,500+ Medical Camp Beneficiaries
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-5 pt-0 border-t border-prayas-rule/60 flex items-center justify-between text-xs 2xl:text-sm mt-2">
                <Link href="/projects/jan-swasthya-raksha" className="font-bold text-amber-800 hover:underline">
                  View Health Seva →
                </Link>
                <Link
                  href="/volunteer"
                  className="px-3 py-1.5 rounded-lg bg-prayas-stone text-prayas-ink border border-prayas-rule text-[11px] 2xl:text-xs font-bold shadow-sm hover:bg-white"
                >
                  Volunteer
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. MOMENTS OF SEVA — FIELD PHOTO GALLERY MOSAIC                            */}
      {/* ========================================================================= */}
      <section className="max-w-7xl 2xl:max-w-[1440px] 3xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        <ScrollReveal>
          <div className="border-b border-prayas-rule pb-4 mb-6 sm:mb-8">
            <span className="text-xs 2xl:text-sm font-bold uppercase tracking-wider text-prayas-neem flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />
              Moments of Seva in Vrindavan
            </span>
            <h2 className="font-serif text-xl sm:text-2xl 2xl:text-3xl font-bold text-prayas-ink mt-1">
              Every Smile, Every Tree, Every Life Touched
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 2xl:gap-6">
          {[
            { src: "/images/child-hope-vrindavan.jpg", caption: "Hope in her eyes — Project Aashayein student Radha with her new notebook", span: "sm:col-span-2 lg:col-span-2" },
            { src: "/images/banyan-study-vrindavan.jpg", caption: "Evening study circle under the ancient banyan tree by Yamuna riverbank", span: "sm:col-span-2 lg:col-span-1" },
            { src: "/images/vrindavan-plantation.jpg", caption: "Native Neem sapling plantation with protective tree guards along Parikrama Marg" },
            { src: "/images/medical-blood-seva.jpg", caption: "10L Oxygen concentrator delivery for elderly home recovery" },
            { src: "/images/health-camp-vrindavan.jpg", caption: "Free geriatric eye screening & cataract surgery camp" },
            { src: "/images/youth-skills-vrindavan.jpg", caption: "Digital literacy & computer learning center for rural youth" },
          ].map((photo, idx) => (
            <ScrollReveal key={idx} delay={idx * 60}>
              <div className={`gallery-item ${photo.span || ""} aspect-[4/3] sm:aspect-square`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.src}
                  alt={photo.caption}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="gallery-caption">
                  <p className="text-[11px] sm:text-xs 2xl:text-sm font-medium leading-snug">{photo.caption}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. VOICES OF TRANSFORMATION & COMMUNITY TESTIMONIALS                       */}
      {/* ========================================================================= */}
      <section className="max-w-7xl 2xl:max-w-[1440px] 3xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        <ScrollReveal>
          <div className="border border-prayas-rule bg-white rounded-2xl p-5 sm:p-8 2xl:p-12 shadow-card space-y-6 sm:space-y-8">
            <div className="border-b border-prayas-rule pb-4">
              <span className="text-xs 2xl:text-sm font-bold uppercase tracking-wider text-prayas-neem">
                Voices of Transformation
              </span>
              <h2 className="font-serif text-xl sm:text-2xl 2xl:text-3xl font-bold text-prayas-ink mt-1">
                Words from Village Parents, Teachers & Beneficiaries
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 2xl:gap-10">
              {testimonials.map((item: any) => (
                <div key={item.id} className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <Quote className="w-6 h-6 2xl:w-7 2xl:h-7 text-prayas-marigold" />
                    <p className="text-xs sm:text-sm 2xl:text-base text-prayas-ink leading-relaxed italic font-serif">
                      "{item.quote}"
                    </p>
                  </div>
                  <div className="border-t border-prayas-rule pt-3">
                    <strong className="block text-xs sm:text-sm 2xl:text-base font-bold text-prayas-ink">
                      {item.authorName}
                    </strong>
                    {item.designation && (
                      <span className="text-[11px] 2xl:text-xs text-prayas-muted block">
                        {item.designation}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ========================================================================= */}
      {/* 7. HOW YOUR ₹500 REACHES A CHILD — DONOR TRANSPARENCY JOURNEY              */}
      {/* ========================================================================= */}
      <section className="max-w-7xl 2xl:max-w-[1440px] 3xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        <ScrollReveal>
          <div className="border border-prayas-rule bg-white rounded-2xl p-5 sm:p-8 2xl:p-12 shadow-card space-y-6 sm:space-y-8">
            <div className="border-b border-prayas-rule pb-4 text-center">
              <span className="text-xs 2xl:text-sm font-bold uppercase tracking-wider text-prayas-neem">
                100% Transparent Seva Flow
              </span>
              <h2 className="font-serif text-xl sm:text-2xl 2xl:text-3xl font-bold text-prayas-ink mt-1">
                How Your ₹500 Empowers a Child in Vrindavan
              </h2>
              <p className="text-xs sm:text-sm 2xl:text-base text-prayas-muted mt-1 max-w-xl mx-auto">
                Zero administrative deduction. Every rupee reaches direct beneficiaries.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-4 2xl:gap-6">
              {/* Step 1 */}
              <div className="text-center space-y-3 journey-connector">
                <div className="w-12 h-12 sm:w-14 sm:h-14 2xl:w-16 2xl:h-16 mx-auto rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center text-prayas-neem">
                  <Banknote className="w-6 h-6 sm:w-7 sm:h-7 2xl:w-8 2xl:h-8" />
                </div>
                <div>
                  <span className="text-[10px] 2xl:text-xs font-bold uppercase text-prayas-neem">Step 1</span>
                  <h4 className="font-serif text-sm 2xl:text-base font-bold text-prayas-ink">You Donate</h4>
                </div>
                <p className="text-[11px] 2xl:text-xs text-prayas-muted leading-relaxed">
                  Secure Razorpay donation with instant 80G tax receipt sent to your email.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center space-y-3 journey-connector">
                <div className="w-12 h-12 sm:w-14 sm:h-14 2xl:w-16 2xl:h-16 mx-auto rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center text-prayas-neem">
                  <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 2xl:w-8 2xl:h-8" />
                </div>
                <div>
                  <span className="text-[10px] 2xl:text-xs font-bold uppercase text-prayas-neem">Step 2</span>
                  <h4 className="font-serif text-sm 2xl:text-base font-bold text-prayas-ink">Zero Admin Cut</h4>
                </div>
                <p className="text-[11px] 2xl:text-xs text-prayas-muted leading-relaxed">
                  100% direct allocation. Founding members cover all administrative costs separately.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center space-y-3 journey-connector">
                <div className="w-12 h-12 sm:w-14 sm:h-14 2xl:w-16 2xl:h-16 mx-auto rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center text-prayas-neem">
                  <Send className="w-6 h-6 sm:w-7 sm:h-7 2xl:w-8 2xl:h-8" />
                </div>
                <div>
                  <span className="text-[10px] 2xl:text-xs font-bold uppercase text-prayas-neem">Step 3</span>
                  <h4 className="font-serif text-sm 2xl:text-base font-bold text-prayas-ink">Direct to Child</h4>
                </div>
                <p className="text-[11px] 2xl:text-xs text-prayas-muted leading-relaxed">
                  Textbooks, uniforms, evening tuition centers, and nutrition for the named student.
                </p>
              </div>

              {/* Step 4 */}
              <div className="text-center space-y-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 2xl:w-16 2xl:h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <FileCheck2 className="w-6 h-6 sm:w-7 sm:h-7 2xl:w-8 2xl:h-8" />
                </div>
                <div>
                  <span className="text-[10px] 2xl:text-xs font-bold uppercase text-amber-800">Step 4</span>
                  <h4 className="font-serif text-sm 2xl:text-base font-bold text-prayas-ink">Report Card to You</h4>
                </div>
                <p className="text-[11px] 2xl:text-xs text-prayas-muted leading-relaxed">
                  Quarterly academic report cards, attendance, and direct handwritten letters from the child.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ========================================================================= */}
      {/* 8. FAQ — EVERYTHING SUPPORTERS & DONORS ASK                                */}
      {/* ========================================================================= */}
      <section className="max-w-7xl 2xl:max-w-[1440px] 3xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        <ScrollReveal>
          <div className="border-b border-prayas-rule pb-4 mb-6 sm:mb-8">
            <span className="text-xs 2xl:text-sm font-bold uppercase tracking-wider text-prayas-neem flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />
              Frequently Asked Questions
            </span>
            <h2 className="font-serif text-xl sm:text-2xl 2xl:text-3xl font-bold text-prayas-ink mt-1">
              Everything Supporters & Donors Ask Us
            </h2>
          </div>
        </ScrollReveal>

        <div className="max-w-3xl 2xl:max-w-4xl mx-auto">
          <FAQAccordion />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. CALL TO ACTION BANNER (SPONSOR, VOLUNTEER, CSR PARTNER)                */}
      {/* ========================================================================= */}
      <section className="max-w-7xl 2xl:max-w-[1440px] 3xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        <ScrollReveal>
          <div className="border border-prayas-rule bg-prayas-stone rounded-2xl p-6 sm:p-10 2xl:p-14 text-center space-y-5 sm:space-y-6 shadow-card">
            {/* Logo in CTA */}
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/prayas-logo.png"
                alt="Prayas Pariwaar Logo"
                className="h-10 sm:h-12 2xl:h-16 w-auto object-contain"
              />
            </div>

            <div className="max-w-2xl 2xl:max-w-3xl mx-auto space-y-2">
              <span className="text-xs 2xl:text-sm font-bold uppercase tracking-wider text-prayas-neem">
                Support Grassroots Community Seva in Vrindavan
              </span>
              <h2 className="font-serif text-xl sm:text-2xl 2xl:text-3xl font-bold text-prayas-ink leading-tight">
                For just ₹500 a month, you can ensure a child in Vrindavan stays in school and builds a brighter future.
              </h2>
            </div>

            <p className="text-xs sm:text-sm 2xl:text-base text-prayas-muted max-w-xl 2xl:max-w-2xl mx-auto leading-relaxed">
              All educational sponsorships and community contributions are 100% tax-deductible under Section 80G. You will receive direct progress report cards and handwritten letters from the student you sponsor.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-3.5 pt-2">
              <Link
                href="/donate?project=aashayein-education"
                className="w-full sm:w-auto px-6 py-3.5 2xl:px-8 2xl:py-4 rounded-xl text-xs sm:text-sm 2xl:text-base font-bold bg-[#2E5339] text-white hover:bg-[#23432b] transition-all shadow-md flex items-center justify-center gap-2 text-center"
                style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
              >
                <Heart className="w-4 h-4 fill-white text-white" />
                <span>Sponsor a Student (80G) →</span>
              </Link>
              <Link
                href="/volunteer"
                className="w-full sm:w-auto text-center px-6 py-3.5 2xl:px-8 2xl:py-4 rounded-xl text-xs sm:text-sm 2xl:text-base font-semibold border border-prayas-rule bg-white text-prayas-ink hover:bg-prayas-subtle transition-colors shadow-sm"
              >
                Volunteer as a Weekend Teacher
              </Link>
              <Link
                href="/partner/corporate"
                className="w-full sm:w-auto text-center px-6 py-3.5 2xl:px-8 2xl:py-4 rounded-xl text-xs sm:text-sm 2xl:text-base font-semibold border border-prayas-rule bg-white text-slate-800 hover:bg-prayas-subtle transition-colors shadow-sm"
              >
                Corporate CSR Partnership
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
