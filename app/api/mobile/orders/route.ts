import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { apiSuccess, apiError } from "@/lib/types/api-response";
import { checkMobileApiKey } from "@/lib/check-api-key";

// GET /api/mobile/orders?phone=xxx — заказы пользователя по телефону
export async function GET(request: NextRequest) {
  const keyError = checkMobileApiKey(request);
  if (keyError) return keyError;

  const phone = request.nextUrl.searchParams.get("phone");
  if (!phone) {
    return apiError("Телефон обязателен", 400, "MISSING_PHONE");
  }

  try {
    const orders = await prisma.order.findMany({
      where: { phone: { contains: phone.replace(/\D/g, "").slice(-10) } },
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
      take: 50,
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
    console.error("Mobile get orders error:", error);
    return apiError("Ошибка", 500, "INTERNAL_ERROR");
  }
}

// POST /api/mobile/orders — создать заказ
export async function POST(request: NextRequest) {
  const keyError = checkMobileApiKey(request);
  if (keyError) return keyError;

  try {
    const body = await request.json();
    const { fullName, phone, email, address, comment, items } = body;

    if (!fullName?.trim() || !phone?.trim()) {
      return apiError("Имя и телефон обязательны", 400, "VALIDATION_ERROR");
    }

    if (!items?.length) {
      return apiError("Корзина пуста", 400, "EMPTY_CART");
    }

    // Validate products and calculate total
    let totalAmount = 0;
    const orderItems: { productId: string; qty: number; price: number; total: number }[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, price: true, specialPrice: true },
      });

      if (!product) continue;

      const price = product.specialPrice && product.specialPrice > 0 && product.specialPrice < product.price
        ? product.specialPrice
        : product.price;

      const qty = Math.max(0.01, Number(item.qty) || 1);
      const total = price * qty;

      orderItems.push({ productId: product.id, qty, price, total });
      totalAmount += total;
    }

    if (orderItems.length === 0) {
      return apiError("Товары не найдены", 400, "PRODUCTS_NOT_FOUND");
    }

    const order = await prisma.order.create({
      data: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email?.trim() || null,
        address: address?.trim() || null,
        comment: comment?.trim() || null,
        token: crypto.randomUUID(),
        totalAmount,
        items: {
          create: orderItems,
        },
      },
      include: { items: true },
    });

    return apiSuccess({
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      itemsCount: order.items.length,
    }, "Заказ создан", 201);
  } catch (error) {
    console.error("Mobile order error:", error);
    return apiError("Ошибка создания заказа", 500, "INTERNAL_ERROR");
  }
}
