import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { apiSuccess, apiError } from "@/lib/types/api-response";
import { checkMobileApiKey } from "@/lib/check-api-key";

export const dynamic = "force-dynamic";

// GET /api/mobile/search?q=труба
export async function GET(request: NextRequest) {
  const keyError = checkMobileApiKey(request);
  if (keyError) return keyError;

  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return apiSuccess([]);

  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { code: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { name: "asc" },
      take: 30,
      select: {
        id: true, name: true, slug: true, code: true,
        price: true, specialPrice: true, unit: true,
        isHit: true, isNew: true,
        images: { take: 1, orderBy: { position: "asc" }, select: { url: true } },
      },
    });

    return apiSuccess(products);
  } catch (error) {
    console.error("Mobile search error:", error);
    return apiError("Ошибка поиска", 500, "INTERNAL_ERROR");
  }
}
