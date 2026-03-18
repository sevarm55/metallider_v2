import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { apiSuccess, apiError } from "@/lib/types/api-response";
import { checkMobileApiKey } from "@/lib/check-api-key";

export const dynamic = "force-dynamic";

// GET /api/mobile/products — популярные товары (isHit)
// GET /api/mobile/products?new=1 — новинки
export async function GET(request: NextRequest) {
  const keyError = checkMobileApiKey(request);
  if (keyError) return keyError;

  const isNew = request.nextUrl.searchParams.get("new") === "1";

  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(isNew ? { isNew: true } : { isHit: true }),
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
