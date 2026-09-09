"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { assetPath } from "@/lib/api";
import {
  Heart,
  Droplet,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  ChevronDown,
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPinned, setIsPinned] = useState(true);
  const [logoPos, setLogoPos] = useState({
    left: "90.6%",
    top: "83.3%",
    size: 54,
    visible: true,
  });

  // Strictly enforce 0.85x playback speed and permanent silence (zero voice/sound)
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
      // If already scrolled down, reveal immediately; otherwise give 150ms black buffer before slow fade
      if (typeof window !== "undefined" && window.scrollY > 100) {
        setIsVideoLoaded(true);
      } else {
        fadeTimer = setTimeout(() => {
          setIsVideoLoaded(true);
        }, 150);
      }
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

  // Initial fullscreen check on mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.pathname === "/" && window.scrollY < 80) {
      document.documentElement.classList.add("hero-video-fullscreen");
    }
  }, []);

  // Crisp, responsive scroll listener (runway: 800px for generous, comfortable settling)
  useEffect(() => {
    let ticking = false;

    const updateScrollProgress = () => {
      if (!containerRef.current) return;
      const scrollY = window.scrollY;
      const runwayDistance = 800; // Generous distance for video settle, header appearance & reading time

      const currentProgress = Math.min(Math.max(scrollY / runwayDistance, 0), 1);
      setProgress(currentProgress);
      setIsPinned(scrollY < runwayDistance);

      // Manage html class for header visibility
      if (currentProgress < 0.18 && scrollY < 140) {
        document.documentElement.classList.add("hero-video-fullscreen");
      } else {
        document.documentElement.classList.remove("hero-video-fullscreen");
      }

      // Broadcast progress to Navbar
      document.documentElement.dataset.heroVideoProgress = currentProgress.toFixed(3);
      window.dispatchEvent(
        new CustomEvent("hero-video-scroll", { detail: { progress: currentProgress } })
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

  const isFullscreen = progress < 0.18;

  // Calculate exact position of the watermark in the video accounting for object-cover
  useEffect(() => {
    const updateLogo = () => {
      const container = videoContainerRef.current;
      if (!container) return;
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      if (cw === 0 || ch === 0) return;

      const videoAspect = 16 / 9; // 1280 / 720 source video aspect ratio
      const containerAspect = cw / ch;

      let renderedW = cw;
      let renderedH = ch;
      let offsetX = 0;
      let offsetY = 0;

      if (containerAspect > videoAspect) {
        // Wider than 16:9: video fits width, cropped top/bottom
        renderedW = cw;
        renderedH = cw / videoAspect;
        offsetY = (ch - renderedH) / 2;
      } else {
        // Taller than 16:9: video fits height, cropped left/right
        renderedH = ch;
        renderedW = ch * videoAspect;
        offsetX = (cw - renderedW) / 2;
      }

      // Watermark center in the 1280x720 video:
      // x = 1159.5 / 1280 = 0.905859
      // y = 600.0 / 720 = 0.833333
      const wmX = offsetX + renderedW * (1159.5 / 1280);
      const wmY = offsetY + renderedH * (600.0 / 720);

      // Scale logo size proportionally with the rendered video size
      const baseLogoSize = Math.max(Math.min(renderedW * 0.044, 66), 38);

      // On narrow mobile screens where video right edge is cropped, ensure the logo stays gracefully within viewport
      const clampedX = Math.max(Math.min(wmX, cw - baseLogoSize * 0.75), baseLogoSize * 0.75);
      const clampedY = Math.max(Math.min(wmY, ch - baseLogoSize * 0.75), baseLogoSize * 0.75);

      setLogoPos({
        left: `${clampedX}px`,
        top: `${clampedY}px`,
        size: Math.round(baseLogoSize),
        visible: true,
      });
    };

    updateLogo();
    window.addEventListener("resize", updateLogo);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && videoContainerRef.current) {
      observer = new ResizeObserver(updateLogo);
      observer.observe(videoContainerRef.current);
    }

    return () => {
      window.removeEventListener("resize", updateLogo);
      if (observer) observer.disconnect();
    };
  }, []);

  // Smooth scroll down to settled hero section
  const scrollToHero = useCallback(() => {
    const targetScrollY = 800;
    if ((window as any).lenis?.scrollTo) {
      (window as any).lenis.scrollTo(targetScrollY, { duration: 1.2 });
    } else {
      window.scrollTo({ top: targetScrollY, behavior: "smooth" });
    }
  }, []);

  // =========================================================================
  // ANIMATION CALCULATIONS (800px runway)
  // =========================================================================
  // 1. Fullscreen intro prompt fades out quickly (0px to 120px)
  const promptOpacity = Math.max(1 - progress / 0.15, 0);

  // 2. Video Dims as you scroll: from 0.15 to 0.60 (120px to 480px, stays gently dimmed 480px..800px)
  // Subtle balanced dimming so the video remains alive, colorful, and clearly visible with strong text contrast
  const rawDimProgress = Math.min(Math.max((progress - 0.15) / 0.45, 0), 1);
  const dimOpacity = rawDimProgress * 0.85;

  // 3. Content appears on top of the dimmed video: from 0.20 to 0.65 (160px to 520px)
  // Fully loaded & settled from 0.65 to 1.0 (520px to 800px) before video scrolls up
  const rawContentProgress = Math.min(Math.max((progress - 0.2) / 0.45, 0), 1);
  const contentEase = 1 - Math.pow(1 - rawContentProgress, 3);
  const contentOpacity = contentEase;
  const contentTranslateY = (1 - contentEase) * 28;

  const isContentInteractive = contentOpacity > 0.8;

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: "calc(100dvh + 800px)" }}
      id="hero-video-track"
    >
      {/* Pinned Frame: Fixed at top: 0 while scrollY < 800px so video NEVER moves up during animation; then absolute at bottom: 0 so it scrolls away naturally only AFTER all content has appeared on top */}
      <div
        style={
          isPinned
            ? {
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                width: "100%",
                height: "100dvh",
                zIndex: 10,
              }
            : {
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                width: "100%",
                height: "100dvh",
                zIndex: 10,
              }
        }
        className="w-full overflow-hidden flex items-start lg:items-center justify-center bg-black border-b border-prayas-rule"
      >
        {/* ===================================================================== */}
        {/* Continuous Background Video (0.85x speed, 100% silent, loop)         */}
        {/* Slow cinematic fade-in when site loads                                */}
        {/* ===================================================================== */}
        <div ref={videoContainerRef} className="absolute inset-0 w-full h-full overflow-hidden bg-black">
          <video
            ref={videoRef}
            src={assetPath("/videos/make_one_more_video_in_the_con.mp4")}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className={`w-full h-full object-cover object-center will-change-transform transition-opacity duration-[2400ms] ease-out ${
              isVideoLoaded ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* ================================================================= */}
          {/* Prayas Logo Overlay: Covers Gemini watermark & animates with video */}
          {/* ================================================================= */}
          {logoPos.visible && (
            <div
              style={{
                position: "absolute",
                left: logoPos.left,
                top: logoPos.top,
                width: `${logoPos.size}px`,
                height: `${logoPos.size}px`,
                transform: "translate(-50%, -50%)",
              }}
              className={`pointer-events-none z-1 rounded-full shadow-lg shadow-black/50 will-change-transform transition-opacity duration-[2400ms] ease-out ${
                isVideoLoaded ? "opacity-100" : "opacity-0"
              }`}
              title="Prayas Pariwaar"
            >
              <img
                src={assetPath("/images/prayas-circular-logo.png")}
                alt="Prayas Pariwaar"
                className="w-full h-full object-contain rounded-full bg-white/95"
              />
            </div>
          )}
        </div>

        {/* ===================================================================== */}
        {/* Dimming Vignette Overlay: Balanced for crystal clarity & vibrancy     */}
        {/* Subtle cinematic gradient: protects text contrast, leaves video clear */}
        {/* ===================================================================== */}
        <div
          className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-300 bg-gradient-to-t lg:bg-gradient-to-r from-black/80 via-black/50 to-black/20 lg:from-black/78 lg:via-black/45 lg:to-black/10"
          style={{ opacity: dimOpacity }}
        />

        {/* ===================================================================== */}
        {/* Fullscreen Initial Prompt (Animated Mouse Wheel Icon)                 */}
        {/* ===================================================================== */}
        <div
          className={`absolute inset-0 z-30 pointer-events-none flex flex-col justify-end p-6 sm:p-10 transition-opacity duration-1000 delay-500`}
          style={{
            opacity: isVideoLoaded ? promptOpacity : 0,
            visibility: promptOpacity > 0.01 && isVideoLoaded ? "visible" : "hidden",
          }}
        >
          <div className="w-full flex flex-col items-center justify-center pb-8 sm:pb-12">
            <button
              onClick={scrollToHero}
              type="button"
              className="pointer-events-auto flex flex-col items-center transition-all transform hover:scale-110 active:scale-95 group focus:outline-none"
              aria-label="Scroll down to explore"
              title="Scroll down to explore"
            >
              {/* Outer mouse frame */}
              <div className="w-6 h-10 rounded-full border-2 border-white/80 bg-black/30 backdrop-blur-xs flex items-start justify-center pt-2 shadow-xl group-hover:border-white transition-colors">
                {/* Scrolling wheel pill */}
                <div className="w-1 h-2.5 rounded-full bg-white animate-mouse-wheel shadow-sm" />
              </div>
            </button>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* Settled Hero Content (Starts appearing on top of the dimmed video)    */}
        {/* ===================================================================== */}
        <div
          className="relative z-20 w-full max-w-7xl 2xl:max-w-[1440px] 3xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 pt-[90px] xs:pt-[94px] sm:pt-24 lg:pt-24 2xl:pt-28 pb-20 sm:pb-24 lg:pb-12"
          style={{
            pointerEvents: isContentInteractive ? "auto" : "none",
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 2xl:gap-16 items-center">
            {/* Left Narrative: The Emotional Calling */}
            <div
              className="lg:col-span-7 2xl:col-span-7 space-y-3 sm:space-y-4 2xl:space-y-6 text-left text-white will-change-transform"
              style={{
                opacity: contentOpacity,
                transform: `translateY(${contentTranslateY}px)`,
              }}
            >
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-emerald-950/85 border border-emerald-500/40 text-[10px] sm:text-xs 2xl:text-sm font-bold text-emerald-300 backdrop-blur-md shadow-md max-w-full">
                <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                <span className="truncate">Project Aashayein • 18 Years of Nishkam Seva in Vrindavan</span>
              </div>

              <h1 className="font-serif text-lg xs:text-xl sm:text-3xl md:text-4xl lg:text-5xl 2xl:text-6xl font-bold tracking-tight text-white leading-[1.22] drop-shadow-md">
                In the holy soil of Vrindavan, no child&apos;s dream should end for want of a notebook.
              </h1>

              <p className="text-xs sm:text-sm md:text-base lg:text-lg 2xl:text-xl text-slate-100 leading-relaxed max-w-2xl 2xl:max-w-3xl font-light drop-shadow line-clamp-3 sm:line-clamp-none">
                For 18 years, <strong>Prayas Pariwaar</strong> has stood beside daily-wage and rural families across Mathura district — ensuring free evening study centers, school supplies, emergency blood coordination, and home oxygen support with <strong>zero administrative deductions</strong>.
              </p>

              {/* Direct Emotional Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
                <Link
                  href="/donate?project=aashayein-education"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3.5 2xl:px-8 2xl:py-4 rounded-xl text-xs sm:text-sm 2xl:text-base font-bold bg-[#2E5339] text-white hover:bg-[#23432b] transition-all shadow-xl hover:shadow-emerald-950/50 text-center"
                  style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
                >
                  <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white text-white shrink-0" />
                  <span>Sponsor a Child&apos;s Education — ₹500/mo</span>
                </Link>

                <Link
                  href="/projects/aashayein-education"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2.5 sm:px-5 sm:py-3.5 2xl:px-7 2xl:py-4 rounded-xl text-xs sm:text-sm 2xl:text-base font-semibold bg-white/15 text-white border border-white/30 hover:bg-white/25 transition-all backdrop-blur-md text-center"
                >
                  <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300 shrink-0" />
                  <span>Explore Project Aashayein</span>
                </Link>
              </div>

              {/* Trust & Emergency Blood Link */}
              <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-y-1.5 gap-x-4 sm:gap-x-6 text-[11px] sm:text-xs 2xl:text-sm text-slate-200 border-t border-white/20">
                <span className="flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  Registered Non-Profit
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  100% Direct to Beneficiaries
                </span>
                <Link
                  href="/blood-donation"
                  className="flex items-center gap-1 font-semibold text-rose-300 hover:text-rose-200 underline decoration-rose-400/50"
                >
                  <Droplet className="w-3 h-3 fill-current text-rose-400 shrink-0" />
                  24/7 Emergency Blood Registry →
                </Link>
              </div>
            </div>

            {/* Right Column: Live Student Sponsorship Desk (Desktop / Large Viewports) */}
            <div
              className="hidden lg:block lg:col-span-5 2xl:col-span-5 w-full will-change-transform"
              style={{
                opacity: contentOpacity,
                transform: `translateY(${contentTranslateY}px)`,
              }}
            >
              <StudentDeskCard
                aashayeinProject={aashayeinProject}
                percentAashayein={percentAashayein}
              />
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
