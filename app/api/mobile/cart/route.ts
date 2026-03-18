import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { apiSuccess, apiError } from "@/lib/types/api-response";
import { checkMobileApiKey } from "@/lib/check-api-key";

// POST /api/mobile/cart — заявка на обратный звонок / быстрый заказ
export async function POST(request: NextRequest) {
  const keyError = checkMobileApiKey(request);
  if (keyError) return keyError;

  try {
    const body = await request.json();
    const { name, phone, productId, productName, type } = body;

    if (!phone?.trim()) {
      return apiError("Телефон обязателен", 400, "VALIDATION_ERROR");
    }

    const callback = await prisma.callbackRequest.create({
      data: {
        type: type || "mobile",
        name: name?.trim() || null,
        phone: phone.trim(),
        productId: productId || null,
        productName: productName || null,
      },
    });

    return apiSuccess({ id: callback.id }, "Заявка отправлена", 201);
  } catch (error) {
    console.error("Mobile callback error:", error);
    return apiError("Ошибка", 500, "INTERNAL_ERROR");
  }
}
