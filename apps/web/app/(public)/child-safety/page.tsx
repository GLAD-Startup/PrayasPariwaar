import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  Mail,
  Phone,
  FileCheck2,
  Lock,
  Heart,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Users,
} from "lucide-react";
import JsonLd from "@/components/JsonLd";
import { CANONICAL_BASE_URL, getWebPageGraph } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Child Safeguarding & Standards Against CSAE | Prayas Pariwaar",
  description:
    "Official Institutional Policy and Standards of Prayas Pariwaar against Child Sexual Abuse and Exploitation (CSAE) and Child Sexual Abuse Material (CSAM), ensuring zero-tolerance child protection across digital platforms and on-ground education centers in Vrindavan.",
  alternates: {
    canonical: `${CANONICAL_BASE_URL}/child-safety`,
  },
  openGraph: {
    title: "Child Safeguarding & CSAE Prevention Standards | Prayas Pariwaar",
    description:
      "Zero-tolerance standards against Child Sexual Abuse and Exploitation (CSAE). Learn about Prayas Pariwaar's child protection protocols, reporting mechanisms, and POCSO compliance.",
    url: `${CANONICAL_BASE_URL}/child-safety`,
    type: "website",
  },
};

export default function ChildSafetyPage() {
  const jsonLdData = getWebPageGraph({
    title: "Child Safeguarding & Standards Against CSAE | Prayas Pariwaar",
    description:
      "Official Institutional Standards against Child Sexual Abuse and Exploitation (CSAE) and Child Sexual Abuse Material (CSAM). Prayas Pariwaar Society Reg. 142/2006-07 Vrindavan.",
    path: "/child-safety",
    type: "WebPage",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Child Safety Standards", path: "/child-safety" },
    ],
  });

  return (
    <>
      <JsonLd data={jsonLdData} />

      <div className="bg-[#FAF9F6] border-b border-prayas-rule py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-[#2E5339] border border-emerald-300 text-xs font-bold shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Institutional Child Protection Standards</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-prayas-ink leading-[1.2]">
            Standards Against Child Sexual Abuse and Exploitation (CSAE)
          </h1>

          <p className="text-xs sm:text-sm text-prayas-muted max-w-2xl mx-auto leading-relaxed">
            Prayas Pariwaar (Prayas Sanstha, Reg. No. 142/2006-07) maintains an unconditional, zero-tolerance policy against any form of child sexual abuse, exploitation, or the distribution of child sexual abuse material (CSAM).
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[11px] text-slate-500 font-mono">
            <span>Last Updated: November 2026</span>
            <span>•</span>
            <span>Compliant with Google Play Developer Policy</span>
            <span>•</span>
            <span>POCSO Act 2012 Certified</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-10 py-12 sm:py-16 space-y-12">
        {/* 1. Policy Statement */}
        <section className="bg-white border border-prayas-rule rounded-2xl p-6 sm:p-8 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 border-b border-prayas-rule pb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#2E5339] flex items-center justify-center border border-emerald-200">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-prayas-ink">
              1. Zero-Tolerance Statement on CSAE and CSAM
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            Prayas Pariwaar strictly prohibits any act, content, behavior, or facilitation of <strong>Child Sexual Abuse and Exploitation (CSAE)</strong> or <strong>Child Sexual Abuse Material (CSAM)</strong> on all of our digital portals, mobile applications (Android / iOS), communication channels, and on-ground field study centers.
          </p>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            Through <strong>Project Aashayein</strong>, our grassroots society educates and cares for over 300 children across 6 evening study centers in Vrindavan and Mathura district. Protecting the dignity, bodily integrity, mental well-being, and digital privacy of minors is an inviolable duty. Any violation will result in immediate termination of access, expulsion, and criminal escalation to statutory law enforcement agencies without exception.
          </p>

          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-rose-900 leading-relaxed">
              <strong className="block font-bold">Strictly Prohibited Acts Across All Platforms:</strong>
              <ul className="list-disc list-inside space-y-1 pt-1 text-[11px] text-rose-800">
                <li>Creating, producing, hosting, streaming, distributing, or linking to Child Sexual Abuse Material (CSAM).</li>
                <li>Child grooming, coercive solicitation, or inappropriate communication directed toward or depicting any minor.</li>
                <li>Uploading unverified or exploitative photographs, videos, or imagery portraying children in compromised conditions.</li>
                <li>Publishing private residential details, contact numbers, or vulnerabilities of child beneficiaries.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 2. On-Ground Child Safeguarding Code of Conduct */}
        <section className="bg-white border border-prayas-rule rounded-2xl p-6 sm:p-8 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 border-b border-prayas-rule pb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#2E5339] flex items-center justify-center border border-emerald-200">
              <Heart className="w-4 h-4" />
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-prayas-ink">
              2. On-Ground Safeguarding Directives (Project Aashayein)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-xl border border-prayas-rule bg-slate-50/70 space-y-1.5">
              <h3 className="font-serif font-bold text-xs sm:text-sm text-prayas-ink flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Volunteer & Teacher Vetting</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-prayas-muted leading-relaxed">
                All volunteers, instructors, and field supervisors interacting with children undergo identity verification, government ID scrutiny, and sign our written Child Safeguarding Charter prior to classroom deployment.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-prayas-rule bg-slate-50/70 space-y-1.5">
              <h3 className="font-serif font-bold text-xs sm:text-sm text-prayas-ink flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Open-Classroom Policy</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-prayas-muted leading-relaxed">
                No child is ever left alone behind closed doors with a single adult. All tutoring occurs in open, community-visible evening spaces with multiple volunteers and village elders present.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-prayas-rule bg-slate-50/70 space-y-1.5">
              <h3 className="font-serif font-bold text-xs sm:text-sm text-prayas-ink flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Guardian Consent for Media</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-prayas-muted leading-relaxed">
                Photographing or profiling children during educational distributions requires verified parental or guardian consent. Images are screened to maintain dignity and modesty.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-prayas-rule bg-slate-50/70 space-y-1.5">
              <h3 className="font-serif font-bold text-xs sm:text-sm text-prayas-ink flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Child Dignity Pledge</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-prayas-muted leading-relaxed">
                We strictly prohibit publishing undignified or distressful imagery to solicit donations. Children are portrayed with honor, respect, and academic joy.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Digital Application & Media Screening */}
        <section className="bg-white border border-prayas-rule rounded-2xl p-6 sm:p-8 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 border-b border-prayas-rule pb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#2E5339] flex items-center justify-center border border-emerald-200">
              <Lock className="w-4 h-4" />
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-prayas-ink">
              3. Digital Application & Media Moderation Standards
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            Our web platform and mobile apps adhere to strict media validation standards:
          </p>

          <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E5339] mt-2 shrink-0" />
              <span><strong>Pre-Upload Server Validation:</strong> All uploaded files (images and videos) undergo server-side validation against executable code, unauthorized script embedding, and strict MIME type inspection.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E5339] mt-2 shrink-0" />
              <span><strong>Human Administrative Moderation:</strong> Public event galleries and stories are curated exclusively through authenticated administrative review before publication. No unmoderated user uploads appear publicly.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E5339] mt-2 shrink-0" />
              <span><strong>Instant Takedown:</strong> Any reported or flagged content that may compromise child safety is suspended immediately pending formal review.</span>
            </li>
          </ul>
        </section>

        {/* 4. Law Enforcement Reporting & POCSO Compliance */}
        <section className="bg-white border border-prayas-rule rounded-2xl p-6 sm:p-8 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 border-b border-prayas-rule pb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#2E5339] flex items-center justify-center border border-emerald-200">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-prayas-ink">
              4. Mandatory Statutory Reporting & Law Enforcement Escalation
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            Prayas Pariwaar strictly adheres to the <strong>Protection of Children from Sexual Offences (POCSO) Act, 2012</strong>, the <strong>Information Technology Act, 2000</strong>, and international digital safety protocols.
          </p>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            Under Section 19 of the POCSO Act, any apprehension or knowledge of child abuse or exploitation mandates immediate reporting to the <strong>Special Juvenile Police Unit (SJPU)</strong> or local police authorities. Prayas Pariwaar cooperates fully with:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div className="p-3.5 rounded-xl border border-prayas-rule bg-slate-50">
              <strong className="block font-bold text-prayas-ink">National Cyber Crime Reporting Portal</strong>
              <span className="text-[11px] text-prayas-muted block mt-0.5">Government of India (I4C)</span>
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1 mt-1 text-[11px]"
              >
                <span>cybercrime.gov.in</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-3.5 rounded-xl border border-prayas-rule bg-slate-50">
              <strong className="block font-bold text-prayas-ink">Childline India Helpline</strong>
              <span className="text-[11px] text-prayas-muted block mt-0.5">Ministry of Women and Child Development</span>
              <span className="text-emerald-700 font-bold block mt-1 text-[11px]">Dial 1098 (24/7 Toll-Free)</span>
            </div>

            <div className="p-3.5 rounded-xl border border-prayas-rule bg-slate-50">
              <strong className="block font-bold text-prayas-ink">NCMEC (International Reports)</strong>
              <span className="text-[11px] text-prayas-muted block mt-0.5">National Center for Missing & Exploited Children</span>
              <a
                href="https://report.cybertip.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1 mt-1 text-[11px]"
              >
                <span>report.cybertip.org</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-3.5 rounded-xl border border-prayas-rule bg-slate-50">
              <strong className="block font-bold text-prayas-ink">District Child Protection Unit (DCPU)</strong>
              <span className="text-[11px] text-prayas-muted block mt-0.5">Mathura District, Uttar Pradesh</span>
              <span className="text-emerald-700 font-bold block mt-1 text-[11px]">Mathura Collectorate & Kotwali</span>
            </div>
          </div>
        </section>

        {/* 5. How to Report Violations */}
        <section className="bg-white border-2 border-emerald-600/30 rounded-2xl p-6 sm:p-8 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 border-b border-prayas-rule pb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-prayas-ink">
                5. How to Report a Child Safety or CSAE Concern
              </h2>
              <span className="text-xs text-emerald-800 font-semibold">Dedicated 24/7 Child Safety Reporting Desk</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            If you encounter any content, behavior, or concern regarding the safety or exploitation of a child across our apps or centers, report it immediately to our dedicated Child Protection Officer:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <a
              href="mailto:av.prayas@gmail.com?subject=URGENT%20-%20Child%20Safety%20%2F%20CSAE%20Report"
              className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/60 transition-all block group"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                <Mail className="w-4 h-4 text-emerald-700" />
                <span>Dedicated Safety Email</span>
              </div>
              <span className="text-sm font-bold text-emerald-900 block mt-1 font-mono group-hover:underline">
                av.prayas@gmail.com
              </span>
              <span className="text-[11px] text-emerald-800/80 block mt-0.5">
                Subject line: &ldquo;URGENT - Child Safety Report&rdquo;
              </span>
            </a>

            <a
              href="tel:+919927081650"
              className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/60 transition-all block group"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                <Phone className="w-4 h-4 text-emerald-700" />
                <span>Direct Executive Helpline</span>
              </div>
              <span className="text-sm font-bold text-emerald-900 block mt-1 font-mono group-hover:underline">
                +91 99270 81650
              </span>
              <span className="text-[11px] text-emerald-800/80 block mt-0.5">
                Vrindavan Seva Karyalaya (President / Secretary)
              </span>
            </a>
          </div>

          <div className="border-t border-prayas-rule pt-4 text-[11px] text-prayas-muted leading-relaxed">
            <strong>Confidentiality Assurance:</strong> All reports received by our child safety committee are treated with the highest confidentiality and investigated within 24 hours. Reports containing material evidence of CSAE/CSAM are forwarded to statutory law enforcement officers without delay.
          </div>
        </section>

        {/* Statutory Society Footer Reassurance */}
        <div className="p-5 rounded-2xl bg-white border border-prayas-rule shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="space-y-0.5 text-center sm:text-left">
            <strong className="block font-serif text-sm font-bold text-prayas-ink">
              Prayas Pariwaar (Prayas Sanstha)
            </strong>
            <p className="text-[11px] text-prayas-muted">
              Registered Society No. 142/2006-07 • 12A Certified • NITI Aayog Darpan: UP/2017/0154210
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/privacy-policy"
              className="px-3.5 py-1.5 rounded-xl border border-prayas-rule bg-slate-50 hover:bg-slate-100 text-prayas-ink font-semibold transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/contact"
              className="px-3.5 py-1.5 rounded-xl bg-[#2E5339] text-white font-bold hover:bg-[#23432b] transition-colors"
            >
              Contact Office
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

