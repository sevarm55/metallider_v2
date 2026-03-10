import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { apiSuccess, apiError } from "@/lib/types/api-response";
import { getAdminUserId } from "@/lib/get-admin-user-id";
import { logAdminAction } from "@/lib/admin-logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const attributes = await prisma.attribute.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        key: true,
        type: true,
        unit: true,
        sortOrder: true,
        isFilter: true,
        _count: { select: { values: true } },
      },
    });

    return apiSuccess(attributes);
  } catch (error) {
    console.error("Get attributes error:", error);
    return apiError("Ошибка получения атрибутов", 500, "INTERNAL_ERROR");
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminUserId = await getAdminUserId();
    if (!adminUserId) {
      return apiError("Не авторизован", 401, "UNAUTHORIZED");
    }

    const body = await request.json();
    const { name, key, type, unit, sortOrder, isFilter } = body;

    if (!name?.trim() || !key?.trim()) {
      return apiError("Название и ключ обязательны", 400, "VALIDATION_ERROR");
    }

    const existing = await prisma.attribute.findUnique({ where: { key: key.trim() } });
    if (existing) {
      return apiError("Атрибут с таким ключом уже существует", 400, "DUPLICATE_KEY");
    }

    const attribute = await prisma.attribute.create({
      data: {
        name: name.trim(),
        key: key.trim().toLowerCase().replace(/\s+/g, "_"),
        type: type || "STRING",
        unit: unit?.trim() || null,
        sortOrder: sortOrder ?? 0,
        isFilter: isFilter ?? true,
      },
    });

    await logAdminAction({ userId: adminUserId, action: "CREATE_ATTRIBUTE", entity: "Attribute", entityId: attribute.id, data: { name: attribute.name } });

    return apiSuccess(attribute);
  } catch (error) {
    console.error("Create attribute error:", error);
    return apiError("Ошибка создания атрибута", 500, "INTERNAL_ERROR");
  }
}
