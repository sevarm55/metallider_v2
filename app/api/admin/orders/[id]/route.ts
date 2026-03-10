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
    const { status, notes } = body;

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) return apiError("Заказ не найден", 404, "NOT_FOUND");

    const data: Record<string, unknown> = {};
    if (status) data.status = status;
    if (notes !== undefined) data.notes = notes;

    const order = await prisma.order.update({
      where: { id },
      data,
    });

    await logAdminAction({
      userId: adminUserId,
      action: "UPDATE_ORDER",
      entity: "Order",
      entityId: id,
      data: { orderNumber: order.orderNumber, status: order.status },
    });

    return apiSuccess(order);
  } catch (error) {
    console.error("Update order error:", error);
    return apiError("Ошибка обновления", 500, "INTERNAL_ERROR");
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminUserId = await getAdminUserId();
    if (!adminUserId) return apiError("Не авторизован", 401, "UNAUTHORIZED");

    const { id } = await params;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return apiError("Заказ не найден", 404, "NOT_FOUND");

    await prisma.order.delete({ where: { id } });

    await logAdminAction({
      userId: adminUserId,
      action: "UPDATE_ORDER",
      entity: "Order",
      entityId: id,
      data: { orderNumber: order.orderNumber, deleted: true },
    });

    return apiSuccess({ deleted: true });
  } catch (error) {
    console.error("Delete order error:", error);
    return apiError("Ошибка удаления", 500, "INTERNAL_ERROR");
  }
}
