"use client";

import { useState } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Droplet,
  Stethoscope,
  Users,
  Heart,
  FileText,
  Newspaper,
  FolderKanban,
  Bell,
  MessageSquare,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Clock,
  PanelLeftClose,
  PanelLeftOpen,
  Image as ImageIcon,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => {
    if (!pathname) return false;
    if (path === "/admin") return pathname === "/admin";
    return pathname.startsWith(path);
  };

  const navSections = [
    {
      title: "OPERATIONS & CARE",
      links: [
        {
          href: "/admin",
          label: "Office Overview",
          icon: LayoutDashboard,
          badge: null,
          color: "text-emerald-700",
        },
        {
          href: "/admin/blood-requests",
          label: "Emergency Blood Queue",
          icon: Droplet,
          badge: "Live",
          badgeColor: "bg-red-50 text-red-700 border-red-200",
          color: "text-rose-600",
        },
        {
          href: "/admin/equipment",
          label: "Medical Equipment Bank",
          icon: Stethoscope,
          badge: null,
          color: "text-emerald-700",
        },
        {
          href: "/admin/volunteers",
          label: "Volunteer Applications",
          icon: Users,
          badge: null,
          color: "text-emerald-700",
        },
      ],
    },
    {
      title: "FINANCES & PUBLIC SEVA",
      links: [
        {
          href: "/admin/donations",
          label: "Donations & 80G Receipts",
          icon: Heart,
          badge: "80G",
          badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
          color: "text-emerald-700",
        },
        {
          href: "/admin/gallery",
          label: "Photo Gallery & Albums",
          icon: ImageIcon,
          badge: "New",
          badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
          color: "text-emerald-700",
        },
        {
          href: "/admin/projects",
          label: "Programs & Causes",
          icon: FolderKanban,
          badge: null,
          color: "text-emerald-700",
        },
        {
          href: "/admin/posts",
          label: "Dispatches & Events",
          icon: FileText,
          badge: null,
          color: "text-emerald-700",
        },
        {
          href: "/admin/media",
          label: "Media Centre & Press",
          icon: Newspaper,
          badge: null,
          color: "text-emerald-700",
        },
      ],
    },
    {
      title: "SYSTEM & COMMS",
      links: [
        {
          href: "/admin/notifications",
          label: "Expo Push Broadcaster",
          icon: Bell,
          badge: null,
          color: "text-emerald-700",
        },
        {
          href: "/admin/inquiries",
          label: "Inquiries & Messages",
          icon: MessageSquare,
          badge: null,
          color: "text-emerald-700",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-prayas-paper text-prayas-ink flex flex-col lg:flex-row font-sans">
      {/* Mobile Top Navigation Header */}
      <header className="lg:hidden bg-white text-prayas-ink h-[68px] px-4 border-b border-prayas-rule flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="p-1 rounded-lg bg-prayas-stone border border-prayas-rule inline-block">
            <NextImage
              src="/images/prayas-logo.png"
              alt="Prayas Pariwaar"
              width={100}
              height={32}
              className="h-8 w-auto object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-prayas-ink">
              Prayas Pariwaar
            </span>
            <span className="text-[10px] text-prayas-neem font-bold uppercase tracking-wider">
              Operations Console
            </span>
          </div>
        </Link>

        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-lg bg-prayas-stone hover:bg-prayas-paper text-prayas-ink border border-prayas-rule transition-colors"
          aria-label="Toggle sidebar menu"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Desktop & Collapsible Mobile Light Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen bg-white text-prayas-ink border-r border-prayas-rule flex flex-col justify-between shadow-subtle transition-[width,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shrink-0 overflow-hidden ${
          mobileSidebarOpen
            ? "translate-x-0 w-72"
            : "-translate-x-full lg:translate-x-0"
        } ${collapsed ? "lg:w-[72px]" : "lg:w-72 2xl:lg:w-80"}`}
      >
        {/* Brand Header - EXACT height h-[68px] matching top operations bar */}
        <div className="h-[68px] border-b border-prayas-rule bg-white flex items-center shrink-0 overflow-hidden">
          {collapsed ? (
            /* COLLAPSED HEADER: Centered single toggle button */
            <div className="w-full flex items-center justify-center">
              <button
                onClick={() => setCollapsed(false)}
                className="w-10 h-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#2E5339] border border-emerald-200 flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-2xs"
                title="Expand Sidebar"
                aria-label="Expand Sidebar"
              >
                <PanelLeftOpen className="w-5 h-5" />
              </button>
            </div>
          ) : (
            /* EXPANDED HEADER: Logo + Brand + Collapse button */
            <div className="w-full px-3.5 flex items-center justify-between gap-2">
              <Link
                href="/admin"
                className="flex items-center group min-w-0"
                onClick={() => setMobileSidebarOpen(false)}
              >
                <div className="p-1.5 rounded-xl bg-prayas-stone border border-prayas-rule shadow-sm inline-block group-hover:scale-105 transition-transform shrink-0">
                  <NextImage
                    src="/images/prayas-logo.png"
                    alt="Prayas Pariwaar"
                    width={100}
                    height={32}
                    className="h-8 w-auto object-contain"
                  />
                </div>

                <div className="flex flex-col min-w-0 ml-2.5 max-w-[160px] overflow-hidden whitespace-nowrap">
                  <span className="text-xs font-bold text-prayas-ink tracking-wide truncate">
                    Prayas Pariwaar
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-prayas-neem truncate">
                    Operations Console
                  </span>
                </div>
              </Link>

              <button
                onClick={() => setCollapsed(true)}
                className="w-9 h-9 rounded-xl border border-prayas-rule bg-prayas-stone/70 hover:bg-prayas-stone text-slate-600 hover:text-[#2E5339] flex items-center justify-center transition-all duration-200 hover:scale-105 shrink-0 shadow-2xs"
                title="Collapse Sidebar"
                aria-label="Collapse Sidebar"
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Navigation Links */}
        <div className={`flex-1 overflow-y-auto py-4 space-y-4 overflow-x-hidden ${collapsed ? "px-2" : "px-2.5"}`}>
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!collapsed ? (
                <div className="px-3 mb-1.5">
                  <span className="text-[10px] font-bold text-prayas-muted uppercase tracking-wider block truncate">
                    {section.title}
                  </span>
                </div>
              ) : (
                sIdx > 0 && <div className="w-8 h-px bg-prayas-rule mx-auto my-2 opacity-60" />
              )}

              <div className="space-y-1">
                {section.links.map((link) => {
                  const active = isActive(link.href);
                  const Icon = link.icon;

                  if (collapsed) {
                    /* COLLAPSED NAV ITEM: Clean centered square icon */
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileSidebarOpen(false)}
                        title={link.label}
                        className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center transition-all duration-200 relative group ${
                          active
                            ? "bg-emerald-50 text-[#2E5339] border border-emerald-200 shadow-2xs font-bold"
                            : "text-slate-600 hover:bg-prayas-stone hover:text-slate-900 border border-transparent"
                        }`}
                      >
                        <Icon className={`w-5 h-5 transition-colors ${active ? "text-[#2E5339]" : "text-slate-600 group-hover:text-slate-900"}`} />
                        
                        {link.badge && (
                          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-600" />
                        )}
                      </Link>
                    );
                  }

                  /* EXPANDED NAV ITEM: Full width row with text and badge */
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center rounded-xl text-xs font-medium transition-all duration-200 group px-2.5 py-2.5 ${
                        active
                          ? "bg-emerald-50 text-[#2E5339] font-bold border border-emerald-200/80 shadow-xs"
                          : "text-slate-700 hover:bg-prayas-stone hover:text-slate-900"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 shrink-0 transition-colors ${
                          active ? "text-[#2E5339]" : "text-slate-600 group-hover:text-slate-900"
                        }`}
                      />

                      <div className="flex items-center justify-between min-w-0 flex-1 ml-2.5 overflow-hidden whitespace-nowrap">
                        <span className="truncate">{link.label}</span>

                        {link.badge && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 ml-2 ${
                              active
                                ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                                : link.badgeColor
                            }`}
                          >
                            {link.badge}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer User & Quick Links */}
        <div className={`border-t border-prayas-rule bg-white shrink-0 overflow-hidden ${collapsed ? "p-2.5 py-3 space-y-2 flex flex-col items-center" : "p-3 space-y-2.5"}`}>
          {collapsed ? (
            /* COLLAPSED FOOTER: Clean centered Avatar & Logout Button */
            <div className="flex flex-col items-center gap-2 w-full">
              <div
                className="w-10 h-10 rounded-xl bg-[#2E5339] text-white flex items-center justify-center font-bold text-xs shadow-xs"
                title="Admin Coordinator (Online)"
              >
                A
              </div>
              <Link
                href="/admin/login"
                className="w-10 h-10 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors border border-transparent hover:border-rose-200"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            /* EXPANDED FOOTER: Full user card + Public site link */
            <>
              <div className="p-2 rounded-xl bg-prayas-stone/70 border border-prayas-rule flex items-center justify-between gap-1 overflow-hidden">
                <div className="flex items-center min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#2E5339] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                    A
                  </div>
                  <div className="flex flex-col min-w-0 ml-2 max-w-[130px] overflow-hidden whitespace-nowrap">
                    <span className="text-xs font-bold text-prayas-ink truncate">Admin Coordinator</span>
                    <span className="text-[10px] text-prayas-neem flex items-center gap-1 font-medium truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <span className="truncate">Online • Mathura Desk</span>
                    </span>
                  </div>
                </div>

                <Link
                  href="/admin/login"
                  className="p-1.5 rounded-lg text-prayas-muted hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </Link>
              </div>

              <div className="flex items-center justify-between text-[11px] text-prayas-muted px-1 mt-2">
                <Link
                  href="/"
                  target="_blank"
                  className="hover:text-prayas-ink flex items-center gap-1 transition-colors font-medium"
                >
                  <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>View Public Site</span>
                </Link>

                <span className="font-mono text-[10px] text-slate-400">12A/80G Reg.</span>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Main Administrative View Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
        {/* Top Operations Header Bar */}
        <div className="hidden lg:flex items-center justify-between px-8 h-[68px] bg-white border-b border-prayas-rule shadow-xs shrink-0">
          <div className="flex items-center gap-2 text-xs text-prayas-muted">
            <Link href="/admin" className="hover:text-prayas-ink font-semibold">
              Admin Console
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-prayas-ink font-bold capitalize">
              {pathname === "/admin" ? "Overview" : pathname ? pathname.replace("/admin/", "").replace(/-/g, " ") : "Overview"}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-prayas-stone border border-prayas-rule text-prayas-muted font-mono text-[11px]">
              <Clock className="w-3.5 h-3.5 text-prayas-neem" />
              <span>Vrindavan Seva Karyalaya • Active</span>
            </div>

            <Link
              href="/admin/notifications"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#2E5339] text-white hover:bg-[#23432b] transition-colors shadow-sm"
              style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Broadcast Push Alert</span>
            </Link>
          </div>
        </div>

        {/* Dynamic Page Content with fluid responsive container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 2xl:p-10 max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[1800px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
