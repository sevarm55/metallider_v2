"use client";

import { CatalogClassic } from "./catalog-classic";

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
  return <CatalogClassic categories={categories} />;
}
