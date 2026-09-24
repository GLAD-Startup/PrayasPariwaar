import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getUploadsDir, generateUniqueFilename } from "@/lib/uploads";
import { getAuthUser } from "@/lib/auth";
import {
  validateAndDecodeImage,
  MAX_FILE_SIZE,
  MAX_REQUEST_SIZE,
  MAX_FILES_PER_REQUEST,
  ValidatedImage,
} from "@/lib/image-validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // 1. Authentication barrier: Require verified session (all legitimate roles permitted)
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized. Authentication required to upload files." },
        { status: 401 }
      );
    }

    // 2. Early Content-Length check to reject blatantly oversized requests before buffering
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 70 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Payload too large. Maximum aggregate request size is 60MB." },
        { status: 413 }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    const uploadDir = getUploadsDir();
    await mkdir(uploadDir, { recursive: true });

    // Staging list for validated items before writing to disk
    const itemsToSave: { buffer: Buffer; validated: ValidatedImage }[] = [];
    let aggregateBytes = 0;

    // 3A. JSON Base64 Payloads
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const rawBase64Items: string[] = [];

      if (body.dataUrl || body.base64 || body.image || body.file) {
        rawBase64Items.push(body.dataUrl || body.base64 || body.image || body.file);
      } else if (Array.isArray(body.images)) {
        for (const item of body.images) {
          if (typeof item === "string") {
            rawBase64Items.push(item);
          } else if (item?.data || item?.dataUrl || item?.base64) {
            rawBase64Items.push(item.data || item.dataUrl || item.base64);
          }
        }
      }

      if (rawBase64Items.length === 0) {
        return NextResponse.json(
          { error: "No image data found in request body." },
          { status: 400 }
        );
      }

      if (rawBase64Items.length > MAX_FILES_PER_REQUEST) {
        return NextResponse.json(
          { error: `Too many files. Maximum allowed is ${MAX_FILES_PER_REQUEST} files per request.` },
          { status: 400 }
        );
      }

      // Early resource check across all base64 items before decoding buffers into memory
      const cleanedBase64List: string[] = [];
      let totalEstimatedBytes = 0;

      for (const item of rawBase64Items) {
        let base64String = item;
        const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          base64String = matches[2];
        }

        const estimatedDecodedSize = Math.ceil((base64String.length * 3) / 4);
        if (estimatedDecodedSize > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: "File exceeds maximum size limit of 5MB." },
            { status: 413 }
          );
        }

        totalEstimatedBytes += estimatedDecodedSize;
        cleanedBase64List.push(base64String);
      }

      if (totalEstimatedBytes > MAX_REQUEST_SIZE) {
        return NextResponse.json(
          { error: "Total request upload size exceeds maximum limit of 20MB." },
          { status: 413 }
        );
      }

      for (const base64String of cleanedBase64List) {
        const buffer = Buffer.from(base64String, "base64");
        if (buffer.length > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: "File exceeds maximum size limit of 5MB." },
            { status: 413 }
          );
        }

        if (aggregateBytes + buffer.length > MAX_REQUEST_SIZE) {
          return NextResponse.json(
            { error: "Total request upload size exceeds maximum limit of 20MB." },
            { status: 413 }
          );
        }

        // Server-side robust decoding and validation via sharp
        const validation = await validateAndDecodeImage(buffer);
        if (!validation.valid || !validation.image) {
          return NextResponse.json(
            { error: validation.error || "Invalid image file." },
            { status: 400 }
          );
        }

        aggregateBytes += buffer.length;
        itemsToSave.push({ buffer, validated: validation.image });
      }
    } else {
      // 3B. Standard Multipart / Form-Data Payloads
      const formData = await req.formData();
      const filesToProcess: File[] = [];

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

      if (filesToProcess.length > MAX_FILES_PER_REQUEST) {
        return NextResponse.json(
          { error: `Too many files. Maximum allowed is ${MAX_FILES_PER_REQUEST} files per request.` },
          { status: 400 }
        );
      }

      // Upfront per-file and aggregate size checks before expensive decoding
      let totalMultipartBytes = 0;
      for (const file of filesToProcess) {
        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: `File '${file.name}' exceeds maximum size limit of 5MB.` },
            { status: 413 }
          );
        }
        totalMultipartBytes += file.size;
      }

      if (totalMultipartBytes > MAX_REQUEST_SIZE) {
        return NextResponse.json(
          { error: "Total request upload size exceeds maximum limit of 20MB." },
          { status: 413 }
        );
      }

      for (const file of filesToProcess) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        if (buffer.length > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: `File '${file.name}' exceeds maximum size limit of 5MB.` },
            { status: 413 }
          );
        }

        // Server-side robust decoding and validation via sharp
        const validation = await validateAndDecodeImage(buffer);
        if (!validation.valid || !validation.image) {
          return NextResponse.json(
            { error: validation.error || `File '${file.name}' failed image validation.` },
            { status: 400 }
          );
        }

        aggregateBytes += buffer.length;
        itemsToSave.push({ buffer, validated: validation.image });
      }
    }


    if (itemsToSave.length === 0) {
      return NextResponse.json(
        { error: "No valid files were processed." },
        { status: 400 }
      );
    }

    // 4. Persistence phase: All files passed strict validation. Write with server-generated cryptographic names.
    const uploadedUrls: { url: string; filename: string; size: number }[] = [];
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

    for (const item of itemsToSave) {
      const uniqueName = generateUniqueFilename(item.validated.extension);
      const filePath = path.join(uploadDir, uniqueName);

      await writeFile(filePath, item.buffer);

      const publicUrl = `${basePath}/uploads/${uniqueName}`;
      uploadedUrls.push({
        url: publicUrl,
        filename: uniqueName,
        size: item.buffer.length,
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
      url: uploadedUrls[0].url,
      urls: uploadedUrls.map((u) => u.url),
      files: uploadedUrls,
    });
  } catch (error: any) {
    console.error("[Upload API Error]", error);
    return NextResponse.json(
      {
        error: "Failed to process image upload",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

