import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { getUploadsDir } from "@/lib/uploads";
import GalleryClient from "./GalleryClient";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Photos & Videos Gallery | Prayas Pariwaar",
  description:
    "Explore on-ground photography and field video chronicles from our core seva initiatives across Mathura, Vrindavan, and Braj region.",
  alternates: {
    canonical: "/gallery",
  },
};

function getStoredGalleryFallback() {
  try {
    const storageFile = path.join(getUploadsDir(), "gallery-data.json");
    if (fs.existsSync(storageFile)) {
      const content = fs.readFileSync(storageFile, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.warn("Could not read local gallery-data.json fallback:", e);
  }
  return { albums: [], photos: [] };
}

export default async function GalleryPage() {
  let albums: any[] = [];
  let photos: any[] = [];

  try {
    if ((prisma as any).galleryAlbum && (prisma as any).galleryPhoto) {
      const dbAlbums = await (prisma as any).galleryAlbum.findMany({
        where: { published: true },
        include: {
          photos: {
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { order: "asc" },
      });

      albums = (dbAlbums || []).map((alb: any) => ({
        id: alb.id,
        title: alb.title,
        slug: alb.slug,
        category: alb.category,
        coverImage: alb.coverImage,
        description: alb.description,
        date: alb.eventDate ? new Date(alb.eventDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : null,
        photoCount: alb.photos?.length || 0,
        photos: (alb.photos || []).map((p: any) => ({
          id: p.id,
          albumId: p.albumId,
          title: p.title,
          caption: p.caption,
          url: p.url,
          category: p.category,
          location: p.location,
        })),
      }));

      const dbPhotos = await (prisma as any).galleryPhoto.findMany({
        take: 60,
        orderBy: { createdAt: "desc" },
        include: { album: true },
      });

      photos = (dbPhotos || []).map((p: any) => ({
        id: p.id,
        albumId: p.albumId,
        title: p.title,
        caption: p.caption,
        url: p.url,
        category: p.category,
        location: p.location,
      }));
    }
  } catch (e) {
    console.warn("Prisma query failed in GalleryPage, using file-backed fallback:", e);
  }

  // Fallback to gallery-data.json if database was empty or unreachable
  if (albums.length === 0 && photos.length === 0) {
    const fallback = getStoredGalleryFallback();
    albums = fallback.albums || [];
    photos = fallback.photos || [];
  }

  return (
    <Suspense
      fallback={
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-prayas-ink">
            Loading field gallery...
          </p>
        </div>
      }
    >
      <GalleryClient initialAlbums={albums} initialPhotos={photos} />
    </Suspense>
  );
}
