import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
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
  return {
    albums: [],
    photos: [],
  };
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

// GET /api/gallery - Fetch all gallery albums and categorized photos
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const albumId = searchParams.get("albumId");

    // Try Prisma first if client has galleryAlbum model loaded
    if ((prisma as any).galleryAlbum && (prisma as any).galleryPhoto) {
      try {
        const albums = await (prisma as any).galleryAlbum.findMany({
          where: {
            published: true,
            ...(albumId ? { id: albumId } : {}),
            ...(category && category !== "All" ? { category } : {}),
          },
          include: {
            photos: {
              orderBy: { createdAt: "desc" },
            },
          },
          orderBy: { order: "asc" },
        });

        const formattedAlbums = (albums || []).map((alb: any) => ({
          ...alb,
          photoCount: alb.photos?.length || 0,
        }));

        const recentPhotos = await (prisma as any).galleryPhoto.findMany({
          where: {
            ...(albumId ? { albumId } : {}),
            ...(category && category !== "All" ? { category } : {}),
          },
          include: {
            album: true,
          },
          take: 48,
          orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({
          success: true,
          data: {
            albums: formattedAlbums,
            recentPhotos: recentPhotos || [],
          },
        });
      } catch (prismaErr) {
        console.warn("Prisma query failed, falling back to persistent storage", prismaErr);
      }
    }

    // Fallback to resilient file-backed persistent storage
    const store = getStoredGallery();
    const filteredAlbums = store.albums
      .filter((a) => !albumId || a.id === albumId)
      .filter((a) => !category || category === "All" || a.category === category)
      .map((a) => {
        const count = store.photos.filter((p) => p.albumId === a.id).length;
        return {
          ...a,
          photoCount: count > 0 ? count : (a.photoCount || 0),
        };
      });

    const filteredPhotos = store.photos
      .filter((p) => !albumId || p.albumId === albumId)
      .filter((p) => !category || category === "All" || p.category === category);

    return NextResponse.json({
      success: true,
      data: {
        albums: filteredAlbums,
        recentPhotos: filteredPhotos,
      },
    });
  } catch (error: any) {
    console.error("[Gallery GET Error]", error);
    return NextResponse.json({
      success: true,
      data: {
        albums: [],
        recentPhotos: [],
      },
    });
  }
}

