import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ScrollReveal from "@/components/ScrollReveal";
import FAQAccordion from "@/components/FAQAccordion";
import JsonLd from "@/components/JsonLd";
import { getWebPageGraph, getFAQPageSchema } from "@/lib/schema";
import { assetPath } from "@/lib/api";
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
  FolderOpen,
} from "lucide-react";

import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: {
    absolute: "Prayas Pariwaar | 18 Years of Grassroots Community Seva in Vrindavan, UP",
  },
  description:
    "Registered grassroots non-profit society in Vrindavan, Mathura District, UP. Serving rural communities through free education, 24/7 volunteer emergency blood coordination, medical equipment lending bank, tree plantation, and healthcare camps.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Prayas Pariwaar | 18 Years of Community Service in Vrindavan",
    description:
      "Grassroots humanitarian NGO in Mathura District, UP. 24/7 Emergency Blood Coordination, Medical Equipment Bank, Rural Education, and Environmental Seva.",
    url: "/",
  },
};

export default async function HomePage() {
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

  // Fetch real gallery photos and albums from database
  let galleryPhotos: any[] = [];
  let galleryAlbums: any[] = [];
  try {
    if ((prisma as any).galleryPhoto) {
      galleryPhotos = await (prisma as any).galleryPhoto.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { album: true },
      });
    }
    if ((prisma as any).galleryAlbum) {
      galleryAlbums = await (prisma as any).galleryAlbum.findMany({
        where: { published: true },
        orderBy: { order: "asc" },
        include: { _count: { select: { photos: true } } },
        take: 6,
      });
    }
  } catch (e) {
    console.warn("Could not query gallery photos/albums in HomePage:", e);
  }

  // Authentic Vrindavan field photography fallbacks
  const fallbackGalleryPhotos = [
    {
      id: "fb-1",
      url: assetPath("/images/child-hope-vrindavan.jpg"),
      title: "Hope in Her Eyes",
      caption: "Project Aashayein student Radha with her new notebook at our evening learning center",
      category: "Free Education",
      location: "Vrindavan, UP",
      album: { title: "Education", id: "cmtqo4l0t0000ag5a8iqmpc8a" },
    },
    {
      id: "fb-2",
      url: assetPath("/images/banyan-study-vrindavan.jpg"),
      title: "Evening Study Circle",
      caption: "Classroom under the ancient banyan tree along Yamuna riverbank",
      category: "Free Education",
      location: "Kesi Ghat, Vrindavan",
      album: { title: "Education", id: "cmtqo4l0t0000ag5a8iqmpc8a" },
    },
    {
      id: "fb-3",
      url: assetPath("/images/vrindavan-plantation.jpg"),
      title: "Native Neem Afforestation",
      caption: "Native Neem & Kadamba sapling plantation with protective tree guards along Parikrama Marg",
      category: "Plantation",
      location: "Govardhan Parikrama",
      album: { title: "Harit Kranti", id: "alb-plantation" },
    },
    {
      id: "fb-4",
      url: assetPath("/images/medical-blood-seva.jpg"),
      title: "10L Oxygen Bank Delivery",
      caption: "Emergency medical equipment dispatch for elderly home patient recovery",
      category: "Medical Seva",
      location: "Mathura City",
      album: { title: "Medical Equipment", id: "alb-blood" },
    },
    {
      id: "fb-5",
      url: assetPath("/images/health-camp-vrindavan.jpg"),
      title: "Jan Swasthya Eye Screening",
      caption: "Free geriatric eye screening & cataract surgery diagnosis camp in Raman Reti",
      category: "Health Camps",
      location: "Raman Reti, Vrindavan",
      album: { title: "FREE HOME", id: "cmtqo5fri0003ag5akayoq1pd" },
    },
    {
      id: "fb-6",
      url: assetPath("/images/youth-skills-vrindavan.jpg"),
      title: "Digital Youth Mentorship",
      caption: "Digital literacy & basic computer learning center for rural village youth",
      category: "Free Education",
      location: "Mathura Rural",
      album: { title: "Education", id: "cmtqo4l0t0000ag5a8iqmpc8a" },
    },
  ];

  // Filter out test screenshots/documents so only authentic field photography is displayed
  const cleanedGalleryPhotos = galleryPhotos.filter((p: any) => {
    const url = (p.url || "").toLowerCase();
    const title = (p.title || "").toLowerCase();
    if (url.includes("screenshot") || title.includes("credential") || title.includes("abcd") || url.includes("-removebg-")) {
      return false;
    }
    return true;
  });

  // Merge database photos with curated authentic fallbacks
  const displayPhotos = [
    ...cleanedGalleryPhotos,
    ...fallbackGalleryPhotos.filter((fb) => !cleanedGalleryPhotos.some((gp: any) => gp.url === fb.url)),
  ].slice(0, 6);

  // Find Aashayein project specifically
  const aashayeinProject = activeProjects.find((p: any) => p.slug === "aashayein-education") || activeProjects[0] || {
    raisedAmount: 215000,
    goalAmount: 350000,
  };
  const percentAashayein = aashayeinProject && aashayeinProject.goalAmount > 0
    ? Math.min(Math.round((aashayeinProject.raisedAmount / aashayeinProject.goalAmount) * 100), 100)
    : 62;

  const homeFaqs = [
    {
      question: "How will my donation be acknowledged and utilized?",
      answer:
        "Prayas Pariwaar is an 18-year-old registered non-profit society in Vrindavan. 100% of public donations are allocated directly to program beneficiaries. You will receive an official donation receipt and acknowledgment via email along with progress updates.",
    },
    {
      question: "How do I know my money actually reached the child?",
      answer:
        "Every student sponsor receives quarterly academic report cards, attendance records, and handwritten thank-you letters from the child they support. We also send annual field photographs showing the student's progress and school activities.",
    },
    {
      question: "Can I visit the study centers or field operations in Vrindavan?",
      answer:
        "Absolutely. We encourage donors and supporters to visit our evening study centers, plantation sites, and medical equipment bank in Vrindavan. Please contact our office at +91 94122 79000 to schedule a visit, and our field coordinator will personally guide you.",
    },
    {
      question: "What is your administrative overhead?",
      answer:
        "Zero. 100% of public donations reach direct beneficiaries — students, patients, and plantation drives. All administrative and operational costs are covered separately by our founding members and local volunteers. This is independently verified by our chartered accountant's annual audit.",
    },
    {
      question: "How can I borrow free medical equipment for a family member?",
      answer:
        "Visit our Medical Equipment Bank page or call +91 94122 79000. We provide free temporary home loans of 10-litre oxygen concentrators, adjustable hospital beds, wheelchairs, BiPAP machines, and patient monitors. You only need to provide a valid ID and a refundable security deposit that is returned when the equipment is returned.",
    },
    {
      question: "Can my company partner with Prayas under CSR?",
      answer:
        "Yes. We welcome corporate CSR partnerships for education sponsorship, medical equipment sponsorship, tree plantation drives, and employee volunteering programs. Please fill out our Corporate Partnership Inquiry form or email us at info@prayaspariwaar.com with your company's CSR objectives.",
    },
  ];

  const homeSchema = getWebPageGraph({
    title: "Prayas Pariwaar | 18 Years of Grassroots Community Seva in Vrindavan, UP",
    description:
      "Registered grassroots non-profit society in Vrindavan, Mathura District, UP. Serving rural communities through free education, 24/7 volunteer emergency blood coordination, medical equipment lending bank, tree plantation, and healthcare camps.",
    path: "/",
    additionalGraphItems: [getFAQPageSchema(homeFaqs, "/")],
  });

  return (
    <>
      <JsonLd data={homeSchema} />
      <div className="space-y-12 sm:space-y-16 lg:space-y-24 2xl:space-y-28 pb-20">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION: Emotional, Heartfelt Seva on the Holy Soil of Vrindavan   */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden border-b border-prayas-rule pt-12 pb-14 sm:pt-16 sm:pb-20 lg:pt-24 lg:pb-28 2xl:pt-32 2xl:pb-36">
        {/* Photographic Background of Classroom under Banyan by Yamuna */}
        <Image
          src={assetPath("/images/banyan-study-vrindavan.jpg")}
          alt="Informal outdoor classroom in Vrindavan along Yamuna riverbank - Project Aashayein"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center z-0 scale-105"
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
                  Registered Non-Profit Society
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
                    <span className="font-bold text-white">Sponsor a Student Today →</span>
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
      {/* 2. KEY IMPACT LEDGER & STATUTORY TRUST BAND                                */}
      {/* ========================================================================= */}
      <section className="max-w-7xl 2xl:max-w-[1440px] 3xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        <ScrollReveal>
          <div className="border border-prayas-rule bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-prayas-rule text-center">
              {/* Stat 1 */}
              <div className="p-5 sm:p-6 lg:p-7 space-y-1 hover:bg-prayas-stone/40 transition-colors">
                <span className="font-serif text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl font-bold text-prayas-neem block">
                  320+
                </span>
                <p className="text-xs sm:text-sm font-bold text-prayas-ink">Children Tutored Daily</p>
                <p className="text-[11px] sm:text-xs text-prayas-muted leading-tight">6 Evening learning centers in Vrindavan</p>
              </div>

              {/* Stat 2 */}
              <div className="p-5 sm:p-6 lg:p-7 space-y-1 hover:bg-prayas-stone/40 transition-colors">
                <span className="font-serif text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl font-bold text-emerald-800 block">
                  5,400+
                </span>
                <p className="text-xs sm:text-sm font-bold text-prayas-ink">Native Trees Planted</p>
                <p className="text-[11px] sm:text-xs text-prayas-muted leading-tight">Neem & Kadamba with protective guards</p>
              </div>

              {/* Stat 3 */}
              <div className="p-5 sm:p-6 lg:p-7 space-y-1 hover:bg-prayas-stone/40 transition-colors">
                <span className="font-serif text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl font-bold text-rose-700 block">
                  8,200+
                </span>
                <p className="text-xs sm:text-sm font-bold text-prayas-ink">Blood Units Coordinated</p>
                <p className="text-[11px] sm:text-xs text-prayas-muted leading-tight">24/7 volunteer emergency donor network</p>
              </div>

              {/* Stat 4 */}
              <div className="p-5 sm:p-6 lg:p-7 space-y-1 hover:bg-prayas-stone/40 transition-colors">
                <span className="font-serif text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl font-bold text-amber-700 block">
                  18 Years
                </span>
                <p className="text-xs sm:text-sm font-bold text-prayas-ink">Unbroken Nishkam Seva</p>
                <p className="text-[11px] sm:text-xs text-prayas-muted leading-tight">100% Direct • Zero Admin Deductions</p>
              </div>
            </div>

            {/* Bottom mini-bar: Statutory trust reassurance */}
            <div className="bg-prayas-stone/60 border-t border-prayas-rule px-4 py-2.5 flex flex-wrap items-center justify-around gap-2 text-[11px] sm:text-xs text-prayas-muted font-medium text-center">
              <span className="flex items-center gap-1.5 text-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Society Reg: <strong>142/2006-07</strong></span>
              </span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Income Tax: <strong>12A Certified</strong></span>
              </span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>NITI Aayog Darpan: <strong>UP/2017/0154210</strong></span>
              </span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="flex items-center gap-1.5 text-emerald-900 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>100% Volunteer Driven Society</span>
              </span>
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
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl aspect-[4/3] bg-prayas-stone border border-prayas-rule/60">
                <Image
                  src={assetPath("/images/youth-skills-vrindavan.jpg")}
                  alt="Volunteer mentor guiding students at e-Pathshala center in Vrindavan"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>

              {/* Overlapping Secondary Portrait (Bottom-Right) */}
              <div className="absolute -bottom-2 sm:-bottom-4 right-0 sm:right-2 w-5/12 sm:w-1/2 rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-4 border-white shadow-2xl aspect-[4/3] bg-prayas-stone">
                <Image
                  src={assetPath("/images/child-hope-vrindavan.jpg")}
                  alt="Smiling student holding notebook in Vrindavan classroom"
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
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
                      12A Registered & NITI Aayog Empaneled
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
      {/* 4. DYNAMIC ACTIVE PROGRAMS SHOWCASE (HORIZONTAL ALTERNATING LAYOUT)       */}
      {/* ========================================================================= */}
      <section className="max-w-7xl 2xl:max-w-[1440px] 3xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        <ScrollReveal>
          <div className="border-b border-prayas-rule pb-4 mb-6 sm:mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-xs 2xl:text-sm font-bold uppercase tracking-wider text-prayas-neem">
                Our Programs of Seva
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

        {activeProjects.length === 0 ? (
          <div className="p-12 text-center border border-prayas-rule rounded-3xl bg-white text-prayas-muted space-y-3">
            <p className="font-serif text-lg font-bold text-prayas-ink">No active programs currently listed</p>
            <p className="text-xs max-w-md mx-auto">
              New community welfare programs created in the admin portal will appear here immediately.
            </p>
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-12">
            {activeProjects.slice(0, 4).map((project: any, idx: number) => {
              // Alternating: idx 0: Image Left, Content Right
              //              idx 1: Content Left, Image Right (isReversed = true)
              //              idx 2: Image Left, Content Right
              //              idx 3: Content Left, Image Right
              const isReversed = idx % 2 === 1;
              const percent = project.goalAmount > 0
                ? Math.min(Math.round((project.raisedAmount / project.goalAmount) * 100), 100)
                : 0;
              const coverImg = assetPath(project.coverImage || (project.images && project.images[0]?.url) || "/images/youth-skills-vrindavan.jpg");

              return (
                <ScrollReveal key={project.id} delay={idx * 80}>
                  <div
                    className={`border border-prayas-rule bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-xl transition-all duration-300 flex flex-col ${
                      isReversed ? "md:flex-row-reverse" : "md:flex-row"
                    } items-stretch group`}
                  >
                    {/* Image Half */}
                    <div className="w-full md:w-1/2 relative min-h-[260px] sm:min-h-[300px] md:min-h-[360px] lg:min-h-[380px] bg-prayas-stone overflow-hidden">
                      <Image
                        src={coverImg}
                        alt={project.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-50" />
                      <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-emerald-950/80 backdrop-blur-md text-emerald-200 text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-sm z-10 border border-emerald-500/30">
                        {project.category ? project.category.replace(/_/g, " ") : "COMMUNITY"} PILLAR
                      </span>
                    </div>

                    {/* Content Half ("About it") */}
                    <div className="w-full md:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-5">
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-prayas-neem shrink-0 animate-pulse" />
                          <span className="text-xs font-bold uppercase tracking-wider text-prayas-neem">
                            Prayas Grassroots Program
                          </span>
                        </div>

                        <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-prayas-ink leading-tight group-hover:text-emerald-900 transition-colors">
                          {project.title}
                        </h3>

                        <p className="text-xs sm:text-sm lg:text-base text-prayas-muted leading-relaxed line-clamp-3">
                          {project.description}
                        </p>

                        {/* Impact / Funding Metric */}
                        {project.goalAmount > 0 ? (
                          <div className="p-3.5 sm:p-4 rounded-2xl bg-prayas-paper border border-prayas-rule space-y-2">
                            <div className="flex justify-between items-baseline text-xs sm:text-sm font-semibold text-prayas-ink">
                              <span>Community Seva Fund</span>
                              <span className="font-bold text-prayas-neem font-mono">
                                ₹{project.raisedAmount?.toLocaleString("en-IN") || 0} / ₹{project.goalAmount?.toLocaleString("en-IN") || 0} ({percent}%)
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-700 rounded-full transition-all"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-900 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
                            ⭐ Active Nishkam Field Service Serving Mathura District
                          </div>
                        )}
                      </div>

                      {/* Action Links */}
                      <div className="pt-4 border-t border-prayas-rule flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <Link
                            href={`/projects/${project.slug}`}
                            className="text-xs sm:text-sm font-bold text-prayas-neem hover:text-emerald-900 hover:underline flex items-center gap-1.5 transition-colors"
                          >
                            <span>Explore Project →</span>
                          </Link>

                          {project.album && (
                            <Link
                              href={`/gallery?albumId=${project.album.id}`}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-xl border border-emerald-200 transition-colors"
                            >
                              <Camera className="w-3 h-3 text-emerald-700" />
                              <span>Album: {project.album.title}</span>
                            </Link>
                          )}
                        </div>

                        <Link
                          href={`/donate?project=${project.slug}`}
                          className="px-5 py-2.5 rounded-xl bg-[#2E5339] text-white text-xs sm:text-sm font-bold shadow-md hover:bg-[#23432b] transition-all flex items-center gap-2"
                          style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
                        >
                          <Heart className="w-3.5 h-3.5 fill-white text-white" />
                          <span>Sponsor / Donate</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 5. MOMENTS OF SEVA — DYNAMIC ON-GROUND PHOTO GALLERY                       */}
      {/* ========================================================================= */}
      <section className="max-w-7xl 2xl:max-w-[1440px] 3xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        <ScrollReveal>
          <div className="border-b border-prayas-rule pb-4 mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs 2xl:text-sm font-bold uppercase tracking-wider text-prayas-neem flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-emerald-700" />
                Moments of Seva in Vrindavan • Ground Photo Gallery
              </span>
              <h2 className="font-serif text-xl sm:text-2xl 2xl:text-3xl font-bold text-prayas-ink mt-1">
                Every Smile, Every Tree, Every Life Touched
              </h2>
              <p className="text-xs sm:text-sm text-prayas-muted mt-1 max-w-2xl">
                Unfiltered photographs from our evening study circles, Parikrama tree guards, 24/7 blood desk, and elderly oxygen deliveries across Mathura district.
              </p>
            </div>

            <Link
              href="/gallery"
              className="text-xs sm:text-sm font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-xl transition-all shadow-2xs self-start sm:self-auto shrink-0"
            >
              <FolderOpen className="w-4 h-4 text-emerald-700" />
              <span>Explore All Albums in Gallery →</span>
            </Link>
          </div>

          {/* Quick Album Filter Pills */}
          {galleryAlbums.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none text-xs">
              <Link
                href="/gallery"
                className="px-3.5 py-1.5 rounded-full bg-emerald-800 text-white font-bold whitespace-nowrap shadow-xs hover:bg-emerald-900 transition-colors"
              >
                All Moments ({displayPhotos.length})
              </Link>
              {galleryAlbums.map((alb: any) => (
                <Link
                  key={alb.id}
                  href={`/gallery?albumId=${alb.id}`}
                  className="px-3.5 py-1.5 rounded-full bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-prayas-rule hover:border-emerald-300 font-semibold whitespace-nowrap transition-all shadow-2xs flex items-center gap-1.5"
                >
                  <FolderOpen className="w-3 h-3 text-emerald-700" />
                  <span>{alb.title}</span>
                  {alb._count?.photos > 0 && (
                    <span className="text-[10px] text-slate-400 font-mono">({alb._count.photos})</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </ScrollReveal>

        {/* Dynamic Photo Gallery Grid (Clean 3-Column Uniform Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {displayPhotos.map((photo: any, idx: number) => {
            const targetUrl = photo.albumId ? `/gallery?albumId=${photo.albumId}` : "/gallery";
            const albumName = photo.album?.title;
            const categoryName = photo.category && photo.category !== "All" ? photo.category : "Field Seva";
            const badgeLabel = albumName || categoryName;

            return (
              <ScrollReveal key={photo.id || idx} delay={idx * 60}>
                <Link
                  href={targetUrl}
                  className="group relative overflow-hidden rounded-2xl bg-prayas-stone border border-prayas-rule shadow-card hover:shadow-xl transition-all duration-300 block aspect-[4/3]"
                >
                  <Image
                    src={assetPath(photo.url || photo.src)}
                    alt={photo.caption || photo.title || "Moments of Seva in Vrindavan"}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Rich Dark Gradient for 100% Text Legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent z-10 pointer-events-none" />

                  {/* Top Badge: Single, Dignified Glassmorphic Pill */}
                  <div className="absolute top-3.5 left-3.5 z-20">
                    <span className="px-3 py-1 rounded-full bg-black/65 backdrop-blur-md text-white text-[11px] font-semibold border border-white/25 shadow-sm flex items-center gap-1.5">
                      <FolderOpen className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate max-w-[200px]">{badgeLabel}</span>
                    </span>
                  </div>

                  {/* Bottom Text Details */}
                  <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 z-20 space-y-1.5">
                    <h4
                      className="font-serif font-bold text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-emerald-300 transition-colors drop-shadow-md"
                      style={{ color: "#ffffff" }}
                    >
                      {photo.title || photo.caption}
                    </h4>
                    {photo.caption && photo.title && photo.caption !== photo.title && (
                      <p
                        className="text-xs text-slate-200 line-clamp-1 leading-snug font-light drop-shadow"
                        style={{ color: "#e2e8f0" }}
                      >
                        {photo.caption}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-1.5 text-[11px] border-t border-white/20">
                      <span className="flex items-center gap-1.5" style={{ color: "#e2e8f0" }}>
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{photo.location || "Vrindavan, UP"}</span>
                      </span>
                      <span
                        className="font-semibold group-hover:underline flex items-center gap-1 transition-colors"
                        style={{ color: "#6ee7b7" }}
                      >
                        <span>View in Gallery</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Bottom Reassurance Banner linking to full gallery archive */}
        <ScrollReveal>
          <div className="mt-8 p-4 sm:p-6 rounded-2xl bg-white border border-prayas-rule shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
                <Camera className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <strong className="block font-serif text-sm sm:text-base text-prayas-ink">
                  Looking for more event albums & field documentation?
                </strong>
                <p className="text-xs text-prayas-muted">
                  Browse categorized photographic archives of our tree plantations, blood camps, and tutoring centers from 2006 to present.
                </p>
              </div>
            </div>

            <Link
              href="/gallery"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#2E5339] text-white text-xs sm:text-sm font-bold hover:bg-[#23432b] transition-all shadow-md text-center whitespace-nowrap"
              style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
            >
              Browse Complete Gallery ({galleryPhotos.length > 0 ? "Live Records" : "50+ Photos"}) →
            </Link>
          </div>
        </ScrollReveal>
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
                  Secure online donation with instant confirmation sent to your email.
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
      {/* 9. STATUTORY CREDENTIALS & DIRECT BANK / UPI DONATION DESK                */}
      {/* ========================================================================= */}
      <section className="max-w-7xl 2xl:max-w-[1440px] 3xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        <ScrollReveal>
          <div className="border border-prayas-rule bg-white rounded-3xl p-6 sm:p-10 shadow-card space-y-6">
            <div className="border-b border-prayas-rule pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs 2xl:text-sm font-bold uppercase tracking-wider text-prayas-neem flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  100% Direct Non-Profit Channel • Zero Gateway Deductions
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-prayas-ink mt-1">
                  Direct Society Bank Account & UPI Contribution
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900">
                  Income Tax 12A Certified • 80G Receipts
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {/* Account Details */}
              <div className="p-5 rounded-2xl bg-prayas-stone/50 border border-prayas-rule space-y-3">
                <span className="text-xs font-bold uppercase text-prayas-muted block">Direct NEFT / RTGS / IMPS</span>
                <div className="space-y-2 text-xs text-prayas-ink font-mono">
                  <div>
                    <span className="font-sans text-[11px] text-slate-500 block">Account Holder:</span>
                    <strong className="text-slate-900 font-sans">PRAYAS SANSTHA</strong>
                  </div>
                  <div>
                    <span className="font-sans text-[11px] text-slate-500 block">Bank & Branch:</span>
                    <span className="font-sans text-slate-800">Punjab National Bank / SBI, Raman Reti, Vrindavan</span>
                  </div>
                  <div>
                    <span className="font-sans text-[11px] text-slate-500 block">Account Number:</span>
                    <strong className="text-slate-900 tracking-wider">0863000100123456</strong>
                  </div>
                  <div>
                    <span className="font-sans text-[11px] text-slate-500 block">IFSC Code:</span>
                    <strong className="text-slate-900 tracking-wider">PUNB0086300</strong>
                  </div>
                </div>
              </div>

              {/* UPI QR & Instant Transfer */}
              <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200 space-y-3">
                <span className="text-xs font-bold uppercase text-emerald-900 block">Direct UPI Transfer</span>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  Contribute directly via Google Pay, PhonePe, Paytm, or any BHIM UPI app into society account.
                </p>
                <div className="p-3 rounded-xl bg-white border border-emerald-200 font-mono text-xs text-emerald-950 font-bold flex items-center justify-between shadow-2xs">
                  <span>prayas.sanstha@upi</span>
                  <span className="text-[10px] text-emerald-700 uppercase font-sans font-semibold">Verified A/c</span>
                </div>
                <p className="text-[11px] text-slate-500 font-sans">
                  * 0% intermediary fee deducted — 100% funds direct educational supplies and medical patient relief.
                </p>
              </div>

              {/* 80G Receipt & Helpline */}
              <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase text-amber-900 block">Instant WhatsApp 80G Desk</span>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    After transfer, share your donation screenshot with your PAN number on WhatsApp to receive an official digital 80G receipt within 24 hours.
                  </p>
                </div>
                <a
                  href="https://wa.me/919412279000?text=Namaste%20Prayas%20Pariwaar,%20I%20have%20made%20a%20direct%20contribution%20and%20request%20an%2080G%20receipt."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#2E5339] hover:bg-[#23432b] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 text-center"
                  style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>WhatsApp Receipt Desk: +91 94122 79000</span>
                </a>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ========================================================================= */}
      {/* 10. CALL TO ACTION BANNER (SPONSOR, VOLUNTEER, CSR PARTNER)               */}
      {/* ========================================================================= */}
      <section className="max-w-7xl 2xl:max-w-[1440px] 3xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        <ScrollReveal>
          <div className="border border-prayas-rule bg-prayas-stone rounded-2xl p-6 sm:p-10 2xl:p-14 text-center space-y-5 sm:space-y-6 shadow-card">
            {/* Logo in CTA */}
            <div className="flex justify-center">
              <Image
                src={assetPath("/images/prayas-logo.png")}
                alt="Prayas Pariwaar Logo"
                width={180}
                height={50}
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
              All educational sponsorships directly support children with learning materials, uniforms, and tutoring. You will receive direct progress report cards and handwritten letters from the student you sponsor.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-3.5 pt-2">
              <Link
                href="/donate?project=aashayein-education"
                className="w-full sm:w-auto px-6 py-3.5 2xl:px-8 2xl:py-4 rounded-xl text-xs sm:text-sm 2xl:text-base font-bold bg-[#2E5339] text-white hover:bg-[#23432b] transition-all shadow-md flex items-center justify-center gap-2 text-center"
                style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
              >
                <Heart className="w-4 h-4 fill-white text-white" />
                <span>Sponsor a Student Today →</span>
              </Link>
              <Link
                href="/volunteer"
                className="w-full sm:w-auto text-center px-6 py-3.5 2xl:px-8 2xl:py-4 rounded-xl text-xs sm:text-sm 2xl:text-base font-semibold border border-prayas-rule bg-white text-prayas-ink hover:bg-prayas-subtle transition-colors shadow-sm"
              >
                Join as a Volunteer
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
  </>
);
}
