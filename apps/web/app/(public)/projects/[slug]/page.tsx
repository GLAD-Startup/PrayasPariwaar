import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ScrollReveal from "@/components/ScrollReveal";
import {
  ArrowLeft,
  Heart,
  Calendar,
  Users,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Camera,
  ExternalLink,
  Target,
} from "lucide-react";
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { getWebPageGraph, sanitizeMetadataTitle } from "@/lib/schema";

export const revalidate = 60;

interface ProjectDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const project = await prisma.project.findUnique({
    where: { slug: params.slug },
  });

  if (!project) return { title: "Program Not Found" };

  const rawTitle = project.metaTitle || project.title;
  const cleanTitle = sanitizeMetadataTitle(rawTitle, "Community Program");
  const cleanDescription = (project.metaDescription || project.description.substring(0, 160))
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return {
    title: cleanTitle,
    description: cleanDescription,
    alternates: {
      canonical: `/projects/${params.slug}`,
    },
    openGraph: {
      title: cleanTitle,
      description: cleanDescription,
      url: `/projects/${params.slug}`,
      ...(project.coverImage ? { images: [project.coverImage] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: cleanTitle,
      description: cleanDescription,
      ...(project.coverImage ? { images: [project.coverImage] } : {}),
    },
  };
}


export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const project = await prisma.project.findUnique({
    where: { slug: params.slug },
    include: {
      images: { orderBy: { order: "asc" } },
      donations: {
        where: { status: "SUCCESS" },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Related blog posts tagged to this project
  const relatedPosts = await prisma.post.findMany({
    where: {
      published: true,
      OR: [
        { title: { contains: project.title.split(":")[0]?.trim() || project.title } },
        { content: { contains: project.slug } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  // Other active projects for "Other Programs" section
  const otherProjects = await prisma.project.findMany({
    where: {
      status: "ACTIVE",
      NOT: { id: project.id },
    },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  const percent = project.goalAmount > 0
    ? Math.min(Math.round((project.raisedAmount / project.goalAmount) * 100), 100)
    : 0;

  const categoryColorMap: Record<string, { bg: string; text: string; border: string }> = {
    EDUCATION: { bg: "bg-emerald-50", text: "text-emerald-900", border: "border-emerald-200" },
    HEALTH: { bg: "bg-rose-50", text: "text-rose-900", border: "border-rose-200" },
    PLANTATION: { bg: "bg-emerald-50", text: "text-emerald-900", border: "border-emerald-200" },
    AWARENESS: { bg: "bg-amber-50", text: "text-amber-900", border: "border-amber-200" },
    OTHER: { bg: "bg-prayas-stone", text: "text-prayas-ink", border: "border-prayas-rule" },
  };

  const catStyle = categoryColorMap[project.category] || categoryColorMap.OTHER;

  const cleanSchemaTitle = sanitizeMetadataTitle(project.title, "Community Program");

  const schema = getWebPageGraph({
    title: `${cleanSchemaTitle} | Prayas Pariwaar (Vrindavan)`,
    description: project.metaDescription || project.description.substring(0, 160),
    path: `/projects/${project.slug}`,
    type: "ItemPage",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Community Projects", path: "/projects" },
      { name: cleanSchemaTitle, path: `/projects/${project.slug}` },
    ],
    mainEntity: {
      "@type": "Project",
      name: project.title,
      description: project.description.substring(0, 300),
      ...(project.coverImage ? { image: [project.coverImage] } : {}),
      category: `${project.category} Seva`,
      funder: {
        "@id": "https://prayaspariwaar.com/#organization",
      },
    },
  });

  return (
    <div className="pb-20 bg-[#FAF8F5]">
      <JsonLd data={schema} />
      {/* ====================================================================== */}
      {/* HERO BANNER with Generous Padding & High Legibility                   */}
      {/* ====================================================================== */}
      <section className="relative overflow-hidden pt-16 sm:pt-20 pb-20 lg:pt-24 lg:pb-28 bg-[#11241A] text-white">
        {project.coverImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.coverImage}
              alt={project.title}
              className="absolute inset-0 w-full h-full object-cover object-center z-0 opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#11241A] via-[#11241A]/80 to-[#11241A]/60 z-0" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B1E14] via-[#133022] to-[#1C4531] z-0" />
        )}

        <div className="relative z-10 max-w-5xl 2xl:max-w-6xl 3xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 space-y-5">
          {/* Back Navigation & Breadcrumb */}
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-xs 2xl:text-sm font-semibold text-emerald-200/90 hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-lg border border-white/15 backdrop-blur-xs group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Return to All Seva Programs</span>
          </Link>

          {/* Category & Status Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${catStyle.bg} ${catStyle.text} ${catStyle.border} border shadow-xs`}>
              {project.category} Seva
            </span>
            <span className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active Grassroots Program</span>
            </span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-2xl xs:text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl font-bold leading-tight text-white tracking-tight drop-shadow-md">
            {project.title}
          </h1>

          {/* Quick Statistics Strip */}
          <div className="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm pt-2 text-emerald-100/90 font-medium">
            {project.goalAmount > 0 && (
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg border border-white/15">
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-current" />
                <span>₹{project.raisedAmount.toLocaleString("en-IN")} raised of ₹{project.goalAmount.toLocaleString("en-IN")} goal</span>
              </span>
            )}
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg border border-white/15">
              <MapPin className="w-3.5 h-3.5 text-emerald-300" />
              <span>Vrindavan & Mathura District, UP</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg border border-white/15">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Direct Grassroots Impact</span>
            </span>
          </div>
        </div>
      </section>

      {/* ====================================================================== */}
      {/* MAIN CONTENT GRID - BALANCED & WELL-STRUCTURED                         */}
      {/* ====================================================================== */}
      <div className="max-w-5xl 2xl:max-w-6xl 3xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 -mt-10 relative z-10 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================================================================= */}
          {/* LEFT COLUMN: Narrative, Focus Areas, Roadmap & Documentation       */}
          {/* ================================================================= */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. Program Scope & Purpose */}
            <ScrollReveal>
              <div className="border border-prayas-rule bg-white rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
                <div className="space-y-2 border-b border-prayas-rule pb-4">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    <Target className="w-4 h-4 text-emerald-700" />
                    <span>Mission & Direct Objective</span>
                  </div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-prayas-ink">
                    Program Scope & Purpose
                  </h2>
                </div>

                <div className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal space-y-4 whitespace-pre-line">
                  {project.description.split("\n\n").map((para, idx) => (
                    <p key={idx} className="leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>

                {/* Verified Program Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Program Category
                    </span>
                    <p className="text-xs font-bold text-slate-900">
                      {project.category} Seva
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Operational Area
                    </span>
                    <p className="text-xs font-bold text-slate-900">
                      Vrindavan & Mathura District
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Registered Non-Profit
                    </span>
                    <p className="text-xs font-bold text-slate-900">
                      Reg. 142/2006-07
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* 2. Photo Gallery & Field Documentation */}
            <ScrollReveal>
              <div className="border border-prayas-rule bg-white rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
                <div className="border-b border-prayas-rule pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-prayas-ink flex items-center gap-2">
                      <Camera className="w-5 h-5 text-emerald-800" />
                      <span>Field Photography & On-Ground Documentation</span>
                    </h3>
                    <p className="text-xs text-prayas-muted mt-0.5">
                      Photographic records documenting transparent seva activities across Vrindavan & Mathura.
                    </p>
                  </div>

                  <Link
                    href="/gallery"
                    className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>View Seva Gallery</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {project.images.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {project.images.map((img) => (
                      <div
                        key={img.id}
                        className="border border-prayas-rule rounded-xl overflow-hidden bg-prayas-stone shadow-2xs group"
                      >
                        <div className="aspect-[4/3] overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.url}
                            alt={img.caption || project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                        {img.caption && (
                          <div className="p-2.5 bg-white border-t border-prayas-rule">
                            <p className="text-[11px] sm:text-xs font-medium text-slate-700 leading-snug">
                              {img.caption}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-3">
                    <Camera className="w-8 h-8 text-slate-400 mx-auto" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800">
                        Field Documentation Archive
                      </p>
                      <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                        Photographs documenting Prayas field activities are cataloged in our central Seva gallery.
                      </p>
                    </div>
                    <Link
                      href="/gallery"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#1E5338] hover:bg-[#16432B] px-4 py-2 rounded-lg transition-colors shadow-2xs"
                    >
                      <span>Explore Vrindavan Seva Gallery Archive</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </ScrollReveal>

            {/* 5. Related Field Dispatches & Reports */}
            {relatedPosts.length > 0 && (
              <ScrollReveal>
                <div className="border border-prayas-rule bg-white rounded-2xl p-6 sm:p-8 shadow-card space-y-4">
                  <h3 className="font-serif text-lg font-bold text-prayas-ink border-b border-prayas-rule pb-3">
                    Related Field Dispatches & Event Reports
                  </h3>
                  <div className="space-y-4">
                    {relatedPosts.map((post) => (
                      <Link
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        className="block p-4 rounded-xl border border-prayas-rule bg-slate-50/60 hover:bg-slate-50 transition-colors group"
                      >
                        <div className="flex items-center gap-2 text-[11px] text-prayas-muted mb-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(post.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          {post.location && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                <MapPin className="w-3 h-3" />
                                {post.location}
                              </span>
                            </>
                          )}
                        </div>
                        <h4 className="font-serif text-sm font-bold text-prayas-ink group-hover:text-emerald-800 transition-colors">
                          {post.title}
                        </h4>
                        <p className="text-xs text-prayas-muted line-clamp-2 mt-1">
                          {post.excerpt || post.content.substring(0, 120) + "..."}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}
          </div>

          {/* ================================================================= */}
          {/* RIGHT SIDEBAR COLUMN: Funding, Volunteer, Inquiry & Verification   */}
          {/* ================================================================= */}
          <div className="lg:col-span-4 space-y-6">
            {/* Fundraising Card */}
            {project.goalAmount > 0 && (
              <ScrollReveal>
                <div className="border border-prayas-rule bg-white rounded-2xl p-6 shadow-card space-y-5">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Transparent Community Fund
                    </span>
                    <p className="font-serif text-3xl font-bold text-prayas-ink pt-2">
                      ₹{project.raisedAmount.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-prayas-muted">
                      raised of ₹{project.goalAmount.toLocaleString("en-IN")} goal
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-emerald-800">{percent}% funded</span>
                      <span className="text-prayas-muted">
                        ₹{(project.goalAmount - project.raisedAmount).toLocaleString("en-IN")} remaining
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-[#1E5338] rounded-full transition-all duration-700"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    href={`/donate?project=${project.slug}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-bold bg-[#1E5338] hover:bg-[#153D28] text-white transition-all shadow-md"
                  >
                    <Heart className="w-4 h-4 fill-white text-white" />
                    <span>Contribute to This Cause</span>
                  </Link>

                  <div className="flex items-center gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>100% direct allocation. Instant receipt.</span>
                  </div>

                  {/* Recent Donors */}
                  {project.donations.length > 0 && (
                    <div className="border-t border-prayas-rule pt-3 space-y-2">
                      <span className="text-[11px] font-bold text-prayas-muted uppercase tracking-wider block">
                        Recent Supporters
                      </span>
                      {project.donations.map((d: any) => (
                        <div key={d.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                          <span className="text-slate-800 font-medium truncate">{d.donorName}</span>
                          <span className="text-emerald-800 font-bold shrink-0">₹{d.amount.toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            )}

            {/* Volunteer Participation Card */}
            <ScrollReveal delay={100}>
              <div className="border border-prayas-rule bg-white rounded-2xl p-6 shadow-card space-y-3.5">
                <h3 className="font-serif text-base font-bold text-prayas-ink flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-600" />
                  <span>Participate on the Ground</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Join Prayas Pariwaar as an on-ground volunteer in Mathura & Vrindavan to support our community initiatives.
                </p>
                <Link
                  href="/volunteer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:underline pt-1"
                >
                  <span>Submit Volunteer Application</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </ScrollReveal>

            {/* Helpline / Contact Card */}
            <ScrollReveal delay={200}>
              <div className="border border-prayas-rule bg-white rounded-2xl p-6 shadow-card space-y-3.5">
                <h3 className="font-serif text-base font-bold text-prayas-ink">
                  Questions About This Program?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Contact our field coordination office directly for any queries about this program or partnership.
                </p>
                <div className="text-xs text-slate-700 space-y-1.5 font-mono bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <p>📞 +91 99270 81650</p>
                  <p>✉️ av.prayas@gmail.com</p>
                </div>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:underline pt-1"
                >
                  <span>Send an Inquiry</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </ScrollReveal>

            {/* Institutional Trust Badge */}
            <div className="p-4 rounded-2xl bg-[#1C2421] text-white space-y-2 shadow-card text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>18-Year Registered Society</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Prayas Pariwaar (Reg. 142/2006-07) ensures 100% of public donations directly fund on-ground child welfare and community relief.
              </p>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* OTHER PROGRAMS CROSS-SELL                                        */}
        {/* ================================================================ */}
        {otherProjects.length > 0 && (
          <ScrollReveal>
            <section className="border-t border-prayas-rule pt-10 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-prayas-ink">
                    Explore Other Prayas Programs
                  </h2>
                  <p className="text-xs text-slate-500">
                    Discover our other grassroots initiatives across Braj region.
                  </p>
                </div>
                <Link
                  href="/projects"
                  className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1"
                >
                  <span>View All Programs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {otherProjects.map((p) => {
                  const pPercent = p.goalAmount > 0
                    ? Math.min(Math.round((p.raisedAmount / p.goalAmount) * 100), 100)
                    : 0;
                  const pStyle = categoryColorMap[p.category] || categoryColorMap.OTHER;

                  return (
                    <Link
                      key={p.id}
                      href={`/projects/${p.slug}`}
                      className="border border-prayas-rule bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-lg transition-all group block"
                    >
                      {p.coverImage && (
                        <div className="aspect-[16/10] bg-slate-100 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.coverImage}
                            alt={p.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="p-5 space-y-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${pStyle.bg} ${pStyle.text} ${pStyle.border} border`}>
                          {p.category}
                        </span>
                        <h3 className="font-serif text-sm font-bold text-prayas-ink group-hover:text-emerald-800 transition-colors leading-snug line-clamp-2">
                          {p.title}
                        </h3>
                        {p.goalAmount > 0 && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                              <span>₹{p.raisedAmount.toLocaleString("en-IN")} raised</span>
                              <span>{pPercent}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                              <div
                                className="h-full bg-[#1E5338] rounded-full"
                                style={{ width: `${pPercent}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}
