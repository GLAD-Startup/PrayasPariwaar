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
    const fileBuffer = await readFile(filePath);
    const mimeType = getMimeType(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Length": stat.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Accept-Ranges": "bytes",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
        "Content-Disposition": mimeType.startsWith("image/") ? "inline" : "attachment",
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

