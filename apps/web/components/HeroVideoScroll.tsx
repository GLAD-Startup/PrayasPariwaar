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
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasCompletedHero, setHasCompletedHero] = useState(false);
  const hasCompletedHeroRef = useRef(false);
  const progressRef = useRef(0);
  progressRef.current = progress;

  // Initialize flag from sessionStorage or current scroll position on client
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedSettled = sessionStorage.getItem("prayas_hero_settled") === "1";
      if (storedSettled || window.scrollY >= 80) {
        hasCompletedHeroRef.current = true;
        setHasCompletedHero(true);
        setProgress(1);
        document.documentElement.dataset.heroVideoSettled = "true";
        document.documentElement.dataset.heroVideoProgress = "1.000";
        document.documentElement.classList.remove("hero-video-fullscreen");
      }
    }
  }, []);

  // Smoothly settles the hero into the main page state
  const settleHero = useCallback(() => {
    if (hasCompletedHeroRef.current) return;
    hasCompletedHeroRef.current = true;
    setHasCompletedHero(true);

    try {
      sessionStorage.setItem("prayas_hero_settled", "1");
    } catch (e) {}

    document.documentElement.dataset.heroVideoSettled = "true";
    document.documentElement.dataset.heroVideoProgress = "1.000";
    document.documentElement.classList.remove("hero-video-fullscreen");

    window.dispatchEvent(
      new CustomEvent("hero-video-scroll", { detail: { progress: 1 } })
    );

    // Smoothly animate progress from current value to 1.0
    const startProgress = progressRef.current;
    const duration = 750; // 750ms silky-smooth cubic ease-out
    const startTime = performance.now();

    const animateTransition = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      const currentVal = startProgress + (1 - startProgress) * ease;
      setProgress(currentVal);

      if (t < 1) {
        requestAnimationFrame(animateTransition);
      } else {
        setProgress(1);
      }
    };

    requestAnimationFrame(animateTransition);
  }, []);

  // Strictly enforce 0.85x playback speed and permanent silence (zero voice/sound),
  // and trigger auto-settlement after 3-5 seconds of video playing (not full video)
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
    let autoSettleTimer: NodeJS.Timeout | null = null;
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

    // Auto-transition to main page after 3-5 seconds of video playback
    const handlePlaying = () => {
      enforceSettings();
      if (hasCompletedHeroRef.current) return;
      if (!autoSettleTimer) {
        // ~3.8 seconds from actual playback start ensures visitor enjoys 3-5s of intro video
        autoSettleTimer = setTimeout(() => {
          settleHero();
        }, 3800);
      }
    };

    const handleTimeUpdate = () => {
      if (hasCompletedHeroRef.current) return;
      // 3.5s video currentTime at 0.85x speed equals ~4.1 real-world seconds
      if (video.currentTime >= 3.5) {
        settleHero();
      }
    };

    if (video.readyState >= 2) {
      triggerSlowFade();
    } else {
      video.addEventListener("loadeddata", triggerSlowFade, { once: true });
      video.addEventListener("canplaythrough", triggerSlowFade, { once: true });
      video.addEventListener("playing", triggerSlowFade, { once: true });
    }

    video.addEventListener("playing", handlePlaying);
    video.addEventListener("timeupdate", handleTimeUpdate);
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

    // Safety fallback: if video stalls or network is slow, reveal main page within 5 seconds
    const safetyTimer = setTimeout(() => {
      if (!hasCompletedHeroRef.current) {
        settleHero();
      }
    }, 5000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(fallbackTimer);
      clearTimeout(safetyTimer);
      if (autoSettleTimer) clearTimeout(autoSettleTimer);
      video.removeEventListener("loadeddata", triggerSlowFade);
      video.removeEventListener("canplaythrough", triggerSlowFade);
      video.removeEventListener("playing", triggerSlowFade);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", enforceSettings);
      video.removeEventListener("loadedmetadata", enforceSettings);
    };
  }, [settleHero]);

  // Initial fullscreen check on mount: only add fullscreen if hero has not completed
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.pathname === "/" && window.scrollY < 80) {
      const storedSettled = sessionStorage.getItem("prayas_hero_settled") === "1";
      if (!storedSettled && !hasCompletedHeroRef.current) {
        document.documentElement.classList.add("hero-video-fullscreen");
      }
    }
  }, []);

  // Listen for user scroll or interaction during intro to settle immediately without waiting
  useEffect(() => {
    if (hasCompletedHero) return;

    const handleEarlyInteraction = () => {
      if (!hasCompletedHeroRef.current) {
        settleHero();
      }
    };

    window.addEventListener("scroll", handleEarlyInteraction, { passive: true });
    window.addEventListener("wheel", handleEarlyInteraction, { passive: true });
    window.addEventListener("touchmove", handleEarlyInteraction, { passive: true });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", "Space"].includes(e.code)) {
        handleEarlyInteraction();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", handleEarlyInteraction);
      window.removeEventListener("wheel", handleEarlyInteraction);
      window.removeEventListener("touchmove", handleEarlyInteraction);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [hasCompletedHero, settleHero]);

  // =========================================================================
  // ANIMATION CALCULATIONS
  // =========================================================================
  // Smooth cubic ease transition as progress goes from 0 to 1
  const contentEase = 1 - Math.pow(1 - progress, 3);
  const dimOpacity = contentEase * 0.6;
  const contentOpacity = contentEase;
  const contentTranslateY = (1 - contentEase) * 20;
  const isContentInteractive = contentOpacity > 0.6;

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ minHeight: "100dvh" }}
      id="hero-video-track"
    >
      <div
        style={
          !hasCompletedHero
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
                position: "relative",
                width: "100%",
                minHeight: "100dvh",
                zIndex: 10,
              }
        }
        className="w-full overflow-hidden flex items-start lg:items-center justify-center bg-black border-b border-prayas-rule"
      >
        {/* ===================================================================== */}
        {/* Continuous Background Video (0.85x speed, 100% silent, loop)         */}
        {/* Slow cinematic fade-in when site loads                                */}
        {/* ===================================================================== */}
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
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
        </div>

        {/* ===================================================================== */}
        {/* Gentle Vignette: Leaves video vibrant & clear, protects text contrast */}
        {/* ===================================================================== */}
        <div
          className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-700 ease-out bg-gradient-to-t from-black/85 via-black/35 to-transparent lg:bg-gradient-to-r lg:from-black/80 lg:via-black/25 lg:to-transparent"
          style={{ opacity: dimOpacity }}
        />

        {/* ===================================================================== */}
        {/* Skip Intro Button: Minimal glassmorphic action during 3-5s intro      */}
        {/* ===================================================================== */}
        {!hasCompletedHero && isVideoLoaded && (
          <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 pointer-events-auto transition-opacity duration-500">
            <button
              onClick={settleHero}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 hover:bg-black/80 text-white/90 hover:text-white border border-white/25 backdrop-blur-md text-xs sm:text-sm font-medium transition-all shadow-xl hover:scale-105 active:scale-95 group focus:outline-none cursor-pointer"
              aria-label="Skip intro to main page"
              title="Skip intro to main page"
            >
              <span>Skip Intro</span>
              <span className="text-emerald-400 group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        )}

        {/* ===================================================================== */}
        {/* Settled Hero Content: Focused, minimal narrative over video           */}
        {/* ===================================================================== */}
        <div
          className="relative z-20 w-full max-w-7xl 2xl:max-w-[1440px] 3xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 pt-[110px] xs:pt-[116px] sm:pt-32 lg:pt-28 2xl:pt-32 pb-16 sm:pb-20 lg:pb-16 flex flex-col justify-end lg:justify-center min-h-[100dvh]"
          style={{
            pointerEvents: isContentInteractive ? "auto" : "none",
          }}
        >
          <div
            className="max-w-2xl 2xl:max-w-3xl space-y-4 sm:space-y-5 text-left text-white will-change-transform transition-all duration-700 ease-out"
            style={{
              opacity: contentOpacity,
              transform: `translateY(${contentTranslateY}px)`,
            }}
          >
            {/* Minimal Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/75 border border-emerald-500/30 text-[11px] sm:text-xs font-semibold text-emerald-300 backdrop-blur-md shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>18 Years of Nishkam Seva in Vrindavan</span>
            </div>

            {/* Inspiring Headline */}
            <h1 className="font-serif text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.18] drop-shadow-xl">
              In the holy soil of Vrindavan, no child&apos;s dream should end for want of a notebook.
            </h1>

            {/* Concise 1-Sentence Tagline */}
            <p className="text-sm sm:text-base md:text-lg text-slate-100/90 leading-relaxed font-light drop-shadow max-w-xl">
              Empowering underprivileged rural children through free evening tutoring, school supplies, and direct community seva across Mathura district.
            </p>

            {/* Direct Primary Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
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
            <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] sm:text-xs text-slate-200/90 font-medium border-t border-white/15 max-w-xl">
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