// POST /api/gallery - Create new album or add photo (Admin only)
export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || (authUser.role !== "ADMIN" && authUser.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();

    // Check if bulk adding photos to an album or general gallery
    if (
      body.action === "BULK_ADD_PHOTOS" ||
      (Array.isArray(body.photos) && body.photos.length > 0) ||
      (Array.isArray(body.urls) && body.urls.length > 0)
    ) {
      const rawUrls: string[] = Array.isArray(body.urls)
        ? body.urls
        : Array.isArray(body.photos)
        ? body.photos.map((p: any) => (typeof p === "string" ? p : p?.url)).filter(Boolean)
        : [];

      if (rawUrls.length === 0) {
        return NextResponse.json({ error: "No photo URLs provided for bulk upload." }, { status: 400 });
      }

      const store = getStoredGallery();
      const targetAlbum = body.albumId ? store.albums.find((a) => a.id === body.albumId) : null;
      const targetCategory = body.category || targetAlbum?.category || "Free Education";
      const targetLocation = body.location || "Mathura / Vrindavan";

      const createdPhotos: any[] = [];
      const now = new Date().toISOString();

      for (let i = 0; i < rawUrls.length; i++) {
        const url = rawUrls[i];
        if (!url) continue;

        const defaultTitle = body.sharedTitle
          ? rawUrls.length > 1
            ? `${body.sharedTitle} (${i + 1})`
            : body.sharedTitle
          : targetAlbum
          ? `${targetAlbum.title} • Image ${i + 1}`
          : `Field Seva Photo ${i + 1}`;

        const photoRecord = {
          id: `photo-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
          albumId: body.albumId || null,
          title: defaultTitle,
          caption: body.caption || "",
          url,
          category: targetCategory,
          location: targetLocation,
          createdAt: now,
        };

        if ((prisma as any).galleryPhoto) {
          try {
            await (prisma as any).galleryPhoto.create({
              data: {
                albumId: photoRecord.albumId,
                title: photoRecord.title,
                caption: photoRecord.caption,
                url: photoRecord.url,
                category: photoRecord.category,
                location: photoRecord.location,
              },
            });
          } catch (e) {
            console.warn("Prisma bulk photo save fallback", e);
          }
        }

        createdPhotos.push(photoRecord);
      }

      // Persist to local JSON store
      store.photos.unshift(...createdPhotos);
      if (body.albumId && targetAlbum) {
        targetAlbum.photoCount = (targetAlbum.photoCount || 0) + createdPhotos.length;
      }
      saveStoredGallery(store);

      return NextResponse.json(
        {
          success: true,
          count: createdPhotos.length,
          data: createdPhotos,
          message: `Successfully uploaded and added ${createdPhotos.length} photos to ${
            targetAlbum ? `album "${targetAlbum.title}"` : "the gallery"
          }!`,
        },
        { status: 201 }
      );
    }

    // Check if adding a single photo
    if (body.action === "ADD_PHOTO" || body.type === "photo" || (body.url && !body.coverImage && !body.slug)) {
      const photoRecord = {
        id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        albumId: body.albumId || null,
        title: body.title || "Field Seva Photo",
        caption: body.caption || "",
        url: body.url,
        category: body.category || "Free Education",
        location: body.location || "Mathura / Vrindavan",
        createdAt: new Date().toISOString(),
      };

      if ((prisma as any).galleryPhoto) {
        try {
          await (prisma as any).galleryPhoto.create({
            data: {
              albumId: photoRecord.albumId,
              title: photoRecord.title,
              caption: photoRecord.caption,
              url: photoRecord.url,
              category: photoRecord.category,
              location: photoRecord.location,
            },
          });
        } catch (e) {
          console.warn("Prisma photo save fallback", e);
        }
      }

      // Persist to local JSON store
      const store = getStoredGallery();
      store.photos.unshift(photoRecord);
      if (body.albumId) {
        const album = store.albums.find((a) => a.id === body.albumId);
        if (album) album.photoCount = (album.photoCount || 0) + 1;
      }
      saveStoredGallery(store);

      return NextResponse.json({ success: true, data: photoRecord }, { status: 201 });
    }

    // Creating an Album
    const albumRecord = {
      id: `album-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: body.title || "New Seva Album",
      slug: body.slug || body.title?.toLowerCase().replace(/\s+/g, "-") || `album-${Date.now()}`,
      category: body.category || "Free Education",
      coverImage: body.coverImage || "",
      description: body.description || "",
      photoCount: 0,
      published: true,
      createdAt: new Date().toISOString(),
    };

    if ((prisma as any).galleryAlbum) {
      try {
        await (prisma as any).galleryAlbum.create({
          data: {
            title: albumRecord.title,
            slug: albumRecord.slug,
            category: albumRecord.category,
            coverImage: albumRecord.coverImage,
            description: albumRecord.description,
            published: true,
          },
        });
      } catch (e) {
        console.warn("Prisma album save fallback", e);
      }
    }

    // Persist to local JSON store
    const store = getStoredGallery();

    // Check if initial bulk photos were also uploaded during album creation
    const initialPhotos: string[] = Array.isArray(body.initialPhotos)
      ? body.initialPhotos
      : Array.isArray(body.photos)
      ? body.photos
      : [];

    if (initialPhotos.length > 0) {
      const now = new Date().toISOString();
      const createdBulk: any[] = [];
      for (let i = 0; i < initialPhotos.length; i++) {
        const pUrl = initialPhotos[i];
        if (!pUrl) continue;
        const pRec = {
          id: `photo-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
          albumId: albumRecord.id,
          title: `${albumRecord.title} • Image ${i + 1}`,
          caption: "",
          url: pUrl,
          category: albumRecord.category,
          location: body.location || "Mathura / Vrindavan",
          createdAt: now,
        };

        if ((prisma as any).galleryPhoto) {
          try {
            await (prisma as any).galleryPhoto.create({
              data: {
                albumId: pRec.albumId,
                title: pRec.title,
                caption: pRec.caption,
                url: pRec.url,
                category: pRec.category,
                location: pRec.location,
              },
            });
          } catch (e) {}
        }
        createdBulk.push(pRec);
      }

      store.photos.unshift(...createdBulk);
      albumRecord.photoCount = createdBulk.length;
    }

    store.albums.unshift(albumRecord);
    saveStoredGallery(store);

    return NextResponse.json({ success: true, data: albumRecord }, { status: 201 });
  } catch (error: any) {
    console.error("[Gallery POST Error]", error);
    return NextResponse.json({ error: "Failed to create gallery item", details: error.message }, { status: 500 });
  }
}

// DELETE /api/gallery - Delete album or photo
export async function DELETE(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || (authUser.role !== "ADMIN" && authUser.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const albumId = searchParams.get("albumId");
    const photoId = searchParams.get("photoId");

    if (photoId) {
      if ((prisma as any).galleryPhoto) {
        try {
          await (prisma as any).galleryPhoto.delete({ where: { id: photoId } });
        } catch (e) {}
      }
      const store = getStoredGallery();
      store.photos = store.photos.filter((p) => p.id !== photoId);
      saveStoredGallery(store);
      return NextResponse.json({ success: true, message: "Photo removed" });
    }

    if (albumId) {
      if ((prisma as any).galleryAlbum) {
        try {
          await (prisma as any).galleryAlbum.delete({ where: { id: albumId } });
        } catch (e) {}
      }
      const store = getStoredGallery();
      store.albums = store.albums.filter((a) => a.id !== albumId);
      saveStoredGallery(store);
      return NextResponse.json({ success: true, message: "Album removed" });
    }

    return NextResponse.json({ error: "Missing albumId or photoId parameter" }, { status: 400 });
  } catch (error: any) {
    console.error("[Gallery DELETE Error]", error);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
