import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { apiSuccess, apiError } from "@/lib/types/api-response";
import { checkMobileApiKey } from "@/lib/check-api-key";

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
