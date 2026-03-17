import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { apiSuccess, apiError } from "@/lib/types/api-response";
import { getAdminUserId } from "@/lib/get-admin-user-id";
import { logAdminAction } from "@/lib/admin-logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const groups = await prisma.attributeGroup.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { attributes: true } },
      },
    });

    return apiSuccess(groups);
  } catch (error) {
    console.error("Get attribute groups error:", error);
    return apiError("Ошибка получения групп", 500, "INTERNAL_ERROR");
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminUserId = await getAdminUserId();
    if (!adminUserId) {
      return apiError("Не авторизован", 401, "UNAUTHORIZED");
    }

    const body = await request.json();
    const { name, sortOrder } = body;

    if (!name?.trim()) {
      return apiError("Название обязательно", 400, "VALIDATION_ERROR");
    }

    const group = await prisma.attributeGroup.create({
      data: {
        name: name.trim(),
        sortOrder: sortOrder ?? 0,
      },
    });

    await logAdminAction({
      userId: adminUserId,
      action: "CREATE_ATTRIBUTE_GROUP",
      entity: "AttributeGroup",
      entityId: group.id,
      data: { name: group.name },
    });

    return apiSuccess(group);
  } catch (error) {
    console.error("Create attribute group error:", error);
    return apiError("Ошибка создания группы", 500, "INTERNAL_ERROR");
  }
}
