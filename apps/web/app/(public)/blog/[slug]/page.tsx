import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Heart,
  UserPlus,
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Play,
} from "lucide-react";
import EventsSidebar from "@/components/EventsSidebar";
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import {
  CANONICAL_BASE_URL,
  ORGANIZATION_ID,
  WEBSITE_ID,
  LOGO_URL,
  getBreadcrumbListSchema,
  sanitizeMetadataTitle,
} from "@/lib/schema";
import { extractYouTubeId, getVideoEmbedUrl } from "@/lib/media";
import BlogArticleClient from "./BlogArticleClient";

export const revalidate = 60;

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
  });

  if (!post || !post.published) return { title: "Dispatch Not Found" };

  const rawTitle = post.metaTitle || post.title;
  const cleanTitle = sanitizeMetadataTitle(rawTitle, "Field Dispatch");
  const cleanDescription = (post.metaDescription || post.excerpt || post.content.substring(0, 160))
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return {
    title: cleanTitle,
    description: cleanDescription,
    alternates: {
      canonical: `/blog/${params.slug}`,
    },
    openGraph: {
      title: cleanTitle,
      description: cleanDescription,
      url: `/blog/${params.slug}`,
      ...(post.coverImage ? { images: [post.coverImage] } : {}),
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: cleanTitle,
      description: cleanDescription,
      ...(post.coverImage ? { images: [post.coverImage] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: {
      images: { orderBy: { order: "asc" } },
      author: { select: { name: true, role: true } },
    },
  });

  if (!post || !post.published) {
    notFound();
  }

  // Fetch adjacent posts for seamless reading flow
  const [prevPost, nextPost] = await Promise.all([
    prisma.post.findFirst({
      where: { published: true, createdAt: { lt: post.createdAt } },
      orderBy: { createdAt: "desc" },
      select: { title: true, slug: true },
    }),
    prisma.post.findFirst({
      where: { published: true, createdAt: { gt: post.createdAt } },
      orderBy: { createdAt: "asc" },
      select: { title: true, slug: true },
    }),
  ]);

  const postUrl = `${CANONICAL_BASE_URL}/blog/${post.slug}`;
  const readTime = Math.max(1, Math.ceil(post.content.split(/\s+/).length / 200));

  // Check if there is an embedded video link in content
  const videoMatch = post.content.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  const embeddedYoutubeId = videoMatch ? videoMatch[1] : null;

  // JSON-LD BlogPosting & Breadcrumbs structured data
  const jsonLdGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${postUrl}#article`,
        headline: post.title,
        description: post.metaDescription || post.excerpt || post.content.substring(0, 160),
        image: post.coverImage ? [post.coverImage] : [LOGO_URL],
        datePublished: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
        dateModified: post.updatedAt.toISOString(),
        author: post.author?.name
          ? {
              "@type": "Person",
              name: post.author.name,
            }
          : {
              "@type": "Organization",
              "@id": ORGANIZATION_ID,
              name: "Prayas Pariwaar",
            },
        publisher: {
          "@type": "Organization",
          "@id": ORGANIZATION_ID,
          name: "Prayas Pariwaar",
          logo: {
            "@type": "ImageObject",
            url: LOGO_URL,
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": postUrl,
        },
        isPartOf: {
          "@id": WEBSITE_ID,
        },
        inLanguage: "en-IN",
      },
      getBreadcrumbListSchema(
        [
          { name: "Home", path: "/" },
          { name: "Field Journal", path: "/blog" },
          { name: sanitizeMetadataTitle(post.title, "Field Dispatch"), path: `/blog/${post.slug}` },
        ],
        postUrl
      ),
    ],
  };

  return (
    <>
      <JsonLd data={jsonLdGraph} />

      <div className="space-y-8 sm:space-y-10 pb-20 max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        {/* Breadcrumb Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-prayas-muted hover:text-prayas-ink transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Back to All Dispatches & News</span>
          </Link>

          <span className="text-[11px] text-prayas-muted font-medium">
            ⏱ {readTime} min read
          </span>
        </div>

        {/* 2-Column Grid: Left Article (8 cols) + Right Events Sidebar (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Article Content */}
          <article className="lg:col-span-8 space-y-8">
            {/* Masthead */}
            <header className="space-y-4 border-b border-prayas-rule pb-6 sm:pb-8">
              <div className="flex flex-wrap items-center gap-2.5 text-xs text-prayas-muted">
                <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold uppercase text-[10px]">
                  {post.type}
                </span>

                <span className="flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-prayas-neem" />
                  {new Date(post.eventDate || post.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
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

                {post.author && (
                  <span className="font-medium text-prayas-ink">
                    • Reported by: {post.author.name}
                  </span>
                )}
              </div>

              {/* Big Focused Headline */}
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-prayas-ink leading-[1.18]">
                {post.title}
              </h1>

              {/* Editorial Lead Summary / Pull Quote */}
              {post.excerpt && (
                <div className="p-4 sm:p-5 rounded-2xl bg-prayas-stone/40 border-l-4 border-prayas-neem border-y border-r border-prayas-rule">
                  <p className="text-base sm:text-lg text-prayas-ink leading-relaxed font-serif italic">
                    "{post.excerpt}"
                  </p>
                </div>
              )}
            </header>

            {/* Cover Photo */}
            {post.coverImage && (
              <div className="aspect-[16/10] rounded-3xl bg-prayas-stone overflow-hidden border border-prayas-rule shadow-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* EMBEDDED VIDEO PLAYER (If video found in dispatch) */}
            {embeddedYoutubeId && (
              <div className="rounded-3xl overflow-hidden border border-prayas-rule bg-black shadow-xl aspect-video">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${embeddedYoutubeId}?rel=0`}
                  title={post.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* Article Body with High-Focus Typography */}
            <div className="border-b border-prayas-rule pb-10">
              <div className="text-base sm:text-lg text-prayas-ink leading-[1.8] space-y-6 whitespace-pre-line font-serif font-light selection:bg-emerald-100 selection:text-emerald-950">
                {post.content}
              </div>
            </div>

            {/* Client Components: Floating Share Bar + Multi-Photo Lightbox Gallery */}
            <BlogArticleClient
              title={post.title}
              images={post.images.map((img) => ({
                id: img.id,
                url: img.url,
                caption: img.caption,
              }))}
            />

            {/* HIGH-CONVERSION SEVA CONVERSION BANNER */}
            <section className="rounded-3xl bg-gradient-to-br from-[#2E5339] to-[#1e3825] text-white p-6 sm:p-8 shadow-xl space-y-4">
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                  Grassroots Impact in Vrindavan • 80G Tax Exemption
                </span>
                <h3 className="font-serif text-2xl font-bold text-white">
                  Support Our On-Ground Volunteers
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed font-light">
                  100% of your contribution reaches directly to children's education, elderly medical oxygen, or village healthcare in Mathura district.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/donate"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
                >
                  <Heart className="w-4 h-4 fill-stone-950" />
                  <span>Donate to This Cause</span>
                </Link>
                <Link
                  href="/volunteer"
                  className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-2 border border-white/20 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Volunteer With Us</span>
                </Link>
              </div>
            </section>

            {/* Adjacent Articles Navigation */}
            {(prevPost || nextPost) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-prayas-rule">
                {prevPost ? (
                  <Link
                    href={`/blog/${prevPost.slug}`}
                    className="p-4 rounded-2xl bg-white border border-prayas-rule hover:border-emerald-600/50 hover:shadow-sm transition-all group flex flex-col justify-between"
                  >
                    <span className="text-[11px] text-prayas-muted font-semibold flex items-center gap-1">
                      <ChevronLeft className="w-3.5 h-3.5" /> Previous Dispatch
                    </span>
                    <strong className="font-serif text-sm font-bold text-prayas-ink group-hover:text-emerald-800 transition-colors line-clamp-2 mt-1">
                      {prevPost.title}
                    </strong>
                  </Link>
                ) : <div />}

                {nextPost ? (
                  <Link
                    href={`/blog/${nextPost.slug}`}
                    className="p-4 rounded-2xl bg-white border border-prayas-rule hover:border-emerald-600/50 hover:shadow-sm transition-all group flex flex-col justify-between text-right"
                  >
                    <span className="text-[11px] text-prayas-muted font-semibold flex items-center justify-end gap-1">
                      Next Dispatch <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                    <strong className="font-serif text-sm font-bold text-prayas-ink group-hover:text-emerald-800 transition-colors line-clamp-2 mt-1">
                      {nextPost.title}
                    </strong>
                  </Link>
                ) : <div />}
              </div>
            )}
          </article>

          {/* Right: Events Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <EventsSidebar currentPostId={post.id} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
