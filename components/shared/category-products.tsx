"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductsView } from "./products-view";
import { cn } from "@/lib/utils";

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  count: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  code: string;
  price: number;
  specialPrice?: number;
  unit: string;
  isHit?: boolean;
  isNew?: boolean;
  image?: string | null;
  categoryId: string;
  attributes?: { name: string; value: string; unit?: string | null }[];
}

interface CategoryProductsProps {
  products: Product[];
  subcategories: Subcategory[];
  parentSlug?: string;
}

export function CategoryProducts({ products, subcategories, parentSlug }: CategoryProductsProps) {
  const [activeSubId, setActiveSubId] = useState<string | null>(null);

  const filtered = activeSubId
    ? products.filter((p) => p.categoryId === activeSubId)
    : products;

  return (
    <div>
      {subcategories.length > 0 && (
        <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex lg:gap-4">
          {/* All button */}
          {parentSlug ? (
            <Link
              href={`/catalog/${parentSlug}`}
              className="group relative flex items-center gap-2 overflow-hidden rounded-2xl px-5 py-3 transition-all duration-300 bg-primary/10 text-neutral-900 ring-1 ring-primary/30"
            >
              <span className="text-sm font-semibold">Все товары</span>
              <span className="text-xs text-primary font-medium">{products.length}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 text-primary" />
            </Link>
          ) : (
            <button
              onClick={() => setActiveSubId(null)}
              className={cn(
                "group relative flex items-center gap-2 overflow-hidden rounded-2xl px-5 py-3 transition-all duration-300 cursor-pointer",
                activeSubId === null
                  ? "bg-primary/10 text-neutral-900 ring-1 ring-primary/30"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              )}
            >
              <span className="text-sm font-semibold">Все товары</span>
              <span className={cn(
                "text-xs font-medium",
                activeSubId === null ? "text-primary" : "text-neutral-400"
              )}>{products.length}</span>
              <ArrowRight className={cn(
                "h-4 w-4 transition-transform group-hover:translate-x-0.5",
                activeSubId === null ? "text-primary" : "text-neutral-400"
              )} />
            </button>
          )}

          {/* Subcategory cards */}
          {subcategories.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setActiveSubId(sub.id)}
              className={cn(
                "group relative flex items-center gap-2 overflow-hidden rounded-2xl px-5 py-3 transition-all duration-300 cursor-pointer",
                activeSubId === sub.id
                  ? "bg-primary/10 text-neutral-900 ring-1 ring-primary/30"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              )}
            >
              <span className="text-sm font-semibold">{sub.name}</span>
              <span className={cn(
                "text-xs font-medium",
                activeSubId === sub.id ? "text-primary" : "text-neutral-400"
              )}>{sub.count}</span>
              <ArrowRight className={cn(
                "h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5",
                activeSubId === sub.id ? "text-primary" : "text-neutral-400"
              )} />
            </button>
          ))}
        </div>
      )}

      {filtered.length > 0 ? (
        <ProductsView products={filtered} />
      ) : (
        <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
          <p className="text-muted-foreground">
            В этой категории пока нет товаров
          </p>
        </div>
      )}
    </div>
  );
}
