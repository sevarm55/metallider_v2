import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { apiSuccess, apiError } from "@/lib/types/api-response";
import { checkMobileApiKey } from "@/lib/check-api-key";
import { sendTelegramMessage } from "@/lib/send-telegram";

export async function POST(request: NextRequest) {
  const keyError = checkMobileApiKey(request);
  if (keyError) return keyError;

  try {
    const body = await request.json();
    const { type, name, phone, productId, productName } = body;

    if (!phone || phone.trim().length < 5) {
      return apiError("Укажите номер телефона", 400, "MISSING_PHONE");
    }

    const record = await prisma.callbackRequest.create({
      data: {
        type: type || "callback",
        name: name?.trim() || null,
        phone: phone.trim(),
        productId: productId || null,
        productName: productName || null,
      },
    });

    // Telegram notification
    const isQuickOrder = type === "quick_order";
    const emoji = isQuickOrder ? "⚡" : "📞";
    const title = isQuickOrder ? "Быстрый заказ (моб.)" : "Обратный звонок (моб.)";

    let message = `${emoji} <b>${title}</b>\n\n`;
    if (name) message += `👤 <b>Имя:</b> ${name}\n`;
    message += `📞 <b>Телефон:</b> ${phone}\n`;
    if (isQuickOrder && productName) {
      message += `📦 <b>Товар:</b> ${productName}\n`;
    }

    try {
      await sendTelegramMessage(message.trim());
    } catch {}

    return apiSuccess({ id: record.id });
  } catch (error) {
    console.error("Mobile callback error:", error);
    return apiError("Ошибка", 500, "INTERNAL_ERROR");
  }
}
