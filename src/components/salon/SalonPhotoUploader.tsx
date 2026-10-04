"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  Image as ImageIcon,
  Sparkles,
  Trash2,
  RefreshCw,
  Link2,
  Check,
  X,
  Camera,
  Eye,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface SalonPhotoUploaderProps {
  coverImage?: string | null;
  onCoverImageChange: (url: string) => void;
  galleryImages: string[];
  onGalleryImageChange: (index: number, url: string) => void;
  maxGalleryPhotos: number;
}

// Client-side image resize & compression to prevent huge payload failures
const processImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please select a valid image file (JPG, PNG, WebP)"));
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      reject(new Error("Image size should be less than 15MB"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDimension = 1400;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Compress as JPEG at 85% quality
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => resolve(event.target?.result as string);
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
};

export default function SalonPhotoUploader({
  coverImage,
  onCoverImageChange,
  galleryImages,
  onGalleryImageChange,
  maxGalleryPhotos = 3,
}: SalonPhotoUploaderProps) {
  // Active URL input modal/popover state
  // target can be 'cover' or index number (0, 1, 2)
  const [urlModalTarget, setUrlModalTarget] = useState<"cover" | number | null>(null);
  const [urlInputValue, setUrlInputValue] = useState("");

  // Drag states
  const [isCoverDragging, setIsCoverDragging] = useState(false);
  const [draggingSlot, setDraggingSlot] = useState<number | null>(null);

  // File input refs
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Count active gallery photos
  const filledGalleryCount = galleryImages.filter(Boolean).length;

  const handleFileSelect = async (
    file: File,
    target: "cover" | number
  ) => {
    try {
      const toastId = toast.loading("Optimizing & processing photo...");
      const dataUrl = await processImageFile(file);
      toast.dismiss(toastId);

      if (target === "cover") {
        onCoverImageChange(dataUrl);
        toast.success("Cover photo updated!");
      } else {
        onGalleryImageChange(target, dataUrl);
        toast.success(`Gallery photo ${target + 1} updated!`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to process image");
    }
  };

  const openUrlModal = (target: "cover" | number) => {
    let currentVal = "";
    if (target === "cover") {
      currentVal = coverImage || "";
    } else {
      currentVal = galleryImages[target] || "";
    }
    // Only prefill if it's a real HTTP URL, not a gigantic base64 string
    setUrlInputValue(currentVal.startsWith("http") ? currentVal : "");
    setUrlModalTarget(target);
  };

  const handleApplyUrl = () => {
    const trimmed = urlInputValue.trim();
    if (!trimmed) {
      toast.error("Please enter a valid image URL");
      return;
    }

    if (urlModalTarget === "cover") {
      onCoverImageChange(trimmed);
      toast.success("Cover image URL updated!");
    } else if (typeof urlModalTarget === "number") {
      onGalleryImageChange(urlModalTarget, trimmed);
      toast.success(`Gallery photo ${urlModalTarget + 1} updated!`);
    }
    setUrlModalTarget(null);
    setUrlInputValue("");
  };

  const slotLabels = [
    "Interior & Reception",
    "Styling & Stations",
    "Treatment & Spa Area",
    "Products & Showcase",
    "VIP Lounge",
  ];

  return (
    <div className="glass-card p-6 space-y-7 border border-purple-500/20 bg-[#0d091a]/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/30">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-purple-300" />
            </div>
            Salon Visual Showcase
          </h2>
          <p className="text-xs text-white/50 mt-1">
            High-quality visuals directly increase customer bookings by up to 68%.
          </p>
        </div>

        {/* Gallery count indicator */}
        <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs">
          <span className="text-white/60">Gallery:</span>
          <span className="font-semibold text-purple-300">
            {filledGalleryCount} / {maxGalleryPhotos}
          </span>
          <span className="text-white/40">photos</span>
        </div>
      </div>

      {/* ── 1. COVER PHOTO BANNER ────────────────────────────────────────── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Main Cover Banner
          </label>
          <span className="text-[11px] text-white/40">
            Recommended: 1920 × 800px (Cinematic 16:9 or 21:9)
          </span>
        </div>

        {/* Hidden File Input for Cover */}
        <input
          ref={coverFileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/jpg"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file, "cover");
            e.target.value = "";
          }}
        />

        {coverImage ? (
          /* Cover Photo Display Card */
          <div className="relative group rounded-2xl overflow-hidden border border-purple-500/30 bg-black/40 shadow-2xl h-56 sm:h-64 w-full">
            {/* Background Image */}
            <img
              src={coverImage}
              alt="Salon Cover Banner"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={(e) => {
                toast.error("Cover image could not be loaded");
                (e.currentTarget as HTMLElement).style.opacity = "0.3";
              }}
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40 pointer-events-none" />

            {/* Badges on Top-Left */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-950/80 text-purple-200 border border-purple-400/40 backdrop-blur-md flex items-center gap-1.5 shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Featured Cover
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-black/60 text-white/60 border border-white/10 backdrop-blur-md">
                {coverImage.startsWith("data:") ? "Uploaded File" : "Web URL"}
              </span>
            </div>

            {/* Hover Action Overlay */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => coverFileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-purple-600/90 hover:bg-purple-500 text-white text-xs font-medium backdrop-blur-md transition-all flex items-center gap-1.5 shadow-lg hover:shadow-purple-500/25 active:scale-95"
                title="Replace cover photo"
              >
                <Camera className="w-3.5 h-3.5" />
                Replace
              </button>

              <button
                type="button"
                onClick={() => openUrlModal("cover")}
                className="px-2.5 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white/80 hover:text-white text-xs font-medium border border-white/15 backdrop-blur-md transition-all flex items-center gap-1 shadow-lg active:scale-95"
                title="Change URL"
              >
                <Link2 className="w-3.5 h-3.5" />
                URL
              </button>

              <button
                type="button"
                onClick={() => {
                  onCoverImageChange("");
                  toast.success("Cover photo removed");
                }}
                className="p-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/30 backdrop-blur-md transition-all active:scale-95"
                title="Remove cover photo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Caption */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/70">
              <span className="truncate max-w-[70%] text-white/60">
                {coverImage.startsWith("data:")
                  ? "Stored locally as compressed image"
                  : coverImage}
              </span>
              <button
                type="button"
                onClick={() => window.open(coverImage, "_blank")}
                className="text-[11px] text-purple-300 hover:text-purple-200 underline flex items-center gap-1 shrink-0"
              >
                <Eye className="w-3 h-3" /> View full image
              </button>
            </div>
          </div>
        ) : (
          /* Empty State: Drag & Drop Zone */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsCoverDragging(true);
            }}
            onDragLeave={() => setIsCoverDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsCoverDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFileSelect(file, "cover");
            }}
            onClick={() => coverFileInputRef.current?.click()}
            className={cn(
              "relative rounded-2xl border-2 border-dashed transition-all duration-300 p-8 flex flex-col items-center justify-center gap-3 cursor-pointer text-center group",
              isCoverDragging
                ? "border-purple-400 bg-purple-500/20 scale-[0.99]"
                : "border-purple-500/30 hover:border-purple-400/70 bg-gradient-to-b from-purple-500/5 to-transparent hover:bg-purple-500/10"
            )}
          >
            <div className="w-16 h-16 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 group-hover:scale-110 group-hover:bg-purple-500/25 transition-all shadow-lg shadow-purple-500/10">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div>
              <p className="text-sm font-semibold text-white group-hover:text-purple-200 transition-colors">
                Upload Salon Cover Photo
              </p>
              <p className="text-xs text-white/40 mt-1">
                Drag and drop your image file here, or{" "}
                <span className="text-purple-400 underline underline-offset-2">browse files</span>
              </p>
            </div>

            <div className="flex items-center gap-3 mt-1">
              <span className="text-[11px] text-white/30">PNG, JPG, WebP up to 15MB</span>
              <span className="text-white/20">•</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openUrlModal("cover");
                }}
                className="text-xs text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1"
              >
                <Link2 className="w-3 h-3" />
                Or paste image URL
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── 2. GALLERY PHOTOS GRID ──────────────────────────────────────── */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-semibold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
              Gallery Photos ({filledGalleryCount}/{maxGalleryPhotos})
            </label>
            <p className="text-[11px] text-white/40 mt-0.5">
              Showcase different angles of your salon, styling chairs, and relaxing interiors.
            </p>
          </div>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: maxGalleryPhotos }).map((_, index) => {
            const currentImg = galleryImages[index];
            const isDraggingThis = draggingSlot === index;
            const slotTitle = slotLabels[index] || `Photo Slot ${index + 1}`;

            return (
              <div key={index} className="space-y-1.5">
                {/* Slot Label */}
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-white/60 font-medium truncate">
                    {index + 1}. {slotTitle}
                  </span>
                  {currentImg && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                      <Check className="w-2.5 h-2.5" /> Added
                    </span>
                  )}
                </div>

                {/* Hidden File Input for this gallery slot */}
                <input
                  ref={(el) => {
                    galleryFileInputRefs.current[index] = el;
                  }}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file, index);
                    e.target.value = "";
                  }}
                />

                {currentImg ? (
                  /* Filled Gallery Slot Card */
                  <div className="relative group aspect-[4/3] rounded-xl overflow-hidden border border-purple-500/25 bg-black/40 shadow-lg">
                    <img
                      src={currentImg}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.opacity = "0.3";
                      }}
                    />

                    {/* Gradient shade */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Top slot badge */}
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/70 backdrop-blur-md text-white/80 border border-white/10">
                      #{index + 1}
                    </span>

                    {/* Hover actions */}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity p-2">
                      <button
                        type="button"
                        onClick={() => galleryFileInputRefs.current[index]?.click()}
                        className="px-2.5 py-1.5 rounded-lg bg-purple-600/90 hover:bg-purple-500 text-white text-xs font-medium shadow-md backdrop-blur-md transition-all flex items-center gap-1 active:scale-95"
                        title="Upload replacement"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Replace
                      </button>

                      <button
                        type="button"
                        onClick={() => openUrlModal(index)}
                        className="p-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white/90 border border-white/15 shadow-md backdrop-blur-md transition-all active:scale-95"
                        title="Enter URL"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onGalleryImageChange(index, "");
                          toast.success(`Photo ${index + 1} removed`);
                        }}
                        className="p-1.5 rounded-lg bg-red-500/30 hover:bg-red-500/50 text-red-300 border border-red-500/30 shadow-md backdrop-blur-md transition-all active:scale-95"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Bottom Status bar */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-white/60 pointer-events-none">
                      <span className="truncate max-w-[80%]">
                        {currentImg.startsWith("data:") ? "Uploaded image" : currentImg}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Empty Gallery Slot: Drag & Drop Card */
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDraggingSlot(index);
                    }}
                    onDragLeave={() => setDraggingSlot(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDraggingSlot(null);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleFileSelect(file, index);
                    }}
                    onClick={() => galleryFileInputRefs.current[index]?.click()}
                    className={cn(
                      "relative aspect-[4/3] rounded-xl border-2 border-dashed transition-all duration-300 p-4 flex flex-col items-center justify-center gap-2 cursor-pointer text-center group",
                      isDraggingThis
                        ? "border-purple-400 bg-purple-500/20 scale-[0.98]"
                        : "border-purple-500/25 hover:border-purple-400/60 bg-white/[0.02] hover:bg-purple-500/10"
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all">
                      <Plus className="w-5 h-5" />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-white/90 group-hover:text-purple-200 transition-colors">
                        Add Photo {index + 1}
                      </p>
                      <p className="text-[10px] text-white/40 mt-0.5">Click or drop file</p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openUrlModal(index);
                      }}
                      className="text-[11px] text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1 mt-1"
                    >
                      <Link2 className="w-2.5 h-2.5" /> Paste URL
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. MODAL FOR ENTERING / EDITING IMAGE URL ───────────────────────── */}
      {urlModalTarget !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#130b22] border border-purple-500/30 rounded-2xl p-5 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Link2 className="w-4 h-4 text-purple-400" />
                {urlModalTarget === "cover"
                  ? "Enter Cover Image URL"
                  : `Enter Gallery Image #${Number(urlModalTarget) + 1} URL`}
              </h3>
              <button
                type="button"
                onClick={() => setUrlModalTarget(null)}
                className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-white/60">
                Direct image address (HTTP or HTTPS)
              </label>
              <Input
                type="url"
                value={urlInputValue}
                onChange={(e) => setUrlInputValue(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="bg-white/5 border-purple-500/30 text-white placeholder:text-white/20 text-xs"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplyUrl();
                  }
                }}
              />
              <p className="text-[11px] text-white/40">
                Paste any publicly accessible link from Unsplash, Cloudinary, Imgur, or your website.
              </p>
            </div>

            {/* Live URL Preview if valid */}
            {urlInputValue.trim().startsWith("http") && (
              <div className="relative h-28 w-full rounded-xl overflow-hidden border border-white/10 bg-black/40">
                <img
                  src={urlInputValue.trim()}
                  alt="URL Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = "none";
                  }}
                />
                <span className="absolute bottom-1 right-2 text-[10px] text-white/60 bg-black/60 px-1.5 py-0.5 rounded">
                  Preview
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setUrlModalTarget(null)}
                className="text-xs text-white/60 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleApplyUrl}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs gap-1.5 shadow-md shadow-purple-500/20"
              >
                <Check className="w-3.5 h-3.5" />
                Apply Image
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
