import Link from "next/link";
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
  ShieldCheck,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-prayas-paper text-prayas-ink flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-prayas-rule flex flex-col justify-between p-5 shadow-subtle shrink-0">
        <div className="space-y-6">
          {/* Brand */}
          <Link href="/admin" className="flex items-center gap-3 border-b border-prayas-rule pb-4 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/prayas-logo.png"
              alt="Prayas Pariwaar"
              className="h-10 w-auto object-contain"
            />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold tracking-wider text-prayas-neem">
                Administrative Office
              </span>
              <span className="text-[11px] text-prayas-muted font-medium">
                Vrindavan Seva Console
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-medium text-prayas-ink">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 px-3 py-2 rounded hover:bg-prayas-stone transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-prayas-muted" />
              <span>Office Overview</span>
            </Link>

            <Link
              href="/admin/blood-requests"
              className="flex items-center gap-2.5 px-3 py-2 rounded hover:bg-prayas-stone transition-colors font-semibold text-prayas-crimson"
            >
              <Droplet className="w-4 h-4 fill-current text-prayas-crimson" />
              <span>Blood Requests Queue</span>
            </Link>

            <Link
              href="/admin/equipment"
              className="flex items-center gap-2.5 px-3 py-2 rounded hover:bg-prayas-stone transition-colors"
            >
              <Stethoscope className="w-4 h-4 text-prayas-neem" />
              <span>Equipment & Loans</span>
            </Link>

            <Link
              href="/admin/volunteers"
              className="flex items-center gap-2.5 px-3 py-2 rounded hover:bg-prayas-stone transition-colors"
            >
              <Users className="w-4 h-4 text-prayas-marigold" />
              <span>Volunteer Applications</span>
            </Link>

            <Link
              href="/admin/donations"
              className="flex items-center gap-2.5 px-3 py-2 rounded hover:bg-prayas-stone transition-colors"
            >
              <Heart className="w-4 h-4 text-prayas-crimson" />
              <span>Donations & 80G Receipts</span>
            </Link>

            <Link
              href="/admin/posts"
              className="flex items-center gap-2.5 px-3 py-2 rounded hover:bg-prayas-stone transition-colors"
            >
              <FileText className="w-4 h-4 text-prayas-muted" />
              <span>Dispatches & Events</span>
            </Link>

            <Link
              href="/admin/media"
              className="flex items-center gap-2.5 px-3 py-2 rounded hover:bg-prayas-stone transition-colors"
            >
              <Newspaper className="w-4 h-4 text-prayas-neem" />
              <span>Media Centre & Press</span>
            </Link>

            <Link
              href="/admin/projects"
              className="flex items-center gap-2.5 px-3 py-2 rounded hover:bg-prayas-stone transition-colors"
            >
              <FolderKanban className="w-4 h-4 text-prayas-muted" />
              <span>Programs & Causes</span>
            </Link>

            <Link
              href="/admin/notifications"
              className="flex items-center gap-2.5 px-3 py-2 rounded hover:bg-prayas-stone transition-colors"
            >
              <Bell className="w-4 h-4 text-prayas-muted" />
              <span>Expo Push Broadcaster</span>
            </Link>

            <Link
              href="/admin/inquiries"
              className="flex items-center gap-2.5 px-3 py-2 rounded hover:bg-prayas-stone transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-prayas-muted" />
              <span>Inquiries & Messages</span>
            </Link>
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-prayas-rule space-y-1.5 text-xs">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded text-prayas-muted hover:bg-prayas-stone hover:text-prayas-ink transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" /> View Public Site
            </span>
          </Link>

          <Link
            href="/admin/login"
            className="flex items-center gap-2 px-3 py-2 rounded text-prayas-crimson hover:bg-red-50 transition-colors font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Administrative View */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto max-h-screen">
        {children}
      </main>
    </div>
  );
}
