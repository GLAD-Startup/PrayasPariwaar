"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [educationDropdownOpen, setEducationDropdownOpen] = useState(false);
  const [workDropdownOpen, setWorkDropdownOpen] = useState(false);
  const [healthDropdownOpen, setHealthDropdownOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [involvedDropdownOpen, setInvolvedDropdownOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
    setEducationDropdownOpen(false);
    setWorkDropdownOpen(false);
    setHealthDropdownOpen(false);
    setAboutDropdownOpen(false);
    setInvolvedDropdownOpen(false);
  }, [pathname]);

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* Top Ledger Strip: Education Mission & Blood Desk */}
      <div className="bg-prayas-stone border-b border-prayas-rule text-xs 2xl:text-sm text-prayas-muted py-2 px-3 sm:px-6 lg:px-8 2xl:px-12 select-none w-full">
        <div className="max-w-7xl 2xl:max-w-[1440px] 3xl:max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2">
          {/* Left: Primary Education Mission */}
          <div className="flex items-center gap-2 text-center sm:text-left justify-center sm:justify-start">
            <span className="inline-block w-2 h-2 rounded-full bg-prayas-neem animate-pulse shrink-0" aria-hidden="true" />
            <Link href="/projects/aashayein-education" className="font-semibold text-prayas-ink hover:text-prayas-neem transition-colors flex items-center gap-1.5 text-[11px] sm:text-xs 2xl:text-sm">
              <GraduationCap className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-prayas-neem shrink-0" />
              <span>Project Aashayein: Sponsor a Rural Student for ₹500/mo</span>
            </Link>
          </div>

          {/* Right: Tax Exemption & Secondary Emergency Blood Helpline */}
          <div className="flex items-center gap-3 text-[11px] sm:text-xs 2xl:text-sm justify-center sm:justify-end flex-wrap">
            <span className="text-prayas-neem font-semibold hidden sm:inline">
              ✓ 80G Tax-Exempt Certified
            </span>
            <span className="text-prayas-rule hidden sm:inline">|</span>
            <a
              href="tel:+919412279000"
              className="flex items-center gap-1 font-medium text-prayas-crimson hover:underline"
            >
              <Droplet className="w-3 h-3 2xl:w-3.5 2xl:h-3.5 fill-current shrink-0" />
              <span>24/7 Blood Desk: +91 94122 79000</span>
            </a>
            <span className="text-prayas-rule">|</span>
            <Link
              href="/admin/login"
              className="text-prayas-muted hover:text-prayas-ink underline font-medium"
            >
              Staff Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header / Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/98 backdrop-blur-md border-b border-prayas-rule shadow-sm">
        <div className="max-w-7xl 2xl:max-w-[1440px] 3xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
            {/* Brand Logo: Prayas Pariwaar */}
            <Link href="/" className="flex items-center gap-2 group shrink-0 py-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/prayas-logo.png"
                alt="Prayas Pariwaar - A Trial to Move Ahead"
                className="h-9 sm:h-11 2xl:h-14 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 2xl:gap-3 text-xs xl:text-[13px] 2xl:text-sm font-semibold text-slate-800">
              {/* Home */}
              <Link
                href="/"
                className={`px-2.5 py-1.5 rounded transition-colors ${
                  pathname === "/"
                    ? "bg-prayas-stone text-slate-950 font-bold"
                    : "hover:bg-prayas-stone text-slate-700 hover:text-slate-950"
                }`}
              >
                Home
              </Link>

              {/* PRIMARY PILLAR: Aashayein Education Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setEducationDropdownOpen(true)}
                onMouseLeave={() => setEducationDropdownOpen(false)}
              >
                <button
                  onClick={() => setEducationDropdownOpen(!educationDropdownOpen)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded transition-colors ${
                    pathname.includes("aashayein") || pathname.includes("education")
                      ? "bg-prayas-stone text-prayas-neem font-bold"
                      : "text-prayas-neem font-bold hover:bg-green-50"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5 text-prayas-neem" />
                  <span>Project Aashayein</span>
                  <ChevronDown className="w-3 h-3 text-prayas-neem" />
                </button>

                {educationDropdownOpen && (
                  <div className="absolute top-full left-0 w-72 bg-white border border-prayas-rule rounded-lg shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <Link
                      href="/projects/aashayein-education"
                      className="flex items-start gap-2.5 px-4 py-2.5 text-xs hover:bg-prayas-stone text-prayas-ink"
                    >
                      <BookOpen className="w-4 h-4 text-prayas-neem shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold">Child Education Overview</strong>
                        <span className="text-[11px] text-prayas-muted">Evening centers, school kits & teachers</span>
                      </div>
                    </Link>
                    <Link
                      href="/donate?project=aashayein-education"
                      className="flex items-start gap-2.5 px-4 py-2.5 text-xs bg-green-50/50 hover:bg-green-50 text-prayas-ink border-t border-prayas-rule"
                    >
                      <Heart className="w-4 h-4 text-prayas-neem shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold text-prayas-neem">Sponsor a Student (80G)</strong>
                        <span className="text-[11px] text-prayas-muted">₹500/mo covers books, fees & meals</span>
                      </div>
                    </Link>
                    <Link
                      href="/projects/aadhar-career-counseling"
                      className="flex items-start gap-2.5 px-4 py-2.5 text-xs hover:bg-prayas-stone text-prayas-ink border-t border-prayas-rule"
                    >
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold">Project Aadhar</strong>
                        <span className="text-[11px] text-prayas-muted">Youth career & digital skills</span>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {/* All Community Programs Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setWorkDropdownOpen(true)}
                onMouseLeave={() => setWorkDropdownOpen(false)}
              >
                <button
                  onClick={() => setWorkDropdownOpen(!workDropdownOpen)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded transition-colors ${
                    isActive("/projects") && !pathname.includes("aashayein")
                      ? "bg-prayas-stone text-prayas-ink font-bold"
                      : "hover:bg-prayas-stone text-prayas-muted hover:text-prayas-ink"
                  }`}
                >
                  <span>Programs</span>
                  <ChevronDown className="w-3 h-3 text-prayas-muted" />
                </button>

                {workDropdownOpen && (
                  <div className="absolute top-full left-0 w-64 bg-white border border-prayas-rule rounded-lg shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <Link
                      href="/projects"
                      className="flex items-start gap-2.5 px-4 py-2 text-xs hover:bg-prayas-stone text-prayas-ink"
                    >
                      <BookOpen className="w-4 h-4 text-prayas-neem shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold">All 4 Program Pillars</strong>
                        <span className="text-[11px] text-prayas-muted">Education, Plantation, Health, Awareness</span>
                      </div>
                    </Link>
                    <Link
                      href="/projects/vrindavan-harit-kranti"
                      className="flex items-start gap-2.5 px-4 py-2 text-xs hover:bg-prayas-stone text-prayas-ink border-t border-prayas-rule"
                    >
                      <Trees className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold">Vrindavan Harit Kranti</strong>
                        <span className="text-[11px] text-prayas-muted">Native Neem & Peepal tree drives</span>
                      </div>
                    </Link>
                    <Link
                      href="/projects/jan-swasthya-raksha"
                      className="flex items-start gap-2.5 px-4 py-2 text-xs hover:bg-prayas-stone text-prayas-ink"
                    >
                      <Stethoscope className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold">Jan Swasthya Camps</strong>
                        <span className="text-[11px] text-prayas-muted">Free eye checkups & health camps</span>
                      </div>
                    </Link>
                    <Link
                      href="/gallery"
                      className="flex items-start gap-2.5 px-4 py-2 text-xs hover:bg-prayas-stone text-prayas-ink border-t border-prayas-rule font-semibold text-prayas-neem"
                    >
                      <Images className="w-4 h-4 text-prayas-neem shrink-0 mt-0.5" />
                      <span>Field Photo Gallery</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* SECONDARY PILLARS: Health & Blood Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setHealthDropdownOpen(true)}
                onMouseLeave={() => setHealthDropdownOpen(false)}
              >
                <button
                  onClick={() => setHealthDropdownOpen(!healthDropdownOpen)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded transition-colors ${
                    isActive("/blood-donation") || isActive("/medical-equipment")
                      ? "bg-red-50 text-prayas-crimson font-bold border border-red-200"
                      : "hover:bg-prayas-stone text-prayas-muted hover:text-prayas-ink"
                  }`}
                >
                  <Droplet className="w-3.5 h-3.5 text-prayas-crimson fill-current" />
                  <span>Blood & Medical</span>
                  <ChevronDown className="w-3 h-3 text-prayas-muted" />
                </button>

                {healthDropdownOpen && (
                  <div className="absolute top-full left-0 w-64 bg-white border border-prayas-rule rounded-lg shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <Link
                      href="/blood-donation"
                      className="flex items-start gap-2.5 px-4 py-2.5 text-xs hover:bg-red-50 text-prayas-crimson"
                    >
                      <Droplet className="w-4 h-4 fill-current text-prayas-crimson shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold">24/7 Blood Registry</strong>
                        <span className="text-[11px] text-prayas-muted">Hospital blood requirement board</span>
                      </div>
                    </Link>
                    <Link
                      href="/medical-equipment"
                      className="flex items-start gap-2.5 px-4 py-2.5 text-xs hover:bg-prayas-stone text-prayas-ink border-t border-prayas-rule"
                    >
                      <Stethoscope className="w-4 h-4 text-prayas-neem shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold">Medical Equipment Bank</strong>
                        <span className="text-[11px] text-prayas-muted">Free oxygen & bed loans</span>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {/* About Us Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setAboutDropdownOpen(true)}
                onMouseLeave={() => setAboutDropdownOpen(false)}
              >
                <button
                  onClick={() => setAboutDropdownOpen(!aboutDropdownOpen)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded transition-colors ${
                    isActive("/about")
                      ? "bg-prayas-stone text-prayas-ink font-bold"
                      : "hover:bg-prayas-stone text-prayas-muted hover:text-prayas-ink"
                  }`}
                >
                  <span>About</span>
                  <ChevronDown className="w-3 h-3 text-prayas-muted" />
                </button>

                {aboutDropdownOpen && (
                  <div className="absolute top-full left-0 w-60 bg-white border border-prayas-rule rounded-lg shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <Link
                      href="/about"
                      className="flex items-start gap-2.5 px-4 py-2 text-xs hover:bg-prayas-stone text-prayas-ink"
                    >
                      <ShieldCheck className="w-4 h-4 text-prayas-neem shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold">18-Year Legacy & Team</strong>
                        <span className="text-[11px] text-prayas-muted">History & governance</span>
                      </div>
                    </Link>
                    <Link
                      href="/about/awards"
                      className="flex items-start gap-2.5 px-4 py-2 text-xs hover:bg-prayas-stone text-prayas-ink border-t border-prayas-rule"
                    >
                      <Award className="w-4 h-4 text-prayas-marigold shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold">Awards & Empanelment</strong>
                        <span className="text-[11px] text-prayas-muted">State commendations</span>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {/* Get Involved Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setInvolvedDropdownOpen(true)}
                onMouseLeave={() => setInvolvedDropdownOpen(false)}
              >
                <button
                  onClick={() => setInvolvedDropdownOpen(!involvedDropdownOpen)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded transition-colors ${
                    isActive("/volunteer") || isActive("/partner")
                      ? "bg-prayas-stone text-prayas-ink font-bold"
                      : "hover:bg-prayas-stone text-prayas-muted hover:text-prayas-ink"
                  }`}
                >
                  <span>Get Involved</span>
                  <ChevronDown className="w-3 h-3 text-prayas-muted" />
                </button>

                {involvedDropdownOpen && (
                  <div className="absolute top-full left-0 w-64 bg-white border border-prayas-rule rounded-lg shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <Link
                      href="/volunteer"
                      className="flex items-start gap-2.5 px-4 py-2 text-xs hover:bg-prayas-stone text-prayas-ink"
                    >
                      <Users className="w-4 h-4 text-prayas-neem shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold">Volunteer With Us</strong>
                        <span className="text-[11px] text-prayas-muted">Join our 5 Seva Streams</span>
                      </div>
                    </Link>
                    <Link
                      href="/partner/individual"
                      className="flex items-start gap-2.5 px-4 py-2 text-xs hover:bg-prayas-stone text-prayas-ink border-t border-prayas-rule"
                    >
                      <Heart className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold">Individual Student Patronage</strong>
                        <span className="text-[11px] text-prayas-muted">Sponsor children or classrooms</span>
                      </div>
                    </Link>
                    <Link
                      href="/partner/corporate"
                      className="flex items-start gap-2.5 px-4 py-2 text-xs hover:bg-prayas-stone text-prayas-ink border-t border-prayas-rule"
                    >
                      <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold">Corporate & CSR Alliances</strong>
                        <span className="text-[11px] text-prayas-muted">Institutional partnerships</span>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {/* Media */}
              <Link
                href="/media"
                className={`px-2 py-1.5 rounded transition-colors ${
                  isActive("/media")
                    ? "bg-prayas-stone text-prayas-ink font-bold"
                    : "hover:bg-prayas-stone text-prayas-muted hover:text-prayas-ink"
                }`}
              >
                Media
              </Link>

              {/* Dispatches */}
              <Link
                href="/blog"
                className={`px-2 py-1.5 rounded transition-colors ${
                  isActive("/blog")
                    ? "bg-prayas-stone text-prayas-ink font-bold"
                    : "hover:bg-prayas-stone text-prayas-muted hover:text-prayas-ink"
                }`}
              >
                Dispatches
              </Link>

              {/* Contact */}
              <Link
                href="/contact"
                className={`px-2 py-1.5 rounded transition-colors ${
                  isActive("/contact")
                    ? "bg-prayas-stone text-prayas-ink font-bold"
                    : "hover:bg-prayas-stone text-prayas-muted hover:text-prayas-ink"
                }`}
              >
                Contact
              </Link>
            </nav>

            {/* Direct Action Button: Sponsor a Child / Donate (80G) */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/donate?project=aashayein-education"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold rounded-lg bg-[#2E5339] text-white hover:bg-[#23432b] transition-all shadow-md whitespace-nowrap"
                style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
              >
                <GraduationCap className="w-3.5 h-3.5 text-white" />
                <span className="font-bold text-white">Sponsor a Student (80G)</span>
              </Link>

              {/* Hamburger Button for Mobile */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg border border-prayas-rule bg-white text-slate-800 hover:bg-prayas-stone transition-colors shadow-sm"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-prayas-rule bg-white px-4 py-6 space-y-6 shadow-xl animate-in slide-in-from-top-2 duration-200">
            {/* Primary Education Action Card on Mobile */}
            <div className="p-4 rounded-lg bg-green-50 border border-green-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <GraduationCap className="w-4 h-4 text-emerald-700" />
                <span>Project Aashayein (Child Education)</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Sponsor a rural student in Vrindavan for ₹500/month (100% tax-exempt under Section 80G).
              </p>
              <Link
                href="/donate?project=aashayein-education"
                className="block text-center py-2.5 bg-[#2E5339] text-white text-xs font-bold rounded-lg shadow-sm"
                style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
              >
                Sponsor a Student Now →
              </Link>
            </div>

            {/* Nav Links Stack */}
            <div className="space-y-1 text-sm font-medium text-prayas-ink divide-y divide-prayas-rule/60">
              <div className="pb-2 space-y-1">
                <Link href="/" className="block px-3 py-2 rounded hover:bg-prayas-stone font-bold">Home</Link>
                <Link href="/projects/aashayein-education" className="block px-3 py-2 rounded hover:bg-prayas-stone text-prayas-neem font-bold">
                  🎓 Project Aashayein (Child Education)
                </Link>
                <Link href="/projects" className="block px-3 py-2 rounded hover:bg-prayas-stone">Our Programs (All Pillars)</Link>
              </div>

              <div className="py-2 space-y-1">
                <span className="px-3 text-[11px] font-bold text-prayas-muted uppercase tracking-wider block">Community Support & Emergency</span>
                <Link href="/blood-donation" className="block px-3 py-1.5 rounded hover:bg-red-50 text-prayas-crimson font-semibold">
                  🩸 24/7 Emergency Blood Registry
                </Link>
                <Link href="/medical-equipment" className="block px-3 py-1.5 rounded hover:bg-prayas-stone">
                  🩺 Medical Equipment Bank (Free Loan)
                </Link>
              </div>

              <div className="py-2 space-y-1">
                <span className="px-3 text-[11px] font-bold text-prayas-muted uppercase tracking-wider block">Get Involved</span>
                <Link href="/volunteer" className="block px-3 py-1.5 rounded hover:bg-prayas-stone">Volunteer With Us (5 Seva Streams)</Link>
                <Link href="/partner/individual" className="block px-3 py-1.5 rounded hover:bg-prayas-stone text-xs text-prayas-muted pl-6">↳ Individual Student Patronage</Link>
                <Link href="/partner/corporate" className="block px-3 py-1.5 rounded hover:bg-prayas-stone text-xs text-prayas-muted pl-6">↳ Corporate CSR Alliances</Link>
              </div>

              <div className="pt-2 space-y-1">
                <Link href="/about" className="block px-3 py-1.5 rounded hover:bg-prayas-stone">About Us (18-Year Legacy)</Link>
                <Link href="/about/awards" className="block px-3 py-1.5 rounded hover:bg-prayas-stone text-xs text-prayas-muted pl-6">↳ Awards & Empanelment</Link>
                <Link href="/media" className="block px-3 py-1.5 rounded hover:bg-prayas-stone">Media & Press Reports</Link>
                <Link href="/gallery" className="block px-3 py-1.5 rounded hover:bg-prayas-stone font-semibold text-emerald-800">📷 Field Photo Gallery</Link>
                <Link href="/blog" className="block px-3 py-1.5 rounded hover:bg-prayas-stone">Field Dispatches & Events</Link>
                <Link href="/contact" className="block px-3 py-1.5 rounded hover:bg-prayas-stone">Contact Seva Karyalaya</Link>
              </div>
            </div>

            {/* Quick Emergency Phone in Mobile Drawer */}
            <div className="p-3 rounded border border-prayas-rule bg-prayas-stone flex items-center justify-between text-xs text-prayas-muted">
              <span>Emergency Blood Desk:</span>
              <a href="tel:+919412279000" className="font-mono font-bold text-prayas-crimson">
                +91 94122 79000
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
