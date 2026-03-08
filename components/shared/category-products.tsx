"use client";

import { useState } from "react";
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
}

export function CategoryProducts({ products, subcategories }: CategoryProductsProps) {
  const [activeSubId, setActiveSubId] = useState<string | null>(null);

  const filtered = activeSubId
    ? products.filter((p) => p.categoryId === activeSubId)
    : products;

  return (
    <div>
      {subcategories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSubId(null)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
              activeSubId === null
                ? "border-primary bg-primary text-white"
                : "border-neutral-200 bg-white text-neutral-700 hover:border-primary hover:text-primary"
            )}
          >
            Все
            <span className="ml-1.5 text-xs opacity-60">{products.length}</span>
          </button>
          {subcategories.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setActiveSubId(sub.id)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                activeSubId === sub.id
                  ? "border-primary bg-primary text-white"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-primary hover:text-primary"
              )}
            >
              {sub.name}
              <span className="ml-1.5 text-xs opacity-60">{sub.count}</span>
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
