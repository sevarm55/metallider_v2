"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Package, ChevronRight, LayoutGrid, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const unitLabels: Record<string, string> = {
  PCS: "шт",
  METER: "м",
  M2: "м²",
  KG: "кг",
  PACK: "уп",
  SET: "компл",
};

interface MiniProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  specialPrice: number;
  unit: string;
  images: { url: string }[];
}

interface SubCategory {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
  products: MiniProduct[];
}

interface ParentCategory {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
  products: MiniProduct[];
  children: SubCategory[];
}

export function CatalogMenuV2() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<ParentCategory[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeParent, setActiveParent] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const fetched = useRef(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  const fetchCategories = useCallback(async () => {
    if (fetched.current) return;
    setLoading(true);
    try {
      const res = await fetch("/api/catalog");
      const data: ParentCategory[] = await res.json();
      setCategories(data);
      if (data.length > 0) setActiveParent(data[0].id);
      fetched.current = true;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
    fetchCategories();
  };

  const handleLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 200);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Sliding indicator
  useEffect(() => {
    if (!sidebarRef.current || !indicatorRef.current || !activeParent) return;
    const activeBtn = sidebarRef.current.querySelector(`[data-cat-id="${activeParent}"]`) as HTMLElement;
    if (activeBtn) {
      const sidebarTop = sidebarRef.current.getBoundingClientRect().top;
      const btnRect = activeBtn.getBoundingClientRect();
      indicatorRef.current.style.top = `${btnRect.top - sidebarTop + sidebarRef.current.scrollTop}px`;
      indicatorRef.current.style.height = `${btnRect.height}px`;
      indicatorRef.current.style.opacity = "1";
    }
  }, [activeParent, categories]);

  const activeCat = categories?.find((c) => c.id === activeParent);

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {/* Trigger button */}
      <Link
        href="/catalog"
        className={cn(
          "flex items-center gap-2 rounded-lg px-5 py-2 my-1.5 text-sm font-semibold text-white transition-colors",
          open ? "bg-neutral-950/90" : "bg-neutral-950 hover:bg-neutral-800",
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        Каталог
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 ml-0.5 opacity-70 transition-transform duration-200",
            open && "rotate-90",
          )}
        />
      </Link>

      {/* Mega menu dropdown */}
      {open && (
        <div className="absolute left-0 top-full z-100 pt-0">
          <div className="w-[calc(100vw-2rem)] max-w-[1200px] rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {loading || !categories ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="flex h-[480px]">
                {/* ── Left sidebar with gradient accent ── */}
                <div
                  ref={sidebarRef}
                  className="relative w-72 shrink-0 border-r border-neutral-100 bg-white py-2 overflow-y-auto"
                >
                  {/* Sliding gradient indicator */}
                  <div
                    ref={indicatorRef}
                    className="absolute left-0 right-0 pointer-events-none opacity-0 transition-all duration-300 ease-out"
                    style={{ willChange: "top, height" }}
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-primary/10 via-primary/5 to-transparent" />
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-primary shadow-[0_0_8px_rgba(var(--color-primary)/0.4)]" />
                  </div>

                  {categories.map((cat) => {
                    const isActive = activeParent === cat.id;
                    const totalProducts = cat._count.products + cat.children.reduce((sum, c) => sum + c._count.products, 0);
                    return (
                      <button
                        key={cat.id}
                        data-cat-id={cat.id}
                        onMouseEnter={() => setActiveParent(cat.id)}
                        className={cn(
                          "group relative flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors duration-200 cursor-pointer",
                          isActive ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-700",
                        )}
                      >
                        <span className="relative z-10 text-sm font-semibold flex-1">
                          {cat.name}
                        </span>
                        <span className={cn(
                          "relative z-10 text-[11px] tabular-nums font-medium rounded-full px-2 py-0.5 transition-colors duration-200",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-neutral-300 group-hover:text-neutral-400",
                        )}>
                          {totalProducts}
                        </span>
                        <ChevronRight className={cn(
                          "relative z-10 h-3.5 w-3.5 shrink-0 transition-all duration-200",
                          isActive
                            ? "text-primary translate-x-0.5"
                            : "text-neutral-200 group-hover:text-neutral-400",
                        )} />
                      </button>
                    );
                  })}

                  {/* View all */}
                  <Link
                    href="/catalog"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-5 py-3 mt-2 border-t border-neutral-100 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
                  >
                    Все категории
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* ── Right content with subtle pattern ── */}
                {activeCat && (
                  <div className="flex-1 overflow-y-auto bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.008)_10px,rgba(0,0,0,0.008)_11px)] p-6">
                    {/* Category title */}
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="text-lg font-bold text-neutral-900 font-(family-name:--font-unbounded)">
                          {activeCat.name}
                        </h3>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {activeCat.children.length} подкатегорий
                        </p>
                      </div>
                      <Link
                        href={`/catalog/${activeCat.slug}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-primary transition-colors"
                      >
                        Все товары <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>

                    {/* Subcategories grid */}
                    {activeCat.children.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-6">
                        {activeCat.children.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/catalog/${sub.slug}`}
                            onClick={() => setOpen(false)}
                            className="group flex items-center justify-between rounded-xl bg-white/80 backdrop-blur-sm px-4 py-3 border border-neutral-100 hover:border-primary/20 hover:shadow-sm transition-all"
                          >
                            <div className="min-w-0">
                              <span className="text-sm font-medium text-neutral-800 group-hover:text-neutral-900">
                                {sub.name}
                              </span>
                              <span className="ml-2 text-[11px] text-neutral-400">
                                {sub._count.products}
                              </span>
                            </div>
                            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-neutral-300 opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all" />
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Products preview */}
                    {([...activeCat.products, ...activeCat.children.flatMap((s) => s.products)]).length > 0 && (
                      <>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="block h-5 w-1 rounded-full bg-primary" />
                          <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                            Популярные товары
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          {[...activeCat.products, ...activeCat.children.flatMap((s) => s.products)]
                            .slice(0, 4)
                            .map((p) => {
                              const hasDiscount = p.specialPrice > 0 && p.specialPrice < p.price;
                              const effectivePrice = hasDiscount ? p.specialPrice : p.price;
                              const unit = unitLabels[p.unit] || "шт";
                              return (
                                <Link
                                  key={p.id}
                                  href={`/product/${p.slug}`}
                                  onClick={() => setOpen(false)}
                                  className="group rounded-xl bg-white/80 backdrop-blur-sm border border-neutral-100  hover:border-primary/20 hover:shadow-md transition-all"
                                >
                                  <div className="flex aspect-square items-center justify-center rounded-lg bg-neutral-50 mb-2 overflow-hidden">
                                    {p.images[0] ? (
                                      <img
                                        src={p.images[0].url}
                                        alt={p.name}
                                        className="h-full w-full  rounded-lg object-contain group-hover:scale-105 transition-transform duration-300"
                                      />
                                    ) : (
                                      <Package className="h-8 w-8 text-neutral-200" />
                                    )}
                                  </div>
                                  <p className="text-xs p-4 font-medium text-neutral-700 line-clamp-2 leading-snug group-hover:text-neutral-900">
                                    {p.name}
                                  </p>
                                  <div className="mt-1.5 p-3 flex items-baseline gap-1">
                                    <span className={cn(
                                      "text-sm font-bold",
                                      hasDiscount ? "text-red-500" : "text-neutral-900",
                                    )}>
                                      {effectivePrice.toLocaleString("ru-RU")} ₽
                                    </span>
                                    <span className="text-[10px] text-neutral-400">/{unit}</span>
                                  </div>
                                  {hasDiscount && (
                                    <span className="text-[10px] text-neutral-400 line-through">
                                      {p.price.toLocaleString("ru-RU")} ₽
                                    </span>
                                  )}
                                </Link>
                              );
                            })}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
