import Link from "next/link";
import {
  Droplet,
  LayoutDashboard,
  Activity,
  Users,
  Heart,
  FileText,
  LogOut,
  ExternalLink,
  Shield,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-6">
        <div className="space-y-8">
          {/* Brand */}
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md">
              <Droplet className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="font-bold text-base font-display text-white">
                PRAYAS ADMIN
              </span>
              <span className="block text-[10px] uppercase tracking-wider text-red-400 font-semibold">
                Control Console
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-xs font-semibold">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-red-500" />
              Overview
            </Link>

            <Link
              href="/admin/blood-requests"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Droplet className="w-4 h-4 text-red-500 fill-red-500" />
              Blood Requests
            </Link>

            <Link
              href="/admin/equipment"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Activity className="w-4 h-4 text-emerald-500" />
              Equipment Inventory
            </Link>

            <Link
              href="/admin/volunteers"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Users className="w-4 h-4 text-amber-500" />
              Volunteers
            </Link>

            <Link
              href="/admin/donations"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Heart className="w-4 h-4 text-rose-500" />
              Donations & 80G
            </Link>

            <Link
              href="/admin/posts"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <FileText className="w-4 h-4 text-sky-500" />
              Impact Stories
            </Link>
          </nav>
        </div>

        {/* Footer actions */}
        <div className="pt-6 border-t border-slate-800 space-y-2 text-xs">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" /> View Public Site
            </span>
          </Link>

          <Link
            href="/admin/login"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-red-400 hover:bg-red-950/40 transition-colors font-semibold"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </Link>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto max-h-screen">
        {children}
      </main>
    </div>
  );
}
