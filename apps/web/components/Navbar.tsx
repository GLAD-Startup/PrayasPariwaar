"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { assetPath } from "@/lib/api";
import {
  Phone,
  Droplet,
  Heart,
  Stethoscope,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  BookOpen,
  Trees,
  Award,
  Newspaper,
  Users,
  Building2,
  Images,
  GraduationCap,
  Sparkles,
  MapPin,
  ChevronRight,
  ArrowRight,
  FileText,
  MessageSquare,
  Camera,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname() || "";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [workDropdownOpen, setWorkDropdownOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [involvedDropdownOpen, setInvolvedDropdownOpen] = useState(false);

  // Mobile accordion state
  const [mobileProgramsOpen, setMobileProgramsOpen] = useState(false);
  const [mobileInvolvedOpen, setMobileInvolvedOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);

  // Smooth scroll-driven visibility state
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window !== "undefined" && window.location.pathname === "/" && window.scrollY < 80) {
      return false;
    }
    return true;
  });
  const lastScrollY = useRef(0);

  useEffect(() => {
    const isHeroSettled = () => {
      if (typeof window === "undefined") return false;
      return (
        sessionStorage.getItem("prayas_hero_settled") === "1" ||
        document.documentElement.dataset.heroVideoSettled === "true"
      );
    };

    // Immediately configure navbar on homepage if user is at top of page
    if (pathname === "/") {
      document.documentElement.classList.add("is-home");
      const settled = isHeroSettled();
      const p = settled ? 1 : parseFloat(document.documentElement.dataset.heroVideoProgress || "0");
      if (!settled && window.scrollY < 120 && p < 0.18) {
        setIsVisible(false);
        document.documentElement.classList.add("hero-video-fullscreen");
      } else {
        setIsVisible(true);
        document.documentElement.classList.remove("hero-video-fullscreen");
      }
    } else {
      document.documentElement.classList.remove("is-home");
      document.documentElement.classList.remove("hero-video-fullscreen");
      setIsVisible(true);
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isHome = pathname === "/";
      const settled = isHeroSettled();
      const heroProgressRaw = document.documentElement.dataset.heroVideoProgress;
      const heroProgress = settled ? 1 : (heroProgressRaw ? parseFloat(heroProgressRaw) : 0);
      // On homepage: in fullscreen intro mode (< 0.18 progress)
      if (!settled && isHome && heroProgress < 0.18 && currentScrollY < 140 && !mobileMenuOpen) {
        setIsVisible(false);
        document.documentElement.classList.add("hero-video-fullscreen");
        lastScrollY.current = currentScrollY;
        return;
      }

      document.documentElement.classList.remove("hero-video-fullscreen");

      // While near top on homepage (scrollY <= 160), ensure the header is VISIBLE.
      if (isHome && currentScrollY <= 160) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      // Keep header visible if mobile drawer is actively open
      if (mobileMenuOpen) {
        setIsVisible(true);
        return;
      }

      const delta = currentScrollY - lastScrollY.current;

      // Filter out micro-scroll jitters
      if (Math.abs(delta) < 8) return;

      if (delta > 0 && currentScrollY > 120) {
        // Scrolling down: gracefully slide header out of view
        setIsVisible(false);
        setWorkDropdownOpen(false);
        setAboutDropdownOpen(false);
        setInvolvedDropdownOpen(false);
      } else if (delta < 0) {
        // Scrolling up: smoothly bring header back into view
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    const handleHeroProgress = (e: any) => {
      if (pathname !== "/") return;
      if (isHeroSettled()) {
        setIsVisible(true);
        document.documentElement.classList.remove("hero-video-fullscreen");
        return;
      }
      const p = e?.detail?.progress ?? 0;
      if (p >= 0.18) {
        setIsVisible(true);
        document.documentElement.classList.remove("hero-video-fullscreen");
      } else if (p < 0.15 && window.scrollY < 140 && !mobileMenuOpen) {
        setIsVisible(false);
        document.documentElement.classList.add("hero-video-fullscreen");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("hero-video-scroll", handleHeroProgress);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("hero-video-scroll", handleHeroProgress);
    };
  }, [mobileMenuOpen, pathname]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setWorkDropdownOpen(false);
    setAboutDropdownOpen(false);
    setInvolvedDropdownOpen(false);
    setMobileProgramsOpen(false);
    setMobileInvolvedOpen(false);
    setMobileAboutOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const isActive = (path: string) => {
    if (!pathname) return false;
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-500 ease-in-out will-change-transform ${
        isVisible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "-translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      {/* Top Ledger Strip: Flowing Marquee Ticker */}
      <div className="bg-prayas-stone border-b border-prayas-rule text-[11px] sm:text-xs text-prayas-muted py-1.5 select-none w-full overflow-hidden relative z-20">
        {/* Subtle left/right fade gradients for high-end look */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 sm:w-12 bg-gradient-to-r from-prayas-stone to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 sm:w-12 bg-gradient-to-l from-prayas-stone to-transparent z-10" />

        <div className="overflow-hidden w-full flex items-center">
          <div className="animate-marquee flex items-center whitespace-nowrap">
            {/* First sequence */}
            <div className="flex items-center gap-6 sm:gap-8 shrink-0 pr-6 sm:pr-8">
              <Link
                href="/projects/aashayein-education"
                className="inline-flex items-center gap-1.5 font-semibold text-slate-800 hover:text-emerald-800 transition-colors"
              >
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0" aria-hidden="true" />
                <GraduationCap className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Project Aashayein: Sponsor a Student for ₹500/mo</span>
              </Link>

              <span className="text-slate-300 select-none">•</span>

              <a
                href="tel:+919927081650"
                className="inline-flex items-center gap-1 font-semibold text-rose-700 hover:underline"
              >
                <Droplet className="w-3.5 h-3.5 fill-current shrink-0" />
                <span>24/7 Emergency Blood Helpline: +91 99270 81650</span>
              </a>

              <span className="text-slate-300 select-none">•</span>

              <Link
                href="/medical-equipment"
                className="inline-flex items-center gap-1.5 font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
              >
                <Stethoscope className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Free Medical Equipment Bank: Oxygen & Beds</span>
              </Link>

              <span className="text-slate-300 select-none">•</span>

              <Link
                href="/projects/vrindavan-harit-kranti"
                className="inline-flex items-center gap-1.5 font-medium text-slate-700 hover:text-slate-900 transition-colors"
              >
                <Trees className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Vrindavan Harit Kranti: 5,400+ Native Trees Planted</span>
              </Link>

              <span className="text-slate-300 select-none">•</span>

              <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>18-Yr Registered Society (Reg. 142/2006-07)</span>
              </span>
            </div>

            {/* Second sequence (Identical duplicate for seamless continuous marquee loop) */}
            <div className="flex items-center gap-6 sm:gap-8 shrink-0 pr-6 sm:pr-8" aria-hidden="true">
              <Link
                href="/projects/aashayein-education"
                className="inline-flex items-center gap-1.5 font-semibold text-slate-800 hover:text-emerald-800 transition-colors"
              >
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0" aria-hidden="true" />
                <GraduationCap className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Project Aashayein: Sponsor a Student for ₹500/mo</span>
              </Link>

              <span className="text-slate-300 select-none">•</span>

              <a
                href="tel:+919927081650"
                className="inline-flex items-center gap-1 font-semibold text-rose-700 hover:underline"
              >
                <Droplet className="w-3.5 h-3.5 fill-current shrink-0" />
                <span>24/7 Emergency Blood Helpline: +91 99270 81650</span>
              </a>

              <span className="text-slate-300 select-none">•</span>

              <Link
                href="/medical-equipment"
                className="inline-flex items-center gap-1.5 font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
              >
                <Stethoscope className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Free Medical Equipment Bank: Oxygen & Beds</span>
              </Link>

              <span className="text-slate-300 select-none">•</span>

              <Link
                href="/projects/vrindavan-harit-kranti"
                className="inline-flex items-center gap-1.5 font-medium text-slate-700 hover:text-slate-900 transition-colors"
              >
                <Trees className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Vrindavan Harit Kranti: 5,400+ Native Trees Planted</span>
              </Link>

              <span className="text-slate-300 select-none">•</span>

              <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>18-Yr Registered Society (Reg. 142/2006-07)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header / Navigation Bar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-prayas-rule shadow-xs">
        <div className="max-w-7xl 2xl:max-w-[1440px] 3xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
            {/* Brand Logo: Prayas Pariwaar */}
            <Link href="/" className="flex items-center gap-2 group shrink-0 py-1" onClick={() => setMobileMenuOpen(false)}>
              <Image
                src={assetPath("/images/prayas-logo.png")}
                alt="Prayas Pariwaar - A Trial to Move Ahead"
                width={160}
                height={50}
                priority
                className="h-9 sm:h-11 2xl:h-14 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 2xl:gap-3 text-xs xl:text-[13px] 2xl:text-sm font-semibold text-slate-800">
              {/* Home */}
              <Link
                href="/"
                className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                  pathname === "/"
                    ? "bg-prayas-stone text-slate-950 font-bold"
                    : "hover:bg-prayas-stone text-slate-700 hover:text-slate-950"
                }`}
              >
                Home
              </Link>

              {/* PRIMARY PILLAR: Aashayein Education Direct Tab */}
              <Link
                href="/projects/aashayein-education"
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  pathname.includes("aashayein") || pathname.includes("education")
                    ? "bg-emerald-50 text-emerald-900 font-bold"
                    : "text-emerald-800 font-bold hover:bg-emerald-50"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
                <span>Project Aashayein</span>
              </Link>

              {/* Programs & Services Dropdown */}
              <div
                className="relative group"
                onMouseEnter={() => setWorkDropdownOpen(true)}
                onMouseLeave={() => setWorkDropdownOpen(false)}
              >
                <button
                  onClick={() => setWorkDropdownOpen(!workDropdownOpen)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    (isActive("/projects") && !pathname.includes("aashayein")) ||
                    isActive("/blood-donation") ||
                    isActive("/medical-equipment")
                      ? "bg-prayas-stone text-slate-900 font-bold"
                      : "hover:bg-prayas-stone text-slate-700 hover:text-slate-900"
                  }`}
                >
                  <span>Programs & Services</span>
                  <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${workDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {workDropdownOpen && (
                  <div className="absolute top-full left-0 pt-1.5 z-50 animate-dropdown">
                    <div className="w-72 bg-white border border-prayas-rule rounded-xl shadow-xl py-1.5 overflow-hidden">
                      <Link
                        href="/projects"
                        className="flex items-start gap-2.5 px-4 py-2 text-xs hover:bg-prayas-stone text-slate-800 transition-colors"
                      >
                        <BookOpen className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">All 4 Program Pillars</strong>
                          <span className="text-[11px] text-slate-500">Education, Plantation, Health, Awareness</span>
                        </div>
                      </Link>
                      <Link
                        href="/blood-donation"
                        className="flex items-start gap-2.5 px-4 py-2 text-xs hover:bg-rose-50 text-slate-800 border-t border-prayas-rule transition-colors"
                      >
                        <Droplet className="w-4 h-4 fill-current text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold text-rose-900">24/7 Blood Registry</strong>
                          <span className="text-[11px] text-slate-500">Voluntary donor network & emergency support</span>
                        </div>
                      </Link>
                      <Link
                        href="/medical-equipment"
                        className="flex items-start gap-2.5 px-4 py-2 text-xs hover:bg-prayas-stone text-slate-800 border-t border-prayas-rule transition-colors"
                      >
                        <Stethoscope className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">Medical Equipment Bank</strong>
                          <span className="text-[11px] text-slate-500">Free oxygen & hospital bed loans</span>
                        </div>
                      </Link>
                      <Link
                        href="/projects/vrindavan-harit-kranti"
                        className="flex items-start gap-2.5 px-4 py-2 text-xs hover:bg-prayas-stone text-slate-800 border-t border-prayas-rule transition-colors"
                      >
                        <Trees className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">Vrindavan Harit Kranti</strong>
                          <span className="text-[11px] text-slate-500">Native Neem & Peepal tree drives</span>
                        </div>
                      </Link>
                      <Link
                        href="/projects/jan-swasthya-raksha"
                        className="flex items-start gap-2.5 px-4 py-2 text-xs hover:bg-prayas-stone text-slate-800 border-t border-prayas-rule transition-colors"
                      >
                        <Stethoscope className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">Jan Swasthya Camps</strong>
                          <span className="text-[11px] text-slate-500">Free eye checkups & health camps</span>
                        </div>
                      </Link>
                      <Link
                        href="/gallery"
                        className="flex items-start gap-2.5 px-4 py-2 text-xs hover:bg-prayas-stone text-slate-800 border-t border-prayas-rule font-semibold text-emerald-800 transition-colors"
                      >
                        <Images className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <span>Field Photo Gallery</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* About Us Dropdown */}
              <div
                className="relative group"
                onMouseEnter={() => setAboutDropdownOpen(true)}
                onMouseLeave={() => setAboutDropdownOpen(false)}
              >
                <button
                  onClick={() => setAboutDropdownOpen(!aboutDropdownOpen)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    isActive("/about")
                      ? "bg-prayas-stone text-slate-900 font-bold"
                      : "hover:bg-prayas-stone text-slate-700 hover:text-slate-900"
                  }`}
                >
                  <span>About</span>
                  <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${aboutDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {aboutDropdownOpen && (
                  <div className="absolute top-full left-0 pt-1.5 z-50 animate-dropdown">
                    <div className="w-60 bg-white border border-prayas-rule rounded-xl shadow-xl py-1.5 overflow-hidden">
                      <Link
                        href="/about"
                        className="flex items-start gap-2.5 px-4 py-2 text-xs hover:bg-prayas-stone text-slate-800 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">18-Year Legacy & Team</strong>
                          <span className="text-[11px] text-slate-500">History & governance</span>
                        </div>
                      </Link>
                      <Link
                        href="/about/awards"
                        className="flex items-start gap-2.5 px-4 py-2 text-xs hover:bg-prayas-stone text-slate-800 border-t border-prayas-rule transition-colors"
                      >
                        <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">Awards & Empanelment</strong>
                          <span className="text-[11px] text-slate-500">State commendations</span>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Get Involved Dropdown */}
              <div
                className="relative group"
                onMouseEnter={() => setInvolvedDropdownOpen(true)}
                onMouseLeave={() => setInvolvedDropdownOpen(false)}
              >
                <button
                  onClick={() => setInvolvedDropdownOpen(!involvedDropdownOpen)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    isActive("/volunteer") || isActive("/partner")
                      ? "bg-prayas-stone text-slate-900 font-bold"
                      : "hover:bg-prayas-stone text-slate-700 hover:text-slate-900"
                  }`}
                >
                  <span>Get Involved</span>
                  <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${involvedDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {involvedDropdownOpen && (
                  <div className="absolute top-full left-0 pt-1.5 z-50 animate-dropdown">
                    <div className="w-64 bg-white border border-prayas-rule rounded-xl shadow-xl py-1.5 overflow-hidden">
                      <Link
                        href="/volunteer"
                        className="flex items-start gap-2.5 px-4 py-2 text-xs hover:bg-prayas-stone text-slate-800 transition-colors"
                      >
                        <Users className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">Volunteer With Us</strong>
                          <span className="text-[11px] text-slate-500">Join our 5 Seva Streams</span>
                        </div>
                      </Link>
                      <Link
                        href="/partner/individual"
                        className="flex items-start gap-2.5 px-4 py-2 text-xs hover:bg-prayas-stone text-slate-800 border-t border-prayas-rule transition-colors"
                      >
                        <Heart className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">Individual Student Patronage</strong>
                          <span className="text-[11px] text-slate-500">Sponsor children or classrooms</span>
                        </div>
                      </Link>
                      <Link
                        href="/partner/corporate"
                        className="flex items-start gap-2.5 px-4 py-2 text-xs hover:bg-prayas-stone text-slate-800 border-t border-prayas-rule transition-colors"
                      >
                        <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">Corporate & CSR Alliances</strong>
                          <span className="text-[11px] text-slate-500">Institutional partnerships</span>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Photo Gallery */}
              <Link
                href="/gallery"
                className={`px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  isActive("/gallery")
                    ? "bg-prayas-stone text-slate-900 font-bold"
                    : "hover:bg-prayas-stone text-slate-700 hover:text-slate-900"
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-emerald-700" />
                <span>Gallery</span>
              </Link>

              {/* Media */}
              <Link
                href="/media"
                className={`px-2 py-1.5 rounded-lg transition-colors ${
                  isActive("/media")
                    ? "bg-prayas-stone text-slate-900 font-bold"
                    : "hover:bg-prayas-stone text-slate-700 hover:text-slate-900"
                }`}
              >
                Media
              </Link>

              {/* Events */}
              <Link
                href="/blog"
                className={`px-2 py-1.5 rounded-lg transition-colors ${
                  isActive("/blog")
                    ? "bg-prayas-stone text-slate-900 font-bold"
                    : "hover:bg-prayas-stone text-slate-700 hover:text-slate-900"
                }`}
              >
                Events
              </Link>

              {/* Contact */}
              <Link
                href="/contact"
                className={`px-2 py-1.5 rounded-lg transition-colors ${
                  isActive("/contact")
                    ? "bg-prayas-stone text-slate-900 font-bold"
                    : "hover:bg-prayas-stone text-slate-700 hover:text-slate-900"
                }`}
              >
                Contact
              </Link>
            </nav>

            {/* Direct Action Buttons: Sponsor a Child / Donate */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/donate?project=aashayein-education"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#1E5338] hover:bg-[#16432B] text-white transition-all shadow-sm whitespace-nowrap"
              >
                <GraduationCap className="w-3.5 h-3.5 text-white" />
                <span>Sponsor a Student</span>
              </Link>

              {/* Hamburger Button for Mobile */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="lg:hidden p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5 text-slate-900" />}
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================= */}
        {/* MOBILE NAVIGATION DRAWER (Full-Height Scrollable & Touch-Ready) */}
        {/* ============================================================= */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 w-full max-h-[calc(100vh-4.5rem)] overflow-y-auto overscroll-contain bg-white border-b border-prayas-rule shadow-2xl z-50 flex flex-col justify-between animate-in slide-in-from-top-2 duration-200">
            <div className="p-4 sm:p-6 space-y-5">
              {/* Top Featured Action Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
                    <GraduationCap className="w-4 h-4 text-emerald-700" />
                    <span>Project Aashayein</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                    ₹500/Month
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sponsor a rural child&apos;s education in Vrindavan for ₹500/month (covers books, fees & nutrition).
                </p>
                <Link
                  href="/donate?project=aashayein-education"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 bg-[#1E5338] hover:bg-[#16432B] text-white text-xs font-bold rounded-xl shadow-xs block transition-colors"
                >
                  Sponsor a Student Now →
                </Link>
              </div>

              {/* High Priority Emergency / Healthcare Cards on Mobile */}
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href="/blood-donation"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-xl bg-rose-50/80 border border-rose-200 text-left space-y-1 block hover:bg-rose-50 transition-colors"
                >
                  <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs">
                    <Droplet className="w-4 h-4 fill-current text-rose-600" />
                    <span>Blood Desk</span>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-tight">24/7 Match & Request</p>
                </Link>

                <Link
                  href="/medical-equipment"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-left space-y-1 block hover:bg-emerald-50 transition-colors"
                >
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                    <Stethoscope className="w-4 h-4 text-emerald-700" />
                    <span>Equipment Bank</span>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-tight">Oxygen & Bed Loans</p>
                </Link>
              </div>

              {/* Main Navigation Stack */}
              <div className="space-y-1 text-sm font-medium text-slate-800 pt-1">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors ${
                    pathname === "/" ? "bg-slate-100 font-bold text-slate-900" : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span>Home</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                {/* Mobile: Project Aashayein (Direct Tab) */}
                <Link
                  href="/projects/aashayein-education"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-emerald-200/80 bg-emerald-50/60 hover:bg-emerald-50 text-xs font-bold text-emerald-900 transition-colors ${
                    pathname.includes("aashayein") || pathname.includes("education") ? "bg-emerald-100/80" : ""
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-emerald-700" />
                    <span>Project Aashayein</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-emerald-700" />
                </Link>

                {/* Mobile Accordion: Programs & Services */}
                <div className="border border-slate-200/80 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setMobileProgramsOpen(!mobileProgramsOpen)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs font-bold text-slate-800 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-700" />
                      <span>Programs & Services</span>
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${mobileProgramsOpen ? "rotate-180" : ""}`} />
                  </button>

                  {mobileProgramsOpen && (
                    <div className="p-2 space-y-1 bg-white border-t border-slate-100 text-xs animate-accordion">
                      <Link
                        href="/projects"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg hover:bg-slate-50 font-bold text-slate-900"
                      >
                        All 4 Program Pillars
                      </Link>
                      <Link
                        href="/blood-donation"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-800 font-semibold"
                      >
                        🩸 24/7 Blood Registry
                      </Link>
                      <Link
                        href="/medical-equipment"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700"
                      >
                        Medical Equipment Bank
                      </Link>
                      <Link
                        href="/projects/vrindavan-harit-kranti"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700"
                      >
                        Vrindavan Harit Kranti (Tree Plantation)
                      </Link>
                      <Link
                        href="/projects/jan-swasthya-raksha"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700"
                      >
                        Jan Swasthya Camps (Eye & Health)
                      </Link>
                      <Link
                        href="/gallery"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg hover:bg-emerald-50 text-emerald-800 font-semibold"
                      >
                        📷 Field Photo Gallery
                      </Link>
                    </div>
                  )}
                </div>

                {/* Mobile Accordion: Get Involved */}
                <div className="border border-slate-200/80 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setMobileInvolvedOpen(!mobileInvolvedOpen)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs font-bold text-slate-800 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-600" />
                      <span>Get Involved & Volunteer</span>
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${mobileInvolvedOpen ? "rotate-180" : ""}`} />
                  </button>

                  {mobileInvolvedOpen && (
                    <div className="p-2 space-y-1 bg-white border-t border-slate-100 text-xs animate-accordion">
                      <Link
                        href="/volunteer"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg hover:bg-slate-50 font-bold text-slate-900"
                      >
                        Volunteer Application (5 Seva Streams)
                      </Link>
                      <Link
                        href="/partner/individual"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700"
                      >
                        Individual Student Patronage
                      </Link>
                      <Link
                        href="/partner/corporate"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700"
                      >
                        Corporate & CSR Partnerships
                      </Link>
                    </div>
                  )}
                </div>

                {/* Mobile Accordion: About Us */}
                <div className="border border-slate-200/80 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs font-bold text-slate-800 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>About Us (18-Year Legacy)</span>
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${mobileAboutOpen ? "rotate-180" : ""}`} />
                  </button>

                  {mobileAboutOpen && (
                    <div className="p-2 space-y-1 bg-white border-t border-slate-100 text-xs animate-accordion">
                      <Link
                        href="/about"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700"
                      >
                        18-Year Legacy & Governance
                      </Link>
                      <Link
                        href="/about/awards"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700"
                      >
                        Awards & Empanelment
                      </Link>
                    </div>
                  )}
                </div>

                {/* Standalone Links */}
                <Link
                  href="/gallery"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-emerald-50/70 text-slate-700 text-xs font-bold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-700" />
                    <span>Field Seva Photo Gallery</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/media"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-bold"
                >
                  <span className="flex items-center gap-2">
                    <Newspaper className="w-4 h-4 text-slate-500" />
                    <span>Media & Press Reports</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-bold"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span>Scheduled & Upcoming Events</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-bold"
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-slate-500" />
                    <span>Contact Seva Karyalaya Office</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            </div>

            {/* Bottom Sticky Action Bar in Mobile Drawer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3 shrink-0">
              <a
                href="tel:+919927081650"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-rose-200 text-xs shadow-2xs"
              >
                <span className="flex items-center gap-2 font-bold text-rose-800">
                  <Droplet className="w-4 h-4 fill-current text-rose-600" />
                  <span>24/7 Emergency Blood Helpline</span>
                </span>
                <span className="font-mono font-bold text-rose-700">+91 99270 81650</span>
              </a>

              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span>Prayas Pariwaar (Reg. 142/2006-07)</span>
                <span className="text-emerald-700 font-semibold">18+ Years of Seva</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
