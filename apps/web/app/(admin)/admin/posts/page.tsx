import { prisma } from "@/lib/prisma";
import { FileText, Plus, CheckCircle, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  let posts: any[] = [];
  try {
    posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    console.warn("DB not ready");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Impact Stories & News Articles
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Publish blog articles, press releases, and patient recovery stories.
          </p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {posts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No articles published yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-4">Title & Slug</th>
                  <th className="p-4">Excerpt</th>
                  <th className="p-4">Published</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-800/40">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{post.title}</div>
                      <div className="text-slate-400 text-[11px] font-mono">/blog/{post.slug}</div>
                    </td>
                    <td className="p-4 text-slate-400 max-w-sm truncate">{post.excerpt || post.content}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold">
                        Published
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
