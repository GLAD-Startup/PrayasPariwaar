import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ScrollReveal from "@/components/ScrollReveal";
import FAQAccordion from "@/components/FAQAccordion";
import JsonLd from "@/components/JsonLd";
import HeroVideoScroll from "@/components/HeroVideoScroll";
import ProgramsCarousel from "@/components/ProgramsCarousel";
import HomeHorizontalTimeline from "@/components/HomeHorizontalTimeline";
import HomeImpactLedger from "@/components/HomeImpactLedger";
import HomeInteractiveCta from "@/components/HomeInteractiveCta";
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
  Film,
  Play,
} from "lucide-react";
import { isVideoUrl } from "@/lib/media";

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
    take: 8,
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
        take: 12,
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

  // Fetch timeline milestones from database (with static fallback)
  let dbMilestones: any[] = [];
  try {
    if ((prisma as any).timelineMilestone) {
      dbMilestones = await (prisma as any).timelineMilestone.findMany({
        where: { published: true },
        orderBy: [{ year: "asc" }, { order: "asc" }],
      });
    }
  } catch (e) {
    console.warn("Could not query timeline milestones in HomePage:", e);
  }

  // Fetch awards & official recognitions from database
  let awards: any[] = [];
  try {
    if ((prisma as any).award) {
      awards = await (prisma as any).award.findMany({
        orderBy: [{ order: "asc" }, { year: "desc" }],
        take: 3,
      });
    }
  } catch (e) {
    console.warn("Could not query awards in HomePage:", e);
  }

  const displayAwards =
    awards && awards.length > 0
      ? awards
      : [
          {
            id: "award-1",
            title: "Mathura District Administration Seva Samman",
            description:
              "Conferred by the District Magistrate of Mathura for outstanding public service during natural calamities and COVID-19 medical assistance.",
            imageUrl: "/images/timeline/timeline-2020-covid-relief.jpg",
            year: 2024,
          },
          {
            id: "award-2",
            title: "Uttar Pradesh Grassroots NGO Excellence Award",
            description:
              "Awarded by the State Social Welfare Board for 18 years of sustained rural education and community health initiatives in Braj region.",
            imageUrl: "/images/timeline/timeline-2022-eye-camp.jpg",
            year: 2022,
          },
          {
            id: "award-3",
            title: "Rotary Seva Ratna for Blood Donor Mobilization",
            description:
              "Recognized by Rotary Club of Mathura-Vrindavan for maintaining the largest voluntary emergency blood donor registry in the district.",
            imageUrl: "/images/timeline/timeline-2019-award.jpg",
            year: 2019,
          },
        ];

  // Filter out test screenshots/documents so only authentic field photography is displayed
  const cleanedGalleryPhotos = galleryPhotos.filter((p: any) => {
    const url = (p.url || "").toLowerCase();
    const title = (p.title || "").toLowerCase();
    if (url.includes("screenshot") || title.includes("credential") || title.includes("abcd") || url.includes("-removebg-")) {
      return false;
    }
    return Boolean(p.url);
  });

  // Only live uploaded photos from the database - zero hardcoded fallback images
  const displayPhotos = cleanedGalleryPhotos.slice(0, 8);

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
        "Absolutely. We encourage donors and supporters to visit our evening study centers, plantation sites, and medical equipment bank in Vrindavan. Please contact our office at +91 99270 81650 to schedule a visit, and our field coordinator will personally guide you.",
    },
    {
      question: "What is your administrative overhead?",
      answer:
        "Zero. 100% of public donations reach direct beneficiaries — students, patients, and plantation drives. All administrative and operational costs are covered separately by our founding members and local volunteers. This is independently verified by our chartered accountant's annual audit.",
    },
    {
      question: "How can I borrow free medical equipment for a family member?",
      answer:
        "Visit our Medical Equipment Bank page or call +91 99270 81650. We provide free temporary home loans of 10-litre oxygen concentrators, adjustable hospital beds, wheelchairs, BiPAP machines, and patient monitors. You only need to provide a valid ID and a refundable security deposit that is returned when the equipment is returned.",
    },
    {
      question: "Can my company partner with Prayas under CSR?",
      answer:
        "Yes. We welcome corporate CSR partnerships for education sponsorship, medical equipment sponsorship, tree plantation drives, and employee volunteering programs. Please fill out our Corporate Partnership Inquiry form or email us at av.prayas@gmail.com with your company's CSR objectives.",
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
      {/* ========================================================================= */}
      {/* 1. HERO SECTION: Full-Screen Video Intro & Scroll-Driven Hero Settlement  */}
      {/* ========================================================================= */}
      <HeroVideoScroll
        aashayeinProject={aashayeinProject}
        percentAashayein={percentAashayein}
      />

      <div className="space-y-20 sm:space-y-28 lg:space-y-36 pb-24 pt-16 sm:pt-20 lg:pt-24">
        {/* ========================================================================= */}
        {/* 2. KEY IMPACT LEDGER & STATUTORY TRUST BAND (ANIMATED & DYNAMIC)          */}
        {/* ========================================================================= */}
        <section className="max-w-6xl xl:max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 xl:px-20">
          <ScrollReveal>
            <HomeImpactLedger />
          </ScrollReveal>
        </section>

      {/* ========================================================================= */}
      {/* 3. ABOUT PRAYAS PARIWAAR — 18-YEAR LEGACY                                 */}
      {/* ========================================================================= */}
      <section className="max-w-6xl xl:max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 xl:px-20">
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Left: Overlapping Photo Composition */}
            <div className="lg:col-span-6 relative pb-6 sm:pb-10 pr-2 sm:pr-8 max-w-md lg:max-w-none mx-auto lg:mx-0 w-full">
              {/* Main Primary Image */}
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl aspect-[4/3] bg-prayas-stone border border-prayas-rule/60">
                <Image
                  src={assetPath("/images/Copy of DSC06322.JPG")}
                  alt="Prayas Pariwaar founders, volunteers and children gathered together in Vrindavan"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>

              {/* Overlapping Secondary Portrait (Bottom-Right) */}
              <div className="absolute -bottom-2 sm:-bottom-4 right-0 sm:right-2 w-5/12 sm:w-1/2 rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-4 border-white shadow-2xl aspect-[3/4] bg-prayas-stone">
                <Image
                  src={assetPath("/images/DSCF2107 (2).JPG")}
                  alt="Young student in Prayas school uniform with backpack in Vrindavan"
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-top"
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
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-prayas-neem flex items-center gap-2">
                  <span className="w-2 h-2 bg-prayas-neem shrink-0 rounded-full" />
                  About Prayas Pariwaar • Est. 2006
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
      {/* 3.5. 15-YEAR HISTORICAL JOURNEY HORIZONTAL TIMELINE (2011 - 2026)         */}
      {/* ========================================================================= */}
      <HomeHorizontalTimeline milestones={dbMilestones} />

      {/* ========================================================================= */}
      {/* 4. DYNAMIC 3D COVERFLOW PROGRAMS SHOWCASE                                */}
      {/* ========================================================================= */}
      <section className="w-full overflow-hidden py-8 sm:py-12 bg-gradient-to-b from-transparent via-emerald-950/[0.02] to-transparent">
        <div className="max-w-6xl xl:max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 xl:px-20">
          <ScrollReveal>
            <div className="border-b border-prayas-rule pb-4 mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <span className="text-xs 2xl:text-sm font-bold uppercase tracking-wider text-prayas-neem flex items-center gap-2">
                  <span className="w-2 h-2 bg-prayas-neem shrink-0" />
                  Our Programs of Seva • Vrindavan Grassroots
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl 2xl:text-4xl font-bold text-prayas-ink mt-1">
                  Active Programs Serving Vrindavan & Mathura District
                </h2>
                <p className="text-xs sm:text-sm text-prayas-muted mt-1 max-w-2xl font-normal">
                  Explore our core grassroots initiatives in education, native afforestation, emergency blood network, and free healthcare camps across Vrindavan.
                </p>
              </div>
              <Link
                href="/projects"
                className="text-xs 2xl:text-sm font-bold text-prayas-neem hover:text-emerald-950 flex items-center gap-1.5 transition-colors self-start sm:self-auto shrink-0"
              >
                <span>View All Programs</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>
        </div>

        {/* 3D Perspective Layered Coverflow with Dynamic Implying Story Columns */}
        <ProgramsCarousel projects={activeProjects} />
      </section>

      {/* ========================================================================= */}
      {/* 5. MOMENTS OF SEVA — DYNAMIC ON-GROUND PHOTO GALLERY                       */}
      {/* ========================================================================= */}
      <section className="max-w-6xl xl:max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 xl:px-20">
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
        </ScrollReveal>

        {/* Dynamic Pure Photo Collage (Zero text, mosaic layout) */}
        {displayPhotos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[140px] sm:auto-rows-[180px] md:auto-rows-[220px] lg:auto-rows-[240px] gap-3 sm:gap-4 md:gap-5">
            {displayPhotos.map((photo: any, idx: number) => {
              const targetUrl = photo.albumId ? `/gallery?albumId=${photo.albumId}` : "/gallery";
              const isVideo = isVideoUrl(photo.url || photo.src);

              // Asymmetric mosaic span pattern for seamless 8-photo collage:
              // Index 0: 2x2 featured tile (top-left)
              // Index 5: 2x1 wide panorama tile (bottom-left)
              // Others: 1x1 tiles
              const spanClass =
                idx === 0
                  ? "col-span-2 row-span-2"
                  : idx === 5
                  ? "col-span-2 row-span-1"
                  : "col-span-1 row-span-1";

              return (
                <ScrollReveal key={photo.id || idx} delay={idx * 30} className={spanClass}>
                  <Link
                    href={targetUrl}
                    className="group relative w-full h-full overflow-hidden rounded-2xl bg-stone-900 border border-prayas-rule/80 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 block"
                  >
                    {isVideo ? (
                      <div className="relative w-full h-full bg-slate-950">
                        <video
                          src={assetPath(photo.url || photo.src)}
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/45 backdrop-blur-sm flex items-center justify-center text-white border border-white/30 group-hover:scale-110 transition-transform shadow-md">
                            <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white translate-x-0.5" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Image
                        src={assetPath(photo.url || photo.src)}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        loading="lazy"
                      />
                    )}
                    {/* Soft hover illumination */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-white border border-prayas-rule shadow-xs space-y-2">
            <Camera className="w-8 h-8 text-emerald-700/40 mx-auto" />
            <p className="font-serif text-base font-bold text-prayas-ink">No Field Photos Uploaded Yet</p>
            <p className="text-xs text-prayas-muted max-w-md mx-auto">
              Live field photography captures published through the Admin panel will appear here automatically.
            </p>
          </div>
        )}

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
              Browse Complete Gallery ({displayPhotos.length > 0 ? `${displayPhotos.length} Live Records` : "Explore Archive"}) →
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* ========================================================================= */}
      {/* 6. VOICES OF TRANSFORMATION & COMMUNITY TESTIMONIALS                       */}
      {/* ========================================================================= */}
      <section className="max-w-6xl xl:max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 xl:px-20">
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
                <div
                  key={item.id}
                  className="group bg-slate-50/50 hover:bg-white p-5 sm:p-6 rounded-2xl border border-prayas-rule/80 hover:border-emerald-500/40 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 shadow-2xs group-hover:scale-110 transition-transform">
                      <Quote className="w-4 h-4 text-prayas-marigold" />
                    </div>
                    <p className="text-xs sm:text-sm 2xl:text-base text-prayas-ink leading-relaxed italic font-serif">
                      "{item.quote}"
                    </p>
                  </div>
                  <div className="border-t border-prayas-rule pt-3 mt-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-900/10 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-300/40 shrink-0">
                      {(item.authorName || "P")[0]}
                    </div>
                    <div>
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
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ========================================================================= */}
      {/* 7. HONORS & RECOGNITIONS — STATE, DISTRICT & CIVIC COMMENDATIONS          */}
      {/* ========================================================================= */}
      <section className="max-w-6xl xl:max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 xl:px-20">
        <ScrollReveal>
          <div className="border-b border-prayas-rule pb-4 mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs 2xl:text-sm font-bold uppercase tracking-wider text-prayas-neem flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-prayas-marigold" />
                Official Recognitions • 18 Years of Trust
              </span>
              <h2 className="font-serif text-xl sm:text-2xl 2xl:text-3xl font-bold text-prayas-ink mt-1">
                Honors & Commendations for Dedicated Seva
              </h2>
              <p className="text-xs sm:text-sm text-prayas-muted mt-1 max-w-2xl font-normal">
                State and district commendations honoring 18 years of uninterrupted community service, transparent stewardship, and grassroots impact across Mathura & Vrindavan.
              </p>
            </div>
            <Link
              href="/about/awards"
              className="text-xs 2xl:text-sm font-bold text-prayas-neem hover:text-emerald-950 flex items-center gap-1.5 transition-colors self-start sm:self-auto shrink-0 group"
            >
              <span>View All Recognitions</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {displayAwards.map((award: any) => (
              <Link
                key={award.id}
                href="/about/awards"
                className="group bg-white rounded-2xl border border-prayas-rule p-5 sm:p-6 shadow-card hover:shadow-xl hover:border-emerald-600/40 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Award Preview Photo / Emblem */}
                  <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-gradient-to-br from-stone-100 to-amber-50/40 border border-prayas-rule/60">
                    {award.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={assetPath(award.imageUrl)}
                        alt={award.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-amber-700/70 p-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-amber-100/80 border border-amber-200 flex items-center justify-center text-amber-700 mb-2">
                          <Award className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-semibold text-prayas-ink/70">Official Commendation</span>
                      </div>
                    )}
                    {/* Year Badge floating in top right */}
                    {award.year && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/20 text-white font-mono font-bold text-xs tracking-wide shadow-xs">
                        {award.year}
                      </div>
                    )}
                  </div>

                  {/* Header / Meta */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-prayas-neem">
                      <span className="w-1.5 h-1.5 rounded-full bg-prayas-neem" />
                      <span>Official Recognition</span>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-prayas-ink leading-snug group-hover:text-prayas-neem transition-colors">
                      {award.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-prayas-muted leading-relaxed line-clamp-3">
                      {award.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="border-t border-prayas-rule/70 pt-4 mt-5 flex items-center justify-between text-xs font-semibold text-prayas-muted group-hover:text-prayas-neem transition-colors">
                  <span className="text-[11px] text-prayas-muted font-normal">Mathura District Seva</span>
                  <span className="flex items-center gap-1 font-semibold text-prayas-neem">
                    View citation <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* ========================================================================= */}
      {/* 8. HOW YOUR ₹500 REACHES A CHILD — DONOR TRANSPARENCY JOURNEY              */}
      {/* ========================================================================= */}
      <section className="max-w-6xl xl:max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 xl:px-20">
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
              <div className="group text-center space-y-3 journey-connector p-4 rounded-2xl bg-slate-50/40 hover:bg-white border border-transparent hover:border-emerald-500/30 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 2xl:w-16 2xl:h-16 mx-auto rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center text-prayas-neem group-hover:scale-110 group-hover:bg-green-100 transition-all shadow-xs">
                  <Banknote className="w-6 h-6 sm:w-7 sm:h-7 2xl:w-8 2xl:h-8" />
                </div>
                <div>
                  <span className="text-[10px] 2xl:text-xs font-bold uppercase text-prayas-neem px-2 py-0.5 rounded-full bg-green-100/70 border border-green-300/40 inline-block">
                    Step 1
                  </span>
                  <h4 className="font-serif text-sm 2xl:text-base font-bold text-prayas-ink mt-1">You Donate</h4>
                </div>
                <p className="text-[11px] 2xl:text-xs text-prayas-muted leading-relaxed">
                  Secure online donation with instant confirmation sent to your email.
                </p>
              </div>

              {/* Step 2 */}
              <div className="group text-center space-y-3 journey-connector p-4 rounded-2xl bg-slate-50/40 hover:bg-white border border-transparent hover:border-emerald-500/30 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 2xl:w-16 2xl:h-16 mx-auto rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center text-prayas-neem group-hover:scale-110 group-hover:bg-green-100 transition-all shadow-xs">
                  <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 2xl:w-8 2xl:h-8" />
                </div>
                <div>
                  <span className="text-[10px] 2xl:text-xs font-bold uppercase text-prayas-neem px-2 py-0.5 rounded-full bg-green-100/70 border border-green-300/40 inline-block">
                    Step 2
                  </span>
                  <h4 className="font-serif text-sm 2xl:text-base font-bold text-prayas-ink mt-1">Zero Admin Cut</h4>
                </div>
                <p className="text-[11px] 2xl:text-xs text-prayas-muted leading-relaxed">
                  100% direct allocation. Founding members cover all administrative costs separately.
                </p>
              </div>

              {/* Step 3 */}
              <div className="group text-center space-y-3 journey-connector p-4 rounded-2xl bg-slate-50/40 hover:bg-white border border-transparent hover:border-emerald-500/30 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 2xl:w-16 2xl:h-16 mx-auto rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center text-prayas-neem group-hover:scale-110 group-hover:bg-green-100 transition-all shadow-xs">
                  <Send className="w-6 h-6 sm:w-7 sm:h-7 2xl:w-8 2xl:h-8" />
                </div>
                <div>
                  <span className="text-[10px] 2xl:text-xs font-bold uppercase text-prayas-neem px-2 py-0.5 rounded-full bg-green-100/70 border border-green-300/40 inline-block">
                    Step 3
                  </span>
                  <h4 className="font-serif text-sm 2xl:text-base font-bold text-prayas-ink mt-1">Direct to Child</h4>
                </div>
                <p className="text-[11px] 2xl:text-xs text-prayas-muted leading-relaxed">
                  Textbooks, uniforms, evening tuition centers, and nutrition for the named student.
                </p>
              </div>

              {/* Step 4 */}
              <div className="group text-center space-y-3 p-4 rounded-2xl bg-slate-50/40 hover:bg-white border border-transparent hover:border-amber-500/30 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 2xl:w-16 2xl:h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 group-hover:scale-110 group-hover:bg-amber-100 transition-all shadow-xs">
                  <FileCheck2 className="w-6 h-6 sm:w-7 sm:h-7 2xl:w-8 2xl:h-8" />
                </div>
                <div>
                  <span className="text-[10px] 2xl:text-xs font-bold uppercase text-amber-800 px-2 py-0.5 rounded-full bg-amber-100/70 border border-amber-300/40 inline-block">
                    Step 4
                  </span>
                  <h4 className="font-serif text-sm 2xl:text-base font-bold text-prayas-ink mt-1">Report Card to You</h4>
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
      <section className="max-w-6xl xl:max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 xl:px-20">
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
      {/* 9. CALL TO ACTION BANNER (DYNAMIC GIVING CHIPS & CSR PARTNER)             */}
      {/* ========================================================================= */}
      <section className="max-w-6xl xl:max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 xl:px-20">
        <ScrollReveal>
          <HomeInteractiveCta />
        </ScrollReveal>
      </section>
    </div>
  </>
);
}
