import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Award, ArrowLeft } from "lucide-react";

export const revalidate = 60;

export default async function AwardsPage() {
  const awards = await prisma.award.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="space-y-8 sm:space-y-12 pb-20 max-w-5xl 2xl:max-w-6xl 3xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 pt-6 sm:pt-10">
      <div className="space-y-3 border-b border-prayas-rule pb-6">
        <Link
          href="/about"
          className="inline-flex items-center gap-1.5 text-xs 2xl:text-sm font-semibold text-prayas-muted hover:text-prayas-ink"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to About Us
        </Link>
        <h1 className="font-serif text-2xl xs:text-3xl sm:text-4xl 2xl:text-5xl font-bold text-prayas-ink leading-tight">
          Awards, Recognitions & Empanelment
        </h1>
        <p className="text-sm sm:text-base 2xl:text-lg text-prayas-muted max-w-2xl 2xl:max-w-3xl leading-relaxed">
          State and district commendations honoring 18 years of uninterrupted community service in Mathura district.
        </p>
      </div>

      <div className="space-y-6">
        {awards.map((award) => (
          <div
            key={award.id}
            className="border border-prayas-rule bg-white rounded p-6 sm:p-8 shadow-card grid grid-cols-1 sm:grid-cols-12 gap-6 items-start"
          >
            {award.imageUrl && (
              <div className="sm:col-span-4 aspect-[4/3] rounded bg-prayas-stone overflow-hidden border border-prayas-rule">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={award.imageUrl}
                  alt={award.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
            <div className={`${award.imageUrl ? "sm:col-span-8" : "sm:col-span-12"} space-y-3`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-prayas-marigold uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4" /> Official Recognition
                </span>
                {award.year && (
                  <span className="px-2.5 py-0.5 rounded bg-prayas-stone border border-prayas-rule text-xs font-bold font-mono text-prayas-ink">
                    {award.year}
                  </span>
                )}
              </div>
              <h2 className="font-serif text-xl font-bold text-prayas-ink">
                {award.title}
              </h2>
              <p className="text-sm text-prayas-muted leading-relaxed whitespace-pre-line">
                {award.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
