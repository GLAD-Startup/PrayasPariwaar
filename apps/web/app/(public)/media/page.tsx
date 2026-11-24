import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MediaType } from "@prisma/client";
import { Newspaper, Tv } from "lucide-react";
import MediaListClient from "./MediaListClient";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Media Centre & Press Coverage | Prayas Pariwaar",
  description:
    "Scanned newspaper clippings, print articles, and television broadcast reports documenting Prayas Pariwaar’s grassroots seva interventions across Mathura and Vrindavan.",
  alternates: {
    canonical: "/media",
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

  return (
    <div className="space-y-8 sm:space-y-12 pb-20 max-w-6xl 2xl:max-w-7xl 3xl:max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 pt-6 sm:pt-10">
      {/* Page Masthead */}
      <div className="border-b border-prayas-rule pb-6 sm:pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-prayas-stone border border-prayas-rule text-xs 2xl:text-sm font-bold text-prayas-neem">
          <Newspaper className="w-3.5 h-3.5" />
          <span>Press Archive & Media Clippings</span>
        </div>
        <h1 className="font-serif text-2xl xs:text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl font-bold text-prayas-ink leading-tight">
          Media Centre • News & Reports
        </h1>
        <p className="text-sm sm:text-base 2xl:text-lg text-prayas-muted max-w-3xl 2xl:max-w-4xl leading-relaxed">
          Scanned press clippings, print articles, and television broadcast reports documenting Prayas Pariwaar’s grassroots interventions across Mathura, Vrindavan, and Braj region.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 border-b border-prayas-rule pb-4">
        <Link
          href="/media"
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            !selectedType
              ? "bg-[#2E5339] text-white shadow-sm"
              : "bg-white border border-prayas-rule text-prayas-ink hover:bg-prayas-stone"
          }`}
          style={!selectedType ? { backgroundColor: "#2E5339", color: "#ffffff" } : {}}
        >
          All Media Coverage ({mediaItems.length})
        </Link>
        <Link
          href="/media?type=PRINT"
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            selectedType === "PRINT"
              ? "bg-[#2E5339] text-white shadow-sm"
              : "bg-white border border-prayas-rule text-prayas-ink hover:bg-prayas-stone"
          }`}
          style={selectedType === "PRINT" ? { backgroundColor: "#2E5339", color: "#ffffff" } : {}}
        >
          <Newspaper className="w-3.5 h-3.5 shrink-0" />
          <span>Print Media (Dainik Jagran, Amar Ujala)</span>
        </Link>
        <Link
          href="/media?type=ELECTRONIC"
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            selectedType === "ELECTRONIC"
              ? "bg-[#2E5339] text-white shadow-sm"
              : "bg-white border border-prayas-rule text-prayas-ink hover:bg-prayas-stone"
          }`}
          style={selectedType === "ELECTRONIC" ? { backgroundColor: "#2E5339", color: "#ffffff" } : {}}
        >
          <Tv className="w-3.5 h-3.5 shrink-0" />
          <span>Electronic & Digital Broadcasts</span>
        </Link>
      </div>

      {/* Media Clippings Feed */}
      {mediaItems.length === 0 ? (
        <div className="p-16 text-center text-prayas-muted bg-white border border-prayas-rule rounded-2xl">
          <Newspaper className="w-8 h-8 text-prayas-muted mx-auto mb-2 opacity-50" />
          <p className="text-sm">No media clippings found in this section.</p>
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
    </div>
  );
}
