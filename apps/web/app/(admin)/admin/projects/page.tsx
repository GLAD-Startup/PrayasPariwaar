import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FolderKanban, Heart, ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({
    include: {
      images: true,
      donations: { where: { status: "SUCCESS" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="border-b border-prayas-rule pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-prayas-ink flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-prayas-neem" /> Programs & Project Causes
          </h1>
          <p className="text-xs text-prayas-muted mt-1">
            Manage active community initiatives, fundraising goals, and photo galleries.
          </p>
        </div>
      </div>

      <div className="border border-prayas-rule bg-white rounded p-6 shadow-card space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-prayas-ink">
            <thead className="bg-prayas-stone border-b border-prayas-rule text-prayas-muted uppercase text-[10px] font-bold">
              <tr>
                <th className="p-2.5">Category</th>
                <th className="p-2.5">Project Title</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">Funds Raised / Goal</th>
                <th className="p-2.5">Photos</th>
                <th className="p-2.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-prayas-rule">
              {projects.map((p) => {
                const percent = p.goalAmount > 0
                  ? Math.min(Math.round((p.raisedAmount / p.goalAmount) * 100), 100)
                  : 0;

                return (
                  <tr key={p.id} className="hover:bg-prayas-paper">
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded bg-prayas-stone border border-prayas-rule text-[10px] font-bold">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-2.5 font-bold">
                      <Link href={`/projects/${p.slug}`} target="_blank" className="hover:text-prayas-neem">
                        {p.title}
                      </Link>
                    </td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded bg-green-100 text-prayas-neem border border-green-200 text-[10px] font-bold">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono">
                      ₹{p.raisedAmount.toLocaleString("en-IN")} / ₹{p.goalAmount.toLocaleString("en-IN")} ({percent}%)
                    </td>
                    <td className="p-2.5 text-prayas-muted">
                      {p.images.length} photos
                    </td>
                    <td className="p-2.5">
                      <Link
                        href={`/projects/${p.slug}`}
                        target="_blank"
                        className="text-xs font-bold text-prayas-neem hover:underline flex items-center gap-1"
                      >
                        View Page <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
