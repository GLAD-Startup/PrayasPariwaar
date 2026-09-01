"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

interface SmoothScrollProps {
  children: React.ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const pathname = usePathname();
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    let active = true;
    let rafId: number;
    let lenisInstance: any = null;

    // Dynamically import lenis on client side safely with fallback
    import("lenis")
      .then((module) => {
        const Lenis = module.default || module;
        if (!active || !Lenis) return;

        const lenis = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: "vertical",
          gestureOrientation: "vertical",
          smoothWheel: true,
          wheelMultiplier: 0.9,
          touchMultiplier: 1.5,
          infinite: false,
        });

        lenisInstance = lenis;
        lenisRef.current = lenis;
        (window as any).lenis = lenis;

        function raf(time: number) {
          lenis.raf(time);
          rafId = requestAnimationFrame(raf);
        }

        rafId = requestAnimationFrame(raf);
      })
      .catch(() => {
        // Fallback to native smooth scrolling
        if (typeof document !== "undefined") {
          document.documentElement.style.scrollBehavior = "smooth";
        }
      });

    // Intercept in-page hash links for smooth animated scrolling
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (
        anchor &&
        anchor.hash &&
        anchor.origin === window.location.origin &&
        anchor.pathname === window.location.pathname
      ) {
        const targetElement = document.querySelector(anchor.hash);
        if (targetElement) {
          e.preventDefault();
          if (lenisRef.current) {
            lenisRef.current.scrollTo(targetElement as HTMLElement, {
              offset: -80,
              duration: 1.2,
            });
          } else {
            targetElement.scrollIntoView({ behavior: "smooth" });
          }
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);

    return () => {
      active = false;
      document.removeEventListener("click", handleAnchorClick);
      if (rafId) cancelAnimationFrame(rafId);
      if (lenisInstance) lenisInstance.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Smoothly reset scroll position to top on page navigations
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" as any });
    }
  }, [pathname]);

  return <>{children}</>;
}
