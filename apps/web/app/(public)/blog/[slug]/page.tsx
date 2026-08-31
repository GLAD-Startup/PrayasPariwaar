import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Calendar, MapPin, Share2 } from "lucide-react";
import type { Metadata } from "next";

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

  if (!post) return { title: "Dispatch Not Found" };

  return {
    title: `${post.title} | Prayas Pariwaar`,
    description: post.metaDescription || post.excerpt || post.content.substring(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160),
      images: post.coverImage ? [post.coverImage] : [],
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

  if (!post) {
    notFound();
  }

  // JSON-LD Article structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.excerpt || post.content.substring(0, 160),
    image: post.coverImage ? [post.coverImage] : [],
    datePublished: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: post.author?.name || "Prayas Pariwaar Field Desk",
    },
    publisher: {
      "@type": "Organization",
      name: "Prayas Pariwaar",
      url: "https://prayaspariwaar.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="space-y-10 pb-20 max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        {/* Breadcrumb Back Link */}
        <div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-prayas-muted hover:text-prayas-ink"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to All Dispatches
          </Link>
        </div>

        {/* Article Masthead */}
        <header className="space-y-4 border-b border-prayas-rule pb-6">
          <div className="flex flex-wrap items-center gap-3 text-xs text-prayas-muted">
            <span className="px-2.5 py-0.5 rounded bg-prayas-stone border border-prayas-rule font-bold text-prayas-ink uppercase">
              {post.type}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(post.eventDate || post.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            {post.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
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
          <div className="aspect-[16/9] rounded bg-prayas-stone overflow-hidden border border-prayas-rule shadow-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Body (Formatted for reading width < 72ch) */}
        <div className="max-w-[70ch] mx-auto border-b border-prayas-rule pb-10">
          <div className="text-base sm:text-lg text-prayas-ink leading-relaxed space-y-6 whitespace-pre-line font-serif">
            {post.content}
          </div>
        </div>

        {/* Multi-Photo Gallery Preview */}
        {post.images.length > 0 && (
          <section className="space-y-6">
            <div className="border-b border-prayas-rule pb-2">
              <h2 className="font-serif text-xl font-bold text-prayas-ink">
                Photographs from the Field
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {post.images.map((img) => (
                <div
                  key={img.id}
                  className="border border-prayas-rule rounded overflow-hidden bg-white shadow-card space-y-2"
                >
                  <div className="aspect-[4/3] bg-prayas-stone overflow-hidden border-b border-prayas-rule">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.caption || post.title}
                      className="w-full h-full object-cover"
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
          </section>
        )}
      </article>
    </>
  );
}
