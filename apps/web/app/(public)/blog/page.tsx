import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PostType } from "@prisma/client";
import {
  Calendar,
  MapPin,
  ArrowRight,
  Clock,
  Camera,
  Sparkles,
  Newspaper,
  BookOpen,
} from "lucide-react";
import EventsSidebar from "@/components/EventsSidebar";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "News, Dispatches & Community Seva Journal | Prayas Pariwaar",
  description:
    "Verified on-ground dispatches, community news bulletins, seva milestones, and upcoming drives from Prayas Pariwaar across Mathura and Vrindavan.",
  alternates: {
    canonical: "/blog",
  },
};

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
    { label: "All News & Dispatches", value: "ALL" },
    { label: "📰 News & Bulletins", value: PostType.NEWS },
    { label: "🌿 Scheduled Seva Drives", value: PostType.EVENT },
    { label: "🏆 Seva Milestones", value: PostType.ACHIEVEMENT },
    { label: "📢 Official Announcements", value: PostType.ANNOUNCEMENT },
  ];

  const featuredPost = posts.length > 0 && !selectedType ? posts[0] : null;
  const feedPosts = featuredPost ? posts.slice(1) : posts;

  return (
    <div className="space-y-8 sm:space-y-10 pb-20 max-w-7xl 2xl:max-w-[1440px] 3xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 pt-6 sm:pt-10">
      {/* Header */}
      <div className="border-b border-prayas-rule pb-6 sm:pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-prayas-stone border border-prayas-rule text-xs 2xl:text-sm font-bold text-prayas-neem">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Field Journal • Grassroots Seva Documentation</span>
        </div>
        <h1 className="font-serif text-2xl xs:text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl font-bold text-prayas-ink leading-tight">
          News, Dispatches & Seva Updates
        </h1>
        <p className="text-sm sm:text-base 2xl:text-lg text-prayas-muted max-w-3xl 2xl:max-w-4xl leading-relaxed">
          Ground reports, community bulletins, milestone achievements, and scheduled upcoming drives from Prayas Pariwaar across Mathura, Vrindavan, and Braj region.
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

      {/* 1. TOP FEATURED NEWS STORY HERO (When on "All") */}
      {featuredPost && (
        <div className="rounded-3xl border border-prayas-rule bg-white overflow-hidden shadow-card hover:shadow-xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 group">
          {featuredPost.coverImage && (
            <div className="lg:col-span-7 relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto lg:h-full min-h-[280px] bg-prayas-stone overflow-hidden border-b lg:border-b-0 lg:border-r border-prayas-rule">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featuredPost.coverImage}
                alt={featuredPost.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#2E5339] text-white shadow-md flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Featured Field Dispatch</span>
              </span>
            </div>
          )}

          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5 text-xs text-prayas-muted">
                <span className="font-bold uppercase text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                  {featuredPost.type}
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-prayas-neem" />
                  {new Date(featuredPost.eventDate || featuredPost.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {Math.max(1, Math.ceil(featuredPost.content.split(/\s+/).length / 200))} min read
                </span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink group-hover:text-prayas-neem transition-colors leading-tight">
                <Link href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
              </h2>

              <p className="text-xs sm:text-sm text-prayas-muted leading-relaxed line-clamp-3 font-light">
                {featuredPost.excerpt || featuredPost.content.substring(0, 180) + "..."}
              </p>
            </div>

            <div className="pt-4 border-t border-prayas-rule flex items-center justify-between">
              <span className="text-xs text-prayas-muted">
                {featuredPost.author?.name ? `Reported by ${featuredPost.author.name}` : "Prayas Pariwaar Seva Desk"}
              </span>
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="px-4 py-2 rounded-xl bg-[#2E5339] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-[#23432b] transition-all"
                style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
              >
                <span>Read Story</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Left Posts Feed (8 cols) + Right Events Sidebar (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Posts Feed */}
        <div className="lg:col-span-8 space-y-8">
          {feedPosts.length === 0 ? (
            <div className="p-12 text-center text-prayas-muted bg-white border border-prayas-rule rounded-2xl">
              No news or dispatches found in this category.
            </div>
          ) : (
            feedPosts.map((post) => {
              const readTime = Math.max(1, Math.ceil(post.content.split(/\s+/).length / 200));

              return (
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
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded bg-black/75 text-white text-[10px] font-bold uppercase backdrop-blur-sm">
                        {post.type === "EVENT" ? "SCHEDULED EVENT" : post.type}
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

                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {readTime} min read
                        </span>

                        {post.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-prayas-muted" />
                            {post.location}
                          </span>
                        )}

                        {post.images && post.images.length > 0 && (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <Camera className="w-3.5 h-3.5" />
                            {post.images.length} photos
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
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E5339] group-hover:underline"
                      >
                        <span>Read Full Dispatch</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </Link>

                      {post.author && (
                        <span className="text-[11px] text-prayas-muted font-medium">
                          By {post.author.name}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Right: Events Sidebar */}
        <div className="lg:col-span-4">
          <div className="sticky top-24">
            <EventsSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
