import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { checkMobileApiKey } from "@/lib/check-api-key";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const apiKeyError = checkMobileApiKey(req);
  if (apiKeyError) return apiKeyError;

  const { id } = await params;

  // Find category and all child category IDs
  const category = await prisma.category.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      children: {
        where: { isActive: true },
        select: { id: true, name: true, slug: true },
      },
    },
  });

  if (!category) {
    return NextResponse.json({ error: "Категория не найдена" }, { status: 404 });
  }

  const childIds = category.children.map((c) => c.id);
  const allCatIds = [category.id, ...childIds];

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      categoryId: { in: allCatIds },
    },
    orderBy: [{ isHit: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      specialPrice: true,
      unit: true,
      isHit: true,
      isNew: true,
      stock: true,
      images: {
        take: 1,
        orderBy: { position: "asc" },
        select: { url: true },
      },
      attributes: {
        select: {
          value: true,
          attribute: {
            select: { name: true, unit: true },
          },
        },
      },
    },
  });

  return NextResponse.json({
    category: {
      id: category.id,
      name: category.name,
      slug: category.slug,
      image: category.image,
      children: category.children,
    },
    products,
  });
}
