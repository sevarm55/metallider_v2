"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, X } from "lucide-react";
import { ProductsView } from "./products-view";
import { cn } from "@/lib/utils";

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  count: number;
}

interface ProductAttribute {
  key: string;
  name: string;
  value: string;
  unit?: string | null;
  isFilter?: boolean;
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
  attributes?: ProductAttribute[];
}

interface FilterOption {
  key: string;
  name: string;
  unit: string | null;
  values: { value: string; numeric: number | null; count: number }[];
}

interface CategoryProductsProps {
  products: Product[];
  subcategories: Subcategory[];
  parentSlug?: string;
}

export function CategoryProducts({ products, subcategories, parentSlug }: CategoryProductsProps) {
  const [activeSubId, setActiveSubId] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, Set<string>>>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Products filtered by subcategory
  const subFiltered = activeSubId
    ? products.filter((p) => p.categoryId === activeSubId)
    : products;

  // Dimension combos — these keys get merged into one "Размер" filter (без толщины)
  const dimensionCombos = [
    ["prof_height", "prof_width"],
    ["ugol_a", "ugol_b"],
    ["beam_flange", "beam_number"],
    ["width", "length"],
  ];

  // Build filter options from current products
  const filterOptions = useMemo<FilterOption[]>(() => {
    // Find which dimension combo applies to these products
    let activeComboKeys: string[] | null = null;
    for (const combo of dimensionCombos) {
      const hasAll = subFiltered.some((p) => {
        const keys = new Set(p.attributes?.map((a) => a.key) || []);
        return combo.filter((k) => keys.has(k)).length >= 2;
      });
      if (hasAll) { activeComboKeys = combo; break; }
    }

    // Build combined "Размер" values
    const sizeValues = new Map<string, number>();
    const regularMap = new Map<string, { name: string; unit: string | null; values: Map<string, number> }>();

    subFiltered.forEach((p) => {
      const attrs = p.attributes || [];
      const attrMap = new Map(attrs.map((a) => [a.key, a.value]));

      // Build size combo value
      if (activeComboKeys) {
        const vals = activeComboKeys.map((k) => attrMap.get(k)).filter(Boolean) as string[];
        if (vals.length >= 2) {
          const sizeVal = vals.join("х");
          sizeValues.set(sizeVal, (sizeValues.get(sizeVal) || 0) + 1);
        }
      }

      // Regular (non-combo) attributes
      attrs.forEach((a) => {
        if (a.isFilter === false) return;
        if (activeComboKeys?.includes(a.key)) return; // skip combo keys
        if (!regularMap.has(a.key)) {
          regularMap.set(a.key, { name: a.name, unit: a.unit || null, values: new Map() });
        }
        const entry = regularMap.get(a.key)!;
        entry.values.set(a.value, (entry.values.get(a.value) || 0) + 1);
      });
    });

    const result: FilterOption[] = [];

    // Add "Размер" filter first
    if (sizeValues.size >= 2) {
      result.push({
        key: "__size__",
        name: "Размер",
        unit: "мм",
        values: Array.from(sizeValues.entries())
          .map(([value, count]) => {
            const nums = value.split("х").map((n) => parseFloat(n.replace(",", ".")));
            return { value, numeric: nums[0] || null, count };
          })
          .sort((a, b) => {
            if (a.numeric !== null && b.numeric !== null) return a.numeric - b.numeric;
            return a.value.localeCompare(b.value, "ru");
          }),
      });
    }

    // Add regular filters
    for (const [key, data] of regularMap.entries()) {
      const values = Array.from(data.values.entries())
        .map(([value, count]) => ({
          value,
          numeric: parseFloat(value.replace(",", ".")) || null,
          count,
        }))
        .sort((a, b) => {
          if (a.numeric !== null && b.numeric !== null) return a.numeric - b.numeric;
          return a.value.localeCompare(b.value, "ru");
        });
      if (values.length >= 2) {
        result.push({ key, name: data.name, unit: data.unit, values });
      }
    }

    return result;
  }, [subFiltered]);

  // Apply attribute filters
  const filtered = useMemo(() => {
    const activeFilters = Object.entries(selectedFilters).filter(([, vals]) => vals.size > 0);
    if (activeFilters.length === 0) return subFiltered;

    // Find active combo keys for size filter
    let activeComboKeys: string[] | null = null;
    for (const combo of dimensionCombos) {
      const hasAll = subFiltered.some((p) => {
        const keys = new Set(p.attributes?.map((a) => a.key) || []);
        return combo.filter((k) => keys.has(k)).length >= 2;
      });
      if (hasAll) { activeComboKeys = combo; break; }
    }

    return subFiltered.filter((p) =>
      activeFilters.every(([key, vals]) => {
        if (key === "__size__" && activeComboKeys) {
          // Match combined size value
          const attrMap = new Map((p.attributes || []).map((a) => [a.key, a.value]));
          const sizeVal = activeComboKeys.map((k) => attrMap.get(k)).filter(Boolean).join("х");
          return vals.has(sizeVal);
        }
        const attr = p.attributes?.find((a) => a.key === key);
        return attr && vals.has(attr.value);
      })
    );
  }, [subFiltered, selectedFilters]);

  const activeFilterCount = Object.values(selectedFilters).reduce((sum, s) => sum + s.size, 0);

  function toggleFilter(key: string, value: string) {
    setSelectedFilters((prev) => {
      const next = { ...prev };
      const set = new Set(next[key] || []);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      next[key] = set;
      return next;
    });
  }

  function clearFilters() {
    setSelectedFilters({});
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div>
      {/* Subcategory tabs */}
      {subcategories.length > 0 && (
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex lg:gap-4">
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
              onClick={() => { setActiveSubId(null); clearFilters(); }}
              className={cn(
                "group relative flex items-center gap-2 overflow-hidden rounded-2xl px-5 py-3 transition-all duration-300 cursor-pointer",
                activeSubId === null
                  ? "bg-primary/10 text-neutral-900 ring-1 ring-primary/30"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              )}
            >
              <span className="text-sm font-semibold">Все товары</span>
              <span className={cn("text-xs font-medium", activeSubId === null ? "text-primary" : "text-neutral-400")}>{products.length}</span>
            </button>
          )}

          {subcategories.map((sub) => (
            <button
              key={sub.id}
              onClick={() => { setActiveSubId(sub.id); clearFilters(); }}
              className={cn(
                "group relative flex items-center gap-2 overflow-hidden rounded-2xl px-5 py-3 transition-all duration-300 cursor-pointer",
                activeSubId === sub.id
                  ? "bg-primary/10 text-neutral-900 ring-1 ring-primary/30"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              )}
            >
              <span className="text-sm font-semibold">{sub.name}</span>
              <span className={cn("text-xs font-medium", activeSubId === sub.id ? "text-primary" : "text-neutral-400")}>{sub.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Products */}
      {subFiltered.length > 0 ? (
        <ProductsView products={subFiltered} />
      ) : (
        <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
          <p className="text-muted-foreground">В этой категории пока нет товаров</p>
        </div>
      )}
    </div>
  );
}
