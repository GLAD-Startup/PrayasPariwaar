"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  Check,
  RefreshCw,
  User,
  SlidersHorizontal,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Sparkles,
} from "lucide-react";
import { apiFetch, assetPath } from "@/lib/api";

interface PhotoAdjustmentModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  onSave: (newImageUrl: string) => void;
  aspectRatio?: "square" | "portrait" | "video";
  title?: string;
}

export default function PhotoAdjustmentModal({
  isOpen,
  imageUrl,
  onClose,
  onSave,
  aspectRatio = "square",
  title = "Adjust Portrait Framing & Position",
}: PhotoAdjustmentModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Transform States
  const [zoom, setZoom] = useState<number>(1.0);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [guideShape, setGuideShape] = useState<"circle" | "square">("circle");

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; startPanX: number; startPanY: number }>({
    x: 0,
    y: 0,
    startPanX: 0,
    startPanY: 0,
  });

  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [imgBlobUrl, setImgBlobUrl] = useState<string | null>(null);

  // Load image safely as Blob to bypass any potential CORS / canvas taint issues
  useEffect(() => {
    if (!isOpen || !imageUrl) return;

    let active = true;
    setImageLoaded(false);
    setLoadError(null);

    // Reset transforms to good defaults
    setZoom(1.0);
    setPanX(0);
    setPanY(0);
    setRotation(0);

    const fullSrc = assetPath(imageUrl);

    async function fetchImageBlob() {
      try {
        const res = await fetch(fullSrc);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        if (!active) return;
        const objectUrl = URL.createObjectURL(blob);
        setImgBlobUrl(objectUrl);
      } catch (err: any) {
        console.warn("[PhotoAdjustmentModal] Direct fetch failed, fallback to direct url:", err);
        if (active) setImgBlobUrl(fullSrc);
      }
    }

    fetchImageBlob();

    return () => {
      active = false;
      if (imgBlobUrl && imgBlobUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imgBlobUrl);
      }
    };
  }, [isOpen, imageUrl]);

  // Image element load handler
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    imgRef.current = e.currentTarget;
    setImageLoaded(true);

    // Auto-detect aspect ratio: if image is landscape and face is likely at the top/center,
    // apply a subtle auto-pan down so the forehead/hair is preserved
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth > naturalHeight) {
      // Landscape photo used for portrait: shift down slightly by default
      setPanY(15);
      setZoom(1.15);
    }
  };

  // Drag Handling for Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startPanX: panX,
      startPanY: panY,
    };
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPanX(dragStartRef.current.startPanX + dx);
      setPanY(dragStartRef.current.startPanY + dy);
    },
    [isDragging]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Handling for Mobile Dragging
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        startPanX: panX,
        startPanY: panY,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    setPanX(dragStartRef.current.startPanX + dx);
    setPanY(dragStartRef.current.startPanY + dy);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.0015;
    setZoom((prev) => Math.min(3.0, Math.max(0.5, Number((prev + delta).toFixed(2)))));
  };

  // Rotate 90 degrees clockwise
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Preset: Focus Face (move image down so head/forehead is visible)
  const handleFocusHead = () => {
    setPanY((prev) => prev + 35);
  };

  const handleFocusChest = () => {
    setPanY((prev) => prev - 35);
  };

  // Reset all
  const handleReset = () => {
    setZoom(1.0);
    setPanX(0);
    setPanY(0);
    setRotation(0);
  };

  // Export & Save Cropped/Adjusted Image
  const handleApplyAndSave = async () => {
    if (!imgRef.current) return;
    setIsSaving(true);

    try {
      const OUTPUT_SIZE = 800; // High-res crisp square
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Unable to create canvas context");
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Background fill in case of margins
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

      ctx.save();
      // Move to center of canvas
      ctx.translate(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2);

      // Apply rotation
      if (rotation !== 0) {
        ctx.rotate((rotation * Math.PI) / 180);
      }

      // Calculate scale factor relative to container preview
      const containerW = containerRef.current?.clientWidth || 320;
      const previewRatio = OUTPUT_SIZE / containerW;

      // Translate pan offsets scaled up to canvas dimensions
      ctx.translate(panX * previewRatio, panY * previewRatio);

      // Scale zoom
      ctx.scale(zoom, zoom);

      // Draw original image centered
      const img = imgRef.current;
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;

      // Cover scaling: compute dimensions to cover container
      let drawW = OUTPUT_SIZE;
      let drawH = OUTPUT_SIZE;
      const aspect = imgW / imgH;

      if (aspect > 1) {
        drawW = OUTPUT_SIZE * aspect;
        drawH = OUTPUT_SIZE;
      } else {
        drawW = OUTPUT_SIZE;
        drawH = OUTPUT_SIZE / aspect;
      }

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // Convert to high-quality JPEG Blob
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.92)
      );

      if (!blob) {
        throw new Error("Failed to render adjusted photo to blob.");
      }

      // Upload newly cropped image via standard /api/upload
      const fileName = `portrait-adjusted-${Date.now()}.jpg`;
      const adjustedFile = new File([blob], fileName, { type: "image/jpeg" });
      const formData = new FormData();
      formData.append("file", adjustedFile);

      const res = await apiFetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success || !json.url) {
        throw new Error(json.error || "Failed to upload adjusted photo");
      }

      onSave(json.url);
      onClose();
    } catch (err: any) {
      console.error("[PhotoAdjustmentModal] Error:", err);
      alert(`Could not save photo adjustment: ${err.message || String(err)}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white border border-prayas-rule rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-prayas-rule flex items-center justify-between bg-prayas-paper/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-prayas-ink leading-tight">
                {title}
              </h3>
              <p className="text-[11px] text-prayas-muted">
                Drag to reposition • Scroll or use slider to zoom • Center the face
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-prayas-rule hover:bg-prayas-stone text-prayas-muted hover:text-prayas-ink transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* Interactive Cropper Viewport */}
            <div className="md:col-span-8 flex flex-col items-center">
              <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onWheel={handleWheel}
                className={`relative w-72 h-72 sm:w-80 sm:h-80 rounded-2xl overflow-hidden bg-slate-900 border-2 border-emerald-700/40 shadow-inner select-none ${
                  isDragging ? "cursor-grabbing" : "cursor-grab"
                }`}
              >
                {/* Photo Element */}
                {imgBlobUrl && (
                  <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-75"
                    style={{
                      transform: `translate(${panX}px, ${panY}px) scale(${zoom}) rotate(${rotation}deg)`,
                      transformOrigin: "center center",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgBlobUrl}
                      alt="Adjust target"
                      onLoad={handleImageLoad}
                      onError={() => setLoadError("Unable to load image for framing.")}
                      className="max-w-none w-full h-full object-cover"
                      draggable={false}
                    />
                  </div>
                )}

                {/* Framing Overlay Mask */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {guideShape === "circle" ? (
                    <div className="w-[84%] h-[84%] rounded-full border-2 border-white/90 shadow-[0_0_0_9999px_rgba(15,23,42,0.55)]">
                      {/* Crosshair target lines */}
                      <div className="w-full h-full relative opacity-40">
                        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/60 -translate-y-1/2" />
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/60 -translate-x-1/2" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-[84%] h-[84%] rounded-xl border-2 border-white/90 shadow-[0_0_0_9999px_rgba(15,23,42,0.55)]">
                      <div className="w-full h-full relative opacity-40">
                        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/60 -translate-y-1/2" />
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/60 -translate-x-1/2" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Floating Hint Overlay */}
                <div className="absolute bottom-2 left-2 right-2 text-center pointer-events-none">
                  <span className="px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] font-medium backdrop-blur-xs">
                    ✋ Drag photo to center face • Scroll to zoom
                  </span>
                </div>
              </div>

              {/* Nudge Direction Arrows */}
              <div className="flex items-center gap-1.5 mt-3 text-xs">
                <span className="text-[11px] font-bold text-prayas-muted mr-1">Nudge:</span>
                <button
                  type="button"
                  onClick={() => setPanY((prev) => prev + 15)}
                  className="p-1.5 rounded-lg border border-prayas-rule bg-prayas-paper hover:bg-prayas-stone text-prayas-ink"
                  title="Shift Down (Show more forehead/hair)"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPanY((prev) => prev - 15)}
                  className="p-1.5 rounded-lg border border-prayas-rule bg-prayas-paper hover:bg-prayas-stone text-prayas-ink"
                  title="Shift Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPanX((prev) => prev + 15)}
                  className="p-1.5 rounded-lg border border-prayas-rule bg-prayas-paper hover:bg-prayas-stone text-prayas-ink"
                  title="Shift Right"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPanX((prev) => prev - 15)}
                  className="p-1.5 rounded-lg border border-prayas-rule bg-prayas-paper hover:bg-prayas-stone text-prayas-ink"
                  title="Shift Left"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleRotate}
                  className="p-1.5 rounded-lg border border-prayas-rule bg-prayas-paper hover:bg-prayas-stone text-prayas-ink ml-2 flex items-center gap-1 text-[11px] font-semibold"
                  title="Rotate 90 degrees"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  90°
                </button>
              </div>
            </div>

            {/* Live Avatars Preview Side Column */}
            <div className="md:col-span-4 bg-prayas-paper/70 rounded-xl p-4 border border-prayas-rule space-y-4">
              <div className="text-xs font-bold text-prayas-ink uppercase tracking-wider flex items-center justify-between">
                <span>Live Card Previews</span>
                <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Real-Time
                </span>
              </div>

              {/* Circular Avatar Preview (Exactly matching Team Card) */}
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16 rounded-full border-2 border-emerald-800 bg-slate-900 overflow-hidden shrink-0 shadow-sm">
                  {imgBlobUrl && (
                    <div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      style={{
                        transform: `translate(${panX * (64 / (containerRef.current?.clientWidth || 320))}px, ${
                          panY * (64 / (containerRef.current?.clientWidth || 320))
                        }px) scale(${zoom}) rotate(${rotation}deg)`,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgBlobUrl}
                        alt="Preview Avatar"
                        className="max-w-none w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-prayas-ink">Team Avatar</div>
                  <div className="text-[11px] text-prayas-muted">Circular Card Badge</div>
                </div>
              </div>

              {/* Square / Rounded Card Preview */}
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16 rounded-xl border border-prayas-rule bg-slate-900 overflow-hidden shrink-0 shadow-sm">
                  {imgBlobUrl && (
                    <div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      style={{
                        transform: `translate(${panX * (64 / (containerRef.current?.clientWidth || 320))}px, ${
                          panY * (64 / (containerRef.current?.clientWidth || 320))
                        }px) scale(${zoom}) rotate(${rotation}deg)`,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgBlobUrl}
                        alt="Preview Card"
                        className="max-w-none w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-prayas-ink">Square Badge</div>
                  <div className="text-[11px] text-prayas-muted">Ledger Table View</div>
                </div>
              </div>

              {/* Guide Shape Toggle */}
              <div className="pt-2 border-t border-prayas-rule/60">
                <label className="text-[11px] font-bold text-prayas-muted uppercase tracking-wider block mb-1.5">
                  Overlay Guide Shape
                </label>
                <div className="grid grid-cols-2 gap-1.5 bg-white p-1 rounded-lg border border-prayas-rule text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setGuideShape("circle")}
                    className={`py-1 rounded text-center transition-colors ${
                      guideShape === "circle"
                        ? "bg-emerald-800 text-white"
                        : "text-prayas-muted hover:text-prayas-ink"
                    }`}
                  >
                    Circle Guide
                  </button>
                  <button
                    type="button"
                    onClick={() => setGuideShape("square")}
                    className={`py-1 rounded text-center transition-colors ${
                      guideShape === "square"
                        ? "bg-emerald-800 text-white"
                        : "text-prayas-muted hover:text-prayas-ink"
                    }`}
                  >
                    Square Guide
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Zoom and Fast Alignment Sliders */}
          <div className="bg-prayas-paper/50 rounded-xl p-4 border border-prayas-rule space-y-3.5">
            {/* Zoom Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-prayas-ink">
                <span className="flex items-center gap-1.5">
                  <ZoomIn className="w-3.5 h-3.5 text-emerald-800" />
                  Zoom Level ({Math.round(zoom * 100)}%)
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(2))))}
                    className="p-1 rounded border border-prayas-rule bg-white hover:bg-prayas-stone"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(3.0, Number((z + 0.1).toFixed(2))))}
                    className="p-1 rounded border border-prayas-rule bg-white hover:bg-prayas-stone"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-emerald-800 cursor-pointer h-1.5 bg-prayas-stone rounded-lg"
              />
            </div>

            {/* Quick Action Presets */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-[11px] font-bold text-prayas-muted uppercase tracking-wider mr-1">
                Quick Adjust:
              </span>
              <button
                type="button"
                onClick={handleFocusHead}
                className="px-2.5 py-1 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-900 text-xs font-semibold hover:bg-emerald-100 transition-colors flex items-center gap-1"
              >
                <ArrowDown className="w-3 h-3 text-emerald-700" />
                Shift Down (Reveal Forehead / Hair)
              </button>
              <button
                type="button"
                onClick={handleFocusChest}
                className="px-2.5 py-1 rounded-lg border border-prayas-rule bg-white text-prayas-ink text-xs font-semibold hover:bg-prayas-stone transition-colors flex items-center gap-1"
              >
                <ArrowUp className="w-3 h-3" />
                Shift Up
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1 rounded-lg border border-prayas-rule bg-white text-prayas-muted hover:text-prayas-ink text-xs font-semibold hover:bg-prayas-stone transition-colors ml-auto"
              >
                Reset Framing
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-prayas-rule bg-prayas-paper/70 flex items-center justify-between">
          <p className="text-xs text-prayas-muted hidden sm:block">
            Creates a high-resolution, perfectly framed portrait.
          </p>
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg border border-prayas-rule bg-white text-prayas-ink hover:bg-prayas-stone text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyAndSave}
              disabled={isSaving || !imageLoaded}
              className="px-5 py-2 rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Saving Adjusted Photo...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Apply & Save Framing
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
