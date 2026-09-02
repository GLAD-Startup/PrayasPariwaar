import path from "path";
import fs from "fs";

/**
 * Returns the primary writable directory for storing uploads.
 * Works across root cwd, apps/web cwd, PM2, Docker, and standalone builds.
 */
export function getUploadsDir(): string {
  if (process.env.UPLOAD_DIR) {
    const customDir = path.resolve(process.env.UPLOAD_DIR);
    if (!fs.existsSync(customDir)) {
      try {
        fs.mkdirSync(customDir, { recursive: true });
      } catch (e) {
        console.warn("[Uploads] Failed to create custom UPLOAD_DIR:", e);
      }
    }
    return customDir;
  }

  const cwd = process.cwd();
  
  // If running from root of monorepo and apps/web exists, prefer apps/web/public/uploads
  if (fs.existsSync(path.join(cwd, "apps", "web"))) {
    const webUploads = path.join(cwd, "apps", "web", "public", "uploads");
    if (!fs.existsSync(webUploads)) {
      try {
        fs.mkdirSync(webUploads, { recursive: true });
      } catch (e) {}
    }
    return webUploads;
  }

  // Otherwise, use cwd/public/uploads
  const defaultDir = path.join(cwd, "public", "uploads");
  if (!fs.existsSync(defaultDir)) {
    try {
      fs.mkdirSync(defaultDir, { recursive: true });
    } catch (e) {}
  }
  return defaultDir;
}

/**
 * Locates an uploaded file across all candidate directory locations.
 * Returns the absolute path if found, or null if not found.
 */
export function resolveUploadedFilePath(relativeSubpath: string | string[]): string | null {
  const parts = Array.isArray(relativeSubpath) ? relativeSubpath : [relativeSubpath];
  
  // Protect against directory traversal attacks
  const safeRelativePath = path.normalize(path.join(...parts)).replace(/^(\.\.[\/\\])+/, "");
  if (safeRelativePath.includes("..")) {
    return null;
  }

  const cwd = process.cwd();
  const searchDirectories = [
    getUploadsDir(),
    path.join(cwd, "public", "uploads"),
    path.join(cwd, "apps", "web", "public", "uploads"),
    path.join(cwd, "public"),
    path.join(cwd, "apps", "web", "public"),
  ];

  for (const dir of searchDirectories) {
    const fullPath = path.join(dir, safeRelativePath);
    if (fs.existsSync(fullPath)) {
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isFile()) {
          return fullPath;
        }
      } catch (e) {}
    }
  }

  return null;
}

/**
 * Content-Type MIME map for static file streaming
 */
const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".pjpeg": "image/jpeg",
  ".jfif": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".json": "application/json",
};

export function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

/**
 * Sanitizes original filename and generates a unique, timestamped name
 */
export function generateUniqueFilename(originalName: string, mimeType?: string): string {
  let ext = path.extname(originalName).toLowerCase();
  
  if (!ext || ext === ".") {
    // Infer extension from mimeType
    if (mimeType?.includes("png")) ext = ".png";
    else if (mimeType?.includes("webp")) ext = ".webp";
    else if (mimeType?.includes("gif")) ext = ".gif";
    else if (mimeType?.includes("svg")) ext = ".svg";
    else if (mimeType?.includes("avif")) ext = ".avif";
    else if (mimeType?.includes("pdf")) ext = ".pdf";
    else ext = ".jpg";
  }

  const baseName = path
    .basename(originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 40) || "photo";

  return `${Date.now()}-${baseName}${ext}`;
}
