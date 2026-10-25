"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { assetPath } from "@/lib/api";
import TimelineImagePlaceholder from "@/components/TimelineImagePlaceholder";
import {
  MILESTONES,
  TimelineMilestone,
} from "@/lib/timeline-data";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  MapPin,
  ExternalLink,
} from "lucide-react";

interface HomeHorizontalTimelineProps {
  milestones?: TimelineMilestone[];
}

export default function HomeHorizontalTimeline({ milestones }: HomeHorizontalTimelineProps) {
  const displayMilestones = milestones && milestones.length > 0 ? milestones : MILESTONES;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === "left" ? -460 : 460;
    scrollContainerRef.current.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative w-full py-6 sm:py-8 bg-[#FAF9F6] border-y border-prayas-rule/80 overflow-hidden">
      <div className="max-w-6xl xl:max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 xl:px-20">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-prayas-rule/70">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#2E5339] border border-emerald-200 text-xs font-semibold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>15-Year Chronicle • 2011 to 2026</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-prayas-ink leading-tight">
              Our Journey of Community Service
            </h2>
            <p className="text-xs sm:text-sm text-prayas-muted leading-relaxed">
              From our first evening pathshala on Kesi Ghat to permanent tutoring centers and 24/7 emergency medical lifelines.
            </p>
          </div>

          {/* Navigation Controls & Direct Full Timeline Link */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 bg-white p-1 rounded-xl border border-prayas-rule shadow-2xs">
              <button
                type="button"
                onClick={() => handleScroll("left")}
                disabled={!canScrollLeft}
                aria-label="Scroll timeline left"
                className="p-2 rounded-lg bg-white hover:bg-stone-50 text-prayas-ink border border-transparent hover:border-prayas-rule disabled:opacity-30 disabled:hover:bg-white transition-all shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll("right")}
                disabled={!canScrollRight}
                aria-label="Scroll timeline right"
                className="p-2 rounded-lg bg-white hover:bg-stone-50 text-prayas-ink border border-transparent hover:border-prayas-rule disabled:opacity-30 disabled:hover:bg-white transition-all shadow-xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <Link
              href="/about#timeline"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2E5339] hover:bg-[#23432B] text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow-md transition-all group"
            >
              <span>See Full Timeline</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* HORIZONTAL TIMELINE TRACK WITH TOP / BOTTOM ALTERNATING CARDS            */}
        {/* ========================================================================= */}
        <div className="relative pt-4 pb-2">
          {/* Scrollable track container */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="overflow-x-auto no-scrollbar scroll-smooth pb-3 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0"
            style={{ scrollbarWidth: "none" }}
          >
            {/* The flex track containing all alternating milestones + final callout card */}
            <div className="relative flex items-center min-w-max h-[450px] gap-8 sm:gap-10">
              {/* Continuous Center Horizontal Line */}
              <div
                className="absolute left-0 right-0 h-0.5 bg-prayas-rule/90 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />

              {/* Milestones Nodes */}
              {displayMilestones.map((milestone, idx) => {
                const isEven = idx % 2 === 0;

                return (
                  <div
                    key={milestone.id}
                    className="relative flex flex-col items-center w-72 sm:w-80 shrink-0 group"
                  >
                    {/* Node marker on the central horizontal line */}
                    <div
                      className="z-20 w-9 h-9 rounded-full border-2 border-[#2E5339] bg-white text-[#2E5339] shadow-sm flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-[#2E5339] group-hover:text-white group-hover:shadow-md"
                    >
                      <span className="text-[11px] font-bold font-mono tracking-tight">
                        '{String(milestone.year).slice(-2)}
                      </span>
                    </div>

                    {/* Connecting Stem to Card */}
                    <div
                      className={`absolute w-px transition-colors duration-300 ${
                        isEven
                          ? "bottom-1/2 -translate-y-4.5 h-11 bg-stone-300 group-hover:bg-[#2E5339]"
                          : "top-1/2 translate-y-4.5 h-11 bg-stone-300 group-hover:bg-[#2E5339]"
                      }`}
                      aria-hidden="true"
                    />

                    {/* Card: Positioned ABOVE the line if isEven, BELOW if odd */}
                    <div
                      className={`absolute w-72 sm:w-80 transition-all duration-300 ${
                        isEven
                          ? "bottom-1/2 mb-[60px] group-hover:-translate-y-1"
                          : "top-1/2 mt-[60px] group-hover:translate-y-1"
                      }`}
                    >
                      <Link
                        href={`/about#milestone-${milestone.id}`}
                        className="block p-3.5 sm:p-4 rounded-2xl border border-prayas-rule bg-white hover:border-[#2E5339] shadow-xs hover:shadow-lg transition-all duration-300 text-left"
                      >
                        {/* Top / Bottom Small Thumbnail & Badges */}
                        <div className="flex items-center gap-3 sm:gap-3.5">
                          <div className="relative w-24 h-20 sm:w-28 sm:h-22 rounded-xl overflow-hidden shrink-0 border border-prayas-rule bg-stone-100 shadow-2xs">
                            {typeof milestone.imageUrl === "string" &&
                            milestone.imageUrl.trim().length > 0 &&
                            milestone.imageUrl !== "null" &&
                            milestone.imageUrl !== "undefined" &&
                            !brokenImages[milestone.id] ? (
                              <Image
                                src={assetPath(milestone.imageUrl)}
                                alt={milestone.title}
                                fill
                                sizes="(max-width: 640px) 96px, 112px"
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={() =>
                                  setBrokenImages((prev) => ({ ...prev, [milestone.id]: true }))
                                }
                              />
                            ) : (
                              <TimelineImagePlaceholder
                                category={milestone.category}
                                year={milestone.year}
                                compact={true}
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-serif font-bold text-xs text-[#2E5339] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/70">
                                {milestone.year}
                              </span>
                              <span className="text-[10px] font-semibold text-prayas-muted uppercase tracking-wider truncate">
                                {(milestone.categoryLabel || "Seva").split(" ")[0]}
                              </span>
                            </div>

                            <h3 className="font-sans font-bold text-xs sm:text-[13px] text-prayas-ink leading-snug line-clamp-2 group-hover:text-[#2E5339] transition-colors">
                              {milestone.title}
                            </h3>
                          </div>
                        </div>

                        {/* Location & Details Link */}
                        <div className="mt-2.5 pt-2 border-t border-prayas-rule/60 flex items-center justify-between text-[10px] text-prayas-muted">
                          <span className="truncate max-w-[150px] flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 text-rose-500 shrink-0" />
                            <span>{milestone.location.split(",")[0]}</span>
                          </span>
                          <span className="text-[#2E5339] font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                            View Story →
                          </span>
                        </div>
                      </Link>
                    </div>
                  </div>
                );
              })}

              {/* ========================================================================= */}
              {/* FINAL CALLOUT CARD AT RIGHT SIDE OF HORIZONTAL TIMELINE                   */}
              {/* ========================================================================= */}
              <div className="relative flex flex-col items-center w-72 sm:w-80 shrink-0 pl-2">
                {/* Node marker on the line */}
                <div className="z-20 w-9 h-9 rounded-full bg-[#2E5339] text-white shadow-sm flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                  <ArrowRight className="w-4 h-4" />
                </div>

                {/* Connecting Stem */}
                <div
                  className="absolute top-1/2 translate-y-4.5 w-px h-11 bg-stone-300"
                  aria-hidden="true"
                />

                {/* Card linked to About page */}
                <div className="absolute top-1/2 mt-[60px] w-full">
                  <Link
                    href="/about#timeline"
                    className="block p-4 sm:p-5 rounded-2xl border border-[#23432B] bg-[#2E5339] text-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 bg-white/10 px-2 py-0.5 rounded border border-white/15">
                        15-Year Archive
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-200 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <h3 className="font-serif font-bold text-sm sm:text-base text-white mb-1">
                      Explore Full Chronicle
                    </h3>
                    <p className="text-[11px] text-emerald-100/90 leading-relaxed mb-3">
                      View all verified milestones with photos, volunteer records, and community growth.
                    </p>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 group-hover:text-amber-200">
                      <span>Read Complete Timeline</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Swipe indicator for mobile */}
          <div className="flex sm:hidden items-center justify-center gap-1.5 text-[11px] text-prayas-muted mt-2">
            <span>← Swipe horizontally to explore 2011 to 2026 →</span>
          </div>
        </div>
      </div>
    </section>
  );
}
