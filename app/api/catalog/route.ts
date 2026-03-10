import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";

const productSelect = {
  id: true,
  name: true,
  slug: true,
  price: true,
  specialPrice: true,
  unit: true,
  isHit: true,
  images: { take: 1, orderBy: { position: "asc" as const }, select: { url: true } },
};

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
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

  // For each category, pick 4 best products with priority:
  // 1) isHit  2) hasDiscount  3) random from different subcategories
  const result = await Promise.all(
    categories.map(async (cat) => {
      const childIds = cat.children.map((c) => c.id);
      const allCatIds = [cat.id, ...childIds];

      // 1) Hits
      const hits = await prisma.product.findMany({
        where: { isActive: true, isHit: true, categoryId: { in: allCatIds } },
        take: 4,
        orderBy: { createdAt: "desc" },
        select: productSelect,
      });

      if (hits.length >= 4) {
        return { ...cat, products: hits };
      }

      const hitIds = hits.map((p) => p.id);

      // 2) Discounted
      const discounted = await prisma.product.findMany({
        where: {
          isActive: true,
          categoryId: { in: allCatIds },
          id: { notIn: hitIds },
          specialPrice: { gt: 0 },
          price: { gt: 0 },
        },
        take: 4 - hits.length,
        orderBy: { createdAt: "desc" },
        select: productSelect,
      });

      const collected = [...hits, ...discounted];
      if (collected.length >= 4) {
        return { ...cat, products: collected.slice(0, 4) };
      }

      const usedIds = collected.map((p) => p.id);

      // 3) Random from different subcategories
      const remaining = 4 - collected.length;
      // Take 1 product per subcategory to get variety
      const randomProducts = [];
      for (const subId of [cat.id, ...childIds]) {
        if (randomProducts.length >= remaining) break;
        const p = await prisma.product.findFirst({
          where: {
            isActive: true,
            categoryId: subId,
            id: { notIn: usedIds },
          },
          orderBy: { createdAt: "desc" },
          select: productSelect,
        });
        if (p) {
          randomProducts.push(p);
          usedIds.push(p.id);
        }
      }

      return { ...cat, products: [...collected, ...randomProducts].slice(0, 4) };
    }),
  );

  // Attach products to children for compatibility
  const final = result.map((cat) => ({
    ...cat,
    children: cat.children.map((child) => ({ ...child, products: [] as typeof cat.products })),
  }));

  return NextResponse.json(final);
}
