"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { assetPath } from "@/lib/api";
import {
  Heart,
  Droplet,
  BookOpen,
  ShieldCheck,
} from "lucide-react";

interface HeroVideoScrollProps {
  aashayeinProject?: {
    raisedAmount?: number | null;
    goalAmount?: number | null;
  } | null;
  percentAashayein: number;
}

export default function HeroVideoScroll({
  aashayeinProject,
  percentAashayein,
}: HeroVideoScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [centerOffsetX, setCenterOffsetX] = useState(0);

  // Measure container and card to compute exact horizontal distance needed to center
  useEffect(() => {
    const updateOffset = () => {
      if (!contentContainerRef.current || !cardRef.current) return;
      const style = window.getComputedStyle(contentContainerRef.current);
      const paddingLeft = parseFloat(style.paddingLeft) || 0;
      const paddingRight = parseFloat(style.paddingRight) || 0;
      const contentW = contentContainerRef.current.clientWidth - paddingLeft - paddingRight;
      const cardW = cardRef.current.clientWidth;
      const offset = Math.max(0, (contentW - cardW) / 2);
      setCenterOffsetX(offset);
    };

    updateOffset();
    window.addEventListener("resize", updateOffset);
    return () => window.removeEventListener("resize", updateOffset);
  }, []);

  // Responsive RAF-driven scroll listener tied to the sticky hero track runway
  useEffect(() => {
    let ticking = false;

    const updateScrollProgress = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrollDistance = containerRef.current.offsetHeight - window.innerHeight;
      if (scrollDistance <= 0) {
        setProgress(0);
        return;
      }
      const scrolled = -rect.top;
      const rawProgress = Math.min(Math.max(scrolled / scrollDistance, 0), 1);
      setProgress(rawProgress);

      // Keep dataset synced for any consumer listeners
      document.documentElement.dataset.heroVideoProgress = rawProgress.toFixed(3);
      if (rawProgress >= 0.95) {
        document.documentElement.dataset.heroVideoSettled = "true";
      } else {
        document.documentElement.dataset.heroVideoSettled = "false";
      }

      window.dispatchEvent(
        new CustomEvent("hero-video-scroll", { detail: { progress: rawProgress } })
      );

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollProgress);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    updateScrollProgress();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Background Video: 0.85x speed, muted, looped, slow cinematic fade-in
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const enforceSettings = () => {
      if (!video) return;
      video.playbackRate = 0.85;
      video.muted = true;
      video.volume = 0;
      video.defaultMuted = true;
    };

    enforceSettings();

    let fadeTimer: NodeJS.Timeout;
    let triggered = false;

    const triggerSlowFade = () => {
      if (triggered) return;
      triggered = true;
      enforceSettings();
      video.play().catch(() => {
        enforceSettings();
        video.play().catch(() => {});
      });
      fadeTimer = setTimeout(() => {
        setIsVideoLoaded(true);
      }, 150);
    };

    if (video.readyState >= 2) {
      triggerSlowFade();
    } else {
      video.addEventListener("loadeddata", triggerSlowFade, { once: true });
      video.addEventListener("canplaythrough", triggerSlowFade, { once: true });
      video.addEventListener("playing", triggerSlowFade, { once: true });
    }

    video.addEventListener("play", enforceSettings);
    video.addEventListener("loadedmetadata", enforceSettings);
    video.addEventListener("ratechange", () => {
      if (video.playbackRate !== 0.85) {
        video.playbackRate = 0.85;
      }
    });
    video.addEventListener("volumechange", () => {
      video.muted = true;
      video.volume = 0;
    });

    const fallbackTimer = setTimeout(() => {
      setIsVideoLoaded(true);
      enforceSettings();
    }, 1200);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(fallbackTimer);
      video.removeEventListener("loadeddata", triggerSlowFade);
      video.removeEventListener("canplaythrough", triggerSlowFade);
      video.removeEventListener("playing", triggerSlowFade);
      video.removeEventListener("play", enforceSettings);
      video.removeEventListener("loadedmetadata", enforceSettings);
    };
  }, []);

  // =========================================================================
  // ANIMATION CALCULATIONS
  // =========================================================================
  // Smooth cubic ease-out transition as progress goes from 0 to 1
  const ease = 1 - Math.pow(1 - progress, 3);

  // When progress = 0: translateX = centerOffsetX (middle of hero section)
  // When progress = 1: translateX = 0 (settles into left side of hero section)
  const currentTranslateX = (1 - ease) * centerOffsetX;

  // Crossfade between centered presentation (initial load) and left-settled presentation
  const centeredOpacity = Math.max(0, 1 - progress * 2.2);
  const settledOpacity = Math.min(1, Math.max(0, (progress - 0.22) * 2.2));

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: "calc(100dvh + 480px)" }}
      id="hero-video-track"
    >
      <div className="sticky top-0 w-full h-[100dvh] overflow-hidden flex items-center justify-center bg-black border-b border-prayas-rule">
        {/* ===================================================================== */}
        {/* Continuous Background Video (0.85x speed, 100% silent, loop)         */}
        {/* Slow cinematic fade-in when site loads                                */}
        {/* ===================================================================== */}
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
          <video
            ref={videoRef}
            src={assetPath("/videos/prayas_by_jatin.mp4")}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className={`w-full h-full object-cover object-center will-change-transform transition-opacity duration-[2000ms] ease-out ${
              isVideoLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>

        {/* ===================================================================== */}
        {/* Vignette Overlays: Centered contrast for load, Left contrast for settle */}
        {/* ===================================================================== */}
        {/* Base dark backdrop for text legibility in the center */}
        <div
          className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-500 ease-out bg-black/40"
          style={{ opacity: 0.45 + (1 - ease) * 0.3 }}
        />

        {/* Left-settled gradient vignette: smoothly enriches on the left as text settles */}
        <div
          className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-500 ease-out bg-gradient-to-t from-black/90 via-black/45 to-transparent lg:bg-gradient-to-r lg:from-black/85 lg:via-black/35 lg:to-transparent"
          style={{ opacity: 0.35 + ease * 0.65 }}
        />

        {/* Subtle "Scroll to explore" cue at the bottom, fades out immediately on scroll */}
        <div
          className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-opacity duration-300 flex flex-col items-center gap-1.5 text-white/75"
          style={{
            opacity: Math.max(0, 1 - progress * 5),
          }}
        >
          <span className="text-[10px] sm:text-[11px] uppercase tracking-widest font-mono text-white/70 drop-shadow">
            Scroll to explore
          </span>
          <span className="w-4 h-7 rounded-full border border-white/50 flex items-start justify-center p-1 backdrop-blur-xs">
            <span className="w-1 h-2 rounded-full bg-emerald-400 animate-bounce" />
          </span>
        </div>

        {/* ===================================================================== */}
        {/* Hero Content: Centered on Load -> Smoothly Animates & Settles on Left */}
        {/* ===================================================================== */}
        <div
          ref={contentContainerRef}
          className="relative z-20 w-full max-w-7xl 2xl:max-w-[1440px] 3xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 pt-[100px] xs:pt-[106px] sm:pt-28 lg:pt-24 pb-12 sm:pb-16 flex flex-col justify-center min-h-[100dvh]"
        >
          <div
            ref={cardRef}
            className="relative w-full max-w-2xl 2xl:max-w-3xl will-change-transform"
            style={{
              transform: `translate3d(${currentTranslateX}px, 0, 0)`,
            }}
          >
            {/* ----------------------------------------------------------------- */}
            {/* SETTLED VIEW (Left-aligned): Defines card bounding box in normal flow */}
            {/* ----------------------------------------------------------------- */}
            <div
              className="space-y-4 sm:space-y-5 text-left flex flex-col items-start text-white will-change-transform"
              style={{
                opacity: settledOpacity,
                pointerEvents: progress >= 0.35 ? "auto" : "none",
                visibility: progress < 0.05 ? "hidden" : "visible",
              }}
            >
              {/* Minimal Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/75 border border-emerald-500/30 text-[11px] sm:text-xs font-semibold text-emerald-300 backdrop-blur-md shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>18 Years of Nishkam Seva in Vrindavan</span>
              </div>

              {/* Inspiring Headline */}
              <h1 className="font-serif text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.18] drop-shadow-xl text-left">
                In the holy soil of Vrindavan, no child&apos;s dream should end for want of a notebook.
              </h1>

              {/* Concise Tagline */}
              <p className="text-sm sm:text-base md:text-lg text-slate-100/90 leading-relaxed font-light drop-shadow max-w-xl text-left">
                Empowering underprivileged rural children through free evening tutoring, school supplies, and direct community seva across Mathura district.
              </p>

              {/* Primary Actions */}
              <div className="flex flex-wrap items-center justify-start gap-3 pt-1">
                <Link
                  href="/donate?project=aashayein-education"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold bg-[#2E5339] text-white hover:bg-[#23432b] transition-all shadow-xl hover:shadow-emerald-950/50 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
                >
                  <Heart className="w-4 h-4 fill-white text-white shrink-0" />
                  <span>Sponsor a Child — ₹500/mo</span>
                </Link>

                <Link
                  href="/projects/aashayein-education"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/15 text-white border border-white/25 hover:bg-white/25 transition-all backdrop-blur-md"
                >
                  <BookOpen className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>Explore Projects</span>
                </Link>
              </div>

              {/* Minimal Trust Strip */}
              <div className="pt-2 flex flex-wrap items-center justify-start gap-x-4 gap-y-1.5 text-[11px] sm:text-xs text-slate-200/90 font-medium border-t border-white/15 max-w-xl">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  100% Direct Allocation
                </span>
                <span className="text-white/30">•</span>
                <span>Registered Non-Profit</span>
                <span className="text-white/30">•</span>
                <Link
                  href="/blood-donation"
                  className="text-rose-300 hover:text-rose-200 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Droplet className="w-3 h-3 fill-rose-400 text-rose-400 shrink-0" />
                  24/7 Blood Registry →
                </Link>
              </div>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* CENTERED VIEW (Middle): Absolute overlay positioned in middle on load */}
            {/* ----------------------------------------------------------------- */}
            <div
              className="absolute inset-0 space-y-4 sm:space-y-5 text-center flex flex-col items-center justify-start text-white will-change-transform"
              style={{
                opacity: centeredOpacity,
                pointerEvents: progress < 0.35 ? "auto" : "none",
                visibility: progress > 0.95 ? "hidden" : "visible",
              }}
            >
              {/* Minimal Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/35 text-[11px] sm:text-xs font-semibold text-emerald-300 backdrop-blur-md shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>18 Years of Nishkam Seva in Vrindavan</span>
              </div>

              {/* Inspiring Headline */}
              <h1 className="font-serif text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.18] drop-shadow-2xl text-center">
                In the holy soil of Vrindavan, no child&apos;s dream should end for want of a notebook.
              </h1>

              {/* Concise Tagline */}
              <p className="text-sm sm:text-base md:text-lg text-slate-100/90 leading-relaxed font-light drop-shadow-lg max-w-xl text-center mx-auto">
                Empowering underprivileged rural children through free evening tutoring, school supplies, and direct community seva across Mathura district.
              </p>

              {/* Primary Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <Link
                  href="/donate?project=aashayein-education"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold bg-[#2E5339] text-white hover:bg-[#23432b] transition-all shadow-2xl hover:shadow-emerald-950/50 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
                >
                  <Heart className="w-4 h-4 fill-white text-white shrink-0" />
                  <span>Sponsor a Child — ₹500/mo</span>
                </Link>

                <Link
                  href="/projects/aashayein-education"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/20 text-white border border-white/30 hover:bg-white/30 transition-all backdrop-blur-md"
                >
                  <BookOpen className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>Explore Projects</span>
                </Link>
              </div>

              {/* Minimal Trust Strip */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] sm:text-xs text-slate-200/90 font-medium border-t border-white/20 max-w-xl mx-auto">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  100% Direct Allocation
                </span>
                <span className="text-white/40">•</span>
                <span>Registered Non-Profit</span>
                <span className="text-white/40">•</span>
                <Link
                  href="/blood-donation"
                  className="text-rose-300 hover:text-rose-200 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Droplet className="w-3 h-3 fill-rose-400 text-rose-400 shrink-0" />
                  24/7 Blood Registry →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Reusable Student Desk Card component:
 * Rendered side-by-side inside the video hero on desktop, and rendered immediately
 * below the hero section in normal document flow on mobile screens (<lg) so it is never
 * clipped or overlapped by mobile system bars.
 */
export function StudentDeskCard({
  aashayeinProject,
  percentAashayein,
}: HeroVideoScrollProps) {
  return (
    <div className="border border-prayas-rule bg-white rounded-2xl p-4 sm:p-6 2xl:p-8 shadow-2xl space-y-3.5 sm:space-y-5 text-prayas-ink">
      <div className="flex items-center justify-between border-b border-prayas-rule pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-prayas-neem animate-pulse shrink-0" />
          <span className="text-[11px] sm:text-xs 2xl:text-sm font-bold uppercase tracking-wider text-prayas-neem">
            Project Aashayein Student Desk
          </span>
        </div>
        <span className="text-[10px] sm:text-[11px] 2xl:text-xs text-prayas-muted font-mono">
          Academic Year 2026
        </span>
      </div>

      {/* Progress Snapshot */}
      <div className="p-3 sm:p-4 2xl:p-5 rounded-xl bg-prayas-paper border border-prayas-rule space-y-2 sm:space-y-2.5 text-prayas-ink">
        <div className="flex flex-wrap justify-between items-baseline gap-1 sm:gap-2">
          <span className="text-xs 2xl:text-sm font-bold text-prayas-ink">
            Children in 6 Evening Centers
          </span>
          <span className="font-serif text-lg sm:text-xl 2xl:text-2xl font-bold text-prayas-neem shrink-0">
            320 Students
          </span>
        </div>
        <div className="flex flex-wrap justify-between items-baseline text-xs 2xl:text-sm text-prayas-muted gap-1 sm:gap-2">
          <span>Awaiting Educational Sponsors:</span>
          <span className="font-bold text-amber-800 shrink-0">85 Children</span>
        </div>
        <div className="w-full h-2 bg-prayas-stone rounded-full overflow-hidden border border-prayas-rule">
          <div
            className="h-full bg-prayas-neem rounded-full"
            style={{ width: `${percentAashayein}%` }}
          />
        </div>
        <p className="text-[11px] 2xl:text-xs text-prayas-muted leading-relaxed">
          ₹{aashayeinProject?.raisedAmount?.toLocaleString("en-IN") || "2,15,000"} raised of ₹{aashayeinProject?.goalAmount?.toLocaleString("en-IN") || "3,50,000"} target for notebooks, uniforms, and volunteer teacher honorariums.
        </p>
      </div>

      {/* Sponsorship Tiers */}
      <div className="space-y-2 text-xs 2xl:text-sm">
        <span className="font-bold text-prayas-ink block">
          Transparent Sponsorship Options:
        </span>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
          <Link
            href="/donate?project=aashayein-education&amount=500"
            className="p-2 sm:p-2.5 rounded-lg border border-prayas-rule bg-prayas-stone hover:bg-green-50 hover:border-prayas-neem transition-colors block text-prayas-ink"
          >
            <strong className="block font-serif text-[11px] xs:text-xs sm:text-sm 2xl:text-base font-bold text-prayas-ink">
              ₹500/mo
            </strong>
            <span className="text-[9px] sm:text-[10px] 2xl:text-xs text-prayas-muted block leading-tight mt-0.5">
              Books & Tuition
            </span>
          </Link>
          <Link
            href="/donate?project=aashayein-education&amount=1100"
            className="p-2 sm:p-2.5 rounded-lg border border-prayas-neem bg-green-50/80 hover:bg-green-100 transition-colors block ring-1 ring-prayas-neem/40 text-prayas-ink"
          >
            <strong className="block font-serif text-[11px] xs:text-xs sm:text-sm 2xl:text-base font-bold text-prayas-neem">
              ₹1,100/mo
            </strong>
            <span className="text-[9px] sm:text-[10px] 2xl:text-xs text-green-900 font-semibold block leading-tight mt-0.5">
              Full Care
            </span>
          </Link>
          <Link
            href="/donate?project=aashayein-education&amount=6000"
            className="p-2 sm:p-2.5 rounded-lg border border-prayas-rule bg-prayas-stone hover:bg-green-50 hover:border-prayas-neem transition-colors block text-prayas-ink"
          >
            <strong className="block font-serif text-[11px] xs:text-xs sm:text-sm 2xl:text-base font-bold text-prayas-ink">
              ₹6,000/yr
            </strong>
            <span className="text-[9px] sm:text-[10px] 2xl:text-xs text-prayas-muted block leading-tight mt-0.5">
              Full Year
            </span>
          </Link>
        </div>
      </div>

      <div>
        <Link
          href="/donate?project=aashayein-education"
          className="w-full py-3 sm:py-3.5 2xl:py-4 px-4 rounded-xl text-center font-bold text-xs sm:text-sm 2xl:text-base bg-[#2E5339] text-white hover:bg-[#23432b] transition-all shadow-md flex items-center justify-center gap-2"
          style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
        >
          <Heart className="w-4 h-4 fill-white text-white shrink-0" />
          <span className="font-bold text-white">Sponsor a Student Today →</span>
        </Link>
      </div>

      <div className="border-t border-prayas-rule pt-2 text-[10px] sm:text-[11px] 2xl:text-xs text-prayas-muted text-center">
        Donors receive quarterly student progress report cards and handwritten letters.
      </div>
    </div>
  );
}
