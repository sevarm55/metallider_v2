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
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl p-4 transition-all duration-300 lg:w-40 lg:h-28 bg-neutral-900 text-white shadow-lg"
            >
              <span className="text-2xl font-black font-(family-name:--font-unbounded) text-white">
                {products.length}
              </span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Все товары</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 text-primary" />
              </div>
            </Link>
          ) : (
            <button
              onClick={() => setActiveSubId(null)}
              className={cn(
                "group relative flex flex-col justify-between overflow-hidden rounded-2xl p-4 transition-all duration-300 lg:w-40 lg:h-28 cursor-pointer",
                activeSubId === null
                  ? "bg-neutral-900 text-white shadow-lg"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              )}
            >
              <span className={cn(
                "text-2xl font-black font-(family-name:--font-unbounded)",
                activeSubId === null ? "text-white" : "text-neutral-900"
              )}>
                {products.length}
              </span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Все товары</span>
                <ArrowRight className={cn(
                  "h-4 w-4 transition-transform group-hover:translate-x-0.5",
                  activeSubId === null ? "text-primary" : "text-neutral-400"
                )} />
              </div>
            </button>
          )}

          {/* Subcategory cards — always Link */}
          {subcategories.map((sub) => (
            <Link
              key={sub.id}
              href={`/catalog/${sub.slug}`}
              className={cn(
                "group relative flex flex-col justify-between overflow-hidden rounded-2xl p-4 transition-all duration-300 lg:w-40 lg:h-28",
                "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              )}
            >
              <span className="text-2xl font-black font-(family-name:--font-unbounded) text-neutral-900">
                {sub.count}
              </span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-left">{sub.name}</span>
                <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 text-neutral-400" />
              </div>
            </Link>
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
