import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MediaType } from "@prisma/client";
import { Newspaper, Tv, ExternalLink, Calendar, ZoomIn, Image as ImageIcon } from "lucide-react";

export const revalidate = 60;

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

      {/* Media Clippings Grid */}
      {mediaItems.length === 0 ? (
        <div className="p-16 text-center text-prayas-muted bg-white border border-prayas-rule rounded-2xl">
          <Newspaper className="w-8 h-8 text-prayas-muted mx-auto mb-2 opacity-50" />
          <p className="text-sm">No media clippings found in this section.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {mediaItems.map((item) => {
            const isPrint = item.type === "PRINT";
            const displayImage =
              item.imageUrl ||
              (isPrint
                ? "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80"
                : "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80");

            return (
              <article
                key={item.id}
                className="border border-prayas-rule bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-lg transition-all flex flex-col group"
              >
                {/* MEDIA CLIPPING IMAGE PREVIEW */}
                <div className="relative aspect-[4/3] bg-prayas-stone overflow-hidden border-b border-prayas-rule">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={displayImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Format Badge Overlay */}
                  <span
                    className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm flex items-center gap-1 ${
                      isPrint
                        ? "bg-black/75 text-white"
                        : "bg-blue-900/80 text-white"
                    }`}
                  >
                    {isPrint ? (
                      <Newspaper className="w-3 h-3 text-amber-400" />
                    ) : (
                      <Tv className="w-3 h-3 text-cyan-400" />
                    )}
                    <span>{isPrint ? "Press Clipping" : "TV Broadcast"}</span>
                  </span>

                  {/* Click to Expand Link overlay */}
                  {item.imageUrl && (
                    <a
                      href={item.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-3 right-3 p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 shadow"
                      title="View High-Res Clipping Scan"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {/* Content Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    {/* Meta: Source & Date */}
                    <div className="flex items-center justify-between text-[11px] text-prayas-muted">
                      <span className="font-bold text-prayas-ink px-2 py-0.5 rounded bg-prayas-stone border border-prayas-rule">
                        {item.source || (isPrint ? "Print Media" : "Broadcast")}
                      </span>

                      {item.publishedDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-prayas-neem" />
                          {new Date(item.publishedDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>

                    {/* Headline */}
                    <h2 className="font-serif text-base font-bold text-prayas-ink group-hover:text-prayas-neem transition-colors leading-snug line-clamp-3">
                      {item.title}
                    </h2>
                  </div>

                  {/* Action Link */}
                  <div className="pt-3 border-t border-prayas-rule flex items-center justify-between">
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B45309] hover:underline"
                      >
                        <span>Read Full Press Article</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : item.imageUrl ? (
                      <a
                        href={item.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-prayas-neem hover:underline"
                      >
                        <span>View Scanned Clipping</span>
                        <ZoomIn className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-prayas-muted font-medium">
                        Archived Official Release
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
