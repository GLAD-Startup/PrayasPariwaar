"use client";

import { useState, useRef } from "react";
import { UploadCloud, X, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2, Plus } from "lucide-react";

interface ImageUploadProps {
  value?: string | string[];
  onChange: (value: any) => void;
  multiple?: boolean;
  label?: string;
  description?: string;
  required?: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  multiple = false,
  label = "Upload Image",
  description = "Supports JPG, PNG, WEBP, SVG up to 10MB",
  required = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Normalize value to array for multi or string for single
  const imageList: string[] = Array.isArray(value)
    ? value
    : value
    ? [value]
    : [];

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      if (multiple) {
        for (let i = 0; i < files.length; i++) {
          formData.append("files", files[i]);
        }
      } else {
        formData.append("file", files[0]);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload image.");
      }

      if (multiple) {
        const newUrls = data.urls || (data.files ? data.files.map((f: any) => f.url) : [data.url]);
        const updated = [...imageList, ...newUrls];
        onChange(updated);
      } else {
        onChange(data.url);
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (urlToRemove: string, indexToRemove: number) => {
    if (multiple) {
      const updated = imageList.filter((_, idx) => idx !== indexToRemove);
      onChange(updated);
    } else {
      onChange("");
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-prayas-ink">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {multiple && imageList.length > 0 && (
            <span className="text-[11px] font-semibold text-prayas-neem">
              {imageList.length} {imageList.length === 1 ? "photo" : "photos"} uploaded
            </span>
          )}
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-prayas-crimson shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Single Mode with Existing Image */}
      {!multiple && imageList.length > 0 ? (
        <div className="relative rounded-xl overflow-hidden border border-prayas-rule bg-prayas-stone aspect-[16/9] max-h-56 group shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageList[0]}
            alt="Uploaded preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white text-prayas-ink text-xs font-bold shadow hover:bg-prayas-paper transition-colors"
            >
              Replace Photo
            </button>
            <button
              type="button"
              onClick={() => handleRemove(imageList[0], 0)}
              className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold shadow hover:bg-red-700 transition-colors flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Remove
            </button>
          </div>
          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono">
            {imageList[0]}
          </span>
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
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragOver
              ? "border-prayas-neem bg-green-50/70"
              : "border-prayas-rule bg-prayas-paper/60 hover:bg-prayas-stone/70 hover:border-prayas-neem/60"
          } ${uploading ? "opacity-75 pointer-events-none" : ""}`}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-11 h-11 rounded-full bg-white border border-prayas-rule flex items-center justify-center text-prayas-neem shadow-sm">
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <UploadCloud className="w-5 h-5" />
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-prayas-ink">
                {uploading
                  ? "Saving image to server..."
                  : "Click to upload or drag & drop"}
              </p>
              <p className="text-[11px] text-prayas-muted mt-0.5">
                {description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Multiple Mode Gallery Previews */}
      {multiple && imageList.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {imageList.map((url, idx) => (
              <div
                key={idx}
                className="relative rounded-lg overflow-hidden border border-prayas-rule bg-prayas-stone aspect-square group shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Gallery photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(url, idx)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow hover:bg-red-700 transition-colors opacity-90 group-hover:opacity-100"
                  title="Delete image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-mono">
                  #{idx + 1}
                </span>
              </div>
            ))}

            {/* Add More Photos Button in Grid */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="border-2 border-dashed border-prayas-rule rounded-lg aspect-square flex flex-col items-center justify-center gap-1 text-prayas-muted hover:border-prayas-neem hover:text-prayas-neem hover:bg-green-50/50 transition-colors text-xs font-semibold bg-white"
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span className="text-[10px]">Add More</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
