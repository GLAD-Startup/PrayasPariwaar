import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Award, ShieldCheck, Heart, Users, MapPin, CheckCircle2 } from "lucide-react";

export const revalidate = 60;

export default async function AboutPage() {
  const [aboutPage, missionPage, awards, stats] = await Promise.all([
    prisma.page.findUnique({ where: { slug: "about-us" } }),
    prisma.page.findUnique({ where: { slug: "mission-vision" } }),
    prisma.award.findMany({ orderBy: { order: "asc" }, take: 3 }),
    prisma.siteStat.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div className="space-y-12 sm:space-y-16 pb-20 max-w-7xl 2xl:max-w-[1440px] 3xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 pt-6 sm:pt-10">
      {/* 1. Header Masthead */}
      <div className="border-b border-prayas-rule pb-6 sm:pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-prayas-stone border border-prayas-rule text-xs 2xl:text-sm font-medium text-prayas-ink">
          <span>Est. 2006 • Registered Grassroots Society</span>
        </div>
        <h1 className="font-serif text-2xl xs:text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl font-bold text-prayas-ink leading-tight">
          18 Years of Grassroots Community Seva in Vrindavan
        </h1>
        <p className="text-sm sm:text-base md:text-lg 2xl:text-xl text-prayas-muted max-w-3xl 2xl:max-w-4xl leading-relaxed">
          Prayas Pariwaar began as an emergency volunteer network in the holy town of Vrindavan. Today, it stands as a trusted institution providing non-commercial assistance across Mathura district.
        </p>
      </div>

      {/* 2. Mission & History Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-6">
          <div className="border border-prayas-rule bg-white rounded p-6 sm:p-8 shadow-card space-y-4">
            <h2 className="font-serif text-2xl font-bold text-prayas-ink border-b border-prayas-rule pb-3">
              {aboutPage?.title || "Our Origins & Legacy"}
            </h2>
            <div className="text-sm text-prayas-ink leading-relaxed space-y-4 whitespace-pre-line">
              {aboutPage?.content || "In 2006, when emergency medical resources and blood availability in Mathura district were scarce, Prayas began as an emergency response network. Volunteers carried handwritten registries of blood donors and delivered spare oxygen cylinders to homebound elderly patients on bicycles and two-wheelers."}
            </div>
          </div>

          <div className="border border-prayas-rule bg-white rounded p-6 sm:p-8 shadow-card space-y-4">
            <h2 className="font-serif text-2xl font-bold text-prayas-ink border-b border-prayas-rule pb-3">
              {missionPage?.title || "Guiding Philosophy: Nishkam Seva"}
            </h2>
            <div className="text-sm text-prayas-ink leading-relaxed space-y-4 whitespace-pre-line">
              {missionPage?.content || "Our philosophy is rooted in Nishkam Seva (selfless community service). Over the past 18 years, Prayas has evolved into a registered grassroots society managing a 24/7 volunteer blood coordination desk, a free medical equipment bank, regular education assistance, and native environmental restoration."}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Governance & Registrations */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border border-prayas-rule bg-prayas-stone rounded p-6 shadow-card space-y-4">
            <h3 className="font-serif text-lg font-bold text-prayas-ink border-b border-prayas-rule pb-2">
              Legal & Registration Standing
            </h3>
            <ul className="space-y-3 text-xs text-prayas-ink">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-prayas-neem shrink-0 mt-0.5" />
                <div>
                  <strong>Societies Registration Act XXI of 1860</strong>
                  <p className="text-prayas-muted">Registration Number: 142/2006-07 (Mathura, UP)</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-prayas-neem shrink-0 mt-0.5" />
                <div>
                  <strong>Income Tax Exemption: Section 12A</strong>
                  <p className="text-prayas-muted">Registered non-profit institution under Section 12A of the Income Tax Act.</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-prayas-neem shrink-0 mt-0.5" />
                <div>
                  <strong>NITI Aayog NGO Darpan</strong>
                  <p className="text-prayas-muted">Unique Identification: UP/2017/0154210</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="border border-prayas-rule bg-white rounded p-6 shadow-card space-y-4">
            <h3 className="font-serif text-lg font-bold text-prayas-ink border-b border-prayas-rule pb-2">
              Recent Honors & Empanelment
            </h3>
            <div className="space-y-4">
              {awards.map((award) => (
                <div key={award.id} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between font-bold text-prayas-ink">
                    <span>{award.title}</span>
                    {award.year && <span className="text-prayas-neem">{award.year}</span>}
                  </div>
                  <p className="text-prayas-muted text-[11px] leading-relaxed">
                    {award.description}
                  </p>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-prayas-rule">
              <Link
                href="/about/awards"
                className="text-xs font-semibold text-prayas-neem hover:underline"
              >
                View all institutional awards & certificates →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
