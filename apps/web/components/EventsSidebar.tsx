import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowRight, Heart, Calendar, MapPin, Image as ImageIcon } from "lucide-react";

interface EventsSidebarProps {
  currentPostId?: string;
  currentProjectSlug?: string;
}

export default async function EventsSidebar({
  currentPostId,
  currentProjectSlug,
}: EventsSidebarProps) {
  // Fetch recent posts / activities
  const recentActivities = await prisma.post.findMany({
    where: {
      published: true,
      ...(currentPostId ? { NOT: { id: currentPostId } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Fetch latest projects
  const latestProjects = await prisma.project.findMany({
    where: {
      status: "ACTIVE",
      ...(currentProjectSlug ? { NOT: { slug: currentProjectSlug } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <aside className="space-y-8">
      {/* 1. RECENT ACTIVITY (Matching Screenshot) */}
      <div className="space-y-4">
        <div className="flex items-center">
          <h3 className="font-serif text-lg font-bold text-prayas-ink shrink-0">
            Recent Activity
          </h3>
          <div className="h-0.5 bg-[#D97706] flex-1 ml-3 rounded-full" />
        </div>

        <div className="space-y-3.5">
          {recentActivities.map((item) => (
            <article
              key={item.id}
              className="flex items-start gap-3 p-2.5 rounded-xl border border-prayas-rule bg-white hover:bg-prayas-paper transition-all group shadow-sm"
            >
              {/* Thumbnail */}
              <Link href={`/blog/${item.slug}`} className="shrink-0">
                <div className="w-20 h-16 rounded-lg overflow-hidden border border-prayas-rule bg-prayas-stone relative">
                  {item.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-prayas-muted">
                      <ImageIcon className="w-5 h-5 opacity-40" />
                    </div>
                  )}
                </div>
              </Link>

              {/* Title & Read More */}
              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="font-serif text-xs sm:text-sm font-bold text-prayas-ink group-hover:text-prayas-neem transition-colors line-clamp-2 leading-snug">
                  <Link href={`/blog/${item.slug}`}>
                    {item.title}
                  </Link>
                </h4>
                <Link
                  href={`/blog/${item.slug}`}
                  className="inline-block text-[11px] font-bold text-[#B45309] hover:underline"
                >
                  Read More
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* 2. LATEST PROJECTS (Matching Screenshot) */}
      <div className="space-y-4">
        <div className="flex items-center">
          <h3 className="font-serif text-lg font-bold text-prayas-ink shrink-0">
            Latest Projects
          </h3>
          <div className="h-0.5 bg-[#D97706] flex-1 ml-3 rounded-full" />
        </div>

        <div className="space-y-3.5">
          {latestProjects.map((p) => {
            const percent = p.goalAmount > 0
              ? Math.min(Math.round((p.raisedAmount / p.goalAmount) * 100), 100)
              : 0;

            return (
              <article
                key={p.id}
                className="flex items-start gap-3 p-2.5 rounded-xl border border-prayas-rule bg-white hover:bg-prayas-paper transition-all group shadow-sm"
              >
                {/* Thumbnail */}
                <Link href={`/projects/${p.slug}`} className="shrink-0">
                  <div className="w-20 h-16 rounded-lg overflow-hidden border border-prayas-rule bg-prayas-stone relative">
                    {p.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.coverImage}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-prayas-muted">
                        <ImageIcon className="w-5 h-5 opacity-40" />
                      </div>
                    )}
                  </div>
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="font-serif text-xs sm:text-sm font-bold text-prayas-ink group-hover:text-prayas-neem transition-colors line-clamp-2 leading-snug">
                    <Link href={`/projects/${p.slug}`}>
                      {p.title}
                    </Link>
                  </h4>
                  <Link
                    href={`/projects/${p.slug}`}
                    className="inline-block text-[11px] font-bold text-[#B45309] hover:underline"
                  >
                    View Project
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* 3. QUICK SEVA DONATION CTA CARD */}
      <div className="p-5 rounded-2xl bg-prayas-paper border border-prayas-rule shadow-sm space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-prayas-neem">
          Support Prayas Seva
        </span>
        <h4 className="font-serif text-sm font-bold text-prayas-ink leading-snug">
          Sponsor a Child in Vrindavan for ₹500/mo
        </h4>
        <p className="text-xs text-prayas-muted leading-relaxed">
          100% direct allocation for books, tuition & snacks. 80G tax receipt emailed instantly.
        </p>
        <Link
          href="/donate?project=aashayein-education"
          className="w-full py-2.5 px-3 rounded-lg text-center font-bold text-xs bg-[#2E5339] text-white hover:bg-[#23432b] transition-all shadow-sm flex items-center justify-center gap-1.5"
          style={{ backgroundColor: "#2E5339", color: "#ffffff" }}
        >
          <Heart className="w-3.5 h-3.5 fill-white text-white" />
          <span>Sponsor a Student (80G)</span>
        </Link>
      </div>
    </aside>
  );
}
