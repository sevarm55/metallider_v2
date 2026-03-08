import { prisma } from "@/lib/prisma-client";
import { getUserSession } from "@/lib/get-user-session";
import { apiSuccess, apiError } from "@/lib/types/api-response";

export async function GET() {
  try {
    const session = await getUserSession();
    if (!session) {
      return apiError("Не авторизован", 401, "UNAUTHORIZED");
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                slug: true,
                images: { orderBy: { position: "asc" }, take: 1 },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.id,
        qty: item.qty,
        price: item.price,
        total: item.total,
        productName: item.product.name,
        productSlug: item.product.slug,
        productImage: item.product.images[0]?.url || null,
      })),
    }));

    return apiSuccess(result);
  } catch (error) {
    console.error("Get orders error:", error);
    return apiError("Ошибка получения заказов", 500, "INTERNAL_ERROR");
  }
}
