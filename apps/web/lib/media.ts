export const ALLOWED_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".svg",
  ".avif",
];
export const ALLOWED_VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogg", ".mov"];
export const ALLOWED_SERVE_EXTENSIONS = [
  ...ALLOWED_IMAGE_EXTENSIONS,
  ...ALLOWED_VIDEO_EXTENSIONS,
];

/**
 * Checks whether a URL, filename, or path points to a supported direct video file.
 * Safe for both Client and Server components (zero node:fs / node:path dependencies).
 */
export function isVideoUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const clean = url.split("?")[0].split("#")[0].toLowerCase();
  return ALLOWED_VIDEO_EXTENSIONS.some((ext) => clean.endsWith(ext));
}

/**
 * Extracts a YouTube video ID from various YouTube URL formats
 * (standard watch, short URL youtu.be, shorts, embeds, and mobile links).
 */
export function extractYouTubeId(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();

  // Pattern matches:
  // youtube.com/watch?v=ID
  // youtu.be/ID
  // youtube.com/embed/ID
  // youtube.com/shorts/ID
  // youtube.com/v/ID
  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/,
    /^([\w-]{11})$/, // If just the 11-char ID was passed
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Returns a high-res or HQ YouTube thumbnail URL for a given YouTube video ID.
 */
export function getYouTubeThumbnail(
  videoId: string,
  quality: "maxres" | "hq" | "mq" = "maxres"
): string {
  if (!videoId) return "";
  if (quality === "maxres") {
    // maxresdefault is 1280x720, hqdefault is 480x360
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`;
}

/**
 * Extracts a Vimeo video ID from a Vimeo URL.
 */
export function extractVimeoId(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  const match = url.trim().match(/(?:vimeo\.com\/)(\d+)/);
  return match && match[1] ? match[1] : null;
}

/**
 * Determines whether a URL is any kind of playable video
 * (YouTube, Vimeo, or direct video file).
 */
export function isVideoLink(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  return Boolean(
    isVideoUrl(url) || extractYouTubeId(url) || extractVimeoId(url)
  );
}

/**
 * Returns an embeddable iframe URL for YouTube, Vimeo, or null for native video files.
 */
export function getVideoEmbedUrl(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;

  const ytId = extractYouTubeId(url);
  if (ytId) {
    return `https://www.youtube-nocookie.com/embed/${ytId}?rel=0&autoplay=1`;
  }

  const vimeoId = extractVimeoId(url);
  if (vimeoId) {
    return `https://player.vimeo.com/video/${vimeoId}?autoplay=1`;
  }

  return null;
}

/**
 * Parses imageUrl field which may store a single URL, JSON array, or comma-separated list.
 * Always returns a clean array of string URLs.
 */
export function parseMediaImages(imageUrl?: string | null): string[] {
  if (!imageUrl || typeof imageUrl !== "string") return [];
  const trimmed = imageUrl.trim();
  if (!trimmed) return [];

  // Check if it is a JSON array string
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((s) => String(s).trim()).filter(Boolean);
      }
    } catch {}
  }

  // Check if it is comma-separated
  if (trimmed.includes(",")) {
    return trimmed
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return [trimmed];
}

/**
 * Formats an array of image URLs for storage in the imageUrl column.
 */
export function formatMediaImages(images: string[]): string {
  const clean = images.map((s) => (typeof s === "string" ? s.trim() : "")).filter(Boolean);
  if (clean.length === 0) return "";
  if (clean.length === 1) return clean[0];
  return JSON.stringify(clean);
}
