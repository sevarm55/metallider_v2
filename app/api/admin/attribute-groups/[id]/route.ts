import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { apiSuccess, apiError } from "@/lib/types/api-response";
import { getAdminUserId } from "@/lib/get-admin-user-id";
import { logAdminAction } from "@/lib/admin-logger";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUserId = await getAdminUserId();
    if (!adminUserId) return apiError("Не авторизован", 401, "UNAUTHORIZED");

    const { id } = await params;
    const body = await request.json();
    const { name, sortOrder } = body;

    if (!name?.trim()) {
      return apiError("Название обязательно", 400, "VALIDATION_ERROR");
    }

    const group = await prisma.attributeGroup.update({
      where: { id },
      data: {
        name: name.trim(),
        sortOrder: sortOrder ?? 0,
      },
    });

    await logAdminAction({
      userId: adminUserId,
      action: "UPDATE_ATTRIBUTE_GROUP",
      entity: "AttributeGroup",
      entityId: id,
      data: { name: group.name },
    });

    return apiSuccess(group);
  } catch (error) {
    console.error("Update attribute group error:", error);
    return apiError("Ошибка обновления группы", 500, "INTERNAL_ERROR");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUserId = await getAdminUserId();
    if (!adminUserId) return apiError("Не авторизован", 401, "UNAUTHORIZED");

    const { id } = await params;

    const group = await prisma.attributeGroup.findUnique({
      where: { id },
      include: { _count: { select: { attributes: true } } },
    });

    if (!group) return apiError("Группа не найдена", 404, "NOT_FOUND");

    await prisma.attributeGroup.delete({ where: { id } });

    await logAdminAction({
      userId: adminUserId,
      action: "DELETE_ATTRIBUTE_GROUP",
      entity: "AttributeGroup",
      entityId: id,
      data: { name: group.name },
    });

    return apiSuccess({ deleted: true });
  } catch (error) {
    console.error("Delete attribute group error:", error);
    return apiError("Ошибка удаления группы", 500, "INTERNAL_ERROR");
  }
}
