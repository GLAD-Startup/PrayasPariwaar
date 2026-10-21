import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { assetPath } from "@/lib/api";
import {
  ArrowLeft,
  Users,
  ShieldCheck,
  HeartHandshake,
  Award,
  Stethoscope,
  Briefcase,
  GraduationCap,
  Building2,
  MapPin,
  Calendar,
  Sparkles,
} from "lucide-react";
import TeamMembersClient from "./TeamMembersClient";

export const revalidate = 60;

export const metadata = {
  title: "Sanstha Seva Team & Leadership | Prayas Pariwaar Vrindavan",
  description:
    "Meet the office bearers, trustees, doctors, and field seva coordinators dedicated to selfless humanitarian service at Prayas Sanstha in Mathura-Vrindavan.",
};

export default async function PublicTeamPage() {
  const members = await prisma.teamMember.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-8 sm:space-y-12 pb-24 max-w-7xl 2xl:max-w-[1440px] 3xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 pt-6 sm:pt-10">
      {/* 1. Header & Navigation Masthead */}
      <div className="space-y-4 border-b border-prayas-rule pb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-prayas-muted">
          <Link href="/" className="hover:text-prayas-ink transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/about" className="hover:text-prayas-ink transition-colors">
            About Us
          </Link>
          <span>/</span>
          <span className="text-emerald-800">Sanstha Seva Team</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900">
              <Users className="w-3.5 h-3.5 text-emerald-700" />
              <span>Office Bearers, Trustees & Field Coordinators</span>
            </div>
            <h1 className="font-serif text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold text-prayas-ink leading-tight">
              The Seva Team of Prayas Sanstha
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-prayas-muted max-w-3xl leading-relaxed">
              Dedicated citizens, healthcare professionals, and youth volunteers steering 18 years
              of transparent, selfless community assistance across Vrindavan and Mathura district.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2.5">
            <Link
              href="/about"
              className="px-3.5 py-2 rounded-lg border border-prayas-rule bg-white text-xs font-semibold text-prayas-ink hover:bg-prayas-stone flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              18-Year Legacy
            </Link>
            <Link
              href="/about/awards"
              className="px-3.5 py-2 rounded-lg border border-amber-300 bg-amber-50 text-xs font-semibold text-amber-900 hover:bg-amber-100 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Award className="w-3.5 h-3.5 text-amber-700" />
              State Awards
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Interactive Filter & Members Grid */}
      <TeamMembersClient initialMembers={JSON.parse(JSON.stringify(members))} />

      {/* 3. Institutional Governance & Volunteer Callout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-prayas-rule">
        <div className="lg:col-span-8 bg-prayas-stone border border-prayas-rule rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Nishkam Seva Governance Model</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-prayas-ink">
            Democratic Accountability & Grassroots Participation
          </h2>
          <p className="text-xs sm:text-sm text-prayas-ink leading-relaxed">
            Prayas Sanstha operates under the Societies Registration Act XXI of 1860 with audited
            financial records, active governance bodies, and no commercial interests. Every project—from
            the 24/7 emergency blood donation desk to native plantation drives—is coordinated directly
            by our voluntary committee and ground team members.
          </p>
          <div className="flex items-center gap-4 pt-2 flex-wrap text-xs">
            <Link
              href="/about"
              className="font-semibold text-emerald-800 hover:underline"
            >
              Read our 18-Year Historical Timeline →
            </Link>
            <span className="text-prayas-rule">•</span>
            <Link
              href="/gallery"
              className="font-semibold text-emerald-800 hover:underline"
            >
              View Field Seva Photo Gallery →
            </Link>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-prayas-rule rounded-2xl p-6 sm:p-8 space-y-4 shadow-subtle flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-prayas-ink">
              Serve With Our Team
            </h3>
            <p className="text-xs text-prayas-muted leading-relaxed">
              We welcome doctors, students, teachers, and passionate citizens to join our volunteer panels
              in Mathura-Vrindavan.
            </p>
          </div>
          <Link
            href="/volunteer"
            className="w-full text-center px-4 py-2.5 rounded-lg bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 shadow-sm transition-colors block"
          >
            Apply to Join as Volunteer
          </Link>
        </div>
      </div>
    </div>
  );
}
