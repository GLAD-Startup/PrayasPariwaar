"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { assetPath } from "@/lib/api";
import {
  MILESTONES,
  getCategoryStyle,
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

export default function HomeHorizontalTimeline() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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
    <section className="relative w-full py-12 sm:py-18 bg-gradient-to-b from-[#F9F7F2] via-[#F4F0E8] to-[#EFECE5] border-y border-prayas-rule overflow-hidden">
      {/* Decorative ambient glowing radial lighting */}
      <div
        className="absolute top-1/3 left-1/4 -translate-y-1/2 w-[34rem] h-[34rem] bg-emerald-200/20 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/3 right-1/4 translate-y-1/2 w-[30rem] h-[30rem] bg-amber-200/20 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl 2xl:max-w-[1440px] 3xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-prayas-rule/80">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 text-xs font-semibold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>15-Year Historical Odyssey • 2011 to 2026</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-prayas-ink leading-tight">
              Our Journey of Nishkam Seva
            </h2>
            <p className="text-xs sm:text-sm text-prayas-muted leading-relaxed">
              From an evening pathshala under an ancient banyan tree on Kesi Ghat to modern solar classrooms and 24/7 medical lifelines.
            </p>
          </div>

          {/* Navigation Controls & Direct Full Timeline Link */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 bg-[#E8E3D8] p-1.5 rounded-xl border border-prayas-rule/90 shadow-2xs">
              <button
                type="button"
                onClick={() => handleScroll("left")}
                disabled={!canScrollLeft}
                aria-label="Scroll timeline left"
                className="p-2 rounded-lg bg-white/90 hover:bg-white text-prayas-ink disabled:opacity-30 disabled:hover:bg-white/90 transition-all shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll("right")}
                disabled={!canScrollRight}
                aria-label="Scroll timeline right"
                className="p-2 rounded-lg bg-white/90 hover:bg-white text-prayas-ink disabled:opacity-30 disabled:hover:bg-white/90 transition-all shadow-xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <Link
              href="/about#timeline"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2E5339] to-[#23432B] hover:from-[#23432B] hover:to-[#1B3422] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all group"
            >
              <span>See Full Timeline</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* HORIZONTAL TIMELINE TRACK WITH TOP / BOTTOM ALTERNATING CARDS            */}
        {/* ========================================================================= */}
        <div className="relative pt-6 pb-2">
          {/* Scrollable track container */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="overflow-x-auto no-scrollbar scroll-smooth pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0"
            style={{ scrollbarWidth: "none" }}
          >
            {/* The flex track containing all alternating milestones + final callout card */}
            <div className="relative flex items-center min-w-max h-[490px] gap-10 sm:gap-12">
              {/* Continuous Center Horizontal Line */}
              <div
                className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-800 via-amber-600 to-emerald-800 top-1/2 -translate-y-1/2 rounded-full shadow-xs"
                aria-hidden="true"
              >
                {/* Center ambient glow halo */}
                <div className="absolute inset-0 bg-emerald-400/20 blur-xs rounded-full" />
              </div>

              {/* Milestones Nodes */}
              {MILESTONES.map((milestone, idx) => {
                const isEven = idx % 2 === 0;
                const catStyle = getCategoryStyle(milestone.category);

                return (
                  <div
                    key={milestone.id}
                    className="relative flex flex-col items-center w-72 sm:w-80 shrink-0 group"
                  >
                    {/* Node marker on the central horizontal line */}
                    <div
                      className={`z-20 w-10 h-10 rounded-full border-2 border-white ${catStyle.pillBg} text-white shadow-md flex items-center justify-center transition-all duration-300 group-hover:scale-125 group-hover:ring-4 group-hover:ring-emerald-200 group-hover:shadow-lg`}
                    >
                      <span className="text-[11px] font-bold font-mono tracking-tight">
                        '{String(milestone.year).slice(-2)}
                      </span>
                    </div>

                    {/* Connecting Stem with micro-diamond to Card */}
                    <div
                      className={`absolute w-0.5 ${
                        isEven
                          ? "bottom-1/2 -translate-y-5 h-12 bg-gradient-to-t from-emerald-700/80 to-emerald-400/60"
                          : "top-1/2 translate-y-5 h-12 bg-gradient-to-b from-emerald-700/80 to-emerald-400/60"
                      }`}
                      aria-hidden="true"
                    />

                    {/* Card: Positioned ABOVE the line if isEven, BELOW if odd */}
                    <div
                      className={`absolute w-72 sm:w-80 transition-all duration-300 ${
                        isEven
                          ? "bottom-1/2 mb-[68px] group-hover:-translate-y-1.5"
                          : "top-1/2 mt-[68px] group-hover:translate-y-1.5"
                      }`}
                    >
                      <Link
                        href={`/about#milestone-${milestone.id}`}
                        className="block p-3.5 sm:p-4 rounded-2xl border border-prayas-rule/90 bg-white/95 backdrop-blur-md hover:bg-white shadow-[0_2px_14px_rgba(28,36,33,0.06)] hover:shadow-[0_10px_28px_rgba(46,83,57,0.15)] hover:border-emerald-600/50 transition-all duration-300 text-left"
                      >
                        {/* Top / Bottom Small Thumbnail & Badges */}
                        <div className="flex items-center gap-3 sm:gap-3.5">
                          <div className="relative w-28 h-22 sm:w-32 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-prayas-rule/80 bg-stone-100 shadow-xs group-hover:shadow-md transition-shadow">
                            <Image
                              src={assetPath(milestone.imageUrl)}
                              alt={milestone.title}
                              fill
                              sizes="(max-width: 640px) 112px, 128px"
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-serif font-bold text-xs text-prayas-ink">
                                {milestone.year}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${catStyle.badgeBg}`}
                              >
                                {milestone.categoryLabel.split(" ")[0]}
                              </span>
                            </div>

                            <h3 className="font-sans font-bold text-xs sm:text-[13px] text-prayas-ink leading-snug line-clamp-2 group-hover:text-[#2E5339] transition-colors">
                              {milestone.title}
                            </h3>
                          </div>
                        </div>

                        {/* Location & Impact Micro Label */}
                        <div className="mt-2.5 pt-2 border-t border-prayas-rule/60 flex items-center justify-between text-[10px] text-prayas-muted">
                          <span className="truncate max-w-[160px] flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 text-rose-500 shrink-0" />
                            <span>{milestone.location.split(",")[0]}</span>
                          </span>
                          <span className="text-[#2E5339] font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                            Details →
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
                <div className="z-20 w-11 h-11 rounded-full bg-gradient-to-br from-[#2E5339] to-emerald-900 text-white shadow-xl flex items-center justify-center ring-4 ring-emerald-100 animate-pulse">
                  <ArrowRight className="w-5 h-5" />
                </div>

                {/* Connecting Stem */}
                <div
                  className="absolute top-1/2 translate-y-5.5 w-0.5 h-11 bg-gradient-to-b from-emerald-700 to-emerald-500"
                  aria-hidden="true"
                />

                {/* Card linked to About page */}
                <div className="absolute top-1/2 mt-[68px] w-full">
                  <Link
                    href="/about#timeline"
                    className="block p-5 rounded-2xl border-2 border-emerald-700/70 bg-gradient-to-br from-[#1C2421] via-[#23352A] to-[#2E5339] text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-102 group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                        15-Year Archive
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-300 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <h3 className="font-serif font-bold text-base text-white mb-1.5">
                      See Full Timeline
                    </h3>
                    <p className="text-[11px] text-[#C2CDC7] leading-relaxed mb-3.5">
                      Explore all 10 verified milestones with documentary photos, sevadar archives, and audit records on our About page.
                    </p>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 group-hover:text-amber-200">
                      <span>View Complete Chronicle</span>
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
