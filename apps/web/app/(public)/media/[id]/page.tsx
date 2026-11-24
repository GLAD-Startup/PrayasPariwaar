import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  Calendar,
  Newspaper,
  Tv,
  ExternalLink,
  ShieldCheck,
  Heart,
  UserPlus,
  ArrowRight,
  BookOpen,
} from "lucide-react";
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
import {
  parseMediaImages,
  extractYouTubeId,
  getYouTubeThumbnail,
  isVideoLink,
  isVideoUrl,
  getVideoEmbedUrl,
} from "@/lib/media";
import MediaArticleClient from "./MediaArticleClient";

export const revalidate = 60;

interface MediaArticlePageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: MediaArticlePageProps): Promise<Metadata> {
  const item = await prisma.mediaCoverage.findUnique({
    where: { id: params.id },
  });

  if (!item) return { title: "Press Coverage Not Found" };

  const parsedImages = parseMediaImages(item.imageUrl);
  const ytId = extractYouTubeId(item.url);
  const primaryThumb =
    parsedImages[0] ||
    (ytId ? getYouTubeThumbnail(ytId, "maxres") : LOGO_URL);

  const cleanTitle = sanitizeMetadataTitle(
    `${item.title} - ${item.source || "Press Coverage"}`,
    "Press Centre"
  );
  const cleanDescription = `Official press coverage reported in ${
    item.source || "regional media"
  } documenting Prayas Pariwaar's grassroots seva in Mathura and Vrindavan.`;

  return {
    title: cleanTitle,
    description: cleanDescription,
    alternates: {
      canonical: `/media/${params.id}`,
    },
    openGraph: {
      title: cleanTitle,
      description: cleanDescription,
      url: `/media/${params.id}`,
      images: [primaryThumb],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: cleanTitle,
      description: cleanDescription,
      images: [primaryThumb],
    },
  };
}

