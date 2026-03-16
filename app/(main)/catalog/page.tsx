export const dynamic = 'force-dynamic';

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma-client";
import { CatalogViewSwitcher } from "@/components/shared/catalog-view-switcher";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://metallider.ru";

export const metadata: Metadata = {
  title: "Каталог металлопроката — купить трубы, арматуру, листы в Москве | МеталлЛидер",
  description: "Полный каталог металлопроката: трубы профильные и круглые, листы стальные, арматура, уголки, швеллеры, профнастил, метизы. Более 300 наименований в наличии.",
  alternates: { canonical: `${SITE_URL}/catalog` },
  openGraph: {
    title: "Каталог металлопроката — МеталлЛидер",
    description: "Более 300 наименований металлопроката в наличии.",
    url: `${SITE_URL}/catalog`,
  },
};

const cardColors = [
  "from-emerald-500 via-emerald-700 to-emerald-950",
  "from-fuchsia-500 via-pink-600 to-pink-950",
  "from-sky-500 via-indigo-600 to-indigo-950",
  "from-red-500 via-red-700 to-red-950",
  "from-amber-500 via-orange-600 to-orange-950",
  "from-violet-500 via-purple-700 to-purple-950",
  "from-teal-400 via-teal-600 to-teal-950",
  "from-slate-400 via-zinc-600 to-zinc-950",
];

export default async function CatalogPage() {
  const parentCategories = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      _count: { select: { products: { where: { isActive: true } } } },
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          _count: { select: { products: { where: { isActive: true } } } },
        },
      },
    },
  });

  const categories = parentCategories.map((cat, idx) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    image: cat.image,
    color: cardColors[idx % cardColors.length],
    totalProducts: cat._count.products + cat.children.reduce((s, c) => s + c._count.products, 0),
    children: cat.children.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
    index: idx,
  }));

  return <CatalogViewSwitcher categories={categories} />;
}
