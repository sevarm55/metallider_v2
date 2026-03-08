import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { apiSuccess, apiError } from "@/lib/types/api-response";
import { categorySchema } from "@/lib/schemas/category-schema";
import { slugify } from "@/lib/slugify";
import { logAdminAction } from "@/lib/admin-logger";
import { getAdminUserId } from "@/lib/get-admin-user-id";

export const dynamic = "force-dynamic";

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
    const parsed = categorySchema.safeParse(body);

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

    const existingSlug = await prisma.category.findUnique({ where: { slug } });
    if (existingSlug && existingSlug.id !== id) {
      return apiError("Категория с таким URL уже существует", 409, "SLUG_EXISTS");
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        image: data.image || null,
        parentId: data.parentId || null,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      },
    });

    await logAdminAction({
      userId: adminId,
      action: "UPDATE_CATEGORY",
      entity: "Category",
      entityId: category.id,
      data: { name: category.name },
      request,
    });

    return apiSuccess(category);
  } catch (error) {
    console.error("Update category error:", error);
    return apiError("Ошибка обновления категории", 500, "INTERNAL_ERROR");
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

    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return apiError(
        `Нельзя удалить: в категории ${productCount} товаров`,
        400,
        "HAS_PRODUCTS",
      );
    }

    const category = await prisma.category.delete({ where: { id } });

    await logAdminAction({
      userId: adminId,
      action: "DELETE_CATEGORY",
      entity: "Category",
      entityId: id,
      data: { name: category.name },
      request,
    });

    return apiSuccess({ deleted: true });
  } catch (error) {
    console.error("Delete category error:", error);
    return apiError("Ошибка удаления категории", 500, "INTERNAL_ERROR");
  }
}
