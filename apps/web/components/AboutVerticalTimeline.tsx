"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { assetPath } from "@/lib/api";
import {
  MILESTONES,
  MilestoneCategory,
  TimelineMilestone,
  getCategoryStyle,
} from "@/lib/timeline-data";
import {
  Sparkles,
  MapPin,
  Calendar,
  ExternalLink,
  GraduationCap,
  Droplet,
  Trees,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function AboutVerticalTimeline() {
  const [selectedCategory, setSelectedCategory] = useState<MilestoneCategory>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredMilestones = MILESTONES.filter(
    (m) => selectedCategory === "all" || m.category === selectedCategory
  );

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Split into alternating even (left) and odd (right) for staggered overlapping layout
  const leftMilestones = filteredMilestones.filter((_, idx) => idx % 2 === 0);
  const rightMilestones = filteredMilestones.filter((_, idx) => idx % 2 !== 0);

  return (
    <section id="timeline" className="scroll-mt-24 pt-12 sm:pt-16 pb-24 space-y-12 sm:space-y-14">
      {/* Section Header */}
      <div className="border-b border-prayas-rule pb-6 sm:pb-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 text-xs font-semibold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>15-Year Historical Odyssey • 2011 to 2026</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-prayas-ink leading-tight">
              Chronicle of Nishkam Seva
            </h2>
            <p className="text-xs sm:text-sm text-prayas-muted leading-relaxed">
              Fifteen years of verified grassroots milestones across Vrindavan and Mathura district.
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-xs font-mono font-bold text-prayas-muted px-3.5 py-2 rounded-xl bg-[#EFECE6] border border-prayas-rule inline-block shadow-2xs">
              {filteredMilestones.length} of {MILESTONES.length} Milestones
            </span>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedCategory === "all"
                ? "bg-[#2E5339] text-white shadow-xs"
                : "bg-[#EFECE6]/80 text-prayas-ink hover:bg-[#E5E0D5] border border-prayas-rule"
            }`}
          >
            All ({MILESTONES.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("education")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedCategory === "education"
                ? "bg-amber-700 text-white shadow-xs"
                : "bg-[#EFECE6]/80 text-prayas-ink hover:bg-[#E5E0D5] border border-prayas-rule"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Education</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("health")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedCategory === "health"
                ? "bg-rose-700 text-white shadow-xs"
                : "bg-[#EFECE6]/80 text-prayas-ink hover:bg-[#E5E0D5] border border-prayas-rule"
            }`}
          >
            <Droplet className="w-3.5 h-3.5" />
            <span>Health & Blood</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("plantation")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedCategory === "plantation"
                ? "bg-emerald-700 text-white shadow-xs"
                : "bg-[#EFECE6]/80 text-prayas-ink hover:bg-[#E5E0D5] border border-prayas-rule"
            }`}
          >
            <Trees className="w-3.5 h-3.5" />
            <span>Plantation</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("institutional")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedCategory === "institutional"
                ? "bg-sky-700 text-white shadow-xs"
                : "bg-[#EFECE6]/80 text-prayas-ink hover:bg-[#E5E0D5] border border-prayas-rule"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Trust & Awards</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP (md+): SPACIOUS STAGGERED 2-COLUMN TIMELINE                        */}
      {/* ========================================================================= */}
      <div className="hidden md:block relative pt-4">
        {/* Central Vertical Spine */}
        <div
          className="absolute top-6 bottom-6 left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-[#2E5339]/40 via-amber-700/40 to-[#2E5339]/40 rounded-full"
          aria-hidden="true"
        />

        {/* Generous 24-unit (6rem) gap between columns gives ample breathing room around spine */}
        <div className="flex gap-24 lg:gap-28 relative">
          {/* Left Column (Even milestones: 2011, 2015, 2019, 2022, 2025) */}
          <div className="w-1/2 space-y-18 lg:space-y-20">
            {leftMilestones.map((milestone) => (
              <TimelineCardItem
                key={milestone.id}
                milestone={milestone}
                isEven={true}
                isExpanded={expandedId === milestone.id}
                onToggleExpand={() => toggleExpand(milestone.id)}
              />
            ))}
          </div>

          {/* Right Column (Odd milestones: 2013, 2017, 2020, 2024, 2026) */}
          {/* pt-36 / pt-40 staggers the right column with generous breathing room */}
          <div className="w-1/2 space-y-18 lg:space-y-20 pt-36 lg:pt-40">
            {rightMilestones.map((milestone) => (
              <TimelineCardItem
                key={milestone.id}
                milestone={milestone}
                isEven={false}
                isExpanded={expandedId === milestone.id}
                onToggleExpand={() => toggleExpand(milestone.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE (<md): SPACIOUS SINGLE-COLUMN TIMELINE                              */}
      {/* ========================================================================= */}
      <div className="md:hidden relative pl-12 space-y-10 pt-2">
        {/* Mobile Left-aligned Spine */}
        <div
          className="absolute top-4 bottom-4 left-5 w-0.5 bg-gradient-to-b from-[#2E5339]/50 via-amber-700/40 to-[#2E5339]/50 rounded-full"
          aria-hidden="true"
        />

        {filteredMilestones.map((milestone) => (
          <TimelineCardItem
            key={milestone.id}
            milestone={milestone}
            isEven={false}
            isMobile={true}
            isExpanded={expandedId === milestone.id}
            onToggleExpand={() => toggleExpand(milestone.id)}
          />
        ))}
      </div>
    </section>
  );
}

function TimelineCardItem({
  milestone,
  isEven,
  isMobile = false,
  isExpanded,
  onToggleExpand,
}: {
  milestone: TimelineMilestone;
  isEven: boolean;
  isMobile?: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const catStyle = getCategoryStyle(milestone.category);
  const CategoryIcon = catStyle.icon;

  return (
    <div id={`milestone-${milestone.id}`} className="relative scroll-mt-32 group">
      {/* Desktop Central Spine Node & Connector */}
      {!isMobile && (
        <div
          className={`hidden md:flex absolute top-8 z-20 items-center ${
            isEven
              ? "-right-12 lg:-right-14 translate-x-full flex-row"
              : "-left-12 lg:-left-14 -translate-x-full flex-row-reverse"
          }`}
        >
          {/* Connector Line from Card to Spine Node */}
          <div className="w-7 lg:w-9 h-px bg-prayas-rule" />

          {/* Node Seal on the spine */}
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full bg-[#F7F5F0] border-2 ${catStyle.borderColor} text-[#2E5339] shadow-xs flex items-center justify-center transition-all duration-300 group-hover:scale-115 group-hover:bg-[#2E5339] group-hover:text-white`}
            >
              <CategoryIcon className="w-4 h-4" />
            </div>
            <span className="mt-1 font-mono font-bold text-[9px] text-prayas-ink bg-[#EFECE6] px-1.5 py-0.2 rounded border border-prayas-rule shadow-2xs">
              {milestone.year}
            </span>
          </div>
        </div>
      )}

      {/* Mobile Node Marker */}
      {isMobile && (
        <div className="absolute -left-12 top-5 z-20 flex items-center">
          <div
            className={`w-8 h-8 rounded-full bg-[#F7F5F0] border-2 ${catStyle.borderColor} text-[#2E5339] shadow-xs flex items-center justify-center`}
          >
            <CategoryIcon className="w-3.5 h-3.5" />
          </div>
          <div className="w-4 h-px bg-prayas-rule" />
        </div>
      )}

      {/* Card Container: Blends seamlessly with #F7F5F0 page canvas */}
      <div className="rounded-2xl p-5 sm:p-6 lg:p-7 border border-prayas-rule bg-[#F7F5F0] hover:border-[#2E5339]/50 shadow-xs hover:shadow-md transition-all duration-300 space-y-4">
        {/* Header Row: Date & Category & Location */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-prayas-muted">
              <Calendar className="w-3.5 h-3.5" />
              <span>{milestone.dateLabel}</span>
            </span>
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${catStyle.badgeBg}`}
            >
              {milestone.categoryLabel.split(" ")[0]}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 text-[11px] text-prayas-muted truncate max-w-[180px]">
            <MapPin className="w-3 h-3 text-rose-600 shrink-0" />
            <span>{milestone.location.split(",")[0]}</span>
          </span>
        </div>

        {/* Headline Title */}
        <h3 className="font-serif text-base sm:text-lg lg:text-xl font-bold text-prayas-ink leading-snug group-hover:text-[#2E5339] transition-colors">
          {milestone.title}
        </h3>

        {/* Compact Documentary Image */}
        <div className="relative w-full h-44 sm:h-52 rounded-xl overflow-hidden border border-prayas-rule bg-stone-100 shadow-2xs">
          <Image
            src={assetPath(milestone.imageUrl)}
            alt={milestone.title}
            fill
            sizes="(max-width: 768px) 100vw, 45vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px]">
            <span className="font-bold px-2 py-0.5 rounded bg-black/50 backdrop-blur-xs">
              {milestone.impactBadge}
            </span>
            {milestone.highlightTag && (
              <span className="bg-amber-400 text-amber-950 font-bold px-2 py-0.5 rounded text-[10px]">
                {milestone.highlightTag}
              </span>
            )}
          </div>
        </div>

        {/* Concise Summary (Streamlined info) */}
        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
          {milestone.summary}
        </p>

        {/* Expandable full story drawer */}
        {isExpanded && (
          <div className="pt-3 border-t border-prayas-rule/80 space-y-2.5 text-xs text-stone-700 leading-relaxed animate-in fade-in duration-200">
            <p className="bg-[#EFECE6]/60 p-3 rounded-xl border border-prayas-rule/60 text-[12px] leading-relaxed">
              {milestone.story}
            </p>
            {milestone.quote && (
              <p className="italic text-stone-600 pl-3 border-l-2 border-amber-600/70 text-[11px]">
                "{milestone.quote}"
              </p>
            )}
          </div>
        )}

        {/* Bottom Action Row: Toggle Story & Program Link */}
        <div className="pt-2 border-t border-prayas-rule/50 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onToggleExpand}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-prayas-muted hover:text-[#2E5339] transition-colors"
          >
            <span>{isExpanded ? "Show less" : "Read background story"}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {milestone.linkUrl && milestone.linkLabel && (
            <Link
              href={milestone.linkUrl}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2E5339] hover:underline"
            >
              <span>{milestone.linkLabel.split(" ")[0]} Project</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
