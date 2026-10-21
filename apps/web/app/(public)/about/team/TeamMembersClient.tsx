"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { assetPath } from "@/lib/api";
import {
  Users,
  Search,
  Award,
  ShieldCheck,
  HeartHandshake,
  Stethoscope,
  Briefcase,
  GraduationCap,
  Building2,
  MapPin,
  Calendar,
  X,
  Phone,
  Mail,
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  designation: string;
  category:
    | "LEADERSHIP"
    | "TRUSTEE"
    | "EXECUTIVE"
    | "OPERATIONS"
    | "HEALTHCARE"
    | "VOLUNTEER_LEAD"
    | "ADVISORY"
    | "OTHER";
  department?: string | null;
  imageUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  bio?: string | null;
  joinedYear?: number | null;
  location?: string | null;
  order: number;
  isActive: boolean;
}

const CATEGORY_TABS = [
  { key: "ALL", label: "All Members", icon: Users },
  { key: "LEADERSHIP", label: "Leadership & Patrons", icon: Award },
  { key: "TRUSTEE", label: "Board of Trustees", icon: ShieldCheck },
  { key: "EXECUTIVE", label: "Executive Committee", icon: Briefcase },
  { key: "HEALTHCARE", label: "Medical & Blood Desk", icon: Stethoscope },
  { key: "OPERATIONS", label: "Field Operations", icon: HeartHandshake },
  { key: "VOLUNTEER_LEAD", label: "Youth & Volunteer Leads", icon: GraduationCap },
] as const;

const CATEGORY_MAP: Record<
  string,
  { label: string; badgeColor: string; icon: any }
> = {
  LEADERSHIP: {
    label: "Leadership & Patrons",
    badgeColor: "bg-amber-50 text-amber-900 border-amber-300",
    icon: Award,
  },
  TRUSTEE: {
    label: "Board of Trustees",
    badgeColor: "bg-purple-50 text-purple-900 border-purple-300",
    icon: ShieldCheck,
  },
  EXECUTIVE: {
    label: "Executive Committee",
    badgeColor: "bg-blue-50 text-blue-900 border-blue-300",
    icon: Briefcase,
  },
  OPERATIONS: {
    label: "Field Operations & Seva",
    badgeColor: "bg-emerald-50 text-emerald-900 border-emerald-300",
    icon: HeartHandshake,
  },
  HEALTHCARE: {
    label: "Medical & Blood Bank",
    badgeColor: "bg-rose-50 text-rose-900 border-rose-300",
    icon: Stethoscope,
  },
  VOLUNTEER_LEAD: {
    label: "Youth & Volunteer Leads",
    badgeColor: "bg-teal-50 text-teal-900 border-teal-300",
    icon: GraduationCap,
  },
  ADVISORY: {
    label: "Advisory Council",
    badgeColor: "bg-indigo-50 text-indigo-900 border-indigo-300",
    icon: Building2,
  },
  OTHER: {
    label: "Institutional Support",
    badgeColor: "bg-stone-100 text-stone-800 border-stone-300",
    icon: Users,
  },
};

