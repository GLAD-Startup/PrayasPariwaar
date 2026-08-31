import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ScrollReveal from "@/components/ScrollReveal";
import {
  ArrowLeft,
  Heart,
  Calendar,
  Users,
  CheckCircle2,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Camera,
  ExternalLink,
} from "lucide-react";
import type { Metadata } from "next";

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

  return {
    title: project.metaTitle || `${project.title} | Prayas Pariwaar`,
    description: project.metaDescription || project.description.substring(0, 160),
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
    EDUCATION: { bg: "bg-green-50", text: "text-emerald-900", border: "border-green-200" },
    HEALTH: { bg: "bg-red-50", text: "text-red-900", border: "border-red-200" },
    PLANTATION: { bg: "bg-green-50", text: "text-green-900", border: "border-green-200" },
    AWARENESS: { bg: "bg-amber-50", text: "text-amber-900", border: "border-amber-200" },
    OTHER: { bg: "bg-prayas-stone", text: "text-prayas-ink", border: "border-prayas-rule" },
  };

  const catStyle = categoryColorMap[project.category] || categoryColorMap.OTHER;

  return (
    <div className="pb-20">
      {/* ====================================================================== */}
      {/* HERO BANNER with Cover Image Background                               */}
      {/* ====================================================================== */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-14 lg:pb-24">
        {project.coverImage && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.coverImage}
              alt={project.title}
              className="absolute inset-0 w-full h-full object-cover object-center z-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-black/40 z-0" />
          </>
        )}

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
          {/* Back link */}
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Programs</span>
          </Link>

          {/* Category & Status */}
          <div className="flex flex-wrap items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${catStyle.bg} ${catStyle.text} ${catStyle.border} border`}>
              {project.category}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Active Grassroots Program
            </span>
          </div>

          {/* Title */}
          <h1 className={`font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.15] ${project.coverImage ? "text-white drop-shadow-lg" : "text-prayas-ink"}`}>
            {project.title}
          </h1>

          {/* Quick stats strip */}
          <div className="flex flex-wrap gap-4 sm:gap-6 text-xs">
            {project.goalAmount > 0 && (
              <span className={`flex items-center gap-1.5 font-medium ${project.coverImage ? "text-white/90" : "text-prayas-muted"}`}>
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-current" />
                ₹{project.raisedAmount.toLocaleString("en-IN")} raised of ₹{project.goalAmount.toLocaleString("en-IN")}
              </span>
            )}
            <span className={`flex items-center gap-1.5 font-medium ${project.coverImage ? "text-white/90" : "text-prayas-muted"}`}>
              <MapPin className="w-3.5 h-3.5" />
              Vrindavan & Mathura District, UP
            </span>
            <span className={`flex items-center gap-1.5 font-medium ${project.coverImage ? "text-white/90" : "text-prayas-muted"}`}>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              80G Tax Exempt Donations
            </span>
          </div>
        </div>
      </section>

      {/* ====================================================================== */}
      {/* MAIN CONTENT GRID                                                     */}
      {/* ====================================================================== */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-10 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Narrative & Photos */}
          <div className="lg:col-span-8 space-y-8">
            {/* Program Description */}
            <ScrollReveal>
              <div className="border border-prayas-rule bg-white rounded-xl p-6 sm:p-8 shadow-card space-y-4">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-prayas-ink border-b border-prayas-rule pb-3">
                  Program Scope & Purpose
                </h2>
                <div className="text-sm sm:text-base text-prayas-ink leading-relaxed space-y-4 whitespace-pre-line font-light">
                  {project.description}
                </div>
              </div>
            </ScrollReveal>

            {/* Photo Gallery */}
            {project.images.length > 0 && (
              <ScrollReveal>
                <div className="border border-prayas-rule bg-white rounded-xl p-6 sm:p-8 shadow-card space-y-6">
                  <div className="border-b border-prayas-rule pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-prayas-ink flex items-center gap-2">
                        <Camera className="w-5 h-5 text-prayas-neem" />
                        <span>Field Photography & Documentation</span>
                      </h3>
                      <p className="text-xs text-prayas-muted mt-0.5">
                        {project.images.length} verified field photographs from Mathura & Vrindavan operations.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {project.images.map((img) => (
                      <div
                        key={img.id}
                        className="gallery-item border border-prayas-rule overflow-hidden bg-prayas-stone"
                      >
                        <div className="aspect-[4/3] overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.url}
                            alt={img.caption || project.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        {img.caption && (
                          <div className="gallery-caption">
                            <p className="text-[11px] sm:text-xs font-medium leading-snug">
                              {img.caption}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Related Field Dispatches */}
            {relatedPosts.length > 0 && (
              <ScrollReveal>
                <div className="border border-prayas-rule bg-white rounded-xl p-6 sm:p-8 shadow-card space-y-4">
                  <h3 className="font-serif text-lg font-bold text-prayas-ink border-b border-prayas-rule pb-3">
                    Related Field Dispatches & Event Reports
                  </h3>
                  <div className="space-y-4">
                    {relatedPosts.map((post) => (
                      <Link
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        className="block p-4 rounded-lg border border-prayas-rule hover:bg-prayas-paper transition-colors group"
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
                        <h4 className="font-serif text-sm font-bold text-prayas-ink group-hover:text-prayas-neem transition-colors">
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

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Fundraising Card */}
            {project.goalAmount > 0 && (
              <ScrollReveal>
                <div className="border border-prayas-rule bg-white rounded-xl p-6 shadow-card space-y-5 sticky top-24">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-prayas-neem">
                      Transparent Community Fund
                    </span>
                    <p className="font-serif text-3xl font-bold text-prayas-ink">
                      ₹{project.raisedAmount.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-prayas-muted">
                      raised of ₹{project.goalAmount.toLocaleString("en-IN")} goal
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-prayas-neem">{percent}% funded</span>
                      <span className="text-prayas-muted">
                        ₹{(project.goalAmount - project.raisedAmount).toLocaleString("en-IN")} remaining
                      </span>
                    </div>
                    <div className="w-full h-3 bg-prayas-stone rounded-full overflow-hidden border border-prayas-rule">
                      <div
                        className="h-full bg-prayas-neem rounded-full transition-all duration-700"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    href={`/donate?project=${project.slug}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg text-sm font-bold bg-[#2E5339] text-white hover:bg-[#23432b] transition-all shadow-md"
                    style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
                  >
                    <Heart className="w-4 h-4 fill-white text-white" />
                    <span>Contribute to This Cause</span>
                  </Link>

                  <div className="flex items-center gap-2 text-[11px] text-prayas-muted">
                    <ShieldCheck className="w-3.5 h-3.5 text-prayas-neem shrink-0" />
                    <span>50% tax deduction under Section 80G. Instant receipt.</span>
                  </div>

                  {/* Recent Donors */}
                  {project.donations.length > 0 && (
                    <div className="border-t border-prayas-rule pt-3 space-y-2">
                      <span className="text-[11px] font-bold text-prayas-muted uppercase">Recent Supporters</span>
                      {project.donations.map((d: any) => (
                        <div key={d.id} className="flex items-center justify-between text-xs">
                          <span className="text-prayas-ink font-medium truncate">{d.donorName}</span>
                          <span className="text-prayas-neem font-bold shrink-0">₹{d.amount.toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            )}

            {/* Volunteer Card */}
            <ScrollReveal delay={100}>
              <div className="border border-prayas-rule bg-prayas-paper rounded-xl p-6 shadow-card space-y-3">
                <h3 className="font-serif text-base font-bold text-prayas-ink flex items-center gap-2">
                  <Users className="w-5 h-5 text-prayas-marigold" />
                  <span>Participate on the Ground</span>
                </h3>
                <p className="text-xs text-prayas-muted leading-relaxed">
                  We welcome doctors, teachers, students, and local residents to join this program as weekend volunteers in Vrindavan.
                </p>
                <Link
                  href="/volunteer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-prayas-neem hover:underline"
                >
                  <span>Submit Volunteer Application</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </ScrollReveal>

            {/* Contact Card */}
            <ScrollReveal delay={200}>
              <div className="border border-prayas-rule bg-white rounded-xl p-6 shadow-card space-y-3">
                <h3 className="font-serif text-base font-bold text-prayas-ink">
                  Questions About This Program?
                </h3>
                <p className="text-xs text-prayas-muted leading-relaxed">
                  Contact our field coordination office directly for any queries about this program.
                </p>
                <div className="text-xs text-prayas-ink space-y-1 font-mono">
                  <p>📞 +91 94122 79000</p>
                  <p>✉️ info@prayaspariwaar.com</p>
                </div>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1 text-xs font-bold text-prayas-neem hover:underline"
                >
                  <span>Send an Inquiry</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* ================================================================ */}
        {/* OTHER PROGRAMS CROSS-SELL                                        */}
        {/* ================================================================ */}
        {otherProjects.length > 0 && (
          <ScrollReveal>
            <section className="border-t border-prayas-rule pt-10 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-prayas-ink">
                  Explore Other Prayas Programs
                </h2>
                <Link
                  href="/projects"
                  className="text-xs font-semibold text-prayas-neem hover:underline flex items-center gap-1"
                >
                  <span>View All</span>
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
                      className="border border-prayas-rule bg-white rounded-xl overflow-hidden shadow-card hover:shadow-lg transition-all group block"
                    >
                      {p.coverImage && (
                        <div className="aspect-[16/10] bg-prayas-stone overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.coverImage}
                            alt={p.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="p-4 space-y-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${pStyle.bg} ${pStyle.text} ${pStyle.border} border`}>
                          {p.category}
                        </span>
                        <h3 className="font-serif text-sm font-bold text-prayas-ink group-hover:text-prayas-neem transition-colors leading-snug">
                          {p.title}
                        </h3>
                        {p.goalAmount > 0 && (
                          <div className="w-full h-1.5 bg-prayas-stone rounded-full overflow-hidden border border-prayas-rule">
                            <div
                              className="h-full bg-prayas-neem rounded-full"
                              style={{ width: `${pPercent}%` }}
                            />
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
