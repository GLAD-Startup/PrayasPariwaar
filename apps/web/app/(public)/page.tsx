import Link from "next/link";
import { prisma } from "@/lib/prisma";
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
  const aashayeinProject = activeProjects.find((p: any) => p.slug === "aashayein-education") || activeProjects[0];
  const percentAashayein = aashayeinProject && aashayeinProject.goalAmount > 0
    ? Math.min(Math.round((aashayeinProject.raisedAmount / aashayeinProject.goalAmount) * 100), 100)
    : 62;

  return (
    <div className="space-y-16 lg:space-y-24 pb-20">
      {/* 1. HERO SECTION: Full Background Image with Project Aashayein Focus */}
      <section className="relative overflow-hidden border-b border-prayas-rule pt-16 pb-20 lg:pt-20 lg:pb-24">
        {/* Full Background Photographic Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero-education-vrindavan.jpg"
          alt="Village children studying outdoors in Vrindavan - Project Aashayein"
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
        />
        {/* Balanced Dark Cinematic Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/45 z-0" />
        <div className="absolute inset-0 bg-black/20 z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Narrative: Project Aashayein Mission */}
            <div className="lg:col-span-7 space-y-6 text-left text-white">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-xs font-bold text-emerald-300 backdrop-blur-md shadow-md">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span>Project Aashayein • Educating Rural Children in Vrindavan Since 2006</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.2] drop-shadow-md">
                Every child in rural Vrindavan deserves books, devoted teachers, and the dignity to learn.
              </h1>

              <p className="text-base sm:text-lg text-slate-100 leading-relaxed max-w-2xl font-light drop-shadow">
                Through <strong>Project Aashayein</strong>, Prayas Pariwaar provides free schooling, daily evening remedial centers, textbooks, uniforms, and nutritious meals to over 1,200 children from marginalized and daily-wage families across Mathura district.
              </p>

              {/* Direct Educational Actions */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  href="/donate?project=aashayein-education"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded text-sm font-bold bg-[#2E5339] text-white hover:bg-[#23432b] transition-all shadow-lg hover:shadow-emerald-950/50 hover:scale-[1.02]"
                >
                  <Heart className="w-4 h-4 fill-current text-rose-300" />
                  Sponsor a Child's Education (₹500/mo)
                </Link>

                <Link
                  href="/projects/aashayein-education"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded text-sm font-semibold bg-white/15 text-white border border-white/30 hover:bg-white/25 transition-all backdrop-blur-md shadow-subtle"
                >
                  <BookOpen className="w-4 h-4 text-emerald-300" />
                  Explore Project Aashayein
                </Link>
              </div>

              {/* Secondary Community Seva Callout */}
              <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-200 border-t border-white/20">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  100% Tax-Exempt under Section 80G
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Zero Admin Cut from Public Donations
                </span>
                <Link
                  href="/blood-donation"
                  className="flex items-center gap-1 font-semibold text-rose-300 hover:text-rose-200 underline decoration-rose-400/50"
                >
                  <Droplet className="w-3.5 h-3.5 fill-current text-rose-400" />
                  24/7 Blood & Medical Equipment Desk →
                </Link>
              </div>
            </div>

            {/* Right Column: Live Student Sponsorship & Impact Card */}
            <div className="lg:col-span-5">
              <div className="border border-prayas-rule bg-white rounded-xl p-6 sm:p-7 shadow-2xl space-y-5 text-prayas-ink">
                <div className="flex items-center justify-between border-b border-prayas-rule pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-prayas-neem animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-prayas-neem">
                      Project Aashayein Student Desk
                    </span>
                  </div>
                  <span className="text-xs text-prayas-muted font-mono">Academic Year 2026</span>
                </div>

                {/* Impact Snapshot */}
                <div className="p-4 rounded-lg bg-prayas-paper border border-prayas-rule space-y-3 text-prayas-ink">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-prayas-ink">Students in Evening Learning Centers</span>
                    <span className="font-serif text-2xl font-bold text-prayas-neem">320 Children</span>
                  </div>
                  <div className="flex justify-between items-baseline text-xs text-prayas-muted">
                    <span>Awaiting Educational Sponsors:</span>
                    <span className="font-bold text-amber-800">85 Students in Village Centers</span>
                  </div>
                  <div className="w-full h-2 bg-prayas-stone rounded-full overflow-hidden border border-prayas-rule">
                    <div
                      className="h-full bg-prayas-neem rounded-full"
                      style={{ width: `${percentAashayein}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-prayas-muted leading-relaxed">
                    ₹{aashayeinProject.raisedAmount.toLocaleString("en-IN")} raised of ₹{aashayeinProject.goalAmount.toLocaleString("en-IN")} goal for books, school bags, and teacher honorariums.
                  </p>
                </div>

                {/* 3 Clear Sponsorship Tiers */}
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-prayas-ink block">Transparent Sponsorship Options:</span>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <Link
                      href="/donate?project=aashayein-education&amount=500"
                      className="p-2.5 rounded-lg border border-prayas-rule bg-prayas-stone hover:bg-green-50 hover:border-prayas-neem transition-colors block text-prayas-ink"
                    >
                      <strong className="block font-serif text-sm font-bold text-prayas-ink">₹500/mo</strong>
                      <span className="text-[10px] text-prayas-muted block">Books & Tuition</span>
                    </Link>
                    <Link
                      href="/donate?project=aashayein-education&amount=1100"
                      className="p-2.5 rounded-lg border border-prayas-neem bg-green-50/80 hover:bg-green-100 transition-colors block ring-1 ring-prayas-neem/40 text-prayas-ink"
                    >
                      <strong className="block font-serif text-sm font-bold text-prayas-neem">₹1,100/mo</strong>
                      <span className="text-[10px] text-green-900 font-semibold block">Full Care & Meals</span>
                    </Link>
                    <Link
                      href="/donate?project=aashayein-education&amount=6000"
                      className="p-2.5 rounded-lg border border-prayas-rule bg-prayas-stone hover:bg-green-50 hover:border-prayas-neem transition-colors block text-prayas-ink"
                    >
                      <strong className="block font-serif text-sm font-bold text-prayas-ink">₹6,000/yr</strong>
                      <span className="text-[10px] text-prayas-muted block">Annual Schooling</span>
                    </Link>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/donate?project=aashayein-education"
                    className="w-full py-3.5 px-4 rounded-lg text-center font-bold text-sm bg-[#2E5339] text-white hover:bg-[#23432b] transition-all shadow-md flex items-center justify-center gap-2"
                    style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
                  >
                    <Heart className="w-4 h-4 fill-white text-white shrink-0" />
                    <span className="font-bold text-white text-sm">Sponsor a Student Today (80G) →</span>
                  </Link>
                </div>

                <div className="border-t border-prayas-rule pt-2 text-[11px] text-prayas-muted text-center">
                  Donors receive quarterly student progress report cards and handwritten letters.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. COMMUNITY AUDIT LEDGER (Education First) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="border border-prayas-rule bg-white rounded p-6 shadow-card">
          <div className="border-b border-prayas-rule pb-3 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-serif text-lg font-bold text-prayas-ink">18 Years of Verified Community Impact</h2>
              <p className="text-xs text-prayas-muted">Direct cumulative metrics verified by Prayas Pariwaar in Mathura district.</p>
            </div>
            <span className="text-xs font-mono text-prayas-muted">Vrindavan, UP</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {siteStats.map((stat: any) => (
              <div key={stat.id} className="space-y-1">
                <p className="font-serif text-3xl font-bold text-prayas-ink">
                  {stat.value}{stat.label.includes("Year") ? "" : "+"}
                </p>
                <p className="text-xs font-medium text-prayas-muted leading-snug">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PROJECT AASHAYEIN: THE 3-PILLAR EDUCATION MODEL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="border-b border-prayas-rule pb-4 mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-prayas-neem">
            How Project Aashayein Works
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink mt-1">
            A Sustainable Model to Keep Rural Children in School
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-prayas-rule bg-white rounded p-6 shadow-card space-y-3">
            <div className="w-10 h-10 rounded bg-green-50 border border-green-200 flex items-center justify-center text-prayas-neem font-bold">
              1
            </div>
            <h3 className="font-serif text-lg font-bold text-prayas-ink">
              Daily Evening Village Study Centers
            </h3>
            <p className="text-xs text-prayas-muted leading-relaxed">
              Children from slum areas and rural villages attend 2-hour daily study sessions guided by dedicated volunteer teachers to bridge learning gaps.
            </p>
          </div>

          <div className="border border-prayas-rule bg-white rounded p-6 shadow-card space-y-3">
            <div className="w-10 h-10 rounded bg-green-50 border border-green-200 flex items-center justify-center text-prayas-neem font-bold">
              2
            </div>
            <h3 className="font-serif text-lg font-bold text-prayas-ink">
              100% Free School Supplies & Uniforms
            </h3>
            <p className="text-xs text-prayas-muted leading-relaxed">
              Every sponsored child receives notebooks, geometry boxes, winter sweaters, school bags, and shoes before the academic session starts.
            </p>
          </div>

          <div className="border border-prayas-rule bg-white rounded p-6 shadow-card space-y-3">
            <div className="w-10 h-10 rounded bg-green-50 border border-green-200 flex items-center justify-center text-prayas-neem font-bold">
              3
            </div>
            <h3 className="font-serif text-lg font-bold text-prayas-ink">
              Nutritional Support & Health Tracking
            </h3>
            <p className="text-xs text-prayas-muted leading-relaxed">
              Daily nutritious snacks, seasonal fruits, and regular pediatric dental and eye checkups ensure children stay healthy and focused in school.
            </p>
          </div>
        </div>
      </section>

      {/* 4. OUR OTHER COMMUNITY SEVA (Secondary Pillars: Blood, Medical Equipment, Plantation, Health) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="border-b border-prayas-rule pb-4 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-prayas-muted">
              Secondary Community Initiatives
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink mt-1">
              Healthcare, Emergency Blood & Environmental Seva
            </h2>
          </div>
          <Link
            href="/projects"
            className="text-xs font-semibold text-prayas-neem hover:underline self-start sm:self-auto"
          >
            View all 4 community pillars →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Secondary Card 1: Blood Donation */}
          <div className="border border-prayas-rule bg-white rounded p-5 shadow-card space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded bg-red-50 border border-prayas-crimsonBorder flex items-center justify-center text-prayas-crimson">
                <Droplet className="w-4 h-4 fill-current" />
              </div>
              <h3 className="font-serif text-base font-bold text-prayas-ink">
                24/7 Blood Donation Desk
              </h3>
              <p className="text-xs text-prayas-muted leading-relaxed">
                Over 420 emergency units coordinated for trauma & Thalassemia patients across Mathura district hospitals.
              </p>
            </div>
            <div className="pt-2 border-t border-prayas-rule">
              <Link href="/blood-donation" className="text-xs font-bold text-prayas-crimson hover:underline">
                View Blood Registry →
              </Link>
            </div>
          </div>

          {/* Secondary Card 2: Medical Equipment Bank */}
          <div className="border border-prayas-rule bg-white rounded p-5 shadow-card space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded bg-green-50 border border-green-200 flex items-center justify-center text-prayas-neem">
                <Stethoscope className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-base font-bold text-prayas-ink">
                Medical Equipment Bank
              </h3>
              <p className="text-xs text-prayas-muted leading-relaxed">
                Free temporary home loans of 10L oxygen concentrators, hospital beds, and wheelchairs for recovering patients.
              </p>
            </div>
            <div className="pt-2 border-t border-prayas-rule">
              <Link href="/medical-equipment" className="text-xs font-bold text-prayas-neem hover:underline">
                Borrow Equipment →
              </Link>
            </div>
          </div>

          {/* Secondary Card 3: Tree Plantation */}
          <div className="border border-prayas-rule bg-white rounded p-5 shadow-card space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded bg-green-50 border border-green-200 flex items-center justify-center text-green-700">
                <Trees className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-base font-bold text-prayas-ink">
                Vrindavan Harit Kranti
              </h3>
              <p className="text-xs text-prayas-muted leading-relaxed">
                5,400+ native Neem, Peepal, and Pilu saplings planted with tree-guards along Parikrama Marg.
              </p>
            </div>
            <div className="pt-2 border-t border-prayas-rule">
              <Link href="/projects/vrindavan-harit-kranti" className="text-xs font-bold text-prayas-neem hover:underline">
                Plantation Drives →
              </Link>
            </div>
          </div>

          {/* Secondary Card 4: Health Camps */}
          <div className="border border-prayas-rule bg-white rounded p-5 shadow-card space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-base font-bold text-prayas-ink">
                Jan Swasthya Camps
              </h3>
              <p className="text-xs text-prayas-muted leading-relaxed">
                Monthly free health checkups, geriatric eye screening for cataract surgery, and free medicines.
              </p>
            </div>
            <div className="pt-2 border-t border-prayas-rule">
              <Link href="/projects/jan-swasthya-raksha" className="text-xs font-bold text-prayas-neem hover:underline">
                View Health Seva →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. RECENT EDUCATIONAL ACTIVITY & FIELD DISPATCHES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="border-b border-prayas-rule pb-4 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-prayas-neem">
              Field Dispatches & Student Activity
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink mt-1">
              Classroom Moments, Field Reports & Events
            </h2>
          </div>
          <Link
            href="/blog"
            className="text-xs font-semibold text-prayas-neem hover:underline self-start sm:self-auto"
          >
            View all field dispatches →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentEvents.map((post: any) => (
            <article
              key={post.id}
              className="border border-prayas-rule bg-white rounded overflow-hidden shadow-card flex flex-col justify-between"
            >
              {post.coverImage && (
                <div className="aspect-[16/10] bg-prayas-stone overflow-hidden border-b border-prayas-rule">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="p-5 flex flex-col flex-grow space-y-3">
                <div className="flex items-center gap-3 text-xs text-prayas-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(post.eventDate || post.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  {post.location && (
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-prayas-muted" />
                      {post.location}
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-lg font-bold text-prayas-ink leading-snug hover:text-prayas-neem transition-colors">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>

                <p className="text-xs text-prayas-muted leading-relaxed line-clamp-3 flex-grow">
                  {post.excerpt || post.content.substring(0, 140) + "..."}
                </p>

                <div className="pt-2 border-t border-prayas-rule flex items-center justify-between text-xs">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="font-semibold text-prayas-neem hover:underline"
                  >
                    Read full report
                  </Link>
                  {post.images && post.images.length > 0 && (
                    <span className="text-[11px] text-prayas-muted">
                      📷 {post.images.length} photos
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 6. TESTIMONIALS FROM VILLAGE FAMILIES & TEACHERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="border border-prayas-rule bg-white rounded p-8 sm:p-10 shadow-card space-y-8">
          <div className="border-b border-prayas-rule pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-prayas-neem">
              Voices of Transformation
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink mt-1">
              Words from Village Parents, Teachers & Beneficiaries
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((item: any) => (
              <div key={item.id} className="space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <Quote className="w-6 h-6 text-prayas-marigold" />
                  <p className="text-xs text-prayas-ink leading-relaxed italic">
                    "{item.quote}"
                  </p>
                </div>
                <div className="border-t border-prayas-rule pt-3">
                  <strong className="block text-xs font-bold text-prayas-ink">
                    {item.authorName}
                  </strong>
                  {item.designation && (
                    <span className="text-[11px] text-prayas-muted block">
                      {item.designation}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CALL TO ACTION BANNER (Sponsor a Student / Volunteer) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="border border-prayas-rule bg-prayas-stone rounded p-8 sm:p-12 text-center space-y-6 shadow-card">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink max-w-2xl mx-auto leading-tight">
            For just ₹500 a month, you can ensure a child in Vrindavan does not drop out of school.
          </h2>
          <p className="text-sm text-prayas-muted max-w-xl mx-auto leading-relaxed">
            All educational sponsorships are 100% tax-deductible under Section 80G. You will receive direct progress cards and handwritten letters from the student you sponsor.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/donate?project=aashayein-education"
              className="px-6 py-3.5 rounded text-sm font-bold bg-prayas-neem text-white hover:bg-[#23432b] transition-colors shadow-subtle"
            >
              Sponsor a Student (80G)
            </Link>
            <Link
              href="/volunteer"
              className="px-6 py-3.5 rounded text-sm font-semibold border border-prayas-rule bg-white text-prayas-ink hover:bg-prayas-subtle transition-colors shadow-subtle"
            >
              Volunteer as a Weekend Teacher
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
