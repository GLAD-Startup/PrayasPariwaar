"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  Heart,
  Droplet,
  ShieldCheck,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: (pathname: string) => boolean;
  isCenterCTA?: boolean;
  badge?: string;
  badgeColor?: string;
}

export default function MobileFooterNav() {
  const pathname = usePathname() || "";

  const navItems: NavItem[] = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      isActive: (path) => path === "/",
    },
    {
      name: "Programs",
      href: "/projects",
      icon: BookOpen,
      isActive: (path) =>
        path.startsWith("/projects") ||
        path.startsWith("/gallery"),
    },
    {
      name: "Donate",
      href: "/donate",
      icon: Heart,
      isActive: (path) => path.startsWith("/donate"),
      isCenterCTA: true,
    },
    {
      name: "Blood Desk",
      href: "/blood-donation",
      icon: Droplet,
      isActive: (path) =>
        path.startsWith("/blood-donation") ||
        path.startsWith("/medical-equipment"),
      badge: "24/7",
      badgeColor: "bg-rose-500",
    },
    {
      name: "About",
      href: "/about",
      icon: ShieldCheck,
      isActive: (path) =>
        path.startsWith("/about") ||
        path.startsWith("/volunteer") ||
        path.startsWith("/contact") ||
        path.startsWith("/media") ||
        path.startsWith("/blog"),
    },
  ];

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-8px_30px_rgba(28,36,33,0.08)] transition-all duration-300"
    >
      <div className="max-w-md mx-auto px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom,0.5rem))]">
        <div className="flex items-center justify-around gap-1 relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.isActive(pathname);

            if (item.isCenterCTA) {
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className="flex flex-col items-center justify-center -mt-5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-full"
                >
                  <div
                    className={`relative w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 active:scale-90 ${
                      active
                        ? "bg-gradient-to-tr from-[#123824] via-[#1E5338] to-[#2E5339] text-white ring-4 ring-emerald-100 shadow-emerald-900/30 scale-105"
                        : "bg-gradient-to-tr from-[#1E5338] via-[#2E5339] to-[#3B6E4C] text-white hover:brightness-110 shadow-emerald-900/20"
                    }`}
                  >
                    <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110 fill-white/20" />
                    {/* Subtle pulse ring for donate CTA */}
                    <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping pointer-events-none" />
                  </div>
                  <span
                    className={`text-[10px] font-bold mt-1 tracking-tight transition-colors ${
                      active ? "text-emerald-900 font-extrabold" : "text-emerald-800"
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-200 active:scale-95 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                  active
                    ? "text-[#1E5338] font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {/* Active subtle background pill */}
                <div
                  className={`relative flex items-center justify-center w-9 h-7 rounded-lg transition-all duration-200 ${
                    active
                      ? "bg-emerald-50 text-[#1E5338]"
                      : "group-hover:bg-slate-100 text-slate-500"
                  }`}
                >
                  <Icon
                    className={`w-[19px] h-[19px] transition-transform duration-200 ${
                      active
                        ? "scale-110 text-[#1E5338]"
                        : "text-slate-500 group-hover:text-slate-800"
                    }`}
                  />

                  {/* Badge or live dot indicator */}
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600" />
                      </span>
                    </span>
                  )}
                </div>

                <span
                  className={`text-[10px] mt-0.5 tracking-tight transition-all duration-150 ${
                    active
                      ? "text-[#1E5338] font-bold"
                      : "text-slate-500 font-medium group-hover:text-slate-800"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
