"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Package, ChevronRight, LayoutGrid, Loader2 } from "lucide-react";
import { Container } from "./container";
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
  children: SubCategory[];
}

interface CatalogMenuProps {
  buttonClassName?: string;
}

export function CatalogMenu({ buttonClassName }: CatalogMenuProps = {}) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<ParentCategory[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeParent, setActiveParent] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const fetched = useRef(false);

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
          buttonClassName
            ? cn(buttonClassName, open && "opacity-90")
            : cn(open ? "bg-primary/80" : "bg-primary hover:bg-primary/90"),
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
        <div className="absolute left-0 top-full z-[100] pt-0">
          <div
            className="w-[calc(100vw-2rem)] max-w-[1200px] rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          >
            {loading || !categories ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="flex h-[480px]">
                {/* ── Left sidebar: parent categories ── */}
                <div className="w-64 shrink-0 border-r border-neutral-100 bg-neutral-50/50 py-3 overflow-y-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onMouseEnter={() => setActiveParent(cat.id)}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "group flex w-full items-center justify-between px-5 py-3 text-left text-sm font-medium transition-all",
                        activeParent === cat.id
                          ? "bg-white text-neutral-900 shadow-sm"
                          : "text-neutral-600 hover:bg-white/80 hover:text-neutral-900",
                      )}
                    >
                      <span>{cat.name}</span>
                      <ChevronRight
                        className={cn(
                          "h-3.5 w-3.5 shrink-0 transition-all",
                          activeParent === cat.id
                            ? "text-primary translate-x-0.5"
                            : "text-neutral-300 group-hover:text-neutral-400",
                        )}
                      />
                    </button>
                  ))}

                  {/* View all link */}
                  <Link
                    href="/catalog"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-5 py-3 mt-2 border-t border-neutral-100 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                  >
                    Все категории
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* ── Right content: subcategories + products ── */}
                {activeCat && (
                  <div className="flex-1 overflow-y-auto p-6">
                    {/* Category title */}
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-lg font-bold text-neutral-900 font-(family-name:--font-unbounded)">
                        {activeCat.name}
                      </h3>
                      <Link
                        href={`/catalog/${activeCat.slug}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        Смотреть все <ArrowRight className="h-3 w-3" />
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
                            className="group flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-3 hover:bg-neutral-100 transition-colors"
                          >
                            <div className="min-w-0">
                              <span className="text-sm font-medium text-neutral-800 group-hover:text-neutral-900">
                                {sub.name}
                              </span>
                              <span className="ml-2 text-[11px] text-neutral-400">
                                {sub._count.products}
                              </span>
                            </div>
                            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Products preview */}
                    {activeCat.children.some((s) => s.products.length > 0) && (
                      <>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="block h-5 w-0.5 rounded-full bg-primary" />
                          <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                            Популярные товары
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          {activeCat.children
                            .flatMap((s) => s.products)
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
                                  className="group rounded-xl border border-neutral-100 p-3 hover:border-neutral-200 hover:shadow-sm transition-all"
                                >
                                  <div className="flex aspect-square items-center justify-center rounded-lg bg-neutral-50 mb-2">
                                    {p.images[0] ? (
                                      <img
                                        src={p.images[0].url}
                                        alt={p.name}
                                        className="h-full w-full rounded-lg object-contain"
                                      />
                                    ) : (
                                      <Package className="h-8 w-8 text-neutral-200" />
                                    )}
                                  </div>
                                  <p className="text-xs font-medium text-neutral-700 line-clamp-2 leading-snug group-hover:text-neutral-900">
                                    {p.name}
                                  </p>
                                  <div className="mt-1.5 flex items-baseline gap-1">
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
