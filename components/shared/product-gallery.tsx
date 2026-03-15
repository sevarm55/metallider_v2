"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Package, ZoomIn, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: { url: string }[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-2xl border bg-neutral-50 py-24">
        <Package className="h-32 w-32 text-neutral-200" />
      </div>
    );
  }

  const prev = () => setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <>
      <div className="space-y-3">
        {/* Main image */}
        <div className="group relative overflow-hidden rounded-2xl border bg-white">
          <img
            src={images[activeIndex].url}
            alt={`${name} — фото ${activeIndex + 1}`}
            className="w-full aspect-square object-contain cursor-zoom-in transition-transform duration-300 hover:scale-105"
            onClick={() => setLightboxOpen(true)}
          />

          {/* Zoom hint */}
          <button
            onClick={() => setLightboxOpen(true)}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          {/* Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm text-neutral-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm text-neutral-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {activeIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "flex-shrink-0 h-16 w-16 overflow-hidden rounded-xl border-2 bg-white transition-all",
                  i === activeIndex
                    ? "border-primary ring-1 ring-primary/20"
                    : "border-transparent opacity-60 hover:opacity-100 hover:border-neutral-200"
                )}
              >
                <img
                  src={img.url}
                  alt={`${name} — миниатюра ${i + 1}`}
                  className="h-full w-full object-contain"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox — rendered via portal to avoid z-index conflicts with sticky header */}
      {lightboxOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90" onClick={() => setLightboxOpen(false)}>
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <img
            src={images[activeIndex].url}
            alt={`${name} — фото ${activeIndex + 1}`}
            className="max-h-[85vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Bottom thumbnails */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
                  className={cn(
                    "h-2 w-2 rounded-full transition-all",
                    i === activeIndex ? "bg-white w-6" : "bg-white/40 hover:bg-white/60"
                  )}
                />
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
