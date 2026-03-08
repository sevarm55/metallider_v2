import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";

const unitLabels: Record<string, string> = {
  PCS: "шт", METER: "м", M2: "м²", KG: "кг", PACK: "уп", SET: "компл",
};

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ products: [], categories: [] });
  }

  // 1. Try exact (contains) search first
  let [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { code: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        specialPrice: true,
        unit: true,
        images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
      },
      take: 6,
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      where: {
        isActive: true,
        name: { contains: q, mode: "insensitive" },
      },
      select: { id: true, name: true, slug: true },
      take: 3,
      orderBy: { name: "asc" },
    }),
  ]);

  // 2. If no results — fuzzy search via pg_trgm
  if (products.length === 0 && categories.length === 0) {
    const threshold = 0.1;

    const [fuzzyProducts, fuzzyCategories] = await Promise.all([
      prisma.$queryRaw<Array<{
        id: string;
        name: string;
        slug: string;
        price: number;
        specialPrice: number;
        unit: string;
        image: string | null;
        sim: number;
      }>>`
        SELECT p.id, p.name, p.slug, p.price, p."specialPrice", p.unit,
               (SELECT pi.url FROM product_images pi WHERE pi."productId" = p.id ORDER BY pi.position LIMIT 1) as image,
               similarity(p.name, ${q}) as sim
        FROM products p
        WHERE p."isActive" = true
          AND similarity(p.name, ${q}) > ${threshold}
        ORDER BY sim DESC
        LIMIT 6
      `,
      prisma.$queryRaw<Array<{
        id: string;
        name: string;
        slug: string;
        sim: number;
      }>>`
        SELECT c.id, c.name, c.slug, similarity(c.name, ${q}) as sim
        FROM categories c
        WHERE c."isActive" = true
          AND similarity(c.name, ${q}) > ${threshold}
        ORDER BY sim DESC
        LIMIT 3
      `,
    ]);

    return NextResponse.json({
      products: fuzzyProducts.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        specialPrice: p.specialPrice || undefined,
        unit: unitLabels[p.unit] || "шт",
        image: p.image || null,
      })),
      categories: fuzzyCategories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      })),
    });
  }

  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      specialPrice: p.specialPrice || undefined,
      unit: unitLabels[p.unit] || "шт",
      image: p.images[0]?.url || null,
    })),
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
    })),
  });
}
