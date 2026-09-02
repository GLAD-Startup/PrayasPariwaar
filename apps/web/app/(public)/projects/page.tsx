import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProjectCategory } from "@prisma/client";
import { Heart, ArrowRight, Images } from "lucide-react";

export const revalidate = 60;

interface ProjectsPageProps {
  searchParams: {
    category?: string;
  };
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const selectedCategory = searchParams.category;

  const where: any = {};
  if (selectedCategory && selectedCategory !== "ALL" && Object.values(ProjectCategory).includes(selectedCategory as any)) {
    where.category = selectedCategory as ProjectCategory;
  }

  const projects = await prisma.project.findMany({
    where,
    include: { images: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  const categories = [
    { label: "All Programs", value: "ALL" },
    { label: "Education", value: ProjectCategory.EDUCATION },
    { label: "Health & Care", value: ProjectCategory.HEALTH },
    { label: "Plantation & Ecology", value: ProjectCategory.PLANTATION },
    { label: "Youth & Awareness", value: ProjectCategory.AWARENESS },
  ];

  return (
    <div className="space-y-8 sm:space-y-12 pb-20 max-w-7xl 2xl:max-w-[1440px] 3xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 pt-6 sm:pt-10">
      {/* Page Header */}
      <div className="border-b border-prayas-rule pb-6 sm:pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-prayas-stone border border-prayas-rule text-xs 2xl:text-sm font-medium text-prayas-ink">
            <span>Direct Field Programs</span>
          </div>
          <h1 className="font-serif text-2xl xs:text-3xl sm:text-4xl 2xl:text-5xl font-bold text-prayas-ink leading-tight">
            Our Work in Vrindavan & Mathura District
          </h1>
          <p className="text-sm sm:text-base 2xl:text-lg text-prayas-muted max-w-2xl 2xl:max-w-3xl leading-relaxed">
            Four specialized program pillars aimed at breaking cycles of poverty, restoring local ecology, and securing emergency healthcare access.
          </p>
        </div>
        <Link
          href="/projects/gallery"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded border border-prayas-rule bg-white text-xs font-semibold text-prayas-ink hover:bg-prayas-subtle transition-colors self-start md:self-auto shadow-subtle"
        >
          <Images className="w-4 h-4 text-prayas-neem" />
          View Full Field Photo Gallery
        </Link>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-prayas-rule pb-4">
        {categories.map((cat) => {
          const isActive = (!selectedCategory && cat.value === "ALL") || selectedCategory === cat.value;
          const href = cat.value === "ALL" ? "/projects" : `/projects?category=${cat.value}`;

          return (
            <Link
              key={cat.value}
              href={href}
              className={`px-3.5 py-1.5 rounded text-xs font-medium transition-colors ${
                isActive
                  ? "bg-prayas-neem text-white font-semibold shadow-subtle"
                  : "bg-white border border-prayas-rule text-prayas-ink hover:bg-prayas-stone"
              }`}
            >
              {cat.label}
            </Link>
          );
        })}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map((project) => {
          const percent = project.goalAmount > 0
            ? Math.min(Math.round((project.raisedAmount / project.goalAmount) * 100), 100)
            : 0;

          return (
            <article
              key={project.id}
              className="border border-prayas-rule bg-white rounded overflow-hidden shadow-card flex flex-col justify-between"
            >
              {project.coverImage && (
                <div className="aspect-[16/9] bg-prayas-stone overflow-hidden border-b border-prayas-rule">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={project.coverImage}
                    alt={project.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}

              <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded bg-prayas-stone border border-prayas-rule text-[11px] font-bold uppercase tracking-wider text-prayas-ink">
                      {project.category}
                    </span>
                    {project.images && project.images.length > 0 && (
                      <span className="text-xs text-prayas-muted">
                        📷 {project.images.length} photos
                      </span>
                    )}
                  </div>

                  <h2 className="font-serif text-xl font-bold text-prayas-ink hover:text-prayas-neem transition-colors">
                    <Link href={`/projects/${project.slug}`}>{project.title}</Link>
                  </h2>

                  <p className="text-xs text-prayas-muted leading-relaxed line-clamp-3">
                    {project.description}
                  </p>
                </div>

                {project.goalAmount > 0 && (
                  <div className="space-y-2 pt-3 border-t border-prayas-rule text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="text-prayas-muted">
                        Raised: <strong>₹{project.raisedAmount.toLocaleString("en-IN")}</strong>
                      </span>
                      <span className="text-prayas-muted">
                        Goal: ₹{project.goalAmount.toLocaleString("en-IN")} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-prayas-stone rounded-full overflow-hidden border border-prayas-rule">
                      <div
                        className="h-full bg-prayas-neem rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-prayas-rule flex items-center justify-between gap-3 text-xs">
                  <Link
                    href={`/projects/${project.slug}`}
                    className="font-semibold text-prayas-ink hover:text-prayas-neem underline"
                  >
                    Read Program Details
                  </Link>
                  <Link
                    href={`/donate?project=${project.slug}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded font-semibold bg-prayas-neem text-white hover:bg-[#23432b] transition-colors"
                  >
                    <Heart className="w-3.5 h-3.5" />
                    Donate
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
