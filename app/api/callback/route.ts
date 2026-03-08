import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { sendTelegramMessage } from "@/lib/send-telegram";

interface CallbackBody {
  type: "callback" | "quick_order";
  name?: string;
  phone: string;
  productId?: string;
  productName?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: CallbackBody = await req.json();

    if (!body.phone || body.phone.trim().length < 5) {
      return NextResponse.json({ error: "Укажите номер телефона" }, { status: 400 });
    }

    const record = await prisma.callbackRequest.create({
      data: {
        type: body.type || "callback",
        name: body.name?.trim() || null,
        phone: body.phone.trim(),
        productId: body.productId || null,
        productName: body.productName || null,
      },
    });

    // Telegram notification
    const isQuickOrder = body.type === "quick_order";
    const emoji = isQuickOrder ? "⚡" : "📞";
    const title = isQuickOrder ? "Быстрый заказ" : "Обратный звонок";

    let message = `${emoji} <b>${title}</b>\n\n`;
    if (body.name) message += `👤 <b>Имя:</b> ${body.name}\n`;
    message += `📞 <b>Телефон:</b> ${body.phone}\n`;
    if (isQuickOrder && body.productName) {
      message += `📦 <b>Товар:</b> ${body.productName}\n`;
    }

    try {
      await sendTelegramMessage(message.trim());
    } catch (tgError) {
      console.error("Telegram send failed:", tgError);
    }

    return NextResponse.json({ success: true, id: record.id });
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.json({ error: "Ошибка отправки заявки" }, { status: 500 });
  }
}
