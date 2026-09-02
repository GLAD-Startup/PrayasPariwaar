import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getUploadsDir, generateUniqueFilename } from "@/lib/uploads";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALLOWED_MIME_PREFIXES = ["image/"];
const ALLOWED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".pjpeg",
  ".jfif",
  ".png",
  ".webp",
  ".gif",
  ".svg",
  ".avif",
  ".ico",
  ".pdf",
];

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    const uploadDir = getUploadsDir();
    await mkdir(uploadDir, { recursive: true });

    const uploadedUrls: { url: string; filename: string; size: number }[] = [];

    // 1. Support JSON base64 payloads (e.g. data URLs or base64 strings from camera/canvas/mobile)
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const base64Items: { data: string; name?: string; type?: string }[] = [];

      if (body.dataUrl || body.base64 || body.image || body.file) {
        base64Items.push({
          data: body.dataUrl || body.base64 || body.image || body.file,
          name: body.filename || body.name || "uploaded-image.jpg",
          type: body.type,
        });
      } else if (Array.isArray(body.images)) {
        for (const item of body.images) {
          if (typeof item === "string") {
            base64Items.push({ data: item, name: "uploaded-image.jpg" });
          } else if (item?.data || item?.dataUrl || item?.base64) {
            base64Items.push({
              data: item.data || item.dataUrl || item.base64,
              name: item.filename || item.name || "uploaded-image.jpg",
              type: item.type,
            });
          }
        }
      }

      if (base64Items.length === 0) {
        return NextResponse.json(
          { error: "No base64 image data found in request body." },
          { status: 400 }
        );
      }

      for (const item of base64Items) {
        let base64String = item.data;
        let detectedMime = item.type || "image/jpeg";

        // Handle data:image/png;base64, prefix
        const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          detectedMime = matches[1];
          base64String = matches[2];
        }

        const buffer = Buffer.from(base64String, "base64");
        if (buffer.length > 25 * 1024 * 1024) {
          return NextResponse.json(
            { error: "Image file is too large. Maximum size is 25MB." },
            { status: 400 }
          );
        }

        const uniqueName = generateUniqueFilename(item.name || "photo.jpg", detectedMime);
        const filePath = path.join(uploadDir, uniqueName);
        await writeFile(filePath, buffer);

        uploadedUrls.push({
          url: `/uploads/${uniqueName}`,
          filename: uniqueName,
          size: buffer.length,
        });
      }
    } else {
      // 2. Standard Multipart / Form Data payload
      const formData = await req.formData();
      const filesToProcess: File[] = [];

      // Collect files from any form field name (file, files, image, images, photo, photos, etc.)
      for (const [key, value] of formData.entries()) {
        if (value && typeof value === "object" && typeof (value as any).arrayBuffer === "function") {
          const fileObj = value as File;
          if (fileObj.size > 0 && !filesToProcess.includes(fileObj)) {
            filesToProcess.push(fileObj);
          }
        }
      }

      if (filesToProcess.length === 0) {
        return NextResponse.json(
          { error: "No photo/file provided. Please select or attach an image file." },
          { status: 400 }
        );
      }

      for (const file of filesToProcess) {
        const ext = path.extname(file.name).toLowerCase();
        const isAllowedMime =
          ALLOWED_MIME_PREFIXES.some((prefix) => file.type.startsWith(prefix)) ||
          file.type === "application/pdf" ||
          file.type === "application/octet-stream";

        const isAllowedExt = ALLOWED_EXTENSIONS.includes(ext);

        if (!isAllowedMime && !isAllowedExt) {
          return NextResponse.json(
            {
              error: `Invalid file format (${file.type || ext}). Allowed formats: JPG, PNG, WEBP, GIF, SVG, AVIF.`,
            },
            { status: 400 }
          );
        }

        // 25MB maximum limit
        if (file.size > 25 * 1024 * 1024) {
          return NextResponse.json(
            { error: `File ${file.name} is too large. Maximum size is 25MB.` },
            { status: 400 }
          );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uniqueName = generateUniqueFilename(file.name, file.type);
        const filePath = path.join(uploadDir, uniqueName);

        await writeFile(filePath, buffer);

        uploadedUrls.push({
          url: `/uploads/${uniqueName}`,
          filename: uniqueName,
          size: file.size,
        });
      }
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        { error: "No files were saved to the server." },
        { status: 400 }
      );
    }

    if (uploadedUrls.length === 1) {
      return NextResponse.json({
        success: true,
        url: uploadedUrls[0].url,
        filename: uploadedUrls[0].filename,
        size: uploadedUrls[0].size,
        files: uploadedUrls,
      });
    }

    return NextResponse.json({
      success: true,
      url: uploadedUrls[0].url,
      urls: uploadedUrls.map((u) => u.url),
      files: uploadedUrls,
    });
  } catch (error: any) {
    console.error("[Upload API Error]", error);
    return NextResponse.json(
      {
        error: "Failed to upload file to server",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
