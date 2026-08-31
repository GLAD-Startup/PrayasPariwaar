import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Images } from "lucide-react";

export const revalidate = 60;

export default async function GalleryPage() {
  const [projectImages, postImages] = await Promise.all([
    prisma.projectImage.findMany({
      include: { project: { select: { title: true, slug: true, category: true } } },
      orderBy: { order: "asc" },
    }),
    prisma.postImage.findMany({
      include: { post: { select: { title: true, slug: true } } },
      orderBy: { order: "asc" },
    }),
  ]);

  const allPhotos = [
    ...projectImages.map((img) => ({
      id: img.id,
      url: img.url,
      caption: img.caption || img.project.title,
      parentTitle: img.project.title,
      parentHref: `/projects/${img.project.slug}`,
      tag: img.project.category,
    })),
    ...postImages.map((img) => ({
      id: img.id,
      url: img.url,
      caption: img.caption || img.post.title,
      parentTitle: img.post.title,
      parentHref: `/blog/${img.post.slug}`,
      tag: "Field Event",
    })),
  ];

  return (
    <div className="space-y-8 sm:space-y-12 pb-20 max-w-7xl 2xl:max-w-[1440px] 3xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 pt-6 sm:pt-10">
      <div className="space-y-3 border-b border-prayas-rule pb-6">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs 2xl:text-sm font-semibold text-prayas-muted hover:text-prayas-ink"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Programs
        </Link>
        <h1 className="font-serif text-2xl xs:text-3xl sm:text-4xl 2xl:text-5xl font-bold text-prayas-ink leading-tight">
          Field Documentation Photo Gallery
        </h1>
        <p className="text-sm sm:text-base 2xl:text-lg text-prayas-muted max-w-2xl 2xl:max-w-3xl leading-relaxed">
          Authentic, unvarnished photographic records from 18 years of community seva across Vrindavan, Mathura, and surrounding villages.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 2xl:gap-8">
        {allPhotos.map((photo) => (
          <div
            key={photo.id}
            className="border border-prayas-rule bg-white rounded overflow-hidden shadow-card flex flex-col justify-between"
          >
            <div className="aspect-[4/3] bg-prayas-stone overflow-hidden border-b border-prayas-rule">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.caption}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            <div className="p-4 space-y-2 flex-grow flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-prayas-stone border border-prayas-rule text-[10px] font-bold uppercase tracking-wider text-prayas-ink">
                  {photo.tag}
                </span>
                <p className="text-xs text-prayas-ink font-medium mt-2 leading-snug">
                  {photo.caption}
                </p>
              </div>
              <div className="pt-2 border-t border-prayas-rule text-[11px]">
                <Link
                  href={photo.parentHref}
                  className="font-semibold text-prayas-neem hover:underline"
                >
                  View Related: {photo.parentTitle} →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
