import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { apiSuccess, apiError } from "@/lib/types/api-response";
import { checkMobileApiKey } from "@/lib/check-api-key";

// GET /api/mobile/products/[slug] — детали товара
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const keyError = checkMobileApiKey(request);
  if (keyError) return keyError;

  const { slug } = await params;

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { position: "asc" }, select: { url: true, isMain: true } },
        attributes: {
          include: { attribute: { select: { key: true, name: true, unit: true, type: true } } },
          orderBy: { attribute: { sortOrder: "asc" } },
        },
        items: {
          select: { id: true, name: true, price: true, stock: true },
        },
      },
    });

    if (!product || !product.isActive) {
      return apiError("Товар не найден", 404, "NOT_FOUND");
    }

    return apiSuccess({
      id: product.id,
      name: product.name,
      slug: product.slug,
      code: product.code,
      description: product.description,
      price: product.price,
      specialPrice: product.specialPrice,
      unit: product.unit,
      stock: product.stock,
      isHit: product.isHit,
      isNew: product.isNew,
      category: product.category,
      images: product.images.map((img) => img.url),
      attributes: product.attributes.map((pa) => ({
        key: pa.attribute.key,
        name: pa.attribute.name,
        value: pa.value,
        unit: pa.attribute.unit,
      })),
      variants: product.items,
    });
  } catch (error) {
    console.error("Mobile product error:", error);
    return apiError("Ошибка", 500, "INTERNAL_ERROR");
  }
}
