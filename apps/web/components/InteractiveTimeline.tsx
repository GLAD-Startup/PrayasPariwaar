"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { assetPath } from "@/lib/api";
import TimelineImagePlaceholder from "./TimelineImagePlaceholder";
import {
  Calendar,
  MapPin,
  Sparkles,
  Award,
  Heart,
  Trees,
  GraduationCap,
  Droplet,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Play,
  Pause,
  Maximize2,
  X,
  ExternalLink,
  CheckCircle2,
  TrendingUp,
  Layers,
  ArrowRight,
  Compass,
  Quote as QuoteIcon,
} from "lucide-react";

export type MilestoneCategory = "all" | "education" | "health" | "plantation" | "institutional";

export interface TimelineMilestone {
  id: string;
  year: number;
  dateLabel: string;
  category: "education" | "health" | "plantation" | "institutional";
  categoryLabel: string;
  title: string;
  subtitle: string;
  location: string;
  imageUrl: string;
  impactBadge: string;
  summary: string;
  story: string;
  quote?: string;
  keyStats: { label: string; value: string }[];
  highlightTag?: string;
  linkUrl?: string;
  linkLabel?: string;
}

// 10 Distinct Milestones — Each has its own dedicated, unique documentary photograph!
const MILESTONES: TimelineMilestone[] = [
  {
    id: "m-2011",
    year: 2011,
    dateLabel: "October 2011",
    category: "education",
    categoryLabel: "Free Education",
    title: "First Open-Air Pathshala Under Ancient Banyan Tree",
    subtitle: "Informal evening study circle for riverbank boatmen and daily-wage families",
    location: "Kesi Ghat, Yamuna Bank, Vrindavan",
    imageUrl: "/images/timeline/timeline-2011-pathshala.jpg",
    impactBadge: "18 Children • 3 Student Volunteers",
    summary:
      "With kerosene lanterns, slates, and wooden chalk, local university students started an evening gathering teaching Hindi literacy and arithmetic to out-of-school children along Kesi Ghat.",
    story:
      "Prayas began not in a conference hall, but under the sprawling canopy of an ancient banyan tree overlooking the Yamuna river. Three local college students noticed young children spending their evenings begging or assisting boatmen. Instead of distributing spare coins, the youth brought jute mats, slates, and wooden chalk pencils. Within weeks, eighteen children were memorizing Hindi alphabets and multiplication tables every dusk as evening temple aarti bells echoed across the river.",
    quote: "Education is not charity; it is lighting an indestructible torch in the dark.",
    keyStats: [
      { label: "Initial Learners", value: "18 Children" },
      { label: "Teaching Mode", value: "Slates & Jute Mats" },
      { label: "Founding Sevadars", value: "3 Volunteers" },
    ],
    highlightTag: "Genesis of Seva",
    linkUrl: "/projects/aashayein-education",
    linkLabel: "Support Project Aashayein",
  },
  {
    id: "m-2013",
    year: 2013,
    dateLabel: "March 2013",
    category: "education",
    categoryLabel: "Free Education",
    title: "Establishment of 3 Dedicated Evening Learning Centers",
    subtitle: "Transitioning to structured tuition, free textbooks, and daily nutrition",
    location: "Raman Reti & Village Chhatikara",
    imageUrl: "/images/timeline/timeline-2013-centers.jpg",
    impactBadge: "120+ Daily Learners • Free School Bags & Meals",
    summary:
      "Scaled from an open-air gathering into three permanent evening study circles with syllabus tracking, free textbooks, school bags, and nutritious mid-day milk and snacks.",
    story:
      "As word spread among village households, parents who worked daily construction shifts requested evening learning circles for their older children. Prayas secured community verandas in Raman Reti and Chhatikara. Volunteer mentors established structured assessments, helping children achieve age-appropriate grade levels so they could pass formal government school entrance exams.",
    quote: "Every child should return home with curiosity ignited and stomach full.",
    keyStats: [
      { label: "Daily Students", value: "120+ Children" },
      { label: "Learning Centers", value: "3 Village Hubs" },
      { label: "Nutritional Support", value: "Daily Milk & Fruits" },
    ],
    linkUrl: "/projects/aashayein-education",
    linkLabel: "Explore Study Centers",
  },
  {
    id: "m-2015",
    year: 2015,
    dateLabel: "July 2015",
    category: "health",
    categoryLabel: "Emergency Blood & Health",
    title: "Launch of 24/7 Emergency Blood Coordination Desk",
    subtitle: "Dedicated round-the-clock voluntary donor dispatch across Mathura district hospitals",
    location: "District Combined Hospital & Sevashrama, Mathura",
    imageUrl: "/images/timeline/timeline-2015-blood-desk.jpg",
    impactBadge: "500+ Donors Enrolled • 45-Min Response Window",
    summary:
      "Initiated a volunteer-operated emergency helpline connecting critical accident trauma cases and high-risk maternity patients with matched voluntary blood donors within 45 minutes.",
    story:
      "Witnessing poor families desperately pleading for rare blood units at hospital counters during late-night emergencies, Prayas volunteers pooled personal telephone directories to form Mathura's first organized emergency donor response desk. The network operates 24/7 with zero fees, mobilizing healthy youth who donate directly at Ramakrishna Mission and District Combined Hospital.",
    quote: "Blood cannot be made in factories; it can only flow from one human heart to another.",
    keyStats: [
      { label: "Registered Donors", value: "500+ Donors" },
      { label: "Avg. Arrival Time", value: "< 45 Minutes" },
      { label: "Cost to Patient", value: "₹0 (100% Free)" },
    ],
    highlightTag: "Lifeline of Braj",
    linkUrl: "/blood-donation",
    linkLabel: "Register as Blood Donor",
  },
  {
    id: "m-2017",
    year: 2017,
    dateLabel: "August 2017",
    category: "plantation",
    categoryLabel: "Ecology & Green Vrindavan",
    title: "Vrindavan Harit Kranti: Parikrama Green Canopy",
    subtitle: "Mass community plantation of native Neem, Peepal, and Kadamba with protective iron cages",
    location: "Braj Parikrama Marg, Vrindavan",
    imageUrl: "/images/timeline/timeline-2017-plantation.jpg",
    impactBadge: "2,500+ Native Trees • 92% Survival Rate",
    summary:
      "Launched systematic afforestation along the sacred 12-kilometer pilgrimage route, pairing every native sapling with an iron tree-guard and neighborhood water stewards.",
    story:
      "Decades of unchecked construction had depleted the ancient green groves (vanas) that define Vrindavan's spiritual ecology. Prayas mobilized shopkeepers, local sadhus, and youth volunteers to dig pits and plant deep-root indigenous species — Neem, Peepal, Pilu, and Kadamba. Unlike symbolic tree plantation drives, Prayas maintained year-round watering rotas and fabricated protective iron guards, achieving an extraordinary 92% survival rate.",
    quote: "Restoring the sacred groves of Braj is our generational offering to the earth.",
    keyStats: [
      { label: "Native Trees Planted", value: "2,500+ Saplings" },
      { label: "Protective Guards", value: "1,800+ Iron Cages" },
      { label: "Survival Rate", value: "92% Verified" },
    ],
    linkUrl: "/projects/vrindavan-harit-kranti",
    linkLabel: "Adopt a Sacred Tree",
  },
  {
    id: "m-2019",
    year: 2019,
    dateLabel: "November 2019",
    category: "institutional",
    categoryLabel: "Trust & Governance",
    title: "Conferred Rotary Seva Ratna & Income Tax 12A Certification",
    subtitle: "Independent chartered audits and formal state empanelment as premier grassroots society",
    location: "Mathura District Headquarters",
    imageUrl: "/images/timeline/timeline-2019-award.jpg",
    impactBadge: "12A Certified • NITI Aayog • Seva Ratna",
    summary:
      "Achieved statutory empanelment under NITI Aayog NGO Darpan and Section 12A non-profit certification, accompanied by the prestigious Rotary Seva Ratna honor.",
    story:
      "Prayas cemented its non-negotiable constitution: 100% of all public donations are allocated directly to program beneficiaries (students, patients, and tree plantation) with zero administrative cuts deducted. Operational expenses, phone bills, and logistics are funded exclusively by founding trustees and lifetime patrons. This radical transparency earned institutional accolades and formal 12A non-profit standing.",
    quote: "Public trust is not demanded; it is painstakingly earned day after day.",
    keyStats: [
      { label: "Statutory Status", value: "12A Registered" },
      { label: "Admin Deductions", value: "0% Always" },
      { label: "NITI Darpan ID", value: "UP/2017/0154210" },
    ],
    linkUrl: "/about",
    linkLabel: "Read Governance Audit",
  },
  {
    id: "m-2020",
    year: 2020,
    dateLabel: "April 2020 – June 2021",
    category: "health",
    categoryLabel: "Emergency Blood & Health",
    title: "COVID-19 Emergency Oxygen & Doorstep Ration Lifeline",
    subtitle: "Doorstep delivery of 85+ oxygen machines and 10,000+ grocery kits for widows and daily-wage families",
    location: "Vrindavan Town, Ashrams & Yamuna Khadar",
    imageUrl: "/images/timeline/timeline-2020-covid-relief.jpg",
    impactBadge: "85 Oxygen Units • 10,000+ Ration Kits • 24/7 Relief",
    summary:
      "During catastrophic pandemic waves, volunteer taskforces rushed free oxygen concentrators on motorbikes to suffocating patients and delivered dry food kits to isolated ashrams.",
    story:
      "When the nationwide lockdown halted public transport and overwhelmed regional hospitals, oxygen cylinders vanished across northern India. Prayas set up an emergency sanitization and dispatch hub in Vrindavan. Young sevadars wore masks and carried 10L oxygen machines through cramped historic alleys to elderly sadhus and impoverished families, saving hundreds of lives in critical home care without charging a single rupee.",
    quote: "When the streets went silent, Nishkam Seva stood awake.",
    keyStats: [
      { label: "Oxygen Machines Lent", value: "85 Units" },
      { label: "Dry Ration Kits", value: "10,000+ Bags" },
      { label: "Days on Frontline", value: "420+ Continuous" },
    ],
    highlightTag: "Pandemic Heroism",
    linkUrl: "/medical-equipment",
    linkLabel: "View Equipment Bank",
  },
  {
    id: "m-2022",
    year: 2022,
    dateLabel: "September 2022",
    category: "health",
    categoryLabel: "Emergency Blood & Health",
    title: "Jan Swasthya Raksha: Rural Diagnostics & Cataract Care",
    subtitle: "Monthly rural medical camps offering free screenings, medicines, and surgical referrals",
    location: "Village Chhatikara, Govardhan & Barsana",
    imageUrl: "/images/timeline/timeline-2022-eye-camp.jpg",
    impactBadge: "3,200+ Patients Examined • 480 Free Spectacles",
    summary:
      "Partnered with specialist doctors to conduct recurring village clinics providing diagnostic checks, diabetes monitoring, pediatric vitamins, and sponsored cataract surgeries.",
    story:
      "For elderly villagers and agricultural laborers living on subsistence wages, traveling to a private hospital for eye tests or chronic blood sugar management was an insurmountable cost. Prayas brought visiting physicians, diagnostic test kits, and free prescription glasses straight to village primary schools, restoring clear sight and health dignity.",
    quote: "Health is the very bedrock of human self-respect.",
    keyStats: [
      { label: "Patients Treated", value: "3,200+ Rural Villagers" },
      { label: "Spectacles Distributed", value: "480 Free Pairs" },
      { label: "Cataract Surgeries", value: "115 Sponsored" },
    ],
    linkUrl: "/projects/jan-swasthya-raksha",
    linkLabel: "Sponsor Medical Camp",
  },
  {
    id: "m-2024",
    year: 2024,
    dateLabel: "January 2024",
    category: "institutional",
    categoryLabel: "Youth & Livelihoods",
    title: "Mathura District Seva Samman & Vocational Skills Guild",
    subtitle: "Conferred highest district civic award; launching vocational stitching and computer lab",
    location: "Mathura Collectorate & Vrindavan Center",
    imageUrl: "/images/timeline/timeline-2024-skills-guild.jpg",
    impactBadge: "DM Seva Samman • 240+ Youth Empowered",
    summary:
      "Conferred the prestigious Seva Samman by the District Magistrate of Mathura, followed by the launch of a digital literacy and vocational training lab for rural youth.",
    story:
      "At the Republic Day ceremony, the District Magistrate of Mathura honored Prayas Pariwaar with the District Seva Samman for unmatched relief operations and volunteer discipline. Building on this momentum, Prayas inaugurated an adolescent empowerment hub equipped with desktop computers and tailoring stations, helping teenage girls and rural boys secure independent livelihoods.",
    quote: "When a young girl acquires digital skills, she transforms the destiny of her entire lineage.",
    keyStats: [
      { label: "Civic Honor", value: "DM Seva Samman 2024" },
      { label: "Youth Trained", value: "240+ Students" },
      { label: "Vocational Placements", value: "65+ Placements" },
    ],
    linkUrl: "/projects/aadhar-career-counseling",
    linkLabel: "Support Career Guild",
  },
  {
    id: "m-2025",
    year: 2025,
    dateLabel: "May 2025",
    category: "health",
    categoryLabel: "Emergency Blood & Health",
    title: "Permanent Free Medical Equipment Lending Bank",
    subtitle: "Full inventory of hospital Fowler beds, BiPAP machines, and 10L oxygen units at zero rental",
    location: "Central Seva Desk, Mathura-Vrindavan Road",
    imageUrl: "/images/timeline/timeline-2025-equipment-bank.jpg",
    impactBadge: "85+ Devices in Free Circulation • ₹35L+ Saved by Families",
    summary:
      "Institutionalized a district-wide repository where economically vulnerable families borrow expensive ICU-grade medical devices for home recovery at zero cost.",
    story:
      "Commercial equipment rental agencies charge between ₹6,000 and ₹18,000 per month for hospital Fowler beds, BiPAP machines, and suction pumps — driving families into predatory debt during critical illnesses. Prayas acquired a permanent inventory of 85+ heavy-duty homecare machines that are delivered and installed in patients' homes with zero rental charge.",
    quote: "No family in Braj should ever fall into poverty just to afford a hospital bed for their elder.",
    keyStats: [
      { label: "Devices in Circulation", value: "85+ Heavy Devices" },
      { label: "Families Supported", value: "450+ Homes" },
      { label: "Commercial Cost Saved", value: "₹35,00,000+" },
    ],
    linkUrl: "/medical-equipment",
    linkLabel: "Request Free Equipment",
  },
  {
    id: "m-2026",
    year: 2026,
    dateLabel: "Present Milestone • 2026",
    category: "education",
    categoryLabel: "Smart Education & Modern Platform",
    title: "Solar Smart Classrooms & Unified Digital NGO Platform",
    subtitle: "Blending 15 years of sacred grassroots tradition with transparent modern technology",
    location: "Barsana, Vrindavan & All Mathura District",
    imageUrl: "/images/timeline/timeline-2026-smart-pathshala.jpg",
    impactBadge: "320+ Daily Students • 8,200+ Blood Units • 5,400+ Trees",
    summary:
      "Equipping rural learning centers with solar power and interactive STEM tablets, synchronized with an automated real-time web portal and mobile app for instant emergency blood matching.",
    story:
      "Fifteen years after three college students unfolded a jute mat under a banyan tree, Prayas Pariwaar reaches its landmark era in 2026. Rural learning centers are now powered by clean solar energy with interactive tablets where village children solve math puzzles, code basic logic, and read digital encyclopedias. Simultaneously, our real-time platform matches emergency blood donors within minutes across Uttar Pradesh.",
    quote: "From slates under the sacred banyan in 2011 to solar smart classrooms in 2026: Nishkam Seva never stops.",
    keyStats: [
      { label: "Daily Tutored Children", value: "320+ Students" },
      { label: "Emergency Blood Units", value: "8,200+ Units" },
      { label: "Native Trees Thriving", value: "5,400+ Trees" },
      { label: "Volunteer Sevadars", value: "180+ Active" },
    ],
    highlightTag: "Present Frontier",
    linkUrl: "/donate",
    linkLabel: "Be Part of Our Journey",
  },
];

