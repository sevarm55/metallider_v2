import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { apiSuccess, apiError } from "@/lib/types/api-response";
import { categorySchema } from "@/lib/schemas/category-schema";
import { slugify } from "@/lib/slugify";
import { logAdminAction } from "@/lib/admin-logger";
import { getAdminUserId } from "@/lib/get-admin-user-id";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") || "";
    const all = searchParams.get("all") === "true";

    const where = search
      ? { name: { contains: search, mode: "insensitive" as const } }
      : {};

    const categories = await prisma.category.findMany({
      where: all ? where : { ...where, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        sortOrder: true,
        isActive: true,
        parentId: true,
        _count: { select: { products: true } },
        children: {
          where: all ? {} : { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
            sortOrder: true,
            isActive: true,
            parentId: true,
            _count: { select: { products: true } },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return apiSuccess(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    return apiError("Ошибка получения категорий", 500, "INTERNAL_ERROR");
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminId = await getAdminUserId();
    if (!adminId) {
      return apiError("Не авторизован", 401, "UNAUTHORIZED");
    }

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

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return apiError("Категория с таким URL уже существует", 409, "SLUG_EXISTS");
    }

    const category = await prisma.category.create({
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
      action: "CREATE_CATEGORY",
      entity: "Category",
      entityId: category.id,
      data: { name: category.name },
      request,
    });

    return apiSuccess(category, "Категория создана", 201);
  } catch (error) {
    console.error("Create category error:", error);
    return apiError("Ошибка создания категории", 500, "INTERNAL_ERROR");
  }
}
