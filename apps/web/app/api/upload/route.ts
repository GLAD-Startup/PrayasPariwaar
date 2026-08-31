import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File | null;

    const filesToProcess: File[] = [];
    if (singleFile && singleFile.size > 0) {
      filesToProcess.push(singleFile);
    }
    for (const f of files) {
      if (f && f.size > 0 && !filesToProcess.includes(f)) {
        filesToProcess.push(f);
      }
    }

    if (filesToProcess.length === 0) {
      return NextResponse.json(
        { error: "No image file provided. Please attach at least one image." },
        { status: 400 }
      );
    }

    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "image/avif",
    ];

    const uploadedUrls: { url: string; filename: string; size: number }[] = [];
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    for (const file of filesToProcess) {
      if (!allowedMimeTypes.includes(file.type)) {
        return NextResponse.json(
          {
            error: `Invalid file type (${file.type}). Allowed formats: JPG, PNG, WEBP, GIF, SVG.`,
          },
          { status: 400 }
        );
      }

      // 10MB maximum limit
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: `File ${file.name} is too large. Maximum size is 10MB.` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Clean, sanitized unique filename
      const ext = path.extname(file.name) || ".jpg";
      const baseName = path
        .basename(file.name, ext)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .substring(0, 40);

      const uniqueName = `${Date.now()}-${baseName}${ext}`;
      const filePath = path.join(uploadDir, uniqueName);

      await writeFile(filePath, buffer);

      const publicUrl = `/uploads/${uniqueName}`;
      uploadedUrls.push({
        url: publicUrl,
        filename: uniqueName,
        size: file.size,
      });
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
      urls: uploadedUrls.map((u) => u.url),
      files: uploadedUrls,
    });
  } catch (error: any) {
    console.error("[Upload API Error]", error);
    return NextResponse.json(
      { error: "Failed to upload file to server", details: error.message },
      { status: 500 }
    );
  }
}
