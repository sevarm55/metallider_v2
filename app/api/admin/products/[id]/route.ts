import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { apiSuccess, apiError } from "@/lib/types/api-response";
import { logAdminAction } from "@/lib/admin-logger";
import { getAdminUserId } from "@/lib/get-admin-user-id";
import { createProductSchema } from "@/lib/schemas/product-schema";
import { slugify } from "@/lib/slugify";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { position: "asc" } },
        items: true,
        attributes: {
          include: { attribute: true },
          orderBy: { attribute: { sortOrder: "asc" } },
        },
      },
    });

    if (!product) {
      return apiError("Товар не найден", 404, "NOT_FOUND");
    }

    return apiSuccess(product);
  } catch (error) {
    console.error("Get product error:", error);
    return apiError("Ошибка получения товара", 500, "INTERNAL_ERROR");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const adminId = await getAdminUserId();
    if (!adminId) {
      return apiError("Не авторизован", 401, "UNAUTHORIZED");
    }

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!product) {
      return apiError("Товар не найден", 404, "NOT_FOUND");
    }

    // Delete related records, then product
    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { productId: id } }),
      prisma.orderItem.deleteMany({ where: { productId: id } }),
      prisma.productAttribute.deleteMany({ where: { productId: id } }),
      prisma.productImage.deleteMany({ where: { productId: id } }),
      prisma.productItem.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } }),
    ]);

    await logAdminAction({
      userId: adminId,
      action: "DELETE_PRODUCT",
      entity: "Product",
      entityId: id,
      data: { name: product.name },
      request,
    });

    return apiSuccess(undefined, "Товар удалён");
  } catch (error) {
    console.error("Delete product error:", error);
    return apiError("Ошибка удаления товара", 500, "INTERNAL_ERROR");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const adminId = await getAdminUserId();
    if (!adminId) {
      return apiError("Не авторизован", 401, "UNAUTHORIZED");
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message || "Ошибка валидации",
        400,
        "VALIDATION_ERROR",
      );
    }

    const data = parsed.data;

    const existing = await prisma.product.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!existing) {
      return apiError("Товар не найден", 404, "NOT_FOUND");
    }

    // Check slug uniqueness (exclude current product)
    const slug = data.slug || slugify(data.name);
    const slugTaken = await prisma.product.findFirst({
      where: { slug, id: { not: id } },
      select: { id: true },
    });
    if (slugTaken) {
      return apiError("Товар с таким URL уже существует", 400, "SLUG_TAKEN");
    }

    // Update product + replace images + attributes
    const product = await prisma.$transaction(async (tx) => {
      // Delete old images and attributes
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.productAttribute.deleteMany({ where: { productId: id } });

      // Update product
      return tx.product.update({
        where: { id },
        data: {
          name: data.name,
          slug,
          code: data.code || "",
          description: data.description || "",
          categoryId: data.categoryId,
          brandId: data.brandId || null,
          price: data.price,
          specialPrice: data.specialPrice || 0,
          unit: data.unit,
          stock: data.stock,
          isActive: data.stock <= 0 ? false : data.isActive,
          isHit: data.isHit,
          isNew: data.isNew,
          images:
            data.images && data.images.length > 0
              ? {
                  create: data.images.map((url, i) => ({
                    url,
                    position: i,
                    isMain: i === 0,
                  })),
                }
              : undefined,
          attributes:
            data.attributes && data.attributes.length > 0
              ? {
                  create: data.attributes.map((attr) => ({
                    attributeId: attr.attributeId,
                    value: attr.value,
                    numericValue: attr.numericValue ?? null,
                  })),
                }
              : undefined,
        },
        include: {
          category: { select: { id: true, name: true } },
          images: true,
          attributes: { include: { attribute: true } },
        },
      });
    });

    await logAdminAction({
      userId: adminId,
      action: "UPDATE_PRODUCT",
      entity: "Product",
      entityId: id,
      data: { name: data.name },
      request,
    });

    return apiSuccess(product);
  } catch (error) {
    console.error("Update product error:", error);
    return apiError("Ошибка обновления товара", 500, "INTERNAL_ERROR");
  }
}
