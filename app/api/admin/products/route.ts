import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { apiSuccess, apiError } from "@/lib/types/api-response";
import { createProductSchema } from "@/lib/schemas/product-schema";
import { slugify } from "@/lib/slugify";
import { logAdminAction } from "@/lib/admin-logger";
import { getAdminUserId } from "@/lib/get-admin-user-id";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));
    const search = searchParams.get("search") || "";

    const where = search
      ? { name: { contains: search, mode: "insensitive" as const } }
      : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
          images: { orderBy: { position: "asc" }, take: 1 },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return apiSuccess({ products, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Get products error:", error);
    return apiError("Ошибка получения товаров", 500, "INTERNAL_ERROR");
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminId = await getAdminUserId();
    if (!adminId) {
      return apiError("Не авторизован", 401, "UNAUTHORIZED");
    }

    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      const details: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path.join(".");
        if (!details[field]) details[field] = [];
        details[field].push(issue.message);
      }
      return apiError("Ошибка валидации", 400, "VALIDATION_ERROR", details);
    }

    const data = parsed.data;
    const slug = data.slug || slugify(data.name);

    // Check slug uniqueness
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      return apiError("Товар с таким URL уже существует", 409, "SLUG_EXISTS");
    }

    const product = await prisma.product.create({
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
        isActive: data.isActive,
        isHit: data.isHit,
        isNew: data.isNew,
        images: data.images.length > 0
          ? {
              create: data.images.map((url, i) => ({
                url,
                position: i,
                isMain: i === 0,
              })),
            }
          : undefined,
        attributes: data.attributes && data.attributes.length > 0
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

    await logAdminAction({
      userId: adminId,
      action: "CREATE_PRODUCT",
      entity: "Product",
      entityId: product.id,
      data: { name: product.name },
      request,
    });

    return apiSuccess(product, "Товар создан", 201);
  } catch (error) {
    console.error("Create product error:", error);
    const message = error instanceof Error ? error.message : "Ошибка создания товара";
    return apiError(message, 500, "INTERNAL_ERROR");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminId = await getAdminUserId();
    if (!adminId) {
      return apiError("Не авторизован", 401, "UNAUTHORIZED");
    }

    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return apiError("Укажите ID товаров", 400, "VALIDATION_ERROR");
    }

    // Delete related records first, then products
    await prisma.productAttribute.deleteMany({
      where: { productId: { in: ids } },
    });
    await prisma.productImage.deleteMany({
      where: { productId: { in: ids } },
    });

    const result = await prisma.product.deleteMany({
      where: { id: { in: ids } },
    });

    await logAdminAction({
      userId: adminId,
      action: "DELETE_PRODUCT",
      entity: "Product",
      data: { count: result.count, ids },
      request,
    });

    return apiSuccess({ deleted: result.count });
  } catch (error) {
    console.error("Bulk delete products error:", error);
    return apiError("Ошибка удаления товаров", 500, "INTERNAL_ERROR");
  }
}
