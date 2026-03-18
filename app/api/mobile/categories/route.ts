import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { apiSuccess, apiError } from "@/lib/types/api-response";
import { checkMobileApiKey } from "@/lib/check-api-key";

export const dynamic = "force-dynamic";

// GET /api/mobile/categories — все категории с подкатегориями
// GET /api/mobile/categories?id=xxx — товары конкретной категории
export async function GET(request: NextRequest) {
  const keyError = checkMobileApiKey(request);
  if (keyError) return keyError;

  const categoryId = request.nextUrl.searchParams.get("id");

  try {
    // Если передан id — вернуть товары категории
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        select: {
          id: true, name: true, slug: true, image: true,
          children: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
            select: { id: true, name: true, slug: true },
          },
        },
      });

      if (!category) return apiError("Категория не найдена", 404, "NOT_FOUND");

      const childIds = category.children.map((c) => c.id);
      const products = await prisma.product.findMany({
        where: { isActive: true, categoryId: { in: [category.id, ...childIds] } },
        orderBy: { name: "asc" },
        select: {
          id: true, name: true, slug: true, code: true,
          price: true, specialPrice: true, unit: true,
          isHit: true, isNew: true, stock: true,
          images: { take: 1, orderBy: { position: "asc" }, select: { url: true } },
          attributes: {
            select: { value: true, attribute: { select: { key: true, name: true, unit: true } } },
          },
        },
      });

      return apiSuccess({ category, products });
    }

    // Иначе — дерево категорий
    const categories = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true, name: true, slug: true, image: true,
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: { id: true, name: true, slug: true, image: true },
        },
      },
    });

    return apiSuccess(categories);
  } catch (error) {
    console.error("Mobile categories error:", error);
    return apiError("Ошибка", 500, "INTERNAL_ERROR");
  }
}
