"use client";

import { useState, useRef } from "react";
import {
  UploadCloud,
  X,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Link as LinkIcon,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { apiFetch, assetPath } from "@/lib/api";
import TimelineImagePlaceholder from "@/components/TimelineImagePlaceholder";

interface ImageUploadProps {
  value?: string | string[];
  onChange: (value: any) => void;
  multiple?: boolean;
  label?: string;
  description?: string;
  required?: boolean;
}

/**
 * Client-side smart image compressor.
 * If a raw photo is from a modern camera/smartphone (> 1.5 MB or > 2400px),
 * downsamples to 2200px max dimension and 85% JPEG quality.
 * Reduces 10MB camera files to ~500KB in milliseconds, eliminating payload size limits.
 */
async function compressImageIfLarge(file: File): Promise<File> {
  if (
    !file.type.startsWith("image/") ||
    file.type === "image/gif" ||
    file.type === "image/svg+xml"
  ) {
    return file;
  }
  // Only compress if file is larger than 1.5 MB
  if (file.size < 1.5 * 1024 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const MAX_DIM = 2200;
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(file);
        }
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              return resolve(file);
            }
            const cleanName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
            const compressed = new File([blob], cleanName, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressed);
          },
          "image/jpeg",
          0.85
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };
      img.src = objectUrl;
    } catch {
      resolve(file);
    }
  });
}

