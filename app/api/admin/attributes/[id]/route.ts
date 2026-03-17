import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { apiSuccess, apiError } from "@/lib/types/api-response";
import { getAdminUserId } from "@/lib/get-admin-user-id";
import { logAdminAction } from "@/lib/admin-logger";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminUserId = await getAdminUserId();
    if (!adminUserId) return apiError("Не авторизован", 401, "UNAUTHORIZED");

    const { id } = await params;
    const body = await request.json();
    const { name, key, type, unit, sortOrder, isFilter, groupId } = body;

    if (!name?.trim()) {
      return apiError("Название обязательно", 400, "VALIDATION_ERROR");
    }

    const existing = await prisma.attribute.findFirst({
      where: { key: key?.trim(), NOT: { id } },
    });
    if (existing) {
      return apiError("Атрибут с таким ключом уже существует", 400, "DUPLICATE_KEY");
    }

    const attribute = await prisma.attribute.update({
      where: { id },
      data: {
        name: name.trim(),
        ...(key && { key: key.trim().toLowerCase().replace(/\s+/g, "_") }),
        ...(type && { type }),
        unit: unit?.trim() || null,
        sortOrder: sortOrder ?? 0,
        isFilter: isFilter ?? true,
        groupId: groupId !== undefined ? (groupId || null) : undefined,
      },
    });

    await logAdminAction({ userId: adminUserId, action: "UPDATE_ATTRIBUTE", entity: "Attribute", entityId: id, data: { name: attribute.name } });

    return apiSuccess(attribute);
  } catch (error) {
    console.error("Update attribute error:", error);
    return apiError("Ошибка обновления", 500, "INTERNAL_ERROR");
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminUserId = await getAdminUserId();
    if (!adminUserId) return apiError("Не авторизован", 401, "UNAUTHORIZED");

    const { id } = await params;

    const attribute = await prisma.attribute.findUnique({
      where: { id },
      include: { _count: { select: { values: true } } },
    });

    if (!attribute) return apiError("Атрибут не найден", 404, "NOT_FOUND");

    await prisma.attribute.delete({ where: { id } });

    await logAdminAction({ userId: adminUserId, action: "DELETE_ATTRIBUTE", entity: "Attribute", entityId: id, data: { name: attribute.name } });

    return apiSuccess({ deleted: true });
  } catch (error) {
    console.error("Delete attribute error:", error);
    return apiError("Ошибка удаления", 500, "INTERNAL_ERROR");
  }
}
