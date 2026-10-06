"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Droplet,
  Stethoscope,
  Heart,
  CreditCard,
  FileText,
  Users,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Search,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ChevronRight,
  ArrowRight,
  Clock,
  Eye,
  Trash2,
  ExternalLink,
  Scale,
  Sparkles,
  Share2,
  BookOpen,
  Briefcase,
  HelpCircle,
} from "lucide-react";

interface SectionItem {
  id: string;
  number: string;
  title: string;
  shortTitle: string;
  icon: React.ElementType;
}

const SECTIONS: SectionItem[] = [
  { id: "institutional-identity", number: "01", title: "Institutional Identity & Society Registration", shortTitle: "Sanstha Identity", icon: Building },
  { id: "scope-applicability", number: "02", title: "Scope, Philosophy & Governing Laws", shortTitle: "Scope & Law", icon: Scale },
  { id: "data-collection-ledger", number: "03", title: "Comprehensive Data Collection Ledger (By Program)", shortTitle: "Data Collected", icon: FileText },
  { id: "how-we-use-data", number: "04", title: "How We Use Your Data (Purposes of Processing)", shortTitle: "How We Use It", icon: CheckCircle2 },
  { id: "zero-commercialization", number: "05", title: "Zero Commercialization & Data Sharing Restrictions", shortTitle: "No-Sale Pledge", icon: ShieldCheck },
  { id: "financial-security", number: "06", title: "Donation Processing, Section 80G & Payment Security", shortTitle: "Payment & 80G", icon: CreditCard },
  { id: "child-vulnerable-protection", number: "07", title: "Child Protection & Vulnerable Beneficiary Privacy", shortTitle: "Child Protection", icon: Heart },
  { id: "data-security-storage", number: "08", title: "Technical Safeguards, Storage & Encryption", shortTitle: "Data Security", icon: Lock },
  { id: "retention-disposal", number: "09", title: "Data Retention Schedules & Disposal Policy", shortTitle: "Retention & Disposal", icon: Clock },
  { id: "statutory-rights", number: "10", title: "Your Statutory Rights (DPDP Act 2023 & IT Act)", shortTitle: "Your Rights", icon: Eye },
  { id: "grievance-contact", number: "11", title: "Grievance Redressal & Institutional Contact Desks", shortTitle: "Grievance Officer", icon: Phone },
];

