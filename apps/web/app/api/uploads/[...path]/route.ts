import { NextResponse } from "next/server";
import { resolveUploadedFilePath, getMimeType } from "@/lib/uploads";
import fs from "fs";
import { readFile } from "fs/promises";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const rawPath = params.path;
    if (!rawPath || rawPath.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const filePath = resolveUploadedFilePath(rawPath);
    if (!filePath) {
      return new NextResponse("File Not Found", {
        status: 404,
        headers: {
          "Content-Type": "text/plain",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    const stat = fs.statSync(filePath);
    const mimeType = getMimeType(filePath);
    const isMedia = mimeType.startsWith("image/") || mimeType.startsWith("video/");

    // Handle HTTP Range Requests for smooth video streaming and scrubbing
    const rangeHeader = req.headers.get("range");
    if (rangeHeader && mimeType.startsWith("video/")) {
      const parts = rangeHeader.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;

      if (!isNaN(start) && start < stat.size) {
        const safeEnd = Math.min(isNaN(end) ? stat.size - 1 : end, stat.size - 1);
        const chunksize = safeEnd - start + 1;

        const fileBuffer = await readFile(filePath);
        const chunk = fileBuffer.subarray(start, safeEnd + 1);

        return new NextResponse(chunk, {
          status: 206,
          headers: {
            "Content-Range": `bytes ${start}-${safeEnd}/${stat.size}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunksize.toString(),
            "Content-Type": mimeType,
            "Content-Disposition": "inline",
            "Cache-Control": "public, max-age=31536000, immutable",
            "X-Content-Type-Options": "nosniff",
          },
        });
      }
    }

    const fileBuffer = await readFile(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Length": stat.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Accept-Ranges": "bytes",
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": isMedia ? "inline" : "attachment",
      },
    });
  } catch (error: any) {
    console.error("[Serve API Uploaded File Error]", error);
    return new NextResponse("Internal Server Error", {
      status: 500,
      headers: { "X-Content-Type-Options": "nosniff" },
    });
  }
}

