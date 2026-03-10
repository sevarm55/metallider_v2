import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { getAdminUserId } from "@/lib/get-admin-user-id";
import { apiSuccess, apiError } from "@/lib/types/api-response";
import { logAdminAction } from "@/lib/admin-logger";

export const dynamic = "force-dynamic";

/**
 * Массовое назначение изображения всем товарам категории.
 * POST { categoryId, imageUrl }
 */
export async function POST(request: NextRequest) {
  try {
    const adminId = await getAdminUserId();
    if (!adminId) {
      return apiError("Не авторизован", 401, "UNAUTHORIZED");
    }

    const { categoryId, imageUrl } = await request.json();

    if (!categoryId || !imageUrl) {
      return apiError("Укажите categoryId и imageUrl", 400, "VALIDATION_ERROR");
    }

    // Find all products in this category
    const products = await prisma.product.findMany({
      where: { categoryId, isActive: true },
      select: { id: true, images: { where: { isMain: true }, select: { id: true } } },
    });

    if (products.length === 0) {
      return apiSuccess({ updated: 0, message: "Нет товаров в этой категории" });
    }

    // For products WITH main image — replace it; for products WITHOUT — create new
    const withMain = products.filter((p) => p.images.length > 0);
    const withoutMain = products.filter((p) => p.images.length === 0);

    // Update existing main images
    if (withMain.length > 0) {
      const mainImageIds = withMain.map((p) => p.images[0].id);
      await prisma.productImage.updateMany({
        where: { id: { in: mainImageIds } },
        data: { url: imageUrl },
      });
    }

    // Create new main images for products without any
    if (withoutMain.length > 0) {
      await prisma.productImage.createMany({
        data: withoutMain.map((p) => ({
          productId: p.id,
          url: imageUrl,
          position: 0,
          isMain: true,
        })),
      });
    }

    await logAdminAction({
      userId: adminId,
      action: "BULK_ADD_IMAGE",
      entity: "Product",
      data: { categoryId, imageUrl, count: products.length },
      request,
    });

    return apiSuccess({ updated: products.length, replaced: withMain.length, added: withoutMain.length });
  } catch (error) {
    console.error("Bulk image error:", error);
    return apiError("Ошибка массового добавления фото", 500, "INTERNAL_ERROR");
  }
}