export default function InteractiveTimeline() {
  const [selectedCategory, setSelectedCategory] = useState<MilestoneCategory>("all");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"spotlight" | "flow">("spotlight");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [tourSpeed, setTourSpeed] = useState<number>(4800);
  const [isHoverPaused, setIsHoverPaused] = useState<boolean>(false);
  const [isFading, setIsFading] = useState<boolean>(false);
  const [activeModalMilestone, setActiveModalMilestone] = useState<TimelineMilestone | null>(null);
  const [showFullStory, setShowFullStory] = useState<boolean>(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-play timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scrubberRef = useRef<HTMLDivElement>(null);
  const modalCardRef = useRef<HTMLDivElement>(null);

  // Filtered milestones based on category
  const filteredMilestones = MILESTONES.filter(
    (m) => selectedCategory === "all" || m.category === selectedCategory
  );

  // Ensure currentIndex stays within bounds when filter changes
  useEffect(() => {
    if (currentIndex >= filteredMilestones.length) {
      setCurrentIndex(0);
    }
  }, [selectedCategory, filteredMilestones.length, currentIndex]);

  const activeMilestone = filteredMilestones[currentIndex] || filteredMilestones[0] || MILESTONES[0];

  // Completely freeze Lenis momentum scroll and html/body background scroll when card is open
  useEffect(() => {
    if (activeModalMilestone) {
      // 1. Pause Lenis smooth scroll engine completely so background cannot move
      if (typeof window !== "undefined" && (window as any).lenis) {
        try {
          (window as any).lenis.stop();
        } catch {
          // fallback
        }
      }

      // 2. Lock html and body overflow
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyOverflow = document.body.style.overflow;
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.documentElement.classList.add("lenis-stopped");

      return () => {
        // Restore Lenis and html/body scroll
        if (typeof window !== "undefined" && (window as any).lenis) {
          try {
            (window as any).lenis.start();
          } catch {
            // fallback
          }
        }
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.classList.remove("lenis-stopped");
      };
    }
  }, [activeModalMilestone]);

  // Fading off and on transition controller
  const transitionToStage = useCallback(
    (newIndex: number) => {
      if (isFading || newIndex === currentIndex) return;
      setIsFading(true); // Phase 1: Fade OFF current milestone
      setTimeout(() => {
        setCurrentIndex(newIndex); // Switch milestone data while hidden
        setTimeout(() => {
          setIsFading(false); // Phase 2: Fade ON next milestone
        }, 40);
      }, 300); // 300ms fade-off duration
    },
    [currentIndex, isFading]
  );

  // Auto-play tour loop with smooth fade-off and fade-on
  useEffect(() => {
    if (!isPlaying || isHoverPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      const nextIdx = (currentIndex + 1) % filteredMilestones.length;
      transitionToStage(nextIdx);
    }, tourSpeed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isHoverPaused, tourSpeed, currentIndex, filteredMilestones.length, transitionToStage]);

  // Scroll active year pill into view on scrubber bar
  useEffect(() => {
    if (scrubberRef.current) {
      const activeBtn = scrubberRef.current.querySelector(`[data-milestone-id="${activeMilestone.id}"]`);
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [activeMilestone.id]);

  const handlePrev = useCallback(() => {
    const prevIdx = (currentIndex - 1 + filteredMilestones.length) % filteredMilestones.length;
    transitionToStage(prevIdx);
  }, [currentIndex, filteredMilestones.length, transitionToStage]);

  const handleNext = useCallback(() => {
    const nextIdx = (currentIndex + 1) % filteredMilestones.length;
    transitionToStage(nextIdx);
  }, [currentIndex, filteredMilestones.length, transitionToStage]);

  // Select year on the stepper ribbon: smoothly fades off and on
  const handleSelectYear = (index: number) => {
    transitionToStage(index);
  };

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeModalMilestone) {
        setActiveModalMilestone(null);
        return;
      }

      // Spacebar toggles Play/Pause tour
      if (
        e.key === " " &&
        !activeModalMilestone &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
        return;
      }

      if (activeModalMilestone) {
        const modalIndex = filteredMilestones.findIndex((m) => m.id === activeModalMilestone.id);
        if (e.key === "ArrowLeft") {
          const prevIdx = (modalIndex - 1 + filteredMilestones.length) % filteredMilestones.length;
          setActiveModalMilestone(filteredMilestones[prevIdx]);
          setCurrentIndex(prevIdx);
          if (modalCardRef.current) modalCardRef.current.scrollTop = 0;
        } else if (e.key === "ArrowRight") {
          const nextIdx = (modalIndex + 1) % filteredMilestones.length;
          setActiveModalMilestone(filteredMilestones[nextIdx]);
          setCurrentIndex(nextIdx);
          if (modalCardRef.current) modalCardRef.current.scrollTop = 0;
        }
        return;
      }

      if (viewMode === "spotlight") {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          handlePrev();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          handleNext();
        }
      }
    },
    [filteredMilestones, activeModalMilestone, viewMode, handlePrev, handleNext]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Open stage card on top of everything (Modal)
  const handleSelectStage = useCallback(
    (index: number, milestone?: TimelineMilestone) => {
      setIsPlaying(false);
      const targetMilestone = milestone || filteredMilestones[index] || activeMilestone;
      setCurrentIndex(index);
      setActiveModalMilestone(targetMilestone);
      if (modalCardRef.current) modalCardRef.current.scrollTop = 0;
    },
    [filteredMilestones, activeMilestone]
  );

  // Optional full modal view alias
  const handleOpenModal = (milestone: TimelineMilestone) => {
    const idx = filteredMilestones.findIndex((m) => m.id === milestone.id);
    handleSelectStage(idx >= 0 ? idx : currentIndex, milestone);
  };

  const handleModalPrev = () => {
    if (!activeModalMilestone) return;
    const currentIdx = filteredMilestones.findIndex((m) => m.id === activeModalMilestone.id);
    const prevIdx = (currentIdx - 1 + filteredMilestones.length) % filteredMilestones.length;
    setActiveModalMilestone(filteredMilestones[prevIdx]);
    setCurrentIndex(prevIdx);
    if (modalCardRef.current) modalCardRef.current.scrollTop = 0;
  };

  const handleModalNext = () => {
    if (!activeModalMilestone) return;
    const currentIdx = filteredMilestones.findIndex((m) => m.id === activeModalMilestone.id);
    const nextIdx = (currentIdx + 1) % filteredMilestones.length;
    setActiveModalMilestone(filteredMilestones[nextIdx]);
    setCurrentIndex(nextIdx);
    if (modalCardRef.current) modalCardRef.current.scrollTop = 0;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setTouchStartX(null);
  };

  // Helper for category badge styling
  const getCategoryStyles = (category: TimelineMilestone["category"]) => {
    switch (category) {
      case "education":
        return {
          badgeBg: "bg-amber-100 text-amber-950 border-amber-300",
          accentColor: "#D97706",
          icon: GraduationCap,
        };
      case "health":
        return {
          badgeBg: "bg-rose-100 text-rose-950 border-rose-300",
          accentColor: "#BE123C",
          icon: Droplet,
        };
      case "plantation":
        return {
          badgeBg: "bg-emerald-100 text-emerald-950 border-emerald-300",
          accentColor: "#15803D",
          icon: Trees,
        };
      case "institutional":
        return {
          badgeBg: "bg-sky-100 text-sky-950 border-sky-300",
          accentColor: "#0369A1",
          icon: ShieldCheck,
        };
      default:
        return {
          badgeBg: "bg-slate-100 text-slate-950 border-slate-300",
          accentColor: "#2E5339",
          icon: Award,
        };
    }
  };

  const activeCategoryStyle = getCategoryStyles(activeMilestone.category);
  const ActiveIcon = activeCategoryStyle.icon;

  return (
    <section
      id="journey-timeline"
      className="relative w-full scroll-mt-24 pt-14 sm:pt-20 pb-20 sm:pb-28 bg-gradient-to-b from-[#FAF8F5] via-white to-[#F5F2EB] border-y border-prayas-rule overflow-hidden"
    >
      {/* Decorative ambient glowing orbs */}
      <div className="absolute top-10 left-1/4 w-[32rem] h-[32rem] bg-gradient-to-br from-amber-200/25 via-emerald-100/20 to-transparent rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" style={{ animationDuration: "8s" }} />
      <div className="absolute bottom-20 right-1/4 w-[36rem] h-[36rem] bg-gradient-to-tl from-emerald-200/25 via-sky-100/20 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl 2xl:max-w-[1440px] 3xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        {/* ========================================================================= */}
        {/* HEADER: High-End Explainer Masthead with Stat Badges & View Mode Switcher  */}
        {/* ========================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-prayas-rule/80">
          <div className="space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/50 text-xs font-semibold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>15-Year Historical Odyssey • 2011 to 2026</span>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                10 Verified Milestones
              </span>
            </div>

            <h2
              className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.15]"
              style={{ color: "#111827" }}
            >
              The Journey of Nishkam Seva: From Banyan Roots to Modern Horizon
            </h2>

            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
              Click any year or milestone card below to launch the <strong className="text-emerald-950 font-bold">interactive stage explainer</strong>. Follow fifteen years of volunteer seva across Vrindavan and Mathura.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="inline-flex p-1 rounded-2xl bg-[#EFECE6] border border-prayas-rule text-xs font-semibold shadow-inner">
              <button
                type="button"
                onClick={() => setViewMode("spotlight")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                  viewMode === "spotlight"
                    ? "bg-white text-emerald-950 shadow-sm font-bold scale-102"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Interactive Spotlight Showcase"
              >
                <Compass className="w-4 h-4 text-[#2E5339]" />
                <span>Interactive Spotlight</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("flow")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                  viewMode === "flow"
                    ? "bg-white text-emerald-950 shadow-sm font-bold scale-102"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Chronological Roadmap View"
              >
                <Layers className="w-4 h-4 text-[#2E5339]" />
                <span>Chronological Flow</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE CONTROLS: Category Filters + Play/Pause Tour                  */}
        {/* ========================================================================= */}
        <div className="pt-6 pb-4 flex flex-wrap items-center justify-between gap-4">
          {/* Pillar Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all duration-300 border cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-[#2E5339] text-white border-[#2E5339] shadow-md scale-102"
                  : "bg-white text-slate-800 hover:bg-stone-100 border-stone-300"
              }`}
            >
              All Milestones ({MILESTONES.length})
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory("education")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all duration-300 border cursor-pointer ${
                selectedCategory === "education"
                  ? "bg-[#D97706] text-white border-[#D97706] shadow-md scale-102"
                  : "bg-white text-slate-800 hover:bg-stone-100 border-stone-300"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Free Education ({MILESTONES.filter((m) => m.category === "education").length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory("health")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all duration-300 border cursor-pointer ${
                selectedCategory === "health"
                  ? "bg-[#B91C1C] text-white border-[#B91C1C] shadow-md scale-102"
                  : "bg-white text-slate-800 hover:bg-stone-100 border-stone-300"
              }`}
            >
              <Droplet className="w-4 h-4" />
              <span>Health & Blood ({MILESTONES.filter((m) => m.category === "health").length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory("plantation")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all duration-300 border cursor-pointer ${
                selectedCategory === "plantation"
                  ? "bg-[#15803D] text-white border-[#15803D] shadow-md scale-102"
                  : "bg-white text-slate-800 hover:bg-stone-100 border-stone-300"
              }`}
            >
              <Trees className="w-4 h-4" />
              <span>Environment ({MILESTONES.filter((m) => m.category === "plantation").length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory("institutional")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all duration-300 border cursor-pointer ${
                selectedCategory === "institutional"
                  ? "bg-[#0369A1] text-white border-[#0369A1] shadow-md scale-102"
                  : "bg-white text-slate-800 hover:bg-stone-100 border-stone-300"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Awards & Trust ({MILESTONES.filter((m) => m.category === "institutional").length})</span>
            </button>
          </div>

          {/* Autoplay Tour & Step navigation */}
          {viewMode === "spotlight" && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying((prev) => !prev)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold shadow-xs transition-all duration-300 cursor-pointer ${
                  isPlaying
                    ? "bg-amber-100 text-amber-950 border-amber-300 animate-pulse font-bold"
                    : "bg-white text-slate-800 hover:bg-stone-50 border-stone-300"
                }`}
                title={isPlaying ? "Pause auto-tour" : "Start automated journey tour"}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-amber-700" />
                    <span>Pause Tour</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-prayas-neem fill-prayas-neem" />
                    <span>Play Tour</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-slate-800 shadow-xs transition-all cursor-pointer"
                  aria-label="Previous milestone"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-slate-800 shadow-xs transition-all cursor-pointer"
                  aria-label="Next milestone"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* YEAR STEPPER RIBBON (CLEAN, SHADOW-FREE CRISP MODERN DESIGN)              */}
        {/* ========================================================================= */}
        <div className="relative my-6 py-2 px-2 bg-white/80 backdrop-blur-md rounded-2xl border border-prayas-rule overflow-visible">
          {/* Progress Bar background line centered with pin circles */}
          <div className="absolute top-[36px] sm:top-[42px] left-6 right-6 h-1.5 bg-stone-200 -translate-y-1/2 rounded-full z-0 hidden sm:block" />

          {/* Dynamic progress segment centered with pin circles */}
          <div
            className="absolute top-[36px] sm:top-[42px] left-6 h-1.5 bg-gradient-to-r from-[#2E5339] via-[#D97706] to-[#0369A1] -translate-y-1/2 rounded-full z-0 transition-all duration-500 ease-out hidden sm:block"
            style={{
              width: `${(currentIndex / Math.max(filteredMilestones.length - 1, 1)) * 96}%`,
            }}
          />

          <div
            ref={scrubberRef}
            className="relative z-10 flex items-center justify-between gap-3 sm:gap-4 overflow-x-auto pt-4 pb-3 sm:pt-5 sm:pb-3.5 px-3 sm:px-4 scrollbar-none"
          >
            {filteredMilestones.map((m, idx) => {
              const isActive = idx === currentIndex;
              const isPast = idx < currentIndex;

              return (
                <div
                  key={m.id}
                  data-milestone-id={m.id}
                  className="relative group shrink-0"
                >
                  <button
                    type="button"
                    onClick={() => handleSelectYear(idx)}
                    className={`flex flex-col items-center gap-1.5 focus:outline-none transition-all duration-300 cursor-pointer ${
                      isActive ? "scale-105" : "hover:scale-105"
                    }`}
                    title={`Year ${m.year}: ${m.title} (${m.categoryLabel})`}
                  >
                    {/* Node Pin - Clean, sharp, zero shadow effect */}
                    <div
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 ${
                        isActive
                          ? "bg-[#2E5339] text-white border-white ring-2 ring-[#2E5339]"
                          : isPast
                          ? "bg-emerald-50 text-emerald-950 border-emerald-600"
                          : "bg-white text-slate-700 border-stone-300 group-hover:border-emerald-600 group-hover:text-emerald-900"
                      }`}
                    >
                      {m.year.toString().slice(-2)}
                    </div>

                    {/* Year Label */}
                    <span
                      className={`text-[11px] sm:text-xs font-mono tracking-tight font-bold transition-colors ${
                        isActive
                          ? "text-[#2E5339] underline underline-offset-4 decoration-2"
                          : "text-slate-600 group-hover:text-slate-950"
                      }`}
                    >
                      {m.year}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW MODE 1: INTERACTIVE SPOTLIGHT SHOWCASE CARD                          */}
        {/* ========================================================================= */}
        {viewMode === "spotlight" && (
          <div
            className="mt-6 border border-prayas-rule bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseEnter={() => {
              if (isPlaying) setIsHoverPaused(true);
            }}
            onMouseLeave={() => {
              if (isPlaying) setIsHoverPaused(false);
            }}
          >
            {/* Interactive Tour HUD Bar when isPlaying is active */}
            {isPlaying && (
              <div className="bg-gradient-to-r from-emerald-950 via-[#1C2421] to-emerald-950 text-white px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs border-b border-emerald-900/60 transition-all">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                  <span className="font-mono font-bold text-amber-300 uppercase tracking-wider text-[11px]">
                    Live Interactive Tour
                  </span>
                  <span className="text-emerald-700 hidden sm:inline">•</span>
                  <span className="text-slate-300 font-medium hidden sm:inline">
                    {isHoverPaused ? (
                      <span className="text-amber-200 font-semibold bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800/40">
                        ⏸️ Reading Mode (Paused on Hover)
                      </span>
                    ) : (
                      `Advancing through 15-Year Odyssey (${currentIndex + 1} of ${filteredMilestones.length})`
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Speed toggle */}
                  <button
                    type="button"
                    onClick={() => setTourSpeed((prev) => (prev === 4800 ? 3200 : prev === 3200 ? 6500 : 4800))}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-[11px] font-mono text-emerald-100 transition-colors cursor-pointer"
                    title="Change tour speed"
                  >
                    Speed: {tourSpeed === 4800 ? "1x (4.8s)" : tourSpeed === 3200 ? "1.5x (Fast)" : "0.7x (Slow)"}
                  </button>

                  {/* Prev / Next quick controls */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                      title="Previous year (fades off and on)"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                      title="Next year (fades off and on)"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Pause button */}
                  <button
                    type="button"
                    onClick={() => setIsPlaying(false)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Pause className="w-3 h-3" />
                    <span>Pause</span>
                  </button>
                </div>
              </div>
            )}

            {/* Dynamic Tour Countdown Progress Bar indicator */}
            {isPlaying && (
              <div className="w-full h-1 bg-stone-200 overflow-hidden relative">
                <div
                  key={`tour-bar-${currentIndex}-${isHoverPaused}`}
                  className="h-full bg-gradient-to-r from-emerald-600 via-amber-500 to-[#2E5339]"
                  style={{
                    animation: isHoverPaused ? "none" : `tourProgressBar ${tourSpeed}ms linear forwards`,
                    width: isHoverPaused ? "100%" : undefined,
                  }}
                />
              </div>
            )}

            {/* Showcase Grid with Fading Off and On Transitions */}
            <div
              className={`grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch transition-all ease-in-out ${
                isFading
                  ? "opacity-0 scale-[0.985] filter blur-[3px]"
                  : "opacity-100 scale-100 filter blur-0"
              }`}
              style={{
                transitionDuration: isFading ? "300ms" : "450ms",
              }}
            >
              {/* Left Column: Visual Documentary Canvas with Smooth Transition Keyframe */}
              <div
                className="lg:col-span-7 relative min-h-[380px] sm:min-h-[460px] lg:min-h-[560px] bg-stone-900 overflow-hidden group cursor-pointer"
                onClick={() => handleSelectStage(currentIndex, activeMilestone)}
                title="Click to open stage card on top"
              >
                <div key={activeMilestone.id} className="relative w-full h-full min-h-[380px] sm:min-h-[460px] lg:min-h-[560px]">
                  {typeof activeMilestone.imageUrl === "string" &&
                  activeMilestone.imageUrl.trim().length > 0 &&
                  activeMilestone.imageUrl !== "null" &&
                  activeMilestone.imageUrl !== "undefined" &&
                  !brokenImages[activeMilestone.id] ? (
                    <Image
                      src={assetPath(activeMilestone.imageUrl)}
                      alt={activeMilestone.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className={`object-cover object-center transition-all ease-out ${
                        isPlaying ? "scale-105 duration-[4800ms] ease-linear" : "duration-700 group-hover:scale-105"
                      }`}
                      priority
                      onError={() =>
                        setBrokenImages((prev) => ({ ...prev, [activeMilestone.id]: true }))
                      }
                    />
                  ) : (
                    <TimelineImagePlaceholder
                      category={activeMilestone.category}
                      year={activeMilestone.year}
                      title={activeMilestone.title}
                      location={activeMilestone.location}
                    />
                  )}
                </div>

                {/* Dark vignette gradient for contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/25 pointer-events-none" />

                {/* Top Corner Badges */}
                <div className="absolute top-4 sm:top-6 left-4 sm:left-6 flex flex-wrap items-center gap-2 z-10">
                  <span
                    className="px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md font-mono font-bold text-xs sm:text-sm border border-white/30"
                    style={{ color: "#ffffff" }}
                  >
                    {activeMilestone.year}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide backdrop-blur-md border flex items-center gap-1.5 ${activeCategoryStyle.badgeBg}`}
                  >
                    <ActiveIcon className="w-3.5 h-3.5" />
                    <span>{activeMilestone.categoryLabel}</span>
                  </span>

                  {activeMilestone.highlightTag && (
                    <span
                      className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-md border border-amber-300"
                    >
                      ★ {activeMilestone.highlightTag}
                    </span>
                  )}
                </div>

                {/* Bottom Canvas Overlay: Location, Date & Impact Badge */}
                <div className="absolute bottom-0 inset-x-0 p-5 sm:p-7 z-10 space-y-2">
                  <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: "#f1f5f9" }}>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>{activeMilestone.dateLabel}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{activeMilestone.location}</span>
                    </span>
                  </div>

                  <div className="pt-1 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-950/90 backdrop-blur-md border border-emerald-500/40 text-xs font-bold" style={{ color: "#a7f3d0" }}>
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Impact: {activeMilestone.impactBadge}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Narrative Content with Smooth Slide Keyframe */}
              <div
                key={`content-${activeMilestone.id}`}
                className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6 bg-white animate-timeline-content"
              >
                <div className="space-y-4">
                  {/* Step counter & Breadcrumb */}
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                    <span className="text-emerald-950 font-extrabold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                      STAGE {currentIndex + 1} OF {filteredMilestones.length}
                    </span>
                    <span className="font-mono text-slate-500 font-bold">
                      2011 — 2026 ODYSSEY
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="space-y-2">
                    <h3
                      className="font-serif text-2xl sm:text-3xl font-bold leading-tight"
                      style={{ color: "#111827" }}
                    >
                      {activeMilestone.title}
                    </h3>
                    <p className="text-xs sm:text-sm font-semibold text-emerald-900 leading-relaxed">
                      {activeMilestone.subtitle}
                    </p>
                  </div>

                  {/* Summary */}
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                    {activeMilestone.summary}
                  </p>

                  {/* Archival Milestone Story (In-place Expansion) */}
                  {activeMilestone.story && showFullStory && (
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 text-slate-800 text-xs sm:text-sm leading-relaxed space-y-1.5 animate-timeline-content">
                      <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                        On-Ground Archival Story
                      </span>
                      <p className="text-slate-700 font-normal leading-relaxed">{activeMilestone.story}</p>
                    </div>
                  )}

                  {/* Quote Callout */}
                  {activeMilestone.quote && (
                    <div className="relative p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-300 text-amber-950 text-xs sm:text-sm italic font-serif leading-relaxed shadow-2xs font-medium pl-9">
                      <QuoteIcon className="w-5 h-5 text-amber-500 absolute top-3.5 left-2.5 opacity-60" />
                      <span>"{activeMilestone.quote}"</span>
                    </div>
                  )}

                  {/* Key Stats 3-Grid */}
                  <div className="grid grid-cols-3 gap-2.5 pt-2">
                    {activeMilestone.keyStats.map((stat, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-0.5 hover:bg-stone-100 hover:border-emerald-300 transition-all duration-300 shadow-2xs"
                      >
                        <span
                          className="font-serif font-bold text-xs sm:text-sm block"
                          style={{ color: "#111827" }}
                        >
                          {stat.value}
                        </span>
                        <p className="text-[10px] sm:text-[11px] text-slate-600 leading-tight font-medium">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-prayas-rule flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {activeMilestone.story && (
                      <button
                        type="button"
                        onClick={() => setShowFullStory((prev) => !prev)}
                        className="px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 text-xs sm:text-sm font-bold text-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-102"
                      >
                        <span>{showFullStory ? "Hide Story Details" : "Read Full Story"}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-300 ${
                            showFullStory ? "rotate-180 text-emerald-700" : "text-slate-600"
                          }`}
                        />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleSelectStage(currentIndex, activeMilestone)}
                      className="px-4 py-2.5 rounded-xl border-2 border-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-xs sm:text-sm font-bold text-emerald-950 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-102"
                      title="Open full detailed stage card on top of everything"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-emerald-800" />
                      <span>Open Card On Top</span>
                    </button>
                  </div>

                  {activeMilestone.linkUrl && (
                    <Link
                      href={activeMilestone.linkUrl}
                      className="px-5 py-2.5 rounded-xl bg-[#2E5339] hover:bg-[#23432b] text-white text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 text-center hover:scale-102 sm:ml-auto"
                      style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
                    >
                      <span>{activeMilestone.linkLabel || "Explore Pillar"}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW MODE 2: CHRONOLOGICAL ROADMAP / FLOW (Alternating Tree View)         */}
        {/* ========================================================================= */}
        {viewMode === "flow" && (
          <div className="mt-12 relative">
            {/* Center stem vertical line */}
            <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#2E5339] via-[#D97706] to-[#0369A1] sm:-translate-x-1/2 rounded-full" />

            <div className="space-y-12 sm:space-y-16">
              {filteredMilestones.map((milestone, idx) => {
                const isLeft = idx % 2 === 0;
                const catStyle = getCategoryStyles(milestone.category);
                const Icon = catStyle.icon;

                return (
                  <div
                    key={milestone.id}
                    className={`relative flex flex-col sm:flex-row items-start ${
                      isLeft ? "sm:flex-row" : "sm:flex-row-reverse"
                    } gap-6 sm:gap-12 pl-12 sm:pl-0 group`}
                  >
                    {/* Node in Center */}
                    <button
                      type="button"
                      onClick={() => handleSelectYear(idx)}
                      className="absolute left-4 sm:left-1/2 -translate-x-1/2 top-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border-4 border-[#2E5339] flex items-center justify-center text-xs font-bold text-slate-800 z-10 group-hover:scale-115 group-hover:border-[#D97706] transition-all cursor-pointer"
                      title={`Year ${milestone.year}: ${milestone.title}`}
                    >
                      <Icon className="w-4 h-4 text-emerald-800" />
                    </button>

                    {/* Content Half */}
                    <div className="w-full sm:w-1/2">
                      <div
                        className="border border-prayas-rule bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-card hover:shadow-2xl transition-all duration-300 space-y-4 hover:border-emerald-600 hover:-translate-y-1"
                      >
                        {/* Top Year & Category Badge */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-base sm:text-lg font-bold text-[#2E5339]">
                              {milestone.year}
                            </span>
                            <span className="text-xs text-slate-600 font-medium">
                              • {milestone.dateLabel}
                            </span>
                          </div>

                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${catStyle.badgeBg}`}
                          >
                            {milestone.categoryLabel}
                          </span>
                        </div>

                        {/* Title & Subtitle */}
                        <div className="space-y-1">
                          <h4
                            className="font-serif text-lg sm:text-xl font-bold leading-tight group-hover:text-emerald-900 transition-colors"
                            style={{ color: "#111827" }}
                          >
                            {milestone.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-emerald-900 font-semibold">
                            {milestone.subtitle}
                          </p>
                        </div>

                        {/* Thumbnail Image */}
                        <div
                          className="relative aspect-video rounded-xl overflow-hidden bg-stone-900 group/img border border-stone-200 cursor-pointer"
                          onClick={() => handleSelectStage(idx, milestone)}
                          title="Click to open stage card on top"
                        >
                          {typeof milestone.imageUrl === "string" &&
                          milestone.imageUrl.trim().length > 0 &&
                          milestone.imageUrl !== "null" &&
                          milestone.imageUrl !== "undefined" &&
                          !brokenImages[milestone.id] ? (
                            <Image
                              src={assetPath(milestone.imageUrl)}
                              alt={milestone.title}
                              fill
                              sizes="(max-width: 768px) 100vw, 40vw"
                              className="object-cover group-hover/img:scale-105 transition-transform duration-500"
                              loading="lazy"
                              onError={() =>
                                setBrokenImages((prev) => ({ ...prev, [milestone.id]: true }))
                              }
                            />
                          ) : (
                            <TimelineImagePlaceholder
                              category={milestone.category}
                              year={milestone.year}
                              title={milestone.title}
                              location={milestone.location}
                              compact
                            />
                          )}
                          <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                            <span
                              className="px-4 py-2 rounded-xl bg-black/85 text-white text-xs font-semibold backdrop-blur-sm flex items-center gap-2 shadow-lg border border-white/30"
                              style={{ color: "#ffffff" }}
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                              <span>Click to Open Card On Top</span>
                            </span>
                          </div>
                        </div>

                        {/* Summary & Impact */}
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                          {milestone.summary}
                        </p>

                        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-emerald-950 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>{milestone.impactBadge}</span>
                        </div>

                        {/* Actions */}
                        <div className="pt-2 flex items-center justify-between gap-3 text-xs font-bold">
                          <button
                            type="button"
                            onClick={() => handleSelectStage(idx, milestone)}
                            className="text-prayas-neem flex items-center gap-1 hover:underline cursor-pointer focus:outline-none"
                          >
                            <span>Open Stage Card On Top →</span>
                          </button>

                          {milestone.linkUrl && (
                            <Link
                              href={milestone.linkUrl}
                              onClick={(e) => e.stopPropagation()}
                              className="text-slate-700 hover:text-emerald-900 flex items-center gap-1 font-semibold"
                            >
                              <span>{milestone.linkLabel || "Learn More"}</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Empty Half to maintain balanced alternating layout */}
                    <div className="hidden sm:block sm:w-1/2" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* REASSURANCE BANNER & PARTICIPATION                                        */}
        {/* ========================================================================= */}
        <div className="mt-14 sm:mt-20 p-6 sm:p-9 rounded-3xl bg-gradient-to-r from-emerald-950 via-[#1C2421] to-slate-950 shadow-2xl relative overflow-hidden border border-emerald-900/50">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(217,119,6,0.35),transparent_70%)] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center lg:text-left">
              <span
                className="text-xs font-extrabold tracking-wider uppercase flex items-center justify-center lg:justify-start gap-1.5"
                style={{ color: "#FBBF24" }}
              >
                <Heart className="w-3.5 h-3.5 fill-[#FBBF24]" />
                <span>Shape the Next Chapter (2026 & Beyond)</span>
              </span>
              <h3
                className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold leading-tight !text-white"
                style={{ color: "#FFFFFF" }}
              >
                Be Part of Vrindavan's Living Legacy of Nishkam Seva
              </h3>
              <p
                className="text-xs sm:text-sm max-w-2xl leading-relaxed"
                style={{ color: "#E2E8F0" }}
              >
                Whether you sponsor a child's evening learning, plant a native neem tree, or join our 24/7 blood donor network,
                your hands keep the 15-year flame of selfless community service alive.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <Link
                href="/donate"
                className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 hover:scale-102"
                style={{ color: "#020617" }}
              >
                <Heart className="w-4 h-4 fill-slate-950" />
                <span>Sponsor a Student / Program</span>
              </Link>

              <Link
                href="/volunteer"
                className="px-5 py-3.5 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 font-bold text-xs sm:text-sm transition-all backdrop-blur-md text-center hover:scale-102"
                style={{ color: "#FFFFFF" }}
              >
                <span>Join as Volunteer</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PREMIUM POPUP CARD ON TOP OF EVERYTHING (React Portal to document.body)   */}
      {/* Features Smooth Entrance, In-Card Year Stepper & Isolated Scrolling       */}
      {/* ========================================================================= */}
      {mounted && activeModalMilestone && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/85 backdrop-blur-md overflow-hidden animate-fadeIn"
          style={{ zIndex: 99999, overscrollBehavior: "contain" }}
          data-lenis-prevent="true"
          onClick={() => setActiveModalMilestone(null)}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div
            ref={modalCardRef}
            className="relative w-full max-w-3xl my-auto max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border-2 border-stone-300 p-5 sm:p-8 space-y-6 focus:outline-none animate-timeline-modal timeline-card-scroll"
            style={{ overscrollBehavior: "contain" }}
            data-lenis-prevent="true"
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          >
            {/* Pinned Top Navigation Bar inside the Card */}
            <div className="sticky top-0 z-20 -mx-5 -mt-5 sm:-mx-8 sm:-mt-8 px-5 py-3.5 sm:px-8 sm:py-4 bg-white/95 backdrop-blur-md border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 rounded-t-3xl shadow-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleModalPrev}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Previous Stage (← key)"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Prev Stage</span>
                </button>

                <button
                  type="button"
                  onClick={handleModalNext}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Next Stage (→ key)"
                >
                  <span className="hidden sm:inline">Next Stage</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <span className="text-xs font-semibold text-slate-600 ml-1">
                  Stage {filteredMilestones.findIndex((m) => m.id === activeModalMilestone.id) + 1} of {filteredMilestones.length}
                </span>
              </div>

              {/* Embedded In-Modal Quick Year Scrubber */}
              <div className="hidden md:flex items-center gap-1 overflow-x-auto max-w-xs scrollbar-none py-0.5">
                {filteredMilestones.map((m, idx) => {
                  const isCurrent = m.id === activeModalMilestone.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setActiveModalMilestone(m);
                        setCurrentIndex(idx);
                      }}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-[#2E5339] text-white shadow-xs"
                          : "bg-stone-100 text-slate-600 hover:bg-stone-200"
                      }`}
                      title={`${m.year}: ${m.title}`}
                    >
                      {m.year.toString().slice(-2)}
                    </button>
                  );
                })}
              </div>

              {/* Prominent Close Button */}
              <button
                type="button"
                onClick={() => setActiveModalMilestone(null)}
                className="p-2 rounded-full bg-stone-100 hover:bg-red-50 hover:text-red-700 text-slate-800 transition-colors cursor-pointer"
                aria-label="Close dialog"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Stage Info */}
            <div className="space-y-2 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="px-3.5 py-1 rounded-full bg-[#2E5339] font-mono font-bold text-xs"
                  style={{ color: "#ffffff" }}
                >
                  {activeModalMilestone.year}
                </span>
                <span className="text-xs text-slate-600 font-semibold">
                  {activeModalMilestone.dateLabel}
                </span>
                <span>•</span>
                <span className="text-xs font-bold text-emerald-900">
                  {activeModalMilestone.categoryLabel}
                </span>
              </div>

              <h3
                className="font-serif text-2xl sm:text-3xl font-bold leading-tight"
                style={{ color: "#111827" }}
              >
                {activeModalMilestone.title}
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-emerald-900">
                {activeModalMilestone.subtitle}
              </p>
            </div>

            {/* High-Resolution Photo */}
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-stone-900 border border-stone-200 shadow-inner group">
              {typeof activeModalMilestone.imageUrl === "string" &&
              activeModalMilestone.imageUrl.trim().length > 0 &&
              activeModalMilestone.imageUrl !== "null" &&
              activeModalMilestone.imageUrl !== "undefined" &&
              !brokenImages[activeModalMilestone.id] ? (
                <Image
                  src={assetPath(activeModalMilestone.imageUrl)}
                  alt={activeModalMilestone.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 850px"
                  className="object-cover transition-transform duration-700 group-hover:scale-103"
                  priority
                  onError={() =>
                    setBrokenImages((prev) => ({ ...prev, [activeModalMilestone.id]: true }))
                  }
                />
              ) : (
                <TimelineImagePlaceholder
                  category={activeModalMilestone.category}
                  year={activeModalMilestone.year}
                  title={activeModalMilestone.title}
                  location={activeModalMilestone.location}
                />
              )}
              <div
                className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-sm text-[11px] flex items-center gap-1.5 font-medium border border-white/20"
                style={{ color: "#ffffff" }}
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{activeModalMilestone.location}</span>
              </div>
            </div>

            {/* Complete Narrative */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 font-medium flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <strong className="text-emerald-950 font-bold">Impact Milestone:</strong> {activeModalMilestone.impactBadge}
                </div>
              </div>

              <p className="whitespace-pre-line leading-relaxed text-slate-800">
                {activeModalMilestone.story}
              </p>

              {activeModalMilestone.quote && (
                <div className="relative p-4 pl-9 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 italic font-serif text-sm font-medium">
                  <QuoteIcon className="w-5 h-5 text-amber-500 absolute top-3.5 left-2.5 opacity-60" />
                  <span>"{activeModalMilestone.quote}"</span>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {activeModalMilestone.keyStats.map((stat, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-1 shadow-2xs"
                  >
                    <span
                      className="font-serif font-bold text-sm sm:text-base block"
                      style={{ color: "#111827" }}
                    >
                      {stat.value}
                    </span>
                    <p className="text-[11px] text-slate-600 leading-tight font-medium">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-prayas-rule flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveModalMilestone(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
              >
                Close Card (Esc)
              </button>

              <div className="flex items-center gap-2">
                {activeModalMilestone.linkUrl && (
                  <Link
                    href={activeModalMilestone.linkUrl}
                    className="px-5 py-2.5 rounded-xl bg-[#2E5339] text-white text-xs font-bold hover:bg-[#23432b] transition-all shadow-sm flex items-center gap-1.5"
                    style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
                  >
                    <span>{activeModalMilestone.linkLabel || "Explore Program"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
