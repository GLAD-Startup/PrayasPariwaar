import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Heart, Calendar, Users, CheckCircle2 } from "lucide-react";
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
    title: `${project.title} | Prayas Pariwaar`,
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

  const percent = project.goalAmount > 0
    ? Math.min(Math.round((project.raisedAmount / project.goalAmount) * 100), 100)
    : 0;

  return (
    <div className="space-y-12 pb-20 max-w-5xl mx-auto px-4 sm:px-6 pt-10">
      {/* Top Breadcrumb Back Link */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-prayas-muted hover:text-prayas-ink"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to All Programs
        </Link>
      </div>

      {/* Program Header */}
      <div className="border-b border-prayas-rule pb-8 space-y-4">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded bg-prayas-stone border border-prayas-rule text-xs font-bold uppercase tracking-wider text-prayas-ink">
            {project.category}
          </span>
          <span className="text-xs font-medium text-prayas-neem">
            ● Active Grassroots Program
          </span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-prayas-ink">
          {project.title}
        </h1>
      </div>

      {/* Main Cover Image */}
      {project.coverImage && (
        <div className="aspect-[16/9] rounded bg-prayas-stone overflow-hidden border border-prayas-rule shadow-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.coverImage}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Program Content & Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Narrative & Photo Gallery */}
        <div className="lg:col-span-8 space-y-8">
          <div className="border border-prayas-rule bg-white rounded p-6 sm:p-8 shadow-card space-y-4">
            <h2 className="font-serif text-2xl font-bold text-prayas-ink border-b border-prayas-rule pb-3">
              Program Scope & Purpose
            </h2>
            <div className="text-sm sm:text-base text-prayas-ink leading-relaxed space-y-4 whitespace-pre-line">
              {project.description}
            </div>
          </div>

          {/* Gallery of Field Photos */}
          {project.images.length > 0 && (
            <div className="border border-prayas-rule bg-white rounded p-6 sm:p-8 shadow-card space-y-6">
              <div className="border-b border-prayas-rule pb-3">
                <h3 className="font-serif text-xl font-bold text-prayas-ink">
                  Field Documentation & Photographic Record
                </h3>
                <p className="text-xs text-prayas-muted">
                  Photographs from our recent field operations in Mathura and Vrindavan.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.images.map((img) => (
                  <div
                    key={img.id}
                    className="border border-prayas-rule rounded overflow-hidden bg-prayas-stone space-y-2"
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.caption || project.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    {img.caption && (
                      <p className="p-3 text-xs text-prayas-muted leading-relaxed">
                        {img.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Fundraising Tracker & Direct Actions */}
        <div className="lg:col-span-4 space-y-6">
          {project.goalAmount > 0 && (
            <div className="border border-prayas-rule bg-white rounded p-6 shadow-card space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-prayas-muted">
                Transparent Community Fund
              </span>

              <div className="space-y-1">
                <p className="font-serif text-3xl font-bold text-prayas-ink">
                  ₹{project.raisedAmount.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-prayas-muted">
                  raised of ₹{project.goalAmount.toLocaleString("en-IN")} goal ({percent}%)
                </p>
              </div>

              <div className="w-full h-2.5 bg-prayas-stone rounded-full overflow-hidden border border-prayas-rule">
                <div
                  className="h-full bg-prayas-neem rounded-full"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="pt-2">
                <Link
                  href={`/donate?project=${project.slug}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded text-sm font-semibold bg-prayas-neem text-white hover:bg-[#23432b] transition-colors shadow-subtle"
                >
                  <Heart className="w-4 h-4" />
                  Contribute to This Cause
                </Link>
                <p className="text-[11px] text-prayas-muted text-center mt-2">
                  50% tax exemption under Section 80G. Instant receipt.
                </p>
              </div>
            </div>
          )}

          {/* Volunteer CTA */}
          <div className="border border-prayas-rule bg-prayas-stone rounded p-6 shadow-card space-y-3">
            <h3 className="font-serif text-base font-bold text-prayas-ink">
              Participate on the Ground
            </h3>
            <p className="text-xs text-prayas-muted leading-relaxed">
              We welcome doctors, teachers, students, and local residents to join this program as weekend volunteers.
            </p>
            <Link
              href="/volunteer"
              className="inline-block text-xs font-bold text-prayas-neem hover:underline"
            >
              Submit Volunteer Application →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