export default function TeamMembersClient({
  initialMembers = [],
}: {
  initialMembers: TeamMember[];
}) {
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMembers = useMemo(() => {
    return initialMembers.filter((m) => {
      const matchesTab = activeTab === "ALL" || m.category === activeTab;
      if (!matchesTab) return false;

      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(query) ||
        m.designation.toLowerCase().includes(query) ||
        (m.department && m.department.toLowerCase().includes(query)) ||
        (m.location && m.location.toLowerCase().includes(query)) ||
        (m.bio && m.bio.toLowerCase().includes(query))
      );
    });
  }, [initialMembers, activeTab, searchQuery]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: initialMembers.length };
    initialMembers.forEach((m) => {
      counts[m.category] = (counts[m.category] || 0) + 1;
    });
    return counts;
  }, [initialMembers]);

  return (
    <div className="space-y-6">
      {/* Search & Category Filter Navigation */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-prayas-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, role, department or location..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-prayas-rule text-xs sm:text-sm text-prayas-ink placeholder-prayas-muted focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 bg-white shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-prayas-muted hover:text-prayas-ink p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {CATEGORY_TABS.map((tab) => {
            const count = categoryCounts[tab.key] || 0;
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-2 border ${
                  isActive
                    ? "bg-emerald-800 text-white border-emerald-800 shadow-sm"
                    : "bg-white text-prayas-ink border-prayas-rule hover:bg-prayas-stone"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-emerald-700"}`} />
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? "bg-white/20 text-white" : "bg-prayas-stone text-prayas-muted"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Team Members */}
      {filteredMembers.length === 0 ? (
        <div className="border border-dashed border-prayas-rule bg-white rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-prayas-stone text-prayas-muted flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-prayas-ink">
            {initialMembers.length === 0
              ? "Team Directory Being Updated"
              : "No team members found"}
          </h3>
          <p className="text-xs sm:text-sm text-prayas-muted max-w-md mx-auto leading-relaxed">
            {initialMembers.length === 0
              ? "The administrative team directory is currently being updated. Please check back shortly or explore our 18-Year Historical Timeline."
              : "No members matched your search criteria. Try selecting another category or clearing your search term."}
          </p>
          {initialMembers.length > 0 && (
            <button
              onClick={() => {
                setActiveTab("ALL");
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-lg border border-prayas-rule bg-prayas-paper text-xs font-semibold text-prayas-ink hover:bg-prayas-stone transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredMembers.map((member) => {
            const catInfo = CATEGORY_MAP[member.category] || CATEGORY_MAP.OTHER;
            const CatIcon = catInfo.icon;
            const initials = member.name
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((n) => n[0])
              .join("")
              .toUpperCase();

            return (
              <div
                key={member.id}
                className="bg-white border border-prayas-rule rounded-2xl overflow-hidden shadow-subtle hover:shadow-card transition-all flex flex-col justify-between group"
              >
                <div className="p-6 space-y-4">
                  {/* Avatar & Header */}
                  <div className="flex items-start gap-4">
                    <div className="relative w-16 h-16 rounded-full border-2 border-emerald-800/30 overflow-hidden bg-prayas-stone shrink-0 shadow-xs flex items-center justify-center group-hover:border-emerald-800 transition-colors">
                      {member.imageUrl ? (
                        <Image
                          src={assetPath(member.imageUrl)}
                          alt={member.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          unoptimized
                        />
                      ) : (
                        <span className="font-serif font-bold text-xl text-emerald-800">
                          {initials || "P"}
                        </span>
                      )}
                    </div>

                    <div className="space-y-0.5 min-w-0 flex-1">
                      <h3 className="font-serif font-bold text-base sm:text-lg text-prayas-ink leading-tight truncate">
                        {member.name}
                      </h3>
                      <p className="text-xs font-semibold text-emerald-800 leading-tight">
                        {member.designation}
                      </p>
                      {member.department && (
                        <p className="text-[11px] text-prayas-muted font-medium truncate pt-0.5">
                          {member.department}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Category & Location Badges */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${catInfo.badgeColor}`}
                    >
                      <CatIcon className="w-3 h-3" />
                      {catInfo.label}
                    </span>

                    {member.location && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-prayas-muted font-medium">
                        <MapPin className="w-3 h-3 text-emerald-700" />
                        {member.location}
                      </span>
                    )}

                    {member.joinedYear && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-prayas-muted font-medium ml-auto">
                        <Calendar className="w-3 h-3 text-prayas-muted" />
                        Since {member.joinedYear}
                      </span>
                    )}
                  </div>

                  {/* Seva Bio snippet */}
                  {member.bio && (
                    <p className="text-xs text-prayas-ink/80 leading-relaxed bg-prayas-paper/60 p-3 rounded-xl border border-prayas-rule/60 whitespace-pre-line">
                      {member.bio}
                    </p>
                  )}
                </div>

                {/* Footer Seva Assurance */}
                <div className="px-6 py-3 bg-prayas-paper/70 border-t border-prayas-rule flex items-center justify-between text-xs text-prayas-muted">
                  <span className="font-medium text-[11px]">
                    Prayas Pariwaar Vrindavan
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Seva Lead
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
