import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { apiSuccess, apiError } from "@/lib/types/api-response";
import { checkMobileApiKey } from "@/lib/check-api-key";

export const dynamic = "force-dynamic";

// GET /api/mobile/products — популярные товары (isHit)
// GET /api/mobile/products?new=1 — новинки
// GET /api/mobile/products?discounted=1 — со скидкой
export async function GET(request: NextRequest) {
  const keyError = checkMobileApiKey(request);
  if (keyError) return keyError;

  const isNew = request.nextUrl.searchParams.get("new") === "1";
  const isDiscounted = request.nextUrl.searchParams.get("discounted") === "1";

  try {
    const filter = isDiscounted
      ? { specialPrice: { gt: 0 }, price: { gt: 0 } }
      : isNew
        ? { isNew: true }
        : { isHit: true };

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...filter,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
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

    return apiSuccess(products);
  } catch (error) {
    console.error("Mobile products error:", error);
    return apiError("Ошибка", 500, "INTERNAL_ERROR");
  }
}
