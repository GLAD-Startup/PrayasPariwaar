import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MediaType } from "@prisma/client";
import { Newspaper, Tv, ExternalLink, Calendar } from "lucide-react";

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
    orderBy: [{ publishedDate: "desc" }, { order: "asc" }],
  });

  return (
    <div className="space-y-12 pb-20 max-w-5xl mx-auto px-4 sm:px-6 pt-10">
      <div className="border-b border-prayas-rule pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-prayas-stone border border-prayas-rule text-xs font-bold text-prayas-ink">
          <Newspaper className="w-3.5 h-3.5" />
          <span>Press Archive & Press Coverage</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-prayas-ink">
          Media Centre • News & Reports
        </h1>
        <p className="text-sm text-prayas-muted max-w-2xl leading-relaxed">
          National and regional press reports highlighting Prayas Pariwaar’s grassroots interventions in Mathura, Vrindavan, and Braj region.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-prayas-rule text-sm">
        <Link
          href="/media"
          className={`pb-3 px-4 font-semibold transition-colors border-b-2 ${
            !selectedType
              ? "border-prayas-neem text-prayas-neem"
              : "border-transparent text-prayas-muted hover:text-prayas-ink"
          }`}
        >
          All Coverage
        </Link>
        <Link
          href="/media?type=PRINT"
          className={`pb-3 px-4 font-semibold transition-colors border-b-2 ${
            selectedType === "PRINT"
              ? "border-prayas-neem text-prayas-neem"
              : "border-transparent text-prayas-muted hover:text-prayas-ink"
          }`}
        >
          Print Media (Dainik Jagran, Amar Ujala)
        </Link>
        <Link
          href="/media?type=ELECTRONIC"
          className={`pb-3 px-4 font-semibold transition-colors border-b-2 ${
            selectedType === "ELECTRONIC"
              ? "border-prayas-neem text-prayas-neem"
              : "border-transparent text-prayas-muted hover:text-prayas-ink"
          }`}
        >
          Electronic & Digital Broadcasts
        </Link>
      </div>

      {/* Media Items List */}
      <div className="space-y-4">
        {mediaItems.map((item) => {
          const isPrint = item.type === "PRINT";
          return (
            <article
              key={item.id}
              className="border border-prayas-rule bg-white rounded p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-xs">
                  <span className="px-2 py-0.5 rounded bg-prayas-stone border border-prayas-rule font-bold text-prayas-ink flex items-center gap-1">
                    {isPrint ? <Newspaper className="w-3 h-3 text-prayas-muted" /> : <Tv className="w-3 h-3 text-blue-600" />}
                    {item.source || (isPrint ? "Print Media" : "Electronic Media")}
                  </span>
                  {item.publishedDate && (
                    <span className="text-prayas-muted flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.publishedDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>

                <h2 className="font-serif text-lg font-bold text-prayas-ink leading-snug">
                  {item.title}
                </h2>
              </div>

              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded text-xs font-semibold border border-prayas-rule bg-prayas-stone text-prayas-ink hover:bg-prayas-subtle transition-colors shrink-0 self-start sm:self-auto"
                >
                  <span>View Press Source</span>
                  <ExternalLink className="w-3.5 h-3.5 text-prayas-muted" />
                </a>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
