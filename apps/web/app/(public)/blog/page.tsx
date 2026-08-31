import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PostType } from "@prisma/client";
import { Calendar, MapPin, ArrowRight, Image as ImageIcon } from "lucide-react";
import EventsSidebar from "@/components/EventsSidebar";

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
    <div className="space-y-8 sm:space-y-10 pb-20 max-w-7xl 2xl:max-w-[1440px] 3xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 pt-6 sm:pt-10">
      {/* Header */}
      <div className="border-b border-prayas-rule pb-6 sm:pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-prayas-stone border border-prayas-rule text-xs 2xl:text-sm font-bold text-prayas-neem">
          <span>Journal & Activity Log</span>
        </div>
        <h1 className="font-serif text-2xl xs:text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl font-bold text-prayas-ink leading-tight">
          Field Dispatches & Grassroots Reports
        </h1>
        <p className="text-sm sm:text-base 2xl:text-lg text-prayas-muted max-w-3xl 2xl:max-w-4xl leading-relaxed">
          First-hand reporting, event write-ups, and photo documentation from our volunteer activities across Vrindavan, Mathura, and surrounding rural communities.
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
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-[#2E5339] text-white shadow-sm"
                  : "bg-white border border-prayas-rule text-prayas-ink hover:bg-prayas-stone"
              }`}
              style={isActive ? { backgroundColor: "#2E5339", color: "#ffffff" } : {}}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* Main Grid: Left Posts Feed (8 cols) + Right Events Sidebar (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Posts Feed */}
        <div className="lg:col-span-8 space-y-8">
          {posts.length === 0 ? (
            <div className="p-12 text-center text-prayas-muted bg-white border border-prayas-rule rounded-2xl">
              No dispatches found in this category.
            </div>
          ) : (
            posts.map((post) => (
              <article
                key={post.id}
                className="border border-prayas-rule bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-lg transition-all flex flex-col md:flex-row group"
              >
                {post.coverImage && (
                  <div className="md:w-5/12 aspect-[16/10] md:aspect-auto bg-prayas-stone overflow-hidden border-b md:border-b-0 md:border-r border-prayas-rule relative shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold uppercase backdrop-blur-sm">
                      {post.type}
                    </span>
                  </div>
                )}

                <div className="p-6 md:p-7 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-prayas-muted">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-prayas-neem" />
                        {post.eventDate
                          ? new Date(post.eventDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : new Date(post.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                      </span>

                      {post.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-prayas-muted" />
                          {post.location}
                        </span>
                      )}

                      {post.images && post.images.length > 0 && (
                        <span className="text-prayas-neem font-semibold">
                          📷 {post.images.length} photos
                        </span>
                      )}
                    </div>

                    <h2 className="font-serif text-lg sm:text-xl font-bold text-prayas-ink group-hover:text-prayas-neem transition-colors leading-snug">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>

                    <p className="text-xs sm:text-sm text-prayas-muted leading-relaxed line-clamp-3 font-light">
                      {post.excerpt || post.content.substring(0, 150) + "..."}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-prayas-rule flex items-center justify-between">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#B45309] hover:underline"
                    >
                      <span>Read Full Report</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Right: Events & Recent Activity Sidebar (Matching Screenshot) */}
        <div className="lg:col-span-4">
          <div className="sticky top-24">
            <EventsSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
