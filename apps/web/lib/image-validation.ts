import sharp from "sharp";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB per file
export const MAX_REQUEST_SIZE = 20 * 1024 * 1024; // 20 MB aggregate per request
export const MAX_FILES_PER_REQUEST = 10;

export const ALLOWED_FORMATS = ["jpeg", "png", "webp", "gif"] as const;
export type AllowedFormat = (typeof ALLOWED_FORMATS)[number];

export interface ValidatedImage {
  format: AllowedFormat;
  extension: ".jpg" | ".png" | ".webp" | ".gif";
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
  width: number;
  height: number;
  size: number;
}

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  image?: ValidatedImage;
}

const DANGEROUS_STRINGS = [
  "<script",
  "</script>",
  "<svg",
  "</svg>",
  "<?xml",
  "<html",
  "</html>",
  "<!doctype",
  "onload=",
  "onerror=",
  "onclick=",
  "javascript:",
  "vbscript:",
  "data:text/html",
];

const DANGEROUS_NEEDLES = DANGEROUS_STRINGS.map((s) =>
  Buffer.from(s, "ascii")
);

/**
 * Checks whether the buffer contains active text/script/SVG payloads.
 */
export function hasActiveContent(buffer: Buffer): boolean {
  const lower = Buffer.from(buffer);
  for (let i = 0; i < lower.length; i++) {
    const byte = lower[i];
    if (byte >= 65 && byte <= 90) {
      lower[i] = byte + 32;
    }
  }

  for (const needle of DANGEROUS_NEEDLES) {
    if (lower.indexOf(needle) !== -1) {
      return true;
    }
  }

  return false;
}

/**
 * Quick magic-byte sanity check for raster image candidate.
 */
export function matchesAllowedMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 8) return false;

  // JPEG: FF D8 FF
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return true;
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return true;
  }

  // WebP: RIFF....WEBP
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return true;
  }

  // GIF: GIF87a or GIF89a
  if (buffer.length >= 6) {
    const sig = buffer.subarray(0, 6).toString("ascii");
    if (sig === "GIF87a" || sig === "GIF89a") {
      return true;
    }
  }

  return false;
}

/**
 * Validates and fully decodes an image buffer using `sharp`.
 * Rejects non-images, corrupt images, active documents (SVG/HTML/JS), and polyglots.
 */
export async function validateAndDecodeImage(
  buffer: Buffer
): Promise<ImageValidationResult> {
  // 1. Size bounds
  if (!buffer || buffer.length === 0) {
    return { valid: false, error: "Empty file provided." };
  }

  if (buffer.length > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size (${(buffer.length / (1024 * 1024)).toFixed(
        2
      )}MB) exceeds maximum limit of 5MB.`,
    };
  }

  // 2. Active content / script / SVG inspection
  if (hasActiveContent(buffer)) {
    return {
      valid: false,
      error:
        "File rejected: Active document, script, or SVG content detected. SVG and HTML uploads are not permitted for security reasons.",
    };
  }

  // 3. Magic-byte candidate check
  if (!matchesAllowedMagicBytes(buffer)) {
    return {
      valid: false,
      error:
        "Invalid file signature. Only standard raster images (JPEG, PNG, WebP, GIF) are accepted.",
    };
  }

  // 4. Robust decoding and structural verification via sharp
  try {
    const image = sharp(buffer, {
      failOn: "error",
      animated: true,
      limitInputPixels: 268402689, // Prevent decompression bombs (~16384x16384)
    });

    const metadata = await image.metadata();

    if (!metadata.format) {
      return {
        valid: false,
        error: "Unrecognized or corrupt image format.",
      };
    }

    const rawFormat = metadata.format.toLowerCase();

    // Explicit rejection of SVG even if sharp were capable of reading it
    if (rawFormat === "svg") {
      return {
        valid: false,
        error:
          "SVG uploads are permanently disabled due to active content/XSS risks. Please upload a raster image (JPG, PNG, WebP, GIF).",
      };
    }

    if (!ALLOWED_FORMATS.includes(rawFormat as AllowedFormat)) {
      return {
        valid: false,
        error: `Unsupported image format '${rawFormat}'. Allowed formats: JPG, PNG, WEBP, GIF.`,
      };
    }

    const format = rawFormat as AllowedFormat;

    if (!metadata.width || !metadata.height || metadata.width <= 0 || metadata.height <= 0) {
      return {
        valid: false,
        error: "Image possesses invalid or zero dimensions.",
      };
    }

    // Force pixel decompression and chunk decoding to ensure image stream is intact
    await image.stats();

    let extension: ".jpg" | ".png" | ".webp" | ".gif";
    let mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";

    switch (format) {
      case "jpeg":
        extension = ".jpg";
        mimeType = "image/jpeg";
        break;
      case "png":
        extension = ".png";
        mimeType = "image/png";
        break;
      case "webp":
        extension = ".webp";
        mimeType = "image/webp";
        break;
      case "gif":
        extension = ".gif";
        mimeType = "image/gif";
        break;
    }

    return {
      valid: true,
      image: {
        format,
        extension,
        mimeType,
        width: metadata.width,
        height: metadata.height,
        size: buffer.length,
      },
    };
  } catch (error: any) {
    return {
      valid: false,
      error: `Corrupt or malformed image data: ${error?.message || "Failed to parse image"}`,
    };
  }
}
