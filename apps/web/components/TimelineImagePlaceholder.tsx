"use client";

import React from "react";
import {
  GraduationCap,
  Droplet,
  Trees,
  ShieldCheck,
  Award,
  Camera,
  Image as ImageIcon,
  Sparkles,
  HeartHandshake,
} from "lucide-react";

interface TimelineImagePlaceholderProps {
  category?: "education" | "health" | "plantation" | "institutional" | string;
  year?: number | string;
  title?: string;
  location?: string;
  className?: string;
  isAward?: boolean;
  compact?: boolean;
}

const CATEGORY_STYLES: Record<
  string,
  {
    bgGradient: string;
    glowColor: string;
    iconColor: string;
    accentBorder: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  education: {
    bgGradient: "from-[#1b2a1e] via-[#142018] to-[#0c140f]",
    glowColor: "rgba(245, 158, 11, 0.18)",
    iconColor: "text-amber-400",
    accentBorder: "border-amber-500/25",
    label: "Pathshala & Free Education",
    icon: GraduationCap,
  },
  health: {
    bgGradient: "from-[#2b171c] via-[#201015] to-[#12090c]",
    glowColor: "rgba(244, 63, 94, 0.18)",
    iconColor: "text-rose-400",
    accentBorder: "border-rose-500/25",
    label: "Healthcare & Blood Desk",
    icon: Droplet,
  },
  plantation: {
    bgGradient: "from-[#132a1b] via-[#0e1f14] to-[#08130c]",
    glowColor: "rgba(16, 185, 129, 0.18)",
    iconColor: "text-emerald-400",
    accentBorder: "border-emerald-500/25",
    label: "Ecology & Green Braj",
    icon: Trees,
  },
  institutional: {
    bgGradient: "from-[#241e15] via-[#1a160f] to-[#100d09]",
    glowColor: "rgba(217, 119, 6, 0.22)",
    iconColor: "text-amber-300",
    accentBorder: "border-amber-400/25",
    label: "Governance & Recognition",
    icon: ShieldCheck,
  },
  award: {
    bgGradient: "from-[#281d11] via-[#1c140a] to-[#0f0b05]",
    glowColor: "rgba(234, 179, 8, 0.25)",
    iconColor: "text-yellow-400",
    accentBorder: "border-yellow-500/30",
    label: "Civic Honor & Seva Citation",
    icon: Award,
  },
};

export default function TimelineImagePlaceholder({
  category = "education",
  year,
  title,
  location,
  className = "",
  isAward = false,
  compact = false,
}: TimelineImagePlaceholderProps) {
  const catKey = isAward ? "award" : (category || "education").toLowerCase();
  const style = CATEGORY_STYLES[catKey] || CATEGORY_STYLES.education;
  const CategoryIcon = isAward ? Award : style.icon;

  if (compact) {
    return (
      <div
        className={`w-full h-full relative overflow-hidden bg-gradient-to-br ${style.bgGradient} flex items-center justify-center p-2 select-none ${className}`}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, ${style.glowColor} 0%, transparent 70%)`,
          }}
        />
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          <div className={`w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm border ${style.accentBorder} flex items-center justify-center shadow-sm mb-1`}>
            <CategoryIcon className={`w-4 h-4 ${style.iconColor}`} />
          </div>
          <span className="text-[10px] font-mono font-bold text-white/90">
            {year || "Seva"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full h-full relative overflow-hidden bg-gradient-to-br ${style.bgGradient} flex flex-col items-center justify-center p-4 sm:p-5 select-none ${className}`}
    >
      {/* Ambient Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 35%, ${style.glowColor} 0%, transparent 65%)`,
        }}
      />

      {/* Sacred Geometry Radial Line Pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id={`grid-${catKey}`} width="28" height="28" patternUnits="userSpaceOnUse">
            <path
              d="M 28 0 L 0 0 0 28"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.7"
              className="text-white"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${catKey})`} />
      </svg>

      {/* Decorative Corner Framing */}
      <div className="absolute top-2.5 left-2.5 w-3 h-3 border-t border-l border-white/20 pointer-events-none" />
      <div className="absolute top-2.5 right-2.5 w-3 h-3 border-t border-r border-white/20 pointer-events-none" />
      <div className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b border-l border-white/20 pointer-events-none" />
      <div className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b border-r border-white/20 pointer-events-none" />

      {/* Content Badge */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-[90%] space-y-2">
        {/* Central Icon Circle */}
        <div className="relative">
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-md border ${style.accentBorder} flex items-center justify-center shadow-lg transition-transform hover:scale-105`}
          >
            <CategoryIcon className={`w-6 h-6 sm:w-7 sm:h-7 ${style.iconColor}`} />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-black/80 border border-white/20 flex items-center justify-center text-slate-300">
            <Camera className="w-2.5 h-2.5" />
          </div>
        </div>

        {/* Brand Archive Micro Label */}
        <div className="space-y-0.5">
          <div className="flex items-center justify-center gap-1.5 text-slate-300/80 text-[10px] font-bold uppercase tracking-widest">
            <Sparkles className="w-2.5 h-2.5 text-amber-300" />
            <span>Prayas Seva Archive</span>
          </div>

          {title && (
            <h4 className="font-serif font-bold text-xs sm:text-sm text-white/95 line-clamp-1 leading-snug px-2">
              {title}
            </h4>
          )}
        </div>

        {/* Status Pill */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 border border-white/15 backdrop-blur-xs text-[10px] text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-medium">
            {isAward ? "Citation Certificate Being Digitized" : "Documentary Photo Pending"}
          </span>
        </div>
      </div>
    </div>
  );
}
