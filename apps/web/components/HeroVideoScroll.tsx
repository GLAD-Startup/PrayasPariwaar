"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { assetPath } from "@/lib/api";


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
  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);

  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isDimmed, setIsDimmed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasCompletedHero, setHasCompletedHero] = useState(false);
  const hasCompletedHeroRef = useRef(false);
  const progressRef = useRef(0);
  progressRef.current = progress;

  // Reduce video brightness after 2 seconds once website loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDimmed(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

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

  // Detect mobile device
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth < 768);
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // Strictly enforce permanent silence (muted autoplay requirement)
  // and trigger auto-settlement after 3.8 seconds of video playing
  useEffect(() => {
    const desktopVideo = desktopVideoRef.current;
    const mobileVideo = mobileVideoRef.current;
    const activeVideos = [desktopVideo, mobileVideo].filter(Boolean) as HTMLVideoElement[];
    if (activeVideos.length === 0) return;

    const enforceSettings = () => {
      activeVideos.forEach((v) => {
        v.muted = true;
        v.defaultMuted = true;
      });
    };

    enforceSettings();

    let fadeTimer: NodeJS.Timeout;
    let autoSettleTimer: NodeJS.Timeout | null = null;
    let triggered = false;

    const triggerSlowFade = () => {
      if (triggered) return;
      triggered = true;
      enforceSettings();
      activeVideos.forEach((v) => {
        v.play().catch(() => {});
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
        autoSettleTimer = setTimeout(() => {
          settleHero();
        }, 3800);
      }
    };

    const handleTimeUpdate = (e: Event) => {
      if (hasCompletedHeroRef.current) return;
      const target = e.target as HTMLVideoElement;
      if (target && target.currentTime >= 3.5) {
        settleHero();
      }
    };

    activeVideos.forEach((video) => {
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
      activeVideos.forEach((video) => {
        video.removeEventListener("loadeddata", triggerSlowFade);
        video.removeEventListener("canplaythrough", triggerSlowFade);
        video.removeEventListener("playing", triggerSlowFade);
        video.removeEventListener("playing", handlePlaying);
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("play", enforceSettings);
        video.removeEventListener("loadedmetadata", enforceSettings);
      });
    };
  }, [settleHero]);

  // Initial fullscreen check on mount: only add fullscreen if hero has not completed
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      (window.location.pathname === "/" ||
        window.location.pathname === "/prayas" ||
        window.location.pathname === "/prayas/") &&
      window.scrollY < 80
    ) {
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
        className="w-full overflow-hidden flex items-center justify-center bg-black border-b border-prayas-rule"
      >
        {/* ===================================================================== */}
        {/* Background: Video on Desktop, Optimized Portrait Video on Mobile      */}
        {/* ===================================================================== */}
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
          {/* Desktop Landscape Video */}
          <video
            ref={desktopVideoRef}
            src={assetPath("/videos/ai_video.mp4")}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            style={{
              filter: isDimmed ? "brightness(0.85)" : "brightness(1)",
              transition: "filter 1400ms ease-in-out, opacity 2400ms ease-out",
            }}
            className={`hidden md:block w-full h-full object-cover object-center will-change-transform ${
              isVideoLoaded ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Mobile Portrait Video (optimized vertical cut for mobile screens) */}
          <video
            ref={mobileVideoRef}
            src={assetPath("/videos/ai_mobile.mp4")}
            poster={assetPath("/images/hero-mobile-children.jpg")}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            style={{
              filter: isDimmed ? "brightness(0.85)" : "brightness(1)",
              transition: "filter 1400ms ease-in-out, opacity 2400ms ease-out",
            }}
            className={`block md:hidden w-full h-full object-cover object-center will-change-transform ${
              isVideoLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>

        {/* Clean, balanced overlay for readability (darker on lower-left on desktop, darker at bottom on mobile) */}
        <div
          className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-700 ease-out bg-gradient-to-t from-black/95 via-black/60 to-black/30 md:bg-gradient-to-tr md:from-black/90 md:via-black/60 md:via-45% md:to-transparent"
          style={{ opacity: dimOpacity }}
        />

        {/* ===================================================================== */}
        {/* Settled Hero Content: Lower-Left alignment with rich copy             */}
        {/* ===================================================================== */}
        <div
          className="relative z-20 w-full max-w-6xl xl:max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 pt-28 sm:pt-36 lg:pt-40 pb-12 sm:pb-16 lg:pb-20 flex flex-col items-start justify-end text-left min-h-[100dvh]"
          style={{
            pointerEvents: isContentInteractive ? "auto" : "none",
          }}
        >
          <div
            className="max-w-xl lg:max-w-2xl space-y-3.5 sm:space-y-4 will-change-transform transition-all duration-700 ease-out"
            style={{
              opacity: contentOpacity,
              transform: `translateY(${contentTranslateY}px)`,
            }}
          >
            {/* Small clean eyebrow */}
            <p className="text-[11px] sm:text-xs font-semibold tracking-wider text-amber-300 uppercase">
              Small Help Can Make Change • Vrindavan Seva
            </p>

            {/* Compact, bold headline */}
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.2] drop-shadow-md">
              New Hope for Every Child
            </h1>

            {/* Rich, heartfelt description */}
            <p className="text-xs sm:text-sm md:text-base text-white/90 leading-relaxed max-w-xl font-normal drop-shadow">
              Your small contribution creates a lifelong impact. For 18 years, Prayas Pariwaar has provided free evening tutoring, books, uniforms, and daily nutrition to over 300 children across 6 learning centers in Vrindavan — ensuring poverty never stops a child&apos;s right to learn.
            </p>

            {/* Correctly colored brand buttons with neat compact padding */}
            <div className="flex flex-wrap items-center justify-start gap-3 sm:gap-4 pt-1 sm:pt-2">
              <Link
                href="/donate"
                className="w-full xs:w-auto px-6 py-2.5 sm:px-7 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm bg-[#2E5339] hover:bg-[#23432b] text-white transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 text-center tracking-wide"
                style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
              >
                Donate Now
              </Link>

              <Link
                href="/projects"
                className="w-full xs:w-auto px-6 py-2.5 sm:px-7 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm bg-white/15 hover:bg-white/25 text-white border border-white/25 backdrop-blur-md transition-all hover:scale-105 active:scale-95 text-center"
              >
                Explore Causes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


