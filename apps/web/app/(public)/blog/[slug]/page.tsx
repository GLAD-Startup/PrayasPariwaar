import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Calendar, MapPin, Share2, Camera, Heart } from "lucide-react";
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

  const postUrl = `${CANONICAL_BASE_URL}/blog/${post.slug}`;

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
          { name: sanitizeMetadataTitle(post.title, "Field Dispatch"), path: `/blog/${post.slug}` },
        ],
        postUrl
      ),
    ],
  };

  return (
    <>
      <JsonLd data={jsonLdGraph} />

      <div className="space-y-10 pb-20 max-w-7xl mx-auto px-4 sm:px-6 pt-10">
        {/* Breadcrumb Back Link */}
        <div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-prayas-muted hover:text-prayas-ink transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to All Dispatches & Events
          </Link>
        </div>

        {/* 2-Column Grid: Left Article (8 cols) + Right Events Sidebar (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Article Content */}
          <article className="lg:col-span-8 space-y-8">
            {/* Masthead */}
            <header className="space-y-4 border-b border-prayas-rule pb-6">
              <div className="flex flex-wrap items-center gap-3 text-xs text-prayas-muted">
                <span className="px-2.5 py-0.5 rounded bg-green-50 text-prayas-neem border border-green-200 font-bold uppercase">
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
                {post.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-prayas-muted" />
                    {post.location}
                  </span>
                )}
                {post.author && (
                  <span>• Reported by: {post.author.name}</span>
                )}
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-prayas-ink leading-[1.2]">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="text-base sm:text-lg text-prayas-muted leading-relaxed font-serif italic border-l-2 border-prayas-neem pl-4">
                  {post.excerpt}
                </p>
              )}
            </header>

            {/* Cover Photo */}
            {post.coverImage && (
              <div className="aspect-[16/10] rounded-2xl bg-prayas-stone overflow-hidden border border-prayas-rule shadow-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Article Body */}
            <div className="border-b border-prayas-rule pb-10">
              <div className="text-base sm:text-lg text-prayas-ink leading-relaxed space-y-6 whitespace-pre-line font-serif">
                {post.content}
              </div>
            </div>

            {/* Multi-Photo Field Gallery */}
            {post.images.length > 0 && (
              <section className="space-y-6 pt-4">
                <div className="border-b border-prayas-rule pb-3 flex items-center justify-between">
                  <h2 className="font-serif text-xl font-bold text-prayas-ink flex items-center gap-2">
                    <Camera className="w-5 h-5 text-prayas-neem" />
                    <span>Photographs from the Field</span>
                  </h2>
                  <span className="text-xs text-prayas-muted">
                    {post.images.length} photos
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {post.images.map((img) => (
                    <div
                      key={img.id}
                      className="border border-prayas-rule rounded-xl overflow-hidden bg-prayas-stone shadow-sm"
                    >
                      <div className="aspect-[4/3] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={img.caption || post.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      {img.caption && (
                        <p className="p-3 text-xs text-prayas-muted leading-relaxed border-t border-prayas-rule">
                          {img.caption}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* Right: Events Sidebar (Matching Screenshot) */}
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
