import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { getUploadsDir } from "@/lib/uploads";

function getStorageFilePath(): string {
  return path.join(getUploadsDir(), "gallery-data.json");
}

interface LocalGalleryData {
  albums: any[];
  photos: any[];
}

function getStoredGallery(): LocalGalleryData {
  const storageFile = getStorageFilePath();
  try {
    if (fs.existsSync(storageFile)) {
      const content = fs.readFileSync(storageFile, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.warn("Failed to read local gallery storage", e);
  }
  return { albums: [], photos: [] };
}

function saveStoredGallery(data: LocalGalleryData) {
  try {
    const storageFile = getStorageFilePath();
    const dir = path.dirname(storageFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(storageFile, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save local gallery storage", e);
  }
}

/**
 * Automatically syncs uploaded images from a Project or Post/Event into a linked Gallery Album.
 * Creates GalleryPhoto entries in Prisma DB and in local gallery-data.json storage.
 */
export async function syncImagesToAlbum({
  albumId,
  title,
  imageUrls,
  location = "Mathura / Vrindavan",
}: {
  albumId: string;
  title: string;
  imageUrls: string[];
  location?: string;
}) {
  if (!albumId || !imageUrls || imageUrls.length === 0) return 0;

  const validUrls = Array.from(new Set(imageUrls.filter((u) => typeof u === "string" && u.trim().length > 0)));
  if (validUrls.length === 0) return 0;

  let albumCategory = "Free Education";

  // 1. Check album in Prisma
  if ((prisma as any).galleryAlbum) {
    try {
      const dbAlbum = await (prisma as any).galleryAlbum.findUnique({
        where: { id: albumId },
      });
      if (dbAlbum && dbAlbum.category) {
        albumCategory = dbAlbum.category;
      }
    } catch (e) {
      console.warn("Could not query galleryAlbum in Prisma", e);
    }
  }

  // Fallback to local storage album category if needed
  const store = getStoredGallery();
  const localAlbum = store.albums.find((a) => a.id === albumId);
  if (localAlbum && localAlbum.category) {
    albumCategory = localAlbum.category;
  }

  let addedCount = 0;

  // 2. Sync each photo
  for (const url of validUrls) {
    // Check if photo already exists in DB
    if ((prisma as any).galleryPhoto) {
      try {
        const existing = await (prisma as any).galleryPhoto.findFirst({
          where: { albumId, url },
        });

        if (!existing) {
          await (prisma as any).galleryPhoto.create({
            data: {
              albumId,
              title: title || "Field Seva Photo",
              caption: title || "",
              url,
              category: albumCategory,
              location,
            },
          });
          addedCount++;
        }
      } catch (prismaErr) {
        console.warn("Error inserting galleryPhoto into Prisma", prismaErr);
      }
    }

    // Also sync to local JSON store
    const existingInLocal = store.photos.some((p) => p.albumId === albumId && p.url === url);
    if (!existingInLocal) {
      store.photos.unshift({
        id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        albumId,
        title: title || "Field Seva Photo",
        caption: title || "",
        url,
        category: albumCategory,
        location,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // Update photoCount on the album
  if (localAlbum) {
    const totalPhotosInAlbum = store.photos.filter((p) => p.albumId === albumId).length;
    localAlbum.photoCount = totalPhotosInAlbum;
  }
  saveStoredGallery(store);

  return addedCount;
}
