import { prisma } from "@/lib/prisma-client";
import { apiSuccess, apiError } from "@/lib/types/api-response";
import { getAdminUserId } from "@/lib/get-admin-user-id";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const adminUserId = await getAdminUserId();
    if (!adminUserId) return apiError("Не авторизован", 401, "UNAUTHORIZED");
    const [
      totalProducts,
      activeProducts,
      totalCategories,
      totalOrders,
      recentLogs,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.category.count(),
      prisma.order.count(),
      prisma.adminLog.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { fullName: true } } },
      }),
    ]);

    return apiSuccess({
      totalProducts,
      activeProducts,
      totalCategories,
      totalOrders,
      recentLogs,
    });
  } catch (error) {
    console.error("Statistics error:", error);
    return apiError("Ошибка получения статистики", 500, "INTERNAL_ERROR");
  }
}
