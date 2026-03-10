import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { apiSuccess, apiError } from "@/lib/types/api-response";
import { getAdminUserId } from "@/lib/get-admin-user-id";
import { logAdminAction } from "@/lib/admin-logger";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminUserId = await getAdminUserId();
    if (!adminUserId) return apiError("Не авторизован", 401, "UNAUTHORIZED");

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        verified: true,
        provider: true,
        isActive: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: { select: { orders: true } },
      },
    });

    if (!user) return apiError("Пользователь не найден", 404, "NOT_FOUND");

    return apiSuccess(user);
  } catch (error) {
    console.error("Get user error:", error);
    return apiError("Ошибка получения", 500, "INTERNAL_ERROR");
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminUserId = await getAdminUserId();
    if (!adminUserId) return apiError("Не авторизован", 401, "UNAUTHORIZED");

    const { id } = await params;
    const body = await request.json();
    const { role, isActive } = body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return apiError("Пользователь не найден", 404, "NOT_FOUND");

    if (id === adminUserId && isActive === false) {
      return apiError("Нельзя деактивировать себя", 400, "SELF_DEACTIVATE");
    }

    const data: Record<string, unknown> = {};
    if (role) data.role = role;
    if (isActive !== undefined) data.isActive = isActive;

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    await logAdminAction({
      userId: adminUserId,
      action: "UPDATE_SETTINGS",
      entity: "User",
      entityId: id,
      data: { fullName: user.fullName, role: user.role, isActive: user.isActive },
    });

    return apiSuccess(user);
  } catch (error) {
    console.error("Update user error:", error);
    return apiError("Ошибка обновления", 500, "INTERNAL_ERROR");
  }
}
