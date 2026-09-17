"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { assetPath } from "@/lib/api";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Pause,
  Play,
  Sparkles,
  Camera,
} from "lucide-react";

export interface ProgramItem {
  id: string;
  title: string;
  slug: string;
  category?: string;
  description: string;
  coverImage?: string;
  goalAmount: number;
  raisedAmount: number;
  images?: any[];
  album?: { id: string; title: string };
  location?: string;
  tagline?: string;
  impactMetric?: string;
}

// Curated authentic Vrindavan programs ensuring a magnificent 5-card 3D coverflow
const defaultFallbackPrograms: ProgramItem[] = [
  {
    id: "prog-1",
    title: "Project Aashayein: Rural & Slum Child Education",
    slug: "aashayein-education",
    category: "FREE EDUCATION",
    description:
      "Supporting over 300 children from marginalized families in rural Mathura and Vrindavan slums with textbooks, evening remedial tutoring, stationery, and nutritious snacks so poverty never stops a child's right to learn.",
    coverImage: assetPath("/images/banyan-study-vrindavan.jpg"),
    goalAmount: 350000,
    raisedAmount: 215000,
    location: "Vrindavan & Kesi Ghat",
    tagline: "Empowering 300+ children with daily evening study circles",
    impactMetric: "300+ Slum Students Supported",
    album: { id: "cmtqo4l0t0000ag5a8iqmpc8a", title: "Project Aashayein" },
  },
  {
    id: "prog-2",
    title: "Vrindavan Harit Kranti: Native Tree Plantation",
    slug: "vrindavan-harit-kranti",
    category: "PLANTATION",
    description:
      "Restoring the sacred groves (vanas) of Vrindavan and Govardhan through community plantation of deep-rooted native Neem, Peepal, and Banyan saplings with year-round tree-guard maintenance along Parikrama Marg.",
    coverImage: assetPath("/images/vrindavan-plantation.jpg"),
    goalAmount: 200000,
    raisedAmount: 180000,
    location: "Govardhan & Parikrama Marg",
    tagline: "1,200+ indigenous trees protected with iron tree-guards",
    impactMetric: "1,200+ Native Trees Protected",
    album: { id: "alb-plantation", title: "Harit Kranti" },
  },
  {
    id: "prog-3",
    title: "Jan Swasthya Raksha: Free Health & Eye Care Camps",
    slug: "jan-swasthya-raksha",
    category: "HEALTHCARE",
    description:
      "Monthly general health checkups, diagnostic tests, geriatric eye screening for cataract surgery, and free distribution of prescribed medicines for sadhus, widows, and low-income daily-wage earners across Mathura district.",
    coverImage: assetPath("/images/health-camp-vrindavan.jpg"),
    goalAmount: 250000,
    raisedAmount: 160000,
    location: "Rural Mathura Belt",
    tagline: "Free geriatric eye screening, cataract surgeries & medicines",
    impactMetric: "8,200+ Health Camp Beneficiaries",
    album: { id: "alb-health", title: "Jan Swasthya Camps" },
  },
  {
    id: "prog-4",
    title: "Aadhar Career & Digital Vocational Counseling",
    slug: "aadhar-career-counseling",
    category: "YOUTH EMPOWERMENT",
    description:
      "Guiding rural high-school youth with digital computer literacy, aptitude testing, civil service coaching guidance, and anti-substance abuse counseling across government schools in Mathura.",
    coverImage: assetPath("/images/youth-skills-vrindavan.jpg"),
    goalAmount: 150000,
    raisedAmount: 95000,
    location: "Government Schools, Mathura",
    tagline: "Career guidance & digital skills for rural youth",
    impactMetric: "450+ High School Youths Mentored",
  },
  {
    id: "prog-5",
    title: "Jeevan Raksha: 24/7 Volunteer Emergency Blood Network",
    slug: "emergency-blood-bank",
    category: "EMERGENCY RELIEF",
    description:
      "A 24/7 volunteer-driven emergency donor network coordinating life-saving blood units across Mathura, Agra, and Vrindavan hospitals alongside free home loans of 10L oxygen concentrators for elderly recovery.",
    coverImage: assetPath("/images/medical-blood-seva.jpg"),
    goalAmount: 150000,
    raisedAmount: 120000,
    location: "Vrindavan & Mathura Hospitals",
    tagline: "24/7 Zero-delay emergency blood coordination helpline",
    impactMetric: "8,200+ Blood Units Coordinated",
    album: { id: "alb-blood", title: "Blood Seva" },
  },
];

