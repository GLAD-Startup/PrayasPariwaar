export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
export const ALLOWED_VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogg", ".mov"];
export const ALLOWED_SERVE_EXTENSIONS = [
  ...ALLOWED_IMAGE_EXTENSIONS,
  ...ALLOWED_VIDEO_EXTENSIONS,
];

/**
 * Checks whether a URL, filename, or path points to a supported video file.
 * Safe for both Client and Server components (zero node:fs / node:path dependencies).
 */
export function isVideoUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const clean = url.split("?")[0].split("#")[0].toLowerCase();
  return ALLOWED_VIDEO_EXTENSIONS.some((ext) => clean.endsWith(ext));
}