export default async function MediaArticlePage({ params }: MediaArticlePageProps) {
  const item = await prisma.mediaCoverage.findUnique({
    where: { id: params.id },
  });

  if (!item) {
    notFound();
  }

  // Related media items
  const relatedItems = await prisma.mediaCoverage.findMany({
    where: {
      id: { not: item.id },
    },
    take: 3,
    orderBy: [{ publishedDate: "desc" }, { createdAt: "desc" }],
  });

  const parsedImages = parseMediaImages(item.imageUrl);
  const ytId = extractYouTubeId(item.url);
  const isVideo = item.type === "ELECTRONIC" || isVideoLink(item.url);
  const isDirect = isVideoUrl(item.url);
  const videoEmbed = getVideoEmbedUrl(item.url);

  const articleUrl = `${CANONICAL_BASE_URL}/media/${item.id}`;
  const primaryImage =
    parsedImages[0] || (ytId ? getYouTubeThumbnail(ytId, "maxres") : LOGO_URL);

  // JSON-LD NewsArticle Structured Data
  const jsonLdGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        "@id": `${articleUrl}#article`,
        headline: item.title,
        description: `Official press coverage reported in ${item.source || "media"} on Prayas Pariwaar seva.`,
        image: [primaryImage],
        datePublished: item.publishedDate?.toISOString() || item.createdAt.toISOString(),
        dateModified: item.createdAt.toISOString(),
        author: {
          "@type": "Organization",
          name: item.source || "Press Publication",
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
          "@id": articleUrl,
        },
        isPartOf: {
          "@id": WEBSITE_ID,
        },
        inLanguage: "en-IN",
      },
      getBreadcrumbListSchema(
        [
          { name: "Home", path: "/" },
          { name: "Media Centre", path: "/media" },
          { name: item.title, path: `/media/${item.id}` },
        ],
        articleUrl
      ),
    ],
  };

  return (
    <>
      <JsonLd data={jsonLdGraph} />

      <div className="space-y-8 sm:space-y-10 pb-20 max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        {/* Breadcrumb Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/media"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-prayas-muted hover:text-prayas-ink transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Back to All Press Clippings & Media Centre</span>
          </Link>

          <span className="text-[11px] text-prayas-muted font-mono">
            Archive Ref #{item.id.slice(-6).toUpperCase()}
          </span>
        </div>

        {/* 1. JOURNALISTIC ARTICLE MASTHEAD */}
        <header className="border-b border-prayas-rule pb-6 sm:pb-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* Publication Source Badge */}
            <span className="px-3 py-1 rounded-full font-bold text-xs bg-[#2E5339] text-white shadow-xs">
              {item.source || "Regional Press"}
            </span>

            {/* Media Format Badge */}
            {isVideo ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200 flex items-center gap-1">
                <Tv className="w-3.5 h-3.5 text-blue-700" />
                <span>Television Broadcast Report</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1">
                <Newspaper className="w-3.5 h-3.5 text-amber-700" />
                <span>Verified Print Newspaper Clipping</span>
              </span>
            )}

            {/* Published Date */}
            {item.publishedDate && (
              <span className="flex items-center gap-1 text-prayas-muted font-medium ml-auto">
                <Calendar className="w-3.5 h-3.5 text-prayas-neem" />
                <span>
                  {new Date(item.publishedDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </span>
            )}
          </div>

          {/* Big Editorial Headline */}
          <h1 className="font-serif text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold text-prayas-ink leading-[1.2]">
            {item.title}
          </h1>

          <div className="flex items-center gap-3 pt-1 text-xs text-prayas-muted">
            <span className="flex items-center gap-1 font-semibold text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Press Archive</span>
            </span>
            <span>•</span>
            <span>Documented in Mathura & Vrindavan</span>
            {item.url && (
              <>
                <span>•</span>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-amber-800 hover:underline inline-flex items-center gap-1"
                >
                  <span>Original Source Article</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </>
            )}
          </div>
        </header>

        {/* 2. INTERACTIVE MEDIA VIEWER CLIENT (Video Player, Multi-Page Scans, Zoom, Share) */}
        <MediaArticleClient
          images={parsedImages}
          title={item.title}
          source={item.source || "Regional Press"}
          externalUrl={item.url}
          videoEmbedUrl={videoEmbed}
          youtubeId={ytId}
          isDirectVideo={isDirect}
        />

        {/* 3. EDITORIAL BACKGROUND & GRASSROOTS CONTEXT CARD */}
        <section className="p-6 sm:p-8 rounded-3xl bg-prayas-stone/40 border border-prayas-rule space-y-4">
          <div className="flex items-center gap-2 border-b border-prayas-rule pb-3">
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <h2 className="font-serif text-lg font-bold text-prayas-ink">
              About This Press Coverage & Field Seva
            </h2>
          </div>

          <div className="text-xs sm:text-sm text-prayas-ink leading-relaxed space-y-3 font-light">
            <p>
              This report was documented by regional press correspondents in Mathura District, covering on-ground community interventions driven by Prayas Pariwaar’s volunteer network.
            </p>
            <p>
              Since 2006, Prayas Pariwaar has operated with zero administrative deduction—every rupee donated goes directly into child education (Flyover Classrooms & evening study circles), 24/7 emergency blood donation desks, free oxygen concentrator banks, and massive environmental tree-guard drives across the holy Vrindavan Parikrama marg.
            </p>
          </div>
        </section>

        {/* 4. HIGH-CONVERSION SEVA DONATION CTA CARD */}
        <section className="rounded-3xl bg-gradient-to-br from-[#2E5339] to-[#1e3825] text-white p-6 sm:p-10 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                100% Direct Allocation • 80G Tax Exemption
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight">
                Be Part of the Grassroots Transformation
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed font-light">
                Inspired by this report? Support a child's tuition, emergency medical oxygen delivery, or plant a neem tree in Vrindavan today.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/donate"
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg transition-all"
              >
                <Heart className="w-4 h-4 fill-stone-950" />
                <span>Support This Mission</span>
              </Link>
              <Link
                href="/volunteer"
                className="px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-bold flex items-center gap-2 border border-white/20 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Join as Volunteer</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 5. RELATED PRESS REPORTS */}
        {relatedItems.length > 0 && (
          <section className="space-y-4 pt-6">
            <div className="border-b border-prayas-rule pb-3 flex items-center justify-between">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-prayas-ink flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-emerald-700" />
                <span>More News & Press Clippings</span>
              </h2>
              <Link
                href="/media"
                className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
              >
                <span>View Complete Press Archive</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedItems.map((rel) => {
                const relImages = parseMediaImages(rel.imageUrl);
                const relYt = extractYouTubeId(rel.url);
                const relThumb =
                  relImages[0] ||
                  (relYt ? getYouTubeThumbnail(relYt, "hq") : LOGO_URL);

                return (
                  <Link
                    key={rel.id}
                    href={`/media/${rel.id}`}
                    className="p-4 rounded-2xl bg-white border border-prayas-rule hover:border-emerald-600/50 hover:shadow-md transition-all group flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-900 border border-prayas-rule">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={relThumb}
                          alt={rel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 uppercase px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 inline-block">
                        {rel.source || "Press Report"}
                      </span>
                      <h3 className="font-serif text-sm font-bold text-prayas-ink group-hover:text-emerald-800 transition-colors line-clamp-2">
                        {rel.title}
                      </h3>
                    </div>

                    <div className="pt-2 border-t border-prayas-rule flex items-center justify-between text-[11px] text-prayas-muted font-medium">
                      <span>
                        {rel.publishedDate
                          ? new Date(rel.publishedDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Archived Report"}
                      </span>
                      <span className="text-emerald-700 font-bold group-hover:translate-x-0.5 transition-transform">
                        Read →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
