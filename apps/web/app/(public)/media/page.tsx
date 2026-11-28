import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MediaType } from "@prisma/client";
import { Newspaper, Tv, Layers } from "lucide-react";
import MediaListClient from "./MediaListClient";
import JsonLd from "@/components/JsonLd";
import {
  CANONICAL_BASE_URL,
  ORGANIZATION_ID,
  WEBSITE_ID,
  LOGO_URL,
  getBreadcrumbListSchema,
} from "@/lib/schema";
import { parseMediaImages, extractYouTubeId, getYouTubeThumbnail } from "@/lib/media";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Media Centre & Press Archive | Prayas Pariwaar",
  description:
    "Official newspaper clippings, print articles, and television broadcast reports documenting Prayas Pariwaar’s grassroots seva interventions across Mathura and Vrindavan.",
  alternates: {
    canonical: "/media",
  },
  openGraph: {
    title: "Media Centre & Press Archive | Prayas Pariwaar",
    description:
      "Official newspaper clippings, print articles, and television reports documenting Prayas Pariwaar's seva interventions across Mathura and Vrindavan.",
    url: "/media",
    type: "website",
  },
};

interface MediaPageProps {
  searchParams: {
    type?: string;
  };
}

export default async function MediaPage({ searchParams }: MediaPageProps) {
  const selectedType = searchParams.type;

  const where: any = {};
  if (selectedType && (selectedType === "PRINT" || selectedType === "ELECTRONIC")) {
    where.type = selectedType as MediaType;
  }

  const mediaItems = await prisma.mediaCoverage.findMany({
    where,
    orderBy: [{ publishedDate: "desc" }, { createdAt: "desc" }],
  });

  // Calculate stats
  const totalCount = await prisma.mediaCoverage.count();
  const printCount = await prisma.mediaCoverage.count({ where: { type: "PRINT" } });
  const electronicCount = await prisma.mediaCoverage.count({ where: { type: "ELECTRONIC" } });

  // Structured Data (JSON-LD) for CollectionPage & ItemList
  const jsonLdGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${CANONICAL_BASE_URL}/media#webpage`,
        url: `${CANONICAL_BASE_URL}/media`,
        name: "Media Centre & Press Coverage | Prayas Pariwaar",
        description:
          "Official newspaper clippings, print coverage, and broadcast reports documenting Prayas Pariwaar's grassroots seva interventions across Mathura and Vrindavan.",
        isPartOf: {
          "@id": WEBSITE_ID,
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
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: mediaItems.length,
          itemListElement: mediaItems.map((item, index) => {
            const images = parseMediaImages(item.imageUrl);
            const ytId = extractYouTubeId(item.url);
            const thumb =
              images[0] || (ytId ? getYouTubeThumbnail(ytId, "maxres") : LOGO_URL);

            return {
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "NewsArticle",
                "@id": `${CANONICAL_BASE_URL}/media/${item.id}`,
                url: `${CANONICAL_BASE_URL}/media/${item.id}`,
                headline: item.title,
                datePublished: item.publishedDate?.toISOString() || item.createdAt.toISOString(),
                image: thumb,
                author: {
                  "@type": "Organization",
                  name: item.source || "Press Publication",
                },
                publisher: {
                  "@type": "Organization",
                  name: "Prayas Pariwaar",
                },
              },
            };
          }),
        },
      },
      getBreadcrumbListSchema(
        [
          { name: "Home", path: "/" },
          { name: "Media Centre", path: "/media" },
        ],
        `${CANONICAL_BASE_URL}/media`
      ),
    ],
  };

  return (
    <>
      <JsonLd data={jsonLdGraph} />

      <main className="space-y-6 sm:space-y-8 pb-20 max-w-6xl 2xl:max-w-7xl 3xl:max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 pt-6 sm:pt-8">
        {/* Page Masthead - Professional & Journalistic */}
        <header className="border-b border-prayas-rule pb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 border border-stone-200 text-xs font-bold text-[#2E5339]">
              <Newspaper className="w-3.5 h-3.5" />
              <span>Press Archive & Media Clippings</span>
            </span>
            <span className="text-xs text-prayas-muted font-medium">
              Verified Regional & National Press
            </span>
          </div>

          <h1 className="font-serif text-2xl xs:text-3xl sm:text-4xl font-bold text-prayas-ink leading-tight">
            Media Centre • News & Reports
          </h1>

          <p className="text-xs sm:text-sm text-prayas-muted max-w-3xl leading-relaxed">
            Documented print clippings and broadcast features covering Prayas Pariwaar’s grassroots seva, health camps, education initiatives, and emergency relief across Mathura and Vrindavan.
          </p>
        </header>

        {/* Filter Navigation Bar */}
        <nav aria-label="Media types" className="flex flex-wrap items-center gap-2 border-b border-prayas-rule pb-4">
          <Link
            href="/media"
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              !selectedType
                ? "bg-[#2E5339] text-white shadow-xs"
                : "bg-white border border-prayas-rule text-prayas-ink hover:bg-stone-50"
            }`}
          >
            All Coverage ({totalCount})
          </Link>
          <Link
            href="/media?type=PRINT"
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedType === "PRINT"
                ? "bg-[#2E5339] text-white shadow-xs"
                : "bg-white border border-prayas-rule text-prayas-ink hover:bg-stone-50"
            }`}
          >
            <Newspaper className="w-3.5 h-3.5 shrink-0" />
            <span>Print Clippings ({printCount})</span>
          </Link>
          <Link
            href="/media?type=ELECTRONIC"
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedType === "ELECTRONIC"
                ? "bg-[#2E5339] text-white shadow-xs"
                : "bg-white border border-prayas-rule text-prayas-ink hover:bg-stone-50"
            }`}
          >
            <Tv className="w-3.5 h-3.5 shrink-0" />
            <span>TV & Broadcasts ({electronicCount})</span>
          </Link>
        </nav>

        {/* Media Clippings Feed */}
        {mediaItems.length === 0 ? (
          <div className="p-16 text-center text-prayas-muted bg-white border border-prayas-rule rounded-2xl">
            <Newspaper className="w-8 h-8 text-prayas-muted mx-auto mb-2 opacity-50" />
            <p className="text-sm">No media clippings found in this category.</p>
          </div>
        ) : (
          <MediaListClient
            mediaItems={mediaItems.map((item) => ({
              id: item.id,
              title: item.title,
              type: item.type,
              source: item.source,
              url: item.url,
              imageUrl: item.imageUrl,
              publishedDate: item.publishedDate ? item.publishedDate.toISOString() : null,
              createdAt: item.createdAt.toISOString(),
            }))}
            selectedType={selectedType}
          />
        )}
      </main>
    </>
  );
}
