"use client";

import { useState, useEffect } from "react";
import { LayoutGrid, Maximize2 } from "lucide-react";
import { CatalogSlider } from "./catalog-slider";
import { CatalogClassic } from "./catalog-classic";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "catalog_view_mode";

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  color: string;
  totalProducts: number;
  children: { id: string; name: string; slug: string }[];
  index: number;
}

export function CatalogViewSwitcher({ categories }: { categories: Category[] }) {
  const [mode, setMode] = useState<"classic" | "slider">("classic");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "slider" || saved === "classic") {
      setMode(saved);
    }
  }, []);

  function switchMode(newMode: "classic" | "slider") {
    setMode(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
  }

  if (mode === "slider") {
    return (
      <>
        {/* Кнопка переключения поверх слайдера */}
        <div className="fixed top-4 right-4 z-[110] flex items-center gap-1 rounded-xl bg-white/10 backdrop-blur-md p-1 border border-white/20">
          <button
            onClick={() => switchMode("classic")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
              "text-white/60 hover:text-white hover:bg-white/10"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Обычный
          </button>
          <button
            disabled
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-white/20 text-white"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            Слайдер
          </button>
        </div>
        <CatalogSlider categories={categories} />
      </>
    );
  }

  return (
    <>
      {/* Кнопка переключения в обычном виде */}
      <div className="fixed top-20 right-4 z-50 flex items-center gap-1 rounded-xl bg-white p-1 border border-neutral-200 shadow-lg">
        <button
          disabled
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-neutral-900 text-white"
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          Обычный
        </button>
        <button
          onClick={() => switchMode("slider")}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
            "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
          )}
        >
          <Maximize2 className="h-3.5 w-3.5" />
          Слайдер
        </button>
      </div>
      <CatalogClassic categories={categories} />
    </>
  );
}