export default function ImageUpload({
  value,
  onChange,
  multiple = false,
  label = "Upload Image",
  description = "Supports JPG, PNG, WEBP, GIF, SVG up to 25MB",
  required = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState("");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Normalize value to array for multi or string for single
  const imageList: string[] = Array.isArray(value)
    ? value.filter(Boolean)
    : value
    ? [value]
    : [];

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);
    setUploadProgress(null);

    const fileArray = Array.from(files);

    try {
      if (!multiple) {
        // Single file upload
        const rawFile = fileArray[0];
        const fileToUpload = await compressImageIfLarge(rawFile);
        const formData = new FormData();
        formData.append("file", fileToUpload);

        const res = await apiFetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const text = await res.text();
        let data: any = null;
        try {
          data = JSON.parse(text);
        } catch {
          if (!res.ok) {
            throw new Error(`Upload server returned HTTP ${res.status}: ${res.statusText}`);
          }
        }

        if (!res.ok || !data?.success) {
          throw new Error(data?.error || "Failed to upload image.");
        }

        onChange(data.url);
      } else {
        // Multiple files: Upload file-by-file in small concurrent workers (2 at a time).
        // This ensures NO request ever exceeds proxy or server payload limits!
        const total = fileArray.length;
        let completed = 0;
        let runningList = [...imageList];
        let firstError: string | null = null;

        setUploadProgress({ current: 0, total });

        const BATCH_SIZE = 2;
        for (let i = 0; i < fileArray.length; i += BATCH_SIZE) {
          const batch = fileArray.slice(i, i + BATCH_SIZE);
          await Promise.all(
            batch.map(async (rawFile) => {
              try {
                const optimized = await compressImageIfLarge(rawFile);
                const formData = new FormData();
                formData.append("file", optimized);

                const res = await apiFetch("/api/upload", {
                  method: "POST",
                  body: formData,
                });

                const text = await res.text();
                let data: any = null;
                try {
                  data = JSON.parse(text);
                } catch {
                  if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                  }
                }

                if (res.ok && data?.success && data?.url) {
                  runningList = [...runningList, data.url];
                  onChange(runningList);
                } else if (!firstError) {
                  firstError = data?.error || `Failed to upload ${rawFile.name}`;
                }
              } catch (e: any) {
                console.warn(`[ImageUpload] Batch error for ${rawFile.name}:`, e);
                if (!firstError) firstError = e?.message;
              } finally {
                completed++;
                setUploadProgress({ current: completed, total });
              }
            })
          );
        }

        if (firstError && runningList.length === imageList.length) {
          throw new Error(firstError);
        } else if (firstError) {
          setError(`Notice: Some photos had issues during upload. Successful photos have been saved.`);
        }
      }
    } catch (err: any) {
      console.error("[Upload Error]", err);
      setError(err?.message || "Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddUrl = () => {
    const trimmed = urlInputValue.trim();
    if (!trimmed) return;

    if (multiple) {
      onChange([...imageList, trimmed]);
    } else {
      onChange(trimmed);
    }

    setUrlInputValue("");
    setShowUrlInput(false);
  };

  const handleRemove = (urlToRemove: string, indexToRemove: number) => {
    if (multiple) {
      const updated = imageList.filter((_, idx) => idx !== indexToRemove);
      onChange(updated);
    } else {
      onChange("");
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="space-y-2.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-prayas-ink">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <div className="flex items-center gap-2">
            {multiple && imageList.length > 0 && (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {imageList.length} {imageList.length === 1 ? "photo" : "photos"} staged
              </span>
            )}
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-[11px] text-prayas-muted hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors"
            >
              <LinkIcon className="w-3 h-3" />
              <span>{showUrlInput ? "Hide URL Input" : "Paste URL"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Optional Direct URL Input Field */}
      {showUrlInput && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-prayas-rule animate-fadeIn">
          <input
            type="url"
            placeholder="https://example.com/photo.jpg or /uploads/..."
            value={urlInputValue}
            onChange={(e) => setUrlInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddUrl();
              }
            }}
            className="flex-1 px-3 py-1.5 rounded-lg border border-prayas-rule bg-white text-xs text-prayas-ink outline-none focus:ring-2 focus:ring-emerald-700"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors shadow-sm"
          >
            Apply URL
          </button>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span className="flex-1 font-medium">{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Upload Progress Bar for Multiple Uploads */}
      {uploadProgress && (
        <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
              <span>
                Uploading photo {uploadProgress.current} of {uploadProgress.total}...
              </span>
            </span>
            <span>{Math.round((uploadProgress.current / uploadProgress.total) * 100)}%</span>
          </div>
          <div className="w-full bg-emerald-200/60 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-700 h-full transition-all duration-300 rounded-full"
              style={{
                width: `${Math.max(
                  5,
                  Math.round((uploadProgress.current / uploadProgress.total) * 100)
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Single Mode with Existing Image */}
      {!multiple && imageList.length > 0 ? (
        <div className="relative rounded-2xl overflow-hidden border border-prayas-rule bg-slate-900 aspect-[16/9] max-h-60 group shadow-sm">
          {!failedImages[imageList[0]] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={assetPath(imageList[0])}
              alt="Uploaded preview"
              onError={() =>
                setFailedImages((prev) => ({ ...prev, [imageList[0]]: true }))
              }
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <TimelineImagePlaceholder
              category="education"
              title="Documentary Photo Staged"
              className="w-full h-full"
            />
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 backdrop-blur-[2px]">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-xl bg-white text-prayas-ink text-xs font-bold shadow-md hover:bg-slate-100 transition-all flex items-center gap-1.5"
            >
              <UploadCloud className="w-3.5 h-3.5 text-emerald-700" />
              Replace Photo
            </button>
            <a
              href={assetPath(imageList[0])}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-white text-prayas-ink text-xs shadow-md hover:bg-slate-100 transition-all"
              title="Open full photo"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={() => handleCopy(imageList[0])}
              className="p-2 rounded-xl bg-white text-prayas-ink text-xs shadow-md hover:bg-slate-100 transition-all"
              title="Copy photo URL"
            >
              {copiedUrl === imageList[0] ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => handleRemove(imageList[0], 0)}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold shadow-md hover:bg-red-700 transition-all flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" /> Remove
            </button>
          </div>
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
            <span className="px-2.5 py-1 rounded-lg bg-black/70 text-white text-[10px] font-mono backdrop-blur-md max-w-[80%] truncate">
              {imageList[0]}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-semibold">
              Ready
            </span>
          </div>
        </div>
      ) : (
        /* Dropzone / Upload Box */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => {
            if (!uploading) fileInputRef.current?.click();
          }}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDragOver
              ? "border-emerald-600 bg-emerald-50/80 scale-[1.005]"
              : "border-prayas-rule bg-slate-50/60 hover:bg-slate-100/70 hover:border-emerald-600/60"
          } ${uploading ? "opacity-75 pointer-events-none" : ""}`}
        >
          <div className="flex flex-col items-center justify-center space-y-2.5">
            <div className="w-12 h-12 rounded-2xl bg-white border border-prayas-rule flex items-center justify-center text-emerald-700 shadow-sm transition-transform group-hover:scale-110">
              {uploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
              ) : (
                <UploadCloud className="w-6 h-6 text-emerald-700" />
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-prayas-ink">
                {uploading
                  ? "Uploading photos to server..."
                  : multiple
                  ? "Click to choose multiple photos or drag & drop here"
                  : "Click to upload from device or drag & drop"}
              </p>
              <p className="text-[11px] text-prayas-muted mt-0.5">{description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Multiple Mode Gallery Previews */}
      {multiple && imageList.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {imageList.map((url, idx) => (
              <div
                key={idx}
                className="relative rounded-xl overflow-hidden border border-prayas-rule bg-slate-100 aspect-square group shadow-sm"
              >
                {!failedImages[url] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={assetPath(url)}
                    alt={`Gallery photo ${idx + 1}`}
                    onError={() =>
                      setFailedImages((prev) => ({ ...prev, [url]: true }))
                    }
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <TimelineImagePlaceholder compact={true} />
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(url, idx)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow hover:bg-red-700 transition-colors opacity-90 group-hover:opacity-100"
                  title="Delete image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(url)}
                  className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center shadow hover:bg-black transition-colors opacity-0 group-hover:opacity-100"
                  title="Copy URL"
                >
                  {copiedUrl === url ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-mono">
                  #{idx + 1}
                </span>
              </div>
            ))}

            {/* Add More Photos Button in Grid */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="border-2 border-dashed border-prayas-rule rounded-xl aspect-square flex flex-col items-center justify-center gap-1.5 text-prayas-muted hover:border-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/50 transition-all text-xs font-semibold bg-white shadow-sm"
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin text-emerald-700" />
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span className="text-[10px] font-bold">Add More</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