interface ProgramsCarouselProps {
  projects?: any[];
}

export default function ProgramsCarousel({ projects = [] }: ProgramsCarouselProps) {
  // Merge database active projects with fallback programs so we have at least 5 items for a gorgeous 3D fan-out
  const programList: ProgramItem[] = React.useMemo(() => {
    if (!projects || projects.length === 0) return defaultFallbackPrograms;

    const formattedDbProjects: ProgramItem[] = projects.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      category: p.category ? p.category.replace(/_/g, " ") : "COMMUNITY SEVA",
      description: p.description || "",
      coverImage: assetPath(
        p.coverImage || (p.images && p.images[0]?.url) || "/images/youth-skills-vrindavan.jpg"
      ),
      goalAmount: p.goalAmount || 0,
      raisedAmount: p.raisedAmount || 0,
      album: p.album,
      location: "Vrindavan & Mathura District",
      tagline: p.metaDescription || "Grassroots community seva initiative in Vrindavan",
      impactMetric: p.goalAmount > 0 ? `₹${(p.raisedAmount || 0).toLocaleString("en-IN")} Seva Fund Raised` : "100% Volunteer Seva",
    }));

    // If database has fewer than 5 items, fill up with distinct defaults
    const combined = [...formattedDbProjects];
    for (const fb of defaultFallbackPrograms) {
      if (combined.length >= 5) break;
      if (!combined.some((item) => item.slug === fb.slug)) {
        combined.push(fb);
      }
    }
    return combined;
  }, [projects]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Responsive mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const total = programList.length;

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (idx: number) => {
    setActiveIndex(idx);
  };

  // Auto-play timer with pause on hover
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide, total]);

  // Touch Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const diff = touchStartXRef.current - touchEndXRef.current;
    if (diff > 45) {
      nextSlide();
    } else if (diff < -45) {
      prevSlide();
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      prevSlide();
    } else if (e.key === "ArrowRight") {
      nextSlide();
    }
  };

  // Active program for the implying deep-dive section
  const currentProgram = programList[activeIndex] || programList[0];
  const percentCurrent =
    currentProgram.goalAmount > 0
      ? Math.min(Math.round((currentProgram.raisedAmount / currentProgram.goalAmount) * 100), 100)
      : 0;


  return (
    <div
      className="relative w-full select-none outline-none focus:outline-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Active Programs 3D Carousel"
    >
      {/* ========================================================================= */}
      {/* 1. 3D COVERFLOW STAGE                                                     */}
      {/* ========================================================================= */}
      <div className="relative w-full h-[440px] sm:h-[490px] md:h-[530px] lg:h-[560px] flex items-center justify-center overflow-hidden py-4 sm:py-6">
        {/* Ambient Subtle Radial Background */}
        <div className="absolute inset-0 pointer-events-none bg-radial from-emerald-950/5 via-transparent to-transparent opacity-80" />

        {/* 3D Perspective Viewport */}
        <div
          className="relative w-full h-full max-w-7xl mx-auto flex items-center justify-center"
          style={{ perspective: isMobile ? "1000px" : "1500px" }}
        >
          {programList.map((program, idx) => {
            // Calculate shortest directional offset (-2, -1, 0, 1, 2, etc.)
            let offset = (idx - activeIndex) % total;
            if (offset > total / 2) offset -= total;
            if (offset < -total / 2) offset += total;

            const isCurrent = offset === 0;
            const isDirectNeighbor = Math.abs(offset) === 1;
            const isFarNeighbor = Math.abs(offset) === 2;

            // Compute 3D coverflow coordinates
            let xPercent = 0;
            let scale = 1;
            let rotateY = 0;
            let zIndex = 30;
            let opacity = 1;
            let zDepth = 0;

            if (isCurrent) {
              xPercent = 0;
              scale = 1;
              rotateY = 0;
              zIndex = 40;
              opacity = 1;
              zDepth = 0;
            } else if (offset === -1) {
              // Left card: fanned out in 3D perspective
              xPercent = isMobile ? -68 : -54;
              scale = isMobile ? 0.86 : 0.84;
              rotateY = isMobile ? 12 : 22;
              zIndex = 25;
              opacity = isMobile ? 0.7 : 0.85;
              zDepth = -100;
            } else if (offset === 1) {
              // Right card: fanned out in 3D perspective
              xPercent = isMobile ? 68 : 54;
              scale = isMobile ? 0.86 : 0.84;
              rotateY = isMobile ? -12 : -22;
              zIndex = 25;
              opacity = isMobile ? 0.7 : 0.85;
              zDepth = -100;
            } else if (offset === -2) {
              // Far Left card
              xPercent = isMobile ? -105 : -92;
              scale = isMobile ? 0.72 : 0.7;
              rotateY = isMobile ? 18 : 34;
              zIndex = 15;
              opacity = isMobile ? 0.2 : 0.5;
              zDepth = -200;
            } else if (offset === 2) {
              // Far Right card
              xPercent = isMobile ? 105 : 92;
              scale = isMobile ? 0.72 : 0.7;
              rotateY = isMobile ? -18 : -34;
              zIndex = 15;
              opacity = isMobile ? 0.2 : 0.5;
              zDepth = -200;
            } else {
              // Off-screen
              xPercent = offset > 0 ? 140 : -140;
              scale = 0.5;
              rotateY = offset > 0 ? -40 : 40;
              zIndex = 5;
              opacity = 0;
              zDepth = -300;
            }


            return (
              <div
                key={program.id || idx}
                onClick={() => {
                  if (!isCurrent) goToSlide(idx);
                }}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[88vw] sm:w-[500px] md:w-[580px] lg:w-[620px] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform ${
                  isCurrent ? "cursor-default" : "cursor-pointer hover:opacity-95"
                }`}
                style={{
                  transform: `translate(-50%, -50%) translateX(${xPercent}%) translateZ(${zDepth}px) rotateY(${rotateY}deg) scale(${scale})`,
                  zIndex,
                  opacity,
                  transformStyle: "preserve-3d",
                  pointerEvents: isCurrent || isDirectNeighbor || isFarNeighbor ? "auto" : "none",
                }}
              >
                {/* Clean Showcase Card */}
                <div
                  className={`relative p-2 sm:p-2.5 bg-white rounded-2xl shadow-2xl transition-all duration-500 border ${
                    isCurrent
                      ? "border-emerald-700/30 ring-4 ring-emerald-800/10 shadow-[0_20px_60px_-15px_rgba(46,83,57,0.25)]"
                      : "border-slate-200/90 shadow-lg"
                  }`}
                >
                  {/* Photo Container */}
                  <div className="relative w-full aspect-[16/10] sm:aspect-[16/9.5] rounded-xl overflow-hidden bg-slate-900">
                    <Image
                      src={program.coverImage || assetPath("/images/youth-skills-vrindavan.jpg")}
                      alt={program.title}
                      fill
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 70vw, 620px"
                      priority={isCurrent}
                      className={`object-cover transition-transform duration-700 ${
                        isCurrent ? "group-hover:scale-105" : ""
                      }`}
                    />

                    {/* Subtle Bottom Vignette for Topic Line & Button Legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent z-10" />

                    {/* Bottom Overlay: Only Topic Line and Donate Button */}
                    <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                      <h3
                        className="font-serif text-base sm:text-xl md:text-2xl font-bold leading-tight drop-shadow-md line-clamp-2 max-w-lg"
                        style={{ color: "#ffffff" }}
                      >
                        {program.title}
                      </h3>

                      <Link
                        href={`/donate?project=${program.slug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#2E5339] hover:bg-[#23432b] text-white text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-1.5 shrink-0 self-start sm:self-auto border border-emerald-400/40 hover:scale-105 active:scale-95 cursor-pointer"
                        style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
                      >
                        <Heart className="w-3.5 h-3.5 fill-white text-white" />
                        <span>Donate</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Left/Right Navigation Chevrons */}
        <button
          onClick={prevSlide}
          aria-label="Previous Program"
          className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-50 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/95 hover:bg-white text-prayas-ink hover:text-emerald-900 shadow-xl border border-prayas-rule flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-sm"
        >
          <ChevronLeft className="w-6 h-6 text-slate-800" />
        </button>

        <button
          onClick={nextSlide}
          aria-label="Next Program"
          className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/95 hover:bg-white text-prayas-ink hover:text-emerald-900 shadow-xl border border-prayas-rule flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-sm"
        >
          <ChevronRight className="w-6 h-6 text-slate-800" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. CAROUSEL CONTROLS & PAGINATION PILLS                                   */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 pt-2 pb-6 border-b border-prayas-rule">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {programList.map((prog, i) => {
            const isSelected = i === activeIndex;
            return (
              <button
                key={prog.id || i}
                onClick={() => goToSlide(i)}
                aria-label={`Go to slide ${i + 1}: ${prog.title}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  isSelected
                    ? "w-8 sm:w-10 h-2.5 bg-[#2E5339] shadow-sm"
                    : "w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            );
          })}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
          <span className="font-mono text-slate-700">
            <strong>0{activeIndex + 1}</strong> / 0{total}
          </span>
          <span className="text-slate-300">•</span>
          <button
            onClick={() => setIsPaused((prev) => !prev)}
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-emerald-900 transition-colors cursor-pointer"
            title={isPaused ? "Resume auto-rotation" : "Pause auto-rotation"}
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            <span>{isPaused ? "Play" : "Pause"}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ACTIVE PROGRAM IMPLYING DEEP-DIVE DESK (MATCHING REFERENCE 3-COLUMN)   */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {/* Column 1: On-Ground Grassroots Mission */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-prayas-neem flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              On-Ground Grassroots Mission
            </span>
            <h4 className="font-serif text-lg sm:text-xl font-bold text-prayas-ink leading-snug">
              {currentProgram.title}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {currentProgram.description}
            </p>
            <div className="pt-2">
              <Link
                href={`/projects/${currentProgram.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 hover:underline decoration-2"
              >
                <span>Read Full Program Documentation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Column 2: Direct Impact Metrics & Verification */}
          <div className="space-y-2.5 border-t md:border-t-0 md:border-l border-prayas-rule pt-4 md:pt-0 md:pl-6 lg:pl-8">
            <span className="text-[11px] font-bold uppercase tracking-wider text-prayas-neem flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              Verified Seva Impact & Accountability
            </span>
            <div className="space-y-2 pt-1">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <strong className="text-slate-900 block font-semibold">100% Direct Allocation</strong>
                  <span className="text-slate-500 text-[11px] sm:text-xs">
                    Zero administrative deductions. Every rupee reaches direct beneficiaries.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <strong className="text-slate-900 block font-semibold">
                    {currentProgram.impactMetric || "Grassroots Seva Serving Mathura District"}
                  </strong>
                  <span className="text-slate-500 text-[11px] sm:text-xs">
                    Operating continuously in Vrindavan, Govardhan, and rural villages.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <strong className="text-slate-900 block font-semibold">Transparent Donor Reports</strong>
                  <span className="text-slate-500 text-[11px] sm:text-xs">
                    Quarterly academic report cards and field photographs sent to sponsors.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Immediate Support & Donation Presets */}
          <div className="space-y-3 border-t md:border-t-0 md:border-l border-prayas-rule pt-4 md:pt-0 md:pl-6 lg:pl-8 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-prayas-neem block">
                Direct Seva Sponsorship
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Join our family of regular patrons and make an immediate, tangible impact on the ground in Vrindavan.
              </p>
              {currentProgram.goalAmount > 0 && (
                <div className="p-3 bg-prayas-paper border border-prayas-rule rounded-xl space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-800">
                    <span>Fund Status:</span>
                    <span className="font-mono font-bold text-emerald-800">
                      ₹{currentProgram.raisedAmount?.toLocaleString("en-IN")} / ₹
                      {currentProgram.goalAmount?.toLocaleString("en-IN")} ({percentCurrent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-700 rounded-full transition-all"
                      style={{ width: `${percentCurrent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-1 flex flex-wrap items-center gap-3">
              <Link
                href={`/donate?project=${currentProgram.slug}`}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2E5339] hover:bg-[#23432b] text-white text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2"
                style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
              >
                <Heart className="w-4 h-4 fill-white text-white" />
                <span>Sponsor This Program</span>
              </Link>

              {currentProgram.album && (
                <Link
                  href={`/gallery?albumId=${currentProgram.album.id}`}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Photo Album</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
