"use client";

import React, { useState, useEffect, useRef } from "react";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

interface StatItem {
  id: string;
  category: string;
  numericValue: number;
  prefix?: string;
  suffix: string;
  title: string;
  subtitle: string;
  accentColor: string;
  bgGlow: string;
}

const stats: StatItem[] = [
  {
    id: "tutoring",
    category: "STUDENTS",
    numericValue: 320,
    suffix: "+",
    title: "Children Tutored Daily",
    subtitle: "6 Evening learning centers in Vrindavan",
    accentColor: "text-emerald-800",
    bgGlow: "group-hover:border-emerald-500/40",
  },
  {
    id: "trees",
    category: "PLANTATION",
    numericValue: 5400,
    suffix: "+",
    title: "Native Trees Planted",
    subtitle: "Neem & Kadamba with protective guards",
    accentColor: "text-emerald-700",
    bgGlow: "group-hover:border-emerald-500/40",
  },
  {
    id: "blood",
    category: "EMERGENCY BLOOD",
    numericValue: 8200,
    suffix: "+",
    title: "Blood Units Coordinated",
    subtitle: "24/7 volunteer emergency donor network",
    accentColor: "text-rose-700",
    bgGlow: "group-hover:border-rose-500/40",
  },
  {
    id: "legacy",
    category: "FOUNDATION",
    numericValue: 18,
    suffix: " Years",
    title: "Unbroken Nishkam Seva",
    subtitle: "100% Direct • Zero Admin Deductions",
    accentColor: "text-amber-700",
    bgGlow: "group-hover:border-amber-500/40",
  },
];

export default function HomeImpactLedger() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [counts, setCounts] = useState<{ [key: string]: number }>({
    tutoring: 0,
    trees: 0,
    blood: 0,
    legacy: 0,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCounts({ tutoring: 320, trees: 5400, blood: 8200, legacy: 18 });
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 2000; // 2s duration matching Smile Foundation counter
          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3); // cubic ease-out

            setCounts({
              tutoring: Math.floor(ease * 320),
              trees: Math.floor(ease * 5400),
              blood: Math.floor(ease * 8200),
              legacy: Math.floor(ease * 18),
            });

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCounts({ tutoring: 320, trees: 5400, blood: 8200, legacy: 18 });
            }
          };

          requestAnimationFrame(animate);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <div
      ref={containerRef}
      className="border border-prayas-rule bg-white rounded-2xl shadow-card overflow-hidden transition-all duration-300"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-prayas-rule text-center">
        {stats.map((stat) => {
          const currentCount = counts[stat.id] || 0;
          const displayValue = currentCount.toLocaleString("en-IN");

          return (
            <div
              key={stat.id}
              className="group p-5 sm:p-6 lg:p-7 space-y-1.5 hover:bg-slate-50/80 transition-all duration-300 cursor-default relative overflow-hidden"
            >
              {/* Top Category Badge */}
              <div className="flex justify-center">
                <span className="text-[10px] 2xl:text-[11px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-prayas-neem transition-colors">
                  {stat.category}
                </span>
              </div>

              {/* Animated Big Counter */}
              <div className="flex items-baseline justify-center">
                <span
                  className={`font-serif text-3xl sm:text-4xl lg:text-4xl 2xl:text-5xl font-bold tracking-tight ${stat.accentColor} transition-transform duration-300 group-hover:scale-105 inline-block`}
                >
                  {displayValue}
                  {stat.suffix}
                </span>
              </div>

              {/* Title & Subtitle */}
              <p className="text-xs sm:text-sm font-bold text-prayas-ink pt-0.5">
                {stat.title}
              </p>
              <p className="text-[11px] sm:text-xs text-prayas-muted leading-tight">
                {stat.subtitle}
              </p>
            </div>
          );
        })}
      </div>

      {/* Statutory Trust Reassurance Band */}
      <div className="bg-prayas-stone/60 border-t border-prayas-rule px-4 py-2.5 flex flex-wrap items-center justify-around gap-2 text-[11px] sm:text-xs text-prayas-muted font-medium text-center">
        <span className="flex items-center gap-1.5 text-slate-700">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>Society Reg: <strong>142/2006-07</strong></span>
        </span>
        <span className="hidden sm:inline text-slate-300">•</span>
        <span className="flex items-center gap-1.5 text-slate-700">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>Income Tax: <strong>12A Certified</strong></span>
        </span>
        <span className="hidden sm:inline text-slate-300">•</span>
        <span className="flex items-center gap-1.5 text-slate-700">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>NITI Aayog Darpan: <strong>UP/2017/0154210</strong></span>
        </span>
        <span className="hidden sm:inline text-slate-300">•</span>
        <span className="flex items-center gap-1.5 text-emerald-900 font-bold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>100% Volunteer Driven Society</span>
        </span>
      </div>
    </div>
  );
}
