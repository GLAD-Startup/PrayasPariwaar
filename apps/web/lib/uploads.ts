import path from "path";
import fs from "fs";
import crypto from "crypto";

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

export const ALLOWED_SERVE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

/**
 * Locates an uploaded file across all candidate directory locations.
 * Handles subpath prefixes (like /prayas/uploads/ or /uploads/ or /api/uploads/).
 * Rejects path traversal, hidden files, non-image files, and internal files.
 * Returns the absolute path if found, or null if not found.
 */
export function resolveUploadedFilePath(relativeSubpath: string | string[]): string | null {
  const parts = Array.isArray(relativeSubpath) ? relativeSubpath : [relativeSubpath];
  
  // Strip out known route prefix segments if present in params
  const cleanParts = parts.filter(
    (p) => p !== "prayas" && p !== "uploads" && p !== "api" && Boolean(p)
  );

  const safeParts = cleanParts.length > 0 ? cleanParts : parts;
  const safeRelativePath = path
    .normalize(path.join(...safeParts))
    .replace(/^(\.\.[\/\\])+/, "");

  // Prevent path traversal
  if (safeRelativePath.includes("..")) {
    return null;
  }

  // Prevent accessing hidden files or internal files
  const baseName = path.basename(safeRelativePath).toLowerCase();
  if (baseName.startsWith(".") || baseName === "gallery-data.json") {
    return null;
  }

  // Strictly enforce safe raster image extensions
  const ext = path.extname(baseName).toLowerCase();
  if (!ALLOWED_SERVE_EXTENSIONS.includes(ext)) {
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
    const resolvedDir = path.resolve(dir);
    const fullPath = path.resolve(dir, safeRelativePath);

    // Canonical directory confinement check
    if (!fullPath.startsWith(resolvedDir + path.sep) && fullPath !== resolvedDir) {
      continue;
    }

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
 * Strict Content-Type MIME map for static image streaming
 */
const SAFE_MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return SAFE_MIME_TYPES[ext] || "application/octet-stream";
}

/**
 * Generates a collision-proof, unguessable, server-side filename with a validated safe extension.
 * Completely isolates the storage path from untrusted client-supplied filenames.
 */
export function generateUniqueFilename(validatedExtOrOriginalName: string, mimeType?: string): string {
  let ext = path.extname(validatedExtOrOriginalName).toLowerCase();

  // If first argument is directly an extension (e.g. ".jpg", ".png")
  if (validatedExtOrOriginalName.startsWith(".") && [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(validatedExtOrOriginalName)) {
    ext = validatedExtOrOriginalName.toLowerCase();
  } else if (!ext || ext === ".") {
    // Derive from mimeType if available
    if (mimeType?.includes("png")) ext = ".png";
    else if (mimeType?.includes("webp")) ext = ".webp";
    else if (mimeType?.includes("gif")) ext = ".gif";
    else ext = ".jpg";
  }

  // Ensure extension is strictly an allowed raster extension
  if (!ALLOWED_SERVE_EXTENSIONS.includes(ext)) {
    ext = ".jpg";
  }

  // Cryptographically secure 128-bit random token + timestamp
  const randomHex = crypto.randomBytes(16).toString("hex");
  return `${Date.now()}-${randomHex}${ext}`;
}

