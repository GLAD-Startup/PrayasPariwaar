import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PostType } from "@prisma/client";
import { Calendar, MapPin, ArrowRight } from "lucide-react";

export const revalidate = 60;

interface BlogPageProps {
  searchParams: {
    type?: string;
  };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const selectedType = searchParams.type;

  const where: any = { published: true };
  if (selectedType && selectedType !== "ALL" && Object.values(PostType).includes(selectedType as any)) {
    where.type = selectedType as PostType;
  }

  const posts = await prisma.post.findMany({
    where,
    include: {
      images: { orderBy: { order: "asc" } },
      author: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const types = [
    { label: "All Dispatches", value: "ALL" },
    { label: "Field Events", value: PostType.EVENT },
    { label: "News & Bulletins", value: PostType.NEWS },
    { label: "Milestones & Achievements", value: PostType.ACHIEVEMENT },
    { label: "Announcements", value: PostType.ANNOUNCEMENT },
  ];

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6 pt-10">
      <div className="border-b border-prayas-rule pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-prayas-stone border border-prayas-rule text-xs font-bold text-prayas-neem">
          <span>Journal & Activity Log</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-prayas-ink">
          Field Dispatches & Grassroots Reports
        </h1>
        <p className="text-sm text-prayas-muted max-w-2xl leading-relaxed">
          First-hand reporting and photo records from our volunteer activities across Vrindavan, Mathura, and surrounding rural communities.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-prayas-rule pb-4">
        {types.map((t) => {
          const isActive = (!selectedType && t.value === "ALL") || selectedType === t.value;
          const href = t.value === "ALL" ? "/blog" : `/blog?type=${t.value}`;

          return (
            <Link
              key={t.value}
              href={href}
              className={`px-3.5 py-1.5 rounded text-xs font-medium transition-colors ${
                isActive
                  ? "bg-prayas-neem text-white font-semibold shadow-subtle"
                  : "bg-white border border-prayas-rule text-prayas-ink hover:bg-prayas-stone"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* Dispatches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
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
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            )}

            <div className="p-6 space-y-3 flex-grow flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-prayas-muted">
                  <span className="px-2 py-0.5 rounded bg-prayas-stone border border-prayas-rule font-bold text-prayas-ink text-[10px] uppercase">
                    {post.type}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(post.eventDate || post.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <h2 className="font-serif text-lg font-bold text-prayas-ink hover:text-prayas-neem transition-colors leading-snug">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>

                <p className="text-xs text-prayas-muted leading-relaxed line-clamp-3">
                  {post.excerpt || post.content.substring(0, 140) + "..."}
                </p>
              </div>

              <div className="pt-3 border-t border-prayas-rule flex items-center justify-between text-xs">
                <Link
                  href={`/blog/${post.slug}`}
                  className="font-semibold text-prayas-neem hover:underline"
                >
                  Read full dispatch
                </Link>
                {post.location && (
                  <span className="text-[11px] text-prayas-muted truncate max-w-[140px]">
                    📍 {post.location}
                  </span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