export default function PrivacyPolicyClient() {
  const [activeSection, setActiveSection] = useState<string>("institutional-identity");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProgramTab, setSelectedProgramTab] = useState<
    "blood" | "equipment" | "donations" | "volunteers" | "partners" | "account"
  >("blood");
  const [copiedLink, setCopiedLink] = useState(false);

  // Dynamic Scroll Spy using IntersectionObserver
  useEffect(() => {
    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: "-15% 0px -70% 0px",
      threshold: 0,
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    SECTIONS.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      if (typeof window !== "undefined" && (window as any).lenis) {
        (window as any).lenis.scrollTo(element, { offset: -90, duration: 1.0 });
      } else {
        const yOffset = -90;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="space-y-8 sm:space-y-12 pb-24 max-w-7xl 2xl:max-w-[1440px] 3xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 pt-6 sm:pt-10">
      
      {/* =========================================================================
          HERO MASTHEAD (Vrindavan Sandstone & Slate Heritage Aesthetic)
          ========================================================================= */}
      <header className="border-b border-prayas-rule pb-8 sm:pb-12 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-prayas-stone border border-prayas-rule text-xs 2xl:text-sm font-semibold text-prayas-ink tracking-wide">
            <ShieldCheck className="w-4 h-4 text-prayas-neem shrink-0" />
            <span>Official Institutional Charter • Public Legal Notice</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-prayas-muted font-mono">
            <span className="hidden sm:inline">Effective: October 2024</span>
            <span className="hidden sm:inline text-prayas-rule">•</span>
            <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-sans font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              DPDP Act 2023 Compliant
            </span>
          </div>
        </div>

        <div className="space-y-4 max-w-4xl">
          <h1 className="font-serif text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-bold text-prayas-ink leading-[1.15] tracking-tight">
            Institutional Privacy Policy & Data Governance Charter
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-prayas-muted leading-relaxed">
            Prayas Pariwaar (Prayas Sanstha) has stood as a guardian of grassroots community trust in Vrindavan and Mathura district for over 18 years. This charter explains how we handle, safeguard, and honor the personal information entrusted to us during life-saving blood mobilization, free medical equipment lending, child education, and charitable contributions.
          </p>
        </div>

        {/* Legal Registry Credentials Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
          <div className="bg-white border border-prayas-rule rounded-lg p-3.5 shadow-subtle space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-prayas-muted block">Society Registration</span>
            <p className="text-xs font-bold text-prayas-ink">No. 142/2006-07 (Mathura, UP)</p>
            <p className="text-[11px] text-prayas-muted">Societies Registration Act XXI of 1860</p>
          </div>
          <div className="bg-white border border-prayas-rule rounded-lg p-3.5 shadow-subtle space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-prayas-muted block">Income Tax Department</span>
            <p className="text-xs font-bold text-prayas-ink">12A Non-Profit Certified</p>
            <p className="text-[11px] text-prayas-muted">Sec. 80G Tax Exemption Eligible</p>
          </div>
          <div className="bg-white border border-prayas-rule rounded-lg p-3.5 shadow-subtle space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-prayas-muted block">NITI Aayog NGO Darpan</span>
            <p className="text-xs font-bold text-prayas-ink">UP/2017/0154210</p>
            <p className="text-[11px] text-prayas-muted">Verified Grassroots Non-Profit</p>
          </div>
          <div className="bg-white border border-prayas-rule rounded-lg p-3.5 shadow-subtle space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-prayas-muted block">Registered Office</span>
            <p className="text-xs font-bold text-prayas-ink">Raman Reti, Vrindavan</p>
            <p className="text-[11px] text-prayas-muted">Mathura District, UP — 281121</p>
          </div>
        </div>

        {/* Quick Utility Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-prayas-rule">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-white hover:bg-prayas-stone border border-prayas-rule text-xs font-semibold text-prayas-ink shadow-subtle transition-colors"
              title="Print or export as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-prayas-muted" />
              <span>Print Official Policy</span>
            </button>

            <button
              onClick={handleCopyLink}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-white hover:bg-prayas-stone border border-prayas-rule text-xs font-semibold text-prayas-ink shadow-subtle transition-colors"
              title="Copy link to this page"
            >
              <Share2 className="w-3.5 h-3.5 text-prayas-muted" />
              <span>{copiedLink ? "Link Copied!" : "Share Link"}</span>
            </button>

            <a
              href="#data-collection-ledger"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("data-collection-ledger");
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-prayas-neem text-white hover:bg-[#23402c] text-xs font-semibold shadow-subtle transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Inspect Data Collection Ledger</span>
            </a>
          </div>

          <div className="text-xs text-prayas-muted">
            Direct Helpline: <span className="font-semibold text-prayas-ink">+91 99270 81650</span>
          </div>
        </div>
      </header>

      {/* =========================================================================
          KEY PILLARS AT A GLANCE (The 4 Core Guarantees)
          ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-prayas-ink">
            Privacy Commitments at a Glance
          </h2>
          <span className="text-xs font-mono text-prayas-muted">Nishkam Seva Guarantee</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-prayas-rule rounded-xl p-5 shadow-card space-y-3 relative overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-prayas-neem">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-prayas-ink">
              Zero Commercialization
            </h3>
            <p className="text-xs sm:text-sm text-prayas-muted leading-relaxed">
              We never sell, rent, monetize, broker, or trade your personal or health data. We run on pure public donation and selfless community volunteerism.
            </p>
          </div>

          <div className="bg-white border border-prayas-rule rounded-xl p-5 shadow-card space-y-3 relative overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-red-50 border border-prayas-crimsonBorder flex items-center justify-center text-prayas-crimson">
              <Droplet className="w-5 h-5 fill-current" />
            </div>
            <h3 className="font-serif font-bold text-base text-prayas-ink">
              Emergency Life Saving Only
            </h3>
            <p className="text-xs sm:text-sm text-prayas-muted leading-relaxed">
              Blood request data and equipment loan records are utilized strictly to mobilize donors, coordinate medical oxygen/beds, and protect patient health.
            </p>
          </div>

          <div className="bg-white border border-prayas-rule rounded-xl p-5 shadow-card space-y-3 relative overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-amber-50 border border-prayas-marigoldBorder flex items-center justify-center text-prayas-marigold">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-prayas-ink">
              Bank-Grade Payment Security
            </h3>
            <p className="text-xs sm:text-sm text-prayas-muted leading-relaxed">
              Donations are processed via RBI-authorized, PCI-DSS Level 1 gateway Razorpay. We never store debit/credit cards, CVVs, or UPI PINs on our servers.
            </p>
          </div>

          <div className="bg-white border border-prayas-rule rounded-xl p-5 shadow-card space-y-3 relative overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-prayas-ink">
              Full Citizen Control & Rights
            </h3>
            <p className="text-xs sm:text-sm text-prayas-muted leading-relaxed">
              Under the DPDP Act 2023, you have the unrestricted right to access, rectify, delist, or purge your voluntary donor or volunteer records at any time.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MAIN TWO-COLUMN WORKFLOW:
          Left: Sticky Navigation & Table of Contents
          Right: Exhaustive Content Body with Program Ledgers
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-4 relative">
        
        {/* Sticky Desktop Table of Contents Sidebar */}
        <aside className="hidden lg:block lg:col-span-4 sticky top-28 self-start z-20">
          <div className="space-y-4 max-h-[calc(100vh-8.5rem)] overflow-y-auto pr-1">
            <div className="bg-white border border-prayas-rule rounded-xl p-5 shadow-card space-y-4">
              <div className="border-b border-prayas-rule pb-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-prayas-muted block">Policy Index</span>
                <h3 className="font-serif text-lg font-bold text-prayas-ink">
                  Table of Contents
                </h3>
              </div>

              <nav className="space-y-1 text-xs">
                {SECTIONS.map((sec) => {
                  const IconComponent = sec.icon;
                  const isCurrent = activeSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => scrollToSection(sec.id)}
                      className={`w-full flex items-center justify-between text-left px-3 py-2.5 rounded-lg transition-all ${
                        isCurrent
                          ? "bg-prayas-stone text-prayas-ink font-bold border-l-4 border-prayas-neem shadow-subtle"
                          : "text-prayas-muted hover:text-prayas-ink hover:bg-prayas-stone/50 font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <span className="font-mono text-[10px] text-prayas-muted/80">{sec.number}</span>
                        <IconComponent className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? "text-prayas-neem" : "text-prayas-muted"}`} />
                        <span className="truncate">{sec.shortTitle}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isCurrent ? "translate-x-0.5 text-prayas-neem" : "opacity-40"}`} />
                    </button>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-prayas-rule space-y-3">
                <div className="p-3 rounded-lg bg-prayas-paper border border-prayas-rule text-xs space-y-1.5">
                  <span className="font-bold text-prayas-ink flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-prayas-neem" />
                    Grievance Officer
                  </span>
                  <p className="text-prayas-muted text-[11px]">
                    Need data removal or inspection? Direct access to our Nodal Officer.
                  </p>
                  <a
                    href="mailto:av.prayas@gmail.com?subject=Privacy%20Data%20Request%20-%20Prayas%20Pariwaar"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-prayas-neem hover:underline pt-1"
                  >
                    av.prayas@gmail.com →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Body */}
        <div className="lg:col-span-8 space-y-12 sm:space-y-16">

          {/* ---------------------------------------------------------------------
              SECTION 01: INSTITUTIONAL IDENTITY & SOCIETY DETAILS
              --------------------------------------------------------------------- */}
          <section id="institutional-identity" className="scroll-mt-24 space-y-5">
            <div className="flex items-center gap-2 border-b border-prayas-rule pb-3">
              <span className="font-mono text-xs text-prayas-neem font-bold">SECTION 01</span>
              <span className="text-prayas-rule">•</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink">
                Institutional Identity & Sanstha Details
              </h2>
            </div>

            <div className="text-sm text-prayas-ink leading-relaxed space-y-4">
              <p>
                This Privacy Policy is issued by and governs the digital and physical operations of <strong>Prayas Pariwaar</strong> (commonly referred to across Mathura district and state records as <em>Prayas Sanstha</em> or <em>Prayas Sansthan</em>), a grassroots, non-profit charitable society registered under the <strong>Societies Registration Act XXI of 1860</strong> with the Registrar of Societies, Mathura, Uttar Pradesh.
              </p>
              <p>
                Established in <strong>2006</strong> in the sacred town of Vrindavan, Prayas Pariwaar operates with complete independence from commercial enterprise, political patronage, and profit motive. Our activities are rooted in the timeless ideal of <em>Nishkam Seva</em> (unconditional selfless service), focusing on emergency blood donor coordination, free medical equipment lending, free education for marginalized slum children (Project Aashayein), native holy tree afforestation (Harit Kranti), and rural public health camps.
              </p>
            </div>

            {/* Institutional Credentials Table */}
            <div className="bg-white border border-prayas-rule rounded-xl overflow-hidden shadow-card">
              <div className="bg-prayas-stone px-5 py-3 border-b border-prayas-rule flex items-center justify-between">
                <span className="text-xs font-bold text-prayas-ink uppercase tracking-wider font-mono">
                  Official Statutory & Regulatory Records
                </span>
                <span className="text-[11px] text-prayas-muted font-mono">Government of Uttar Pradesh & India</span>
              </div>
              <div className="divide-y divide-prayas-rule text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2">
                  <span className="font-semibold text-prayas-muted">Legal Name of Society</span>
                  <div className="sm:col-span-2 text-prayas-ink font-bold">
                    Prayas Pariwaar (Prayas Sanstha)
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2">
                  <span className="font-semibold text-prayas-muted">Society Registration Number</span>
                  <div className="sm:col-span-2 text-prayas-ink">
                    <strong className="font-mono text-prayas-ink">142/2006-07</strong> (Registered at Mathura, Uttar Pradesh under Societies Registration Act XXI of 1860)
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2">
                  <span className="font-semibold text-prayas-muted">Tax Exemption Certification</span>
                  <div className="sm:col-span-2 text-prayas-ink">
                    Registered non-profit charitable institution under <strong>Section 12A</strong> of the Indian Income Tax Act, 1961. Donations eligible for deduction under <strong>Section 80G</strong>.
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2">
                  <span className="font-semibold text-prayas-muted">NITI Aayog NGO Darpan ID</span>
                  <div className="sm:col-span-2 text-prayas-ink font-mono font-semibold">
                    UP/2017/0154210
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2">
                  <span className="font-semibold text-prayas-muted">Registered Seva Karyalaya</span>
                  <div className="sm:col-span-2 text-prayas-ink leading-relaxed">
                    Near Raman Reti, Parikrama Marg, Vrindavan, Mathura District, Uttar Pradesh — 281121, India
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2">
                  <span className="font-semibold text-prayas-muted">Institutional Contact Helplines</span>
                  <div className="sm:col-span-2 text-prayas-ink space-y-1">
                    <p><strong>Emergency Blood Desk:</strong> +91 99270 81650</p>
                    <p><strong>Medical Equipment Bank:</strong> +91 99270 81650</p>
                    <p><strong>Official Email:</strong> av.prayas@gmail.com</p>
                    <p><strong>Official Website:</strong> https://prayaspariwaar.com</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ---------------------------------------------------------------------
              SECTION 02: SCOPE, PHILOSOPHY & GOVERNING LAWS
              --------------------------------------------------------------------- */}
          <section id="scope-applicability" className="scroll-mt-24 space-y-5">
            <div className="flex items-center gap-2 border-b border-prayas-rule pb-3">
              <span className="font-mono text-xs text-prayas-neem font-bold">SECTION 02</span>
              <span className="text-prayas-rule">•</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink">
                Scope, Philosophy & Governing Laws
              </h2>
            </div>

            <div className="text-sm text-prayas-ink leading-relaxed space-y-4">
              <p>
                This policy governs all digital portals, mobile applications (Expo/React Native suite), phone helplines, WhatsApp emergency broadcast desks, and physical paper registries maintained at our Vrindavan Seva Karyalaya. Whether you are submitting an urgent blood requisition from a hospital ICU in Mathura, enrolling as a voluntary blood donor, requesting a medical oxygen concentrator, making an online contribution, or volunteering with underprivileged children, this policy applies to you.
              </p>
              <p>
                Our data protection standards strictly adhere to:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <li className="flex items-start gap-2 bg-white border border-prayas-rule p-3 rounded-lg shadow-subtle">
                  <CheckCircle2 className="w-4 h-4 text-prayas-neem shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-xs font-bold text-prayas-ink">Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>
                    <p className="text-[11px] text-prayas-muted">Principles of purpose limitation, data minimization, consent, and user rights.</p>
                  </div>
                </li>
                <li className="flex items-start gap-2 bg-white border border-prayas-rule p-3 rounded-lg shadow-subtle">
                  <CheckCircle2 className="w-4 h-4 text-prayas-neem shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-xs font-bold text-prayas-ink">Information Technology Act, 2000 & 2011 Rules</strong>
                    <p className="text-[11px] text-prayas-muted">Reasonable security practices and procedures for sensitive personal data (SPDI).</p>
                  </div>
                </li>
                <li className="flex items-start gap-2 bg-white border border-prayas-rule p-3 rounded-lg shadow-subtle">
                  <CheckCircle2 className="w-4 h-4 text-prayas-neem shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-xs font-bold text-prayas-ink">Income Tax Act, 1961 (Section 80G & Form 10BD)</strong>
                    <p className="text-[11px] text-prayas-muted">Mandatory regulatory compliance for donor PAN reporting and donation certification.</p>
                  </div>
                </li>
                <li className="flex items-start gap-2 bg-white border border-prayas-rule p-3 rounded-lg shadow-subtle">
                  <CheckCircle2 className="w-4 h-4 text-prayas-neem shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-xs font-bold text-prayas-ink">Reserve Bank of India (RBI) Payment Guidelines</strong>
                    <p className="text-[11px] text-prayas-muted">Tokenized payment handling with certified PCI-DSS Level 1 gateway compliance.</p>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* ---------------------------------------------------------------------
              SECTION 03: COMPREHENSIVE DATA COLLECTION LEDGER (PROGRAM-BY-PROGRAM)
              --------------------------------------------------------------------- */}
          <section id="data-collection-ledger" className="scroll-mt-24 space-y-6">
            <div className="flex items-center gap-2 border-b border-prayas-rule pb-3">
              <span className="font-mono text-xs text-prayas-neem font-bold">SECTION 03</span>
              <span className="text-prayas-rule">•</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink">
                All User Data Collected & Input Details
              </h2>
            </div>

            <p className="text-sm text-prayas-ink leading-relaxed">
              We operate under a strict principle of <strong>data minimization</strong>: we only request data that is directly essential for delivering critical healthcare, managing equipment custody, issuing statutory tax receipts, or coordinating volunteers. Below is the full programmatic breakdown of all inputs requested across our platform:
            </p>

            {/* Interactive Program Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-prayas-rule pb-3">
              <button
                type="button"
                onClick={() => setSelectedProgramTab("blood")}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  selectedProgramTab === "blood"
                    ? "bg-red-50 text-prayas-crimson border border-prayas-crimsonBorder shadow-subtle"
                    : "bg-white text-prayas-muted hover:text-prayas-ink border border-prayas-rule"
                }`}
              >
                <Droplet className="w-3.5 h-3.5 fill-current" />
                <span>1. Blood Registry & Requests</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedProgramTab("equipment")}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  selectedProgramTab === "equipment"
                    ? "bg-emerald-50 text-prayas-neem border border-prayas-neemBorder shadow-subtle"
                    : "bg-white text-prayas-muted hover:text-prayas-ink border border-prayas-rule"
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>2. Medical Equipment Bank</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedProgramTab("donations")}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  selectedProgramTab === "donations"
                    ? "bg-amber-50 text-prayas-marigold border border-prayas-marigoldBorder shadow-subtle"
                    : "bg-white text-prayas-muted hover:text-prayas-ink border border-prayas-rule"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>3. Donations & 80G Tax</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedProgramTab("volunteers")}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  selectedProgramTab === "volunteers"
                    ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-subtle"
                    : "bg-white text-prayas-muted hover:text-prayas-ink border border-prayas-rule"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>4. Volunteer Enrollment</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedProgramTab("partners")}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  selectedProgramTab === "partners"
                    ? "bg-purple-50 text-purple-700 border border-purple-200 shadow-subtle"
                    : "bg-white text-prayas-muted hover:text-prayas-ink border border-prayas-rule"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>5. CSR & Inquiries</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedProgramTab("account")}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  selectedProgramTab === "account"
                    ? "bg-slate-100 text-slate-800 border border-slate-300 shadow-subtle"
                    : "bg-white text-prayas-muted hover:text-prayas-ink border border-prayas-rule"
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>6. App Accounts & Technical</span>
              </button>
            </div>

            {/* TAB CONTENT 1: BLOOD DONATION */}
            {selectedProgramTab === "blood" && (
              <div className="bg-white border border-prayas-rule rounded-xl p-5 sm:p-6 shadow-card space-y-5 animate-fadeIn">
                <div className="flex items-center gap-3 border-b border-prayas-rule pb-3">
                  <div className="p-2 rounded bg-red-50 text-prayas-crimson border border-prayas-crimsonBorder">
                    <Droplet className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-prayas-ink">
                      24/7 Voluntary Blood Donor Registry & Emergency Requisitions
                    </h3>
                    <p className="text-xs text-prayas-muted">
                      Life-saving emergency matching across Mathura District, Vrindavan, Agra, and NCR hospitals.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-xs sm:text-sm">
                  <div>
                    <h4 className="font-bold text-prayas-ink mb-2">A. Emergency Requisition Data (Input by Patients / Hospital Attendants):</h4>
                    <div className="bg-prayas-stone/60 p-4 rounded-lg border border-prayas-rule space-y-2 text-xs">
                      <p><strong>• Patient Legal Name:</strong> Needed to verify hospital admission and create hospital gate pass dispatch.</p>
                      <p><strong>• Hospital Name & Location:</strong> Name of admitting healthcare facility (e.g., District Hospital Mathura, Ramakrishna Mission Sevashrama Vrindavan, Nayati Medicity, K.D. Medical College, etc.).</p>
                      <p><strong>• City / Ward / District:</strong> Enables geofenced dispatch to nearest available voluntary donors.</p>
                      <p><strong>• Blood Group & Rh Factor:</strong> A+, A-, B+, B-, AB+, AB-, O+, O- (strictly verified against medical requisition).</p>
                      <p><strong>• Units Required:</strong> Whole blood units, Single Donor Platelets (SDP), Random Donor Platelets (RDP), or Plasma.</p>
                      <p><strong>• Urgency Classification:</strong> Critical / ICU, High, Medium, or Scheduled surgery.</p>
                      <p><strong>• Attendant Contact Number:</strong> Direct mobile number of family member at the hospital to coordinate donor arrival.</p>
                      <p><strong>• Clinical Notes / Prescription Upload:</strong> Attending doctor’s requisition slip or blood bank replacement slip to prevent commercial blood hoarding or unauthorized requests.</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-prayas-ink mb-2">B. Voluntary Donor Registry Data (Input by Volunteer Donors):</h4>
                    <div className="bg-prayas-stone/60 p-4 rounded-lg border border-prayas-rule space-y-2 text-xs">
                      <p><strong>• Donor Full Name:</strong> Identification for certificate issuance and hospital blood bank registry.</p>
                      <p><strong>• Verified Mobile Phone Number:</strong> Primary channel for emergency dispatch calls or urgent SMS/WhatsApp alerts.</p>
                      <p><strong>• Email Address:</strong> Notification of donation anniversaries, donor drives, and health guidelines.</p>
                      <p><strong>• Blood Group:</strong> Rh typing for algorithmic emergency matching.</p>
                      <p><strong>• Residential City & Locality:</strong> Allows proximity routing so donors are only called when travel time is feasible.</p>
                      <p><strong>• Last Donation Date:</strong> Strictly enforced 90-day waiting period (as prescribed by the National Blood Transfusion Council) to protect donor health.</p>
                      <p><strong>• Real-Time Response Status:</strong> In our mobile application, donor response flags (Accepted, En Route, Completed, Declined) to track emergency fulfillment.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-red-50/70 border border-prayas-crimsonBorder rounded-lg text-xs text-red-900 leading-relaxed">
                    <strong>Critical Privacy Rule:</strong> We never display voluntary donor phone numbers publicly on the website. Requisitions are routed through trained Prayas volunteer desk coordinators (+91 99270 81650), who personally confirm both donor availability and genuine hospital urgency before sharing direct contact information.
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: MEDICAL EQUIPMENT */}
            {selectedProgramTab === "equipment" && (
              <div className="bg-white border border-prayas-rule rounded-xl p-5 sm:p-6 shadow-card space-y-5 animate-fadeIn">
                <div className="flex items-center gap-3 border-b border-prayas-rule pb-3">
                  <div className="p-2 rounded bg-emerald-50 text-prayas-neem border border-prayas-neemBorder">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-prayas-ink">
                      Free Medical Equipment Bank Lending Service
                    </h3>
                    <p className="text-xs text-prayas-muted">
                      Zero-cost lending of Oxygen Concentrators, Hospital Beds, Wheelchairs, BiPAP/CPAP, and Nebulizers.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-xs sm:text-sm">
                  <h4 className="font-bold text-prayas-ink mb-1">Inputs Required from Borrower / Patient Family:</h4>
                  <div className="bg-prayas-stone/60 p-4 rounded-lg border border-prayas-rule space-y-2 text-xs">
                    <p><strong>• Borrower / Caregiver Legal Name:</strong> Individual assuming physical custody and stewardship of equipment.</p>
                    <p><strong>• Patient Legal Name & Age:</strong> Individual for whose medical necessity the equipment is issued.</p>
                    <p><strong>• Primary & Alternate Phone Numbers:</strong> For return reminders, maintenance checks, and medical check-ins.</p>
                    <p><strong>• Complete Delivery / Residential Address:</strong> Street, house number, landmark, city/village, and PIN code in Mathura district.</p>
                    <p><strong>• Equipment Category Requested:</strong> Oxygen Concentrator (5L/10L), BiPAP Machine, CPAP Device, Semi-fowler / Full-fowler ICU Bed, Wheelchair, Nebulizer, Walker, Air Mattress, or Suction Unit.</p>
                    <p><strong>• Clinical Purpose & Medical Diagnosis:</strong> Brief summary of respiratory, cardiac, or orthopedic condition.</p>
                    <p><strong>• Requested Loan Tenure:</strong> Estimated days/weeks needed (standard loans are 7 to 30 days, extendable on medical evaluation).</p>
                    <p><strong>• Doctor’s Prescription / Medical Referral File:</strong> Mandatory upload or physical copy verification to guarantee medical necessity and correct clinical configuration.</p>
                    <p><strong>• Refundable Security Deposit Transaction:</strong> For high-capital electronic devices (e.g. oxygen concentrators), a fully refundable deposit reference is recorded, which is credited back 100% immediately upon equipment return in operating condition.</p>
                  </div>

                  <div className="p-3 bg-emerald-50/70 border border-prayas-neemBorder rounded-lg text-xs text-emerald-950 leading-relaxed">
                    <strong>Custody Stewardship Guarantee:</strong> Because these medical devices are community lifelines funded by public seva, address and identity records are used solely to track chain of custody, arrange periodic machine servicing, and ensure equipment is promptly returned so the next needy patient can survive.
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: DONATIONS & 80G */}
            {selectedProgramTab === "donations" && (
              <div className="bg-white border border-prayas-rule rounded-xl p-5 sm:p-6 shadow-card space-y-5 animate-fadeIn">
                <div className="flex items-center gap-3 border-b border-prayas-rule pb-3">
                  <div className="p-2 rounded bg-amber-50 text-prayas-marigold border border-prayas-marigoldBorder">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-prayas-ink">
                      Online Donations, Philanthropy & Section 80G Receipts
                    </h3>
                    <p className="text-xs text-prayas-muted">
                      Direct contributions via UPI, Debit/Credit Cards, NetBanking, and statutory Form 10BD tax compliance.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-xs sm:text-sm">
                  <h4 className="font-bold text-prayas-ink mb-1">Inputs Captured for Donations & Statutory Reporting:</h4>
                  <div className="bg-prayas-stone/60 p-4 rounded-lg border border-prayas-rule space-y-2 text-xs">
                    <p><strong>• Donor Full Legal Name:</strong> Mandated by Income Tax Department rules to match PAN card records.</p>
                    <p><strong>• Active Email Address:</strong> Used exclusively to deliver your instant digitally-signed donation receipt, 80G Certificate, and annual audited seva reports.</p>
                    <p><strong>• Mobile Phone Number:</strong> Transaction verification, SMS receipt delivery, and support desk coordination.</p>
                    <p><strong>• Postal / Residential Address:</strong> State, city, and PIN code required under the Societies Registration Act and Income Tax rules.</p>
                    <p><strong>• Permanent Account Number (PAN):</strong> Mandated under Section 80G(5)(vi) and Rule 18AB of the Indian Income Tax Rules, 1962, for filing Form 10BD. Without a PAN, the donor cannot claim tax deduction benefits in their Annual Information Statement (AIS).</p>
                    <p><strong>• Contribution Amount & Frequency:</strong> One-time or recurring contribution specified in Indian Rupees (INR).</p>
                    <p><strong>• Designated Cause / Fund:</strong> General Seva Fund, Project Aashayein Child Education, Blood Coordination Desk, Medical Equipment Bank, Harit Kranti Native Afforestation, or Emergency Healthcare Camps.</p>
                    <p><strong>• Anonymity Preference:</strong> If selected, your name will never be acknowledged in public donor rolls or newsletters.</p>
                    <p><strong>• Razorpay Order & Payment Tokens:</strong> Cryptographic order ID, payment ID, and payment signature for anti-fraud reconciliation.</p>
                  </div>

                  <div className="p-3 bg-amber-50/70 border border-prayas-marigoldBorder rounded-lg text-xs text-amber-950 leading-relaxed">
                    <strong>Zero Financial Storage:</strong> Prayas Pariwaar DOES NOT collect, view, or store credit card numbers, CVV codes, net-banking passwords, or UPI PINs. All payment transactions are encrypted and processed by Razorpay Software Private Limited (RBI-authorized, PCI-DSS Level 1 certified).
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: VOLUNTEERS */}
            {selectedProgramTab === "volunteers" && (
              <div className="bg-white border border-prayas-rule rounded-xl p-5 sm:p-6 shadow-card space-y-5 animate-fadeIn">
                <div className="flex items-center gap-3 border-b border-prayas-rule pb-3">
                  <div className="p-2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-prayas-ink">
                      Volunteer Enrollment & Field Team Engagement
                    </h3>
                    <p className="text-xs text-prayas-muted">
                      Mobilizing local youth and citizens for teaching, blood desk shifts, tree plantations, and health camps.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-xs sm:text-sm">
                  <h4 className="font-bold text-prayas-ink mb-1">Inputs Collected on the Volunteer Application Form:</h4>
                  <div className="bg-prayas-stone/60 p-4 rounded-lg border border-prayas-rule space-y-2 text-xs">
                    <p><strong>• Full Name, Date of Birth (DOB), and Gender:</strong> Demographic records to assess program fitness and emergency travel safety.</p>
                    <p><strong>• Email & Mobile Phone:</strong> Team communication, training invites, and emergency volunteer callouts.</p>
                    <p><strong>• Residential Address & Locality:</strong> Pincode, city, and state to assign volunteers to local neighborhood seva centers.</p>
                    <p><strong>• Professional Skills & Education:</strong> Academic background, languages spoken, driving ability, graphic design, tutoring expertise, or medical training.</p>
                    <p><strong>• Weekly Availability & Preferred Shifts:</strong> Hours per week, weekdays vs. weekends, evening hours.</p>
                    <p><strong>• Prior Social Work Experience:</strong> Previous association with non-profits or community organizations.</p>
                    <p><strong>• Preferred Seva Pillars:</strong> Multi-select preferences (Project Aashayein Child Education, Blood Desk Coordination, Equipment Delivery, Harit Kranti Plantation Drives, Jan Swasthya Medical Camps).</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 5: PARTNERS & INQUIRIES */}
            {selectedProgramTab === "partners" && (
              <div className="bg-white border border-prayas-rule rounded-xl p-5 sm:p-6 shadow-card space-y-5 animate-fadeIn">
                <div className="flex items-center gap-3 border-b border-prayas-rule pb-3">
                  <div className="p-2 rounded bg-purple-50 text-purple-700 border border-purple-200">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-prayas-ink">
                      Corporate CSR Partnerships, Individual Mentorship & Inquiries
                    </h3>
                    <p className="text-xs text-prayas-muted">
                      Collaboration with corporate donors, grant agencies, and general citizen inquiries.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-xs sm:text-sm">
                  <h4 className="font-bold text-prayas-ink mb-1">Inputs Collected on Inquiry Forms:</h4>
                  <div className="bg-prayas-stone/60 p-4 rounded-lg border border-prayas-rule space-y-2 text-xs">
                    <p><strong>• Authorized Representative Name & Title:</strong> Person submitting CSR or institutional grant inquiry.</p>
                    <p><strong>• Organization / Corporate Entity Name:</strong> Corporate identity, registered office address, and industry sector.</p>
                    <p><strong>• Official Email & Telephone:</strong> Direct correspondence channel for grant agreements, MoUs, and site visits.</p>
                    <p><strong>• CSR Mandate & Collaboration Scope:</strong> Alignment with Schedule VII of the Companies Act, 2013 (Education, Healthcare, Environmental Sustainability, Rural Development).</p>
                    <p><strong>• General Contact Form Messages:</strong> Name, email, phone, subject line, and user message submitted via our contact desk.</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 6: APP ACCOUNTS & TECHNICAL */}
            {selectedProgramTab === "account" && (
              <div className="bg-white border border-prayas-rule rounded-xl p-5 sm:p-6 shadow-card space-y-5 animate-fadeIn">
                <div className="flex items-center gap-3 border-b border-prayas-rule pb-3">
                  <div className="p-2 rounded bg-slate-100 text-slate-800 border border-slate-300">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-prayas-ink">
                      User Accounts, Mobile App Authentication & Technical Logs
                    </h3>
                    <p className="text-xs text-prayas-muted">
                      Web administration, mobile volunteer portal, Expo push notification tokens, and server security.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-xs sm:text-sm">
                  <h4 className="font-bold text-prayas-ink mb-1">Inputs & Automated Technical Data:</h4>
                  <div className="bg-prayas-stone/60 p-4 rounded-lg border border-prayas-rule space-y-2 text-xs">
                    <p><strong>• Account Credentials:</strong> Full name, email address, profile avatar image, and cryptographic password hash (hashed using salted <code>bcryptjs</code>; plaintext passwords are NEVER saved or accessible by anyone).</p>
                    <p><strong>• Expo Push Notification Tokens:</strong> Unique cryptographic device identifiers registered when you log into the Prayas Mobile App. Used exclusively to send life-critical alerts (e.g. urgent blood request matching your city and blood group).</p>
                    <p><strong>• Technical Network Logs:</strong> Anonymized IP addresses, browser user-agent, operating system version, page access timestamps, and error diagnostics generated for firewall defense and server uptime monitoring.</p>
                    <p><strong>• Session Cookies:</strong> Strict, HTTP-only, SameSite cookies used solely to maintain authenticated administrator and volunteer sessions. We DO NOT use advertising tracking cookies, Facebook Pixel, or commercial remarketing trackers.</p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ---------------------------------------------------------------------
              SECTION 04: HOW WE USE YOUR DATA (PURPOSES OF PROCESSING)
              --------------------------------------------------------------------- */}
          <section id="how-we-use-data" className="scroll-mt-24 space-y-5">
            <div className="flex items-center gap-2 border-b border-prayas-rule pb-3">
              <span className="font-mono text-xs text-prayas-neem font-bold">SECTION 04</span>
              <span className="text-prayas-rule">•</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink">
                How We Use Your Data (Purposes of Processing)
              </h2>
            </div>

            <div className="text-sm text-prayas-ink leading-relaxed space-y-4">
              <p>
                Every piece of information collected by Prayas Pariwaar is linked to a transparent, non-commercial public purpose. We process your data exclusively for the following defined operations:
              </p>
            </div>

            {/* Purpose Matrix Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="bg-white border border-prayas-rule rounded-xl p-5 shadow-card space-y-2">
                <div className="flex items-center gap-2 text-prayas-crimson font-bold">
                  <Droplet className="w-4 h-4 fill-current shrink-0" />
                  <span>1. Life-Saving Emergency Blood Dispatch</span>
                </div>
                <p className="text-prayas-muted text-xs leading-relaxed">
                  Connecting critically ill or trauma patients in Mathura/Vrindavan hospitals with matched, eligible voluntary blood donors within minutes, coordinating blood bank arrival, and recording fulfillment.
                </p>
              </div>

              <div className="bg-white border border-prayas-rule rounded-xl p-5 shadow-card space-y-2">
                <div className="flex items-center gap-2 text-prayas-neem font-bold">
                  <Stethoscope className="w-4 h-4 shrink-0" />
                  <span>2. Equipment Custody & Sanitization</span>
                </div>
                <p className="text-prayas-muted text-xs leading-relaxed">
                  Verifying medical necessity via doctor’s prescription, delivering equipment to patient homes, tracking biomedical calibration and return due dates, and refunding security deposits upon return.
                </p>
              </div>

              <div className="bg-white border border-prayas-rule rounded-xl p-5 shadow-card space-y-2">
                <div className="flex items-center gap-2 text-prayas-marigold font-bold">
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <span>3. Statutory Tax Filing & Receipting</span>
                </div>
                <p className="text-prayas-muted text-xs leading-relaxed">
                  Generating verified 80G tax exemption receipts, filing mandatory annual statements of donations in Form 10BD with the Income Tax Department, and fulfilling audited non-profit accounting obligations.
                </p>
              </div>

              <div className="bg-white border border-prayas-rule rounded-xl p-5 shadow-card space-y-2">
                <div className="flex items-center gap-2 text-blue-700 font-bold">
                  <Users className="w-4 h-4 shrink-0" />
                  <span>4. Volunteer Deployment & Child Safety</span>
                </div>
                <p className="text-prayas-muted text-xs leading-relaxed">
                  Organizing volunteer shifts for Project Aashayein evening schools, tree planting drives, and health camps, ensuring background suitability to uphold our stringent child safety standards.
                </p>
              </div>

              <div className="bg-white border border-prayas-rule rounded-xl p-5 shadow-card space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>5. Urgent Emergency Push Notifications</span>
                </div>
                <p className="text-prayas-muted text-xs leading-relaxed">
                  Sending mobile push dispatches through Expo tokens only when urgent blood is required in the user’s registered city matching their blood group, or for critical community disaster relief mobilization.
                </p>
              </div>

              <div className="bg-white border border-prayas-rule rounded-xl p-5 shadow-card space-y-2">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>6. System Integrity & Anti-Fraud Security</span>
                </div>
                <p className="text-prayas-muted text-xs leading-relaxed">
                  Preventing fraudulent commercial resale of free medical devices, detecting unauthorized payment attempts, and defending digital infrastructure against denial-of-service or bot infiltration.
                </p>
              </div>
            </div>
          </section>

          {/* ---------------------------------------------------------------------
              SECTION 05: ZERO COMMERCIALIZATION & DATA SHARING RESTRICTIONS
              --------------------------------------------------------------------- */}
          <section id="zero-commercialization" className="scroll-mt-24 space-y-5">
            <div className="flex items-center gap-2 border-b border-prayas-rule pb-3">
              <span className="font-mono text-xs text-prayas-neem font-bold">SECTION 05</span>
              <span className="text-prayas-rule">•</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink">
                Zero Commercialization & Data Sharing Restrictions
              </h2>
            </div>

            <div className="bg-prayas-stone p-6 rounded-xl border border-prayas-rule space-y-4">
              <div className="flex items-center gap-2.5 text-prayas-neem">
                <ShieldCheck className="w-6 h-6 shrink-0" />
                <h3 className="font-serif text-lg font-bold text-prayas-ink">
                  The Prayas Pariwaar Non-Commercial Pledge
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-prayas-ink leading-relaxed">
                Prayas Pariwaar maintains an unbreachable institutional policy: <strong>We do not sell, rent, license, trade, barter, or transfer personal or health information to third-party marketing companies, advertisers, brokers, pharmaceutical representatives, or private telemarketers under any circumstance.</strong>
              </p>
              <p className="text-xs text-prayas-muted leading-relaxed">
                Our 18-year legacy in Vrindavan is founded on community trust. The only situations where data leaves our direct control are strictly limited to the following operational necessities:
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-start gap-2 bg-white p-3 rounded-lg border border-prayas-rule">
                  <CheckCircle2 className="w-4 h-4 text-prayas-neem shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-prayas-ink">Matched Emergency Blood Coordination:</strong>
                    <p className="text-prayas-muted">With prior verbal or in-app consent, patient hospital bed details and attendant phone numbers are shared with the single responding volunteer donor to facilitate direct donation at the certified blood bank.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-white p-3 rounded-lg border border-prayas-rule">
                  <CheckCircle2 className="w-4 h-4 text-prayas-neem shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-prayas-ink">Payment Gateway (Razorpay):</strong>
                    <p className="text-prayas-muted">Payment authorization tokens and donor metadata are transmitted over TLS 1.3 encryption to Razorpay Software Private Limited strictly to complete the banking transaction and generate digital receipts.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-white p-3 rounded-lg border border-prayas-rule">
                  <CheckCircle2 className="w-4 h-4 text-prayas-neem shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-prayas-ink">Statutory & Lawful Compliance:</strong>
                    <p className="text-prayas-muted">Submitting annual Form 10BD statements to the Income Tax Department of India for donor 80G tax deductions, or responding to lawful summons issued by judicial or law enforcement authorities under Indian jurisdiction.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ---------------------------------------------------------------------
              SECTION 06: PAYMENT GATEWAY SECURITY & SECTION 80G COMPLIANCE
              --------------------------------------------------------------------- */}
          <section id="financial-security" className="scroll-mt-24 space-y-5">
            <div className="flex items-center gap-2 border-b border-prayas-rule pb-3">
              <span className="font-mono text-xs text-prayas-neem font-bold">SECTION 06</span>
              <span className="text-prayas-rule">•</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink">
                Donation Security, Payment Gateways & Section 80G Compliance
              </h2>
            </div>

            <div className="text-sm text-prayas-ink leading-relaxed space-y-4">
              <p>
                Every monetary contribution to Prayas Pariwaar directly sustains life-saving seva across Vrindavan and Mathura district. We have architected our financial checkout infrastructure to meet the highest regulatory standards:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-white border border-prayas-rule rounded-xl p-5 shadow-card space-y-2">
                  <h4 className="font-serif font-bold text-base text-prayas-ink flex items-center gap-2">
                    <Lock className="w-4 h-4 text-prayas-marigold" />
                    Payment Architecture (Razorpay)
                  </h4>
                  <p className="text-xs text-prayas-muted leading-relaxed">
                    All payment processing takes place via Razorpay, an RBI-authorized Payment Aggregator certified under <strong>PCI-DSS Level 1 (Payment Card Industry Data Security Standard)</strong>. When you input payment credentials, they are handled directly within Razorpay’s secure iframes. Prayas Pariwaar servers never see, handle, or store card numbers, CVVs, or bank login passwords.
                  </p>
                </div>

                <div className="bg-white border border-prayas-rule rounded-xl p-5 shadow-card space-y-2">
                  <h4 className="font-serif font-bold text-base text-prayas-ink flex items-center gap-2">
                    <FileText className="w-4 h-4 text-prayas-neem" />
                    Statutory PAN & Form 10BD Rules
                  </h4>
                  <p className="text-xs text-prayas-muted leading-relaxed">
                    Under Indian Income Tax notification guidelines, every charitable trust registered under Section 12A/80G is legally required to file an annual <strong>Form 10BD</strong> containing the donor’s legal name, postal address, and Permanent Account Number (PAN). Your PAN is securely archived in our encrypted database solely for filing this return, ensuring you receive tax exemption credits in your AIS.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ---------------------------------------------------------------------
              SECTION 07: CHILD PROTECTION & VULNERABLE BENEFICIARY PRIVACY
              --------------------------------------------------------------------- */}
          <section id="child-vulnerable-protection" className="scroll-mt-24 space-y-5">
            <div className="flex items-center gap-2 border-b border-prayas-rule pb-3">
              <span className="font-mono text-xs text-prayas-neem font-bold">SECTION 07</span>
              <span className="text-prayas-rule">•</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink">
                Child Protection & Vulnerable Beneficiary Privacy
              </h2>
            </div>

            <div className="text-sm text-prayas-ink leading-relaxed space-y-4">
              <p>
                Through <strong>Project Aashayein</strong>, Prayas Pariwaar educates and supports hundreds of underprivileged children residing in underserved settlements across Vrindavan and Mathura. Protecting these children is our sacred duty:
              </p>

              <div className="bg-white border border-prayas-rule rounded-xl p-5 sm:p-6 shadow-card space-y-3">
                <div className="flex items-center gap-2 text-prayas-crimson font-bold text-base">
                  <Heart className="w-5 h-5 fill-current" />
                  <span>Child Protection & Dignity Directives</span>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-prayas-muted list-disc list-inside leading-relaxed">
                  <li><strong>No Exploitative Imagery:</strong> We strictly prohibit publishing images or videos that portray children in undignified, compromising, or distressful conditions for fundraising sympathy.</li>
                  <li><strong>Parental / Guardian Consent:</strong> Photographing or profiling children during educational milestone events requires prior verbal or written consent from parents or community elders.</li>
                  <li><strong>No Residential Disclosure:</strong> We never publicly disclose the home addresses, contact numbers, or specific vulnerabilities of child beneficiaries on the website or social media.</li>
                  <li><strong>Volunteer Screening:</strong> All volunteers who interact directly with children in classroom settings undergo personal identity verification and agree to our Child Safeguarding Code of Conduct.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* ---------------------------------------------------------------------
              SECTION 08: TECHNICAL SAFEGUARDS, STORAGE & ENCRYPTION
              --------------------------------------------------------------------- */}
          <section id="data-security-storage" className="scroll-mt-24 space-y-5">
            <div className="flex items-center gap-2 border-b border-prayas-rule pb-3">
              <span className="font-mono text-xs text-prayas-neem font-bold">SECTION 08</span>
              <span className="text-prayas-rule">•</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink">
                Technical Safeguards, Storage & Encryption
              </h2>
            </div>

            <div className="text-sm text-prayas-ink leading-relaxed space-y-4">
              <p>
                We implement comprehensive technical, administrative, and physical security measures designed to protect your personal information against unauthorized access, loss, manipulation, or disclosure:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-white border border-prayas-rule rounded-xl p-4 shadow-subtle space-y-2">
                  <div className="w-8 h-8 rounded bg-emerald-50 text-prayas-neem flex items-center justify-center font-bold">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-prayas-ink">TLS 1.3 Transport Encryption</h4>
                  <p className="text-[11px] text-prayas-muted leading-relaxed">
                    All website, API, and mobile communications are encrypted in transit using industry-standard TLS 1.3 cryptographic protocols with modern cipher suites.
                  </p>
                </div>

                <div className="bg-white border border-prayas-rule rounded-xl p-4 shadow-subtle space-y-2">
                  <div className="w-8 h-8 rounded bg-emerald-50 text-prayas-neem flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-prayas-ink">Role-Based Access Control (RBAC)</h4>
                  <p className="text-[11px] text-prayas-muted leading-relaxed">
                    Access to donor lists, medical equipment loan registers, and volunteer applications is restricted strictly to designated, verified coordinators on a need-to-know basis.
                  </p>
                </div>

                <div className="bg-white border border-prayas-rule rounded-xl p-4 shadow-subtle space-y-2">
                  <div className="w-8 h-8 rounded bg-emerald-50 text-prayas-neem flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-prayas-ink">Irreversible Password Hashing</h4>
                  <p className="text-[11px] text-prayas-muted leading-relaxed">
                    All user accounts (volunteers and administrative staff) utilize salted <code>bcryptjs</code> password hashing. Passwords cannot be decrypted or viewed by administrators.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ---------------------------------------------------------------------
              SECTION 09: RETENTION SCHEDULES & DISPOSAL POLICY
              --------------------------------------------------------------------- */}
          <section id="retention-disposal" className="scroll-mt-24 space-y-5">
            <div className="flex items-center gap-2 border-b border-prayas-rule pb-3">
              <span className="font-mono text-xs text-prayas-neem font-bold">SECTION 09</span>
              <span className="text-prayas-rule">•</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink">
                Data Retention Schedules & Disposal Policy
              </h2>
            </div>

            <div className="text-sm text-prayas-ink leading-relaxed space-y-4">
              <p>
                We do not retain personal information indefinitely. Data is stored only for as long as is strictly necessary to fulfill the life-saving or statutory purpose for which it was collected:
              </p>

              <div className="bg-white border border-prayas-rule rounded-xl overflow-hidden shadow-card">
                <div className="divide-y divide-prayas-rule text-xs sm:text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2 bg-prayas-stone/50 font-bold text-prayas-ink">
                    <span>Program / Data Type</span>
                    <span>Retention Period</span>
                    <span>Disposal / Archival Method</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2">
                    <span className="font-semibold text-prayas-ink">Emergency Blood Requests</span>
                    <span className="text-prayas-muted">30 days after hospital fulfillment</span>
                    <span className="text-prayas-muted">Anonymized for aggregate health statistics; patient phone numbers purged.</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2">
                    <span className="font-semibold text-prayas-ink">Voluntary Blood Donor Profiles</span>
                    <span className="text-prayas-muted">Active until voluntary delisting</span>
                    <span className="text-prayas-muted">Removed immediately upon donor request via call or email.</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2">
                    <span className="font-semibold text-prayas-ink">Medical Equipment Loan Logs</span>
                    <span className="text-prayas-muted">Loan duration + 1 year audit window</span>
                    <span className="text-prayas-muted">Archived for equipment service history; medical prescription uploads purged.</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2">
                    <span className="font-semibold text-prayas-ink">Donations & 80G Tax Records</span>
                    <span className="text-prayas-muted">7 Financial Years (Statutory Mandate)</span>
                    <span className="text-prayas-muted">Retained securely under Section 80G and Form 10BD requirements under Income Tax Act.</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2">
                    <span className="font-semibold text-prayas-ink">Volunteer Applications</span>
                    <span className="text-prayas-muted">Duration of active engagement</span>
                    <span className="text-prayas-muted">Inactive applications purged after 2 years unless renewed.</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ---------------------------------------------------------------------
              SECTION 10: YOUR STATUTORY RIGHTS (DPDP ACT 2023)
              --------------------------------------------------------------------- */}
          <section id="statutory-rights" className="scroll-mt-24 space-y-5">
            <div className="flex items-center gap-2 border-b border-prayas-rule pb-3">
              <span className="font-mono text-xs text-prayas-neem font-bold">SECTION 10</span>
              <span className="text-prayas-rule">•</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink">
                Your Statutory Rights (DPDP Act 2023 & IT Act)
              </h2>
            </div>

            <div className="text-sm text-prayas-ink leading-relaxed space-y-4">
              <p>
                Under the <strong>Digital Personal Data Protection Act, 2023</strong> and applicable Indian IT laws, you are recognized as a <em>Data Principal</em> and have full authority over your personal information:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="bg-white border border-prayas-rule rounded-xl p-4 shadow-card space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-prayas-ink">
                    <Eye className="w-4 h-4 text-prayas-neem" />
                    <span>Right to Access & Information</span>
                  </div>
                  <p className="text-xs text-prayas-muted leading-relaxed">
                    You have the right to request a summary of the personal information we maintain regarding your profile, donations, or donor records.
                  </p>
                </div>

                <div className="bg-white border border-prayas-rule rounded-xl p-4 shadow-card space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-prayas-ink">
                    <CheckCircle2 className="w-4 h-4 text-prayas-neem" />
                    <span>Right to Correction & Updating</span>
                  </div>
                  <p className="text-xs text-prayas-muted leading-relaxed">
                    If your contact number, address, or donation details have changed, you can submit a correction request to keep records accurate.
                  </p>
                </div>

                <div className="bg-white border border-prayas-rule rounded-xl p-4 shadow-card space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-prayas-ink">
                    <Trash2 className="w-4 h-4 text-prayas-crimson" />
                    <span>Right to Erasure & Delisting</span>
                  </div>
                  <p className="text-xs text-prayas-muted leading-relaxed">
                    You may request that your voluntary blood donor registration or volunteer profile be removed immediately from active notification systems.
                  </p>
                </div>

                <div className="bg-white border border-prayas-rule rounded-xl p-4 shadow-card space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-prayas-ink">
                    <Scale className="w-4 h-4 text-prayas-marigold" />
                    <span>Right of Grievance Redressal</span>
                  </div>
                  <p className="text-xs text-prayas-muted leading-relaxed">
                    You have the right to register complaints regarding data privacy directly with our Nodal Grievance Officer, with guaranteed turnaround times.
                  </p>
                </div>
              </div>

              {/* Action Trigger Box */}
              <div className="p-4 bg-prayas-stone rounded-xl border border-prayas-rule flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-xs sm:text-sm text-prayas-ink">
                    Exercise Your Data Rights Today
                  </h4>
                  <p className="text-xs text-prayas-muted">
                    Send an email to our desk with the subject &ldquo;Data Request - [Your Name]&rdquo;.
                  </p>
                </div>
                <a
                  href="mailto:av.prayas@gmail.com?subject=Data%20Access%20or%20Deletion%20Request%20-%20Prayas%20Pariwaar"
                  className="px-4 py-2 rounded bg-prayas-neem text-white hover:bg-[#23402c] text-xs font-semibold shadow-subtle shrink-0 transition-colors"
                >
                  Initiate Data Request Email →
                </a>
              </div>
            </div>
          </section>

          {/* ---------------------------------------------------------------------
              SECTION 11: GRIEVANCE REDRESSAL & INSTITUTIONAL CONTACT DESKS
              --------------------------------------------------------------------- */}
          <section id="grievance-contact" className="scroll-mt-24 space-y-5">
            <div className="flex items-center gap-2 border-b border-prayas-rule pb-3">
              <span className="font-mono text-xs text-prayas-neem font-bold">SECTION 11</span>
              <span className="text-prayas-rule">•</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink">
                Grievance Redressal & Institutional Contact Desks
              </h2>
            </div>

            <div className="text-sm text-prayas-ink leading-relaxed space-y-4">
              <p>
                In compliance with the Digital Personal Data Protection Act, 2023, and the Information Technology Act, 2000, Prayas Pariwaar has appointed a designated <strong>Data Protection & Grievance Officer</strong> to address questions, requests for erasure, or complaints regarding this policy:
              </p>

              {/* Grievance Officer Contact Card */}
              <div className="bg-white border-2 border-prayas-rule rounded-xl p-6 sm:p-8 shadow-card space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-prayas-rule pb-5">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-prayas-muted">Designated Official</span>
                    <h3 className="font-serif text-xl font-bold text-prayas-ink">
                      Nodal Data Protection & Grievance Officer
                    </h3>
                    <p className="text-xs text-prayas-muted">
                      Prayas Pariwaar (Prayas Sanstha), Vrindavan
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    <span>48-Hour Acknowledgment SLA</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-prayas-neem shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold text-prayas-ink">Institutional Seva Karyalaya</strong>
                        <p className="text-prayas-muted leading-relaxed">
                          Prayas Pariwaar Seva Karyalaya,<br />
                          Near Raman Reti, Parikrama Marg,<br />
                          Vrindavan, Mathura District,<br />
                          Uttar Pradesh — 281121, India
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-prayas-neem shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold text-prayas-ink">Direct Telephone Helplines</strong>
                        <p className="text-prayas-muted">
                          Coordinator Helpline: <strong>+91 99270 81650</strong><br />
                          Hours: 9:00 AM – 7:00 PM IST (Mon – Sat)<br />
                          <span className="text-red-700 font-medium">Emergency Blood Desk: 24/7 Operations</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-prayas-neem shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold text-prayas-ink">Official Electronic Mail</strong>
                        <p className="text-prayas-muted">
                          Official Email: <a href="mailto:av.prayas@gmail.com" className="text-prayas-neem font-bold hover:underline">av.prayas@gmail.com</a><br />
                          Website: <a href="https://prayaspariwaar.com" className="hover:underline">https://prayaspariwaar.com</a>
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-prayas-stone rounded-lg border border-prayas-rule text-xs space-y-1">
                      <strong className="text-prayas-ink block">Resolution Timeline:</strong>
                      <p className="text-prayas-muted leading-relaxed">
                        We acknowledge all grievances within <strong>48 hours</strong> and resolve or provide a formal progress disposition within <strong>15 working days</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ---------------------------------------------------------------------
              FINAL SEVA CHARTER STATEMENT & SIGN-OFF
              --------------------------------------------------------------------- */}
          <div className="p-6 sm:p-8 rounded-xl bg-[#1C2421] text-[#EFECE6] space-y-4 shadow-card">
            <div className="flex items-center gap-2 text-prayas-marigold text-xs font-mono uppercase tracking-wider">
              <Heart className="w-4 h-4 fill-current" />
              <span>18-Year Legacy of Nishkam Seva in Vrindavan</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
              A Trial to Move Ahead — With Honor, Dignity & Transparency
            </h3>
            <p className="text-xs sm:text-sm text-[#A0ACA6] leading-relaxed">
              Prayas Pariwaar began on the sacred pathways of Vrindavan with handwritten diaries of blood donors and spare oxygen cylinders pedaled on bicycles. Today, while our tools have become modern, our moral covenant remains unchanged: we exist only to serve humanity, protect life, and steward your sacred trust.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-[#82908A] border-t border-[#2C3632]">
              <span>Society Reg. 142/2006-07 (Mathura)</span>
              <span>•</span>
              <span>12A Certified</span>
              <span>•</span>
              <span>NITI Aayog UP/2017/0154210</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
